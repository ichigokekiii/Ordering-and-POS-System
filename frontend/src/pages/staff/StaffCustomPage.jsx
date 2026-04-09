import React from "react";
import StaffPage from "./StaffPage";
import { useProducts } from "../../contexts/ProductContext";

function StaffCustomPage() {
  const { products } = useProducts();

  const available = products.filter((p) => !p.isArchived && p.isAvailable);
  const bouquets = available.filter((p) => p.category === "Bouquets");
  const mainProducts = available.filter(
    (p) => p.category === "Additional" && p.type === "Main Flowers"
  );
  const fillers = available.filter(
    (p) => p.category === "Additional" && p.type === "Fillers"
  );
  const addons = available.filter(
    (p) => p.category === "Additional" && !["Main Flowers", "Fillers"].includes(p.type)
  );

  // CUSTOM CATEGORY MAPPING
  const customCategories = {
    Bouquets: bouquets.map((product) => ({
      ...product,
      builderKind: "promo-bouquet",
      productSource: "product",
    })),
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
    "Add-ons": addons.map((product) => ({
      ...product,
      productSource: "product",
    })),
  };

  return <StaffPage customCategories={customCategories} />;
}

export default StaffCustomPage;
