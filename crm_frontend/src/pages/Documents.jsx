import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../components/DashboardLayout";
import { API_URL, apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const CATEGORIES = [
  { value: "invoices", label: "Invoices" },
  { value: "contracts", label: "Contracts" },
  { value: "kyc", label: "KYC Documents" },
  { value: "receipts", label: "Receipts" },
  { value: "products", label: "Product Images" },
  { value: "documents", label: "Other Business Documents" },
];

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileIcon(type) {
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return "📊";
  if (type.includes("word") || type.includes("officedocument")) return "📝";
  return "📁";
}

function Documents() {
  const [searchParams] = useSearchParams();
  const initModule = searchParams.get("module") || "";
  const initRecordId = searchParams.get("record_id") || "";

  const role = localStorage.getItem("role") || "Staff";
  const canUpload = hasPermission("files.upload");
  const canDelete = hasPermission("files.delete");

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initModule || "all");
  
  // Upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadCategory, setUploadCategory] = useState(initModule || "documents");
  const [uploadRecordId, setUploadRecordId] = useState(initRecordId || "");
  const [uploadProgress, setUploadProgress] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadFiles = () => {
    setLoading(true);
    let path = "/files";
    if (initModule && initRecordId) {
      path += `?related_module=${initModule}&related_record_id=${initRecordId}`;
    }
    apiFetch(path)
      .then((data) => setFiles(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
  }, [initModule, initRecordId]);

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles(filesArray);

    const previewUrls = filesArray.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviews(previewUrls);
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);

      const previewUrls = filesArray.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file);
        }
        return null;
      });
      setPreviews(previewUrls);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setError("");
    setMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    if (uploadCategory) {
      formData.append("related_module", uploadCategory);
    }
    if (uploadRecordId) {
      formData.append("related_record_id", parseInt(uploadRecordId, 10));
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setMessage("Files uploaded successfully.");
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(null);
      // Reset record ID unless initialized in query string
      if (!initRecordId) {
        setUploadRecordId("");
      }
      loadFiles();
    } catch (err) {
      setUploadProgress(null);
      const errMsg =
        err.response?.data?.detail || "Upload failed. Please check file types and sizes.";
      setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`${API_URL}/files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Download failed or permission denied.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.original_filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to permanently delete this file?")) return;
    setError("");
    setMessage("");
    try {
      await apiFetch(`/files/${fileId}`, {
        method: "DELETE",
      });
      setMessage("File deleted successfully.");
      loadFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryLabel = (val) => {
    const found = CATEGORIES.find((c) => c.value === val);
    return found ? found.label : val || "Other";
  };

  // Client-side search and category filtering
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.original_filename
      .toLowerCase()
      .includes(search.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "all" || file.related_module === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Documents Manager" roleLabel={role}>
      <style>{`
        .crm-dropzone {
          border: 2px dashed var(--crm-border);
          border-radius: 12px;
          padding: 35px 20px;
          text-align: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .crm-dropzone.active {
          border-color: var(--crm-accent);
          background: rgba(59, 130, 246, 0.05);
        }
        .crm-dropzone-icon {
          font-size: 2.2rem;
        }
        .crm-previews-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .crm-preview-card {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          border: 1px solid var(--crm-border);
          overflow: hidden;
          background: var(--crm-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crm-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .crm-preview-fallback {
          font-size: 1.5rem;
        }
        .crm-progress-bar-container {
          width: 100%;
          height: 8px;
          background: var(--crm-border);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 15px;
        }
        .crm-progress-bar-fill {
          height: 100%;
          background: var(--crm-accent);
          transition: width 0.2s ease;
        }
        .crm-doc-icon {
          margin-right: 8px;
          font-size: 1.1rem;
        }
        .crm-doc-grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .crm-doc-search-filters {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 600px;
          margin-top: 5px;
        }
        .crm-doc-search-input {
          flex: 2;
        }
        .crm-doc-filter-select {
          flex: 1;
        }
        @media (max-width: 640px) {
          .crm-doc-search-filters {
            flex-direction: column;
            max-width: 100%;
          }
        }
      `}</style>

      {initModule && initRecordId && (
        <div className="crm-panel crm-mt" style={{ marginBottom: "20px", background: "rgba(59, 130, 246, 0.1)", borderColor: "var(--crm-accent)" }}>
          <p style={{ color: "var(--crm-text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              ℹ️ Showing documents filtered by <strong>{initModule}</strong> (Record ID: <strong>{initRecordId}</strong>).
            </span>
            <button
              type="button"
              className="crm-btn crm-btn-sm crm-btn-outline"
              onClick={() => {
                window.history.pushState({}, "", "/documents");
                window.location.reload();
              }}
            >
              Clear Filter
            </button>
          </p>
        </div>
      )}

      {canUpload && (
        <div className="crm-panel">
          <h2>Upload Documents</h2>
          <p className="crm-muted" style={{ marginBottom: "20px" }}>
            Upload files and tag them under business categories to keep client records audit-ready.
          </p>

          <form onSubmit={handleUpload}>
            <div className="crm-form-grid" style={{ marginBottom: "15px" }}>
              <div>
                <label>Category / Module</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  disabled={uploadProgress !== null}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Related Record ID (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={uploadRecordId}
                  onChange={(e) => setUploadRecordId(e.target.value)}
                  disabled={uploadProgress !== null}
                />
              </div>
            </div>

            <div
              className={`crm-dropzone ${isDragOver ? "active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple
                onChange={handleFileChange}
              />
              <span className="crm-dropzone-icon">📁</span>
              <p>
                <strong>Drag & drop multiple files</strong> here or click to browse
              </p>
              <span className="crm-muted" style={{ fontSize: "0.85rem" }}>
                Allowed: PDF, Word, Excel, CSV, TXT, Images (Max 10MB per file)
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="crm-mt">
                <p>Selected {selectedFiles.length} file(s):</p>
                <div className="crm-previews-container">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="crm-preview-card" title={file.name}>
                      {previews[idx] ? (
                        <img src={previews[idx]} alt="Preview" className="crm-preview-img" />
                      ) : (
                        <span className="crm-preview-fallback">{getFileIcon(file.type)}</span>
                      )}
                    </div>
                  ))}
                </div>

                {uploadProgress !== null && (
                  <div className="crm-mt">
                    <p>Uploading... {uploadProgress}%</p>
                    <div className="crm-progress-bar-container">
                      <div
                        className="crm-progress-bar-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="crm-inline-actions crm-mt">
                  <button
                    type="submit"
                    className="crm-btn crm-btn-sm"
                    disabled={uploadProgress !== null}
                  >
                    Upload All
                  </button>
                  <button
                    type="button"
                    className="crm-btn crm-btn-sm crm-btn-outline"
                    onClick={() => {
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    disabled={uploadProgress !== null}
                  >
                    Clear Selected
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="crm-panel crm-mt-lg">
        <div className="crm-doc-grid-header">
          <div>
            <h2>Document Repository</h2>
            <p className="crm-muted">Total items in current view: {filteredFiles.length}</p>
          </div>
          <div className="crm-doc-search-filters">
            <input
              type="text"
              className="crm-doc-search-input"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="crm-doc-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {loading && <p className="crm-muted crm-mt">Loading documents...</p>}

        {!loading && filteredFiles.length === 0 && (
          <p className="crm-muted crm-mt">No files found matching the current search or filters.</p>
        )}

        {!loading && filteredFiles.length > 0 && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Category</th>
                  <th>Related Record</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Uploaded By</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <span className="crm-doc-icon">{getFileIcon(file.file_type)}</span>
                      {file.original_filename}
                    </td>
                    <td>
                      <span className="crm-badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--crm-text)" }}>
                        {getCategoryLabel(file.related_module)}
                      </span>
                    </td>
                    <td>
                      {file.related_module && file.related_record_id ? (
                        <a
                          href={`/${file.related_module === "sales_orders" ? "sales-orders" : file.related_module}/${file.related_record_id}`}
                          className="crm-link"
                          style={{ margin: 0, display: "inline", textDecoration: "underline" }}
                        >
                          {file.related_module} #{file.related_record_id}
                        </a>
                      ) : (
                        <span className="crm-muted">—</span>
                      )}
                    </td>
                    <td>{formatBytes(file.file_size)}</td>
                    <td className="crm-nowrap">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td>{file.uploaded_by?.name || "System"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="crm-table-actions" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => handleDownload(file)}
                        >
                          Download
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className="crm-btn crm-btn-sm crm-btn-outline"
                            style={{ borderColor: "var(--crm-danger)", color: "var(--crm-danger)" }}
                            onClick={() => handleDelete(file.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Documents;
