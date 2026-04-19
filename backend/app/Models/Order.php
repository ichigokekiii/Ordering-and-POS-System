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
        'total_amount_value',
        'order_status',
        'order_status_id',
        'isArchived',
        'special_message',
        'delivery_method',
        'delivery_option_id',
        'delivery_zone_id',
        'delivery_zone_other',
        'tracking_number',
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

    public function orderStatusRecord()
    {
        return $this->belongsTo(OrderStatus::class, 'order_status_id');
    }

    public function deliveryOption()
    {
        return $this->belongsTo(DeliveryOption::class, 'delivery_option_id');
    }

    public function deliveryZone()
    {
        return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id');
    }

    // Relationship: An Order has many OrderItems
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }
}
