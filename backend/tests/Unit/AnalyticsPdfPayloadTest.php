<?php

namespace Tests\Unit;

use App\Http\Controllers\AnalyticsController;
use PHPUnit\Framework\TestCase;

class AnalyticsPdfPayloadTest extends TestCase
{
    public function test_section_export_uses_section_specific_visuals(): void
    {
        $controller = new class extends AnalyticsController
        {
            public function exposeBuildPdfPayload(...$args): array
            {
                return $this->buildPdfPayload(...$args);
            }
        };

        $payload = $controller->exposeBuildPdfPayload(
            'sales',
            'Sales Full Report',
            $this->sampleAnalyticsData(),
            'section',
            'section',
            null,
            'Sales'
        );

        $this->assertSame('section', $payload['reportVariant']);
        $this->assertSame('Sales', $payload['sectionLabel']);
        $this->assertNotEmpty($payload['summaryCards']);
        $this->assertSame('Revenue by Channel', $payload['visualBlocks'][0]['title']);
        $this->assertSame('Delivery Breakdown', $payload['visualBlocks'][1]['title']);
    }

    public function test_single_metric_export_uses_universal_focus_card_layout(): void
    {
        $controller = new class extends AnalyticsController
        {
            public function exposeBuildPdfPayload(...$args): array
            {
                return $this->buildPdfPayload(...$args);
            }
        };

        $payload = $controller->exposeBuildPdfPayload(
            'payments',
            'Pending Payments',
            $this->sampleAnalyticsData(),
            'single',
            'metric',
            'Payments waiting for review',
            'Payments'
        );

        $this->assertSame('single', $payload['reportVariant']);
        $this->assertSame('Pending Payments', $payload['focusCard']['label']);
        $this->assertNotEmpty($payload['visualBlocks']);
        $this->assertSame('Payment Status', $payload['visualBlocks'][0]['title']);
    }

    public function test_single_table_export_keeps_the_selected_table(): void
    {
        $controller = new class extends AnalyticsController
        {
            public function exposeBuildPdfPayload(...$args): array
            {
                return $this->buildPdfPayload(...$args);
            }
        };

        $payload = $controller->exposeBuildPdfPayload(
            'schedules',
            'Upcoming Events',
            $this->sampleAnalyticsData(),
            'single',
            'panel',
            'Scheduled events with booking counts',
            'Schedules'
        );

        $this->assertSame('single', $payload['reportVariant']);
        $this->assertNull($payload['focusCard']);
        $this->assertNotEmpty($payload['detailTables']);
        $this->assertSame('Upcoming Events', $payload['detailTables'][0]['title']);
    }

    private function sampleAnalyticsData(): array
    {
        return [
            'overview' => [
                'cards' => [
                    ['label' => 'Total Revenue', 'value' => 12500, 'format' => 'currency', 'description' => 'Combined revenue'],
                    ['label' => 'Total Orders', 'value' => 42, 'format' => 'number', 'description' => 'Website order volume'],
                ],
            ],
            'sales' => [
                'revenue_trend' => [
                    ['label' => 'Apr 1', 'online' => 3200, 'pos' => 900, 'total' => 4100],
                    ['label' => 'Apr 2', 'online' => 2600, 'pos' => 1200, 'total' => 3800],
                ],
                'delivery_breakdown' => [
                    ['name' => 'Pickup', 'value' => 3000],
                    ['name' => 'Delivery', 'value' => 4900],
                ],
                'payment_method_breakdown' => [
                    ['name' => 'GCash', 'value' => 18],
                    ['name' => 'Cash', 'value' => 9],
                ],
            ],
            'products' => [
                'top_products' => [
                    ['name' => 'Sunset Bouquet', 'quantity' => 12, 'revenue' => 5600],
                    ['name' => 'Spring Mix', 'quantity' => 8, 'revenue' => 3100],
                ],
                'category_performance' => [
                    ['name' => 'Bouquets', 'revenue' => 8700],
                ],
                'type_performance' => [
                    ['name' => 'Premade', 'revenue' => 5200],
                ],
            ],
            'payments' => [
                'kpis' => [
                    ['label' => 'Payment Success Rate', 'value' => 90, 'format' => 'percent'],
                    ['label' => 'Pending Payments', 'value' => 4, 'format' => 'number', 'description' => 'Waiting for review'],
                ],
                'status_breakdown' => [
                    ['name' => 'Confirmed', 'value' => 14],
                    ['name' => 'Pending', 'value' => 4],
                ],
                'method_breakdown' => [
                    ['name' => 'GCash', 'value' => 11],
                    ['name' => 'Cash', 'value' => 7],
                ],
                'pending_queue' => [
                    ['payment_id' => 'PAY-001', 'order_id' => 'ORD-001', 'method' => 'GCash', 'status' => 'pending', 'amount' => 1250],
                ],
            ],
            'schedules' => [
                'kpis' => [
                    ['label' => 'Total Bookings', 'value' => 12, 'format' => 'number'],
                ],
                'trend' => [
                    ['label' => 'Jan', 'bookings' => 2],
                    ['label' => 'Feb', 'bookings' => 5],
                ],
                'bookings_per_event' => [
                    ['name' => 'Mother\'s Day', 'value' => 8],
                ],
                'upcoming' => [
                    ['name' => 'Mother\'s Day', 'date' => 'May 11, 2026', 'location' => 'Main Shop', 'bookings' => 8],
                ],
            ],
        ];
    }
}
