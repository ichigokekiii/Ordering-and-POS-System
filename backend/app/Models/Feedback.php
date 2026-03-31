<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'feedback_id';

    protected $table = 'feedbacks'; 

    protected $fillable = [
        'user_id',
        'feedback_rating',
        'feedback_text',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}