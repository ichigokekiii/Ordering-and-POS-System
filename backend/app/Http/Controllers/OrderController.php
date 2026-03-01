<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Create Order (Checkout)
    public function store(Request $request)
    {
        // Basic validation (allow empty optional fields for now)
        $data = $request->all();

        $items = $data['items'] ?? [];

        if (empty($items)) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        $total = 0;

        foreach ($items as $item) {
            $price = $item['price'] ?? 0;
            $quantity = $item['quantity'] ?? 1;
            $total += $price * $quantity;
        }

        $order = Order::create([
            'user_id' => $data['user_id'] ?? 1, // temporary fallback
            'schedule_id' => $data['schedule_id'] ?? null,
            'total_amount' => $total,
            'order_status' => 'pending'
        ]);

        foreach ($items as $item) {

            // Frontend cart uses "id" as product id
            $productId = $item['product_id'] ?? $item['id'] ?? null;

            OrderItem::create([
                'order_id' => $order->order_id ?? $order->id,
                'product_id' => $productId,
                'quantity' => $item['quantity'] ?? 1,
                'price_at_purchase' => $item['price'] ?? 0
            ]);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order
        ], 201);
    }

    // Get All Orders (Admin)
    public function index()
    {
        $orders = Order::with('items')->latest()->get();

        return response()->json($orders);
    }

    // Get Orders By User
    public function userOrders($user_id)
    {
        $orders = Order::with('items')
            ->where('user_id', $user_id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    // Update Order Status (Admin)
    public function update(Request $request, $id)
    {
        // If your primary key is order_id, use where instead of findOrFail
        $order = Order::where('order_id', $id)->firstOrFail();

        $order->update([
            'order_status' => $request->order_status ?? $order->order_status
        ]);

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order
        ]);
    }
}