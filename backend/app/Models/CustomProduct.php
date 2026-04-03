<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomProduct extends Model
{
    protected $table = 'custom_products';
    
    protected $fillable = [
        'product_id',
        'name',
        'image',
        'description',
        'category',
        'type',
        'price',
        'isAvailable',
        'required_main_count',
        'required_filler_count',
    ];

    protected $casts = [
        'isAvailable' => 'boolean',
        'required_main_count' => 'integer',
        'required_filler_count' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}
