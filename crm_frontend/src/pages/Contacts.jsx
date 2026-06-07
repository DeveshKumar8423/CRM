import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const CONTACT_TYPES = ["Customer", "Vendor", "Partner", "Other"];

function Contacts() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [contactType, setContactType] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");

  const loadContacts = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    if (contactType) params.set("contact_type", contactType);

    apiFetch(`/contacts?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadContacts(1);
  }, [contactType, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadContacts(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Contacts" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-contacts-toolbar">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search name, org, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">
              Search
            </button>
          </form>

          <div className="crm-filters">
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <option value="">All types</option>
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All status</option>
            </select>
          </div>

          {hasPermission("contacts.create") && (
            <Link to="/contacts/new" className="crm-btn crm-btn-sm crm-btn-inline">
              + New contact
            </Link>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Assigned to</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="crm-muted">
                    No contacts found.
                  </td>
                </tr>
              )}
              {data.items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.email && (
                      <>
                        <br />
                        <span className="crm-muted">{c.email}</span>
                      </>
                    )}
                  </td>
                  <td>{c.organization_name || "—"}</td>
                  <td>
                    <span className={`crm-badge crm-badge-type-${c.contact_type.toLowerCase()}`}>
                      {c.contact_type}
                    </span>
                  </td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.assigned_to_name || "—"}</td>
                  <td>
                    <span
                      className={
                        c.status === "active"
                          ? "crm-badge crm-badge-active"
                          : "crm-badge crm-badge-inactive"
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/contacts/${c.id}`} className="crm-nav-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button
              type="button"
              className="crm-btn crm-btn-outline crm-btn-sm"
              disabled={data.page <= 1}
              onClick={() => loadContacts(data.page - 1)}
            >
              Previous
            </button>
            <span className="crm-muted">
              Page {data.page} of {totalPages}
            </span>
            <button
              type="button"
              className="crm-btn crm-btn-outline crm-btn-sm"
              disabled={data.page >= totalPages}
              onClick={() => loadContacts(data.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Contacts;
