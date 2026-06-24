import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/pos";
import { hasPermission } from "../utils/permissions";

function ReturnForm({ bill, onDone }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      await apiFetch(`/pos/bills/${bill.id}/returns`, {
        method: "POST",
        body: JSON.stringify({
          reason,
          refund_method: "cash",
          items: bill.items.map((i) => ({ bill_item_id: i.id, quantity: i.quantity })),
        }),
      });
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="crm-form crm-mt">
      <h3>Process return</h3>
      <textarea rows={2} placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      {error && <p className="crm-error">{error}</p>}
      <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={submit}>Full return</button>
    </div>
  );
}

function PosBillDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [voidReason, setVoidReason] = useState("");

  const load = () => apiFetch(`/pos/bills/${id}`).then(setBill).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const printReceipt = async () => {
    const data = await apiFetch(`/pos/bills/${id}/receipt`);
    const w = window.open("", "_blank");
    w.document.write(data.html);
    w.document.close();
    w.print();
  };

  const voidBill = async () => {
    if (!voidReason.trim()) return;
    await apiFetch(`/pos/bills/${id}/void`, { method: "POST", body: JSON.stringify({ reason: voidReason }) });
    load();
  };

  return (
    <DashboardLayout title="Bill detail" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos/bills" className="crm-muted">← Bills</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {bill && (
          <>
            <h2 className="crm-mt">{bill.bill_number}</h2>
            <p>{bill.customer_name} · {formatINR(bill.grand_total)} · {bill.status}</p>
            {bill.invoice_id && <p>Invoice: <Link to={`/invoices/${bill.invoice_id}`}>#{bill.invoice_id}</Link></p>}
            <table className="crm-table crm-mt">
              <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
              <tbody>
                {bill.items.map((i) => (
                  <tr key={i.id}><td>{i.product_name_snapshot}</td><td>{i.quantity}</td><td>{formatINR(i.unit_price)}</td><td>{formatINR(i.line_total)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className="crm-btn crm-btn-sm" onClick={printReceipt}>Reprint receipt</button>
            </div>
            {hasPermission("pos.void") && bill.status === "completed" && (
              <div className="crm-form crm-mt">
                <input placeholder="Void reason" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={voidBill}>Void bill</button>
              </div>
            )}
            {hasPermission("pos.return") && bill.status === "completed" && (
              <ReturnForm bill={bill} onDone={load} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PosBillDetail;
