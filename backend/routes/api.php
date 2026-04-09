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
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PosTransactionsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\OrderCancellationController;
use App\Http\Controllers\FeedbackController;

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

//feedback routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feedbacks', [FeedbackController::class, 'index']);
    Route::post('/feedbacks', [FeedbackController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin.dashboard'])->group(function () {
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::post('/analytics/email', [AnalyticsController::class, 'sendReportEmail']);
    Route::get('/logs', [LogController::class, 'index']);
    Route::get('/logs/export', [LogController::class, 'export']);
});

// Product & Premade routes (Public so customers can see menu)
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::apiResource('premades', PremadeController::class)->only(['index', 'show']);

// Schedule routes
Route::apiResource('schedules', ScheduleController::class)->only(['index', 'show']);
Route::post('/schedules/{id}/book', [ScheduleController::class, 'book']);

// Public CMS read routes
Route::get('/contents', [ContentController::class, 'index']);
Route::get('/contents/{id}', [ContentController::class, 'show']);

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Customers, Staff, Admins, Owners)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'profile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::post('/profile/email-otp', [ProfileController::class, 'requestEmailChangeOtp']);

    // Verify email OTP and update email
    Route::post('/profile/email-verify', [ProfileController::class, 'verifyEmailChangeOtp']);

    // Change password
    Route::post('/profile/password', [ProfileController::class, 'changePassword']);

    // Request password change OTP
    Route::post('/profile/password-otp', [ProfileController::class, 'requestPasswordChangeOtp']);

    // Verify password OTP and change password
    Route::post('/profile/password-verify', [ProfileController::class, 'verifyPasswordChangeOtp']);

    // Delete account
    Route::delete('/profile', [ProfileController::class, 'deleteAccount']);

    // Customers must be authenticated to place orders
    Route::post('/orders', [OrderController::class, 'store']);

    // Order tracking for logged-in users
    Route::get('/orders/user/{user_id}', [OrderController::class, 'userOrders']);
    Route::post('/order-items', [OrderItemController::class, 'store']);
    Route::post('/orders/{orderId}/cancel', [OrderCancellationController::class, 'cancel']);


    // ====================================================================
    // STAFF ADMIN ACCESS
    // Staff can view admin data and update order progress. Other
    // modifying routes stay locked in the admin group below.
    // ====================================================================
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/pos-transactions', [PosTransactionsController::class, 'store']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});


/*
|--------------------------------------------------------------------------
| Admin & Owner Routes (Management & Editing Only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin.owner'])->group(function () {

    // Admin Order Management
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Product & Schedule Management (Create, Update, Delete)
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('premades', PremadeController::class)->except(['index', 'show']);
    Route::apiResource('schedules', ScheduleController::class)->except(['index', 'show']);
    Route::post('/contents', [ContentController::class, 'store']);
    Route::put('/contents/{id}', [ContentController::class, 'update']);
    Route::patch('/contents/{id}', [ContentController::class, 'update']);
    Route::delete('/contents/{id}', [ContentController::class, 'destroy']);
    Route::delete('/contents/archived/{id}', [ContentController::class, 'destroyArchived']);

    // Restricted Admin-Only Actions
    Route::middleware('admin.only')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // OTP endpoints for admin user management
        Route::post('/users/{id}/email-otp', [UserController::class, 'sendEmailOtp']);
        Route::post('/users/{id}/password-otp', [UserController::class, 'sendPasswordOtp']);
    });
});
