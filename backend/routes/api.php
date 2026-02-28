<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PremadeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PosTransactionsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;

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

//schedules api routes
Route::get('/schedules', [ScheduleController::class, 'index']);
Route::post('/schedules', [ScheduleController::class, 'store']);
Route::put('/schedules/{id}', [ScheduleController::class, 'update']);
Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);

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

//order api routes
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/user/{user_id}', [OrderController::class, 'userOrders']);
Route::post('/orders', [OrderController::class, 'store']);
Route::put('/orders/{id}', [OrderController::class, 'update']);

//pos api routes
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

//verify otp
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

//logout simple
Route::post('/logout', function () {
    // Logout the user
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
});

Route::post('/register', [UserController::class, 'register']);