<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Throwable;

abstract class Controller
{
    protected function serverErrorResponse(string $message, Throwable $exception): JsonResponse
    {
        report($exception);

        return response()->json([
            'message' => $message,
        ], 500);
    }
}
