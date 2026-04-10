<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\MessageBag;
use Throwable;

abstract class Controller
{
    protected function validationErrorResponse(array|MessageBag $errors, string $message = 'The given data was invalid.'): JsonResponse
    {
        $normalizedErrors = $errors instanceof MessageBag
            ? $errors->toArray()
            : $errors;

        return response()->json([
            'message' => $message,
            'errors' => $normalizedErrors,
        ], 422);
    }

    protected function fieldErrorResponse(string $field, string $message, int $status = 422): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => [
                $field => [$message],
            ],
        ], $status);
    }

    protected function serverErrorResponse(string $message, Throwable $exception): JsonResponse
    {
        report($exception);

        return response()->json([
            'message' => $message,
        ], 500);
    }
}
