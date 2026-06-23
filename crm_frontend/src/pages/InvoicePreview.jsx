import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import InvoiceDocument from "../components/InvoiceDocument";
import { apiFetch } from "../utils/api";

function InvoicePreview() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [inv, setInv] = useState(null);
  const [company, setCompany] = useState(null);
  const [branding, setBranding] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(`/invoices/${id}`),
      apiFetch("/admin/company").catch(() => null),
      apiFetch("/invoices/defaults").catch(() => null),
    ])
      .then(([i, c, defaults]) => {
        setInv(i);
        setCompany(c);
        setBranding(defaults);
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

  return (
    <DashboardLayout title="Invoice Preview" roleLabel={role}>
      <div className="crm-panel crm-no-print">
        <div className="crm-detail-header">
          <Link to={`/invoices/${id}`} className="crm-link crm-link-left">← Back to invoice</Link>
          <button type="button" className="crm-btn crm-btn-sm" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>

      <InvoiceDocument inv={inv} company={company} branding={branding} showStatus />
    </DashboardLayout>
  );
}

export default InvoicePreview;
