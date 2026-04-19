<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatus extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'code',
        'label',
        'description',
        'sort_order',
        'badge_background',
        'badge_border',
        'badge_text',
    ];
}
