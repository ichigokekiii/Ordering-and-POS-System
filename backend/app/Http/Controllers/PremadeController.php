<?php

namespace App\Http\Controllers;


use App\Models\PremadeProduct;
use Illuminate\Http\Request;

class PremadeController extends Controller
{
    // GET /api/premade
    public function index()
    {
        return PremadeProduct::all();
    }

    // POST /api/premade
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'image' => 'required',
            'description' => 'sometimes|required',
            'price' => 'required|numeric',
            'isAvailable' => 'required|boolean'
        ]);

        $premade = PremadeProduct::create($request->all());

        return response()->json($premade, 201);
    }

    // PUT /api/premade/{id}
    public function update(Request $request, $id)
    {
         $request->validate([
            'name' => 'sometimes|required',
            'description' => 'sometimes|required',
            'image' => 'sometimes|required',
            'price' => 'sometimes|required|numeric',
            'isAvailable' => 'sometimes|required|boolean', 
        ]);

        $premade = PremadeProduct::findOrFail($id);
        $premade->update($request->all());

        return response()->json($premade);
    }

    // DELETE /api/premade/{id}
    public function destroy($id)
    {
        PremadeProduct::destroy($id);

        return response()->json([
            'message' => 'Premade deleted'
        ]);
    }
}
