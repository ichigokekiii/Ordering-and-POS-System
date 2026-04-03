<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Mail\OrderReceipt;
use App\Support\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderItemController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items'                     => 'required|array|min:1',
            'items.*.order_id'          => 'required|string|exists:orders,order_id',
            'items.*.product_id'        => 'required|integer',
            'items.*.product_name'      => 'required|string|max:255',
            'items.*.custom_id'         => 'nullable|integer',
            'items.*.premade_id'        => 'nullable|integer',
            'items.*.quantity'          => 'required|integer|min:1',
            'items.*.price_at_purchase' => 'required|numeric|min:0',
            'items.*.special_message'   => 'nullable|string|max:150',
        ]);

        // Ensure the order exists before inserting items
        $orderId = $request->items[0]['order_id'] ?? null;
        $order = Order::with('user')->where('order_id', $orderId)->first();

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.'
            ], 404);
        }

        // ── Send receipt email ────────────────────────────────────────────
        $rows = collect($request->items)->map(fn ($item) => [
            'order_id'          => $item['order_id'],
            'product_id'        => $item['product_id'],
            'catalog_product_id'=> ProductService::resolveCatalogId(
                $item['product_id'],
                $item['product_name'] ?? null,
                $item['custom_id'] ?? null,
                $item['premade_id'] ?? null,
            ),
            'product_name'      => $item['product_name'],
            'custom_id'         => $item['custom_id']  ?? null,
            'premade_id'        => $item['premade_id'] ?? null,
            'quantity'          => $item['quantity'],
            'price_at_purchase' => $item['price_at_purchase'],
            'special_message'   => $item['special_message'] ?? null,
        ])->toArray();

        $order->orderItems()->createMany($rows);

        // Load the order + its user so we have the email address and order meta
        try {
            if ($order && $order->user && $order->user->email) {
                Mail::to($order->user->email)->send(new OrderReceipt(
                    orderId:        $order->order_id,
                    paymentId:      $order->payment_id ?? '—',
                    totalAmount:    (float) $order->total_amount,
                    deliveryMethod: $order->delivery_method,
                    userName:       trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? '')),
                    userEmail:      $order->user->email,
                    items:          $rows,
                ));
            }
        } catch (\Throwable $e) {
            // Never let a mail failure break the order — just log it
            Log::warning("Order receipt email failed for order {$orderId}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Order items saved successfully.',
            'count'   => count($rows),
        ], 201);
    }
}
