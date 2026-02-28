<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

use App\Mail\OrderReceipt;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function store(Request $request)
    {

        $request->validate([
            'user_id'          => 'required|integer|exists:users,id',
            'address'          => 'required|string',
            'phone'            => 'required|string',
            'delivery_method'  => 'required|in:pickup,delivery',
            'payment_method'   => 'required|string',
            'reference_number' => 'required|string',
            'reference_image'  => 'required|image|mimes:jpeg,png,jpg|max:5120',
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
            $user = \App\Models\User::find($request->input('user_id'));

            // try {
            //     Mail::to($user->email)->send(new OrderReceipt(
            //         orderId:        $orderId,
            //         paymentId:      $paymentId,
            //         totalAmount:    $request->total_amount,
            //         deliveryMethod: $request->delivery_method,
            //         userName:       $user->name,
            //     ));
            // } catch (\Throwable $e) {
            //     \Log::warning('Order receipt email failed: ' . $e->getMessage());
            // }

            return response()->json([
                'message'    => 'Order placed successfully',
                'order_id'   => $orderId,
                'payment_id' => $paymentId,
            ], 201);
            }
}