<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
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

//login simple
Route::post('/login', function (Request $request) {
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'role' => $user->role,
    ]);
});

//logout simple
Route::post('/logout', function () {
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
});

//register for users
Route::post('/register', function (Request $request) {
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'user',
    ]);

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'role' => $user->role,
    ]);
});