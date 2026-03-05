<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
        'is_verified',
        // 'address', // REMOVED: This is now handled by the addresses() relationship
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'failed_attempt_count' => 'integer',
            'last_failed_attempt_at' => 'datetime',
            'is_locked' => 'boolean',
            'priority' => 'integer',
            'is_verified' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    // This MUST be inside the class brackets
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}