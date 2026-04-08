<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Order;
use App\Models\Products;

class OrderItem extends Model
{
    protected $primaryKey = 'order_item_id';

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'custom_id',
        'premade_id',
        'quantity',
        'price_at_purchase',
        'special_message',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    // Add this missing relationship!
    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}