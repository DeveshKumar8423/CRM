import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { emptyBlogForm } from "../utils/website";

function WebsiteBlogEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyBlogForm());
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/website/blog/${id}`)
      .then((post) => {
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          body_html: post.body_html || "",
          cover_image_url: post.cover_image_url || "",
          seo_title: post.seo_title || "",
          seo_description: post.seo_description || "",
          tags: post.tags || [],
        });
        setStatus(post.status);
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await apiFetch(`/website/blog/${id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        const created = await apiFetch("/website/blog", { method: "POST", body: JSON.stringify(form) });
        navigate(`/website/blog/${created.id}/edit`, { replace: true });
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!isEdit) return;
    await apiFetch(`/website/blog/${id}/publish`, { method: "POST" });
    setStatus("published");
  };

  return (
    <DashboardLayout title={isEdit ? "Edit blog post" : "New blog post"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/website/blog" className="crm-back-link">← Blog</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-form-grid crm-mt">
          <div className="crm-form-field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="crm-form-field"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="crm-form-field crm-form-field-full"><label>Excerpt</label><textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
          <div className="crm-form-field crm-form-field-full"><label>Cover image URL</label><input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></div>
          <div className="crm-form-field crm-form-field-full"><label>Body (HTML)</label><textarea rows={12} value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} /></div>
          <div className="crm-form-field"><label>SEO title</label><input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
          <div className="crm-form-field"><label>Tags (comma-separated)</label><input value={(form.tags || []).join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
        </div>
        <div className="crm-form-actions crm-mt">
          <button type="button" className="crm-btn crm-btn-outline" onClick={() => navigate("/website/blog")}>Cancel</button>
          {hasPermission("website.manage") && <button type="button" className="crm-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>}
          {hasPermission("website.publish") && isEdit && status !== "published" && (
            <button type="button" className="crm-btn crm-btn-inline" onClick={publish}>Publish</button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WebsiteBlogEditor;
