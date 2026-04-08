<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$this->canAccessLogs($request)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = min(max((int) $request->integer('per_page', 20), 1), 100);
        $logs = $this->filteredLogs($request)->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'filter_options' => [
                'types' => Log::query()
                    ->select('module')
                    ->distinct()
                    ->whereNotNull('module')
                    ->orderBy('module')
                    ->pluck('module'),
                'users' => User::query()
                    ->whereIn('role', ['admin', 'owner', 'staff', 'user', 'customer'])
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name', 'email', 'role'])
                    ->map(fn (User $user) => [
                        'id' => $user->id,
                        'name' => trim($user->first_name . ' ' . $user->last_name) ?: $user->email,
                        'role' => $user->role,
                    ]),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        if (!$this->canAccessLogs($request)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $logs = $this->filteredLogs($request)->limit(1000)->get();
        $filename = 'logs-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Date & Time',
                'User',
                'Role',
                'Event',
                'Module',
                'Source',
            ]);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    optional($log->created_at)->toDateTimeString(),
                    $log->user_name,
                    $log->user_role,
                    $log->event,
                    $log->module,
                    $log->source,
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    protected function canAccessLogs(Request $request): bool
    {
        $user = $request->user();

        return $user && in_array($user->role, ['admin', 'owner', 'staff'], true);
    }

    protected function filteredLogs(Request $request)
    {
        return Log::query()
            ->with('user:id,first_name,last_name,email,role')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search')->value());

                $query->where(function ($inner) use ($search) {
                    $inner->where('event', 'like', '%' . $search . '%')
                        ->orWhere('module', 'like', '%' . $search . '%')
                        ->orWhere('user_name', 'like', '%' . $search . '%');
                });
            })
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('type'), fn ($query) => $query->where('module', $request->string('type')->value()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('date_to')))
            ->latest('created_at');
    }
}
