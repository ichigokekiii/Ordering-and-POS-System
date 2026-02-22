<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PremadeController;
//use App\Http\Controllers\NameController;
use App\Http\Controllers\PosTransactionsController;
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

//product api routes
Route::apiResource('products', ProductController::class);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

//premade api routes
Route::apiResource('premades', PremadeController::class);
Route::get('/premades', [PremadeController::class, 'index']);
Route::post('/premades', [PremadeController::class, 'store']);
Route::put('/premades/{id}', [PremadeController::class, 'update']);
Route::delete('/premades/{id}', [PremadeController::class, 'destroy']);

Route::post('/pos-transactions', [PosTransactionsController::class, 'store']);


//login simple
Route::post('/login', function (Request $request) {
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
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