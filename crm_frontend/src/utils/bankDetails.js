const BANK_LABEL_SPLIT =
  /\s*(?=(?:Bank [Nn]ame|Account [Hh]older|Branch|IFSC|Account [Tt]ype|Account [Nn]umber|A\/c [Nn]o\.?|UPI(?:\s+ID)?)\s*:)/g;

function parseLine(line) {
  const idx = line.indexOf(":");
  if (idx === -1) return { label: line, value: "" };
  return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
}

export function parseBankInstructions(text) {
  if (!text?.trim()) return [];

  const normalized = text.trim().replace(/\r\n/g, "\n");
  const lines = normalized.includes("\n")
    ? normalized.split("\n").map((line) => line.trim()).filter(Boolean)
    : normalized.split(BANK_LABEL_SPLIT).map((line) => line.trim()).filter(Boolean);

  return lines.map(parseLine).filter((row) => row.label);
}
