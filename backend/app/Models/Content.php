<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    protected $table = 'cms_contents';

    protected $fillable = [
        'identifier',
        'page',
        'type',
        'content_text',
        'content_image',
        'isArchived'
    ];
}