import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function Products() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/products/categories").then(setCategories).catch(() => {});
  }, []);

  const loadProducts = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (search.trim()) params.set("search", search.trim());

    apiFetch(`/products?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadProducts(1);
  }, [category, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Products & Services" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-contacts-toolbar">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search service name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All status</option>
            </select>
          </div>
          {hasPermission("products.create") && (
            <Link to="/products/new" className="crm-btn crm-btn-sm crm-btn-inline">
              + New service
            </Link>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Code</th>
                <th>Category</th>
                <th>Offer price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr><td colSpan={6} className="crm-muted">No services found.</td></tr>
              )}
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.entity_type && (
                      <><br /><span className="crm-muted">{p.entity_type}</span></>
                    )}
                  </td>
                  <td>{p.service_code || "—"}</td>
                  <td>{p.category || "—"}</td>
                  <td>{p.offer_price != null ? `₹${p.offer_price}` : "—"}</td>
                  <td>
                    <span className={p.status === "active" ? "crm-badge crm-badge-active" : "crm-badge crm-badge-inactive"}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/products/${p.id}`} className="crm-nav-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadProducts(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadProducts(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Products;
