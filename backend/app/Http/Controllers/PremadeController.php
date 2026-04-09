<?php

namespace App\Http\Controllers;

use App\Models\PremadeProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Support\ProductService;

class PremadeController extends Controller
{
    public function index()
    {
        return PremadeProduct::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'image'       => 'required|image|mimes:jpg,jpeg,png,gif|max:5120',
            'description' => 'sometimes|required|string',
            'category'    => 'nullable|string',
            'type'        => 'nullable|string',
            'price'       => 'required|numeric',
            'isAvailable' => 'required|boolean',
            'isArchived'  => 'sometimes|boolean',
        ], [
            'image.mimes' => 'Only JPG, JPEG, PNG, and GIF files are allowed.',
            'image.max' => 'Image must be 5MB or smaller.',
        ]);

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
            'image'       => 'sometimes|image|mimes:jpg,jpeg,png,gif|max:5120',
            'description' => 'sometimes|required|string',
            'category'    => 'sometimes|nullable|string',
            'type'        => 'sometimes|nullable|string',
            'price'       => 'sometimes|required|numeric',
            'isAvailable' => 'sometimes|required|boolean',
            'isArchived'  => 'sometimes|required|boolean',
        ], [
            'image.mimes' => 'Only JPG, JPEG, PNG, and GIF files are allowed.',
            'image.max' => 'Image must be 5MB or smaller.',
        ]);

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
