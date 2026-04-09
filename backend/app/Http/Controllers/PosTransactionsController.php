<?php

namespace App\Http\Controllers;

use App\Models\CustomProduct;
use App\Models\PosTransactions;
use App\Models\PremadeProduct;
use App\Models\User;
use App\Support\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PosTransactionsController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $posTransaction = PosTransactions::create([
                    'total_amount' => $request->input('total_amount'),
                    'payment_method' => $request->input('payment_method'),
                    'cash_received' => $request->input('cash_received'),
                ]);

                foreach ($request->input('items', []) as $item) {
                    $productId = isset($item['product_id']) ? (int) $item['product_id'] : null;
                    $productName = $item['name'] ?? $item['product_name'] ?? 'Item';

                    $posTransaction->items()->create([
                        'product_id' => $productId,
                        'source_product_id' => ProductService::resolveCatalogId($productId, $productName),
                        'product_name' => $productName,
                        'price' => $item['price'] ?? 0,
                        'quantity' => $item['qty'] ?? $item['quantity'] ?? 0,
                    ]);
                }
            });

            return response()->json(['message' => 'Sale recorded!'], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Database crash',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function analytics()
    {
        try {
            $weeklyRevenue = PosTransactions::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('WEEK(created_at) as week'),
                DB::raw('MIN(created_at) as week_start'),
                DB::raw('SUM(total_amount) as total')
            )
                ->where('created_at', '>=', now()->subWeeks(4))
                ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('WEEK(created_at)'))
                ->orderBy('year', 'asc')
                ->orderBy('week', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => \Carbon\Carbon::parse($item->week_start)->startOfWeek()->format('M d'),
                        'value' => (int) $item->total,
                    ];
                });

            if ($weeklyRevenue->isEmpty()) {
                $weeklyRevenue = collect([
                    ['name' => 'Week 1', 'value' => 0],
                    ['name' => 'Week 2', 'value' => 0],
                    ['name' => 'Week 3', 'value' => 0],
                    ['name' => 'Week 4', 'value' => 0],
                ]);
            }

            $totalOrders = PosTransactions::count();
            $totalProducts = CustomProduct::count() + PremadeProduct::count();
            $totalCustomers = User::whereHas('orders')->count();
            $totalViews = 0;

            $productGroupExpression = "COALESCE(NULLIF(products.type, ''), NULLIF(products.category, ''), pos_items.product_name)";

            $salesByType = PosTransactions::join('pos_items', 'pos_transactions.id', '=', 'pos_items.pos_id')
                ->leftJoin('products', 'pos_items.source_product_id', '=', 'products.id')
                ->select(
                    DB::raw($productGroupExpression . ' as product_group'),
                    DB::raw('SUM(pos_items.price * pos_items.quantity) as total_sales')
                )
                ->groupBy(DB::raw($productGroupExpression))
                ->get()
                ->map(function ($item) {
                    $typeNames = [
                        'rose' => 'Roses',
                        'tulip' => 'Tulips',
                        'lily' => 'Lilies',
                        'peony' => 'Peonies',
                    ];

                    $group = (string) ($item->product_group ?? 'Uncategorized');
                    $lookupKey = strtolower($group);

                    return [
                        'name' => $typeNames[$lookupKey] ?? $group,
                        'value' => (int) $item->total_sales,
                    ];
                });

            if ($salesByType->isEmpty()) {
                $salesByType = collect([
                    ['name' => 'Roses', 'value' => 5709],
                    ['name' => 'Tulips', 'value' => 4095],
                    ['name' => 'Lilies', 'value' => 8115],
                    ['name' => 'Peonies', 'value' => 3320],
                ]);
            }

            $totalRatings = 4.3;
            $ratingsCount = 1250;

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
        } catch (\Exception $e) {
            Log::error('analytics() failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to load analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
