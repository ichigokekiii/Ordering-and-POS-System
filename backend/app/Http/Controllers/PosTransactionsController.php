<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PosTransactions;
use Illuminate\Support\Facades\DB;

class PosTransactionsController extends Controller
{
public function store(Request $request)
{
    // 1. Create the Main Sale Record
    $pos_transactions = PosTransactions::create([
        'total_amount' => $request->total_amount,
    ]);

    // 2. Loop through the cart and save each item individually
    foreach ($request->items as $item) {
        $pos_transactions->items()->create([
            'product_id'   => $item['id'], // <-- Reverted to accept the string ID directly
            'product_name' => $item['name'],
            'price'        => $item['price'],
            'quantity'     => $item['qty'],
        ]);
    }

    return response()->json(['message' => 'Sale recorded!'], 201);
}

public function analytics()
{
    // Get weekly revenue for the last 4 weeks
    $weeklyRevenue = PosTransactions::select(
        DB::raw('YEAR(created_at) as year'),
        DB::raw('WEEK(created_at) as week'),
        DB::raw('MIN(created_at) as week_start'),
        DB::raw('SUM(total_amount) as total')
    )
    ->where('created_at', '>=', now()->subWeeks(4))
    ->groupBy('year', 'week')
    ->orderBy('year', 'asc')
    ->orderBy('week', 'asc')
    ->get()
    ->map(function ($item) {
        $startDate = \Carbon\Carbon::parse($item->week_start)->startOfWeek()->format('M d');
        return [
            'name' => $startDate,
            'value' => (int) $item->total
        ];
    });

    // If no data, return mock data or empty
    if ($weeklyRevenue->isEmpty()) {
        $weeklyRevenue = collect([
            ['name' => 'Week 1', 'value' => 0],
            ['name' => 'Week 2', 'value' => 0],
            ['name' => 'Week 3', 'value' => 0],
            ['name' => 'Week 4', 'value' => 0],
        ]);
    }

    // Get total orders count
    $totalOrders = \App\Models\Order::count();

    // Get total customers (users with orders)
    $totalCustomers = \App\Models\User::whereHas('orders')->count();

    // Get total products (from products table)
    $totalProducts = \App\Models\Product::count() + \App\Models\PremadeProduct::count();

    // Get total views (placeholder - would need a views tracking system)
    $totalViews = 0; // Placeholder

    // Get sales overview by product type
    $salesByType = PosTransactions::join('pos_items', 'pos_transactions.id', '=', 'pos_items.pos_id')
        ->join('products', 'pos_items.product_id', '=', 'products.id')
        ->select(
            'products.type',
            DB::raw('SUM(pos_items.price * pos_items.quantity) as total_sales')
        )
        ->groupBy('products.type')
        ->get()
        ->map(function ($item) {
            $typeNames = [
                'rose' => 'Roses',
                'tulip' => 'Tulips',
                'lily' => 'Lilies',
                'peony' => 'Peonies',
            ];
            return [
                'name' => $typeNames[$item->type] ?? $item->type,
                'value' => (int) $item->total_sales
            ];
        });

    // If no sales data, use mock data
    if ($salesByType->isEmpty()) {
        $salesByType = collect([
            ['name' => 'Roses', 'value' => 5709],
            ['name' => 'Tulips', 'value' => 4095],
            ['name' => 'Lilies', 'value' => 8115],
            ['name' => 'Peonies', 'value' => 3320],
        ]);
    }

    // Calculate total ratings (placeholder - would need ratings table)
    $totalRatings = 4.3; // Mock average rating
    $ratingsCount = 1250; // Mock count

    return response()->json([
        'weekly_revenue' => $weeklyRevenue,
        'total_orders' => $totalOrders,
        'total_customers' => $totalCustomers,
        'total_products' => $totalProducts,
        'total_views' => $totalViews,
        'sales_overview' => $salesByType,
        'total_ratings' => $totalRatings,
        'ratings_count' => $ratingsCount,
    ]);
}
}
