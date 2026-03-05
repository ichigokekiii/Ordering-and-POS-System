<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\PremadeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PosTransactionsController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/test', function () {
    return response()->json(['message' => 'API works in Laravel 11']);
});

Route::get('/landing', function () {
    return response()->json([
        'title' => 'Landing Page JSON Test',
        'subtitle' => 'Laravel API is Connected',
    ]);
});

// Auth & Onboarding
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Resources
Route::apiResource('products', ProductController::class);
Route::apiResource('premades', PremadeController::class);
Route::apiResource('schedules', ScheduleController::class);
Route::post('/schedules/{id}/book', [ScheduleController::class, 'book']);


/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Customers & Staff)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile Management (Fixed 404 issue)
    Route::get('/profile', function (Request $request) {
        return $request->user();
    });
    
    // Update Profile and Account Actions
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::delete('/profile', [UserController::class, 'deleteAccount']);
    Route::post('/profile/email-otp', [UserController::class, 'requestEmailChangeOtp']);

    // Order Tracking for Customers
    Route::get('/orders/user/{user_id}', [OrderController::class, 'userOrders']);
    Route::apiResource('orders', OrderController::class);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});


/*
|--------------------------------------------------------------------------
| Admin & Owner Routes (Management Only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin.owner'])->group(function () {

    // Transaction & Analytics
    Route::post('/pos-transactions', [PosTransactionsController::class, 'store']);
    Route::get('/pos-transactions/analytics', [PosTransactionsController::class, 'analytics']);

    // General User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Restricted Admin-Only Actions
    Route::middleware('admin.only')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});