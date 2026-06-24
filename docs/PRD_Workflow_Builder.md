# Product Requirements Document (PRD)
## Workflow Builder (Level 13 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Platform / Automation / Admin Configuration  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Workflow Builder extends BlackPapers CRM with a **no-code automation layer** so admins can define **custom business rules** that run when something happens in the system—without asking engineering to ship one-off scripts for every “when X then Y” request.

Each workflow is composed of three building blocks:

1. **Trigger** — the event that starts evaluation (e.g. deal stage changed, invoice overdue, leave submitted).
2. **Conditions** — optional filters that must pass before actions run (e.g. amount > ₹1L, assigned role = Sales, status = pending).
3. **Actions** — what the system does when the rule fires (e.g. notify Manager, assign owner, create reminder, update field, log note).

The module must integrate with existing CRM domains—**Leads**, **Deals**, **Quotations**, **Sales Orders**, **Invoices**, **Payments**, **Expenses**, **Purchase Orders**, **Vendor Bills**, **Inventory**, **Leaves**, **Timesheets**, **Payroll**, **Projects**, **Manufacturing**, **Quality**, **Maintenance**, **Field Service**, **Subscriptions**, **Rental**, **POS**, **eCommerce**, **Reminders**, **Notifications**, **Activity Logs**, and **Approvals Hub**—while respecting **role permissions** and **company tenancy**.

Core promise from product scope:

> **Let admins create custom automations using triggers, conditions, and actions.**

---

## 2. Problem Statement

BlackPapers CRM already ships **hard-coded workflows** in individual modules: quotation approval when discount exceeds threshold, invoice review queues, leave/timesheet/expense approval paths, PO and vendor bill sign-off, renewal reminders, SLA breach alerts, and follow-up reminders on client notes. Each works—but only for the scenario the product team anticipated.

Indian SME admins routinely need operational rules that differ by company:

- “When a deal moves to **Negotiation** and value > **₹5L**, notify the **Owner** and create a follow-up in **2 days**.”
- “When an invoice is **overdue 7 days**, send in-app alert to **Accountant** and tag the contact **collections risk**.”
- “When stock for **fast movers** drops below reorder level, notify **warehouse lead** and create a **purchase order draft** reminder.”
- “When a **leave request** is submitted for more than **3 days**, route to **HR Manager** before auto-approving short leaves.”

Common issues this module should solve:

- **Engineering bottleneck** — every new “if this then that” rule requires a code change and release
- **Inconsistent automation** — some modules have reminders; others rely on manual discipline
- **No central visibility** — admins cannot see what automations are active across sales, finance, and HR
- **Rigid approval logic** — discount and amount thresholds are config in one module, absent in another
- **Missed handoffs** — deals won but no task to operations; invoice issued but no collections follow-up
- **No audit of automation** — when something changed unexpectedly, teams cannot trace which rule fired
- **Unsafe power** — without guardrails, automations could notify wrong roles or mutate records users cannot access
- **Shadow spreadsheets** — teams maintain parallel “automation lists” in WhatsApp and Excel

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a **Workflow Builder hub** to list, create, edit, enable/disable, and test workflows (`/workflows`).
2. Support **trigger → conditions → actions** model with a guided builder UI (Phase 1 form-based; visual canvas Phase 2).
3. Ship a **starter trigger catalog** across sales, finance, inventory, HR, and operations modules.
4. Ship a **starter action catalog**: in-app notify, email (Phase 2), assign record, update field, create reminder, add client note, log activity.
5. Allow **multiple workflows** per trigger type with **priority order** and **stop-on-match** option.
6. Record **execution history** per workflow run: trigger payload, conditions result, actions taken, errors.
7. Enforce **permission-safe actions** — workflows cannot perform operations the workflow owner role could not do manually.
8. Provide **dry-run / test mode** against a sample record before activating.
9. Support **enable/disable** per workflow and global module toggle in settings.
10. Preserve **audit trail** on workflow create, edit, activate, deactivate, and delete.
11. Integrate with **Notifications** and **Activity Logs** for every successful action.
12. Phase 2: **scheduled triggers** (daily cron: overdue scan, renewal due, low stock).
13. Phase 2: **multi-step workflows** with delays (“wait 3 days then remind”).
14. Phase 3: **webhook actions** and external integrations (Zapier-style).

### 3.2 Non-Goals (This Phase)

1. Replacing **built-in approval engines** in Quotations, Invoices, Leaves, Expenses, POs, Vendor Bills—Workflow Builder **complements** them in Phase 1.
2. **Full BPMN / visual programming language** with arbitrary branching — Phase 2+.
3. **Customer-facing automation** (auto emails to clients without explicit template approval) — gated Phase 2.
4. **Arbitrary Python / SQL / script blocks** — no custom code execution.
5. **Cross-company** workflow templates across tenants — single-tenant scope Phase 1.
6. **Real-time sub-second stream processing** — event-driven on CRM writes; batch scheduled Phase 2.
7. **AI-generated workflow suggestions** — Phase 3.
8. **Mobile workflow editor** — desktop admin Phase 1.
9. **Undo / rollback** of automated field changes — audit + manual fix Phase 1.
10. **Workflow marketplace** of third-party templates — Phase 3.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Workflow Builder need |
|------|----------------------|
| **Admin / owner** | Create and maintain company automation rules |
| **IT / ops lead** | Map business SOPs to triggers and actions |
| **General manager** | Review active workflows and execution logs |

### 4.2 Secondary Users (CRM Staff)

| User | Workflow Builder need |
|------|----------------------|
| **Department heads** | Request rules; view logs for their module (Phase 2 scoped view) |
| **Finance head** | Collections and approval escalation automations |
| **HR manager** | Leave and attendance notification rules |

### 4.3 Non-Users (Phase 1)

| User | Note |
|------|------|
| **Sales / Employee / Accountant** | Do not author workflows; may **receive** notifications triggered by them |
| **Customers** | Never interact with Workflow Builder |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Workflow hub** | List, search, filter by module/status |
| **Rule builder** | Trigger + conditions + actions form |
| **Trigger catalog** | Module event types (record created, status changed, etc.) |
| **Condition builder** | Field comparisons, thresholds, role/owner filters |
| **Action catalog** | Notify, assign, update field, create reminder, log note |
| **Execution engine** | Evaluate on CRM events synchronously after commit |
| **Run history** | Per-fire log with success/partial/failed |
| **Dry-run** | Test against sample record without side effects |
| **Settings** | Module enable, max workflows, rate limits |
| **Permissions** | `workflows.*` permission group |
| **Activity log** | Authoring and execution audit events |

### 5.2 Out of Scope (Phase 1)

- Visual drag-and-drop canvas
- Scheduled / cron triggers
- Delay steps and multi-branch logic
- Email to external parties (beyond existing module email sends)
- Webhooks and external API calls
- Workflow versioning with rollback
- Per-user “my automations” scope

---

## 6. Core Product Concept

Workflow Builder adds a **reactive rules layer** on top of existing CRM write paths. When a supported **domain event** occurs (e.g. `deal.stage_changed`), the engine loads **active workflows** bound to that trigger, evaluates **conditions** against the event context, and executes **actions** in order.

Each workflow is **deterministic and auditable**: same event + same record state produces the same evaluation outcome. Actions run **as the workflow** (system actor) but are **permission-checked** against the workflow author’s role or a configured **run-as role** (Admin only).

Three primary surfaces:

1. **Workflows Hub** — list, create, duplicate, enable/disable (`/workflows`).
2. **Workflow editor** — trigger, conditions, actions, test, save (`/workflows/new`, `/workflows/:id/edit`).
3. **Run history** — execution log and detail (`/workflows/runs`, `/workflows/runs/:id`).
4. **Settings** — module toggle, limits, defaults (`/workflows/settings`).

### 6.1 Relationship to Existing CRM Modules

| Module | Example automation use |
|--------|------------------------|
| **Leads** | Assign round-robin; notify on high-value lead |
| **Deals / Pipeline** | Stage-change alerts; stale deal reminders |
| **Quotations** | Extra approval notify beyond built-in threshold |
| **Sales Orders** | Confirm → notify warehouse |
| **Invoices / Payments** | Overdue escalation; payment received thank-you note |
| **Expenses / POs / Vendor Bills** | Approval nudge; amount threshold notify |
| **Inventory** | Low stock alert; negative stock block notify |
| **Leaves / Timesheets** | Long-leave HR notify; overdue submission reminder |
| **Payroll** | Draft payroll ready notify |
| **Projects / Tasks** | Overdue task alert to owner |
| **Manufacturing / Quality** | WO failed QC → CAPA notify |
| **Maintenance / Field Service** | PM overdue; SLA breach escalation |
| **Subscriptions / Rental** | Renewal due; overdue return |
| **Reminders** | Auto-create follow-up on event |
| **Notifications** | Primary delivery channel for notify actions |
| **Activity Logs** | Audit every workflow fire and field update |
| **Approvals Hub** | Optional link action to approval queue |

### 6.2 Proposed Data Model (Phase 1)

**`workflow_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `max_active_workflows` | Cap (default 50) |
| `default_run_as_role` | Role for permission checks (default Admin) |
| `rate_limit_per_hour` | Max executions per company per hour |
| `notify_on_failure` | Boolean — alert Admin on action failure |
| `created_at`, `updated_at` | |

**`workflows`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `workflow_code` | WFL-2026-0012 |
| `name` | Human label |
| `description` | Optional |
| `module` | sales, finance, inventory, hr, operations, platform |
| `trigger_type` | e.g. `deal.stage_changed` |
| `trigger_config_json` | Trigger-specific params (from_stage, to_stage, etc.) |
| `conditions_json` | List of condition objects (AND group Phase 1) |
| `actions_json` | Ordered list of action objects |
| `priority` | Lower runs first |
| `stop_on_match` | Boolean — skip lower-priority workflows after match |
| `is_active` | Boolean |
| `run_count` | Denormalized counter |
| `last_run_at` | Nullable |
| `created_by_id` | FK User |
| `updated_by_id` | FK User nullable |
| `created_at`, `updated_at` | |

**`workflow_runs`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `workflow_id` | FK |
| `run_number` | WFL-RUN-2026-0042 |
| `trigger_type` | Snapshot |
| `record_type` | deal, invoice, leave, etc. |
| `record_id` | FK id |
| `status` | matched, skipped, executed, partial, failed |
| `conditions_result_json` | Per-condition pass/fail |
| `actions_result_json` | Per-action outcome |
| `error_message` | Nullable |
| `is_dry_run` | Boolean |
| `triggered_at` | |
| `completed_at` | Nullable |

---

## 7. Workflow Building Blocks

### 7.1 Triggers (Phase 1 catalog)

Triggers are **event-based** — fired after the originating CRM transaction commits successfully.

#### Sales

| Trigger key | Fires when |
|-------------|------------|
| `lead.created` | New lead saved |
| `lead.status_changed` | Lead status updated |
| `deal.created` | New deal created |
| `deal.stage_changed` | Deal pipeline stage changes |
| `deal.won` | Deal marked won |
| `deal.lost` | Deal marked lost |
| `quotation.status_changed` | Quote status transition |
| `quotation.submitted_for_approval` | Quote enters approval |
| `sales_order.confirmed` | SO confirmed |

#### Finance

| Trigger key | Fires when |
|-------------|------------|
| `invoice.created` | Invoice draft created |
| `invoice.issued` | Invoice issued |
| `invoice.overdue` | Invoice crosses due date unpaid (scheduled Phase 2; manual test Phase 1) |
| `invoice.payment_recorded` | Payment applied |
| `expense.submitted` | Expense submitted for approval |
| `expense.approved` | Expense approved |
| `purchase_order.submitted` | PO submitted |
| `vendor_bill.submitted` | Vendor bill submitted |

#### Inventory

| Trigger key | Fires when |
|-------------|------------|
| `product.low_stock` | SKU at or below reorder level |
| `stock_movement.recorded` | Stock in/out recorded |

#### HR

| Trigger key | Fires when |
|-------------|------------|
| `leave.submitted` | Leave request submitted |
| `leave.approved` | Leave approved |
| `leave.rejected` | Leave rejected |
| `timesheet.submitted` | Timesheet submitted |
| `attendance.absent` | Unplanned absence recorded |

#### Operations

| Trigger key | Fires when |
|-------------|------------|
| `work_order.status_changed` | Manufacturing WO status change |
| `quality.inspection_failed` | QC inspection failed |
| `maintenance.pm_overdue` | Asset past PM due (scheduled Phase 2) |
| `field_service.sla_breached` | FSO past SLA |
| `subscription.renewal_due` | Subscription within reminder window |
| `rental.return_overdue` | Rental return past due |

#### Platform

| Trigger key | Fires when |
|-------------|------------|
| `reminder.overdue` | Follow-up reminder past due |
| `record.updated` | Generic field update (limited entities Phase 1) |

### 7.2 Conditions (Phase 1)

Conditions are evaluated as an **AND group** — all must pass for actions to run.

| Condition type | Example |
|----------------|---------|
| `field_equals` | `deal.stage` = `negotiation` |
| `field_not_equals` | `invoice.status` ≠ `cancelled` |
| `field_gt` / `field_gte` | `deal.expected_value` ≥ 500000 |
| `field_lt` / `field_lte` | `leave.days` ≤ 2 |
| `field_in` | `quotation.status` in [`sent`, `viewed`] |
| `field_contains` | `contact.city` contains `Mumbai` |
| `owner_role_is` | Record owner role = Sales |
| `owner_is` | Owner user id = specific user |
| `record_linked` | Deal has linked contact |
| `days_since` | `deal.updated_at` older than 30 days |

Phase 2: OR groups, nested logic, formula expressions.

### 7.3 Actions (Phase 1 catalog)

| Action key | Description |
|------------|-------------|
| `notify.role` | In-app notification to all users with role |
| `notify.user` | In-app notification to specific user |
| `notify.record_owner` | Notify assignee/owner of triggering record |
| `assign.owner` | Reassign record to user (if permitted) |
| `update.field` | Set allowed field on record (whitelist per entity) |
| `create.reminder` | Create follow-up reminder linked to record |
| `create.client_note` | Add internal client note on linked contact |
| `log.activity` | Write activity log entry with custom message |
| `webhook.post` | Phase 3 — HTTP POST to URL |

**Field update whitelist (Phase 1 examples):**

| Entity | Allowed fields |
|--------|----------------|
| Deal | `stage`, `priority`, `assigned_to_id` |
| Lead | `status`, `assigned_to_id`, `priority` |
| Invoice | `status` (limited transitions), internal tags |
| Leave | — (no auto-approve Phase 1) |

Destructive transitions (cancel, delete, payment) are **blocked** from workflow actions in Phase 1.

---

## 8. Execution Model

### 8.1 Event Flow (Phase 1)

```
CRM write API succeeds (e.g. deal stage update)
  → Commit DB transaction
  → Emit domain event { type, company_id, record_type, record_id, payload, actor_id }
  → Workflow engine (async-safe inline Phase 1):
      → Load active workflows for company + trigger_type (ordered by priority)
      → For each workflow:
          → Evaluate conditions against payload + record snapshot
          → If fail: log run status=skipped
          → If pass:
              → Execute actions in order
              → Log run status=executed|partial|failed
              → If stop_on_match: break
  → Activity log: workflow_executed (summary)
```

### 8.2 Dry-Run / Test

```
Admin selects workflow → Test
  → Pick sample record (search by type)
  → Engine evaluates conditions
  → Simulates actions (no writes except workflow_run row with is_dry_run=true)
  → UI shows would-notify, would-update, would-create results
```

### 8.3 Failure Handling

| Scenario | Behavior |
|----------|----------|
| Single action fails | Continue remaining actions; run = `partial` |
| All actions fail | run = `failed` |
| Permission denied on action | Skip action; record in `actions_result_json` |
| Rate limit exceeded | Skip workflow; log warning; optional Admin notify |
| Module disabled | No evaluation |
| Workflow inactive | Skipped silently |

### 8.4 Scheduled Triggers (Phase 2)

- Daily 6 AM IST job evaluates time-based rules: overdue invoices, low stock, PM due, renewal due, stale deals.
- Creates synthetic events fed into same engine.

---

## 9. Permission and Safety

### 9.1 Authoring Permissions

| Permission | Capability |
|------------|------------|
| `workflows.view` | View hub, workflows, run history |
| `workflows.create` | Create and duplicate workflows |
| `workflows.edit` | Edit draft/inactive workflows |
| `workflows.activate` | Enable/disable workflows |
| `workflows.delete` | Delete inactive workflows |
| `workflows.manage_settings` | Module settings |
| `workflows.test` | Dry-run execution |

**Default matrix:**

| Role | view | create | edit | activate | delete | manage_settings | test |
|------|------|--------|------|----------|--------|-----------------|------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | — | — | — | — | — | — |
| Sales | — | — | — | — | — | — | — |
| Accountant | — | — | — | — | — | — | — |
| Employee | — | — | — | — | — | — | — |

Phase 2: delegated `workflows.create` for department heads with module scope.

### 9.2 Execution Safety

1. Actions run with **permission context** of `default_run_as_role` (Admin by default).
2. Workflows **cannot bypass** module ACLs — e.g. cannot email financial data to Sales if role lacks `reports.view_financial`.
3. **Field update whitelist** prevents arbitrary column writes.
4. **Max 10 actions** per workflow Phase 1.
5. **Max 25 notifications** per workflow run (role notify capped).
6. **Company scope** — all queries filtered by `company_id`.
7. **No recursive triggers** — workflow-fired updates do not re-trigger same workflow in same chain (depth limit = 1).
8. PII in notification messages uses same templates as existing modules.

---

## 10. Workflow Builder UI

### 10.1 Routes

| Route | Purpose |
|-------|---------|
| `/workflows` | Hub — list, filter, quick stats |
| `/workflows/new` | Create workflow wizard |
| `/workflows/:id` | Workflow detail (read-only summary) |
| `/workflows/:id/edit` | Edit workflow |
| `/workflows/runs` | Execution history |
| `/workflows/runs/:id` | Run detail |
| `/workflows/settings` | Module settings |

### 10.2 Hub Layout (Phase 1)

- **Stats row**: active workflows, runs today, failures today.
- **Table**: code, name, module, trigger, active badge, last run, run count.
- **Filters**: module, trigger type, active/inactive.
- **Actions**: New workflow, duplicate, enable/disable.

### 10.3 Editor Layout (Phase 1 wizard)

1. **Basics** — name, description, module, priority, stop-on-match.
2. **Trigger** — pick event type + trigger-specific config (e.g. from/to stage).
3. **Conditions** — add condition rows (field, operator, value).
4. **Actions** — ordered list; add notify / assign / update / reminder / note.
5. **Review & test** — summary + dry-run against sample record.
6. **Save** — save as inactive; separate **Activate** action.

### 10.4 Run History Detail

- Workflow name, trigger, record link.
- Conditions pass/fail table.
- Actions outcome list with timestamps.
- Error messages for failures.

---

## 11. Detailed Functional Requirements

### 11.1 Module Gate

- All `/workflows/*` routes require `workflow_settings.is_enabled = true` except settings GET for Admin.
- Disabled module: hub shows enable CTA for Admin.

### 11.2 Workflow CRUD

- Create generates unique `workflow_code` per company (`WFL-YYYY-####`).
- Edit allowed when inactive or Admin holds `workflows.edit` on active (Phase 1: must deactivate to edit).
- Duplicate copies trigger, conditions, actions into new inactive workflow.
- Delete soft-delete or hard-delete inactive only; active must be deactivated first.

### 11.3 Activation Rules

- Workflow must have ≥ 1 action to activate.
- Trigger type must be valid for selected module.
- Conditions optional (empty = always run on trigger).
- Activation logs `workflow_activated` activity event.

### 11.4 Execution

- Engine hooks into existing routers/services via **event dispatcher** — minimal invasive emit calls after successful commits.
- No blocking user request > 2s — if action queue grows, Phase 2 moves to background worker.
- Idempotency key: `workflow_id + record_id + trigger_type + day` for scheduled triggers; event id for real-time.

### 11.5 Settings

- Enable module, max active workflows, rate limit, default run-as role, notify on failure roles.

---

## 12. Validation and Business Rules

1. `company_id` on all workflow and run rows.
2. `workflow_code` unique per company.
3. At least one action required to activate.
4. Maximum 50 active workflows per company Phase 1 (configurable).
5. Trigger config validated per trigger schema (e.g. stage must exist in pipeline).
6. Condition field paths must be on whitelist for entity.
7. Action field updates must be on entity whitelist.
8. Cannot activate workflow referencing deprecated trigger (migration marks inactive).
9. Dry-run never calls notify/create/update paths — simulation only.
10. Run history retained **90 days** Phase 1; configurable Phase 2.

---

## 13. Integration Points

### 13.1 API Endpoints (Proposed)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/workflows/settings` | Module settings |
| GET | `/workflows/dashboard` | Hub stats |
| GET/POST | `/workflows` | List / create |
| GET/PUT/DELETE | `/workflows/{id}` | Detail / update / delete |
| POST | `/workflows/{id}/duplicate` | Clone workflow |
| POST | `/workflows/{id}/activate` | Enable |
| POST | `/workflows/{id}/deactivate` | Disable |
| POST | `/workflows/{id}/test` | Dry-run |
| GET | `/workflows/triggers` | Trigger catalog |
| GET | `/workflows/actions` | Action catalog |
| GET | `/workflows/condition-fields` | Fields per entity |
| GET | `/workflows/runs` | List runs |
| GET | `/workflows/runs/{id}` | Run detail |

**Create workflow body (example):**

```json
{
  "name": "Large deal negotiation alert",
  "description": "Notify owner when big deals enter negotiation",
  "module": "sales",
  "trigger_type": "deal.stage_changed",
  "trigger_config_json": { "to_stage": "negotiation" },
  "conditions_json": [
    { "type": "field_gte", "field": "expected_value", "value": 500000 }
  ],
  "actions_json": [
    { "type": "notify.role", "role": "Manager", "title": "Large deal in negotiation", "message": "Deal {{deal.name}} moved to negotiation at {{deal.expected_value}}" },
    { "type": "create.reminder", "due_in_days": 2, "title": "Follow up negotiation", "priority": "high" }
  ],
  "priority": 10,
  "stop_on_match": false
}
```

### 13.2 Implementation Alignment

**Builds on (existing)**

- `activity.py` — authoring and execution audit
- `services/notification_service.py` — `notify_role`, `notify_user`
- `reminders_router` — create reminder action
- `client_notes_router` — create note action
- Module routers — emit events post-commit (deals, invoices, leaves, etc.)
- `permissions_data.py`, `approvals_router`

**New (greenfield)**

- Tables in §6.2
- `workflow_config.py` — trigger/action/field catalogs
- `workflow_schemas.py`
- `routers/workflow_router.py`
- `services/workflow_engine.py` — evaluate conditions, execute actions
- `services/workflow_events.py` — event dispatcher registry
- Frontend: `WorkflowsHub.jsx`, `WorkflowEditor.jsx`, `WorkflowDetail.jsx`, `WorkflowRunDetail.jsx`, `WorkflowSettings.jsx`

---

## 14. Starter Workflow Templates (Phase 1)

Ship **read-only templates** Admin can duplicate:

| Template | Trigger | Conditions | Actions |
|----------|---------|------------|---------|
| Stale deal nudge | `deal.stage_changed` | in pipeline + idle 30d | Notify owner; create reminder |
| Large quote approval ping | `quotation.submitted_for_approval` | total ≥ ₹2L | Notify Manager |
| Invoice overdue escalation | `invoice.overdue` | outstanding > 0 | Notify Accountant; client note |
| Leave HR review | `leave.submitted` | days > 3 | Notify Manager role |
| Low stock alert | `product.low_stock` | reorder breached | Notify inventory role |
| SLA breach escalation | `field_service.sla_breached` | — | Notify Manager; log activity |

---

## 15. Reporting and Insights

### Phase 1

- Hub stats: active count, runs today, failure count
- Run history filter by workflow, status, date
- Top workflows by run count (30d)

### Phase 2

- Failure rate by action type
- Time saved estimate (configurable)
- Export run log CSV

### Phase 3

- Workflow health dashboard
- Template gallery analytics

---

## 16. Release Phasing

### Phase 1 (MVP)

- Module settings and enable flag
- Workflow CRUD with form-based editor
- 20+ triggers across core modules
- Conditions: AND group, field comparisons
- Actions: notify, assign, update field (whitelist), reminder, client note, activity log
- Inline execution on domain events
- Dry-run test mode
- Run history and detail view
- Permissions and activity logs
- 6 starter templates (duplicate only)

### Phase 2

- Scheduled triggers (daily scans)
- Email action with approved templates
- OR condition groups
- Delay step (“wait N days”)
- Manager read-only hub view
- Background job queue for heavy runs
- Per-module workflow ownership

### Phase 3

- Visual workflow canvas
- Webhook actions
- Cross-record branching
- AI workflow suggester from activity patterns
- Marketplace templates
- Workflow versioning and promote dev→prod

---

## 17. UAT Acceptance Checklist

1. Admin can enable Workflow Builder in settings.
2. Admin can create workflow with trigger `deal.stage_changed` and notify action.
3. Moving a deal to configured stage fires workflow and creates `workflow_run` row.
4. Conditions block execution when deal value below threshold.
5. Dry-run shows predicted actions without creating notifications.
6. Active workflow can be deactivated; no further runs after deactivate.
7. Failed action records `partial` run without crashing originating API.
8. User without `workflows.create` cannot access editor.
9. Workflow cannot update non-whitelisted field.
10. Cross-company workflow access blocked.
11. Activity log records workflow create, activate, and execute.
12. `stop_on_match` prevents lower-priority workflows from firing.

---

## 18. Open Product Questions

1. **Deactivate to edit** required Phase 1, or allow live edit with version snap?
2. Should **Manager** get `workflows.view` + run history read-only by default?
3. **Run-as role** fixed Admin vs configurable per workflow?
4. Include **approval.request** action that creates approval task vs only notify Phase 1?
5. **Invoice overdue** trigger — daily batch only vs real-time on status check?
6. Allow **multiple AND/OR** groups Phase 1 or strictly AND?
7. **Template library** shipped in product vs empty tenant?
8. Max **chain depth** when update.field triggers another workflow?
9. **WhatsApp** notify action Phase 2 or Phase 3?
10. Retain run history **90 days vs 1 year** default?

---

## Appendix A: Example Workflow — Large Deal Handoff

**Name:** Large deal → Manager handoff  
**Trigger:** `deal.stage_changed` → `to_stage = negotiation`  
**Conditions:** `expected_value ≥ 500000`  
**Actions:**

1. Notify role **Manager** — “Deal Acme Expansion entered negotiation at ₹8.2L”
2. Assign owner → **General Manager user**
3. Create reminder in **2 days** — “Review negotiation progress”
4. Log activity — “Workflow WFL-2026-0003 fired”

**Result:** Sales rep moves deal; Manager gets alert within same request cycle; audit trail in run history.

---

## Appendix B: Trigger → Source Module Map

| Trigger family | Emitter location (Phase 1) |
|----------------|----------------------------|
| `lead.*` | `leads_router` |
| `deal.*` | `deals_router` |
| `quotation.*` | `quotations_router` |
| `sales_order.*` | `sales_orders_router` |
| `invoice.*` | `invoices_router`, scheduled job |
| `expense.*` | `expenses_router` |
| `purchase_order.*` | `purchase_orders_router` |
| `vendor_bill.*` | `vendor_bills_router` |
| `product.low_stock` | `inventory_router`, scheduled job |
| `leave.*` | `leaves_router` |
| `timesheet.*` | `timesheets_router` |
| `work_order.*` | `manufacturing_router` |
| `quality.*` | `quality_router` |
| `field_service.*` | `field_service_router` |
| `subscription.*` | `subscriptions_router` |
| `rental.*` | `rental_router` |

---

## Appendix C: Starter Permissions Seed

```python
WORKFLOW_PERMISSIONS = [
    ("workflows.view", "View Workflow Builder hub and run history"),
    ("workflows.create", "Create automation workflows"),
    ("workflows.edit", "Edit automation workflows"),
    ("workflows.activate", "Activate and deactivate workflows"),
    ("workflows.delete", "Delete inactive workflows"),
    ("workflows.manage_settings", "Configure Workflow Builder module settings"),
    ("workflows.test", "Dry-run test workflows"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Workflow Builder contribution |
|--------------|-------------------------------|
| Level 13 platform | Admin-configurable automations |
| Approvals Hub | Optional notify/escalation rules |
| Notifications | Primary action delivery |
| AI Reports | Phase 3 — suggest rules from insight watch items |
| All domain modules | Event emitters for triggers |

---

## Appendix E: Relationship to Adjacent Concepts

| Concept | Workflow Builder vs |
|---------|---------------------|
| **Built-in approvals** | Module-specific gates vs **cross-cutting reactions** |
| **Reminders** | Manual/scheduled follow-ups vs **event-triggered** creation |
| **Notifications** | System events vs **user-defined** routing rules |
| **AI Reports** | Describes what happened vs **acts** when it happens |
| **Zapier / Make** | External iPaaS vs **native CRM** permission-safe automations |

Workflow Builder **does not replace** domain workflows—it lets admins **extend** the CRM with company-specific **triggers, conditions, and actions** that run reliably inside the tenant boundary.

---

*End of PRD — Workflow Builder v1.0*
