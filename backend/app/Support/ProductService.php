<?php

namespace App\Support;

use App\Models\CustomProduct;
use App\Models\PremadeProduct;
use App\Models\Products;
use Illuminate\Database\Eloquent\Model;

class ProductService
{
    protected const ACTIVE_CATALOG_SOURCES = ['custom', 'premade'];

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
        if ($productName !== null && trim($productName) !== '') {
            $catalog = Products::query()
                ->whereIn('product_source', self::ACTIVE_CATALOG_SOURCES)
                ->where('name', $productName)
                ->first();

            if ($catalog) {
                return $catalog->id;
            }
        }

        if ($productId !== null) {
            $catalog = Products::query()
                ->whereIn('product_source', self::ACTIVE_CATALOG_SOURCES)
                ->where('source_product_id', $productId)
                ->first();

            if ($catalog) {
                return $catalog->id;
            }

            $catalog = Products::query()
                ->whereIn('product_source', self::ACTIVE_CATALOG_SOURCES)
                ->find($productId);

            if ($catalog) {
                return $catalog->id;
            }
        }

        return null;
    }

    protected static function syncSourceProduct(Model $product): Products
    {
        $source = self::resolveSourceMetadata($product);

        $catalog = Products::updateOrCreate(
            [
                'product_source' => $source['product_source'],
                'source_product_id' => $source['source_product_id'],
            ],
            [
                'name'        => $product->name,
                'description' => $product->description,
                'category'    => $product->category,
                'type'        => $product->type ?? null,
                'price'       => $product->price,
                'image'       => $product->image,
                'isAvailable' => (bool) $product->isAvailable,
                'isArchived'  => (bool) $product->isArchived,
            ]
        );

        if (isset($product->product_id) && $product->product_id !== $catalog->id) {
            $product->forceFill(['product_id' => $catalog->id])->saveQuietly();
        }

        return $catalog;
    }

    protected static function resolveSourceMetadata(Model $product): array
    {
        if ($product instanceof CustomProduct) {
            return [
                'product_source' => 'custom',
                'source_product_id' => $product->id,
            ];
        }

        if ($product instanceof PremadeProduct) {
            return [
                'product_source' => 'premade',
                'source_product_id' => $product->id,
            ];
        }

        throw new \InvalidArgumentException('Unsupported source product model.');
    }
}
