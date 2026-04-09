<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Order;
use App\Models\PosTransactions;
use App\Models\Products;
use App\Models\Schedule;
use App\Models\ScheduleBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\AnalyticsReportMail;

class AnalyticsController extends Controller
{
    private function canAccessAnalytics(?User $user): bool
    {
        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    /**
     * Display the analytics dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        if (!$this->canAccessAnalytics($request->user() ?? Auth::user())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($this->getRawAnalyticsData());
    }

    /**
     * NEW: Handles the request to generate a PDF and email it to the user.
     */
    public function sendReportEmail(Request $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();

        if (!$user) {
            return response()->json([
                'error' => 'You must be logged in to email an analytics report.'
            ], 401);
        }

        if (!$this->canAccessAnalytics($user)) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        if (empty($user->email)) {
            return response()->json([
                'error' => 'Your account does not have an email address configured.'
            ], 422);
        }

        $section = $request->input('section', 'overview');
        $context = $request->input('context', 'Full Report');

        try {
            $fullData = $this->getRawAnalyticsData();
            $pdfPayload = $this->buildPdfPayload($section, $context, $fullData);

            // Generate PDF
            $pdf = Pdf::loadView('pdf.analytics', $pdfPayload);
            $pdfContent = $pdf->output();

            // Send Email
            Mail::to($user->email)->send(
                new AnalyticsReportMail($user->first_name ?: 'Petal Express User', $context, $pdfContent)
            );

            return response()->json(['message' => 'Report emailed successfully!']);
            
        } catch (\Throwable $e) {
            return $this->serverErrorResponse('Unable to email analytics report right now.', $e);
        }
    }

    protected function buildPdfPayload(string $section, string $context, array $fullData): array
    {
        $sectionCards = $fullData[$section]['kpis'] ?? $fullData['overview']['cards'] ?? [];

        $sliceRows = function ($value, int $limit = 6): array {
            if ($value instanceof Collection) {
                return $value->take($limit)->values()->all();
            }

            return array_slice((array) $value, 0, $limit);
        };

        $asArray = function ($value): array {
            if ($value instanceof Collection) {
                return $value->values()->all();
            }

            return (array) $value;
        };

        $payload = [
            'sectionName' => $context,
            'sectionKey' => $section,
            'cards' => $sliceRows($sectionCards, 8),
            'columns' => [],
            'tableRows' => [],
            'chartBlocks' => [],
        ];

        if ($section === 'products') {
            $payload['columns'] = [
                ['label' => 'Product Name', 'key' => 'name'],
                ['label' => 'Units Sold', 'key' => 'quantity'],
                ['label' => 'Total Revenue', 'key' => 'revenue', 'format' => 'currency'],
            ];
            $payload['tableRows'] = $asArray($fullData['products']['top_products'] ?? []);
            $payload['chartBlocks'] = [
                [
                    'title' => 'Top Products Revenue',
                    'subtitle' => 'Best-performing products by revenue',
                    'type' => 'bar',
                    'seriesKey' => 'revenue',
                    'seriesLabel' => 'Revenue',
                    'format' => 'currency',
                    'points' => $sliceRows($fullData['products']['top_products'] ?? [], 6),
                ],
                [
                    'title' => 'Category Performance',
                    'subtitle' => 'Revenue by product category',
                    'type' => 'bar',
                    'seriesKey' => 'revenue',
                    'seriesLabel' => 'Revenue',
                    'format' => 'currency',
                    'points' => $sliceRows($fullData['products']['category_performance'] ?? [], 6),
                ],
            ];

            return $payload;
        }

        if ($section === 'payments') {
            $payload['columns'] = [
                ['label' => 'Order ID', 'key' => 'order_id'],
                ['label' => 'Method', 'key' => 'method'],
                ['label' => 'Status', 'key' => 'status'],
                ['label' => 'Amount', 'key' => 'amount', 'format' => 'currency'],
            ];
            $payload['tableRows'] = $asArray($fullData['payments']['pending_queue'] ?? []);
            $payload['chartBlocks'] = [
                [
                    'title' => 'Payment Status Breakdown',
                    'subtitle' => 'Tracked payment statuses',
                    'type' => 'bar',
                    'seriesKey' => 'value',
                    'seriesLabel' => 'Count',
                    'format' => 'number',
                    'points' => $asArray($fullData['payments']['status_breakdown'] ?? []),
                ],
                [
                    'title' => 'Payment Method Breakdown',
                    'subtitle' => 'How customers pay',
                    'type' => 'bar',
                    'seriesKey' => 'value',
                    'seriesLabel' => 'Count',
                    'format' => 'number',
                    'points' => $asArray($fullData['payments']['method_breakdown'] ?? []),
                ],
            ];

            return $payload;
        }

        if ($section === 'pos') {
            $payload['columns'] = [
                ['label' => 'Item', 'key' => 'name'],
                ['label' => 'Units Sold', 'key' => 'quantity'],
                ['label' => 'Revenue', 'key' => 'revenue', 'format' => 'currency'],
            ];
            $payload['tableRows'] = $asArray($fullData['pos']['top_items'] ?? []);
            $payload['chartBlocks'] = [
                [
                    'title' => 'POS Sales Trend',
                    'subtitle' => 'Monthly in-store sales',
                    'type' => 'line',
                    'series' => [
                        ['key' => 'sales', 'label' => 'Sales', 'color' => '#4f6fa5'],
                    ],
                    'format' => 'currency',
                    'points' => $asArray($fullData['pos']['trend'] ?? []),
                ],
                [
                    'title' => 'Busiest POS Hours',
                    'subtitle' => 'Hourly in-store sales pattern',
                    'type' => 'bar',
                    'seriesKey' => 'sales',
                    'seriesLabel' => 'Sales',
                    'format' => 'currency',
                    'points' => $sliceRows($fullData['pos']['hourly'] ?? [], 8),
                ],
            ];

            return $payload;
        }

        $payload['columns'] = [
            ['label' => 'Product Name', 'key' => 'name'],
            ['label' => 'Units Sold', 'key' => 'quantity'],
            ['label' => 'Total Revenue', 'key' => 'revenue', 'format' => 'currency'],
        ];
        $payload['tableRows'] = $asArray($fullData['products']['top_products'] ?? []);
        $payload['chartBlocks'] = [
            [
                'title' => 'Revenue Trend',
                'subtitle' => 'Online versus POS performance over time',
                'type' => 'line',
                'series' => [
                    ['key' => 'online', 'label' => 'Online', 'color' => '#4f6fa5'],
                    ['key' => 'pos', 'label' => 'POS', 'color' => '#c88b6b'],
                ],
                'format' => 'currency',
                'points' => $asArray($fullData['sales']['revenue_trend'] ?? []),
            ],
            [
                'title' => 'Top Products',
                'subtitle' => 'Highest revenue contributors',
                'type' => 'bar',
                'seriesKey' => 'revenue',
                'seriesLabel' => 'Revenue',
                'format' => 'currency',
                'points' => $sliceRows($fullData['products']['top_products'] ?? [], 6),
            ],
        ];

        return $payload;
    }

    /**
     * Internal method to gather data so we don't repeat logic.
     */
    protected function getRawAnalyticsData(): array
    {
        $orders = Order::with(['user', 'payment', 'orderItems'])->get();
        $users = User::query()->get();
        $logs = Log::query()->latest('created_at')->limit(200)->get();
        $products = Products::query()->get()->keyBy('id');
        $posTransactions = PosTransactions::with('items')->get();
        $scheduleBookings = ScheduleBooking::with('schedule')->get();
        $schedules = Schedule::query()->get();

        $today = Carbon::now();

        return [
            'overview' => $this->buildOverview($orders, $users, $posTransactions, $today),
            'sales' => $this->buildSales($orders, $posTransactions, $today),
            'orders' => $this->buildOrders($orders, $today),
            'products' => $this->buildProducts($orders, $posTransactions, $products),
            'customers' => $this->buildCustomers($orders, $users, $today),
            'payments' => $this->buildPayments($orders),
            'pos' => $this->buildPos($posTransactions, $today),
            'schedules' => $this->buildSchedules($schedules, $scheduleBookings, $today),
            'operations' => $this->buildOperations($logs, $users, $today),
            'unavailable' => $this->buildUnavailableMetrics(),
        ];
    }

    // --- KEEP ALL YOUR buildOverview, buildSales, buildOrders, etc. methods below this line ---
    // (Ensure you keep the percentageChange, sumForCurrentPeriod, sumForPreviousPeriod helpers too)

    protected function buildOverview(Collection $orders, Collection $users, Collection $posTransactions, Carbon $today): array
    {
        $onlineRevenue = $orders->sum('total_amount');
        $posRevenue = $posTransactions->sum('total_amount');
        $allCustomers = $users->whereIn('role', ['customer', 'user']);
        $customerOrders = $orders->groupBy('user_id');
        $returningCustomers = $customerOrders->filter(fn (Collection $userOrders) => $userOrders->count() > 1)->count();

        return [
            'cards' => [
                [
                    'label' => 'Total Revenue',
                    'value' => round($onlineRevenue + $posRevenue, 2),
                    'format' => 'currency',
                    'change' => $this->percentageChange($this->sumForCurrentPeriod($orders, 'total_amount', 30), $this->sumForPreviousPeriod($orders, 'total_amount', 30)),
                    'description' => 'Online orders and POS combined',
                ],
                [
                    'label' => 'Total Orders',
                    'value' => $orders->count(),
                    'format' => 'number',
                    'change' => $this->percentageChange(
                        $orders->filter(fn ($order) => Carbon::parse($order->created_at ?? now())->gte($today->copy()->subDays(30)))->count(),
                        $orders->filter(fn ($order) => Carbon::parse($order->created_at ?? now())->between($today->copy()->subDays(60), $today->copy()->subDays(30)))->count()
                    ),
                    'description' => 'Website order volume',
                ],
                [
                    'label' => 'Average Order Value',
                    'value' => round($orders->avg('total_amount') ?? 0, 2),
                    'format' => 'currency',
                    'change' => null,
                    'description' => 'Average per website order',
                ],
                [
                    'label' => 'Customers',
                    'value' => $allCustomers->count(),
                    'format' => 'number',
                    'change' => $this->percentageChange(
                        $allCustomers->filter(fn ($user) => Carbon::parse($user->created_at ?? now())->gte($today->copy()->subDays(30)))->count(),
                        $allCustomers->filter(fn ($user) => Carbon::parse($user->created_at ?? now())->between($today->copy()->subDays(60), $today->copy()->subDays(30)))->count()
                    ),
                    'description' => $returningCustomers . ' returning customers',
                ],
                [
                    'label' => 'Online Revenue',
                    'value' => round($onlineRevenue, 2),
                    'format' => 'currency',
                    'change' => null,
                    'description' => 'Revenue from website orders',
                ],
                [
                    'label' => 'POS Revenue',
                    'value' => round($posRevenue, 2),
                    'format' => 'currency',
                    'change' => null,
                    'description' => 'Revenue from in-store sales',
                ],
                [
                    'label' => 'Pending Orders',
                    'value' => $orders->where('order_status', 'pending')->count(),
                    'format' => 'number',
                    'change' => null,
                    'description' => 'Orders needing action',
                ],
                [
                    'label' => 'Repeat Purchase Rate',
                    'value' => $orders->count() > 0 ? round(($returningCustomers / max($customerOrders->count(), 1)) * 100, 1) : 0,
                    'format' => 'percent',
                    'change' => null,
                    'description' => 'Customers with multiple orders',
                ],
            ],
        ];
    }

    protected function buildSales(Collection $orders, Collection $posTransactions, Carbon $today): array
    {
        $dailyRevenue = collect(range(29, 0))->map(function ($daysAgo) use ($orders, $posTransactions, $today) {
            $date = $today->copy()->subDays($daysAgo);
            $online = $orders
                ->filter(fn ($order) => Carbon::parse($order->created_at ?? now())->isSameDay($date))
                ->sum('total_amount');
            $pos = $posTransactions
                ->filter(fn ($transaction) => Carbon::parse($transaction->created_at ?? now())->isSameDay($date))
                ->sum('total_amount');

            return [
                'label' => $date->format('M j'),
                'online' => round($online, 2),
                'pos' => round($pos, 2),
                'total' => round($online + $pos, 2),
            ];
        })->values();

        $deliveryBreakdown = $orders
            ->groupBy(fn ($order) => ucfirst($order?->delivery_method ?: 'Unknown'))
            ->map(fn (Collection $group, string $label) => [
                'name' => $label,
                'value' => round($group->sum('total_amount'), 2),
            ])
            ->values();

        $paymentBreakdown = $orders
            ->map(fn ($order) => $order->payment)
            ->filter()
            ->groupBy(fn ($payment) => ucfirst($payment?->payment_method ?: 'Unknown'))
            ->map(fn (Collection $group, string $label) => [
                'name' => $label,
                'value' => round($group->count(), 2),
            ])
            ->values();

        return [
            'revenue_trend' => $dailyRevenue,
            'delivery_breakdown' => $deliveryBreakdown,
            'payment_method_breakdown' => $paymentBreakdown,
        ];
    }

    protected function buildOrders(Collection $orders, Carbon $today): array
    {
        $statusTrend = collect(range(11, 0))->map(function ($monthsAgo) use ($orders, $today) {
            $month = $today->copy()->startOfMonth()->subMonths($monthsAgo);
            $monthOrders = $orders->filter(fn ($order) => Carbon::parse($order->created_at ?? now())->format('Y-m') === $month->format('Y-m'));

            return [
                'label' => $month->format('M'),
                'pending' => $monthOrders->where('order_status', 'pending')->count(),
                'confirmed' => $monthOrders->where('order_status', 'confirmed')->count(),
                'completed' => $monthOrders->where('order_status', 'completed')->count(),
                'cancelled' => $monthOrders->where('order_status', 'cancelled')->count(),
            ];
        })->values();

        $deliveryBreakdown = $orders
            ->groupBy(fn ($order) => ucfirst($order?->delivery_method ?: 'Unknown'))
            ->map(fn (Collection $group, string $label) => [
                'name' => $label,
                'value' => $group->count(),
            ])
            ->values();

        $customOrders = $orders->filter(function ($order) {
            return collect($order->orderItems)->contains(fn ($item) => !empty($item->custom_id));
        })->count();

        $premadeOrders = $orders->filter(function ($order) {
            return collect($order->orderItems)->contains(fn ($item) => !empty($item->premade_id));
        })->count();

        $basketSizes = $orders->map(function ($order) {
            return [
                'label' => $order->order_id,
                'items' => collect($order->orderItems)->sum('quantity'),
            ];
        })->sortByDesc('items')->take(8)->values();

        return [
            'status_trend' => $statusTrend,
            'delivery_breakdown' => $deliveryBreakdown,
            'mix' => [
                ['name' => 'Custom', 'value' => $customOrders],
                ['name' => 'Premade', 'value' => $premadeOrders],
            ],
            'kpis' => [
                ['label' => 'Completion Rate', 'value' => $orders->count() ? round(($orders->where('order_status', 'completed')->count() / $orders->count()) * 100, 1) : 0, 'format' => 'percent'],
                ['label' => 'Cancellation Rate', 'value' => $orders->count() ? round(($orders->where('order_status', 'cancelled')->count() / $orders->count()) * 100, 1) : 0, 'format' => 'percent'],
                ['label' => 'Avg Items / Order', 'value' => round($orders->avg(fn ($order) => collect($order->orderItems)->sum('quantity')) ?? 0, 1), 'format' => 'number'],
                ['label' => 'Orders with Messages', 'value' => $orders->filter(fn ($order) => !empty($order->special_message))->count(), 'format' => 'number'],
            ],
            'basket_sizes' => $basketSizes,
        ];
    }

    protected function buildProducts(Collection $orders, Collection $posTransactions, Collection $products): array
    {
        $lineItems = collect();

        foreach ($orders as $order) {
            if (!$order->orderItems) continue;
            foreach ($order->orderItems as $item) {
                $product = $products->get($item->product_id ?? null);

                $lineItems->push([
                    'name' => $item->product_name ?: $product?->name ?: 'Product',
                    'category' => $product?->category ?: 'Uncategorized',
                    'type' => $product?->type ?: 'Unknown',
                    'quantity' => (int) ($item->quantity ?? 0),
                    'revenue' => (float) ($item->price_at_purchase ?? 0) * (int) ($item->quantity ?? 0),
                    'channel' => 'Online',
                ]);
            }
        }

        foreach ($posTransactions as $transaction) {
            if (!$transaction->items) continue;
            foreach ($transaction->items as $item) {
                $product = $products->get($item->source_product_id ?? null);

                $lineItems->push([
                    'name' => $item->product_name ?: $product?->name ?: 'Product',
                    'category' => $product?->category ?: 'Uncategorized',
                    'type' => $product?->type ?: 'Unknown',
                    'quantity' => (int) ($item->quantity ?? 0),
                    'revenue' => (float) ($item->price ?? 0) * (int) ($item->quantity ?? 0),
                    'channel' => 'POS',
                ]);
            }
        }

        $topProducts = $lineItems
            ->groupBy('name')
            ->map(function (Collection $group, string $name) {
                return [
                    'name' => $name,
                    'quantity' => $group->sum('quantity'),
                    'revenue' => round($group->sum('revenue'), 2),
                ];
            })
            ->sortByDesc('revenue')
            ->take(10)
            ->values();

        $categoryPerformance = $lineItems
            ->groupBy('category')
            ->map(fn (Collection $group, string $name) => [
                'name' => $name,
                'revenue' => round($group->sum('revenue'), 2),
                'quantity' => $group->sum('quantity'),
            ])
            ->sortByDesc('revenue')
            ->take(8)
            ->values();

        $typePerformance = $lineItems
            ->groupBy('type')
            ->map(fn (Collection $group, string $name) => [
                'name' => $name,
                'revenue' => round($group->sum('revenue'), 2),
            ])
            ->sortByDesc('revenue')
            ->take(8)
            ->values();

        return [
            'top_products' => $topProducts,
            'category_performance' => $categoryPerformance,
            'type_performance' => $typePerformance,
            'table' => $topProducts,
        ];
    }

    protected function buildCustomers(Collection $orders, Collection $users, Carbon $today): array
    {
        $customerUsers = $users->whereIn('role', ['customer', 'user'])->values();
        $ordersByUser = $orders->groupBy('user_id');

        $growth = collect(range(11, 0))->map(function ($monthsAgo) use ($customerUsers, $ordersByUser, $today) {
            $month = $today->copy()->startOfMonth()->subMonths($monthsAgo);
            $newCustomers = $customerUsers->filter(fn ($user) => Carbon::parse($user->created_at ?? now())->format('Y-m') === $month->format('Y-m'))->count();

            $returningCustomers = $ordersByUser->filter(function (Collection $userOrders) use ($month) {
                return $userOrders->count() > 1 && $userOrders->contains(fn ($order) => Carbon::parse($order->created_at ?? now())->format('Y-m') === $month->format('Y-m'));
            })->count();

            return [
                'label' => $month->format('M'),
                'new' => $newCustomers,
                'returning' => $returningCustomers,
            ];
        })->values();

        $topCustomers = $ordersByUser
            ->map(function (Collection $userOrders, $userId) use ($users) {
                $user = $users->firstWhere('id', $userId);
                // Null-safe operators added here to prevent 500 error if user doesn't exist
                $name = trim(($user?->first_name ?? '') . ' ' . ($user?->last_name ?? '')) ?: ($user?->email ?? 'Guest');

                return [
                    'name' => $name,
                    'orders' => $userOrders->count(),
                    'spend' => round($userOrders->sum('total_amount'), 2),
                ];
            })
            ->sortByDesc('spend')
            ->take(8)
            ->values();

        $spendDistribution = [
            ['name' => '0-999', 'value' => 0],
            ['name' => '1k-2.9k', 'value' => 0],
            ['name' => '3k-4.9k', 'value' => 0],
            ['name' => '5k+', 'value' => 0],
        ];

        foreach ($topCustomers as $customer) {
            if ($customer['spend'] < 1000) {
                $spendDistribution[0]['value']++;
            } elseif ($customer['spend'] < 3000) {
                $spendDistribution[1]['value']++;
            } elseif ($customer['spend'] < 5000) {
                $spendDistribution[2]['value']++;
            } else {
                $spendDistribution[3]['value']++;
            }
        }

        return [
            'growth' => $growth,
            'top_customers' => $topCustomers,
            'spend_distribution' => $spendDistribution,
            'kpis' => [
                ['label' => 'Verified Accounts', 'value' => $customerUsers->where('is_verified', true)->count(), 'format' => 'number'],
                ['label' => 'Locked Accounts', 'value' => $customerUsers->where('is_locked', true)->count(), 'format' => 'number'],
                ['label' => 'Repeat Buyers', 'value' => $ordersByUser->filter(fn (Collection $userOrders) => $userOrders->count() > 1)->count(), 'format' => 'number'],
                ['label' => 'Avg Revenue / Customer', 'value' => round($orders->sum('total_amount') / max($ordersByUser->count(), 1), 2), 'format' => 'currency'],
            ],
        ];
    }

    protected function buildPayments(Collection $orders): array
    {
        $payments = $orders->map(fn ($order) => $order->payment)->filter()->values();

        $statusBreakdown = $payments
            ->groupBy(fn ($payment) => ucfirst($payment?->payment_status ?: 'Unknown'))
            ->map(fn (Collection $group, string $name) => ['name' => $name, 'value' => $group->count()])
            ->values();

        $methodBreakdown = $payments
            ->groupBy(fn ($payment) => ucfirst($payment?->payment_method ?: 'Unknown'))
            ->map(fn (Collection $group, string $name) => ['name' => $name, 'value' => $group->count()])
            ->values();

        $pendingQueue = $payments
            ->where('payment_status', 'pending')
            ->map(function ($payment) use ($orders) {
                $order = $orders->firstWhere('order_id', $payment->order_id);

                return [
                    'payment_id' => $payment->payment_id,
                    'order_id' => $payment->order_id,
                    'method' => $payment->payment_method,
                    'status' => $payment->payment_status,
                    'amount' => optional($order)->total_amount ?? 0,
                ];
            })
            ->take(8)
            ->values();

        return [
            'status_breakdown' => $statusBreakdown,
            'method_breakdown' => $methodBreakdown,
            'pending_queue' => $pendingQueue,
            'kpis' => [
                ['label' => 'Payment Success Rate', 'value' => $payments->count() ? round(($payments->where('payment_status', 'confirmed')->count() / $payments->count()) * 100, 1) : 0, 'format' => 'percent'],
                ['label' => 'Pending Payments', 'value' => $payments->where('payment_status', 'pending')->count(), 'format' => 'number'],
                ['label' => 'Reference Uploads', 'value' => $payments->filter(fn ($payment) => !empty($payment->reference_image_path))->count(), 'format' => 'number'],
                ['label' => 'Manual Confirmations', 'value' => $payments->filter(fn ($payment) => !is_null($payment->confirmed_by))->count(), 'format' => 'number'],
            ],
        ];
    }

    protected function buildPos(Collection $posTransactions, Carbon $today): array
    {
        $trend = collect(range(11, 0))->map(function ($monthsAgo) use ($posTransactions, $today) {
            $month = $today->copy()->startOfMonth()->subMonths($monthsAgo);
            $monthTransactions = $posTransactions->filter(fn ($transaction) => Carbon::parse($transaction->created_at ?? now())->format('Y-m') === $month->format('Y-m'));

            return [
                'label' => $month->format('M'),
                'sales' => round($monthTransactions->sum('total_amount'), 2),
                'transactions' => $monthTransactions->count(),
            ];
        })->values();

        $hourly = collect(range(8, 20))->map(function ($hour) use ($posTransactions) {
            $hourSales = $posTransactions
                ->filter(fn ($transaction) => (int) Carbon::parse($transaction->created_at ?? now())->format('G') === $hour)
                ->sum('total_amount');

            return [
                'label' => Carbon::createFromTime($hour)->format('g A'),
                'sales' => round($hourSales, 2),
            ];
        })->values();

        $topItems = $posTransactions
            ->flatMap(fn ($transaction) => $transaction->items ?? [])
            ->groupBy('product_name')
            ->map(fn (Collection $group, string $name) => [
                'name' => $name,
                'quantity' => $group->sum('quantity'),
                'revenue' => round($group->sum(fn ($item) => ($item->price ?? 0) * ($item->quantity ?? 0)), 2),
            ])
            ->sortByDesc('revenue')
            ->take(8)
            ->values();

        $methodBreakdown = $posTransactions
            ->groupBy(fn ($transaction) => ucfirst($transaction?->payment_method ?: 'Unknown'))
            ->map(fn (Collection $group, string $name) => ['name' => $name, 'value' => $group->count()])
            ->values();

        return [
            'trend' => $trend,
            'hourly' => $hourly,
            'top_items' => $topItems,
            'method_breakdown' => $methodBreakdown,
            'kpis' => [
                ['label' => 'POS Transactions', 'value' => $posTransactions->count(), 'format' => 'number'],
                ['label' => 'Avg POS Ticket', 'value' => round($posTransactions->avg('total_amount') ?? 0, 2), 'format' => 'currency'],
                ['label' => 'Cash Collected', 'value' => round($posTransactions->sum('cash_received') ?? 0, 2), 'format' => 'currency'],
                ['label' => 'Items Sold', 'value' => $posTransactions->flatMap(fn ($transaction) => $transaction->items ?? [])->sum('quantity'), 'format' => 'number'],
            ],
        ];
    }

    protected function buildSchedules(Collection $schedules, Collection $scheduleBookings, Carbon $today): array
    {
        $trend = collect(range(11, 0))->map(function ($monthsAgo) use ($scheduleBookings, $today) {
            $month = $today->copy()->startOfMonth()->subMonths($monthsAgo);
            $count = $scheduleBookings->filter(fn ($booking) => Carbon::parse($booking->created_at ?? now())->format('Y-m') === $month->format('Y-m'))->count();

            return [
                'label' => $month->format('M'),
                'bookings' => $count,
            ];
        })->values();

        $bookingsPerEvent = $schedules->map(function ($schedule) use ($scheduleBookings) {
            return [
                'name' => $schedule->schedule_name,
                'value' => $scheduleBookings->where('schedule_id', $schedule->id)->count(),
                'date' => $schedule->event_date ? Carbon::parse($schedule->event_date)->format('M j, Y') : null,
            ];
        })->sortByDesc('value')->take(8)->values();

        $upcoming = $schedules
            ->filter(fn ($schedule) => Carbon::parse($schedule->event_date ?? now())->gte($today))
            ->sortBy('event_date')
            ->take(6)
            ->map(function ($schedule) use ($scheduleBookings) {
                return [
                    'name' => $schedule->schedule_name,
                    'date' => Carbon::parse($schedule->event_date ?? now())->format('M j, Y'),
                    'location' => $schedule->location,
                    'bookings' => $scheduleBookings->where('schedule_id', $schedule->id)->count(),
                ];
            })
            ->values();

        return [
            'trend' => $trend,
            'bookings_per_event' => $bookingsPerEvent,
            'upcoming' => $upcoming,
            'kpis' => [
                ['label' => 'Total Bookings', 'value' => $scheduleBookings->count(), 'format' => 'number'],
                ['label' => 'Upcoming Events', 'value' => $schedules->filter(fn ($schedule) => Carbon::parse($schedule->event_date ?? now())->gte($today))->count(), 'format' => 'number'],
                ['label' => 'Available Schedules', 'value' => $schedules->where('isArchived', false)->where('isAvailable', true)->count(), 'format' => 'number'],
                ['label' => 'Most Popular Event', 'value' => $bookingsPerEvent->first()['name'] ?? 'None yet', 'format' => 'text'],
            ],
        ];
    }

    protected function buildOperations(Collection $logs, Collection $users, Carbon $today): array
    {
        $activityTrend = collect(range(13, 0))->map(function ($daysAgo) use ($logs, $today) {
            $date = $today->copy()->subDays($daysAgo);

            return [
                'label' => $date->format('M j'),
                'actions' => $logs->filter(fn ($log) => Carbon::parse($log->created_at ?? now())->isSameDay($date))->count(),
            ];
        })->values();

        $actionsByUser = $logs
            ->groupBy(fn ($log) => $log->user_name ?: 'System')
            ->map(fn (Collection $group, string $name) => ['name' => $name, 'value' => $group->count()])
            ->sortByDesc('value')
            ->take(8)
            ->values();

        $modules = $logs
            ->groupBy(fn ($log) => ucfirst($log->module ?: 'General'))
            ->map(fn (Collection $group, string $name) => ['name' => $name, 'value' => $group->count()])
            ->sortByDesc('value')
            ->take(8)
            ->values();

        $recent = $logs->take(10)->map(function ($log) {
            return [
                'time' => Carbon::parse($log->created_at ?? now())->format('M j, g:i A'),
                'user' => $log->user_name ?: 'System',
                'role' => $log->user_role ?: 'System',
                'event' => $log->event,
                'module' => $log->module ?: 'General',
            ];
        })->values();

        return [
            'activity_trend' => $activityTrend,
            'actions_by_user' => $actionsByUser,
            'modules' => $modules,
            'recent' => $recent,
            'kpis' => [
                ['label' => 'Log Entries', 'value' => $logs->count(), 'format' => 'number'],
                ['label' => 'Locked Accounts', 'value' => $users->where('is_locked', true)->count(), 'format' => 'number'],
                ['label' => 'Failed Attempts', 'value' => $users->sum('failed_attempt_count'), 'format' => 'number'],
                ['label' => 'Active Staff/Admins', 'value' => $users->whereIn('role', ['admin', 'owner', 'staff'])->count(), 'format' => 'number'],
            ],
        ];
    }

    protected function buildUnavailableMetrics(): array
    {
        return [
            [
                'title' => 'Website Funnel',
                'description' => 'Page views, add-to-cart rate, checkout starts, and cart abandonment need event tracking.',
            ],
            [
                'title' => 'Ratings and Reviews',
                'description' => 'Product review metrics need a ratings table and review submission flow.',
            ],
            [
                'title' => 'Forecasting',
                'description' => 'Sales forecasting and demand prediction need a dedicated forecasting model or background job.',
            ],
        ];
    }

    protected function percentageChange(float|int $current, float|int $previous): ?float
    {
        if ((float) $previous === 0.0) {
            return null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    protected function sumForCurrentPeriod(Collection $records, string $field, int $days): float
    {
        $start = Carbon::now()->subDays($days);

        return (float) $records
            ->filter(fn ($record) => Carbon::parse($record->created_at ?? now())->gte($start))
            ->sum($field);
    }

    protected function sumForPreviousPeriod(Collection $records, string $field, int $days): float
    {
        $end = Carbon::now()->subDays($days);
        $start = Carbon::now()->subDays($days * 2);

        return (float) $records
            ->filter(fn ($record) => Carbon::parse($record->created_at ?? now())->between($start, $end))
            ->sum($field);
    }
}
