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
            'product_id'   => $item['id'],
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

    return response()->json($weeklyRevenue);
}
}
