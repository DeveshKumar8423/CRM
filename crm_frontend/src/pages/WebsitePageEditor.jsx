import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import WebsiteSectionRenderer, { PublicSiteShell } from "../components/WebsiteSectionRenderer";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { PAGE_TYPE_LABELS, SECTION_LABELS, defaultSection, emptyPageForm } from "../utils/website";

function WebsitePageEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [meta, setMeta] = useState({ templates: [], section_types: [] });
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(emptyPageForm());
  const [pageMeta, setPageMeta] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [companySlug, setCompanySlug] = useState("");

  useEffect(() => {
    apiFetch("/website/meta").then(setMeta).catch(() => {});
    apiFetch("/website/forms").then((d) => setForms(d.items || [])).catch(() => {});
    apiFetch("/website/settings").then((s) => setCompanySlug(s.company_slug)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/website/pages/${id}`)
      .then((page) => {
        setForm({
          title: page.title,
          slug: page.slug,
          page_type: page.page_type,
          seo_title: page.seo_title || "",
          seo_description: page.seo_description || "",
          sections_json: page.sections_json || [],
          product_id: page.product_id,
          is_home: page.is_home,
        });
        setPageMeta(page);
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (isEdit) {
        const updated = await apiFetch(`/website/pages/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        setPageMeta(updated);
      } else {
        const created = await apiFetch("/website/pages", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/website/pages/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const createFromTemplate = async (templateKey) => {
    setSaving(true);
    setError("");
    try {
      const created = await apiFetch("/website/pages", {
        method: "POST",
        body: JSON.stringify({ title: meta.templates.find((t) => t.key === templateKey)?.label || "New page", template_key: templateKey }),
      });
      navigate(`/website/pages/${created.id}/edit`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type) => {
    setForm((f) => ({ ...f, sections_json: [...(f.sections_json || []), defaultSection(type)] }));
  };

  const moveSection = (index, dir) => {
    const sections = [...(form.sections_json || [])];
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setForm((f) => ({ ...f, sections_json: sections }));
  };

  const updateSection = (index, props) => {
    const sections = [...(form.sections_json || [])];
    sections[index] = { ...sections[index], props: { ...sections[index].props, ...props } };
    setForm((f) => ({ ...f, sections_json: sections }));
  };

  const removeSection = (index) => {
    setForm((f) => ({ ...f, sections_json: f.sections_json.filter((_, i) => i !== index) }));
  };

  const publish = async () => {
    if (!isEdit) return;
    await apiFetch(`/website/pages/${id}/publish`, { method: "POST" });
    const updated = await apiFetch(`/website/pages/${id}`);
    setPageMeta(updated);
  };

  if (!isEdit) {
    return (
      <DashboardLayout title="New page" roleLabel={role}>
        <div className="crm-panel">
          <Link to="/website/pages" className="crm-back-link">← Pages</Link>
          <h2 className="crm-mt">Choose a starter template</h2>
          {error && <p className="crm-error">{error}</p>}
          <div className="crm-website-template-grid crm-mt">
            {(meta.templates || []).map((t) => (
              <button key={t.key} type="button" className="crm-website-template-card" onClick={() => createFromTemplate(t.key)} disabled={saving}>
                <strong>{t.label}</strong>
                <span className="crm-muted">{PAGE_TYPE_LABELS[t.page_type]}</span>
              </button>
            ))}
          </div>
          <p className="crm-muted crm-mt">Or <Link to="#" onClick={(e) => { e.preventDefault(); navigate("/website/pages/new-blank"); }}>start blank</Link> from the editor after creating manually.</p>
          <div className="crm-form-actions crm-mt">
            <button type="button" className="crm-btn crm-btn-outline" onClick={() => navigate("/website/pages")}>Cancel</button>
            <button
              type="button"
              className="crm-btn"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  const created = await apiFetch("/website/pages", {
                    method: "POST",
                    body: JSON.stringify({ title: "Untitled page", page_type: "general", sections_json: [] }),
                  });
                  navigate(`/website/pages/${created.id}/edit`);
                } catch (err) {
                  setError(err.message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Blank page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit page" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/website/pages" className="crm-back-link">← Pages</Link>
        {pageMeta && <p className="crm-muted crm-mt"><span className={pageMeta.status === "published" ? "crm-badge crm-badge-success" : "crm-badge crm-badge-warning"}>{pageMeta.status}</span></p>}
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-form-grid crm-mt">
          <div className="crm-form-field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="crm-form-field"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="crm-form-field">
            <label>Page type</label>
            <select value={form.page_type} onChange={(e) => setForm({ ...form, page_type: e.target.value })}>
              {Object.entries(PAGE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field"><label>SEO title</label><input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
          <div className="crm-form-field crm-form-field-full"><label>SEO description</label><textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></div>
          <label className="crm-checkbox crm-form-field-full"><input type="checkbox" checked={form.is_home} onChange={(e) => setForm({ ...form, is_home: e.target.checked })} /> Set as home page</label>
        </div>

        <h3 className="crm-mt">Sections</h3>
        <div className="crm-inline-actions crm-mt">
          {(meta.section_types || []).map((s) => (
            <button key={s.value} type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => addSection(s.value)}>{s.label}</button>
          ))}
        </div>
        {(form.sections_json || []).map((section, index) => (
          <div key={section.id || index} className="crm-website-editor-section crm-mt">
            <div className="crm-detail-header">
              <strong>{SECTION_LABELS[section.type] || section.type}</strong>
              <div className="crm-inline-actions">
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => moveSection(index, -1)}>↑</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => moveSection(index, 1)}>↓</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => removeSection(index)}>Remove</button>
              </div>
            </div>
            {section.type === "hero" && (
              <div className="crm-form-grid crm-mt">
                <div className="crm-form-field crm-form-field-full"><label>Headline</label><input value={section.props.headline || ""} onChange={(e) => updateSection(index, { headline: e.target.value })} /></div>
                <div className="crm-form-field crm-form-field-full"><label>Subheadline</label><input value={section.props.subheadline || ""} onChange={(e) => updateSection(index, { subheadline: e.target.value })} /></div>
                <div className="crm-form-field"><label>CTA label</label><input value={section.props.cta_label || ""} onChange={(e) => updateSection(index, { cta_label: e.target.value })} /></div>
                <div className="crm-form-field"><label>CTA link</label><input value={section.props.cta_link || ""} onChange={(e) => updateSection(index, { cta_link: e.target.value })} /></div>
              </div>
            )}
            {section.type === "rich_text" && (
              <div className="crm-form-grid crm-mt">
                <div className="crm-form-field crm-form-field-full"><label>Title</label><input value={section.props.title || ""} onChange={(e) => updateSection(index, { title: e.target.value })} /></div>
                <div className="crm-form-field crm-form-field-full"><label>Body (HTML)</label><textarea rows={6} value={section.props.body || ""} onChange={(e) => updateSection(index, { body: e.target.value })} /></div>
              </div>
            )}
            {section.type === "form_embed" && (
              <div className="crm-form-field crm-mt">
                <label>Form</label>
                <select value={section.props.form_id || ""} onChange={(e) => updateSection(index, { form_id: Number(e.target.value) || null })}>
                  <option value="">Select form</option>
                  {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}
          </div>
        ))}

        <div className="crm-form-actions crm-mt">
          {hasPermission("website.manage") && <button type="button" className="crm-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button>}
          <button type="button" className="crm-btn crm-btn-outline" onClick={() => setShowPreview((v) => !v)}>{showPreview ? "Hide preview" : "Preview"}</button>
          {hasPermission("website.publish") && pageMeta?.status !== "published" && (
            <button type="button" className="crm-btn crm-btn-inline" onClick={publish}>Publish</button>
          )}
          {pageMeta?.preview_token && (
            <a href={`/s/${companySlug}/${form.slug}?preview=${pageMeta.preview_token}`} target="_blank" rel="noreferrer" className="crm-btn crm-btn-sm crm-btn-outline">Open preview</a>
          )}
        </div>

        {showPreview && (
          <div className="crm-mt">
            <PublicSiteShell company={{ display_name: "Preview", city: "", country: "India" }} companySlug={companySlug || "preview"} preview>
              {(form.sections_json || []).map((section) => (
                <WebsiteSectionRenderer key={section.id} section={section} company={{ display_name: "Preview" }} companySlug={companySlug} forms={forms} products={[]} />
              ))}
            </PublicSiteShell>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WebsitePageEditor;
