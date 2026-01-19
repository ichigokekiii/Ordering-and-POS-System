<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NameController;  

Route::get('/test', function () {
    return response()->json(['message' => 'API works in Laravel 11']);
}); 

Route::post('/names', [NameController::class, 'store']);

Route::get('/landing', function () {
    return response()->json([
        'title' => 'Landing Page JSON Test',
        'subtitle' => 'Text is from routes/api. Laravel API is Connected',
    ]);
});


