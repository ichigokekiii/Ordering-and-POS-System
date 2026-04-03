<?php

namespace App\Http\Controllers;

use App\Models\CustomProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Support\ProductService;

class ProductController extends Controller
{
    public function index()
    {
        return CustomProduct::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'image'       => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description' => 'required|string',
            'category'    => 'required|string',
            'type'        => 'nullable|string',
            'price'       => 'required|numeric',
            'isAvailable' => 'required|boolean',
            'required_main_count' => 'nullable|integer|min:0',
            'required_filler_count' => 'nullable|integer|min:0',
        ]);

        if ($request->input('category') === 'Bouquets') {
            $request->validate([
                'required_main_count' => 'required|integer|min:0',
                'required_filler_count' => 'required|integer|min:0',
            ]);
        }

        $imagePath = $request->file('image')->store('products', 'public');

        $product = DB::transaction(function () use ($request, $imagePath) {
            $isBouquet = $request->input('category') === 'Bouquets';
            $product = CustomProduct::create([
                'name'        => $request->name,
                'image'       => Storage::url($imagePath),
                'description' => $request->description,
                'category'    => $request->category,
                'type'        => $request->type,
                'price'       => $request->price,
                'isAvailable' => $request->isAvailable,
                'required_main_count' => $isBouquet ? (int) $request->input('required_main_count', 1) : null,
                'required_filler_count' => $isBouquet ? (int) $request->input('required_filler_count', 2) : null,
            ]);

            ProductService::syncCustomProduct($product);

            return $product->fresh();
        });

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'        => 'sometimes|required|string',
            'image'       => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description' => 'sometimes|required|string',
            'category'    => 'sometimes|required|string',
            'type'        => 'nullable|string',
            'price'       => 'sometimes|required|numeric',
            'isAvailable' => 'sometimes|required|boolean',
            'required_main_count' => 'nullable|integer|min:0',
            'required_filler_count' => 'nullable|integer|min:0',
        ]);

        $product = CustomProduct::findOrFail($id);
        $data = $request->only([
            'name',
            'description',
            'price',
            'category',
            'type',
            'isAvailable',
            'required_main_count',
            'required_filler_count',
        ]);

        $resolvedCategory = $request->input('category', $product->category);
        if ($resolvedCategory === 'Bouquets') {
            $request->validate([
                'required_main_count' => 'required|integer|min:0',
                'required_filler_count' => 'required|integer|min:0',
            ]);
        } else {
            $data['required_main_count'] = null;
            $data['required_filler_count'] = null;
        }

        if ($request->hasFile('image')) {
            $oldPath = str_replace('/storage/', 'public/', $product->image);
            Storage::delete($oldPath);

            $imagePath = $request->file('image')->store('products', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $product->update($data);
        ProductService::syncCustomProduct($product->fresh());

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = CustomProduct::findOrFail($id);

        $oldPath = str_replace('/storage/', 'public/', $product->image);
        Storage::delete($oldPath);

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
