<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PremadeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PosTransactionsController;
use App\Http\Controllers\OrderController;


Route::post('/orders', [OrderController::class, 'store']);

// Test route - check if API works
Route::get('/test', function () {
    return response()->json(['message' => 'API works in Laravel 11']);
}); 

Route::get('/landing', function () {
    return response()->json([
        'title' => 'Landing Page JSON Test',
        'subtitle' => 'Text is from routes/api. Laravel API is Connected',
    ]);
});

//product api routes
Route::apiResource('products', ProductController::class);

//pos-transactions api routes
Route::post('/pos-transactions', [PosTransactionsController::class, 'store']);
Route::get('/pos-transactions/analytics', [PosTransactionsController::class, 'analytics']);

//premade api routes
Route::apiResource('premades', PremadeController::class);


//login simple
Route::post('/login', function (Request $request) {
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
    ]);
});

//logout simple
Route::post('/logout', function () {
    // Logout the user
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
});

Route::post('/register', function (Request $request) {
    // Get data from request
    $name = $request->input('name');
    $email = $request->input('email');
    $password = $request->input('password');

    // Check if all fields are provided
    if (empty($name) || empty($email) || empty($password)) {
        return response()->json(['message' => 'All fields are required'], 400);
    }

    // Check if email already exists
    $existingUser = User::where('email', $email)->first();
    if ($existingUser) {
        return response()->json(['message' => 'Email already registered'], 400);
    }

    // Create new user
    $user = new User();
    $user->name = $name;
    $user->email = $email;
    $user->password = Hash::make($password);  // Hash password for security
    $user->role = 'user';  // Default role
    $user->save();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'role' => $user->role,
    ]);
});