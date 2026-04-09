<?php
// app/Http/Controllers/OrderCancellationController.php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Schedule;
use App\Mail\OrderCancelledMail;
use App\Mail\AccountDisabledMail; // create this if you want a disabled email
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class OrderCancellationController extends Controller
{
    public function cancel(Request $request, string $orderId)
{
    $user  = Auth::user()->fresh(); // fresh() ensures no stale cache
    $order = Order::where('order_id', $orderId)
                  ->where('user_id', $user->id)
                  ->firstOrFail();

    if (!in_array(strtolower($order->order_status), ['pending', 'processing'])) {
        return response()->json([
            'message' => 'This order can no longer be cancelled.'
        ], 422);
    }

    $orderDate = Carbon::parse($order->order_date);

    $schedule = Schedule::where('event_date', '>=', $orderDate)
        ->orderBy('event_date', 'asc')
        ->first();

    if (!$schedule) {
        return response()->json([
            'message' => 'No associated event found for this order.'
        ], 422);
    }

    $eventDate      = Carbon::parse($schedule->event_date)->startOfDay();
    $today          = Carbon::now()->startOfDay();
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

    // Cancel the order
    $order->order_status = 'Cancelled';
    $order->save();

    Mail::to($user->email)->send(new OrderCancelledMail($order, $user, $schedule));

    // Increment priority directly in DB, then refresh the model
    $accountDisabled = false;
    $user->increment('priority');
    $user->refresh();

    if ($user->priority >= 5) {
        $user->status   = 'Inactive';
        $user->priority = 0;
        $user->save();
        $accountDisabled = true;

        Mail::to($user->email)->send(new AccountDisabledMail($user));
    }

    if ($accountDisabled) {
        $user->tokens()->delete();
    }

    return response()->json([
        'message'          => 'Order cancelled successfully.',
        'order'            => $order,
        'account_disabled' => $accountDisabled,
    ]);
}
}