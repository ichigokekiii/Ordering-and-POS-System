<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;


    // Override the default primary key
    protected $primaryKey = 'order_id';
    public $incrementing = false;
    protected $keyType = 'string';

    // Specify the columns that can be filled directly
    protected $fillable = [
        'user_id',
        'schedule_id',
        'payment_id',
        'order_date',
        'total_amount',
        'order_status',
        'isArchived',
        'special_message',
        'delivery_method',
        'address',
    ];

    protected $casts = [
        'isArchived' => 'boolean',
    ];

    // Define the relationship: An Order has one Payment
    public function payment()
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }
    
    // Optional: If you have a User model, link it here
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }

    // Relationship: An Order has many OrderItems
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }
}
