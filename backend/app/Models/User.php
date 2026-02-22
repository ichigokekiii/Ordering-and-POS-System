<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
//use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasFactory, Notifiable /*, SoftDeletes*/;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'email',
        'password',
        'role',
        'status',
        'first_name',
        'last_name',
        'phone_number',
        'failed_attempt_count',
        'last_failed_attempt_at',
        'is_locked',
        'priority',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'failed_attempt_count' => 'integer',
            'last_failed_attempt_at' => 'datetime',
            'is_locked' => 'boolean',
            'priority' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }
}
