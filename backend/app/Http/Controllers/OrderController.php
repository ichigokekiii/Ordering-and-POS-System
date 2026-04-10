<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

use App\Mail\OrderStatusUpdated;
use App\Support\ScheduleService;

class OrderController extends Controller
{
    private function canManageOrders(?User $user): bool
    {
        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    private function normalizeUserPriority(?User $user): ?User
    {
        if ($user) {
            $user->priority = min(max((int) $user->priority, 0), 3);
        }

        return $user;
    }

    private function normalizeOrderForResponse(Order $order): Order
    {
        if ($order->relationLoaded('user')) {
            $this->normalizeUserPriority($order->user);
        }

        return $order;
    }

    public function index()
    {
        try {
            if (!$this->canManageOrders(request()->user())) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $orders = Order::query()
                ->select('orders.*')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->with([
                    'user',
                    'payment',
                    'schedule',
                    'orderItems.product',
                ])
                ->orderByRaw('COALESCE(users.priority, 0) asc')
                ->orderBy('orders.created_at', 'desc')
                ->get();

            $orders->each(fn (Order $order) => $this->normalizeOrderForResponse($order));

            return response()->json($orders);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch orders', $e);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with([
                'user',
                'payment',
                'schedule',
                'orderItems.product',
            ])->where('order_id', $id)->firstOrFail();

            $actor = request()->user();

            if (
                !$this->canManageOrders($actor)
                && (int) $order->user_id !== (int) optional($actor)->id
            ) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $this->normalizeOrderForResponse($order);

            return response()->json($order);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch order', $e);
        }
    }

    public function userOrders(Request $request, $userId)
    {
        try {
            $actor = $request->user();

            if (
                !$this->canManageOrders($actor)
                && (int) $userId !== (int) optional($actor)->id
            ) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $orders = Order::with([
                'user',
                'payment',
                'schedule',
                'orderItems.product',
            ])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            $orders->each(fn (Order $order) => $this->normalizeOrderForResponse($order));

            return response()->json($orders);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch user orders', $e);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'          => 'nullable|integer|exists:users,id',
            'schedule_id'      => 'required|integer|exists:schedules,id',
            'address'          => 'required|string|max:200',
            'delivery_method'  => 'required|in:pickup,delivery',
            'payment_method'   => 'required|string|max:50',
            'reference_number' => ['required', 'string', 'regex:/^[A-Za-z0-9]{4,30}$/'],
            'reference_image'  => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'total_amount'     => 'required|numeric',
            'special_message'  => 'nullable|string|max:150',
            'terms_accepted'   => 'accepted',
            'terms_scope'      => 'required|string|in:customer,internal',
        ], [
            'address.required' => 'Delivery address is required.',
            'address.max' => 'Delivery address must not exceed 200 characters.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.max' => 'Payment method must not exceed 50 characters.',
            'reference_number.required' => 'Reference code is required.',
            'reference_number.regex' => 'Reference code must be 4 to 30 letters or numbers only.',
            'reference_image.required' => 'Payment proof image is required.',
            'reference_image.image' => 'Payment proof must be an image.',
            'reference_image.mimes' => 'Payment proof must be a JPG or PNG image.',
            'reference_image.max' => 'Payment proof image must be 2MB or smaller.',
            'special_message.max' => 'Greeting card message must not exceed 150 characters.',
            'terms_accepted.accepted' => 'Please review and accept the Customer Terms & Conditions.',
        ]);

        $validator->after(function ($validator) use ($request) {
            if ($request->input('delivery_method') === 'delivery') {
                $address = trim((string) $request->input('address'));

                if (mb_strlen($address) < 10) {
                    $validator->errors()->add('address', 'Delivery address must be at least 10 characters.');
                }
            }
        });

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $actor = $request->user();
        $isPrivilegedActor = $this->canManageOrders($actor);
        $requestedUserId = (int) $request->input('user_id', $actor?->id);

        if (!$actor) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        if (!$isPrivilegedActor && $requestedUserId !== (int) $actor->id) {
            return $this->fieldErrorResponse('user_id', 'You can only place orders for your own account.', 403);
        }

        $resolvedUserId = $isPrivilegedActor ? $requestedUserId : (int) $actor->id;
        $orderUser = User::find($resolvedUserId);

        if (!$orderUser) {
            return $this->fieldErrorResponse('user_id', 'The selected customer account was not found.', 404);
        }

        $expectedTermsScope = in_array(strtolower((string) optional($orderUser)->role), ['user', 'customer'], true)
            ? 'customer'
            : 'internal';

        if ($request->input('terms_scope') !== $expectedTermsScope) {
            return $this->fieldErrorResponse('terms_scope', 'The selected terms do not match this account role.');
        }

        $now = Carbon::now();
        $datePart = $now->format('Ymd');
        $schedule = ScheduleService::findOrderableSchedule((int) $request->input('schedule_id'));

        if (!$schedule) {
            return $this->fieldErrorResponse('schedule_id', 'The selected event is not available for ordering.');
        }

        $orderId   = 'ORD-' . $datePart . '-' . strtoupper(substr(uniqid(), -4));
        $paymentId = 'PAY-' . $datePart . '-' . strtoupper(substr(uniqid(), -4));

        // Store image before transaction to avoid doing I/O inside DB transaction
        $imagePath = $request->file('reference_image')->store('payments', 'public');

        try {
            DB::transaction(function () use ($request, $now, $orderId, $paymentId, $imagePath, $schedule, $resolvedUserId) {

                // 1. Create order with payment_id null
                $order = new Order();
                $order->order_id        = $orderId;
                $order->user_id         = $resolvedUserId;
                $order->schedule_id     = $schedule->id;
                $order->payment_id      = null;
                $order->order_date      = $now->toDateTimeString();
                $order->total_amount    = $request->total_amount;
                $order->order_status    = 'pending';
                $order->special_message = $request->special_message;
                $order->address         = $request->address;
                $order->delivery_method = $request->delivery_method;
                $order->save();

                // 2. Create payment
                $payment = new Payment();
                $payment->payment_id           = $paymentId;
                $payment->order_id             = $orderId;
                $payment->payment_method       = $request->payment_method;
                $payment->payment_date         = $now->toDateString();
                $payment->payment_status       = 'pending';
                $payment->reference_number     = $request->reference_number;
                $payment->reference_image_path = Storage::url($imagePath);
                $payment->save();

                // 3. Link payment to order
                $order->payment_id = $paymentId;
                $order->save();
            });

            return response()->json([
                'message'    => 'Order placed successfully',
                'order_id'   => $orderId,
                'payment_id' => $paymentId,
            ], 201);

        } catch (\Exception $e) {
            Storage::disk('public')->delete($imagePath);

            return $this->serverErrorResponse('Order could not be placed. Please try again.', $e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $actorRole = strtolower((string) optional($request->user())->role);

            if (!in_array($actorRole, ['admin', 'owner', 'staff'], true)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($request->has('isArchived') && !in_array($actorRole, ['admin', 'owner'], true)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'order_status' => 'nullable|string',
                'status'       => 'nullable|string',
                'isArchived'   => 'sometimes|boolean',
            ]);

            $order = Order::where('order_id', $id)->firstOrFail();
            $previousStatus = strtolower((string) $order->order_status);

            $status = $request->input('status') ?? $request->input('order_status');

            if (!$status && !$request->has('isArchived')) {
                return response()->json([
                    'message' => 'Failed to update order',
                    'error'   => 'A status or archive value is required.'
                ], 400);
            }

            if ($status) {
                $order->order_status = $status;
            }

            if ($request->has('isArchived')) {
                $order->isArchived = $request->boolean('isArchived');
            }

            $order->save();

            if ($status && in_array(strtolower($status), ['delivered', 'completed'], true) && !in_array($previousStatus, ['delivered', 'completed'], true)) {
                User::query()
                    ->whereKey($order->user_id)
                    ->update(['consecutive_cancellations' => 0]);
            }

            // Reload relationships so frontend receives full order data
            $order->load(['user', 'payment', 'schedule', 'orderItems.product']);
            $this->normalizeOrderForResponse($order);

            if ($status) {
                // ── Send status update email ──────────────────────────────
                try {
                    if ($order->user && $order->user->email) {
                        $items = $order->orderItems->map(fn($item) => [
                            'product_name'      => $item->product->name ?? $item->product_name,
                            'quantity'          => $item->quantity,
                            'price_at_purchase' => $item->price_at_purchase,
                            'special_message'   => $item->special_message ?? null,
                        ])->toArray();

                        Mail::to($order->user->email)->send(new OrderStatusUpdated(
                            orderId:        $order->order_id,
                            newStatus:      $status,
                            totalAmount:    (float) $order->total_amount,
                            deliveryMethod: $order->delivery_method,
                            userName:       trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? '')),
                            userEmail:      $order->user->email,
                            items:          $items,
                        ));
                    }
                } catch (\Throwable $e) {
                    // Never let mail failure break the status update
                    Log::warning("Status update email failed for order {$id}: " . $e->getMessage());
                }
            }

            return response()->json($order);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update order', $e);
        }
    }

    public function destroy($id)
    {
        try {
            if (strtolower((string) optional(request()->user())->role) !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Find order using the custom primary key
            $order = Order::where('order_id', $id)->firstOrFail();

            if (!$order->isArchived) {
                return response()->json([
                    'message' => 'Archive this order before deleting it.',
                ], 409);
            }

            $order->delete();

            return response()->json([
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete order', $e);
        }
    }
}
