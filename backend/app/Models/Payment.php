<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'order_id',
        'payment_method',
        'payment_date',
        'payment_status',
        'payment_status_id',
        'reference_number',
        'amount_paid',
        'reference_image_path',
        'confirmed_by',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function paymentStatusRecord()
    {
        return $this->belongsTo(PaymentStatus::class, 'payment_status_id');
    }
}
