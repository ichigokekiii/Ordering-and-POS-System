<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

use App\Mail\OrderStatusUpdated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;


class OrderController extends Controller
{
    public function index()
    {
        try {
            $orders = Order::with([
                'user',
                'payment',
                'orderItems.product'
            ])->orderBy('created_at', 'desc')->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function store(Request $request)
    {

        $request->validate([
            'user_id'          => 'required|integer|exists:users,id',
            'address'          => 'required|string',
            'delivery_method'  => 'required|in:pickup,delivery',
            'payment_method'   => 'required|string',
            'reference_number' => 'required|string',
            'reference_image'  => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'total_amount'     => 'required|numeric',
            'special_message'  => 'nullable|string',
        ]);

        $now = Carbon::now();
        $datePart = $now->format('Ymd');

        $orderId   = 'ORD-' . $datePart . '-' . strtoupper(substr(uniqid(), -4));
        $paymentId = 'PAY-' . $datePart . '-' . strtoupper(substr(uniqid(), -4));

        // Store image before transaction to avoid doing I/O inside DB transaction
        // Store image before transaction
        $imagePath = $request->file('reference_image')->store('payments', 'public');

        try {
            DB::transaction(function () use ($request, $now, $orderId, $paymentId, $imagePath) {

                // 1. Create order with payment_id null
                $order = new Order();
                $order->order_id        = $orderId;
                $order->user_id         = $request->input('user_id');
                $order->payment_id      = null;
                $order->order_date      = $now->toDateString();
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
            } catch (\Exception $e) {
                Storage::disk('public')->delete($imagePath);

                return response()->json([
                    'message' => 'Order could not be placed. Please try again.',
                    'error'   => $e->getMessage(),
                ], 500);
            }

            // 4. Send email AFTER transaction succeeds — outside the try/catch
            //    so a mail failure doesn't affect the order response


            return response()->json([
                'message'    => 'Order placed successfully',
                'order_id'   => $orderId,
                'payment_id' => $paymentId,
            ], 201);
        }

    public function update(Request $request, $id)
{
    try {
        $request->validate([
            'order_status' => 'nullable|string'
        ]);

        $order = Order::where('order_id', $id)->firstOrFail();

        $status = $request->input('status') ?? $request->input('order_status');

        if (!$status) {
            return response()->json([
                'message' => 'Failed to update order',
                'error' => 'The status field is required.'
            ], 400);
        }

        $order->order_status = $status;
        $order->save();

        $order->load(['user', 'payment', 'orderItems.product']);

        // ── Send status update email ──────────────────────────────────
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

        return response()->json($order);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update order',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function destroy($id)
    {
        try {
            // Find order using the custom primary key
            $order = Order::where('order_id', $id)->firstOrFail();

            $order->delete();

            return response()->json([
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}