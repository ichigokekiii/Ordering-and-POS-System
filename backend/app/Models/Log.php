<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $table = 'logs';

    protected $primaryKey = 'log_id';

    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'event',
        'module',
        'source',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
