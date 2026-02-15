<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PosTransactions;

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
}
