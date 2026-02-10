<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosItem extends Model
{
    protected $fillable = ['pos_id', 'product_id', 'product_name', 'price', 'quantity'];
}
