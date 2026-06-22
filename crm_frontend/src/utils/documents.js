export const MODULE_ROUTES = {
  leads: "/leads",
  deals: "/deals",
  contacts: "/contacts",
  invoices: "/invoices",
  quotations: "/quotations",
  sales_orders: "/sales-orders",
  expenses: "/expenses",
  vendor_bills: "/vendor-bills",
  projects: "/projects",
};

export const PANEL_DEFAULT_CATEGORY = {
  leads: "client_documents",
  deals: "contracts",
  contacts: "client_documents",
  invoices: "invoices",
  quotations: "client_documents",
  sales_orders: "invoices",
  expenses: "receipts",
  vendor_bills: "receipts",
  projects: "client_documents",
};

export const RECORD_SEARCH_ENTITIES = [
  { key: "contacts", label: "Contact", endpoint: "/contacts", labelField: "name" },
  { key: "deals", label: "Deal", endpoint: "/deals", labelField: "title" },
  { key: "leads", label: "Lead", endpoint: "/leads", labelField: "name" },
  { key: "invoices", label: "Invoice", endpoint: "/invoices", labelField: "invoice_number" },
  { key: "quotations", label: "Quotation", endpoint: "/quotations", labelField: "quotation_number" },
  { key: "sales_orders", label: "Sales Order", endpoint: "/sales-orders", labelField: "order_number" },
  { key: "expenses", label: "Expense", endpoint: "/expenses", labelField: "title" },
  { key: "vendor_bills", label: "Vendor Bill", endpoint: "/vendor-bills", labelField: "bill_number" },
  { key: "projects", label: "Project", endpoint: "/projects", labelField: "name" },
];

export function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getFileIcon(type) {
  if (!type) return "📁";
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return "📊";
  if (type.includes("word") || type.includes("officedocument")) return "📝";
  return "📁";
}

export function getCategoryLabel(category, meta) {
  if (!category) return "—";
  const found = (meta?.categories || []).find((c) => c.value === category);
  return found?.label || category.replace(/_/g, " ");
}

export function getRecordRoute(module, recordId) {
  if (!module || !recordId) return null;
  const base = MODULE_ROUTES[module];
  return base ? `${base}/${recordId}` : null;
}

export function getRecordLabel(file) {
  if (!file?.related_module || !file?.related_record_id) return null;
  const mod = file.related_module_label || file.related_module;
  return `${mod} #${file.related_record_id}`;
}

export async function downloadFile(file, API_URL, token) {
  const response = await fetch(`${API_URL}/files/${file.id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Download failed or permission denied.");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", file.original_filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  URL.revokeObjectURL(url);
}
