export function formatQuoteLongDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11
    ? "st"
    : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
  const month = d.toLocaleDateString("en-IN", { month: "long" });
  const year = d.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

export function buildFormalQuoteTitle(quote) {
  if (!quote) return "Formal Quotation";
  if (quote.title?.toLowerCase().startsWith("formal quotation")) {
    return quote.title;
  }
  const client = quote.client_name || "the client";
  const subject = quote.title || "our services";
  return `Formal Quotation for ${client} for ${subject}`;
}

export function parseTextList(text) {
  if (!text?.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^[\d]+[\).]\s*/, "").replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);
}

export function splitParagraphs(text) {
  if (!text?.trim()) return [];
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

export function formatInvestmentAmount(value, currency = "INR") {
  if (value == null) return "—";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted}/-`;
}

export function parseFooterLines(text) {
  if (!text?.trim()) return [];
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function linkifyFooterLine(line) {
  const emailMatch = line.match(/^Email:\s*(.+)$/i);
  if (emailMatch) {
    const email = emailMatch[1].trim();
    return { label: "Email", href: `mailto:${email}`, text: email };
  }
  const urlMatch = line.match(/^(Website|Instagram|LinkedIn):\s*(.+)$/i);
  if (urlMatch) {
    const label = urlMatch[1];
    let href = urlMatch[2].trim();
    if (!href.startsWith("http")) href = `https://${href}`;
    return { label, href, text: urlMatch[2].trim() };
  }
  if (line.startsWith("http")) {
    return { label: null, href: line, text: line };
  }
  return { label: null, href: null, text: line };
}

export function chunkWhyChoose(items) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}
