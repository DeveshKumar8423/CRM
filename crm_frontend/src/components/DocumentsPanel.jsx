import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { API_URL, apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

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

function DocumentsPanel({
  leadId,
  dealId,
  contactId,
  invoiceId,
  quotationId,
  salesOrderId,
  compact = false,
  title = "Documents & Attachments",
}) {
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

  let relatedModule = null;
  let relatedRecordId = null;

  if (leadId) {
    relatedModule = "leads";
    relatedRecordId = leadId;
  } else if (dealId) {
    relatedModule = "deals";
    relatedRecordId = dealId;
  } else if (contactId) {
    relatedModule = "contacts";
    relatedRecordId = contactId;
  } else if (invoiceId) {
    relatedModule = "invoices";
    relatedRecordId = invoiceId;
  } else if (quotationId) {
    relatedModule = "quotations";
    relatedRecordId = quotationId;
  } else if (salesOrderId) {
    relatedModule = "sales_orders";
    relatedRecordId = salesOrderId;
  }

  const loadFiles = () => {
    if (!relatedModule || !relatedRecordId) return;
    setLoading(true);
    apiFetch(`/files?related_module=${relatedModule}&related_record_id=${relatedRecordId}`)
      .then((data) => setFiles(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
  }, [leadId, dealId, contactId, invoiceId, quotationId, salesOrderId]);

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
    if (relatedModule) {
      formData.append("related_module", relatedModule);
    }
    if (relatedRecordId) {
      formData.append("related_record_id", relatedRecordId);
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

  return (
    <section className="crm-documents-panel crm-mt-lg">
      <style>{`
        .crm-dropzone {
          border: 2px dashed var(--crm-border);
          border-radius: 12px;
          padding: 30px 20px;
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
          font-size: 2rem;
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
      `}</style>

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
            <p><strong>Drag & drop files here</strong> or click to browse</p>
            <span className="crm-muted" style={{ fontSize: "0.85rem" }}>
              PDF, Word, Excel, CSV, TXT, Images (Max 10MB)
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
                    <div className="crm-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="crm-inline-actions crm-mt">
                <button type="submit" className="crm-btn crm-btn-sm" disabled={uploadProgress !== null}>
                  Upload File(s)
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
                  Clear
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {loading && <p className="crm-muted crm-mt">Loading attachments...</p>}

      {!loading && files.length === 0 && (
        <p className="crm-muted crm-mt">No documents attached to this record yet.</p>
      )}

      {!loading && files.length > 0 && (
        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <span className="crm-doc-icon">{getFileIcon(file.file_type)}</span>
                    {file.original_filename}
                  </td>
                  <td>{formatBytes(file.file_size)}</td>
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
    </section>
  );
}

export default DocumentsPanel;
