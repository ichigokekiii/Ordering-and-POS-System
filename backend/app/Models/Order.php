<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'schedule_id',
        'total_amount',
        'order_status'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}