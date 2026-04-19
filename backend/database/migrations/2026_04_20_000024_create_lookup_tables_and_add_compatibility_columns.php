<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::create('user_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::create('order_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('badge_background', 20);
            $table->string('badge_border', 20);
            $table->string('badge_text', 20);
        });

        Schema::create('payment_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::create('delivery_options', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('requires_other_details')->default(false);
            $table->boolean('is_active')->default(true);
        });

        $this->seedLookups();

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained('roles')->nullOnDelete();
            $table->foreignId('user_status_id')->nullable()->after('status')->constrained('user_statuses')->nullOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('order_status_id')->nullable()->after('order_status')->constrained('order_statuses')->nullOnDelete();
            $table->foreignId('delivery_option_id')->nullable()->after('delivery_method')->constrained('delivery_options')->nullOnDelete();
            $table->foreignId('delivery_zone_id')->nullable()->after('delivery_option_id')->constrained('delivery_zones')->nullOnDelete();
            $table->string('delivery_zone_other')->nullable()->after('delivery_zone_id');
            $table->string('tracking_number')->nullable()->after('delivery_zone_other');
            $table->string('total_amount_value')->nullable()->after('total_amount');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('payment_status_id')->nullable()->after('payment_status')->constrained('payment_statuses')->nullOnDelete();
            $table->string('amount_paid')->nullable()->after('reference_number');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('quantity_value')->nullable()->after('quantity');
            $table->string('price_at_purchase_value')->nullable()->after('price_at_purchase');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('price_value')->nullable()->after('price');
        });

        Schema::table('custom_products', function (Blueprint $table) {
            $table->string('price_value')->nullable()->after('price');
            $table->string('required_main_count_value')->nullable()->after('required_main_count');
            $table->string('required_filler_count_value')->nullable()->after('required_filler_count');
        });

        Schema::table('premade_products', function (Blueprint $table) {
            $table->string('price_value')->nullable()->after('price');
        });

        Schema::table('pos_transactions', function (Blueprint $table) {
            $table->string('total_amount_value')->nullable()->after('total_amount');
            $table->string('cash_received_value')->nullable()->after('cash_received');
        });

        Schema::table('pos_items', function (Blueprint $table) {
            $table->string('price_value')->nullable()->after('price');
            $table->string('quantity_value')->nullable()->after('quantity');
        });

        $this->backfillCompatibilityColumns();
    }

    public function down(): void
    {
        Schema::table('pos_items', function (Blueprint $table) {
            $table->dropColumn(['price_value', 'quantity_value']);
        });

        Schema::table('pos_transactions', function (Blueprint $table) {
            $table->dropColumn(['total_amount_value', 'cash_received_value']);
        });

        Schema::table('premade_products', function (Blueprint $table) {
            $table->dropColumn('price_value');
        });

        Schema::table('custom_products', function (Blueprint $table) {
            $table->dropColumn(['price_value', 'required_main_count_value', 'required_filler_count_value']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('price_value');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['quantity_value', 'price_at_purchase_value']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_status_id');
            $table->dropColumn('amount_paid');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_status_id');
            $table->dropConstrainedForeignId('delivery_option_id');
            $table->dropConstrainedForeignId('delivery_zone_id');
            $table->dropColumn(['delivery_zone_other', 'tracking_number', 'total_amount_value']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropConstrainedForeignId('user_status_id');
        });

        Schema::dropIfExists('delivery_zones');
        Schema::dropIfExists('delivery_options');
        Schema::dropIfExists('payment_statuses');
        Schema::dropIfExists('order_statuses');
        Schema::dropIfExists('user_statuses');
        Schema::dropIfExists('roles');
    }

    protected function seedLookups(): void
    {
        DB::table('roles')->insert([
            ['code' => 'user', 'label' => 'Customer', 'description' => 'Customer ordering account.', 'sort_order' => 1],
            ['code' => 'staff', 'label' => 'Staff', 'description' => 'Operational staff account.', 'sort_order' => 2],
            ['code' => 'admin', 'label' => 'Admin', 'description' => 'Administrative account.', 'sort_order' => 3],
            ['code' => 'owner', 'label' => 'Owner', 'description' => 'Owner account.', 'sort_order' => 4],
        ]);

        DB::table('user_statuses')->insert([
            ['code' => 'active', 'label' => 'Active', 'description' => 'Account can sign in and transact.', 'sort_order' => 1],
            ['code' => 'inactive', 'label' => 'Inactive', 'description' => 'Account is disabled or locked.', 'sort_order' => 2],
        ]);

        DB::table('order_statuses')->insert([
            ['code' => 'pending', 'label' => 'Pending', 'description' => 'Waiting for order review and confirmation.', 'sort_order' => 1, 'badge_background' => '#fef3c7', 'badge_border' => '#fcd34d', 'badge_text' => '#92400e'],
            ['code' => 'processing', 'label' => 'Processing', 'description' => 'Order is confirmed and being prepared.', 'sort_order' => 2, 'badge_background' => '#dbeafe', 'badge_border' => '#93c5fd', 'badge_text' => '#1d4ed8'],
            ['code' => 'shipped', 'label' => 'Shipped', 'description' => 'Order is in transit to the customer.', 'sort_order' => 3, 'badge_background' => '#ede9fe', 'badge_border' => '#c4b5fd', 'badge_text' => '#6d28d9'],
            ['code' => 'delivered', 'label' => 'Delivered', 'description' => 'Order has been completed and received.', 'sort_order' => 4, 'badge_background' => '#d1fae5', 'badge_border' => '#86efac', 'badge_text' => '#047857'],
            ['code' => 'cancelled', 'label' => 'Cancelled', 'description' => 'Order was cancelled before fulfillment.', 'sort_order' => 5, 'badge_background' => '#fee2e2', 'badge_border' => '#fca5a5', 'badge_text' => '#b91c1c'],
        ]);

        DB::table('payment_statuses')->insert([
            ['code' => 'pending', 'label' => 'Pending', 'description' => 'Waiting for payment review or confirmation.', 'sort_order' => 1],
            ['code' => 'confirmed', 'label' => 'Confirmed', 'description' => 'Payment has been confirmed.', 'sort_order' => 2],
            ['code' => 'cancelled', 'label' => 'Cancelled', 'description' => 'Payment was cancelled or failed.', 'sort_order' => 3],
        ]);

        DB::table('delivery_options')->insert([
            ['code' => 'pickup', 'label' => 'Pickup', 'description' => 'Customer will pick up the order.', 'sort_order' => 1],
            ['code' => 'delivery', 'label' => 'Delivery', 'description' => 'Order will be delivered to the customer.', 'sort_order' => 2],
        ]);

        DB::table('delivery_zones')->insert([
            ['code' => 'southern_luzon', 'label' => 'Southern Luzon', 'description' => 'Standard delivery service area.', 'sort_order' => 1, 'requires_other_details' => false, 'is_active' => true],
            ['code' => 'other', 'label' => 'Other', 'description' => 'Enter your location details manually.', 'sort_order' => 2, 'requires_other_details' => true, 'is_active' => true],
        ]);
    }

    protected function backfillCompatibilityColumns(): void
    {
        $roleIds = DB::table('roles')->pluck('id', 'code');
        $userStatusIds = DB::table('user_statuses')->pluck('id', 'code');
        $orderStatusIds = DB::table('order_statuses')->pluck('id', 'code');
        $paymentStatusIds = DB::table('payment_statuses')->pluck('id', 'code');
        $deliveryOptionIds = DB::table('delivery_options')->pluck('id', 'code');
        $deliveryZoneIds = DB::table('delivery_zones')->pluck('id', 'code');

        DB::table('users')->orderBy('id')->get()->each(function ($user) use ($roleIds, $userStatusIds) {
            $roleCode = match (strtolower(trim((string) $user->role))) {
                'customer', 'user' => 'user',
                'staff' => 'staff',
                'admin' => 'admin',
                'owner' => 'owner',
                default => 'user',
            };

            $statusCode = match (strtolower(trim((string) $user->status))) {
                'inactive', 'disabled', 'locked' => 'inactive',
                default => 'active',
            };

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'role' => $roleCode,
                    'status' => $statusCode === 'active' ? 'Active' : 'Inactive',
                    'role_id' => $roleIds[$roleCode] ?? null,
                    'user_status_id' => $userStatusIds[$statusCode] ?? null,
                ]);
        });

        DB::table('orders')->orderBy('order_id')->get()->each(function ($order) use ($orderStatusIds, $deliveryOptionIds, $deliveryZoneIds) {
            $statusCode = match (strtolower(trim((string) $order->order_status))) {
                'processing', 'confirmed' => 'processing',
                'shipped' => 'shipped',
                'delivered', 'completed' => 'delivered',
                'cancelled', 'canceled' => 'cancelled',
                default => 'pending',
            };

            $deliveryCode = match (strtolower(trim((string) $order->delivery_method))) {
                'delivery' => 'delivery',
                default => 'pickup',
            };

            DB::table('orders')
                ->where('order_id', $order->order_id)
                ->update([
                    'order_status' => $statusCode,
                    'order_status_id' => $orderStatusIds[$statusCode] ?? null,
                    'delivery_method' => $deliveryCode,
                    'delivery_option_id' => $deliveryOptionIds[$deliveryCode] ?? null,
                    'delivery_zone_id' => $deliveryCode === 'delivery' ? ($deliveryZoneIds['southern_luzon'] ?? null) : null,
                    'delivery_zone_other' => null,
                    'total_amount_value' => $order->total_amount !== null ? number_format((float) $order->total_amount, 2, '.', '') : null,
                ]);
        });

        DB::table('payments')->orderBy('payment_id')->get()->each(function ($payment) use ($paymentStatusIds) {
            $statusCode = match (strtolower(trim((string) $payment->payment_status))) {
                'confirmed', 'paid', 'success' => 'confirmed',
                'cancelled', 'canceled', 'failed', 'error' => 'cancelled',
                default => 'pending',
            };

            $orderTotal = DB::table('orders')
                ->where('order_id', $payment->order_id)
                ->value('total_amount_value');

            DB::table('payments')
                ->where('payment_id', $payment->payment_id)
                ->update([
                    'payment_status' => $statusCode,
                    'payment_status_id' => $paymentStatusIds[$statusCode] ?? null,
                    'amount_paid' => $orderTotal,
                ]);
        });

        DB::table('order_items')->orderBy('order_item_id')->get()->each(function ($item) {
            DB::table('order_items')
                ->where('order_item_id', $item->order_item_id)
                ->update([
                    'quantity_value' => $item->quantity !== null ? (string) $item->quantity : null,
                    'price_at_purchase_value' => $item->price_at_purchase !== null ? number_format((float) $item->price_at_purchase, 2, '.', '') : null,
                ]);
        });

        foreach (['products', 'custom_products', 'premade_products'] as $table) {
            DB::table($table)->orderBy('id')->get()->each(function ($row) use ($table) {
                $update = [
                    'price_value' => $row->price !== null ? number_format((float) $row->price, 2, '.', '') : null,
                ];

                if ($table === 'custom_products') {
                    $update['required_main_count_value'] = $row->required_main_count !== null ? (string) $row->required_main_count : null;
                    $update['required_filler_count_value'] = $row->required_filler_count !== null ? (string) $row->required_filler_count : null;
                }

                DB::table($table)->where('id', $row->id)->update($update);
            });
        }

        DB::table('pos_transactions')->orderBy('id')->get()->each(function ($transaction) {
            DB::table('pos_transactions')
                ->where('id', $transaction->id)
                ->update([
                    'total_amount_value' => $transaction->total_amount !== null ? number_format((float) $transaction->total_amount, 2, '.', '') : null,
                    'cash_received_value' => $transaction->cash_received !== null ? number_format((float) $transaction->cash_received, 2, '.', '') : null,
                ]);
        });

        DB::table('pos_items')->orderBy('id')->get()->each(function ($item) {
            DB::table('pos_items')
                ->where('id', $item->id)
                ->update([
                    'price_value' => $item->price !== null ? number_format((float) $item->price, 2, '.', '') : null,
                    'quantity_value' => $item->quantity !== null ? (string) $item->quantity : null,
                ]);
        });
    }
};
