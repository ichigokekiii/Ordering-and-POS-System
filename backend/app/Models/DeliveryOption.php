<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'code',
        'label',
        'description',
        'sort_order',
    ];
}
