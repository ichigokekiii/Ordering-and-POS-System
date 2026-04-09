<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosItem extends Model
{
    protected $fillable = ['pos_id', 'product_id', 'source_product_id', 'product_name', 'price', 'quantity'];

    public function transaction()
    {
        return $this->belongsTo(PosTransactions::class, 'pos_id');
    }

    public function product()
    {
        return $this->belongsTo(Products::class, 'source_product_id');
    }
}
