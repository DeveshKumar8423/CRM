import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { INVOICE_TYPES, STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/invoices";

function InvoicePreview() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [inv, setInv] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(`/invoices/${id}`),
      apiFetch("/admin/company").catch(() => null),
    ])
      .then(([i, c]) => {
        setInv(i);
        setCompany(c);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handlePrint = () => window.print();

  if (!inv && !error) {
    return (
      <DashboardLayout title="Preview" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Preview" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  const companyAddress = company
    ? [company.address_line1, company.address_line2, company.city, company.state, company.pincode, company.country]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <DashboardLayout title="Invoice Preview" roleLabel={role}>
      <div className="crm-panel crm-no-print">
        <div className="crm-detail-header">
          <Link to={`/invoices/${id}`} className="crm-link crm-link-left">← Back to invoice</Link>
          <button type="button" className="crm-btn crm-btn-sm" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>

      <div className="crm-quote-document crm-panel">
        <header className="crm-quote-doc-header">
          <div>
            <h1>{company?.display_name || "Company"}</h1>
            {company?.legal_name && company.legal_name !== company.display_name && (
              <p className="crm-muted">{company.legal_name}</p>
            )}
            {companyAddress && <p className="crm-muted">{companyAddress}</p>}
            {company?.gstin && <p className="crm-muted">GSTIN: {company.gstin}</p>}
          </div>
          <div className="crm-quote-doc-meta">
            <h2>TAX INVOICE</h2>
            <p><strong>{inv.invoice_number || "Draft"}</strong></p>
            <span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span>
            <p>Issue date: {formatDate(inv.issue_date)}</p>
            <p>Due date: {formatDate(inv.due_date)}</p>
            <p>Type: {INVOICE_TYPES[inv.invoice_type] || inv.invoice_type}</p>
          </div>
        </header>

        <section className="crm-quote-doc-parties">
          <div>
            <h3>Bill to</h3>
            <p><strong>{inv.client_name || "Client"}</strong></p>
            {inv.client_org && <p>{inv.client_org}</p>}
            {inv.billing_address && <p className="crm-muted">{inv.billing_address}</p>}
            {inv.client_gstin && <p>GSTIN: {inv.client_gstin}</p>}
            {inv.client_email && <p>{inv.client_email}</p>}
          </div>
          <div>
            <h3>References</h3>
            {inv.sales_order_number && <p>Order: {inv.sales_order_number}</p>}
            {inv.quotation_number && <p>Quote: {inv.quotation_number}</p>}
            <p>Outstanding: <strong>{formatCurrency(inv.outstanding_amount, inv.currency)}</strong></p>
          </div>
        </section>

        <h3 className="crm-mt-lg">{inv.title}</h3>

        <table className="crm-table crm-quote-doc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th className="crm-num">Rate</th>
              <th className="crm-num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.line_items.map((li, idx) => (
              <tr key={li.id}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{li.item_name}</strong>
                  {li.description && <div className="crm-muted">{li.description}</div>}
                </td>
                <td>{li.quantity} {li.unit}</td>
                <td className="crm-num">{formatCurrency(li.unit_price, inv.currency)}</td>
                <td className="crm-num">{formatCurrency(li.line_total, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="crm-quote-doc-totals">
          <div className="crm-quote-summary-row"><span>Subtotal</span><span>{formatCurrency(inv.subtotal, inv.currency)}</span></div>
          {inv.line_discount_total > 0 && (
            <div className="crm-quote-summary-row"><span>Line discounts</span><span>−{formatCurrency(inv.line_discount_total, inv.currency)}</span></div>
          )}
          {inv.header_discount_amount > 0 && (
            <div className="crm-quote-summary-row"><span>Header discount</span><span>−{formatCurrency(inv.header_discount_amount, inv.currency)}</span></div>
          )}
          <div className="crm-quote-summary-row"><span>Tax</span><span>{formatCurrency(inv.total_tax, inv.currency)}</span></div>
          {inv.round_off !== 0 && (
            <div className="crm-quote-summary-row"><span>Round-off</span><span>{formatCurrency(inv.round_off, inv.currency)}</span></div>
          )}
          <div className="crm-quote-summary-total"><span>Grand total</span><strong>{formatCurrency(inv.grand_total, inv.currency)}</strong></div>
          {inv.amount_paid > 0 && (
            <div className="crm-quote-summary-row"><span>Amount paid</span><span>{formatCurrency(inv.amount_paid, inv.currency)}</span></div>
          )}
          <div className="crm-quote-summary-total"><span>Balance due</span><strong>{formatCurrency(inv.outstanding_amount, inv.currency)}</strong></div>
        </div>

        <section className="crm-quote-doc-terms crm-mt-lg">
          {inv.payment_terms && <p><strong>Payment terms:</strong> {inv.payment_terms}</p>}
          {inv.bank_instructions && <p><strong>Bank instructions:</strong> {inv.bank_instructions}</p>}
          {inv.billing_notes && <p><strong>Notes:</strong> {inv.billing_notes}</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default InvoicePreview;
