# Product Requirements Document (PRD)
## Document Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Compliance / Knowledge Management  
**Document Version:** v1.0  
**Date:** 2026-06-22  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Document Management provides a **central repository inside BlackPapers CRM** for storing, organizing, and retrieving business documents. Users should be able to upload files, classify them by type, link them to CRM records, search and filter the library, and download or delete files according to role permissions—without relying on shared drives, email attachments, or ad-hoc folders.

The module must feel native to the existing CRM experience. It builds on the current **`uploaded_files`** infrastructure and **`files.*`** permission group, integrates with **Users**, **Role Permissions**, and **Activity Logs**, and complements record-level attachments on **Contacts**, **Deals**, **Invoices**, **Quotations**, and **Sales Orders** via the reusable **Documents panel**.

Core promise from product scope:

> **Store contracts, invoices, HR files, client documents, compliance records, and SOPs in one secure, searchable place.**

---

## 2. Problem Statement

Today, business documents are often scattered across Google Drive folders, WhatsApp threads, local laptops, and email inboxes. CRM users can see deal or invoice data in the app, but supporting paperwork is frequently elsewhere.

Common issues this module should solve:

- No single place to find **contracts**, **compliance filings**, or **SOPs** tied to the business
- **Client documents** and **KYC** live outside the contact or deal record
- **HR files** (offer letters, policies, ID proofs) are not linked to employee records
- **Invoice PDFs** and signed copies are hard to locate during audits
- Staff cannot tell **who uploaded** a file, **when**, or whether it is still current
- Sensitive documents lack consistent **access control** by role
- Operations and leadership cannot answer “where is the latest signed contract?” without manual search

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a **company-wide document repository** with upload, list, search, download, and delete.
2. Support **document categories** aligned to business needs: contracts, invoices, HR files, client documents, compliance records, SOPs, and related types.
3. Allow **linking documents to CRM records** (contact, deal, invoice, quotation, sales order, lead, expense, etc.).
4. Embed a **Documents panel** on key record detail pages for contextual attachments.
5. Enforce **role-based permissions** for view, upload, download, and delete.
6. Validate uploads for **allowed file types**, **size limits**, and **basic security** (no executables).
7. Preserve an **audit trail** via activity logs on upload, download (optional), and delete.
8. Enable **search and filter** by filename, category, uploader, and date.
9. Support **multi-file upload** with drag-and-drop and progress feedback.
10. Keep storage **tenant-scoped** per company.

### 3.2 Non-Goals (This Phase)

1. Full **document management system (DMS)** replacement (SharePoint, Google Workspace).
2. **Real-time collaborative editing** (Google Docs / Office Online).
3. **E-signature** workflow (DocuSign, Zoho Sign) in Phase 1.
4. **OCR**, full-text search inside PDFs, or AI document extraction.
5. **Version control** with diff/compare (Phase 2).
6. **Automatic retention / legal hold** policy engine (Phase 2).
7. **Client portal** self-service document upload (Phase 2).
8. **Cloud sync** (Dropbox, Drive, S3 browser) in Phase 1.
9. Mobile native app (responsive web only in Phase 1).

---

## 4. Target Users and Roles

### 4.1 Primary Users

| User | Document Management need |
|------|--------------------------|
| **Admin / HR** | Store HR files, policies, compliance records; manage repository access |
| **Manager** | Upload and retrieve contracts, SOPs, client documents for their team |
| **Employee** | Upload receipts, supporting docs; download SOPs and policies |
| **Finance** | Store and retrieve invoice copies, tax filings, vendor bills |
| **Sales / Account Manager** | Attach KYC, proposals, and contracts to contacts and deals |

### 4.2 Secondary Users

| User | Document Management need |
|------|--------------------------|
| **Operations** | Access SOPs and compliance checklists during delivery |
| **Auditor / Leadership** | Review document inventory and upload history |
| **Project Manager** | Attach project deliverables and signed approvals (Phase 2) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Central repository** | `/documents` page listing all accessible files |
| **Upload** | Multi-file upload with category and optional record link |
| **Record attachments** | `DocumentsPanel` on lead, deal, contact, invoice, quotation, sales order detail |
| **Categories** | contracts, invoices, HR files, client documents, compliance, SOPs, KYC, receipts, products, other |
| **Download** | Secure download via authenticated API |
| **Delete** | Admin/manager delete with physical file cleanup |
| **Search & filter** | Filename search; category filter; date/uploader filters (Phase 1 basic) |
| **Permissions** | `files.upload`, `files.view`, `files.view_own`, `files.download`, `files.download_own`, `files.delete` |
| **Validation** | Extension, MIME, size cap, executable signature block |
| **Activity log** | Upload and delete events (download optional Phase 2) |

### 5.2 Out of Scope (Phase 1)

- Document versioning and “replace file” history
- Expiry dates and renewal reminders
- Folder hierarchy / nested directories
- Fine-grained per-document ACLs beyond role permissions
- Virus scanning service integration
- Bulk zip download
- Watermarking or view-only preview for PDFs
- Automatic attachment from generated invoice PDFs (Phase 2)

---

## 6. Core Product Concept

A **document** (stored as an `uploaded_files` record) is a file belonging to the company. Each record answers:

- **What** — original filename, MIME type, size  
- **Where stored** — server path with unique stored filename  
- **Category** — business classification (`related_module` / document category)  
- **Linked to** — optional CRM record (`related_module` + `related_record_id`)  
- **Who uploaded** — user identity and timestamp  
- **Access** — governed by `files.*` permissions and company scope  

Documents may be **standalone** (general repository) or **contextual** (attached to a contact, deal, invoice, etc.). Contextual documents also appear in the central repository when the user has list access.

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Document Management |
|--------|--------------------------------------|
| **Contacts / Leads / Deals** | Client documents, KYC, proposals, contracts |
| **Invoices / Quotations / Sales Orders** | Invoice PDFs, signed order copies |
| **Expenses / Vendor Bills** | Receipt and bill attachments (existing patterns) |
| **Products** | Product images and spec sheets |
| **Users / HR** | Employee HR files (Phase 1 category; user link Phase 2) |
| **Leave Management** | Medical certificates (Phase 2 attachment) |
| **Activity Logs** | Audit trail for document actions |
| **Role Permissions** | View all vs own; upload; download; delete |

### 6.2 Proposed Data Model (Phase 1 — largely implemented)

Existing table **`uploaded_files`**:

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `original_filename` | User-visible filename |
| `stored_filename` | Unique name on disk |
| `file_path` | Absolute path on server |
| `file_type` | MIME type |
| `file_size` | Bytes |
| `uploaded_by_id` | FK `users` |
| `related_module` | Category / module key (e.g. `contracts`, `contacts`) |
| `related_record_id` | Optional FK to CRM record |
| `created_at` | Upload timestamp |

**Phase 2 optional fields** (not in Phase 1 unless sign-off requires):

| Field | Purpose |
|-------|---------|
| `title` | Display title separate from filename |
| `description` | Notes or summary |
| `tags` | JSON array for flexible tagging |
| `expires_at` | Compliance / contract renewal |
| `version` | Integer version number |
| `parent_file_id` | Link to prior version |
| `employee_id` | HR file linked to staff user |

---

## 7. Document Categories

### 7.1 Default Categories (Product Scope)

| Category key | Label | Typical use |
|--------------|-------|-------------|
| `contracts` | Contracts | Client MSAs, NDAs, vendor agreements |
| `invoices` | Invoices | Signed invoice copies, credit note scans |
| `hr` | HR Files | Offer letters, ID proofs, HR policies per employee |
| `client_documents` | Client Documents | Onboarding packs, correspondence, briefs |
| `compliance` | Compliance Records | GST filings, registrations, audit responses |
| `sops` | SOPs | Standard operating procedures, playbooks |
| `kyc` | KYC Documents | PAN, GST cert, bank proof (often on contacts) |
| `receipts` | Receipts | Expense and purchase receipts |
| `products` | Product Images | Catalog images and datasheets |
| `documents` | Other | General business documents |

### 7.2 Module Link Keys (Record Attachment)

When attached to a CRM record, `related_module` may also use entity keys:

| Module key | CRM entity |
|------------|------------|
| `leads` | Lead detail |
| `deals` | Deal detail |
| `contacts` | Contact detail |
| `invoices` | Invoice detail |
| `quotations` | Quotation detail |
| `sales_orders` | Sales order detail |
| `expenses` | Expense detail (Phase 1 if panel added) |
| `vendor_bills` | Vendor bill detail (Phase 1 if panel added) |
| `projects` | Project detail (Phase 2) |

Category and module link can coexist: e.g. category `contracts` linked to `deals` record `42`.

---

## 8. Information Architecture and Navigation

### 8.1 Primary Navigation

| Route | Purpose |
|-------|---------|
| `/documents` | Central document repository |
| `/documents?module={key}&record_id={id}` | Filtered view for a specific record |

### 8.2 Entry Points

- Sidebar: **Documents** (requires `files.view` or `files.view_own`)
- Record detail pages: **Documents & Attachments** panel with link “View all in Documents”
- Deep link from notifications (Phase 2)

### 8.3 Cross-Module Visibility (Phase 2)

- User profile: HR files tab for employee
- Project detail: deliverable documents
- Dashboard widget: recent uploads / expiring compliance docs

---

## 9. Detailed Functional Requirements

### 9.1 Document Repository (Index)

**Required elements**

- Table: filename, category, related record link, size, upload date, uploaded by
- Search by filename (client-side Phase 1; server-side Phase 2)
- Filter by category
- Empty state with upload CTA (if `files.upload`)
- Total count in current view

**Behaviors**

- Default sort: `created_at` descending
- Employee with `files.view_own` sees only own uploads
- Manager/Admin with `files.view` sees all company documents
- Related record column links to CRM detail when module/id present

### 9.2 Upload Documents

**Required fields**

- One or more files (required)
- Category (required)

**Optional fields**

- Related record ID (numeric; validated against module when Phase 2 picker added)
- Title / description (Phase 2)

**Behaviors**

- Drag-and-drop and file picker
- Progress bar during upload
- Allowed types: PDF, Word, Excel, CSV, TXT, PNG, JPG, GIF
- Max size per file: 10 MB (configurable)
- Reject executables and mismatched MIME/extension
- On success: refresh list; activity log `file_uploaded`
- Multi-tenant: `company_id` from current user

### 9.3 Record Documents Panel

**Required elements**

- Compact list of files for current record
- Upload zone (if `files.upload`)
- Download per file
- Delete per file (if `files.delete`)
- Link to full repository filtered by record

**Behaviors**

- Auto-scoped query: `related_module` + `related_record_id`
- Used on: Lead, Deal, Contact, Invoice, Quotation, Sales Order detail pages
- Phase 2: extend to Projects, Expenses, Vendor Bills, User (HR)

### 9.4 Download

**Behaviors**

- Authenticated `GET /files/{id}/download`
- Returns original filename to browser
- `files.download` or `files.download_own` (own uploads only)
- Company scope enforced
- Activity log `file_downloaded` (Phase 2 optional)

### 9.5 Delete

**Behaviors**

- Confirm before delete
- Remove DB record and physical file from disk
- Requires `files.delete`
- Activity log `file_deleted`
- No soft-delete in Phase 1

### 9.6 HR Files (Phase 1 category; enhanced Phase 2)

**Phase 1**

- Upload with category `hr`; optional note in filename convention
- Visible in repository to users with `files.view`

**Phase 2**

- Link `employee_id` to user record
- Restrict HR visibility to Admin/HR role
- User profile tab “HR Documents”

### 9.7 Compliance & SOPs

**Phase 1**

- Categories `compliance` and `sops` in repository
- Searchable list for operations and leadership

**Phase 2**

- `expires_at` on compliance docs
- SOP version field and “superseded” flag
- Dashboard alert for documents expiring in 30 days

---

## 10. UX and Design Requirements

### 10.1 Visual Design

- Follow existing CRM patterns (`crm-panel`, tables, badges, dropzone)
- Category shown as neutral badge
- File type icon by MIME (PDF, image, spreadsheet, word, generic)
- Reuse `Documents.jsx` dropzone and `DocumentsPanel.jsx` styling
- Responsive: stacked filters on mobile; table scroll on narrow screens

### 10.2 Upload UX

- Clear allowed-types and size hint under dropzone
- Preview thumbnails for images before upload
- Disable form during active upload
- Success and error messages inline

### 10.3 Error Handling

- Oversized file → validation error with MB limit
- Disallowed extension → clear message
- Permission denied on download → “Download failed or permission denied”
- Missing file on disk → 404 with support message
- Delete failure → show API error; do not orphan DB if disk delete fails (log server-side)

---

## 11. Permission Model

### 11.1 Permissions (existing)

| Permission | Behavior |
|------------|----------|
| `files.upload` | Upload files |
| `files.view` | List and view all company files |
| `files.view_own` | List only files uploaded by self |
| `files.download` | Download any accessible file |
| `files.download_own` | Download only own uploads |
| `files.delete` | Delete any file (with company scope) |

### 11.2 Role Expectations

| Role | Access |
|------|--------|
| **Admin** | Full file access |
| **Manager** | view, upload, download, delete |
| **Employee** | upload, view_own, download_own |
| **User (portal)** | No access |

### 11.3 Phase 2 Permissions (proposed)

| Permission | Behavior |
|------------|----------|
| `files.view_hr` | View HR-category documents |
| `files.manage_sops` | Upload/edit SOPs and compliance metadata |
| `files.export_index` | Export document index CSV |

---

## 12. Data Fields (UI-Centric)

### 12.1 Document Row

- `id`
- `original_filename`
- `file_type`, `file_size`
- `related_module`, `related_record_id`, `category_label`
- `uploaded_by` → `{ id, name, email, role }`
- `created_at`
- `file_url` → download path
- `related_record_link` (computed frontend route)

### 12.2 Upload Form

- `files[]`, `category`, `related_record_id` (optional)

---

## 13. Validation and Business Rules

1. Uploader must be active staff with `files.upload`.
2. File must have a recognized extension and matching MIME type.
3. File size must not exceed `MAX_FILE_SIZE` (default 10 MB).
4. Executables and script signatures are rejected.
5. `stored_filename` must be unique (UUID-based).
6. List and download respect company_id and permission scope.
7. Delete requires `files.delete`; physical file removed best-effort.
8. `related_record_id` without `related_module` is discouraged (warn in UI).
9. Activity log on upload and delete (Phase 1); download (Phase 2).
10. Filename displayed to user is always `original_filename`, never stored path.

---

## 14. Notifications (Phase 2)

Phase 1 relies on repository browsing and record panels.

Phase 2 may add:

- Notify owner when document uploaded to their deal/contact
- Compliance expiry reminders
- Weekly digest of new SOP uploads for managers

---

## 15. Reporting and Insights

### Phase 1

- Document count in repository view
- Filter by category and record
- Upload audit via activity log

### Phase 2

- Documents by category / month
- Storage usage per company
- Expiring compliance report
- HR document completeness per employee
- CSV export of document index

---

## 16. Analytics Events

| Event | When |
|-------|------|
| `document_repository_viewed` | `/documents` loaded |
| `document_uploaded` | Upload success |
| `document_downloaded` | Download success |
| `document_deleted` | Delete success |
| `document_panel_viewed` | Record documents panel loaded |
| `document_filter_applied` | Category or search filter changed |

Payload: `file_id`, `category`, `related_module`, `related_record_id`, `file_size`, `uploader_id`.

---

## 17. Integration Points

### 17.1 CRM Modules

- **Record details:** embedded `DocumentsPanel`
- **Activity log:** upload, delete (and download Phase 2)
- **Users:** uploader identity; HR link Phase 2
- **Settings:** upload limits in config (Phase 2 admin UI)

### 17.2 API Endpoints (Phase 1 — largely implemented)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/files/upload` | Multi-file upload (multipart form) |
| GET | `/files` | List with optional `related_module`, `related_record_id` |
| GET | `/files/{id}/download` | Download file |
| DELETE | `/files/{id}` | Delete file |

**Phase 2 proposed**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/files/meta` | Categories, allowed types, size limit |
| GET | `/files/stats` | Counts by category, storage used |
| PUT | `/files/{id}` | Update metadata (title, tags, expiry) |
| POST | `/files/{id}/replace` | Upload new version |
| POST | `/files/export-log` | Log CSV export |

### 17.3 Implementation Alignment

**Already in codebase**

1. `uploaded_files` table — migration `71d74bce5773`
2. `UploadedFile` model in `models.py`
3. `files_router.py` — upload, list, download, delete
4. `file_service.py` — validation and disk storage
5. `files.*` permissions in `permissions_data.py`
6. Frontend: `Documents.jsx`, `DocumentsPanel.jsx`
7. Routes: `/documents` in `App.js`; sidebar nav in `DashboardLayout.jsx`
8. Panels on: Lead, Deal, Contact, Invoice, Quotation, Sales Order detail

**Phase 1 gaps to close**

1. Align category list with product scope: add **HR Files**, **Client Documents**, **Compliance Records**, **SOPs**
2. Add `document_config.py` (or `files_config.py`) for canonical category keys and labels
3. Activity log on upload and delete in `files_router.py`
4. Server-side category filter and pagination on `GET /files`
5. Record picker on upload form (search contact/deal/invoice instead of raw ID)
6. Extend `DocumentsPanel` to expenses, vendor bills, projects (as modules ship)
7. HR-sensitive access rules (document in open questions)

**Phase 2**

1. Metadata fields migration (`title`, `description`, `tags`, `expires_at`, `version`)
2. User profile HR documents tab
3. Compliance expiry dashboard widget
4. Version replace flow
5. Optional S3 / cloud storage backend

---

## 18. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into enterprise DMS | Phase 1 = store, classify, link, retrieve |
| Disk storage growth | Configurable size limit; storage report Phase 2 |
| Sensitive HR/compliance exposure | Role permissions; HR-specific view Phase 2 |
| Orphan files on failed DB commit | Transaction: DB first or cleanup job Phase 2 |
| Malware in uploads | Extension/MIME/signature checks; virus scan Phase 2 |
| Duplicate copies on every module | Central repository + record panel as views of same table |
| Users enter wrong record ID | Record picker UI Phase 1 enhancement |

---

## 19. Release Phasing

### Phase 1 (MVP — mostly built; polish + category alignment)

- Central repository page
- Multi-file upload with categories
- Record-level documents panel on core CRM entities
- Download and delete with permissions
- File validation and tenant scope
- Category set: contracts, invoices, HR, client documents, compliance, SOPs, KYC, receipts, products, other
- Activity log on upload/delete
- Basic search and category filter

### Phase 2

- Document metadata (title, description, tags, expiry)
- Version replace and history
- Record picker on upload
- HR-restricted visibility
- User profile HR tab
- Compliance expiry alerts
- Server-side pagination and search
- CSV export of document index
- Panels on projects, expenses, vendor bills

### Phase 3

- E-signature integration
- OCR / full-text search
- Cloud storage (S3) with CDN
- Client portal uploads
- Automated attach generated PDFs (invoices, quotations)
- Retention and legal hold policies

---

## 20. UAT Acceptance Checklist

1. User with `files.upload` can upload one or more files from `/documents`.
2. User can assign a category (contracts, invoices, HR, client documents, compliance, SOPs).
3. Uploaded files appear in the repository with correct metadata.
4. User with `files.view` sees all company documents; Employee with `files.view_own` sees only own uploads.
5. User can download a file they are permitted to access.
6. User with `files.delete` can delete a file; it disappears from list and disk.
7. Documents panel on Contact/Deal/Invoice shows only that record’s attachments.
8. Link from panel opens `/documents` filtered by module and record ID.
9. Oversized or disallowed file types are rejected with a clear error.
10. Executable files are rejected.
11. Activity log records upload and delete.
12. Cross-company access is blocked.
13. Search by filename filters the repository list.
14. Category filter shows only matching documents.

---

## 21. Open Product Questions

1. Should **HR files** be visible to all managers or **Admin/HR only**?
2. Is **10 MB** per file sufficient, or different limits per category?
3. Should **compliance** and **contract** documents require an **expiry date** in Phase 1?
4. Is **soft delete** (recycle bin) required before permanent delete?
5. Should **Employees** see **SOPs** and **compliance** categories company-wide?
6. Do we need **folder structure** under categories, or is flat list + search enough?
7. Should generated **invoice PDFs** auto-attach to the invoice record?
8. Is **download activity logging** required for audit in Phase 1?

---

## Appendix A: Document Management vs Record Attachments

| Aspect | Central Repository | Record Documents Panel |
|--------|-------------------|------------------------|
| Purpose | Browse all company docs | Contextual files for one record |
| Scope | All accessible files | Single `related_module` + `related_record_id` |
| Upload | Any category + optional link | Auto-linked to current record |
| Navigation | Sidebar → Documents | Embedded on detail page |
| Data | Same `uploaded_files` table | Same `uploaded_files` table |

---

## Appendix B: Example Repository Row

| Filename | Category | Related Record | Size | Uploaded | By | Actions |
|----------|----------|----------------|------|----------|-----|---------|
| MSA_Acme_2026.pdf | Contracts | deals #42 | 1.2 MB | 18 Jun 2026 | Rahul Sharma | Download · Delete |
| GST_REG_CERT.pdf | Compliance | — | 840 KB | 10 Jun 2026 | Admin | Download · Delete |
| Onboarding_SOP_v3.pdf | SOPs | — | 2.1 MB | 1 Jun 2026 | HR Team | Download · Delete |

---

## Appendix C: Category Labels (UI)

- Contracts · Invoices · HR Files · Client Documents · Compliance Records · SOPs  
- KYC Documents · Receipts · Product Images · Other Business Documents  

---

## Appendix D: Example Upload Form

**Category:** Compliance Records  
**Related record:** Invoice #1087 (optional)  
**Files:** [Drag & drop or browse — PDF, Word, Excel, images, max 10 MB each]

[Upload All]

---

End of document.
