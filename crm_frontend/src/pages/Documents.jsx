import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../components/DashboardLayout";
import RecordPicker from "../components/RecordPicker";
import { API_URL, apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  formatBytes,
  formatDate,
  getCategoryLabel,
  getFileIcon,
  getRecordLabel,
  getRecordRoute,
  downloadFile,
} from "../utils/documents";

function Documents() {
  const [searchParams] = useSearchParams();
  const initModule = searchParams.get("module") || "";
  const initRecordId = searchParams.get("record_id") || "";

  const role = localStorage.getItem("role") || "Staff";
  const canUpload = hasPermission("files.upload");
  const canDelete = hasPermission("files.delete");
  const canViewAll = hasPermission("files.view");

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 50 });
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ categories: [], allowed_extensions: [], max_file_size_mb: 10 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadCategory, setUploadCategory] = useState("documents");
  const [linkedRecord, setLinkedRecord] = useState(
    initModule && initRecordId
      ? { module: initModule, recordId: Number(initRecordId), label: `${initModule} #${initRecordId}` }
      : null,
  );
  const [uploadProgress, setUploadProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiFetch("/files/meta").then(setMeta).catch(() => {});
    if (canViewAll) {
      apiFetch("/files/stats/summary").then(setStats).catch(() => {});
    }
  }, [canViewAll]);

  const load = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (initModule && initRecordId) {
      params.set("related_module", initModule);
      params.set("related_record_id", initRecordId);
    }
    apiFetch(`/files?${params}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [search, categoryFilter, initModule, initRecordId]);

  const setFilesFromInput = (filesArray) => {
    setSelectedFiles(filesArray);
    setPreviews(
      filesArray.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null)),
    );
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setError("");
    setMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("category", uploadCategory);
    if (linkedRecord) {
      formData.append("related_module", linkedRecord.module);
      formData.append("related_record_id", String(linkedRecord.recordId));
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        onUploadProgress: (ev) => {
          setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });
      setMessage("Files uploaded successfully.");
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(null);
      if (!initRecordId) setLinkedRecord(null);
      load(1);
      if (canViewAll) apiFetch("/files/stats/summary").then(setStats).catch(() => {});
    } catch (err) {
      setUploadProgress(null);
      const errMsg = err.response?.data?.detail || "Upload failed. Please check file types and sizes.";
      setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Permanently delete this file?")) return;
    setError("");
    try {
      await apiFetch(`/files/${fileId}`, { method: "DELETE" });
      setMessage("File deleted successfully.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const extHint = (meta.allowed_extensions || []).join(", ").toUpperCase();

  return (
    <DashboardLayout title="Documents" roleLabel={role}>
      {initModule && initRecordId && (
        <div className="crm-panel crm-doc-filter-banner">
          <p>
            Showing documents for <strong>{initModule}</strong> record <strong>#{initRecordId}</strong>
          </p>
          <Link to="/documents" className="crm-btn crm-btn-sm crm-btn-outline">Clear filter</Link>
        </div>
      )}

      {stats && (
        <div className="crm-stats-grid crm-mt">
          <div className="crm-stat-card">
            <p className="crm-stat-label">Total documents</p>
            <p className="crm-stat-value">{stats.total_count}</p>
          </div>
          <div className="crm-stat-card">
            <p className="crm-stat-label">Storage used</p>
            <p className="crm-stat-value">{formatBytes(stats.total_bytes)}</p>
          </div>
        </div>
      )}

      {canUpload && (
        <div className="crm-panel crm-mt">
          <h2>Upload documents</h2>
          <p className="crm-muted">Classify files by category and optionally link to a CRM record.</p>

          <form onSubmit={handleUpload} className="crm-mt">
            <div className="crm-form-grid">
              <div>
                <label>Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} disabled={uploadProgress !== null}>
                  {(meta.categories || []).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Link to record (optional)</label>
                <RecordPicker
                  value={linkedRecord}
                  onChange={setLinkedRecord}
                  disabled={uploadProgress !== null || Boolean(initRecordId)}
                />
              </div>
            </div>

            <div
              className={`crm-dropzone crm-mt ${isDragOver ? "active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.length) setFilesFromInput(Array.from(e.dataTransfer.files));
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => setFilesFromInput(Array.from(e.target.files || []))}
              />
              <span className="crm-dropzone-icon">📁</span>
              <p><strong>Drag & drop files</strong> or click to browse</p>
              <span className="crm-muted crm-text-sm">
                {extHint} — max {meta.max_file_size_mb || 10} MB per file
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="crm-mt">
                <p>{selectedFiles.length} file(s) selected</p>
                <div className="crm-previews-container">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="crm-preview-card" title={file.name}>
                      {previews[idx] ? (
                        <img src={previews[idx]} alt="" className="crm-preview-img" />
                      ) : (
                        <span className="crm-preview-fallback">{getFileIcon(file.type)}</span>
                      )}
                    </div>
                  ))}
                </div>
                {uploadProgress !== null && (
                  <div className="crm-progress-bar-container crm-mt">
                    <div className="crm-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                <div className="crm-inline-actions crm-mt">
                  <button type="submit" className="crm-btn crm-btn-sm" disabled={uploadProgress !== null}>Upload all</button>
                  <button
                    type="button"
                    className="crm-btn crm-btn-sm crm-btn-outline"
                    onClick={() => { setSelectedFiles([]); setPreviews([]); }}
                    disabled={uploadProgress !== null}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="crm-panel crm-mt-lg">
        <div className="crm-detail-header">
          <div>
            <h2>Document repository</h2>
            <p className="crm-muted">{data.total} document{data.total === 1 ? "" : "s"}</p>
          </div>
          <div className="crm-doc-search-filters">
            <input
              type="text"
              placeholder="Search filename…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              {(meta.categories || []).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {loading && <p className="crm-muted crm-mt">Loading documents…</p>}

        {!loading && data.items.length === 0 && (
          <p className="crm-muted crm-mt">
            No documents found.
            {canUpload && <> <Link to="#top" onClick={(e) => e.preventDefault()}>Upload your first file above.</Link></>}
          </p>
        )}

        {!loading && data.items.length > 0 && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Category</th>
                  <th>Related record</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>By</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((file) => {
                  const route = getRecordRoute(file.related_module, file.related_record_id);
                  return (
                    <tr key={file.id}>
                      <td>
                        <span className="crm-doc-icon">{getFileIcon(file.file_type)}</span>
                        {file.original_filename}
                      </td>
                      <td>
                        <span className="crm-doc-category-badge">
                          {file.category_label || getCategoryLabel(file.category, meta)}
                        </span>
                      </td>
                      <td>
                        {route ? (
                          <Link to={route} className="crm-link">{getRecordLabel(file)}</Link>
                        ) : (
                          <span className="crm-muted">—</span>
                        )}
                      </td>
                      <td>{formatBytes(file.file_size)}</td>
                      <td className="crm-nowrap">{formatDate(file.created_at)}</td>
                      <td>{file.uploaded_by?.name || "—"}</td>
                      <td>
                        <div className="crm-table-actions">
                          <button
                            type="button"
                            className="crm-btn crm-btn-sm crm-btn-outline"
                            onClick={() => downloadFile(file, API_URL, localStorage.getItem("token"))}
                          >
                            Download
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              className="crm-btn crm-btn-sm crm-btn-outline crm-btn-danger-outline"
                              onClick={() => handleDelete(file.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>
              Previous
            </button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Documents;
