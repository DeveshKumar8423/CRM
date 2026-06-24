import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function PosSettings() {
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(null);
  const [regName, setRegName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch("/pos/settings").then(setForm).catch((err) => setError(err.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaved(false);
    try {
      const data = await apiFetch("/pos/settings", { method: "PUT", body: JSON.stringify(form) });
      setForm(data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const addRegister = async () => {
    await apiFetch("/pos/registers", {
      method: "POST",
      body: JSON.stringify({ name: regName, code: regCode }),
    });
    setRegName("");
    setRegCode("");
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <DashboardLayout title="POS settings" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos" className="crm-muted">← Point of Sale</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {saved && <p className="crm-success crm-mt">Settings saved.</p>}
        {form && (
          <form className="crm-form crm-mt" onSubmit={save}>
            <div className="crm-form-field">
              <label><input type="checkbox" checked={form.is_enabled} onChange={(e) => setField("is_enabled", e.target.checked)} /> Enable POS</label>
            </div>
            <div className="crm-form-field"><label>Bill prefix</label><input value={form.bill_number_prefix} onChange={(e) => setField("bill_number_prefix", e.target.value)} /></div>
            <div className="crm-form-field">
              <label><input type="checkbox" checked={form.auto_create_invoice} onChange={(e) => setField("auto_create_invoice", e.target.checked)} /> Auto-create invoice</label>
            </div>
            <div className="crm-form-field">
              <label><input type="checkbox" checked={form.inventory_deduct_on_sale} onChange={(e) => setField("inventory_deduct_on_sale", e.target.checked)} /> Deduct inventory on sale</label>
            </div>
            <div className="crm-form-field"><label>Receipt footer</label><textarea rows={2} value={form.receipt_footer || ""} onChange={(e) => setField("receipt_footer", e.target.value)} /></div>
            <div className="crm-form-field"><label>Return window (days)</label><input type="number" value={form.return_window_days} onChange={(e) => setField("return_window_days", Number(e.target.value))} /></div>
            <button type="submit" className="crm-btn">Save</button>
          </form>
        )}
        <h3 className="crm-mt">Add register</h3>
        <div className="crm-form">
          <input placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} />
          <input placeholder="Code" value={regCode} onChange={(e) => setRegCode(e.target.value)} />
          <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={addRegister}>Add register</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PosSettings;
