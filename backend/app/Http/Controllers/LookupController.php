<?php

namespace App\Http\Controllers;

use App\Support\LookupCatalog;

class LookupController extends Controller
{
    public function index()
    {
        return response()->json(LookupCatalog::fullCatalog());
    }
}
