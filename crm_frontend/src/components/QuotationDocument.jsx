import BankDetailsList from "./BankDetailsList";
import {
  buildFormalQuoteTitle,
  chunkWhyChoose,
  formatInvestmentAmount,
  formatQuoteLongDate,
  linkifyFooterLine,
  parseFooterLines,
  parseTextList,
  splitParagraphs,
} from "../utils/quotationText";
import { STATUS_LABELS, statusBadgeClass } from "../utils/quotations";

function mergeDefaults(quote, defaults) {
  return {
    scope_notes: quote.scope_notes || defaults?.scope_notes || "",
    project_overview: defaults?.project_overview || "",
    deliverables: quote.deliverables || defaults?.deliverables || "",
    timeline_notes: quote.timeline_notes || defaults?.timeline_notes || "",
    investment_commission: defaults?.investment_commission || "",
    investment_includes: defaults?.investment_includes || "",
    payment_installments: defaults?.payment_installments || quote.payment_terms || "",
    bank_instructions: defaults?.bank_instructions || "",
    bank_payment_intro: defaults?.bank_payment_intro || "You can pay via bank transfer / UPI / PayTM / Google Pay / PayPal at:",
    how_to_get_started: defaults?.how_to_get_started || "",
    why_choose_items: defaults?.why_choose_items || "",
    documents_checklist: quote.cancellation_clause || defaults?.documents_checklist || "",
    legal_footer: quote.legal_footer || defaults?.legal_footer || "",
    prepared_by_label: defaults?.prepared_by_label || "BlackPapers Sarthies Private Limited",
    document_subtitle: defaults?.document_subtitle || "Service Quotation",
    validity_clause: quote.validity_clause || defaults?.validity_clause || "",
  };
}

function QuotePageFooter({ label, page }) {
  return (
    <footer className="crm-formal-quote-page-footer">
      <span>{label}</span>
      <span>{page}</span>
    </footer>
  );
}

function QuotationDocument({
  quote,
  defaults,
  showStatus = false,
  isExpired = false,
}) {
  const content = mergeDefaults(quote, defaults);
  const formalTitle = buildFormalQuoteTitle(quote);
  const deliverables = parseTextList(content.deliverables);
  const documents = parseTextList(content.documents_checklist);
  const includes = parseTextList(content.investment_includes);
  const installments = parseTextList(content.payment_installments);
  const howToSteps = splitParagraphs(content.how_to_get_started);
  const whyChoose = chunkWhyChoose(parseTextList(content.why_choose_items));
  const timelineParts = splitParagraphs(content.timeline_notes);
  const footerLines = parseFooterLines(content.legal_footer);
  const investmentTotal = formatInvestmentAmount(quote.grand_total, quote.currency);

  return (
    <div className={`crm-formal-quote ${isExpired ? "crm-quote-expired" : ""}`}>
      <div className="crm-formal-quote-watermark" aria-hidden="true">B</div>

      <section className="crm-formal-quote-page">
        <p className="crm-formal-quote-prepared">Prepared by {content.prepared_by_label}</p>
        {showStatus && (
          <p className="crm-formal-quote-status">
            <span className={statusBadgeClass(quote.status)}>{STATUS_LABELS[quote.status]}</span>
          </p>
        )}
        <h1 className="crm-formal-quote-title">{formalTitle}</h1>
        <p className="crm-formal-quote-meta">
          [Quotation Number: <span className="crm-formal-quote-accent">{quote.quote_number}</span>
          {" "}dated on <span className="crm-formal-quote-accent">{formatQuoteLongDate(quote.quote_date)}</span>]
        </p>

        <div className="crm-formal-quote-logos">
          <img src="/branding/ca-india.png" alt="CA India" className="crm-formal-quote-logo-ca" />
          <img src="/branding/logo.svg" alt="BlackPapers" className="crm-formal-quote-logo-bp" />
        </div>

        {content.scope_notes && <p className="crm-formal-quote-intro">{content.scope_notes}</p>}
        {content.project_overview && (
          <p className="crm-formal-quote-intro">
            {content.project_overview.includes("Quick Project Overview") ? (
              <>
                {content.project_overview.split("Quick Project Overview")[0]}
                <strong>Quick Project Overview</strong>
                {content.project_overview.split("Quick Project Overview")[1]}
              </>
            ) : content.project_overview}
          </p>
        )}

        <h2 className="crm-formal-quote-section-title">Project Details:</h2>
        <p className="crm-formal-quote-subtitle">Our Service Include:</p>
        {deliverables.length > 0 && (
          <ul className="crm-formal-quote-list">
            {deliverables.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        <QuotePageFooter label={content.document_subtitle} page={1} />
      </section>

      <section className="crm-formal-quote-page">
        <p className="crm-formal-quote-prepared">Prepared by {content.prepared_by_label}</p>

        <h2 className="crm-formal-quote-section-title">Project Investment:</h2>
        <p><strong>Total Investment Will Be:</strong></p>
        <p className="crm-formal-quote-investment-total">{investmentTotal} and,</p>
        {content.investment_commission && (
          <p className="crm-formal-quote-investment-note">{content.investment_commission}</p>
        )}
        {includes.length > 0 && (
          <ul className="crm-formal-quote-list crm-formal-quote-list-accent">
            {includes.map((item) => <li key={item}><strong><em>{item}</em></strong></li>)}
          </ul>
        )}

        <h2 className="crm-formal-quote-section-title crm-mt-lg">Payment Terms:</h2>
        {installments.length > 0 ? (
          <ul className="crm-formal-quote-list crm-formal-quote-list-accent crm-formal-quote-list-plain">
            {installments.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="crm-formal-quote-investment-note">{content.payment_installments}</p>
        )}

        <h2 className="crm-formal-quote-section-title crm-mt-lg">Project Timeline:</h2>
        {timelineParts.map((part) => (
          <p key={part} className="crm-formal-quote-body">{part}</p>
        ))}

        <h2 className="crm-formal-quote-section-title crm-mt-lg">Documents Required for Registration:</h2>
        {documents.length > 0 && (
          <ol className="crm-formal-quote-numbered">
            {documents.slice(0, 8).map((item) => <li key={item}>{item}</li>)}
          </ol>
        )}

        <QuotePageFooter label={content.document_subtitle} page={2} />
      </section>

      <section className="crm-formal-quote-page">
        <p className="crm-formal-quote-prepared">Prepared by {content.prepared_by_label}</p>

        {documents.length > 8 && (
          <>
            <ol className="crm-formal-quote-numbered crm-formal-quote-numbered-continue" start={9}>
              {documents.slice(8).map((item) => <li key={item}>{item}</li>)}
            </ol>
          </>
        )}

        <h2 className="crm-formal-quote-section-title crm-mt-lg">Bank Details:</h2>
        <p className="crm-formal-quote-body">{content.bank_payment_intro}</p>
        <BankDetailsList text={content.bank_instructions} className="crm-formal-quote-bank" />

        <h2 className="crm-formal-quote-section-title crm-mt-lg">How to Get Started in 2 Simple Steps</h2>
        {howToSteps.length > 0 ? (
          <ul className="crm-formal-quote-list">
            {howToSteps.map((step) => <li key={step}>{step}</li>)}
          </ul>
        ) : null}

        <h2 className="crm-formal-quote-section-title crm-mt-lg">Why Choose BlackPapers?</h2>

        <QuotePageFooter label={content.document_subtitle} page={3} />
      </section>

      <section className="crm-formal-quote-page">
        <p className="crm-formal-quote-prepared">Prepared by {content.prepared_by_label}</p>

        <div className="crm-formal-quote-why-grid crm-formal-quote-why-grid-full">
          {whyChoose.flat().map((item) => (
            <div key={item} className="crm-formal-quote-why-item">{item}</div>
          ))}
        </div>

        <div className="crm-formal-quote-signature">
          {footerLines.map((line) => {
            const linked = linkifyFooterLine(line);
            if (linked.href) {
              return (
                <p key={line}>
                  {linked.label ? `${linked.label}: ` : ""}
                  <a href={linked.href} target="_blank" rel="noreferrer">{linked.text}</a>
                </p>
              );
            }
            return <p key={line}>{line.startsWith("Thanks") ? line : (line.includes("Tripathi") ? <strong>{line}</strong> : line)}</p>;
          })}
        </div>

        {content.validity_clause && (
          <p className="crm-formal-quote-validity crm-mt-lg">{content.validity_clause}</p>
        )}
        {quote.valid_until && (
          <p className="crm-muted">Valid until: {formatQuoteLongDate(quote.valid_until)}</p>
        )}

        <QuotePageFooter label={content.document_subtitle} page={4} />
      </section>
    </div>
  );
}

export default QuotationDocument;
