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

//schedule email route
Route::post('/schedules/{id}/book', [ScheduleController::class, 'book']);

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

//verify otp
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::post('/register', [UserController::class, 'register']);

// ================= ADMIN ROUTES =================
Route::middleware(['auth:sanctum', 'admin.owner'])->group(function () {

    // Admin & Owner can VIEW users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Only Admin can MODIFY users
    Route::middleware('admin.only')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

});