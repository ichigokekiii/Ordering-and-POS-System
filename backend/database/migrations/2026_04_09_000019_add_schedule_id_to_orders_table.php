<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('schedule_id')
                ->nullable()
                ->after('user_id')
                ->constrained('schedules')
                ->nullOnDelete();

            $table->index(['schedule_id', 'created_at']);
        });

        $orders = DB::table('orders')
            ->select('order_id', 'order_date')
            ->get();

        foreach ($orders as $order) {
            $scheduleId = DB::table('schedules')
                ->where('event_date', '>=', $order->order_date)
                ->orderBy('event_date')
                ->value('id');

            if ($scheduleId) {
                DB::table('orders')
                    ->where('order_id', $order->order_id)
                    ->update(['schedule_id' => $scheduleId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_schedule_id_created_at_index');
            $table->dropConstrainedForeignId('schedule_id');
        });
    }
};
