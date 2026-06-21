import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  REPORT_ENDPOINTS,
  REPORT_TABS,
  PERIOD_LABELS,
  badgeClass,
  buildReportParams,
  canExportReport,
  canViewTab,
  exportCsv,
  exportFilename,
  formatCurrency,
  formatDate,
} from "../utils/taxReports";

function RateTable({ rows }) {
  if (!rows?.length) return <p className="crm-muted">No tax rate data for this period.</p>;
  return (
    <div className="crm-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>
            <th>Rate</th>
            <th className="crm-num">Taxable value</th>
            <th className="crm-num">Tax amount</th>
            <th className="crm-num">Documents</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rate_label}>
              <td>{r.rate_label}</td>
              <td className="crm-num">{formatCurrency(r.taxable_value)}</td>
              <td className="crm-num">{formatCurrency(r.tax_amount)}</td>
              <td className="crm-num">{r.document_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataQualityPanel({ quality }) {
  if (!quality) return null;
  return (
    <div className="crm-tax-quality crm-mt-lg">
      <h3>Data quality</h3>
      <ul className="crm-tax-quality-list">
        <li>
          Outward documents missing GSTIN: <strong>{quality.outward_missing_gstin}</strong>
          {quality.outward_missing_gstin > 0 && (
            <span className={badgeClass("missing_gstin")}>Missing GSTIN</span>
          )}
        </li>
        <li>
          Inward documents missing vendor GSTIN: <strong>{quality.inward_missing_gstin}</strong>
          {quality.inward_missing_gstin > 0 && (
            <span className={badgeClass("missing_gstin")}>Missing GSTIN</span>
          )}
        </li>
        <li>Excluded outward drafts in period: <strong>{quality.excluded_outward_drafts}</strong></li>
        <li>Excluded inward drafts in period: <strong>{quality.excluded_inward_drafts}</strong></li>
      </ul>
      <p className="crm-muted crm-mt-sm">Reports are for compliance support only. Verify totals before filing.</p>
    </div>
  );
}

function GstinWarning({ company }) {
  if (!company || company.gstin_configured) return null;
  return (
    <div className="crm-alert crm-alert-warn crm-mt">
      Company GSTIN is not configured. Set it in{" "}
      <Link to="/admin/company" className="crm-nav-link">Company settings</Link>{" "}
      before exporting tax reports.
    </div>
  );
}

function TaxReports() {
  const role = localStorage.getItem("role") || "Staff";
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const canExport = canExportReport(hasPermission);
  const visibleTabs = REPORT_TABS.filter((t) => canViewTab(t, hasPermission));

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setData(null);
    setError("");
    setLoading(true);
    setPage(1);
    setSearch("");
  };

  const load = useCallback(() => {
    const activeTab = REPORT_TABS.find((t) => t.key === tab);
    if (activeTab && !canViewTab(activeTab, hasPermission)) {
      setData(null);
      setError("You do not have permission to view this tax report.");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    const params = buildReportParams(period, dateFrom, dateTo, tab === "overview" || tab === "summary" ? "" : search, page);
    apiFetch(`${REPORT_ENDPOINTS[tab]}?${params}`)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setData(result);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setData(null);
        setError(err.message);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [tab, period, dateFrom, dateTo, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const logExport = (reportType, rowCount) => {
    if (!canExport) return;
    apiFetch("/tax-reports/export-log", {
      method: "POST",
      body: JSON.stringify({
        report_type: reportType,
        period,
        period_label: data?.period_label,
        row_count: rowCount,
      }),
    }).catch(() => {});
  };

  const handleExport = async () => {
    if (!data || !canExport) return;
    const company = data.company;
    const headerRows = [
      [company?.company_name || ""],
      [`GSTIN: ${company?.gstin || "Not configured"}`],
      [`Period: ${data.period_label}`],
      [`From: ${formatDate(data.date_from)}`, `To: ${formatDate(data.date_to)}`],
      [],
    ];

    let exportData = data;

    if (tab === "sales" || tab === "purchase") {
      try {
        const params = buildReportParams(period, dateFrom, dateTo, search, 1);
        params.set("per_page", "10000");
        exportData = await apiFetch(`${REPORT_ENDPOINTS[tab]}?${params}`);
      } catch {
        exportData = data;
      }
    }

    if (tab === "overview") {
      const rows = [
        ["Section", "Taxable value", "Tax", "Documents"],
        ["Outward (Sales)", data.outward_taxable_value, data.outward_tax_collected, data.outward_document_count],
        ["Inward (Purchase)", data.inward_taxable_value, data.inward_input_tax, data.inward_document_count],
      ];
      exportCsv(exportFilename("overview", period, data.period_label), [], rows, headerRows);
      logExport("overview", rows.length);
      return;
    }

    if (tab === "sales") {
      const rows = (exportData.register || []).map((r) => [
        r.invoice_number,
        formatDate(r.issue_date),
        r.customer_name,
        r.customer_gstin || "",
        r.taxable_value,
        r.tax_amount,
        r.grand_total,
        r.status_label,
        r.tax_rate_summary,
        r.is_credit_note ? "Credit Note" : "",
      ]);
      exportCsv(
        exportFilename("sales", period, data.period_label),
        ["Invoice #", "Issue date", "Customer", "GSTIN", "Taxable value", "Tax", "Total", "Status", "Tax rate", "Type"],
        rows,
        headerRows,
      );
      logExport("sales", rows.length);
      return;
    }

    if (tab === "purchase") {
      const rows = (exportData.register || []).map((r) => [
        r.bill_number,
        r.supplier_invoice_number || "",
        formatDate(r.bill_date),
        r.vendor_name,
        r.vendor_gstin || "",
        r.taxable_value,
        r.tax_amount,
        r.grand_total,
        r.status_label,
        r.po_number || "",
      ]);
      exportCsv(
        exportFilename("purchase", period, data.period_label),
        ["Bill #", "Supplier invoice #", "Bill date", "Vendor", "GSTIN", "Taxable value", "Tax", "Total", "Status", "PO ref"],
        rows,
        headerRows,
      );
      logExport("purchase", rows.length);
      return;
    }

    if (tab === "summary") {
      const rows = [
        ["Outward taxable", data.outward_taxable_value],
        ["Outward tax collected", data.outward_tax_collected],
        ["Outward documents", data.outward_document_count],
        [],
        ["Inward taxable", data.inward_taxable_value],
        ["Inward input tax", data.inward_input_tax],
        ["Inward documents", data.inward_document_count],
        [],
        ["Informational net tax", data.informational_net_tax],
        [],
        ["Rate", "Taxable value", "Tax amount", "Documents"],
        ...(data.rate_breakdown || []).map((r) => [r.rate_label, r.taxable_value, r.tax_amount, r.document_count]),
      ];
      exportCsv(exportFilename("summary", period, data.period_label), [], rows, headerRows);
      logExport("summary", rows.length);
    }
  };

  const periodLine = data ? (
    <p className="crm-muted">
      {data.period_label} · {formatDate(data.date_from)} – {formatDate(data.date_to)}
      {data.company?.gstin && <> · GSTIN: {data.company.gstin}</>}
    </p>
  ) : null;

  const registerPagination = data?.register_total > data?.register_per_page ? (
    <div className="crm-pagination crm-mt">
      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        Previous
      </button>
      <span className="crm-muted">
        Page {data.register_page} of {Math.ceil(data.register_total / data.register_per_page)}
      </span>
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-outline"
        disabled={page >= Math.ceil(data.register_total / data.register_per_page)}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  ) : null;

  return (
    <DashboardLayout title="GST / Tax Reports" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Tax-ready sales, purchase, and summary reports for compliance support</p>
          {canExport && (
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport} disabled={!data}>
              Export CSV
            </button>
          )}
        </div>

        <div className="crm-filters crm-mt">
          <select value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }} aria-label="Reporting period">
            {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {period === "custom" && (
            <>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
              <button type="button" className="crm-btn crm-btn-sm" onClick={load}>Apply</button>
            </>
          )}
          {(tab === "sales" || tab === "purchase") && (
            <>
              <input
                type="search"
                placeholder={tab === "sales" ? "Search invoice, customer, GSTIN…" : "Search bill, vendor, GSTIN…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              />
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => { setPage(1); load(); }}>Search</button>
            </>
          )}
        </div>

        <div className="crm-tabs crm-mt">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`crm-tab ${tab === t.key ? "crm-tab-active" : ""}`}
              onClick={() => changeTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {loading && <p className="crm-muted crm-mt">Loading report…</p>}

        {!loading && data && <GstinWarning company={data.company} />}

        {!loading && tab === "overview" && data && (
          <div className="crm-mt">
            {periodLine}
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card crm-tax-card-outward" onClick={() => changeTab("sales")} role="button" tabIndex={0}>
                <p className="crm-stat-label"><span className={badgeClass("outward")}>Outward</span> Taxable value</p>
                <p className="crm-stat-value">{formatCurrency(data.outward_taxable_value)}</p>
              </div>
              <div className="crm-stat-card crm-tax-card-outward" onClick={() => changeTab("sales")} role="button" tabIndex={0}>
                <p className="crm-stat-label">Tax collected</p>
                <p className="crm-stat-value">{formatCurrency(data.outward_tax_collected)}</p>
              </div>
              <div className="crm-stat-card crm-tax-card-inward" onClick={() => changeTab("purchase")} role="button" tabIndex={0}>
                <p className="crm-stat-label"><span className={badgeClass("inward")}>Inward</span> Taxable value</p>
                <p className="crm-stat-value">{formatCurrency(data.inward_taxable_value)}</p>
              </div>
              <div className="crm-stat-card crm-tax-card-inward" onClick={() => changeTab("purchase")} role="button" tabIndex={0}>
                <p className="crm-stat-label">Input tax</p>
                <p className="crm-stat-value">{formatCurrency(data.inward_input_tax)}</p>
              </div>
              <div className="crm-stat-card" onClick={() => changeTab("summary")} role="button" tabIndex={0}>
                <p className="crm-stat-label">Missing GSTIN</p>
                <p className="crm-stat-value">{data.missing_gstin_count}</p>
              </div>
            </div>
            <div className="crm-tax-quick-links crm-mt-lg">
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => changeTab("sales")}>Sales tax report →</button>
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => changeTab("purchase")}>Purchase tax report →</button>
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => changeTab("summary")}>Tax summary →</button>
            </div>
            <DataQualityPanel quality={data.data_quality} />
          </div>
        )}

        {!loading && tab === "sales" && data && (
          <div className="crm-mt">
            {periodLine}
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Taxable value</p><p className="crm-stat-value">{formatCurrency(data.taxable_value)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Tax collected</p><p className="crm-stat-value">{formatCurrency(data.tax_collected)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Gross total</p><p className="crm-stat-value">{formatCurrency(data.gross_total)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Documents</p><p className="crm-stat-value">{data.document_count}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label"><span className={badgeClass("b2b")}>B2B</span></p><p className="crm-stat-value">{data.b2b_count}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label"><span className={badgeClass("b2c")}>B2C</span></p><p className="crm-stat-value">{data.b2c_count}</p></div>
            </div>
            <h3 className="crm-mt-lg">Rate-wise breakdown</h3>
            <RateTable rows={data.rate_breakdown} />
            <h3 className="crm-mt-lg">Outward supply register</h3>
            {data.document_count === 0 ? (
              <p className="crm-muted">No qualifying invoices for this period. <Link to="/invoices" className="crm-nav-link">View invoices</Link></p>
            ) : (
              <>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>GSTIN</th>
                        <th className="crm-num">Taxable</th>
                        <th className="crm-num">Tax</th>
                        <th className="crm-num">Total</th>
                        <th>Status</th>
                        <th>Rate</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.register.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {r.invoice_number || "—"}
                            {r.is_credit_note && <span className={badgeClass("credit_note")}>Credit Note</span>}
                          </td>
                          <td>{formatDate(r.issue_date)}</td>
                          <td>{r.customer_name || "—"}</td>
                          <td>
                            {r.customer_gstin || "—"}
                            {r.missing_gstin && <span className={badgeClass("missing_gstin")}>Missing GSTIN</span>}
                          </td>
                          <td className="crm-num">{formatCurrency(r.taxable_value)}</td>
                          <td className="crm-num">{formatCurrency(r.tax_amount)}</td>
                          <td className="crm-num">{formatCurrency(r.grand_total)}</td>
                          <td>{r.status_label}</td>
                          <td>{r.tax_rate_summary}</td>
                          <td><Link to={`/invoices/${r.id}`} className="crm-nav-link">View</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {registerPagination}
              </>
            )}
            <DataQualityPanel quality={data.data_quality} />
          </div>
        )}

        {!loading && tab === "purchase" && data && (
          <div className="crm-mt">
            {periodLine}
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Taxable value</p><p className="crm-stat-value">{formatCurrency(data.taxable_value)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Input tax</p><p className="crm-stat-value">{formatCurrency(data.input_tax)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Gross total</p><p className="crm-stat-value">{formatCurrency(data.gross_total)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Bills</p><p className="crm-stat-value">{data.document_count}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Vendors with GSTIN</p><p className="crm-stat-value">{data.vendors_with_gstin}</p></div>
            </div>
            <h3 className="crm-mt-lg">Rate-wise breakdown</h3>
            <RateTable rows={data.rate_breakdown} />
            {data.vendor_summary?.length > 0 && (
              <>
                <h3 className="crm-mt-lg">Top vendors by input tax</h3>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr><th>Vendor</th><th className="crm-num">Bills</th><th className="crm-num">Taxable</th><th className="crm-num">Input tax</th></tr>
                    </thead>
                    <tbody>
                      {data.vendor_summary.map((v) => (
                        <tr key={v.vendor_name}>
                          <td>{v.vendor_name}</td>
                          <td className="crm-num">{v.bill_count}</td>
                          <td className="crm-num">{formatCurrency(v.taxable_value)}</td>
                          <td className="crm-num">{formatCurrency(v.input_tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <h3 className="crm-mt-lg">Inward supply register</h3>
            {data.document_count === 0 ? (
              <p className="crm-muted">No qualifying vendor bills for this period. <Link to="/vendor-bills" className="crm-nav-link">View vendor bills</Link></p>
            ) : (
              <>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Bill #</th>
                        <th>Supplier inv #</th>
                        <th>Date</th>
                        <th>Vendor</th>
                        <th>GSTIN</th>
                        <th className="crm-num">Taxable</th>
                        <th className="crm-num">Tax</th>
                        <th className="crm-num">Total</th>
                        <th>Status</th>
                        <th>PO</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.register.map((r) => (
                        <tr key={r.id}>
                          <td>{r.bill_number || "—"}</td>
                          <td>{r.supplier_invoice_number || "—"}</td>
                          <td>{formatDate(r.bill_date)}</td>
                          <td>{r.vendor_name}</td>
                          <td>
                            {r.vendor_gstin || "—"}
                            {r.missing_gstin && <span className={badgeClass("missing_gstin")}>Missing GSTIN</span>}
                          </td>
                          <td className="crm-num">{formatCurrency(r.taxable_value)}</td>
                          <td className="crm-num">{formatCurrency(r.tax_amount)}</td>
                          <td className="crm-num">{formatCurrency(r.grand_total)}</td>
                          <td>{r.status_label}</td>
                          <td>{r.po_number || "—"}</td>
                          <td><Link to={`/vendor-bills/${r.id}`} className="crm-nav-link">View</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {registerPagination}
              </>
            )}
            <DataQualityPanel quality={data.data_quality} />
          </div>
        )}

        {!loading && tab === "summary" && data && (
          <div className="crm-mt">
            {periodLine}
            <div className="crm-tax-summary-grid crm-mt">
              <section className="crm-tax-summary-section crm-tax-card-outward">
                <h3><span className={badgeClass("outward")}>Outward</span> Sales</h3>
                <p>Taxable: <strong>{formatCurrency(data.outward_taxable_value)}</strong></p>
                <p>Tax collected: <strong>{formatCurrency(data.outward_tax_collected)}</strong></p>
                <p>Documents: <strong>{data.outward_document_count}</strong></p>
              </section>
              <section className="crm-tax-summary-section crm-tax-card-inward">
                <h3><span className={badgeClass("inward")}>Inward</span> Purchase</h3>
                <p>Taxable: <strong>{formatCurrency(data.inward_taxable_value)}</strong></p>
                <p>Input tax: <strong>{formatCurrency(data.inward_input_tax)}</strong></p>
                <p>Documents: <strong>{data.inward_document_count}</strong></p>
              </section>
            </div>
            <div className="crm-stat-card crm-tax-net crm-mt-lg">
              <p className="crm-stat-label">
                <span className={badgeClass("informational")}>Informational Net</span> Outward tax − inward tax
              </p>
              <p className="crm-stat-value">{formatCurrency(data.informational_net_tax)}</p>
              <p className="crm-muted crm-mt-sm">Not a substitute for statutory net tax payable calculation.</p>
            </div>
            <h3 className="crm-mt-lg">Combined rate-wise breakdown</h3>
            <RateTable rows={data.rate_breakdown} />
            <DataQualityPanel quality={data.data_quality} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TaxReports;
