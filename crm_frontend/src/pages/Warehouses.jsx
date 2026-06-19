import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  LOCATION_STATUS_LABELS,
  LOCATION_TYPE_LABELS,
  exportCsv,
  formatCurrency,
  locationStatusBadgeClass,
  locationTypeBadgeClass,
} from "../utils/warehouses";

function Warehouses() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, summary: {} });
  const [stats, setStats] = useState(null);
  const [locationTypes, setLocationTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    location_code: "",
    name: "",
    location_type: "branch",
    parent_id: "",
    status: "active",
    address: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      apiFetch("/warehouses/location-types"),
      apiFetch("/warehouses/location-statuses"),
      apiFetch("/warehouses/stats/summary"),
    ]).then(([types, sts, st]) => {
      setLocationTypes(types);
      setStatuses(sts);
      setStats(st);
    }).catch(() => {});
  }, []);

  const load = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (locationType) params.set("location_type", locationType);
    if (status) params.set("status", status);
    apiFetch(`/warehouses/locations?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [locationType, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/warehouses/locations", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          parent_id: form.parent_id ? Number(form.parent_id) : null,
        }),
      });
      setShowForm(false);
      setForm({ location_code: "", name: "", location_type: "branch", parent_id: "", status: "active", address: "", notes: "" });
      load();
      apiFetch("/warehouses/stats/summary").then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    if (!hasPermission("warehouses.export")) return;
    exportCsv(
      `warehouse-locations-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Code", "Name", "Type", "Branch", "Warehouse", "Status", "SKUs", "On Hand", "Value"],
      data.items.map((l) => [
        l.location_code,
        l.name,
        LOCATION_TYPE_LABELS[l.location_type],
        l.branch_name || "",
        l.warehouse_name || "",
        LOCATION_STATUS_LABELS[l.status],
        l.sku_count,
        l.total_on_hand,
        l.total_stock_value,
      ]),
    );
  };

  const parentOptions = data.items.filter((l) => l.location_type !== "bin");

  return (
    <DashboardLayout title="Warehouses" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} location{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/warehouses/stock" className="crm-btn crm-btn-sm crm-btn-outline">Stock by location</Link>
            <Link to="/warehouses/transfers" className="crm-btn crm-btn-sm crm-btn-outline">Transfer history</Link>
            {hasPermission("warehouses.transfer") && (
              <Link to="/warehouses/transfer" className="crm-btn crm-btn-sm crm-btn-outline">Transfer stock</Link>
            )}
            {hasPermission("warehouses.record_receipt") && (
              <Link to="/warehouses/record-movement" className="crm-btn crm-btn-sm crm-btn-inline">Record movement</Link>
            )}
            {hasPermission("warehouses.manage_locations") && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowForm(true)}>Add location</button>
            )}
            {hasPermission("warehouses.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export</button>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Total stock value</p><p className="crm-stat-value">{formatCurrency(stats.total_stock_value)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Active warehouses</p><p className="crm-stat-value">{stats.active_warehouses}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Locations with stock</p><p className="crm-stat-value">{stats.locations_with_stock}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Low-stock locations</p><p className="crm-stat-value">{stats.low_stock_locations}</p></div>
          </div>
        )}

        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSearch} className="crm-filter-row crm-mt">
          <input placeholder="Search name or code" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
            <option value="">All types</option>
            {locationTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="submit" className="crm-btn crm-btn-sm">Search</button>
        </form>

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Location</th><th>Type</th><th>Branch</th><th>Warehouse</th><th>Status</th>
                <th className="crm-num">SKUs</th><th className="crm-num">On hand</th><th className="crm-num">Value</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={9} className="crm-muted">No locations yet. Add a branch or warehouse to get started.</td></tr>}
              {data.items.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div><strong>{l.name}</strong></div>
                    <span className="crm-muted">{l.location_code}</span>
                  </td>
                  <td><span className={locationTypeBadgeClass(l.location_type)}>{LOCATION_TYPE_LABELS[l.location_type]}</span></td>
                  <td>{l.branch_name || "—"}</td>
                  <td>{l.warehouse_name || "—"}</td>
                  <td><span className={locationStatusBadgeClass(l.status)}>{LOCATION_STATUS_LABELS[l.status]}</span></td>
                  <td className="crm-num">{l.sku_count}</td>
                  <td className="crm-num">{l.total_on_hand}</td>
                  <td className="crm-num">{formatCurrency(l.total_stock_value)}</td>
                  <td><Link to={`/warehouses/locations/${l.id}`} className="crm-nav-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="crm-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add location</h3>
            <form onSubmit={handleCreate} className="crm-form crm-mt">
              <div className="crm-form-grid">
                <div><label>Code *</label><input value={form.location_code} onChange={(e) => setForm((f) => ({ ...f, location_code: e.target.value }))} required /></div>
                <div><label>Name *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
                <div>
                  <label>Type *</label>
                  <select value={form.location_type} onChange={(e) => setForm((f) => ({ ...f, location_type: e.target.value, parent_id: e.target.value === "branch" ? "" : f.parent_id }))}>
                    {locationTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {form.location_type !== "branch" && (
                  <div>
                    <label>Parent *</label>
                    <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))} required>
                      <option value="">Select parent</option>
                      {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.path || p.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="crm-span-2"><label>Address</label><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
                <div className="crm-span-2"><label>Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div className="crm-inline-actions crm-mt">
                <button type="button" className="crm-btn crm-btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="crm-btn crm-btn-inline">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Warehouses;
