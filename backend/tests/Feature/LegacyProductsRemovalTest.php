<?php

namespace Tests\Feature;

use App\Models\Products;
use App\Support\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyProductsRemovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_resolution_uses_only_active_product_sources(): void
    {
        $custom = Products::create([
            'product_source' => 'custom',
            'source_product_id' => 12,
            'name' => 'Custom Bloom',
            'description' => 'Custom',
            'category' => 'Bouquets',
            'type' => 'custom',
            'price' => 100,
            'image' => null,
            'isAvailable' => true,
        ]);

        $premade = Products::create([
            'product_source' => 'premade',
            'source_product_id' => 22,
            'name' => 'Premade Bloom',
            'description' => 'Premade',
            'category' => 'Bundles',
            'type' => 'premade',
            'price' => 200,
            'image' => null,
            'isAvailable' => true,
        ]);

        $legacy = Products::create([
            'product_source' => 'legacy',
            'source_product_id' => 32,
            'name' => 'Legacy Bloom',
            'description' => 'Legacy',
            'category' => 'Old',
            'type' => 'legacy',
            'price' => 300,
            'image' => null,
            'isAvailable' => true,
        ]);

        $this->assertSame($custom->id, ProductService::resolveCatalogId(12, 'Custom Bloom'));
        $this->assertSame($premade->id, ProductService::resolveCatalogId(22, 'Premade Bloom'));
        $this->assertNull(ProductService::resolveCatalogId(32, 'Legacy Bloom'));
        $this->assertNull(ProductService::resolveCatalogId(null, 'Legacy Bloom'));
    }
}
