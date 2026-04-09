function normalizeSelectionEntry(entry) {
  return {
    name: entry.name,
    quantity: entry.quantity ?? 1,
    price: Number(entry.price) || 0,
    free: Boolean(entry.free),
    type: entry.type || "",
  };
}

export function getCustomOrderSummary(item) {
  if (!item) {
    return null;
  }

  if (item.builderSummary) {
    return {
      bouquet: item.builderSummary.bouquet || null,
      mains: item.builderSummary.mains || [],
      fillers: item.builderSummary.fillers || [],
      addOns: item.builderSummary.addOns || [],
    };
  }

  if (!Array.isArray(item.items) || item.items.length === 0) {
    return null;
  }

  const [bouquetItem, ...rest] = item.items;
  const mains = [];
  const fillers = [];
  const addOns = [];

  rest.forEach((entry) => {
    const normalizedEntry = normalizeSelectionEntry(entry);

    if (normalizedEntry.free) {
      if (normalizedEntry.type === "Fillers") {
        fillers.push(normalizedEntry);
        return;
      }

      mains.push(normalizedEntry);
      return;
    }

    addOns.push(normalizedEntry);
  });

  return {
    bouquet: bouquetItem ? normalizeSelectionEntry(bouquetItem) : null,
    mains,
    fillers,
    addOns,
  };
}

export function formatCustomSelection(entry) {
  if (!entry) {
    return "";
  }

  return `${entry.name} x${entry.quantity ?? 1}`;
}
