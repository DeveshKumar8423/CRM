import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  CONTRACT_STATUS_LABELS,
  RETURN_CONDITION_LABELS,
  contractStatusClass,
  formatCurrency,
  formatDateTime,
} from "../utils/rental";

function RentalContractDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [depositForm, setDepositForm] = useState({ amount: "", payment_method: "upi", reference: "" });
  const [returnLines, setReturnLines] = useState([]);

  const load = () => apiFetch(`/rental/contracts/${id}`).then((data) => {
    setContract(data);
    setReturnLines((data.lines || []).map((l) => ({
      line_id: l.id,
      return_condition: "good",
      damage_notes: "",
      damage_charge: "",
    })));
  }).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  const act = async (path, body) => {
    setError("");
    try {
      const data = await apiFetch(`/rental/contracts/${id}${path}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setContract(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const recordDeposit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/rental/contracts/${id}/deposits`, {
        method: "POST",
        body: JSON.stringify({
          type: "received",
          amount: Number(depositForm.amount),
          payment_method: depositForm.payment_method,
          reference: depositForm.reference || null,
        }),
      });
      setDepositForm({ amount: "", payment_method: "upi", reference: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const completeReturn = async (e) => {
    e.preventDefault();
    await act("/return", {
      lines: returnLines.map((l) => ({
        line_id: l.line_id,
        return_condition: l.return_condition,
        damage_notes: l.damage_notes || null,
        damage_charge: l.damage_charge ? Number(l.damage_charge) : null,
      })),
    });
  };

  if (!contract && !error) {
    return (
      <DashboardLayout title="Contract" roleLabel={role}>
        <div className="crm-panel"><p className="crm-muted">Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={contract?.contract_number || "Contract"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/rental/contracts" className="crm-muted">← Contracts</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {contract && (
          <>
            <div className="crm-detail-header crm-mt">
              <div>
                <h2>{contract.contract_number}</h2>
                <p>{contract.contact_name}</p>
                <span className={contractStatusClass(contract.status)}>
                  {CONTRACT_STATUS_LABELS[contract.status] || contract.status}
                </span>
              </div>
              <div className="crm-inline-actions">
                {hasPermission("rental.confirm") && contract.status === "draft" && (
                  <button type="button" className="crm-btn crm-btn-sm" onClick={() => act("/confirm")}>Confirm</button>
                )}
                {hasPermission("rental.dispatch") && contract.status === "confirmed" && (
                  <button type="button" className="crm-btn crm-btn-sm" onClick={() => act("/dispatch", {})}>Mark delivered</button>
                )}
                {hasPermission("rental.process_return") && ["on_rent", "delivered"].includes(contract.status) && (
                  <button
                    type="button"
                    className="crm-btn crm-btn-sm crm-btn-outline"
                    onClick={() => act("/schedule-return", { return_scheduled_at: new Date().toISOString() })}
                  >
                    Schedule return
                  </button>
                )}
                {hasPermission("rental.cancel") && !["closed", "cancelled"].includes(contract.status) && (
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => act("/cancel", {})}>Cancel</button>
                )}
              </div>
            </div>
            {contract.availability_conflicts?.length > 0 && (
              <div className="crm-error crm-mt">
                Availability conflicts: {contract.availability_conflicts.join("; ")}
              </div>
            )}
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{formatCurrency(contract.grand_total)}</span><span className="crm-stat-label">Total</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatCurrency(contract.deposit_held)}</span><span className="crm-stat-label">Deposit held</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatDateTime(contract.rental_start)}</span><span className="crm-stat-label">Start</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatDateTime(contract.rental_end)}</span><span className="crm-stat-label">End</span></div>
            </div>
            <div className="crm-tabs crm-mt">
              <button type="button" className={tab === "overview" ? "crm-tab-active" : ""} onClick={() => setTab("overview")}>Overview</button>
              <button type="button" className={tab === "deposit" ? "crm-tab-active" : ""} onClick={() => setTab("deposit")}>Deposit</button>
              <button type="button" className={tab === "return" ? "crm-tab-active" : ""} onClick={() => setTab("return")}>Return</button>
              <button type="button" className={tab === "invoices" ? "crm-tab-active" : ""} onClick={() => setTab("invoices")}>Invoices</button>
            </div>
            {tab === "overview" && (
              <table className="crm-table crm-mt">
                <thead><tr><th>Asset</th><th>Qty</th><th>Basis</th><th>Days</th><th>Subtotal</th><th>Total</th></tr></thead>
                <tbody>
                  {contract.lines.map((l) => (
                    <tr key={l.id}>
                      <td>{l.asset_code} — {l.asset_name}</td>
                      <td>{l.quantity}</td>
                      <td>{l.rate_basis}</td>
                      <td>{l.line_days}</td>
                      <td>{formatCurrency(l.line_subtotal)}</td>
                      <td>{formatCurrency(l.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "deposit" && (
              <div className="crm-mt">
                <p>Required: {formatCurrency(contract.deposit_required)} · Received: {formatCurrency(contract.deposit_received)}</p>
                {hasPermission("rental.manage_deposits") && (
                  <form className="crm-form crm-mt" onSubmit={recordDeposit}>
                    <div className="crm-form-row">
                      <input type="number" required placeholder="Amount" value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} />
                      <select value={depositForm.payment_method} onChange={(e) => setDepositForm({ ...depositForm, payment_method: e.target.value })}>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank</option>
                        <option value="cheque">Cheque</option>
                      </select>
                      <input placeholder="Reference" value={depositForm.reference} onChange={(e) => setDepositForm({ ...depositForm, reference: e.target.value })} />
                      <button type="submit" className="crm-btn crm-btn-sm">Record received</button>
                    </div>
                  </form>
                )}
                <table className="crm-table crm-mt">
                  <thead><tr><th>Type</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
                  <tbody>
                    {contract.deposits.map((d) => (
                      <tr key={d.id}>
                        <td>{d.type}</td>
                        <td>{formatCurrency(d.amount)}</td>
                        <td>{d.payment_method}</td>
                        <td>{formatDateTime(d.recorded_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === "return" && (
              <div className="crm-mt">
                {["on_rent", "delivered", "return_scheduled"].includes(contract.status) && hasPermission("rental.process_return") && (
                  <form onSubmit={completeReturn}>
                    {returnLines.map((l, idx) => {
                      const line = contract.lines.find((x) => x.id === l.line_id);
                      return (
                        <div key={l.line_id} className="crm-form-row crm-mt">
                          <span>{line?.asset_name}</span>
                          <select value={l.return_condition} onChange={(e) => {
                            const next = [...returnLines];
                            next[idx].return_condition = e.target.value;
                            setReturnLines(next);
                          }}>
                            {Object.entries(RETURN_CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <input placeholder="Damage charge" type="number" value={l.damage_charge} onChange={(e) => {
                            const next = [...returnLines];
                            next[idx].damage_charge = e.target.value;
                            setReturnLines(next);
                          }} />
                        </div>
                      );
                    })}
                    <button type="submit" className="crm-btn crm-mt">Complete return</button>
                  </form>
                )}
                {contract.status === "returned" && hasPermission("rental.process_return") && (
                  <button type="button" className="crm-btn crm-mt" onClick={() => act("/close", {})}>Close contract</button>
                )}
                {contract.status === "returned" && hasPermission("rental.manage_deposits") && (
                  <button
                    type="button"
                    className="crm-btn crm-btn-sm crm-btn-outline crm-ml"
                    onClick={async () => {
                      setError("");
                      try {
                        await apiFetch(`/rental/contracts/${id}/generate-invoice?invoice_type=rental`, { method: "POST" });
                        load();
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  >
                    Generate rental invoice
                  </button>
                )}
              </div>
            )}
            {tab === "invoices" && (
              <table className="crm-table crm-mt">
                <thead><tr><th>Invoice</th><th>Type</th><th>Status</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {contract.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number || `#${inv.invoice_id}`}</td>
                      <td>{inv.invoice_type}</td>
                      <td>{inv.invoice_status}</td>
                      <td>{formatCurrency(inv.grand_total)}</td>
                      <td><Link to={`/invoices/${inv.invoice_id}`} className="crm-btn crm-btn-sm crm-btn-outline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RentalContractDetail;
