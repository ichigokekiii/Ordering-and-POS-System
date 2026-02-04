<?php

namespace App\Http\Controllers;

use App\Models\PremadeProduct;
use App\Models\CustomProduct;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    public function index()
    {
        return Product::all();
    }

    // POST /api/products
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'image' => 'required',
            'price' => 'required|numeric',
            'isAvailable' => 'required|boolean'
        ]);

        $product = Product::create($request->all());

        return response()->json($product, 201);
    }

    // PUT /api/products/{id}
    public function update(Request $request, $id)
    {
         $request->validate([
            'name' => 'sometimes|required',
            'image' => 'sometimes|required',
            'price' => 'sometimes|required|numeric',
            'isAvailable' => 'sometimes|required|boolean', 
        ]);

        $product = Product::findOrFail($id);
        $product->update($request->all());

        return response()->json($product);
    }

    // DELETE /api/products/{id}
    public function destroy($id)
    {
        Product::destroy($id);

        return response()->json([
            'message' => 'Product deleted'
        ]);
    }
}
