import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/quotations";

function QuotationPreview() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [quote, setQuote] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(`/quotations/${id}`),
      apiFetch("/admin/company").catch(() => null),
    ])
      .then(([q, c]) => {
        setQuote(q);
        setCompany(c);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handlePrint = () => window.print();

  if (!quote && !error) {
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
    <DashboardLayout title="Quotation Preview" roleLabel={role}>
      <div className="crm-panel crm-no-print">
        <div className="crm-detail-header">
          <Link to={`/quotations/${id}`} className="crm-link crm-link-left">← Back to quote</Link>
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
            <h2>QUOTATION</h2>
            <p><strong>{quote.quote_number}</strong></p>
            <span className={statusBadgeClass(quote.status)}>{STATUS_LABELS[quote.status]}</span>
            <p>Date: {formatDate(quote.quote_date)}</p>
            <p>Valid until: {formatDate(quote.valid_until)}</p>
          </div>
        </header>

        <section className="crm-quote-doc-parties">
          <div>
            <h3>Bill to</h3>
            <p><strong>{quote.client_name || "Client"}</strong></p>
            {quote.client_org && <p>{quote.client_org}</p>}
            {quote.attention_to && <p>Attn: {quote.attention_to}</p>}
            {quote.billing_address && <p className="crm-muted">{quote.billing_address}</p>}
            {quote.client_email && <p>{quote.client_email}</p>}
          </div>
          <div>
            <h3>Prepared by</h3>
            <p>{quote.assigned_to_name || quote.created_by_name || "—"}</p>
            {quote.deal_title && <p className="crm-muted">Deal: {quote.deal_title}</p>}
          </div>
        </section>

        <h3 className="crm-mt-lg">{quote.title}</h3>

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
            {quote.line_items.map((li, idx) => (
              <tr key={li.id}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{li.item_name}</strong>
                  {li.description && <div className="crm-muted">{li.description}</div>}
                </td>
                <td>{li.quantity} {li.unit}</td>
                <td className="crm-num">{formatCurrency(li.unit_price, quote.currency)}</td>
                <td className="crm-num">{formatCurrency(li.line_total, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="crm-quote-doc-totals">
          <div className="crm-quote-summary-row"><span>Subtotal</span><span>{formatCurrency(quote.subtotal, quote.currency)}</span></div>
          {quote.line_discount_total > 0 && (
            <div className="crm-quote-summary-row"><span>Line discounts</span><span>−{formatCurrency(quote.line_discount_total, quote.currency)}</span></div>
          )}
          {(quote.header_discount_amount > 0 || quote.header_discount_percent > 0) && (
            <div className="crm-quote-summary-row"><span>Header discount</span><span>−{formatCurrency(quote.header_discount_amount, quote.currency)}</span></div>
          )}
          <div className="crm-quote-summary-row"><span>Tax</span><span>{formatCurrency(quote.total_tax, quote.currency)}</span></div>
          <div className="crm-quote-summary-total"><span>Grand total</span><strong>{formatCurrency(quote.grand_total, quote.currency)}</strong></div>
        </div>

        <section className="crm-quote-doc-terms crm-mt-lg">
          {quote.scope_notes && <p><strong>Scope:</strong> {quote.scope_notes}</p>}
          {quote.deliverables && <p><strong>Deliverables:</strong> {quote.deliverables}</p>}
          {quote.timeline_notes && <p><strong>Timeline:</strong> {quote.timeline_notes}</p>}
          {quote.payment_terms && <p><strong>Payment terms:</strong> {quote.payment_terms}</p>}
          {quote.validity_clause && <p><strong>Validity:</strong> {quote.validity_clause}</p>}
          {quote.cancellation_clause && <p><strong>Cancellation:</strong> {quote.cancellation_clause}</p>}
          {quote.legal_footer && <p className="crm-muted crm-mt">{quote.legal_footer}</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default QuotationPreview;
