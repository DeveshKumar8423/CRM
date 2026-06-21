import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  PERIOD_LABELS,
  buildStatementParams,
  canExportLedger,
  entryBadgeClass,
  exportCsv,
  formatCurrency,
  formatDate,
} from "../utils/customerLedger";

function CustomerLedgerStatement() {
  const { contactId } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [period, setPeriod] = useState("all_time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const canExport = canExportLedger(hasPermission);
  const canCreateInvoice = hasPermission("invoices.create");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const params = buildStatementParams(period, dateFrom, dateTo, page);
    apiFetch(`/customer-ledger/contacts/${contactId}/statement?${params}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [contactId, period, dateFrom, dateTo, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    if (!data || !canExport) return;
    let exportData = data;
    if (data.entries_total > data.entries.length) {
      try {
        const params = buildStatementParams(period, dateFrom, dateTo, 1);
        params.set("per_page", "10000");
        exportData = await apiFetch(`/customer-ledger/contacts/${contactId}/statement?${params}`);
      } catch {
        exportData = data;
      }
    }

    const c = exportData.contact;
    const s = exportData.summary;
    const headerRows = [
      [c.organization_name || c.name],
      [`GSTIN: ${c.gstin || "Not set"}`],
      [`Period: ${exportData.period_label}`],
      [`Opening: ${s.opening_balance}`, `Closing: ${s.closing_balance}`, `Outstanding: ${s.current_outstanding}`],
      [],
    ];
    const rows = exportData.entries.map((e) => [
      formatDate(e.effective_date),
      e.entry_type_label,
      e.reference,
      e.description,
      e.debit_amount || "",
      e.credit_amount || "",
      e.running_balance,
    ]);
    if (exportData.open_invoices?.length) {
      rows.push([], ["Open invoices"], ["Invoice #", "Due", "Grand total", "Paid", "Outstanding", "Status"]);
      exportData.open_invoices.forEach((inv) => {
        rows.push([
          inv.invoice_number,
          formatDate(inv.due_date),
          inv.grand_total,
          inv.amount_paid,
          inv.outstanding_amount,
          inv.status_label,
        ]);
      });
    }

    const slug = (c.name || "customer").replace(/[^\w-]+/g, "-").slice(0, 40);
    exportCsv(
      `customer-ledger-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Type", "Reference", "Description", "Debit", "Credit", "Balance"],
      rows,
      headerRows,
    );

    apiFetch("/customer-ledger/export-log", {
      method: "POST",
      body: JSON.stringify({
        contact_id: Number(contactId),
        period,
        period_label: exportData.period_label,
        row_count: exportData.entries.length,
      }),
    }).catch(() => {});
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.entries_total / data.entries_per_page)) : 1;

  return (
    <DashboardLayout title={data?.contact?.name || "Customer Ledger"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/customer-ledger" className="crm-link crm-link-left">← Customer ledger</Link>
          <div className="crm-inline-actions">
            {canExport && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport} disabled={!data}>
                Export CSV
              </button>
            )}
            <Link to={`/contacts/${contactId}`} className="crm-btn crm-btn-sm crm-btn-outline">View contact</Link>
            {canCreateInvoice && (
              <Link to={`/invoices/new?contact_id=${contactId}`} className="crm-btn crm-btn-sm">Create invoice</Link>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {loading && <p className="crm-muted crm-mt">Loading statement…</p>}

        {!loading && data && (
          <>
            {data.contact.is_vendor && (
              <div className="crm-alert crm-alert-warn crm-mt">
                This contact is a vendor. Customer ledger shows AR activity only; use{" "}
                <Link to="/vendor-bills" className="crm-nav-link">Vendor Bills</Link> for payables.
              </div>
            )}
            {data.contact.missing_gstin && data.summary.current_outstanding > 0 && (
              <div className="crm-alert crm-alert-warn crm-mt">
                Customer GSTIN is not set. Update in{" "}
                <Link to={`/contacts/${contactId}/edit`} className="crm-nav-link">contact settings</Link>.
              </div>
            )}

            <div className="crm-contact-meta crm-mt">
              <p><strong>{data.contact.name}</strong>{data.contact.organization_name && ` · ${data.contact.organization_name}`}</p>
              {data.contact.gstin && <p><strong>GSTIN:</strong> {data.contact.gstin}</p>}
              {data.contact.email && <p><strong>Email:</strong> {data.contact.email}</p>}
              {data.contact.phone && <p><strong>Phone:</strong> {data.contact.phone}</p>}
              <p className="crm-muted">
                {data.period_label}
                {data.date_from && <> · {formatDate(data.date_from)} – {formatDate(data.date_to)}</>}
              </p>
            </div>

            <div className="crm-filters crm-mt">
              <select value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }}>
                {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {period === "custom" && (
                <>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  <button type="button" className="crm-btn crm-btn-sm" onClick={load}>Apply</button>
                </>
              )}
            </div>

            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Opening balance</p><p className="crm-stat-value">{formatCurrency(data.summary.opening_balance, data.contact.currency)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Debits</p><p className="crm-stat-value">{formatCurrency(data.summary.period_debits, data.contact.currency)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Credits</p><p className="crm-stat-value">{formatCurrency(data.summary.period_credits, data.contact.currency)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Closing balance</p><p className="crm-stat-value">{formatCurrency(data.summary.closing_balance, data.contact.currency)}</p></div>
              <div className="crm-stat-card crm-cl-outstanding"><p className="crm-stat-label">Current outstanding</p><p className="crm-stat-value">{formatCurrency(data.summary.current_outstanding, data.contact.currency)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Overdue</p><p className="crm-stat-value">{formatCurrency(data.summary.overdue_outstanding, data.contact.currency)}</p></div>
            </div>

            <p className="crm-muted crm-mt-sm">Statement for account review — not a statutory audited statement.</p>

            <h3 className="crm-mt-lg">Ledger</h3>
            {data.entries.length === 0 ? (
              <p className="crm-muted">No ledger entries for this period.</p>
            ) : (
              <>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th className="crm-num">Debit</th>
                        <th className="crm-num crm-cl-credit-col">Credit</th>
                        <th className="crm-num">Balance</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.map((e) => (
                        <tr key={e.entry_key}>
                          <td>{formatDate(e.effective_date)}</td>
                          <td><span className={entryBadgeClass(e.entry_type)}>{e.entry_type_label}</span></td>
                          <td>{e.reference || "—"}</td>
                          <td>{e.description}</td>
                          <td className="crm-num">{e.debit_amount ? formatCurrency(e.debit_amount, data.contact.currency) : "—"}</td>
                          <td className="crm-num crm-cl-credit-col">{e.credit_amount ? formatCurrency(e.credit_amount, data.contact.currency) : "—"}</td>
                          <td className="crm-num">{formatCurrency(e.running_balance, data.contact.currency)}</td>
                          <td>
                            {e.invoice_id && (
                              <Link to={`/invoices/${e.invoice_id}`} className="crm-nav-link">Invoice</Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="crm-pagination crm-mt">
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                    <span className="crm-muted">Page {page} of {totalPages}</span>
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}

            {data.aging_buckets?.length > 0 && (
              <>
                <h3 className="crm-mt-lg">Ageing (outstanding)</h3>
                <div className="crm-stats-grid crm-mt-sm">
                  {data.aging_buckets.map((b) => (
                    <div key={b.label} className="crm-stat-card">
                      <p className="crm-stat-label">{b.label}</p>
                      <p className="crm-stat-value">{formatCurrency(b.amount, data.contact.currency)}</p>
                      <p className="crm-muted">{b.count} invoice{b.count === 1 ? "" : "s"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="crm-mt-lg">Open invoices</h3>
            {data.open_invoices.length === 0 ? (
              <p className="crm-muted">No open invoices for this customer.</p>
            ) : (
              <div className="crm-table-wrap">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Issue date</th>
                      <th>Due date</th>
                      <th className="crm-num">Total</th>
                      <th className="crm-num">Paid</th>
                      <th className="crm-num">Outstanding</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.open_invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.invoice_number || "—"}</td>
                        <td>{formatDate(inv.issue_date)}</td>
                        <td>{formatDate(inv.due_date)}{inv.is_overdue && <span className="crm-badge crm-cl-overdue">Overdue</span>}</td>
                        <td className="crm-num">{formatCurrency(inv.grand_total, data.contact.currency)}</td>
                        <td className="crm-num">{formatCurrency(inv.amount_paid, data.contact.currency)}</td>
                        <td className="crm-num">{formatCurrency(inv.outstanding_amount, data.contact.currency)}</td>
                        <td>{inv.status_label}</td>
                        <td><Link to={`/invoices/${inv.id}`} className="crm-nav-link">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerLedgerStatement;
