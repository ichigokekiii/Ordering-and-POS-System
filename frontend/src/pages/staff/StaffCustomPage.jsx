import React from "react";
import StaffPage from "./StaffPage";
import { useProducts } from "../../contexts/ProductContext";

function StaffCustomPage() {
  const { products } = useProducts();

  const available = products.filter((p) => p.isAvailable);
  const mainProducts = available.filter(
    (p) => p.category === "Bouquets" || (p.category === "Additional" && p.type === "Main Flowers")
  );
  const fillers = available.filter(
    (p) => p.category === "Additional" && p.type === "Fillers"
  );
  const addons = available.filter(
    (p) => p.category === "Additional" && !["Main Flowers", "Fillers"].includes(p.type)
  );
  const lowestMainPrice = mainProducts.reduce((lowest, product) => {
    const productPrice = Number(product.price) || 0;
    if (lowest === null || productPrice < lowest) return productPrice;
    return lowest;
  }, null);

  const promoBouquetItem = {
    id: "promo-bouquet-pos",
    name: "Promo Bouquet",
    description: "Build one promo bouquet from 1 main flower and 2 fillers.",
    price: lowestMainPrice ?? 0,
    priceLabel: lowestMainPrice ? `Starts at ₱${lowestMainPrice.toLocaleString()}` : "Tap to build",
    isAvailable: true,
    builderKind: "promo-bouquet",
    productSource: "promo",
  };

  // CUSTOM CATEGORY MAPPING
  const customCategories = {
    Bouquet: [promoBouquetItem],
    Main: mainProducts.map((product) => ({
      ...product,
      selectionRole: "main",
      productSource: "product",
    })),
    Fillers: fillers.map((product) => ({
      ...product,
      selectionRole: "filler",
      productSource: "product",
    })),
    Addons: addons.map((product) => ({
      ...product,
      productSource: "product",
    })),
  };

  return <StaffPage customCategories={customCategories} />;
}

export default StaffCustomPage;
