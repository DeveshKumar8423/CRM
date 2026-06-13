import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_URL } from "../utils/api";
import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/invoices";

async function publicFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

function ClientInvoiceView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    publicFetch(`/public/invoices/${token}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (!data && !error) {
    return (
      <div className="crm-client-quote">
        <div className="crm-panel"><p>Loading invoice…</p></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="crm-client-quote">
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </div>
    );
  }

  const { invoice: inv, company, is_overdue: isOverdue } = data;
  const companyAddress = [company.address_line1, company.address_line2, company.city, company.state, company.pincode, company.country]
    .filter(Boolean)
    .join(", ");

  const handlePrint = () => window.print();

  return (
    <div className="crm-client-quote">
      <div className={`crm-quote-document crm-panel ${isOverdue ? "crm-quote-expired" : ""}`}>
        <header className="crm-quote-doc-header">
          <div>
            <h1>{company.display_name || "Company"}</h1>
            {companyAddress && <p className="crm-muted">{companyAddress}</p>}
            {company.gstin && <p className="crm-muted">GSTIN: {company.gstin}</p>}
          </div>
          <div className="crm-quote-doc-meta">
            <h2>INVOICE</h2>
            <p><strong>{inv.invoice_number}</strong></p>
            <span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span>
            <p>Due: {formatDate(inv.due_date)}</p>
          </div>
        </header>

        <div className="crm-client-invoice-summary crm-mt">
          <div>
            <span className="crm-muted">Amount due</span>
            <h2 className="crm-num">{formatCurrency(inv.outstanding_amount, inv.currency)}</h2>
          </div>
          {inv.amount_paid > 0 && (
            <p className="crm-muted">Paid: {formatCurrency(inv.amount_paid, inv.currency)} of {formatCurrency(inv.grand_total, inv.currency)}</p>
          )}
          {isOverdue && <p className="crm-error">This invoice is overdue.</p>}
        </div>

        <section className="crm-quote-doc-parties crm-mt">
          <div>
            <h3>Bill to</h3>
            <p><strong>{inv.client_name}</strong></p>
            {inv.client_org && <p>{inv.client_org}</p>}
            {inv.billing_address && <p className="crm-muted">{inv.billing_address}</p>}
          </div>
        </section>

        <h3>{inv.title}</h3>

        <table className="crm-table crm-quote-doc-table">
          <thead><tr><th>Description</th><th>Qty</th><th className="crm-num">Amount</th></tr></thead>
          <tbody>
            {inv.line_items.map((li) => (
              <tr key={li.id}>
                <td><strong>{li.item_name}</strong></td>
                <td>{li.quantity} {li.unit}</td>
                <td className="crm-num">{formatCurrency(li.line_total, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="crm-quote-doc-totals">
          <div className="crm-quote-summary-row"><span>Subtotal</span><span>{formatCurrency(inv.subtotal, inv.currency)}</span></div>
          <div className="crm-quote-summary-row"><span>Tax</span><span>{formatCurrency(inv.total_tax, inv.currency)}</span></div>
          <div className="crm-quote-summary-total"><span>Total</span><strong>{formatCurrency(inv.grand_total, inv.currency)}</strong></div>
        </div>

        {inv.payment_terms && <p className="crm-mt"><strong>Payment terms:</strong> {inv.payment_terms}</p>}
        {inv.bank_instructions && <p><strong>Payment instructions:</strong> {inv.bank_instructions}</p>}

        <div className="crm-client-quote-actions crm-mt-lg crm-no-print">
          <button type="button" className="crm-btn crm-btn-inline" onClick={handlePrint}>Download / Print PDF</button>
        </div>
      </div>
    </div>
  );
}

export default ClientInvoiceView;
