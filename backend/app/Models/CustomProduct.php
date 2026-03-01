<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomProduct extends Model
{
    protected $table = 'custom_products';
    
    protected $fillable = ['name', 'image', 'description', 'category', 'price', 'isAvailable'];
}