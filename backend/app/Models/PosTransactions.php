<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosTransactions extends Model
{
    use HasFactory;

    protected $fillable = [
        'total_amount',
        'total_amount_value',
        'payment_method',
        'cash_received',
        'cash_received_value',
        'isArchived',
    ];

    protected $casts = [
        'isArchived' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(PosItem::class, 'pos_id');
    }
}
