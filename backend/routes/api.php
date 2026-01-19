<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NameController;  

Route::get('/test', function () {
    return response()->json(['message' => 'API works in Laravel 11']);
}); 

Route::post('/names', [NameController::class, 'store']);

