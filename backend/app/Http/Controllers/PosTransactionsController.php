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
    private function canAccessPosTransactions(?User $user): bool
    {
        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    public function index(Request $request)
    {
        if (!$this->canAccessPosTransactions($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $transactions = PosTransactions::with(['items.product'])
                ->latest()
                ->get();

            return response()->json($transactions);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch POS transactions.', $e);
        }
    }

    public function update(Request $request, $id)
    {
        $actorRole = strtolower((string) optional($request->user())->role);

        if (!in_array($actorRole, ['admin', 'owner'], true)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'isArchived' => 'required|boolean',
        ]);

        try {
            $transaction = PosTransactions::with(['items.product'])->findOrFail($id);
            $transaction->isArchived = $request->boolean('isArchived');
            $transaction->save();
            $transaction->load(['items.product']);

            return response()->json($transaction);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update POS transaction.', $e);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$this->canAccessPosTransactions($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.name' => 'nullable|string|max:255',
            'items.*.product_name' => 'nullable|string|max:255',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.quantity' => 'nullable|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:CASH,QR',
            'cash_received' => 'required|numeric|min:0',
        ]);

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
            return $this->serverErrorResponse('Sale could not be recorded right now.', $e);
        }
    }

    public function destroy(Request $request, $id)
    {
        if (strtolower((string) optional($request->user())->role) !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $transaction = PosTransactions::findOrFail($id);

            if (!$transaction->isArchived) {
                return response()->json([
                    'message' => 'Archive this POS transaction before deleting it.',
                ], 409);
            }

            $transaction->delete();

            return response()->json([
                'message' => 'POS transaction deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete POS transaction.', $e);
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

            return $this->serverErrorResponse('Failed to load analytics', $e);
        }
    }
}
