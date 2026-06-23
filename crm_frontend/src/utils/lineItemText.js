export function productLineSummary(product) {
  if (!product) return "";
  if (product.sub_category) return product.sub_category;
  if (product.category) return product.category;
  const desc = (product.description || "").trim();
  if (desc && desc.length <= 80) return desc;
  return "";
}

export function parseNumberedList(text) {
  if (!text?.trim()) return [];
  const parts = text.trim().split(/\s*(?=\d+[\).]\s*)/).map((part) => part.trim()).filter(Boolean);
  return parts
    .map((part) => part.replace(/^\d+[\).]\s*/, "").trim())
    .filter(Boolean);
}

export function linesForDisplay(itemName, description, { maxItems = 4, maxChars = 100 } = {}) {
  const desc = (description || "").trim();
  if (!desc || desc === (itemName || "").trim()) return [];

  const numbered = parseNumberedList(desc);
  if (numbered.length > 1) {
    return numbered.slice(0, maxItems);
  }

  if (desc.length > maxChars) return [];
  return [desc];
}
