<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremadeProduct extends Model
{
    protected $table = 'premade_products';
    
    protected $fillable = ['product_id', 'name', 'image', 'description', 'type', 'category', 'price', 'isAvailable'];

protected $casts = [
    'isAvailable' => 'boolean',
];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}
