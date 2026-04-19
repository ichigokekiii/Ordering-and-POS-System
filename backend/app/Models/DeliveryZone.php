<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'code',
        'label',
        'description',
        'sort_order',
        'requires_other_details',
        'is_active',
    ];

    protected $casts = [
        'requires_other_details' => 'boolean',
        'is_active' => 'boolean',
    ];
}
