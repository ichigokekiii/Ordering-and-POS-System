<?php

namespace App\Support;

use App\Models\CustomProduct;
use App\Models\PremadeProduct;
use App\Models\Products;
use Illuminate\Database\Eloquent\Model;

class ProductService
{
    public static function syncCustomProduct(CustomProduct $product): Products
    {
        return self::syncSourceProduct($product);
    }

    public static function syncPremadeProduct(PremadeProduct $product): Products
    {
        return self::syncSourceProduct($product);
    }

    public static function resolveCatalogId(?int $productId, ?string $productName = null): ?int 
    {
        // 1. If we have a product name, we look it up directly in the catalog
        if ($productName !== null && trim($productName) !== '') {
            $catalog = Products::where('name', $productName)->first();
            
            if ($catalog) {
                return $catalog->id;
            }
        }

        // 2. If we only have an ID and no name, we assume the ID provided 
        // IS the catalog ID, since we no longer track source origins.
        if ($productId !== null) {
            return $productId;
        }

        return null;
    }

    protected static function syncSourceProduct(Model $product): Products
    {
        // SYNC STRICTLY BY PRODUCT NAME (No product_source columns used)
        $catalog = Products::updateOrCreate(
            [
                'name' => $product->name, 
            ],
            [
                'description' => $product->description,
                'category'    => $product->category,
                'type'        => $product->type ?? null,
                'price'       => $product->price,
                'image'       => $product->image,
                'isAvailable' => (bool) $product->isAvailable,
            ]
        );

        // Optional: If your custom/premade tables have a 'product_id' column, update it.
        if (isset($product->product_id) && $product->product_id !== $catalog->id) {
            $product->forceFill(['product_id' => $catalog->id])->saveQuietly();
        }

        return $catalog;
    }
}