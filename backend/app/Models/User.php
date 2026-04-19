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
        'role_id',
        'status',
        'user_status_id',
        'isArchived',
        'first_name',
        'last_name',
        'phone_number',
        'profile_picture',
        'failed_attempt_count',
        'last_failed_attempt_at',
        'is_locked',
        'priority',
        'consecutive_cancellations',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'failed_attempt_count' => 'integer',
            'last_failed_attempt_at' => 'datetime',
            'is_locked' => 'boolean',
            'isArchived' => 'boolean',
            'priority' => 'integer',
            'consecutive_cancellations' => 'integer',
            'is_verified' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    public function roleRecord()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function userStatusRecord()
    {
        return $this->belongsTo(UserStatus::class, 'user_status_id');
    }

    // This MUST be inside the class brackets
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}
