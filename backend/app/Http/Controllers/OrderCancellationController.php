<?php
// app/Http/Controllers/OrderCancellationController.php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Mail\OrderCancelledMail;
use App\Mail\AccountDisabledMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class OrderCancellationController extends Controller
{
    public function cancel(Request $request, string $orderId)
    {
        $user = Auth::user()->fresh();
        $order = Order::with('schedule')
            ->where('order_id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!in_array(strtolower($order->order_status), ['pending', 'processing'], true)) {
            return response()->json([
                'message' => 'This order can no longer be cancelled.'
            ], 422);
        }

        $schedule = $order->schedule;

        if (!$schedule) {
            return response()->json([
                'message' => 'No linked event was found for this order.'
            ], 422);
        }

        $eventDate = Carbon::parse($schedule->event_date)->startOfDay();
        $today = Carbon::now()->startOfDay();
        $daysUntilEvent = $today->diffInDays($eventDate, false);

        if ($daysUntilEvent < 0) {
            return response()->json([
                'message' => 'The event has already passed. Cancellation is not allowed.'
            ], 422);
        }

        if ($daysUntilEvent <= 3) {
            return response()->json([
                'message' => 'Cancellation is not allowed within 3 days of the event.'
            ], 422);
        }

        $order->order_status = 'Cancelled';
        $order->save();

        Mail::to($user->email)->send(new OrderCancelledMail($order, $user, $schedule));

        $accountDisabled = false;

        $user->consecutive_cancellations = (int) $user->consecutive_cancellations + 1;

        if ($user->consecutive_cancellations >= 2) {
            $user->priority = min(((int) $user->priority) + 1, 3);
            $user->consecutive_cancellations = 0;
        }

        if ((int) $user->priority >= 3) {
            $user->is_locked = true;
            $user->status = 'Inactive';
            $accountDisabled = true;
        }

        $user->save();

        if ($accountDisabled) {
            Mail::to($user->email)->send(new AccountDisabledMail($user));
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'order' => $order->fresh('schedule'),
            'account_disabled' => $accountDisabled,
            'priority' => $user->priority,
            'consecutive_cancellations' => $user->consecutive_cancellations,
        ]);
    }
}
