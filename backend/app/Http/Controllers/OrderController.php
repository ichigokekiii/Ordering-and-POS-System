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
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Throwable;

use App\Mail\OrderStatusUpdated;
use App\Mail\OrderReceipt;
use App\Support\ScheduleService;
use App\Support\LookupCatalog;
use App\Support\ValidationRules;

class OrderController extends Controller
{
    private function normalizeOrderInput(Request $request): void
    {
        $normalizedInput = [];

        if ($request->has('address')) {
            $normalizedInput['address'] = ValidationRules::normalizeMultiLine((string) $request->input('address'), 255);
        }

        if ($request->has('delivery_method')) {
            $normalizedInput['delivery_method'] = LookupCatalog::normalizeDeliveryOptionCode((string) $request->input('delivery_method'));
        }

        if ($request->has('delivery_zone')) {
            $normalizedInput['delivery_zone'] = LookupCatalog::normalizeDeliveryZoneCode((string) $request->input('delivery_zone'));
        }

        if ($request->has('delivery_zone_other')) {
            $normalizedInput['delivery_zone_other'] = ValidationRules::normalizeSingleLine((string) $request->input('delivery_zone_other'), 150);
        }

        if ($request->has('payment_method')) {
            $normalizedInput['payment_method'] = ValidationRules::normalizeSingleLine((string) $request->input('payment_method'));
        }

        if ($request->has('reference_number')) {
            $normalizedInput['reference_number'] = strtoupper((string) ValidationRules::normalizeSingleLine((string) $request->input('reference_number'), 30));
        }

        if ($request->has('special_message')) {
            $normalizedInput['special_message'] = ValidationRules::normalizeMultiLine((string) $request->input('special_message'));
        }

        if ($request->has('tracking_number')) {
            $normalizedInput['tracking_number'] = ValidationRules::normalizeSingleLine((string) $request->input('tracking_number'), 100);
        }

        if ($request->has('total_amount')) {
            $normalizedInput['total_amount'] = ValidationRules::normalizeMoneyString($request->input('total_amount'));
        }

        if ($request->has('amount_paid')) {
            $normalizedInput['amount_paid'] = ValidationRules::normalizeMoneyString($request->input('amount_paid'));
        }

        if (!$request->has('amount_paid') && $request->has('total_amount')) {
            $normalizedInput['amount_paid'] = ValidationRules::normalizeMoneyString($request->input('total_amount'));
        }

        if (!$request->has('privacy_accepted') && $request->has('terms_accepted')) {
            $normalizedInput['privacy_accepted'] = $request->input('terms_accepted');
        }

        if (!empty($normalizedInput)) {
            $request->merge($normalizedInput);
        }
    }

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

    private function decodeCheckoutItems(Request $request): array
    {
        if (!$request->has('items')) {
            return [null, null];
        }

        $rawItems = $request->input('items');

        if (is_array($rawItems)) {
            return [$rawItems, null];
        }

        if (!is_string($rawItems) || trim($rawItems) === '') {
            return [null, 'The items field must be a valid JSON array.'];
        }

        try {
            $decodedItems = json_decode($rawItems, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return [null, 'The items field must be a valid JSON array.'];
        }

        if (!is_array($decodedItems)) {
            return [null, 'The items field must be a valid JSON array.'];
        }

        return [$decodedItems, null];
    }

    private function prepareCheckoutItemRows(array $items, string $orderId): array
    {
        return collect($items)
            ->map(fn (array $item) => [
                'order_id' => $orderId,
                'product_id' => (int) $item['product_id'],
                'product_name' => ValidationRules::normalizeSingleLine((string) $item['product_name'], 255),
                'custom_id' => isset($item['custom_id']) ? (int) $item['custom_id'] : null,
                'premade_id' => isset($item['premade_id']) ? (int) $item['premade_id'] : null,
                'quantity' => (int) $item['quantity'],
                'quantity_value' => ValidationRules::normalizeIntegerString($item['quantity']),
                'price_at_purchase' => (float) $item['price_at_purchase'],
                'price_at_purchase_value' => ValidationRules::normalizeMoneyString($item['price_at_purchase']),
                'special_message' => ValidationRules::normalizeMultiLine($item['special_message'] ?? null, 150),
            ])
            ->values()
            ->all();
    }

    private function sendOrderReceiptIfPossible(Order $order, array $items): void
    {
        if (empty($items) || !$order->relationLoaded('user') || !$order->user?->email) {
            return;
        }

        try {
            Mail::to($order->user->email)->send(new OrderReceipt(
                orderId: $order->order_id,
                paymentId: $order->payment_id ?? '—',
                totalAmount: (float) $order->total_amount,
                deliveryMethod: $order->delivery_method,
                trackingNumber: $order->tracking_number,
                userName: trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? '')),
                userEmail: $order->user->email,
                items: $items,
            ));
        } catch (Throwable $e) {
            Log::warning("Order receipt email failed for order {$order->order_id}: {$e->getMessage()}");
        }
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
                    'orderStatusRecord',
                    'deliveryOption',
                    'deliveryZone',
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
                'orderStatusRecord',
                'deliveryOption',
                'deliveryZone',
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
                'orderStatusRecord',
                'deliveryOption',
                'deliveryZone',
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
        [$decodedItems, $itemsDecodeError] = $this->decodeCheckoutItems($request);

        if ($decodedItems !== null) {
            $request->merge(['items' => $decodedItems]);
        }

        $this->normalizeOrderInput($request);

        $validator = Validator::make($request->all(), [
            'user_id'          => 'nullable|integer|exists:users,id',
            'schedule_id'      => 'required|integer|exists:schedules,id',
            'address'          => 'required|string|max:255',
            'delivery_method'  => ['required', Rule::in(['pickup', 'delivery'])],
            'delivery_zone'    => ['nullable', 'string', Rule::in(['southern_luzon', 'other'])],
            'delivery_zone_other' => 'nullable|string|max:150',
            'payment_method'   => 'required|string|max:50',
            'reference_number' => ['required', 'string', 'regex:/^[A-Za-z0-9]{4,30}$/'],
            'reference_image'  => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'total_amount'     => ['required', 'string', 'regex:' . ValidationRules::MONEY_REGEX],
            'amount_paid'      => ['required', 'string', 'regex:' . ValidationRules::MONEY_REGEX],
            'special_message'  => 'nullable|string|max:150',
            'privacy_accepted' => 'accepted',
            'terms_accepted'   => 'accepted',
            'terms_scope'      => 'required|string|in:customer,internal',
            'items'            => 'nullable|array|min:1',
            'items.*.product_id' => 'required|integer|min:1',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.custom_id' => 'nullable|integer|min:1',
            'items.*.premade_id' => 'nullable|integer|min:1',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price_at_purchase' => 'required|numeric|min:0',
            'items.*.special_message' => 'nullable|string|max:150',
        ], [
            'address.required' => 'Delivery address is required.',
            'address.max' => 'Delivery address must not exceed 255 characters.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.max' => 'Payment method must not exceed 50 characters.',
            'reference_number.required' => 'Reference code is required.',
            'reference_number.regex' => 'Reference code must be 4 to 30 letters or numbers only.',
            'reference_image.required' => 'Payment proof image is required.',
            'reference_image.image' => 'Payment proof must be an image.',
            'reference_image.mimes' => 'Payment proof must be a JPG or PNG image.',
            'reference_image.max' => 'Payment proof image must be 2MB or smaller.',
            'special_message.max' => 'Greeting card message must not exceed 150 characters.',
            'privacy_accepted.accepted' => 'Please review and acknowledge the Data Privacy Notice.',
            'terms_accepted.accepted' => 'Please review and accept the Customer Terms & Conditions.',
            'total_amount.regex' => 'Total amount must be a valid price.',
            'amount_paid.regex' => 'Amount must be a valid price.',
            'items.array' => 'The items field must be a valid JSON array.',
        ]);

        $validator->after(function ($validator) use ($request) {
            $itemsDecodeError = $request->attributes->get('checkout_items_decode_error');

            if ($itemsDecodeError) {
                $validator->errors()->add('items', $itemsDecodeError);
            }

            if ($request->input('delivery_method') === 'delivery') {
                $address = trim((string) $request->input('address'));

                if (mb_strlen($address) < 10) {
                    $validator->errors()->add('address', 'Delivery address must be at least 10 characters.');
                }

                if (!$request->filled('delivery_zone')) {
                    $validator->errors()->add('delivery_zone', 'Please select a delivery location.');
                }
            }

            if ($request->input('delivery_zone') === 'other' && !$request->filled('delivery_zone_other')) {
                $validator->errors()->add('delivery_zone_other', 'Please enter your delivery location details.');
            }

            if ($request->input('amount_paid') !== $request->input('total_amount')) {
                $validator->errors()->add('amount_paid', 'Amount must match the order total for proof-based checkout.');
            }
        });

        if ($itemsDecodeError) {
            $request->attributes->set('checkout_items_decode_error', $itemsDecodeError);
        }

        if ($validator->fails()) {
            Log::warning('Checkout validation failed.', [
                'user_id' => optional($request->user())->id,
                'schedule_id' => $request->input('schedule_id'),
                'has_items' => $request->has('items'),
                'error_fields' => array_keys($validator->errors()->toArray()),
            ]);
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
        $checkoutItemRows = $this->prepareCheckoutItemRows($request->input('items', []), $orderId);

        // Store image before transaction to avoid doing I/O inside DB transaction
        $imagePath = $request->file('reference_image')->store('payments', 'public');
        $createdOrder = null;

        Log::info('Checkout transaction starting.', [
            'order_id' => $orderId,
            'user_id' => $resolvedUserId,
            'schedule_id' => $schedule->id,
            'item_count' => count($checkoutItemRows),
        ]);

        try {
            DB::transaction(function () use ($request, $now, $orderId, $paymentId, $imagePath, $schedule, $resolvedUserId, $checkoutItemRows, &$createdOrder) {
                $totalAmountValue = (string) $request->input('total_amount');
                $deliveryMethod = LookupCatalog::normalizeDeliveryOptionCode($request->input('delivery_method'));
                $deliveryZone = $deliveryMethod === 'delivery'
                    ? LookupCatalog::normalizeDeliveryZoneCode($request->input('delivery_zone'))
                    : null;

                // 1. Create order with payment_id null
                $order = new Order();
                $order->order_id        = $orderId;
                $order->user_id         = $resolvedUserId;
                $order->schedule_id     = $schedule->id;
                $order->payment_id      = null;
                $order->order_date      = $now->toDateTimeString();
                $order->total_amount    = (float) $totalAmountValue;
                $order->total_amount_value = $totalAmountValue;
                $order->order_status    = LookupCatalog::DEFAULT_ORDER_STATUS;
                $order->order_status_id = LookupCatalog::orderStatusIdFor(LookupCatalog::DEFAULT_ORDER_STATUS);
                $order->special_message = $request->special_message;
                $order->address         = $request->address;
                $order->delivery_method = $deliveryMethod;
                $order->delivery_option_id = LookupCatalog::deliveryOptionIdFor($deliveryMethod);
                $order->delivery_zone_id = $deliveryZone ? LookupCatalog::deliveryZoneIdFor($deliveryZone) : null;
                $order->delivery_zone_other = $deliveryZone === 'other' ? $request->input('delivery_zone_other') : null;
                $order->save();

                // 2. Create payment
                $payment = new Payment();
                $payment->payment_id           = $paymentId;
                $payment->order_id             = $orderId;
                $payment->payment_method       = $request->payment_method;
                $payment->payment_date         = $now->toDateString();
                $payment->payment_status       = LookupCatalog::DEFAULT_PAYMENT_STATUS;
                $payment->payment_status_id    = LookupCatalog::paymentStatusIdFor(LookupCatalog::DEFAULT_PAYMENT_STATUS);
                $payment->reference_number     = $request->reference_number;
                $payment->amount_paid          = $request->input('amount_paid');
                $payment->reference_image_path = Storage::url($imagePath);
                $payment->save();

                // 3. Link payment to order
                $order->payment_id = $paymentId;
                $order->save();

                if (!empty($checkoutItemRows)) {
                    $order->orderItems()->createMany($checkoutItemRows);
                }

                $order->load('user');
                $createdOrder = $order;
            });

            if ($createdOrder) {
                $this->sendOrderReceiptIfPossible($createdOrder, $checkoutItemRows);
            }

            Log::info('Checkout transaction committed successfully.', [
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'user_id' => $resolvedUserId,
                'item_count' => count($checkoutItemRows),
            ]);

            return response()->json([
                'message'    => 'Order placed successfully',
                'order_id'   => $orderId,
                'payment_id' => $paymentId,
                'item_count' => count($checkoutItemRows),
            ], 201);

        } catch (Throwable $e) {
            Storage::disk('public')->delete($imagePath);

            Log::error('Checkout transaction rolled back.', [
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'user_id' => $resolvedUserId,
                'item_count' => count($checkoutItemRows),
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Order could not be placed. Please try again.', $e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $actorRole = strtolower((string) optional($request->user())->role);
            $this->normalizeOrderInput($request);

            if (!in_array($actorRole, ['admin', 'owner', 'staff'], true)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($request->has('isArchived') && !in_array($actorRole, ['admin', 'owner'], true)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'order_status' => ['nullable', 'string', Rule::in(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'canceled'])],
                'status'       => ['nullable', 'string', Rule::in(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'canceled'])],
                'tracking_number' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9\-]+$/'],
                'isArchived'   => 'sometimes|boolean',
            ], [
                'tracking_number.regex' => 'Tracking number may only contain letters, numbers, and hyphens.',
            ]);

            $order = Order::where('order_id', $id)->firstOrFail();
            $previousStatus = strtolower((string) $order->order_status);

            $status = $request->filled('status') || $request->filled('order_status')
                ? LookupCatalog::normalizeOrderStatusCode($request->input('status') ?? $request->input('order_status'))
                : null;

            $effectiveStatus = $status ?? LookupCatalog::normalizeOrderStatusCode($order->order_status);

            $validator->after(function ($validator) use ($request, $effectiveStatus, $order) {
                $trackingNumber = trim((string) $request->input('tracking_number'));

                if ($effectiveStatus === 'shipped' && $trackingNumber === '' && blank($order->tracking_number)) {
                    $validator->errors()->add('tracking_number', 'Tracking number is required when the order is shipped.');
                }

                if ($request->filled('tracking_number') && !in_array($effectiveStatus, ['shipped', 'delivered'], true)) {
                    $validator->errors()->add('tracking_number', 'Tracking number can only be updated when the order is shipped or delivered.');
                }
            });

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            if (!$status && !$request->has('isArchived')) {
                return response()->json([
                    'message' => 'Failed to update order',
                    'error'   => 'A status or archive value is required.'
                ], 400);
            }

            if ($status) {
                $order->order_status = $status;
                $order->order_status_id = LookupCatalog::orderStatusIdFor($status);
            }

            if ($effectiveStatus === 'shipped') {
                if ($request->filled('tracking_number')) {
                    $order->tracking_number = $request->input('tracking_number');
                }
            } elseif ($effectiveStatus === 'delivered') {
                if ($request->filled('tracking_number')) {
                    $order->tracking_number = $request->input('tracking_number');
                }
            } elseif ($status && !in_array($status, ['shipped', 'delivered'], true)) {
                $order->tracking_number = null;
            }

            if ($request->has('isArchived')) {
                $order->isArchived = $request->boolean('isArchived');
            }

            $order->save();

            if ($status && $status === 'delivered' && !in_array($previousStatus, ['delivered', 'completed'], true)) {
                User::query()
                    ->whereKey($order->user_id)
                    ->update(['consecutive_cancellations' => 0]);
            }

            // Reload relationships so frontend receives full order data
            $order->load(['user', 'payment', 'schedule', 'orderStatusRecord', 'deliveryOption', 'deliveryZone', 'orderItems.product']);
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
                            trackingNumber: $order->tracking_number,
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
