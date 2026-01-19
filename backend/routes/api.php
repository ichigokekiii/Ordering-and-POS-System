<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use Illuminate\Http\Request;
//use App\Http\Controllers\NameController;

Route::get('/test', function () {
    return response()->json(['message' => 'API works in Laravel 11']);
}); 

//Route::post('/names', [NameController::class, 'store']);

Route::get('/landing', function () {
    return response()->json([
        'title' => 'Landing Page JSON Test',
        'subtitle' => 'Text is from routes/api. Laravel API is Connected',
    ]);
});

// Get all products (user side)
Route::get('/products', function () {
    return Product::all();
});

// Add product (admin side)
Route::post('/products', function (Request $request) {
    return Product::create([
        'name' => $request->name,
        'image' => $request->image,
        'price' => $request->price,
    ]);
});