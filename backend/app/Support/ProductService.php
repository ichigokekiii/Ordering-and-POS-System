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
        return self::syncSourceProduct($product, 'custom');
    }

    public static function syncPremadeProduct(PremadeProduct $product): Products
    {
        return self::syncSourceProduct($product, 'premade');
    }

    public static function resolveCatalogId(
        ?int $productId,
        ?string $productName = null,
        ?int $customId = null,
        ?int $premadeId = null
    ): ?int {
        if ($customId !== null) {
            return self::catalogIdForSource('custom', $productId);
        }

        if ($premadeId !== null) {
            return self::catalogIdForSource('premade', $productId);
        }

        if ($productId !== null) {
            foreach (['custom', 'premade'] as $sourceType) {
                $catalogId = self::catalogIdForSource($sourceType, $productId);
                if ($catalogId !== null) {
                    return $catalogId;
                }
            }
        }

        if ($productName !== null && trim($productName) !== '') {
            $catalog = Products::query()
                ->whereIn('product_source', ['custom', 'premade'])
                ->where('name', $productName)
                ->orderByRaw("CASE product_source WHEN 'custom' THEN 0 WHEN 'premade' THEN 1 ELSE 2 END")
                ->first();

            return $catalog?->id;
        }

        return null;
    }

    protected static function syncSourceProduct(Model $product, string $sourceType): Products
    {
        $catalog = Products::query()->updateOrCreate(
            [
                'product_source' => $sourceType,
                'source_product_id' => $product->getKey(),
            ],
            [
                'name' => $product->name,
                'description' => $product->description,
                'category' => $product->category,
                'type' => $product->type,
                'price' => $product->price,
                'image' => $product->image,
                'isAvailable' => (bool) $product->isAvailable,
            ]
        );

        if ($product->product_id !== $catalog->id) {
            $product->forceFill(['product_id' => $catalog->id])->saveQuietly();
        }

        return $catalog;
    }

    protected static function catalogIdForSource(string $sourceType, int $sourceId): ?int
    {
        return Products::query()
            ->where('product_source', $sourceType)
            ->where('source_product_id', $sourceId)
            ->value('id');
    }
}
