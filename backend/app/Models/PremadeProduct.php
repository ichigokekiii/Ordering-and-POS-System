<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremadeProduct extends Model
{
    protected $table = 'premade_products';
    
    protected $fillable = ['product_id', 'name', 'image', 'description', 'type', 'category', 'price', 'isAvailable', 'isArchived'];

protected $casts = [
    'isAvailable' => 'boolean',
    'isArchived' => 'boolean',
];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}
