<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'product_source',
        'source_product_id',
        'name',
        'description',
        'category',
        'type',
        'price',
        'image',
        'isAvailable',
        'isArchived',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'isAvailable' => 'boolean',
        'isArchived' => 'boolean',
    ];
}
