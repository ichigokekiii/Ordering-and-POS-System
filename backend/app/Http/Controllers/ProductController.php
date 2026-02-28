<?php

namespace App\Http\Controllers;

use App\Models\CustomProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        ]);

        $imagePath = $request->file('image')->store('products', 'public');

        $product = CustomProduct::create([
            'name'        => $request->name,
            'image'       => Storage::url($imagePath),
            'description' => $request->description,
            'category'    => $request->category,
            'type'        => $request->type,
            'price'       => $request->price,
            'isAvailable' => $request->isAvailable,
        ]);

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
        ]);

        $product = CustomProduct::findOrFail($id);
        $data = $request->only(['name', 'description', 'price', 'category', 'type', 'isAvailable']);

        if ($request->hasFile('image')) {
            $oldPath = str_replace('/storage/', 'public/', $product->image);
            Storage::delete($oldPath);

            $imagePath = $request->file('image')->store('products', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $product->update($data);

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