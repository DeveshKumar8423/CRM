# Product Requirements Document (PRD)
## Leave Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** HR / Operations / Internal People Operations  
**Document Version:** v1.0  
**Date:** 2026-06-22  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Leave Management provides a structured workflow for **employees to request time off** and **managers to approve or reject** those requests inside BlackPapers CRM. Users should be able to submit leave with type, dates, reason, and duration; managers should review a clear approval queue; HR and leadership should see team availability and leave history without spreadsheets or chat threads.

The module must feel native to the existing CRM experience. It integrates with **Users**, **Role Permissions**, and **Activity Logs**, and complements **Follow-ups** (personal reminders) and **Project Management** (delivery planning)—but does not replace a full HRIS or payroll system.

Core promise from product scope:

> **Allow employees to request leaves and managers to approve or reject them.**

---

## 2. Problem Statement

Today, leave requests are often handled informally—WhatsApp messages, email, or verbal approval—with no central record, no audit trail, and no manager queue.

Common issues this module should solve:

- Employees lack a single place to submit and track leave requests
- Managers cannot easily see pending requests or team leave overlap
- Approved leave is not visible when planning projects or client delivery
- HR/admin has no structured leave history per employee
- Rejection reasons and approver identity are not consistently recorded
- Leave balances (if tracked) live outside the CRM or not at all
- Operations cannot answer “who is on leave this week?” without manual checks

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Allow **employees** to create, submit, and track their own leave requests.
2. Allow **managers** to **approve or reject** pending requests with optional comments.
3. Support common **leave types** (casual, sick, earned, unpaid, etc.) with configurable labels.
4. Capture **start date**, **end date**, **duration (days)**, and **reason** on each request.
5. Provide a **manager approval queue** for pending requests.
6. Provide a **My Leave** view for employees to see request history and status.
7. Provide a **team leave calendar / list** for managers to review upcoming absences.
8. Preserve **audit trail** via activity logs on submit, approve, reject, and cancel.
9. Support **role-based permissions** aligned with existing CRM roles (Admin, Manager, Employee).
10. Enable **CSV export** of leave records for HR reporting (Phase 1 basic).

### 3.2 Non-Goals (This Phase)

1. Full HRIS replacement (onboarding, payroll, performance reviews).
2. Statutory compliance automation for every Indian labour law edge case.
3. Biometric attendance or shift scheduling integration.
4. Automatic payroll deduction or salary adjustment.
5. Multi-level approval chains beyond manager + admin override (Phase 2).
6. Client-facing leave visibility or external calendar sync (Google/Outlook) in Phase 1.
7. Leave encashment calculations and carry-forward rule engines (Phase 2).
8. Mobile native app (responsive web only in Phase 1).

---

## 4. Target Users and Roles

### 4.1 Primary Users

| User | Leave Management need |
|------|----------------------|
| **Employee** | Request leave, view own history, cancel draft/pending requests |
| **Manager / Team Lead** | Review pending requests, approve or reject with reason, view team leave |
| **Admin / HR** | View all leave, configure types, override approvals, export records |
| **Operations Manager** | See who is unavailable when planning delivery |

### 4.2 Secondary Users

| User | Leave Management need |
|------|----------------------|
| **Project Manager** | Check assignee availability before scheduling tasks (Phase 2 indicator) |
| **Leadership** | Review leave trends and team coverage at a glance |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Request leave** | Employee creates request with type, dates, reason, optional half-day |
| **Submit for approval** | Draft → pending workflow |
| **Approve / reject** | Manager action with optional reviewer note |
| **My Leave** | Employee index of own requests with status filters |
| **Approval queue** | Manager list of pending requests |
| **Team leave view** | Upcoming approved leave by team/date range |
| **Leave types** | Configurable enum (casual, sick, earned, unpaid, other) |
| **Status lifecycle** | draft, pending, approved, rejected, cancelled |
| **Activity log** | Audit events on key transitions |
| **Permissions** | Dedicated `leaves.*` permission group |
| **Export** | CSV of filtered leave list (Admin/Manager) |

### 5.2 Out of Scope (Phase 1)

- Leave balance accrual engine and automatic deduction
- Multi-step approval (manager → HR → director)
- Calendar drag-and-drop booking
- Email/WhatsApp notifications on submit/approve (Phase 2)
- Integration with project task assignment blocking
- Public holiday master and auto-exclusion from day count (Phase 2)
- Attachment upload for medical certificates (Phase 2)

---

## 6. Core Product Concept

A **leave request** is an employee’s formal time-off record. Each request answers:

- **Who** — requesting employee  
- **What type** — casual, sick, earned, etc.  
- **When** — start and end dates (inclusive)  
- **How long** — total days (computed or entered)  
- **Why** — reason / notes  
- **Status** — draft, pending, approved, rejected, cancelled  
- **Who decided** — approver, decision date, rejection reason  

Approved leave becomes the system record for team availability. Rejected leave retains reviewer feedback for transparency.

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Leave Management |
|--------|-----------------------------------|
| **Users** | Requester, approver, manager visibility |
| **Follow-ups** | Personal reminders—not leave requests |
| **Projects / Tasks** | Delivery planning; Phase 2 may show leave overlap on assignee |
| **Expenses** | Separate approval workflow; similar UX patterns to reuse |
| **Activity Logs** | Audit trail for leave transitions |
| **Role Permissions** | Employee submit; Manager approve; Admin full access |

### 6.2 Proposed Data Model (Phase 1)

New table **`leave_requests`**:

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `leave_number` | Optional reference e.g. `LV-2026-0001` |
| `employee_id` | Requesting user (FK `users`) |
| `leave_type` | casual / sick / earned / unpaid / other |
| `start_date` | First day of leave |
| `end_date` | Last day of leave (inclusive) |
| `total_days` | Computed or stored decimal (supports half-day Phase 1 optional) |
| `is_half_day` | Boolean; if true, half-day on start_date only (Phase 1 simple) |
| `half_day_period` | `morning` / `afternoon` (optional) |
| `reason` | Employee explanation |
| `status` | draft / pending / approved / rejected / cancelled |
| `submitted_at` | When sent for approval |
| `reviewed_by_id` | Approver user |
| `reviewed_at` | Decision timestamp |
| `reviewer_note` | Approval comment or rejection reason |
| `created_at`, `updated_at` | Audit timestamps |

No separate leave balance table in Phase 1 unless product sign-off requires basic read-only balance display (Phase 2).

---

## 7. Leave Lifecycle

### 7.1 Statuses

| Status | Label | Meaning |
|--------|-------|---------|
| `draft` | Draft | Employee preparing request; not yet submitted |
| `pending` | Pending Approval | Submitted; awaiting manager decision |
| `approved` | Approved | Manager accepted; employee is marked on leave for date range |
| `rejected` | Rejected | Manager declined; includes reviewer note |
| `cancelled` | Cancelled | Withdrawn by employee or admin before/after decision per rules |

### 7.2 Leave Types (Default)

| Type key | Label | Typical use |
|----------|-------|-------------|
| `casual` | Casual Leave | Short personal absence |
| `sick` | Sick Leave | Illness or medical rest |
| `earned` | Earned / Privilege Leave | Planned vacation |
| `unpaid` | Unpaid Leave | Absence without pay entitlement |
| `other` | Other | Comp-off, bereavement, etc. (free-text note) |

Phase 2 may add company-configurable leave type master.

### 7.3 Transition Rules

| From | To | Actor | Rule |
|------|-----|-------|------|
| — | `draft` | Employee | Create new request |
| `draft` | `pending` | Employee | Submit for approval |
| `pending` | `approved` | Manager/Admin | Approve |
| `pending` | `rejected` | Manager/Admin | Reject (note required) |
| `draft` | `cancelled` | Employee | Discard draft |
| `pending` | `cancelled` | Employee | Withdraw before decision (optional policy) |
| `approved` | `cancelled` | Admin/Manager | Rare override; requires reason (Phase 2 strict) |
| `rejected` | `draft` | Employee | Edit and resubmit (Phase 1 allowed) |

### 7.4 Duration Rules

1. **Default:** `total_days = inclusive calendar days between start_date and end_date` (weekends included in Phase 1 simple mode).
2. **Validation:** `end_date >= start_date`.
3. **Half-day (Phase 1 optional):** `is_half_day = true` → `total_days = 0.5`, start_date must equal end_date.
4. **Overlap:** Phase 1 **warn** if employee has overlapping approved/pending leave; block optional Phase 2.
5. **Past dates:** Phase 1 allow backdated sick leave with manager approval; casual leave may warn if start_date in past.

### 7.5 Approval Rules

1. Employee cannot approve own leave.
2. Manager with `leaves.approve` can approve/reject requests from employees in their visibility scope.
3. Admin / Manager with `leaves.view_all` sees all company requests.
4. Rejection **requires** `reviewer_note` (min length e.g. 3 characters).
5. Approval may include optional `reviewer_note`.

---

## 8. Information Architecture and Navigation

### 8.1 Primary Navigation

Add **Leave** under Operations / HR section in sidebar (near Follow-ups or Projects):

| Route | Purpose |
|-------|---------|
| `/leaves` | My Leave — employee’s own requests |
| `/leaves/new` | Request leave form |
| `/leaves/approval-queue` | Manager pending queue |
| `/leaves/team` | Team leave calendar/list (Manager/Admin) |
| `/leaves/:id` | Leave request detail |
| `/leaves/:id/edit` | Edit draft or rejected request |

### 8.2 Entry Points

- Sidebar: Leave → My Leave
- Employee dashboard widget: “Request leave” + pending count (Phase 2)
- Manager dashboard widget: pending approvals count (Phase 2)

### 8.3 Cross-Module Visibility (Phase 2)

- User profile: recent leave summary
- Project detail: assignee on leave indicator for date range

---

## 9. Detailed Functional Requirements

### 9.1 My Leave (Employee Index)

**Required elements**

- List of own leave requests
- Columns: reference #, type, dates, days, status, submitted date, actions
- Filters: status, leave type, date range
- KPI cards: pending count, approved days this month (Phase 1 simple)
- CTA: Request leave
- Empty state with link to create first request

**Behaviors**

- Default sort: start_date descending
- Click row opens detail
- Employee sees only own records unless `leaves.view_all`

### 9.2 Request Leave (Create / Edit)

**Required fields**

- Leave type (required)
- Start date (required)
- End date (required)
- Reason (required, min length)

**Optional fields**

- Half-day toggle + period (morning/afternoon)
- Internal notes (Phase 2)

**Behaviors**

- Save as **draft** without submitting
- **Submit** moves to `pending` and sets `submitted_at`
- Validation: end ≥ start; reason required on submit
- Edit allowed for `draft` and `rejected`; not for `approved` (cancel flow Phase 2)
- Auto-generate `leave_number` on submit e.g. `LV-2026-0001`

### 9.3 Leave Detail

**Required elements**

- Employee name, leave type, dates, total days, reason
- Status badge
- Submitted at, reviewed by, reviewed at, reviewer note
- Timeline / activity snippet (recent events)
- Actions by role:
  - Employee: Edit (draft/rejected), Cancel (draft/pending), Submit (draft)
  - Manager: Approve, Reject
  - Admin: Full actions + cancel approved (override)

### 9.4 Approval Queue (Manager)

**Required elements**

- List of `pending` requests
- Columns: employee, type, dates, days, reason, submitted, actions
- Sort: submitted_at ascending (oldest first)
- Bulk approve (Phase 2); single approve/reject in Phase 1
- Filter by employee name, leave type

**Approve behavior**

- One-click approve with optional note modal
- Status → `approved`; set `reviewed_by_id`, `reviewed_at`
- Activity log: `leave_approved`

**Reject behavior**

- Reject opens modal requiring reason
- Status → `rejected`; store `reviewer_note`
- Activity log: `leave_rejected`

### 9.5 Team Leave View (Manager / Admin)

**Required elements**

- List or calendar of **approved** leave in selected date range
- Filter: team member, leave type
- Default range: current month + next 30 days
- Highlight overlapping absences (Phase 2)

### 9.6 Export

- CSV: employee, type, dates, days, status, submitted, reviewed by, note
- Filename: `leaves-{YYYY-MM}.csv`
- Requires `leaves.export`
- Activity log: `leave_exported`

---

## 10. UX and Design Requirements

### 10.1 Visual Design

- Follow existing CRM patterns (`crm-panel`, stat cards, tables, badges)
- Status badges:
  - Draft — gray
  - Pending — amber
  - Approved — green
  - Rejected — red
  - Cancelled — slate
- Reuse approval queue layout from Expenses / Vendor Bills where possible
- Date range displayed as `12 Jun – 15 Jun 2026 (4 days)`

### 10.2 Responsive Behavior

- Request form usable on mobile browser (stacked fields)
- Approval queue usable on tablet for managers

### 10.3 Error Handling

- Overlapping leave → warning banner (Phase 1) or block (Phase 2)
- Cannot approve own request → permission error
- Reject without reason → validation error
- Edit approved leave → read-only with explanation

---

## 11. Permission Model

### 11.1 Suggested Permissions

| Permission | Behavior |
|------------|----------|
| `leaves.view` | View own leave requests |
| `leaves.view_all` | View all company leave requests |
| `leaves.create` | Create and submit leave requests |
| `leaves.edit_own` | Edit own draft/rejected requests |
| `leaves.cancel_own` | Cancel own draft/pending requests |
| `leaves.approve` | Approve or reject pending requests |
| `leaves.cancel_all` | Cancel any request (admin override) |
| `leaves.export` | Export leave data |
| `leaves.manage_settings` | Configure leave types (Phase 2) |

### 11.2 Role Expectations

| Role | Access |
|------|--------|
| **Admin** | Full access |
| **Manager** | view_all, approve, export, team view |
| **Employee** | view, create, edit_own, cancel_own |
| **User (portal)** | No access |

---

## 12. Data Fields (UI-Centric)

### 12.1 Leave Request Row

- `id`, `leave_number`
- `employee_id`, `employee_name`
- `leave_type`, `leave_type_label`
- `start_date`, `end_date`, `total_days`
- `is_half_day`, `half_day_period`
- `reason`
- `status`, `status_label`
- `submitted_at`
- `reviewed_by_id`, `reviewed_by_name`, `reviewed_at`, `reviewer_note`
- `created_at`, `updated_at`

### 12.2 Approval Queue Row

- Employee, type, dates, days, reason, submitted_at, id (for actions)

---

## 13. Validation and Business Rules

1. Employee must be active staff user.
2. Start and end dates required; end ≥ start.
3. Reason required on submit (min 10 characters recommended).
4. Rejection requires reviewer note.
5. Employee cannot approve own leave.
6. Only `draft` and `rejected` editable by employee.
7. Only `pending` approvable/rejectable.
8. Cancelled and approved records are read-only for employees (except admin override).
9. Leave number unique per company when assigned.
10. Activity log on submit, approve, reject, cancel.

---

## 14. Notifications (Phase 2)

Phase 1 relies on in-app queues and status badges.

Phase 2 may add:

- Notify manager when leave submitted
- Notify employee when approved/rejected
- Reminder for pending requests older than N days
- Weekly team leave digest for managers

---

## 15. Reporting and Insights

### Phase 1

- My Leave history
- Pending approval queue count
- Team leave list by date range
- CSV export

### Phase 2

- Leave days by employee / type / month
- Pending aging report
- Balance remaining (if accrual enabled)
- Department coverage heatmap

---

## 16. Analytics Events

| Event | When |
|-------|------|
| `leave_list_viewed` | My Leave index loaded |
| `leave_created` | Draft created |
| `leave_submitted` | Status → pending |
| `leave_approved` | Manager approved |
| `leave_rejected` | Manager rejected |
| `leave_cancelled` | Request cancelled |
| `leave_approval_queue_viewed` | Manager queue opened |
| `leave_exported` | CSV exported |

Payload: `leave_id`, `employee_id`, `leave_type`, `status`, `total_days`, `reviewer_id`.

---

## 17. Integration Points

### 17.1 CRM Modules

- **Users:** requester and approver identity
- **Activity log:** audit events
- **Dashboard:** pending widgets (Phase 2)
- **Projects:** assignee availability hint (Phase 2)

### 17.2 Suggested API Endpoints (Phase 1)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/leaves/meta` | Types, statuses |
| GET | `/leaves` | List with filters (mine / all) |
| GET | `/leaves/stats` | KPI summary |
| GET | `/leaves/approval-queue` | Pending for manager |
| GET | `/leaves/team` | Approved team leave by date range |
| POST | `/leaves` | Create request |
| GET | `/leaves/{id}` | Detail |
| PUT | `/leaves/{id}` | Update draft/rejected |
| POST | `/leaves/{id}/submit` | Submit for approval |
| POST | `/leaves/{id}/approve` | Approve |
| POST | `/leaves/{id}/reject` | Reject with note |
| POST | `/leaves/{id}/cancel` | Cancel |
| POST | `/leaves/export-log` | Log export |

### 17.3 Implementation Alignment

Phase 1 should:

1. Add `leave_requests` table (Alembic migration)
2. Add `leave_config.py` with types, statuses, transitions
3. Add `leaves_router.py` following `expenses_router` approval patterns
4. Add frontend: `Leaves.jsx`, `LeaveForm.jsx`, `LeaveDetail.jsx`, `LeaveApprovalQueue.jsx`, `TeamLeave.jsx`
5. Add `leaves.*` permissions to `permissions_data.py`
6. Add numbering config entry for `leave` entity (`LV-{year}-{seq}`)
7. Register router in `main.py` and routes in `App.js`

---

## 18. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into full HRIS | Phase 1 focused on request + approve/reject only |
| Overlap with Follow-ups | Clear labels: Follow-ups = reminders; Leave = formal time off |
| No leave balance causes confusion | Document as Phase 2; optional manual note field Phase 1 |
| Managers miss pending requests | Approval queue + Phase 2 notifications |
| Weekend/holiday day counting disputes | Phase 1 simple inclusive calendar days; Phase 2 holiday master |
| Privacy of sick leave reason | Restrict detail visibility to employee + approver + admin |

---

## 19. Release Phasing

### Phase 1 (MVP)

- Leave request CRUD (draft, submit)
- Manager approve / reject with note
- My Leave index and detail
- Approval queue
- Team leave list (approved)
- Permissions, nav, activity log
- CSV export
- Basic half-day support (optional)

### Phase 2

- Leave balance accrual and deduction
- Public holiday calendar
- Overlap blocking and coverage warnings
- Email/WhatsApp notifications
- Multi-level approval
- Medical certificate attachment
- Dashboard widgets
- Project assignee leave indicator

### Phase 3

- Payroll integration
- Department policy rules
- Comp-off linking
- Calendar sync (Google/Outlook)
- Advanced analytics and forecasting

---

## 20. UAT Acceptance Checklist

1. Employee can create a leave request with type, dates, and reason.
2. Employee can save draft and submit later.
3. Submitted request appears in manager approval queue as pending.
4. Manager can approve a pending request; status becomes approved.
5. Manager can reject with a required reason; employee sees rejection note.
6. Employee cannot approve their own leave.
7. Employee can view only their own requests (unless admin/manager view_all).
8. Rejected request can be edited and resubmitted.
9. Draft request can be cancelled/deleted.
10. Team leave view shows approved leave for selected date range.
11. Overlapping dates show warning (or block per policy).
12. Activity log records submit, approve, and reject.
13. CSV export matches filtered list.
14. Permissions restrict approval queue to authorized managers.

---

## 21. Open Product Questions

1. Should **weekends** count toward leave days in Phase 1, or weekdays only?
2. Is **half-day leave** required in Phase 1?
3. Can employees **cancel pending** requests before manager action?
4. Should managers approve only **direct reports** or **all employees**?
5. Is **leave balance** display required in Phase 1 or Phase 2 only?
6. Should **sick leave** require attachment for absences over N days?
7. Should **approved leave** block task assignment in Project Management (Phase 2)?

---

## Appendix A: Leave Management vs Expense Approval

| Aspect | Expenses | Leave Management |
|--------|----------|------------------|
| Purpose | Business spend reimbursement | Employee time off |
| Submitter | Any staff with create permission | Employee only (own leave) |
| Approver | Manager / Finance | Manager / Admin |
| Key fields | Amount, vendor, category | Dates, type, days |
| Proof | Receipt attachment | Medical cert (Phase 2) |
| Queue | Expense approval queue | Leave approval queue |
| Settlement | Paid / reimbursed | Approved = on leave record |

---

## Appendix B: Example Approval Queue Row

| Employee | Type | Dates | Days | Reason | Submitted | Action |
|----------|------|-------|------|--------|-----------|--------|
| Rahul Sharma | Casual | 25–27 Jun 2026 | 3 | Family function | 20 Jun | Approve / Reject |
| Priya Nair | Sick | 22 Jun 2026 | 1 | Fever | 22 Jun | Approve / Reject |

---

## Appendix C: Badge Labels

- Draft · Pending Approval · Approved · Rejected · Cancelled  
- Casual Leave · Sick Leave · Earned Leave · Unpaid Leave · Other  
- Half Day · Morning · Afternoon  

---

## Appendix D: Example Request Form

**Leave type:** Earned Leave  
**From:** 10 Jul 2026  
**To:** 14 Jul 2026  
**Days:** 5  
**Reason:** Planned family vacation  

[Save draft] [Submit for approval]

---

End of document.
