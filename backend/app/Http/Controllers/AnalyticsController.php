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
        $exportType = $request->input('export_type', 'section');
        $contextKind = $request->input('context_kind', 'section');
        $subtitle = $request->input('subtitle');
        $sectionLabel = $request->input('section_label');

        try {
            $fullData = $this->getRawAnalyticsData();
            $pdfPayload = $this->buildPdfPayload($section, $context, $fullData, $exportType, $contextKind, $subtitle, $sectionLabel);

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

    protected function buildPdfPayload(
        string $section,
        string $context,
        array $fullData,
        string $exportType = 'section',
        string $contextKind = 'section',
        ?string $subtitle = null,
        ?string $sectionLabel = null
    ): array {
        $definitions = $this->getSectionReportDefinitions($fullData);
        $section = array_key_exists($section, $definitions) ? $section : 'overview';

        if ($exportType === 'single') {
            return $this->buildSingleContextReportPayload($section, $context, $fullData, $contextKind, $subtitle, $sectionLabel);
        }

        return $this->buildSectionReportPayload($section, $context, $fullData, $sectionLabel);
    }

    protected function buildSectionReportPayload(string $section, string $context, array $fullData, ?string $sectionLabel = null): array
    {
        $definition = $this->getSectionReportDefinition($section, $fullData);
        $panels = $definition['panels'] ?? [];

        return [
            'reportVariant' => 'section',
            'sectionName' => $context ?: (($sectionLabel ?: $definition['label']) . ' Full Report'),
            'sectionKey' => $section,
            'sectionLabel' => $sectionLabel ?: $definition['label'],
            'reportDescription' => $definition['description'],
            'theme' => $definition['theme'],
            'summaryCards' => $this->sliceRows($definition['cards'] ?? [], 8),
            'focusCard' => null,
            'supportingCards' => [],
            'visualBlocks' => array_values(array_map(
                fn (array $panel) => $this->prepareVisualBlock($panel),
                array_filter($panels, fn (array $panel) => ($panel['kind'] ?? 'chart') !== 'table')
            )),
            'detailTables' => array_values(array_map(
                fn (array $panel) => $this->prepareTableBlock($panel),
                array_filter($panels, fn (array $panel) => ($panel['kind'] ?? 'chart') === 'table')
            )),
        ];
    }

    protected function buildSingleContextReportPayload(
        string $section,
        string $context,
        array $fullData,
        string $contextKind = 'panel',
        ?string $subtitle = null,
        ?string $sectionLabel = null
    ): array {
        $definition = $this->getSectionReportDefinition($section, $fullData);
        $cards = $this->asArray($definition['cards'] ?? []);
        $panels = $definition['panels'] ?? [];
        $visualPanels = array_values(array_filter($panels, fn (array $panel) => ($panel['kind'] ?? 'chart') !== 'table'));
        $tablePanels = array_values(array_filter($panels, fn (array $panel) => ($panel['kind'] ?? 'chart') === 'table'));

        $matchLabel = $this->normalizeExportLabel($context);
        $matchedCard = collect($cards)->first(fn (array $card) => $this->normalizeExportLabel($card['label'] ?? '') === $matchLabel);
        $matchedPanel = collect($panels)->first(fn (array $panel) => $this->normalizeExportLabel($panel['title'] ?? '') === $matchLabel);

        $focusCard = null;
        $supportingCards = [];
        $visualBlocks = [];
        $detailTables = [];
        $reportDescription = $subtitle ?: $definition['description'];

        if ($contextKind === 'metric' || ($matchedCard && $contextKind !== 'panel')) {
            $focusCard = $matchedCard ?: ($cards[0] ?? null);
            $supportingCards = array_values(array_filter(
                $this->sliceRows($cards, 4),
                fn (array $card) => ($card['label'] ?? null) !== ($focusCard['label'] ?? null)
            ));
            $supportingCards = array_slice($supportingCards, 0, 3);
            $visualBlocks = array_values(array_map(
                fn (array $panel) => $this->prepareVisualBlock($panel),
                array_slice($visualPanels, 0, 2)
            ));
            $detailTables = array_values(array_map(
                fn (array $panel) => $this->prepareTableBlock($panel),
                array_slice($tablePanels, 0, 1)
            ));
            $reportDescription = $focusCard['description'] ?? ($subtitle ?: 'Focused metric snapshot from the analytics workspace.');
        } else {
            $focusPanel = $matchedPanel ?: ($panels[0] ?? null);

            if ($focusPanel) {
                if (($focusPanel['kind'] ?? 'chart') === 'table') {
                    $detailTables[] = $this->prepareTableBlock($focusPanel);
                    if (!empty($visualPanels)) {
                        $visualBlocks[] = $this->prepareVisualBlock($visualPanels[0]);
                    }
                } else {
                    $visualBlocks[] = $this->prepareVisualBlock($focusPanel);
                    if (!empty($tablePanels)) {
                        $detailTables[] = $this->prepareTableBlock($tablePanels[0]);
                    }
                }

                $reportDescription = $focusPanel['subtitle'] ?? ($subtitle ?: $definition['description']);
            }

            $supportingCards = $this->sliceRows($cards, 4);
        }

        return [
            'reportVariant' => 'single',
            'sectionName' => $context ?: ($sectionLabel ?: $definition['label']),
            'sectionKey' => $section,
            'sectionLabel' => $sectionLabel ?: $definition['label'],
            'reportDescription' => $reportDescription,
            'theme' => $definition['theme'],
            'summaryCards' => [],
            'focusCard' => $focusCard,
            'supportingCards' => $supportingCards,
            'visualBlocks' => $visualBlocks,
            'detailTables' => $detailTables,
        ];
    }

    protected function getSectionReportDefinition(string $section, array $fullData): array
    {
        $definitions = $this->getSectionReportDefinitions($fullData);

        return $definitions[$section] ?? $definitions['overview'];
    }

    protected function getSectionReportDefinitions(array $fullData): array
    {
        $salesTrend = $this->asArray($fullData['sales']['revenue_trend'] ?? []);
        $salesDelivery = $this->asArray($fullData['sales']['delivery_breakdown'] ?? []);
        $salesPayments = $this->asArray($fullData['sales']['payment_method_breakdown'] ?? []);
        $overviewCards = $this->asArray($fullData['overview']['cards'] ?? []);
        $productTop = $this->asArray($fullData['products']['top_products'] ?? []);
        $productCategories = $this->asArray($fullData['products']['category_performance'] ?? []);
        $productTypes = $this->asArray($fullData['products']['type_performance'] ?? []);

        return [
            'overview' => [
                'label' => 'Overview',
                'description' => 'Executive snapshot of revenue, orders, customers, and product momentum across the workspace.',
                'theme' => $this->buildReportTheme('#4f6fa5', '#eaf2ff', '#1d4ed8'),
                'cards' => $overviewCards,
                'panels' => [
                    [
                        'title' => 'Revenue Trend',
                        'subtitle' => 'Daily online vs POS',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'online', 'label' => 'Online', 'color' => '#4f6fa5'],
                            ['key' => 'pos', 'label' => 'POS', 'color' => '#f43f5e'],
                        ],
                        'format' => 'currency',
                        'points' => $salesTrend,
                    ],
                    [
                        'title' => 'Top Products',
                        'subtitle' => 'Best sellers across channels.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'revenue',
                        'seriesLabel' => 'Revenue',
                        'format' => 'currency',
                        'color' => '#4f6fa5',
                        'points' => $this->sliceRows($productTop, 6),
                    ],
                    [
                        'title' => 'Recent Transactions',
                        'subtitle' => 'Payments that still need review or confirmation.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Order ID', 'key' => 'order_id'],
                            ['label' => 'Method', 'key' => 'method'],
                            ['label' => 'Amount', 'key' => 'amount', 'format' => 'currency'],
                            ['label' => 'Status', 'key' => 'status'],
                        ],
                        'rows' => $fullData['payments']['pending_queue'] ?? [],
                        'emptyMessage' => 'No recent transactions available yet.',
                    ],
                ],
            ],
            'sales' => [
                'label' => 'Sales',
                'description' => 'Channel performance, delivery revenue mix, and payment behavior for tracked sales activity.',
                'theme' => $this->buildReportTheme('#e76f51', '#fff1eb', '#c2410c'),
                'cards' => $this->buildSalesSummaryCards($fullData['sales'] ?? []),
                'panels' => [
                    [
                        'title' => 'Revenue by Channel',
                        'subtitle' => 'Daily website revenue compared with POS revenue.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'online', 'label' => 'Online', 'color' => '#4f6fa5'],
                            ['key' => 'pos', 'label' => 'POS', 'color' => '#f43f5e'],
                        ],
                        'format' => 'currency',
                        'points' => $salesTrend,
                    ],
                    [
                        'title' => 'Delivery Breakdown',
                        'subtitle' => 'Revenue share by delivery method.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Revenue',
                        'format' => 'currency',
                        'color' => '#e76f51',
                        'points' => $salesDelivery,
                    ],
                    [
                        'title' => 'Payment Methods',
                        'subtitle' => 'How customers pay across tracked transactions.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Count',
                        'format' => 'number',
                        'color' => '#0f766e',
                        'points' => $salesPayments,
                    ],
                ],
            ],
            'orders' => [
                'label' => 'Orders',
                'description' => 'Order completion health, order mix, and basket size behavior from recent transactions.',
                'theme' => $this->buildReportTheme('#d97706', '#fff7e6', '#b45309'),
                'cards' => $this->asArray($fullData['orders']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'Order Status Trend',
                        'subtitle' => 'Monthly view of pending, confirmed, completed, and cancelled orders.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'pending', 'label' => 'Pending', 'color' => '#eab308'],
                            ['key' => 'confirmed', 'label' => 'Confirmed', 'color' => '#4f6fa5'],
                            ['key' => 'completed', 'label' => 'Completed', 'color' => '#10b981'],
                            ['key' => 'cancelled', 'label' => 'Cancelled', 'color' => '#f43f5e'],
                        ],
                        'format' => 'number',
                        'points' => $fullData['orders']['status_trend'] ?? [],
                    ],
                    [
                        'title' => 'Order Mix',
                        'subtitle' => 'Custom versus premade ordering behavior.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Orders',
                        'format' => 'number',
                        'color' => '#d97706',
                        'points' => $fullData['orders']['mix'] ?? [],
                    ],
                    [
                        'title' => 'Largest Baskets',
                        'subtitle' => 'Orders with the highest item counts.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Order ID', 'key' => 'label'],
                            ['label' => 'Item Count', 'key' => 'items', 'format' => 'number'],
                        ],
                        'rows' => $fullData['orders']['basket_sizes'] ?? [],
                        'emptyMessage' => 'No order basket data available yet.',
                    ],
                ],
            ],
            'products' => [
                'label' => 'Products',
                'description' => 'Product leaders, category winners, and type-level revenue distribution across channels.',
                'theme' => $this->buildReportTheme('#7c3aed', '#f5f3ff', '#6d28d9'),
                'cards' => $this->buildProductSummaryCards($fullData['products'] ?? []),
                'panels' => [
                    [
                        'title' => 'Top Products by Revenue',
                        'subtitle' => 'Best-performing products across online and POS channels.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'revenue',
                        'seriesLabel' => 'Revenue',
                        'format' => 'currency',
                        'color' => '#7c3aed',
                        'points' => $this->sliceRows($productTop, 8),
                    ],
                    [
                        'title' => 'Category Performance',
                        'subtitle' => 'Revenue distribution by category.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'revenue',
                        'seriesLabel' => 'Revenue',
                        'format' => 'currency',
                        'color' => '#8b5cf6',
                        'points' => $productCategories,
                    ],
                    [
                        'title' => 'Type Performance',
                        'subtitle' => 'Revenue by product type.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'revenue',
                        'seriesLabel' => 'Revenue',
                        'format' => 'currency',
                        'color' => '#06b6d4',
                        'points' => $productTypes,
                    ],
                    [
                        'title' => 'Product Revenue Table',
                        'subtitle' => 'Detailed product ranking by revenue and units sold.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Product', 'key' => 'name'],
                            ['label' => 'Units Sold', 'key' => 'quantity', 'format' => 'number'],
                            ['label' => 'Revenue', 'key' => 'revenue', 'format' => 'currency'],
                        ],
                        'rows' => $productTop,
                        'emptyMessage' => 'No product performance data available yet.',
                    ],
                ],
            ],
            'customers' => [
                'label' => 'Customers',
                'description' => 'Growth, repeat-buyer behavior, and spend distribution for customer accounts.',
                'theme' => $this->buildReportTheme('#059669', '#ecfdf5', '#047857'),
                'cards' => $this->asArray($fullData['customers']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'Customer Growth',
                        'subtitle' => 'New versus returning customers over time.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'new', 'label' => 'New', 'color' => '#4f6fa5'],
                            ['key' => 'returning', 'label' => 'Returning', 'color' => '#10b981'],
                        ],
                        'format' => 'number',
                        'points' => $fullData['customers']['growth'] ?? [],
                    ],
                    [
                        'title' => 'Spend Distribution',
                        'subtitle' => 'How customer spend is distributed across brackets.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Customers',
                        'format' => 'number',
                        'color' => '#f97316',
                        'points' => $fullData['customers']['spend_distribution'] ?? [],
                    ],
                    [
                        'title' => 'Top Customers',
                        'subtitle' => 'Highest-spending customer accounts.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Customer', 'key' => 'name'],
                            ['label' => 'Orders', 'key' => 'orders', 'format' => 'number'],
                            ['label' => 'Spend', 'key' => 'spend', 'format' => 'currency'],
                        ],
                        'rows' => $fullData['customers']['top_customers'] ?? [],
                        'emptyMessage' => 'No customer spend data available yet.',
                    ],
                ],
            ],
            'payments' => [
                'label' => 'Payments',
                'description' => 'Payment success, approval queues, and method usage for the current payment pipeline.',
                'theme' => $this->buildReportTheme('#2563eb', '#eff6ff', '#1d4ed8'),
                'cards' => $this->asArray($fullData['payments']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'Payment Status',
                        'subtitle' => 'Breakdown of tracked payment states.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Payments',
                        'format' => 'number',
                        'color' => '#2563eb',
                        'points' => $fullData['payments']['status_breakdown'] ?? [],
                    ],
                    [
                        'title' => 'Payment Methods',
                        'subtitle' => 'Method usage across payments.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Payments',
                        'format' => 'number',
                        'color' => '#4f46e5',
                        'points' => $fullData['payments']['method_breakdown'] ?? [],
                    ],
                    [
                        'title' => 'Pending Payment Queue',
                        'subtitle' => 'Payments that still need review or confirmation.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Payment ID', 'key' => 'payment_id'],
                            ['label' => 'Order ID', 'key' => 'order_id'],
                            ['label' => 'Method', 'key' => 'method'],
                            ['label' => 'Status', 'key' => 'status'],
                            ['label' => 'Amount', 'key' => 'amount', 'format' => 'currency'],
                        ],
                        'rows' => $fullData['payments']['pending_queue'] ?? [],
                        'emptyMessage' => 'No pending payments in the queue.',
                    ],
                ],
            ],
            'pos' => [
                'label' => 'POS',
                'description' => 'In-store sales patterns, payment mix, and item demand from the point-of-sale workflow.',
                'theme' => $this->buildReportTheme('#0891b2', '#ecfeff', '#0e7490'),
                'cards' => $this->asArray($fullData['pos']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'POS Sales Trend',
                        'subtitle' => 'Monthly in-store sales and transaction volume.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'sales', 'label' => 'Sales', 'color' => '#4f6fa5'],
                            ['key' => 'transactions', 'label' => 'Transactions', 'color' => '#10b981'],
                        ],
                        'format' => 'number',
                        'points' => $fullData['pos']['trend'] ?? [],
                    ],
                    [
                        'title' => 'POS Payment Mix',
                        'subtitle' => 'Payment methods recorded in the POS flow.',
                        'kind' => 'chart',
                        'type' => 'distribution',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Transactions',
                        'format' => 'number',
                        'color' => '#0891b2',
                        'points' => $fullData['pos']['method_breakdown'] ?? [],
                    ],
                    [
                        'title' => 'Busiest POS Hours',
                        'subtitle' => 'Hourly in-store sales pattern.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'sales',
                        'seriesLabel' => 'Sales',
                        'format' => 'currency',
                        'color' => '#06b6d4',
                        'points' => $fullData['pos']['hourly'] ?? [],
                    ],
                    [
                        'title' => 'Top POS Items',
                        'subtitle' => 'Best-selling items in the point-of-sale flow.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Item', 'key' => 'name'],
                            ['label' => 'Units Sold', 'key' => 'quantity', 'format' => 'number'],
                            ['label' => 'Revenue', 'key' => 'revenue', 'format' => 'currency'],
                        ],
                        'rows' => $fullData['pos']['top_items'] ?? [],
                        'emptyMessage' => 'No POS item data available yet.',
                    ],
                ],
            ],
            'schedules' => [
                'label' => 'Schedules',
                'description' => 'Booking momentum, event popularity, and upcoming schedule activity for event operations.',
                'theme' => $this->buildReportTheme('#9333ea', '#faf5ff', '#7e22ce'),
                'cards' => $this->asArray($fullData['schedules']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'Booking Trend',
                        'subtitle' => 'Monthly schedule booking activity.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'bookings', 'label' => 'Bookings', 'color' => '#4f6fa5'],
                        ],
                        'format' => 'number',
                        'points' => $fullData['schedules']['trend'] ?? [],
                    ],
                    [
                        'title' => 'Bookings per Event',
                        'subtitle' => 'Most popular schedules and events.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Bookings',
                        'format' => 'number',
                        'color' => '#8b5cf6',
                        'points' => $fullData['schedules']['bookings_per_event'] ?? [],
                    ],
                    [
                        'title' => 'Upcoming Events',
                        'subtitle' => 'Scheduled events with location and booking counts.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Event', 'key' => 'name'],
                            ['label' => 'Date', 'key' => 'date'],
                            ['label' => 'Location', 'key' => 'location'],
                            ['label' => 'Bookings', 'key' => 'bookings', 'format' => 'number'],
                        ],
                        'rows' => $fullData['schedules']['upcoming'] ?? [],
                        'emptyMessage' => 'No upcoming events scheduled yet.',
                    ],
                ],
            ],
            'operations' => [
                'label' => 'Operations',
                'description' => 'Workspace activity, user action volume, and recent operational events from the admin logs.',
                'theme' => $this->buildReportTheme('#0f766e', '#f0fdfa', '#115e59'),
                'cards' => $this->asArray($fullData['operations']['kpis'] ?? []),
                'panels' => [
                    [
                        'title' => 'Activity Trend',
                        'subtitle' => 'Recent admin and staff activity over time.',
                        'kind' => 'chart',
                        'type' => 'line',
                        'series' => [
                            ['key' => 'actions', 'label' => 'Actions', 'color' => '#4f6fa5'],
                        ],
                        'format' => 'number',
                        'points' => $fullData['operations']['activity_trend'] ?? [],
                    ],
                    [
                        'title' => 'Actions by User',
                        'subtitle' => 'Most active accounts in the logs.',
                        'kind' => 'chart',
                        'type' => 'bar',
                        'seriesKey' => 'value',
                        'seriesLabel' => 'Actions',
                        'format' => 'number',
                        'color' => '#10b981',
                        'points' => $fullData['operations']['actions_by_user'] ?? [],
                    ],
                    [
                        'title' => 'Recent Activity Feed',
                        'subtitle' => 'Latest operational events from your logs.',
                        'kind' => 'table',
                        'columns' => [
                            ['label' => 'Time', 'key' => 'time'],
                            ['label' => 'User', 'key' => 'user'],
                            ['label' => 'Role', 'key' => 'role'],
                            ['label' => 'Event', 'key' => 'event'],
                            ['label' => 'Module', 'key' => 'module'],
                        ],
                        'rows' => $fullData['operations']['recent'] ?? [],
                        'emptyMessage' => 'No activity logs available yet.',
                    ],
                ],
            ],
        ];
    }

    protected function buildSalesSummaryCards(array $salesData): array
    {
        $trend = $this->asArray($salesData['revenue_trend'] ?? []);
        $delivery = $this->asArray($salesData['delivery_breakdown'] ?? []);
        $paymentMethods = $this->asArray($salesData['payment_method_breakdown'] ?? []);
        $onlineRevenue = collect($trend)->sum('online');
        $posRevenue = collect($trend)->sum('pos');
        $totalRevenue = collect($trend)->sum('total');
        $peakDay = collect($trend)->sortByDesc('total')->first();

        return [
            [
                'label' => 'Tracked Revenue',
                'value' => round($totalRevenue, 2),
                'format' => 'currency',
                'description' => 'Combined online and POS revenue in the tracked window',
            ],
            [
                'label' => 'Online Share',
                'value' => $totalRevenue > 0 ? round(($onlineRevenue / $totalRevenue) * 100, 1) : 0,
                'format' => 'percent',
                'description' => 'Share of revenue attributed to website orders',
            ],
            [
                'label' => 'Delivery Modes',
                'value' => count($delivery),
                'format' => 'number',
                'description' => 'Distinct delivery methods contributing to revenue',
            ],
            [
                'label' => 'Peak Day',
                'value' => $peakDay['label'] ?? 'No data',
                'format' => 'text',
                'description' => 'Highest combined revenue day in the trend view',
            ],
            [
                'label' => 'POS Revenue',
                'value' => round($posRevenue, 2),
                'format' => 'currency',
                'description' => 'Revenue from point-of-sale transactions',
            ],
            [
                'label' => 'Payment Methods',
                'value' => count($paymentMethods),
                'format' => 'number',
                'description' => 'Tracked payment methods across the revenue set',
            ],
        ];
    }

    protected function buildProductSummaryCards(array $productsData): array
    {
        $topProducts = $this->asArray($productsData['top_products'] ?? []);
        $categories = $this->asArray($productsData['category_performance'] ?? []);
        $types = $this->asArray($productsData['type_performance'] ?? []);
        $topProduct = $topProducts[0] ?? null;

        return [
            [
                'label' => 'Tracked Products',
                'value' => count($topProducts),
                'format' => 'number',
                'description' => 'Products captured in the ranked performance list',
            ],
            [
                'label' => 'Top Product',
                'value' => $topProduct['name'] ?? 'No data',
                'format' => 'text',
                'description' => 'Highest revenue product in the current analytics set',
            ],
            [
                'label' => 'Top Product Revenue',
                'value' => $topProduct['revenue'] ?? 0,
                'format' => 'currency',
                'description' => 'Revenue generated by the best-performing product',
            ],
            [
                'label' => 'Categories',
                'value' => count($categories),
                'format' => 'number',
                'description' => 'Product categories represented in this report',
            ],
            [
                'label' => 'Product Types',
                'value' => count($types),
                'format' => 'number',
                'description' => 'Unique product types contributing to revenue',
            ],
        ];
    }

    protected function buildReportTheme(string $accent, string $soft, string $deep): array
    {
        return [
            'accent' => $accent,
            'soft' => $soft,
            'deep' => $deep,
        ];
    }

    protected function prepareVisualBlock(array $panel): array
    {
        return [
            'title' => $panel['title'],
            'subtitle' => $panel['subtitle'] ?? null,
            'type' => $panel['type'] ?? 'bar',
            'series' => $panel['series'] ?? [],
            'seriesKey' => $panel['seriesKey'] ?? 'value',
            'seriesLabel' => $panel['seriesLabel'] ?? 'Value',
            'format' => $panel['format'] ?? 'number',
            'color' => $panel['color'] ?? '#4f6fa5',
            'points' => $this->asArray($panel['points'] ?? []),
        ];
    }

    protected function prepareTableBlock(array $panel): array
    {
        return [
            'title' => $panel['title'],
            'subtitle' => $panel['subtitle'] ?? null,
            'columns' => $panel['columns'] ?? [],
            'rows' => $this->asArray($panel['rows'] ?? []),
            'emptyMessage' => $panel['emptyMessage'] ?? 'No records available for this report.',
        ];
    }

    protected function sliceRows($value, int $limit = 6): array
    {
        if ($value instanceof Collection) {
            return $value->take($limit)->values()->all();
        }

        return array_slice((array) $value, 0, $limit);
    }

    protected function asArray($value): array
    {
        if ($value instanceof Collection) {
            return $value->values()->all();
        }

        return array_values((array) $value);
    }

    protected function normalizeExportLabel(?string $value): string
    {
        return strtolower(trim((string) $value));
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
