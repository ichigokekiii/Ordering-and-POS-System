<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremadeProduct extends Model
{
    protected $table = 'premade_products';
    
    protected $fillable = ['name', 'image', 'description', 'price', 'isAvailable'];
}