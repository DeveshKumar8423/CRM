import {
  STATUS_LABELS,
  formatCurrency,
  formatInvoiceDate,
  parseBankInstructions,
  statusBadgeClass,
} from "../utils/invoices";
import { INVOICE_BRANDING } from "../utils/invoiceBranding";
import LineItemDescription from "./LineItemDescription";

function formatSheetAddress(company) {
  if (!company) return INVOICE_BRANDING.address || "";
  const cityPin = [company.city, company.pincode].filter(Boolean).join("-");
  const parts = [
    company.address_line1,
    company.address_line2,
    cityPin,
  ].filter(Boolean);
  const line = parts.join(", ");
  return line ? `${line}.` : "";
}

function formatSheetPhone(phone) {
  if (!phone) return "";
  return phone.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ").trim();
}

function mergeBranding(company, branding) {
  const base = { ...INVOICE_BRANDING, ...branding };
  return {
    ...base,
    display_name: base.company_display_name || base.display_name || company?.legal_name || company?.display_name,
    legal_name: company?.legal_name || base.legal_name,
    email: company?.email || base.email,
    phone: formatSheetPhone(base.phone || company?.phone),
    address: formatSheetAddress(company) || base.address,
    tagline: company?.tagline || base.tagline,
    cin: company?.cin || base.cin,
    document_title: company?.invoice_document_title || base.document_title,
    signatory_name: company?.signatory_name || base.signatory_name,
    org_type: base.org_type,
    client_nature: base.client_nature,
    terms_label: base.terms_label,
  };
}

function MetaRow({ label, value }) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value || "—"}</td>
    </tr>
  );
}

function InvoiceDocument({
  inv,
  company,
  branding,
  showStatus = false,
  clientMode = false,
  isOverdue = false,
}) {
  const b = mergeBranding(company, branding);
  const bankRows = parseBankInstructions(inv.bank_instructions || b.bank_instructions);
  const preparedBy = inv.assigned_to_name || inv.created_by_name || "—";
  const salesRep = inv.assigned_to_name || preparedBy;
  const salesEmail = inv.assigned_to_email || b.email;
  const salesPhone = formatSheetPhone(b.phone)?.split("/")[0]?.trim() || b.phone;
  const placeOfSupply = inv.billing_address?.trim() || company?.state || "—";
  const paymentTerms = (inv.payment_terms || "Due on receipt").split("\n")[0];
  const qtyDisplay = (li) => {
    const qty = Number(li.quantity);
    if (!qty || qty <= 0) return "—";
    return String(qty);
  };

  return (
    <div className={`crm-invoice-sheet ${isOverdue ? "crm-quote-expired" : ""}`}>
      <header className="crm-invoice-sheet-header">
        <div className="crm-invoice-sheet-top">
          <img src="/branding/logo.svg" alt="BlackPapers" className="crm-invoice-sheet-logo" />
          <div className="crm-invoice-sheet-title-wrap">
            <h1 className="crm-invoice-sheet-doc-title">{b.document_title || "Service Invoice"}</h1>
            <h2 className="crm-invoice-sheet-company">{b.display_name}</h2>
            {b.tagline && <p className="crm-invoice-sheet-tagline">{b.tagline}</p>}
          </div>
          {b.cin && <div className="crm-invoice-sheet-cin">CIN: {b.cin}</div>}
        </div>

        {showStatus && (
          <p className="crm-invoice-sheet-status">
            <span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span>
          </p>
        )}

        <div className="crm-invoice-sheet-row crm-invoice-sheet-row-split">
          <div className="crm-invoice-sheet-cell crm-invoice-sheet-contact">
            {b.address && (
              <p><strong>Address :</strong> {b.address}</p>
            )}
            {b.phone && (
              <p><strong>Phone:</strong> <span className="crm-invoice-sheet-phone">{b.phone}</span></p>
            )}
          </div>
          <table className="crm-invoice-sheet-meta">
            <tbody>
              <MetaRow label="Date" value={formatInvoiceDate(inv.issue_date)} />
              <MetaRow label="Invoice #" value={inv.invoice_number || "Draft"} />
              <MetaRow label="Org. Type" value={b.org_type} />
              <MetaRow label="Client Nature" value={b.client_nature} />
              <MetaRow label="Prepared by" value={preparedBy} />
            </tbody>
          </table>
        </div>

        <table className="crm-invoice-sheet-block">
          <tbody>
            <MetaRow label="Person Name" value={inv.client_name} />
            <MetaRow label="NGO Name" value={inv.client_org} />
            <MetaRow label="POS" value={placeOfSupply} />
          </tbody>
        </table>

        <table className="crm-invoice-sheet-block crm-invoice-sheet-sales">
          <thead>
            <tr>
              <th>Sales Representative</th>
              <th>Email ID</th>
              <th>Contact Number</th>
              <th>Expected Completion Date*</th>
              <th>Terms</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{salesRep}</td>
              <td>{salesEmail ? <a href={`mailto:${salesEmail}`}>{salesEmail}</a> : "—"}</td>
              <td>{salesPhone || "—"}</td>
              <td>{inv.due_date ? formatInvoiceDate(inv.due_date) : ""}</td>
              <td>{paymentTerms}</td>
            </tr>
          </tbody>
        </table>
      </header>

      {clientMode && (
        <div className="crm-invoice-sheet-client-banner">
          <div>
            <span>Balance due</span>
            <strong>{formatCurrency(inv.outstanding_amount, inv.currency)}</strong>
          </div>
          {inv.amount_paid > 0 && (
            <p>Paid: {formatCurrency(inv.amount_paid, inv.currency)} of {formatCurrency(inv.grand_total, inv.currency)}</p>
          )}
          {isOverdue && <p className="crm-invoice-sheet-overdue">This invoice is overdue.</p>}
        </div>
      )}

      <table className="crm-invoice-sheet-lines">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Qty.</th>
            <th>Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.line_items.map((li, idx) => (
            <tr key={li.id ?? idx}>
              <td className="crm-invoice-sheet-center">{idx + 1}</td>
              <td>
                {li.item_name}
                <LineItemDescription itemName={li.item_name} description={li.description} />
              </td>
              <td className="crm-invoice-sheet-num">{formatCurrency(li.unit_price, inv.currency)}</td>
              <td className="crm-invoice-sheet-center">{qtyDisplay(li)}</td>
              <td className="crm-invoice-sheet-num">{formatCurrency(li.line_total, inv.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="crm-invoice-sheet-footer-grid">
        <div className="crm-invoice-sheet-balance">
          <span>Balance Due</span>
          <strong>{formatCurrency(inv.outstanding_amount, inv.currency)}</strong>
        </div>

        <div className="crm-invoice-sheet-totals">
          <div className="crm-invoice-sheet-total-row"><span>Subtotal</span><span>{formatCurrency(inv.subtotal, inv.currency)}</span></div>
          <div className="crm-invoice-sheet-total-row"><span>Tax Rate</span><span>{inv.total_tax > 0 ? formatCurrency(inv.total_tax, inv.currency) : ""}</span></div>
          {inv.amount_paid > 0 && (
            <div className="crm-invoice-sheet-total-row"><span>Token Deposited</span><span>{formatCurrency(inv.amount_paid, inv.currency)}</span></div>
          )}
          <div className="crm-invoice-sheet-total-row crm-invoice-sheet-total-main">
            <span>Payable Amount</span><strong>{formatCurrency(inv.outstanding_amount, inv.currency)}</strong>
          </div>
        </div>
      </div>

      {bankRows.length > 0 && (
        <section className="crm-invoice-sheet-payment">
          <h3>Payment Details</h3>
          <div className="crm-invoice-sheet-payment-grid">
            <dl className="crm-invoice-sheet-bank-list">
              {bankRows.map((row) => (
                <div key={row.label} className="crm-invoice-sheet-bank-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="crm-invoice-sheet-qr" aria-hidden="true">
              <span>UPI</span>
              <small>blackpapers@kotak</small>
            </div>
          </div>
        </section>
      )}

      <footer className="crm-invoice-sheet-closing">
        {inv.billing_notes && <p className="crm-invoice-sheet-thanks">{inv.billing_notes}</p>}
        <p>{b.terms_label}</p>
        <div className="crm-invoice-sheet-signatory">
          <p>Authorized Signatory</p>
          <strong>{b.signatory_name}</strong>
        </div>
      </footer>
    </div>
  );
}

export default InvoiceDocument;
