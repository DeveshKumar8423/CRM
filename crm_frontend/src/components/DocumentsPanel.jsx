import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { API_URL, apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  PANEL_DEFAULT_CATEGORY,
  downloadFile,
  formatBytes,
  getFileIcon,
} from "../utils/documents";

function resolveContext(props) {
  const map = [
    ["leads", props.leadId],
    ["deals", props.dealId],
    ["contacts", props.contactId],
    ["invoices", props.invoiceId],
    ["quotations", props.quotationId],
    ["sales_orders", props.salesOrderId],
    ["expenses", props.expenseId],
    ["vendor_bills", props.vendorBillId],
    ["projects", props.projectId],
    ["products", props.productId],
  ];
  for (const [module, id] of map) {
    if (id) return { relatedModule: module, relatedRecordId: Number(id) };
  }
  return { relatedModule: null, relatedRecordId: null };
}

function DocumentsPanel({
  leadId,
  dealId,
  contactId,
  invoiceId,
  quotationId,
  salesOrderId,
  expenseId,
  vendorBillId,
  projectId,
  productId,
  category: categoryProp,
  title = "Documents & Attachments",
}) {
  const { relatedModule, relatedRecordId } = resolveContext({
    leadId, dealId, contactId, invoiceId, quotationId, salesOrderId, expenseId, vendorBillId, projectId, productId,
  });
  const uploadCategory = categoryProp || PANEL_DEFAULT_CATEGORY[relatedModule] || "documents";

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const canUpload = hasPermission("files.upload");
  const canDelete = hasPermission("files.delete");
  const canView = hasPermission("files.view") || hasPermission("files.view_own");

  const loadFiles = () => {
    if (!relatedModule || !relatedRecordId) return;
    setLoading(true);
    apiFetch(`/files?related_module=${relatedModule}&related_record_id=${relatedRecordId}&limit=100`)
      .then((data) => setFiles(data.items || data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (canView) loadFiles();
  }, [relatedModule, relatedRecordId, canView]);

  if (!canView) return null;

  const setFilesFromInput = (filesArray) => {
    setSelectedFiles(filesArray);
    setPreviews(filesArray.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)));
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
    formData.append("related_module", relatedModule);
    formData.append("related_record_id", String(relatedRecordId));

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        onUploadProgress: (ev) => setUploadProgress(Math.round((ev.loaded * 100) / ev.total)),
      });
      setMessage("Files uploaded successfully.");
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(null);
      loadFiles();
    } catch (err) {
      setUploadProgress(null);
      const errMsg = err.response?.data?.detail || "Upload failed.";
      setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    }
  };

  return (
    <section className="crm-documents-panel crm-mt-lg">
      <div className="crm-detail-header">
        <h3>{title}</h3>
        <Link to={`/documents?module=${relatedModule}&record_id=${relatedRecordId}`} className="crm-link">
          View all
        </Link>
      </div>

      {message && <p className="crm-success crm-mt">{message}</p>}
      {error && <p className="crm-error crm-mt">{error}</p>}

      {canUpload && (
        <form onSubmit={handleUpload} className="crm-mt">
          <div
            className={`crm-dropzone ${isDragOver ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.length) setFilesFromInput(Array.from(e.dataTransfer.files));
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => setFilesFromInput(Array.from(e.target.files || []))} />
            <span className="crm-dropzone-icon">📁</span>
            <p><strong>Drag & drop files</strong> or click to browse</p>
            <span className="crm-muted crm-text-sm">PDF, Word, Excel, CSV, TXT, images (max 10 MB)</span>
          </div>

          {selectedFiles.length > 0 && (
            <div className="crm-mt">
              <div className="crm-previews-container">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="crm-preview-card" title={file.name}>
                    {previews[idx] ? <img src={previews[idx]} alt="" className="crm-preview-img" /> : <span className="crm-preview-fallback">{getFileIcon(file.type)}</span>}
                  </div>
                ))}
              </div>
              {uploadProgress !== null && (
                <div className="crm-progress-bar-container crm-mt">
                  <div className="crm-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <div className="crm-inline-actions crm-mt">
                <button type="submit" className="crm-btn crm-btn-sm" disabled={uploadProgress !== null}>Upload</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => { setSelectedFiles([]); setPreviews([]); }} disabled={uploadProgress !== null}>Clear</button>
              </div>
            </div>
          )}
        </form>
      )}

      {loading && <p className="crm-muted crm-mt">Loading attachments…</p>}
      {!loading && files.length === 0 && <p className="crm-muted crm-mt">No documents attached yet.</p>}

      {!loading && files.length > 0 && (
        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Size</th><th>Uploaded by</th><th /></tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td><span className="crm-doc-icon">{getFileIcon(file.file_type)}</span>{file.original_filename}</td>
                  <td><span className="crm-doc-category-badge">{file.category_label || "—"}</span></td>
                  <td>{formatBytes(file.file_size)}</td>
                  <td>{file.uploaded_by?.name || "—"}</td>
                  <td>
                    <div className="crm-table-actions">
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => downloadFile(file, API_URL, localStorage.getItem("token"))}>Download</button>
                      {canDelete && (
                        <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-btn-danger-outline" onClick={async () => {
                          if (!window.confirm("Delete this file?")) return;
                          await apiFetch(`/files/${file.id}`, { method: "DELETE" });
                          loadFiles();
                        }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DocumentsPanel;
