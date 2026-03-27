import React from "react";
import { useProducts } from "../../contexts/ProductContext";
import StaffPage from "./StaffPage";

function StaffPremadePage() {
  const { premades } = useProducts();

  const available = premades.filter((p) => p.isAvailable);
  const premadeCategories = available.reduce((groups, premade) => {
    const categoryName = (premade.category || "Uncategorized").trim() || "Uncategorized";
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }

    groups[categoryName].push({
      ...premade,
      productSource: "premade",
    });

    return groups;
  }, {});

  return <StaffPage customCategories={premadeCategories} />;
}

export default StaffPremadePage;
