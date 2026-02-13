<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;

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

// ========== PRODUCT ROUTES ==========
Route::get('/products', [ProductController::class, 'index']);      // Get all products
Route::post('/products', [ProductController::class, 'store']);     // Create new product
Route::put('/products/{id}', [ProductController::class, 'update']); // Update product
Route::delete('/products/{id}', [ProductController::class, 'destroy']); // Delete product

// ========== USER ROUTES (For Admin Page) ==========
Route::get('/users', [UserController::class, 'index']);      // Get all users
Route::post('/users', [UserController::class, 'store']);     // Create new user
Route::get('/users/{id}', [UserController::class, 'show']);  // Get one user
Route::put('/users/{id}', [UserController::class, 'update']); // Update user
Route::delete('/users/{id}', [UserController::class, 'destroy']); // Delete user

// ========== LOGIN & REGISTER ROUTES ==========
Route::post('/login', function (Request $request) {
    // Check if email and password are correct
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Get the logged in user
    $user = Auth::user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'role' => $user->role,
    ]);
});

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