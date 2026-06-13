import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  PERIOD_LABELS,
  REPORT_TABS,
  badgeClass,
  buildReportParams,
  exportCsv,
  formatCurrency,
  formatPercent,
} from "../utils/salesReports";

const REPORT_ENDPOINTS = {
  overview: "/sales-reports/overview",
  conversion: "/sales-reports/conversion",
  revenue: "/sales-reports/revenue",
  sources: "/sales-reports/lead-sources",
  team: "/sales-reports/executives",
  pending: "/sales-reports/pending-deals",
  pipeline: "/sales-reports/pipeline-health",
};

function BarChart({ data, valueKey = "value", labelKey = "label", format = (v) => v }) {
  if (!data?.length) return <p className="crm-muted">No data for this period.</p>;
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="crm-report-chart">
      {data.map((d) => (
        <div key={d[labelKey]} className="crm-report-bar-row">
          <span className="crm-report-bar-label">{d[labelKey]}</span>
          <div className="crm-report-bar-track">
            <div className="crm-report-bar-fill" style={{ width: `${((d[valueKey] || 0) / max) * 100}%` }} />
          </div>
          <span className="crm-report-bar-value">{format(d[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

function RankTable({ rows, columns }) {
  if (!rows?.length) return <p className="crm-muted">No data for this period.</p>;
  return (
    <div className="crm-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} className={c.num ? "crm-num" : ""}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || row.name || idx}>
              {columns.map((c) => (
                <td key={c.key} className={c.num ? "crm-num" : ""}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SalesReports() {
  const role = localStorage.getItem("role") || "Staff";
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("month");
  const [ownerId, setOwnerId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const canFinancial = hasPermission("reports.view_financial");
  const canTeam = hasPermission("reports.view_team");
  const canExport = hasPermission("reports.export");

  useEffect(() => {
    apiFetch("/sales-reports/assignees").then(setAssignees).catch(() => {});
  }, []);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setData(null);
    setError("");
    setLoading(true);
  };

  const load = useCallback(() => {
    if (tab === "revenue" && !canFinancial) {
      setData(null);
      setError("You do not have permission to view financial revenue reports.");
      setLoading(false);
      return;
    }
    if (tab === "team" && !canTeam) {
      setData(null);
      setError("You do not have permission to view team performance reports.");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    const params = buildReportParams(period, ownerId || null, dateFrom, dateTo);
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
  }, [tab, period, ownerId, dateFrom, dateTo, canFinancial, canTeam]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    if (!data || !canExport) return;
    const stamp = new Date().toISOString().slice(0, 10);

    if (tab === "overview" && data.kpis) {
      const rows = [
        ["Period", data.period_label || ""],
        ["From", data.date_from ? new Date(data.date_from).toLocaleDateString() : ""],
        ["To", data.date_to ? new Date(data.date_to).toLocaleDateString() : ""],
        [],
        ["KPI", "Value", "Unit", "Change %"],
        ...data.kpis.map((k) => [k.label, k.value, k.unit || "", k.delta_percent ?? ""]),
      ];
      if (data.top_sources?.length) {
        rows.push([], ["Top lead sources"], ["Source", "Leads"], ...data.top_sources.map((s) => [s.name, s.count]));
      }
      if (data.top_performers?.length) {
        rows.push([], ["Top performers"], ["Executive", "Deals", "Revenue"], ...data.top_performers.map((p) => [p.name, p.count, p.value]));
      }
      if (data.top_pending_deals?.length) {
        rows.push([], ["Top pending deals"], ["Deal", "Stage", "Value", "Owner", "Flag"], ...data.top_pending_deals.map((d) => [d.title, d.stage_label, d.expected_value, d.owner_name || "", d.badge || ""]));
      }
      exportCsv(`sales-overview-${stamp}.csv`, [], rows);
      return;
    }

    if (tab === "revenue") {
      const rows = [
        ["Booked (won)", data.booked_revenue ?? 0],
        ["Collected", data.collected_revenue ?? 0],
        ["Outstanding", data.outstanding_revenue ?? 0],
        ["Pipeline forecast", data.pipeline_forecast ?? 0],
        [],
        ["By executive", "Deals", "Revenue"],
        ...(data.by_owner || []).map((r) => [r.name, r.count, r.value]),
        [],
        ["By customer", "Deals", "Revenue"],
        ...(data.by_customer || []).map((r) => [r.name, r.count, r.value]),
        [],
        ["By source", "Revenue"],
        ...(data.by_source || []).map((r) => [r.name, r.value]),
      ];
      exportCsv(`revenue-${stamp}.csv`, [], rows);
      return;
    }

    if (tab === "pipeline" && data.stages) {
      exportCsv(
        `pipeline-health-${stamp}.csv`,
        ["Stage", "Deals", "Value", "Avg age (days)"],
        [
          ...data.stages.map((s) => [s.label, s.count, s.value, s.avg_age_days]),
          [],
          ["Total pipeline value", "", data.total_pipeline_value, ""],
          ["Health score", data.health_score, "", ""],
          ["Health label", data.health_label, "", ""],
          ["Top deal concentration %", data.concentration_top_deal_percent, "", ""],
        ],
      );
      return;
    }

    if (tab === "pending" && data.deals) {
      exportCsv(
        `pending-deals-${stamp}.csv`,
        ["Title", "Stage", "Value", "Owner", "Days stale", "Status"],
        data.deals.map((d) => [d.title, d.stage_label, d.expected_value, d.owner_name, d.days_stale, d.badge || ""]),
      );
    } else if (tab === "sources" && data.sources) {
      exportCsv(
        `lead-sources-${stamp}.csv`,
        ["Source", "Leads", "Revenue", "Conversion %"],
        data.sources.map((s) => [s.name, s.count, s.value, s.rate]),
      );
    } else if (tab === "team" && data.executives) {
      exportCsv(
        `team-performance-${stamp}.csv`,
        ["Executive", "Deals", "Revenue", "Win rate %"],
        data.executives.map((e) => [e.name, e.count, e.value, e.rate]),
      );
    } else if (tab === "conversion" && data.by_source) {
      const rows = [
        ["Lead→Deal", data.lead_to_deal_rate],
        ["Deal→Win", data.deal_to_win_rate],
        ["Quote→Order", data.quote_to_order_rate],
        ["Order→Invoice", data.order_to_invoice_rate],
        [],
        ["By source", "Leads", "Conversion %"],
        ...data.by_source.map((s) => [s.name, s.count, s.rate]),
        [],
        ["By owner", "Leads", "Conversion %"],
        ...(data.by_owner || []).map((o) => [o.name, o.count, o.rate]),
      ];
      exportCsv(`conversion-${stamp}.csv`, [], rows);
    }
  };

  const visibleTabs = REPORT_TABS.filter((t) => {
    if (t.key === "revenue") return canFinancial;
    if (t.key === "team") return canTeam;
    return true;
  });

  return (
    <DashboardLayout title="Sales Reports" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Sales intelligence and performance analytics</p>
          {canExport && (
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport} disabled={!data}>
              Export CSV
            </button>
          )}
        </div>

        <div className="crm-filters crm-mt">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {period === "custom" && (
            <>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              <button type="button" className="crm-btn crm-btn-sm" onClick={load}>Apply</button>
            </>
          )}
          {assignees.length > 1 && (
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">All owners</option>
              {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
        </div>

        <div className="crm-tabs crm-mt">
          {visibleTabs.map((t) => (
            <button key={t.key} type="button" className={`crm-tab ${tab === t.key ? "crm-tab-active" : ""}`} onClick={() => changeTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {loading && <p className="crm-muted crm-mt">Loading report…</p>}

        {!loading && tab === "overview" && data && (
          <div className="crm-mt">
            <p className="crm-muted">{data.period_label} · {new Date(data.date_from).toLocaleDateString()} – {new Date(data.date_to).toLocaleDateString()}</p>
            <div className="crm-stats-grid crm-mt">
              {data.kpis.map((k) => (
                <div key={k.key} className="crm-stat-card crm-report-kpi" onClick={() => {
                  const map = { conversion: "conversion", win_rate: "conversion", revenue: "revenue", pending_value: "pending", stale: "pending" };
                  const nextTab = map[k.key];
                  if (!nextTab) return;
                  if (nextTab === "revenue" && !canFinancial) {
                    setError("You do not have permission to view financial revenue reports.");
                    return;
                  }
                  changeTab(nextTab);
                }}>
                  <p className="crm-stat-label">{k.label}</p>
                  <p className="crm-stat-value">
                    {k.unit === "INR" ? formatCurrency(k.value) : k.unit === "%" ? formatPercent(k.value) : k.value}
                  </p>
                  {k.delta_percent != null && (
                    <p className={`crm-report-delta ${k.delta_percent >= 0 ? "crm-report-delta-up" : "crm-report-delta-down"}`}>
                      {k.delta_percent >= 0 ? "▲" : "▼"} {Math.abs(k.delta_percent)}% {k.delta_label}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {data.revenue_trend?.length > 0 && (
              <div className="crm-mt-lg">
                <h3>Revenue trend</h3>
                <BarChart data={data.revenue_trend} format={formatCurrency} />
              </div>
            )}

            <div className="crm-report-widgets crm-mt-lg">
              <section>
                <h3>Top lead sources</h3>
                <RankTable rows={data.top_sources} columns={[
                  { key: "name", label: "Source" },
                  { key: "count", label: "Leads", num: true },
                ]} />
              </section>
              <section>
                <h3>Top performers</h3>
                <RankTable rows={data.top_performers} columns={[
                  { key: "name", label: "Executive" },
                  { key: "value", label: "Revenue", num: true, render: (r) => formatCurrency(r.value) },
                  { key: "badge", label: "", render: (r) => r.badge ? <span className={badgeClass(r.badge)}>{r.badge}</span> : null },
                ]} />
              </section>
              <section>
                <h3>Top pending deals</h3>
                <RankTable rows={data.top_pending_deals} columns={[
                  { key: "title", label: "Deal", render: (r) => <Link to={`/deals/${r.id}`} className="crm-nav-link">{r.title}</Link> },
                  { key: "expected_value", label: "Value", num: true, render: (r) => formatCurrency(r.expected_value, r.currency) },
                  { key: "badge", label: "Flag", render: (r) => r.badge ? <span className={badgeClass(r.badge)}>{r.badge}</span> : "—" },
                ]} />
              </section>
            </div>
          </div>
        )}

        {!loading && tab === "conversion" && data && (
          <div className="crm-mt">
            <div className="crm-stats-row crm-mt">
              <div className="crm-stat-card"><span className="crm-muted">Lead→Deal</span><strong>{formatPercent(data.lead_to_deal_rate)}</strong></div>
              <div className="crm-stat-card"><span className="crm-muted">Deal→Win</span><strong>{formatPercent(data.deal_to_win_rate)}</strong></div>
              <div className="crm-stat-card"><span className="crm-muted">Quote→Order</span><strong>{formatPercent(data.quote_to_order_rate)}</strong></div>
              <div className="crm-stat-card"><span className="crm-muted">Order→Invoice</span><strong>{formatPercent(data.order_to_invoice_rate)}</strong></div>
            </div>
            <h3 className="crm-mt-lg">Conversion funnel</h3>
            <BarChart data={data.funnel} valueKey="count" format={(v) => v} />
            <div className="crm-report-widgets crm-mt-lg">
              <section>
                <h3>By lead source</h3>
                <RankTable rows={data.by_source} columns={[
                  { key: "name", label: "Source" },
                  { key: "count", label: "Leads", num: true },
                  { key: "rate", label: "Conversion", num: true, render: (r) => formatPercent(r.rate) },
                ]} />
              </section>
              <section>
                <h3>By owner</h3>
                <RankTable rows={data.by_owner} columns={[
                  { key: "name", label: "Owner" },
                  { key: "count", label: "Leads", num: true },
                  { key: "rate", label: "Conversion", num: true, render: (r) => formatPercent(r.rate) },
                ]} />
              </section>
            </div>
          </div>
        )}

        {!loading && tab === "revenue" && data && (
          <div className="crm-mt">
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Booked (won)</p><p className="crm-stat-value">{formatCurrency(data.booked_revenue)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Collected</p><p className="crm-stat-value">{formatCurrency(data.collected_revenue)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Outstanding</p><p className="crm-stat-value">{formatCurrency(data.outstanding_revenue)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Pipeline forecast</p><p className="crm-stat-value">{formatCurrency(data.pipeline_forecast)}</p></div>
            </div>
            <h3 className="crm-mt-lg">Revenue trend</h3>
            <BarChart data={data.trend} format={formatCurrency} />
            <div className="crm-report-widgets crm-mt-lg">
              <section>
                <h3>By executive</h3>
                <RankTable rows={data.by_owner} columns={[
                  { key: "name", label: "Executive" },
                  { key: "value", label: "Revenue", num: true, render: (r) => formatCurrency(r.value) },
                ]} />
              </section>
              <section>
                <h3>By customer</h3>
                <RankTable rows={data.by_customer} columns={[
                  { key: "name", label: "Customer" },
                  { key: "value", label: "Revenue", num: true, render: (r) => formatCurrency(r.value) },
                ]} />
              </section>
            </div>
          </div>
        )}

        {!loading && tab === "sources" && data && (
          <div className="crm-mt">
            <h3>Source conversion</h3>
            <BarChart data={data.conversion_chart} format={formatPercent} />
            <h3 className="crm-mt-lg">Source ranking</h3>
            <RankTable rows={data.sources} columns={[
              { key: "name", label: "Source" },
              { key: "count", label: "Leads", num: true },
              { key: "value", label: "Revenue", num: true, render: (r) => formatCurrency(r.value) },
              { key: "rate", label: "Conversion", num: true, render: (r) => formatPercent(r.rate) },
              { key: "badge", label: "Quality", render: (r) => r.badge ? <span className={badgeClass(r.badge)}>{r.badge}</span> : "—" },
            ]} />
          </div>
        )}

        {!loading && tab === "team" && data && (
          <div className="crm-mt">
            <h3>Executive leaderboard</h3>
            <RankTable rows={data.executives} columns={[
              { key: "name", label: "Executive" },
              { key: "count", label: "Deals", num: true },
              { key: "value", label: "Revenue", num: true, render: (r) => formatCurrency(r.value) },
              { key: "rate", label: "Win rate", num: true, render: (r) => formatPercent(r.rate) },
              { key: "badge", label: "", render: (r) => r.badge ? <span className={badgeClass(r.badge)}>{r.badge}</span> : null },
            ]} />
            <h3 className="crm-mt-lg">Detail</h3>
            <RankTable rows={data.detail} columns={[
              { key: "name", label: "Executive" },
              { key: "leads_handled", label: "Leads", num: true },
              { key: "deals_created", label: "Deals", num: true },
              { key: "won_count", label: "Won", num: true },
              { key: "pending_deals", label: "Pending", num: true },
              { key: "revenue_closed", label: "Revenue", num: true, render: (r) => formatCurrency(r.revenue_closed) },
            ]} />
          </div>
        )}

        {!loading && tab === "pending" && data && (
          <div className="crm-mt">
            <div className="crm-stats-row crm-mt">
              <div className="crm-stat-card"><span className="crm-muted">Open deals</span><strong>{data.total_count}</strong></div>
              <div className="crm-stat-card"><span className="crm-muted">Pending value</span><strong>{formatCurrency(data.total_value)}</strong></div>
              <div className="crm-stat-card crm-stat-warn"><span className="crm-muted">Overdue</span><strong>{data.overdue_count}</strong></div>
              <div className="crm-stat-card crm-stat-warn"><span className="crm-muted">Stale</span><strong>{data.stale_count}</strong></div>
            </div>
            <h3 className="crm-mt-lg">Aging buckets</h3>
            <BarChart data={data.aging_buckets} format={(v) => v} />
            <h3 className="crm-mt-lg">Pending deals</h3>
            <RankTable rows={data.deals} columns={[
              { key: "title", label: "Deal", render: (r) => <Link to={`/deals/${r.id}`} className="crm-nav-link">{r.title}</Link> },
              { key: "stage_label", label: "Stage" },
              { key: "expected_value", label: "Value", num: true, render: (r) => formatCurrency(r.expected_value, r.currency) },
              { key: "owner_name", label: "Owner" },
              { key: "days_stale", label: "Days stale", num: true },
              { key: "badge", label: "Flag", render: (r) => r.badge ? <span className={badgeClass(r.badge)}>{r.badge}</span> : "—" },
            ]} />
          </div>
        )}

        {!loading && tab === "pipeline" && data && (
          <div className="crm-mt">
            <div className="crm-stats-row crm-mt">
              <div className="crm-stat-card">
                <span className="crm-muted">Pipeline value</span>
                <strong>{formatCurrency(data.total_pipeline_value)}</strong>
              </div>
              <div className="crm-stat-card">
                <span className="crm-muted">Health score</span>
                <strong>{data.health_score}/100</strong>
                <span className={badgeClass(data.health_label)}>{data.health_label}</span>
              </div>
              <div className="crm-stat-card">
                <span className="crm-muted">Top deal concentration</span>
                <strong>{formatPercent(data.concentration_top_deal_percent)}</strong>
              </div>
            </div>
            <h3 className="crm-mt-lg">Value by stage</h3>
            <BarChart
              data={data.stages.map((s) => ({ label: s.label, value: s.value }))}
              format={formatCurrency}
            />
            <h3 className="crm-mt-lg">Stage detail</h3>
            <RankTable rows={data.stages} columns={[
              { key: "label", label: "Stage" },
              { key: "count", label: "Deals", num: true },
              { key: "value", label: "Value", num: true, render: (r) => formatCurrency(r.value) },
              { key: "avg_age_days", label: "Avg age (days)", num: true },
            ]} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SalesReports;
