<?php

namespace App\Http\Controllers;

use App\Models\PremadeProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Support\AdminImageUpload;
use App\Support\ProductService;

class PremadeController extends Controller
{
    private function canViewAll(Request $request): bool
    {
        $user = $request->user();

        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    public function index(Request $request)
    {
        return PremadeProduct::query()
            ->when(
                !$this->canViewAll($request),
                fn ($query) => $query->where('isArchived', false)->where('isAvailable', true)
            )
            ->get();
    }

    public function show(Request $request, $id)
    {
        return PremadeProduct::query()
            ->when(
                !$this->canViewAll($request),
                fn ($query) => $query->where('isArchived', false)->where('isAvailable', true)
            )
            ->findOrFail($id);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'image'       => 'required|image|mimes:jpg,jpeg,png|max:' . AdminImageUpload::maxKilobytes(),
            'description' => 'sometimes|required|string',
            'category'    => 'nullable|string',
            'type'        => 'nullable|string',
            'price'       => 'required|numeric',
            'isAvailable' => 'required|boolean',
            'isArchived'  => 'sometimes|boolean',
        ], AdminImageUpload::validationMessages());

        // Store file in storage/app/public/premades
        $imagePath = $request->file('image')->store('premades', 'public');

        $premade = DB::transaction(function () use ($request, $imagePath) {
            $premade = PremadeProduct::create([
                'name'        => $request->name,
                'image'       => Storage::url($imagePath), // returns /storage/premades/filename.jpg
                'description' => $request->description,
                'category'    => $request->category,
                'type'        => $request->type,
                'price'       => $request->price,
                'isAvailable' => $request->boolean('isAvailable'),
                'isArchived'  => $request->boolean('isArchived'),
            ]);

            ProductService::syncPremadeProduct($premade);

            return $premade->fresh();
        });

        return response()->json($premade, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'        => 'sometimes|required|string',
            'image'       => 'sometimes|image|mimes:jpg,jpeg,png|max:' . AdminImageUpload::maxKilobytes(),
            'description' => 'sometimes|required|string',
            'category'    => 'sometimes|nullable|string',
            'type'        => 'sometimes|nullable|string',
            'price'       => 'sometimes|required|numeric',
            'isAvailable' => 'sometimes|required|boolean',
            'isArchived'  => 'sometimes|required|boolean',
        ], AdminImageUpload::validationMessages());

        $premade = PremadeProduct::findOrFail($id);

        $data = $request->only(['name', 'description', 'category', 'type', 'price']);

        if ($request->has('isAvailable')) {
            $data['isAvailable'] = $request->boolean('isAvailable');
        }

        if ($request->has('isArchived')) {
            $data['isArchived'] = $request->boolean('isArchived');
        }

        if ($request->hasFile('image')) {
            // Delete old image from storage
            $oldPath = str_replace('/storage/', 'public/', $premade->image);
            Storage::delete($oldPath);

            // Store new image
            $imagePath = $request->file('image')->store('premades', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $premade->update($data);
        ProductService::syncPremadeProduct($premade->fresh());

        return response()->json($premade->fresh());
    }

    public function destroy($id)
    {
        $premade = PremadeProduct::findOrFail($id);

        // Delete the image file too
        $oldPath = str_replace('/storage/', 'public/', $premade->image);
        Storage::delete($oldPath);

        $premade->delete();

        return response()->json(['message' => 'Premade deleted']);
    }
}
