<?php

namespace Tests\Feature;

use App\Mail\AnalyticsReportMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsEmailExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_email_a_section_report_and_a_single_metric_report(): void
    {
        Mail::fake();

        $admin = $this->createAdminUser();

        Sanctum::actingAs($admin);

        $this->postJson('/api/analytics/email', [
            'section' => 'sales',
            'context' => 'Sales Full Report',
            'export_type' => 'section',
            'context_kind' => 'section',
            'section_label' => 'Sales',
        ])->assertOk();

        $this->postJson('/api/analytics/email', [
            'section' => 'payments',
            'context' => 'Pending Payments',
            'export_type' => 'single',
            'context_kind' => 'metric',
            'subtitle' => 'Payments waiting for review',
            'section_label' => 'Payments',
        ])->assertOk();

        Mail::assertSent(AnalyticsReportMail::class, 2);
        Mail::assertSent(AnalyticsReportMail::class, function (AnalyticsReportMail $mail) use ($admin) {
            return $mail->hasTo($admin->email) && $mail->sectionName === 'Sales Full Report';
        });
        Mail::assertSent(AnalyticsReportMail::class, function (AnalyticsReportMail $mail) use ($admin) {
            return $mail->hasTo($admin->email) && $mail->sectionName === 'Pending Payments';
        });
    }

    private function createAdminUser(): User
    {
        return User::query()->create([
            'first_name' => 'Analytics',
            'last_name' => 'Admin',
            'email' => 'analytics-admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'Active',
            'phone_number' => '09123456789',
            'failed_attempt_count' => 0,
            'is_locked' => false,
            'priority' => 0,
            'is_verified' => true,
            'consecutive_cancellations' => 0,
        ]);
    }
}
