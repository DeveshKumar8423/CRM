/**
 * Shared CSV export — UTF-8 BOM + CRLF for Excel / Google Sheets compatibility.
 */
export function exportCsv(filename, headers, rows, headerRows = []) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [];
  headerRows.forEach((row) => lines.push(row.map(escape).join(",")));
  if (headers?.length) lines.push(headers.map(escape).join(","));
  lines.push(...rows.map((r) => (Array.isArray(r) ? r : [r]).map(escape).join(",")));
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportFilename(prefix, suffix = "") {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = suffix.replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug ? `${prefix}-${slug}-${stamp}.csv` : `${prefix}-${stamp}.csv`;
}

export function standardHeaderRows(title, meta = []) {
  const rows = [
    ["BlackPapers CRM"],
    [title],
    [`Exported on: ${new Date().toLocaleString("en-IN")}`],
  ];
  meta.filter(Boolean).forEach((line) => rows.push([line]));
  rows.push([]);
  return rows;
}
