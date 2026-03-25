<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    protected $table = 'contents';

    protected $fillable = [
        'identifier',
        'page',
        'type',
        'content_text',
        'content_image',
        'isArchived'
    ];

    protected $casts = [
        'isArchived' => 'boolean',
    ];
}