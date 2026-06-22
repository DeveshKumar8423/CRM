# Product Requirements Document (PRD)
## Project Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Delivery / Internal Execution  
**Document Version:** v1.0  
**Date:** 2026-06-22  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Project Management provides a **dedicated execution workspace** for planning and delivering client work after commercial commitment. Users should be able to **create projects** with **deadlines**, **stages**, **task lists**, **responsible team members**, and **progress tracking**—without relying on spreadsheets, chat threads, or ad hoc sales order notes.

The module must bridge sales handoff and day-to-day delivery. Operations and account teams should answer “what is the status of this engagement, who owns what, and are we on track?” in one place; leadership should see portfolio health, overdue work, and team workload at a glance.

This module complements **Deals** (pipeline), **Sales Orders** (commercial commitment and billing milestones), **Client Notes** (relationship context), **Follow-ups** (reminder queue), and **Expenses** (project spend context). It focuses specifically on **structured project execution**. It should feel native to the existing CRM experience and integrate with **Contacts**, **Users**, **Sales Orders**, **Deals**, **Invoices**, Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, the CRM tracks commercial documents and lightweight order milestones—but there is no unified **project execution layer** with tasks, stages, owners, and progress. Delivery teams coordinate work outside the system or repurpose sales order milestone fields inconsistently.

Common issues this module should solve:

- No single place to manage project deadlines, stages, and task ownership
- Sales order milestones are billing/delivery oriented, not a full task execution board
- Deals represent pipeline stages, not operational project delivery
- Team responsibilities are unclear across multiple active client engagements
- Progress is reported manually in standups or spreadsheets
- Overdue tasks and blocked stages are not visible company-wide
- Client context exists in notes but not tied to actionable project tasks
- Expenses and invoices lack a structured project container for delivery context (Phase 2 linkage)
- Handoff from won deal / confirmed order to execution is informal

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a dedicated **Projects** experience to create and manage client or internal delivery projects.
2. Support **project stages** (lifecycle phases) with clear status progression.
3. Enable **task lists** within projects with assignees, due dates, priorities, and completion states.
4. Assign **responsible team members** at project and task level (project manager + members).
5. Track **overall project progress** and stage/task completion automatically.
6. Surface **deadlines** at project and task level with overdue indicators.
7. Link projects to **contacts**, and optionally **deals** and **sales orders**, for CRM context.
8. Provide project index with filters: my projects, my tasks, overdue, by stage, by owner.
9. Support role-based access for managers, project owners, and team members.
10. Preserve traceability via activity logs on project and task changes.
11. Enable **CSV export** of project summary and task list (Phase 1).
12. Cross-link from Contact, Deal, and Sales Order detail to related projects.

### 3.2 Non-Goals (This Phase)

1. Full enterprise PPM (Microsoft Project, Jira, Asana replacement).
2. Gantt charts, critical path, or resource leveling engines.
3. Time tracking, timesheets, and billable hours automation (Phase 2).
4. Agile sprints, story points, burndown charts (Phase 2 optional).
5. Client portal for task visibility or deliverable approval.
6. Document version control and DAM (use existing Documents module links in Phase 2).
7. Automated project creation from every sales order without review.
8. Budget vs actual financial tracking (link to P&L project profitability in Phase 2).
9. Multi-company portfolio consolidation.
10. AI task generation or auto-scheduling.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Operations Manager: Owns delivery portfolio, assigns work, monitors deadlines.
- Project Manager / Account Owner: Creates projects, defines stages, assigns tasks, tracks progress.
- Team Member / Employee: Works assigned tasks, updates status, flags blockers.
- Admin: Configures permissions, default stage templates, and numbering.

### 4.2 Secondary Users

- Sales Manager: Views project status after deal win or order confirmation.
- Finance User: Uses project context when reviewing linked expenses/invoices (Phase 2).
- Leadership / Founder: Reviews active projects, overdue risk, and completion trends.
- Delivery Coordinator: Converts order milestones into project tasks (manual Phase 1).

---

## 5. Scope Overview

### 5.1 In Scope

- Project list (index) with KPIs and filters
- Project create / edit / detail views
- Project fields: name, code, description, client contact, dates, owner, status/stage, priority
- Configurable **project stages** (default template; editable per project in Phase 1 limited)
- **Task lists** grouped by stage or flat list view
- Task CRUD: title, description, assignee, due date, priority, status, sort order
- **Team members** on project (project manager + member list)
- **Progress tracking:** task completion %, stage completion, project progress bar
- Overdue tasks and approaching-deadline indicators
- My Tasks view (cross-project task inbox for current user)
- Link project to contact (required for client projects), deal, sales order (optional)
- Entry from Contact / Deal / Sales Order detail: “Create project” / “View projects”
- Activity log on project/task create, assign, status change, completion
- Permissions and sidebar navigation entry
- CSV export of project task list

### 5.2 Out of Scope (Phase 1)

- Kanban drag-and-drop board (Phase 2; list view first)
- Recurring tasks and task dependencies (Phase 2)
- Subtasks nested more than one level (Phase 2)
- File attachments on tasks (link to Documents in Phase 2)
- Email/WhatsApp notifications on assignment (Phase 2; use existing reminder patterns)
- Automatic sync of sales order milestones ↔ project tasks
- Project templates library with industry presets (Phase 2)
- Billable time entries
- Project profitability dashboard (Phase 2 with Expenses / Invoices)

---

## 6. Core Product Concept

Project Management transforms post-sale delivery into a **structured execution record**. A user creates a project (often after deal win or order confirmation), defines stages that mirror the delivery methodology, breaks work into tasks with owners and deadlines, and tracks completion until project close.

The product supports three primary surfaces:

1. **Projects Index:** Portfolio view of all active/completed projects with progress, deadline, owner, and overdue flags.
2. **Project Detail:** Stage summary, task list, team panel, linked CRM records, and progress KPIs.
3. **My Tasks:** Personal inbox of assigned open tasks across projects.

Every task and stage rolls up to **project progress**. The UI should distinguish **Projects** (execution) from **Deals** (pipeline) and **Sales Orders** (commercial commitment).

### 6.1 Relationship to Existing Modules

| Module | Role in Project Management |
|--------|----------------------------|
| **Contacts** | Client identity on project; primary entry point for client engagements |
| **Deals** | Optional source when project follows won deal |
| **Sales Orders** | Optional source for commercial scope; milestones may inform tasks (manual) |
| **Sales Order Milestones** | Billing/delivery checkpoints—not full task management; do not replace projects |
| **Client Notes** | Relationship context; link from project detail (Phase 2 embed) |
| **Follow-ups** | Personal reminder queue; project tasks are structured work items (complementary) |
| **Invoices** | Billing events; optional project link Phase 2 |
| **Expenses** | Spend tracking; `cost_center` / project link Phase 2 |
| **Users** | Project manager, members, task assignees |
| **Activity Logs** | Audit trail for project/task changes |

### 6.2 Current Data Model Notes

The CRM today has **no dedicated `projects` or `project_tasks` tables**.

Related existing patterns:

- **Deal:** pipeline stage, `expected_close_date`, assignee — not project execution
- **SalesOrderMilestone:** `title`, `owner_id`, `due_date`, `status`, `completed_at` — order-scoped, limited
- **FollowUpReminder:** personal reminders on lead/deal/contact — not project task lists
- **Expense.cost_center:** free-text; Phase 2 may link to `project_id`

Phase 1 should introduce:

- `projects` — project header
- `project_members` — team roster
- `project_tasks` — tasks with stage, assignee, due date, status
- Optional `project_stages` config table or stage enum on tasks grouped by stage key

**Gap:** No project numbering config. Reuse **Numbering Config** pattern (`PRJ-2026-0001`).

**Gap:** Sales order `fulfillment_progress` is order-level percent—not task-derived. Projects maintain their own progress; optional display on linked order in Phase 2.

---

## 7. Project Lifecycle and Stages

### 7.1 Project Statuses (Header)

| Status | Meaning |
|--------|---------|
| **draft** | Project being set up; not yet active |
| **active** | Work in progress |
| **on_hold** | Paused with reason |
| **completed** | All required work done; closed successfully |
| **cancelled** | Abandoned before completion |

### 7.2 Default Project Stages (Execution Phases)

Stages represent **delivery methodology**, not sales pipeline. Default template for client service projects:

| Stage key | Label | Typical use |
|-----------|-------|-------------|
| `kickoff` | Kickoff | Scope confirmation, access, intro calls |
| `discovery` | Discovery | Requirements, documents, site visits |
| `execution` | Execution | Core delivery work |
| `review` | Review | Internal QA, client review |
| `closure` | Closure | Sign-off, handover, final billing prep |

Phase 1 may store stage as a string on each task; project detail groups tasks by stage. Phase 2 adds customizable stage templates per project type.

### 7.3 Task Statuses

| Status | Meaning |
|--------|---------|
| **todo** | Not started |
| **in_progress** | Actively being worked |
| **blocked** | Waiting on dependency/client input |
| **done** | Completed |
| **cancelled** | No longer required |

### 7.4 Progress Calculation Rules

1. **Task progress (project):** `(done tasks) / (total non-cancelled tasks) × 100`
2. **Stage progress:** done tasks in stage / total tasks in stage
3. **Weighted progress (Phase 2):** optional weights per stage or task
4. **Header progress field:** auto-calculated; read-only in Phase 1
5. Cancelled tasks excluded from denominator
6. Projects with zero tasks show 0% progress with CTA to add tasks

### 7.5 Deadline Rules

- **Project deadline:** target completion date; overdue if `deadline < today` and status is `active`
- **Task due date:** overdue if past due and status not in `done`, `cancelled`
- Empty deadline = no overdue flag for project; task due dates optional but recommended

---

## 8. Team and Assignment Model

### 8.1 Project Roles

| Role | Capabilities |
|------|--------------|
| **Project manager** | Full edit on project, stages/tasks, members; close project |
| **Member** | View project; update assigned tasks; add comments (Phase 2) |
| **Viewer** | Read-only project access (Manager/Admin) |

Phase 1: store `project_manager_id` on project + `project_members` join table with role (`manager`, `member`).

### 8.2 Task Assignment

- Each task has optional `assigned_to_id` (User)
- Unassigned tasks visible in project with “Unassigned” badge
- My Tasks view filters `assigned_to_id = current user` and status open

### 8.3 Visibility Rules (Defaults)

- Admin / Manager: all projects (with `projects.view_all`)
- Project manager and members: projects they belong to
- Employee: projects where they are manager, member, or have assigned tasks
- User role (portal): no access

---

## 9. Information Architecture and Navigation

### 9.1 Primary Navigation

Add **Projects** under Operations (or near Sales Orders) in the main sidebar.

Suggested routes:

- `/projects` — Project index
- `/projects/my-tasks` — My Tasks inbox
- `/projects/new` — Create project
- `/projects/:id` — Project detail (tasks, team, progress)
- `/projects/:id/edit` — Edit project

### 9.2 Entry Points

- From sidebar: Projects
- From Contact detail: “Create project” / “View projects”
- From Deal detail (won/active): “Create project”
- From Sales Order detail (confirmed+): “Create project” / link existing
- From dashboard: “My overdue tasks” widget (Phase 2)

### 9.3 Cross-Module Visibility

- Contact detail shows active project count and nearest deadline (summary strip)
- Deal detail shows linked projects when deal_id set
- Sales Order detail shows linked project and high-level progress (informational)
- Project detail shows linked contact, deal, sales order with drill-down links

---

## 10. Detailed Functional Requirements

## 10.1 Projects Index

### Required Elements

- KPI cards:
  - Active projects
  - Overdue projects
  - My open tasks
  - Completed this month
- Search by project name, code, client, manager
- Filters: status, stage (has overdue tasks), project manager, client contact
- Sort: deadline (asc), progress (asc), last updated, name
- Table columns:
  - Project name / code
  - Client
  - Project manager
  - Stage summary (current active stage or “Mixed”)
  - Progress %
  - Deadline
  - Status
  - Open tasks count
  - Overdue flag
  - Actions: View

### UX Behaviors

- Default filter: active projects
- Click row opens project detail
- Empty state with CTA to create first project
- Pagination for large lists

## 10.2 Create / Edit Project

### Required Fields

- Project name (required)
- Project code / number (auto-generated, editable by admin)
- Client contact (required for `client` project type)
- Project type: `client`, `internal` (internal may omit contact)
- Project manager (required)
- Start date, deadline
- Priority: low, normal, high
- Description
- Optional links: deal, sales order
- Status (draft/active on create)

### UX Behaviors

- Save as draft without tasks
- Activate project moves status to `active`
- Validation: deadline on or after start date
- Duplicate project code prevented

## 10.3 Project Detail

### Required Elements

- Header: name, code, status badge, client, manager, deadline, progress bar
- Summary cards: total tasks, done, overdue, blocked
- Team panel: manager + members with add/remove
- Stage tabs or grouped sections with task lists per stage
- Task table: title, assignee, due date, priority, status, actions
- Quick add task inline
- Linked records panel: contact, deal, sales order, invoices (Phase 2 count)
- Activity timeline (recent project/task events)
- Actions: Edit project, Add task, Export tasks CSV, Put on hold, Mark complete, Cancel

### UX Behaviors

- Progress bar updates on task status change without full page reload
- Overdue tasks highlighted in red badge
- Blocked tasks show reason field (optional text)
- Completed project is read-only except admin reopen

## 10.4 Task Management

### Required Elements

- Create task: title, description, stage, assignee, due date, priority, status
- Edit task inline or modal
- Mark done with optional completion note (Phase 2)
- Reorder tasks within stage (sort_order)
- Bulk assign (Phase 2)
- Filter tasks by assignee, status, overdue

### UX Behaviors

- Assigning task to user not on project prompts add as member (optional confirm)
- Deleting task requires confirmation; soft-delete optional Phase 2
- Task due date defaults to project deadline if empty on create (optional UX)

## 10.5 My Tasks

### Required Elements

- List all open tasks assigned to current user across projects
- Columns: task, project, client, due date, priority, status, link
- Filters: overdue only, due this week, by project
- Quick status update: start, complete, blocked

### UX Behaviors

- Default sort: due date ascending
- Empty state when no assigned tasks

## 10.6 Export

### Phase 1 Export

- CSV of project task list: project metadata + all tasks
- Filename: `project-{code}-tasks-2026-06.csv`
- Activity log: `project_exported`

---

## 11. UX and Design Requirements

### 11.1 Visual Design

- Follow existing CRM design language (`crm-*` components, stat cards, tables)
- Progress bars use consistent fill color; overdue in red badge
- Stage labels as subtle section headers or tabs
- Task status badges: todo, in progress, blocked, done
- Distinguish Projects from Pipeline (Deals) and Orders (Sales Orders)

### 11.2 Responsive Behavior

- Index and detail usable on desktop and tablet
- My Tasks optimized for daily check-in on laptop/tablet

### 11.3 Error Handling

- Contact not found: clear empty state
- Permission denied on project: standard CRM unauthorized view
- Cannot complete project with open required tasks: warning with override for manager (Phase 2 strict mode)

### 11.4 Accessibility

- Keyboard navigable task list and status controls
- Accessible labels on progress bars and deadline fields

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- `projects.view` — View projects user belongs to or owns tasks on
- `projects.view_all` — View all company projects
- `projects.create` — Create projects
- `projects.edit` — Edit project details and team
- `projects.manage_tasks` — Create/edit/assign tasks on accessible projects
- `projects.close` — Complete, hold, or cancel projects
- `projects.delete` — Delete draft projects
- `projects.export` — Export project task lists
- `projects.manage_settings` — Configure stage templates (Phase 2)

### Role Expectations

- Admin / Manager: full access
- Operations / Project Manager: create, edit, manage tasks, close
- Employee: view assigned projects, update own tasks
- Sales: view linked projects on their deals/orders (read-only Phase 1)
- User role (portal): no access

### Mapping from Existing Permissions (Transition)

| New permission | Existing equivalent (approximate) |
|----------------|-----------------------------------|
| `projects.view` | `sales_orders.view` or new module permission |
| `projects.create` | `sales_orders.create` (operations staff) |

Phase 1 should add explicit `projects.*` permissions rather than overloading sales permissions long term.

---

## 13. Data Fields (UI-Centric Definition)

### 13.1 Project Header

- Project id, project_number, name, description
- project_type (`client`, `internal`)
- status, priority
- contact_id, deal_id, sales_order_id
- project_manager_id, created_by_id
- start_date, deadline, completed_at
- progress_percent (computed)
- open_task_count, overdue_task_count (computed)
- created_at, updated_at

### 13.2 Project Member

- project_id, user_id, role (`manager`, `member`)
- added_at, added_by_id

### 13.3 Project Task

- id, project_id, stage_key, stage_label
- title, description
- assigned_to_id, created_by_id
- status, priority
- due_date, completed_at
- sort_order, blocked_reason (optional)
- created_at, updated_at

### 13.4 My Tasks Row

- Task fields + project_name, project_number, client_name, project_deadline

---

## 14. Validation and Business Rules

1. Client projects require a linked contact.
2. Project manager must be an active user.
3. Task assignee must be active user if set.
4. Project deadline must be on or after start date.
5. Task due date may exceed project deadline (warning only Phase 1).
6. Cancelled projects cannot have new tasks added unless reopened.
7. Completed projects lock task edits except admin/manager override.
8. Progress percent recalculates on every task status change.
9. Project number unique per company.
10. Deleting draft project cascades tasks and members.
11. Activity log records status transitions with actor and timestamp.
12. Only one primary linked sales order per project (Phase 1); multiple in Phase 2.

---

## 15. Notifications and Reminders

### Internal Notifications (Phase 2)

- Task assigned to user
- Task due tomorrow / overdue
- Project deadline approaching
- Project marked blocked/on hold
- Weekly digest: my open tasks

Phase 1 may surface overdue items only in UI and Follow-ups queue manually.

---

## 16. Reporting and Insights (Meta)

### Operational Outputs (This Module)

- Active project portfolio list
- My Tasks inbox
- Overdue projects and tasks report
- Completion rate by manager (Phase 2)
- Average project duration (Phase 2)

### UI Artifacts

- Index KPI cards
- Project progress bar
- Stage-grouped task lists
- Team roster panel
- My Tasks view

---

## 17. Analytics Events

- `project_list_viewed`
- `project_created`
- `project_viewed`
- `project_status_changed`
- `project_task_created`
- `project_task_assigned`
- `project_task_status_changed`
- `project_task_completed`
- `my_tasks_viewed`
- `project_exported`

Event payload should include project id, task id, status, assignee id, progress percent, and overdue flags.

---

## 18. Integration Points

### 18.1 CRM Modules

- **Contacts:** client linkage and entry point
- **Deals:** optional origin after win
- **Sales Orders:** optional scope reference; milestone import Phase 2
- **Users:** managers, members, assignees
- **Activity log:** audit events
- **Client Notes:** context panel Phase 2
- **Expenses / Invoices:** project_id linkage Phase 2

### 18.2 Existing Code Alignment

Phase 1 implementation should:

1. Add `projects`, `project_members`, `project_tasks` tables (Alembic migration)
2. Add `projects_config.py` with statuses, stages, task statuses, priorities
3. Add `projects_router.py` for CRUD and progress aggregation
4. Add frontend pages under `/projects/*`
5. Add numbering config entry for `project` entity
6. Not repurpose `SalesOrderMilestone` as the primary task store

Suggested API endpoints:

- `GET /projects/meta` — statuses, stages, priorities
- `GET /projects` — index with filters
- `GET /projects/my-tasks`
- `POST /projects`
- `GET /projects/{id}`
- `PUT /projects/{id}`
- `POST /projects/{id}/members`
- `DELETE /projects/{id}/members/{user_id}`
- `POST /projects/{id}/tasks`
- `PUT /projects/{id}/tasks/{task_id}`
- `DELETE /projects/{id}/tasks/{task_id}`
- `POST /projects/{id}/status` — hold, complete, cancel, activate
- `POST /projects/export-log`

### 18.3 Future Integrations

- Import tasks from sales order milestones
- Kanban board view
- Gantt timeline
- Time tracking and billable hours
- Project budget vs expense actuals
- P&L by project (see P&L Reports Phase 2)
- Document folder per project
- WhatsApp/email notify on assignment

---

## 19. Risks and Mitigations

1. **Risk:** Overlap with Sales Order milestones confuses users.  
   **Mitigation:** Clear labels; orders = commercial; projects = execution tasks.

2. **Risk:** Overlap with Deals pipeline stages.  
   **Mitigation:** Deals end at won/lost; projects start after commitment.

3. **Risk:** Follow-ups vs project tasks duplication.  
   **Mitigation:** Follow-ups = personal reminders; project tasks = structured delivery work.

4. **Risk:** Low adoption if task entry is too heavy.  
   **Mitigation:** Quick-add task, templates Phase 2, import from order milestones Phase 2.

5. **Risk:** Permission sprawl across sales and operations.  
   **Mitigation:** Dedicated `projects.*` permission group.

6. **Risk:** Progress gaming via cancelling tasks.  
   **Mitigation:** Cancelled excluded from progress; activity log audit.

---

## 20. Release Phasing

### Phase 1 (MVP)

- Project CRUD with contact link
- Default stages and task list
- Team members and task assignment
- Progress and overdue tracking
- Projects index and My Tasks
- Link from contact, deal, sales order
- CSV export
- Permissions and nav

### Phase 2

- Kanban board by stage/status
- Custom stage templates per project type
- Task dependencies and subtasks
- Notifications on assign/due
- Import tasks from sales order milestones
- Client notes panel on project
- Project budget and expense linkage
- Dashboard widgets

### Phase 3

- Gantt / timeline view
- Time tracking
- Project profitability with P&L
- Client portal read-only status
- Resource workload calendar
- AI suggested task breakdown

---

## 21. UAT Acceptance Checklist

1. User can create a project with name, manager, deadline, and client contact.
2. User can add team members to a project.
3. User can create tasks with stage, assignee, due date, and status.
4. Task status change updates project progress percent correctly.
5. Overdue tasks and overdue projects display correct badges.
6. My Tasks shows only current user’s open assigned tasks.
7. Project index filters by status, manager, and overdue work.
8. Linking deal and sales order on project preserves drill-down links.
9. Completed project prevents casual task edits.
10. Draft project can be deleted; active project cannot (without cancel flow).
11. CSV export matches on-screen task list.
12. Permissions restrict project visibility appropriately.
13. Contact detail shows linked projects summary.
14. Activity log records project creation and task completion.

---

## 22. UI Suggestions Summary

1. Lead with **Projects index** showing **deadline** and **progress** for leadership scanning.
2. On project detail, place **progress bar + overdue counts** above the task list.
3. Group tasks by **stage** with collapsible sections.
4. Provide **My Tasks** as a first-class nav item under Projects.
5. Use **quick-add task** row at bottom of each stage section.
6. Differentiate clearly from **Deals** (pipeline) and **Sales Orders** (commercial).

---

## 23. Open Product Questions for Final Sign-Off

1. Should every **confirmed sales order** auto-create a project, or remain manual?
2. Are **internal projects** (no client contact) required in Phase 1?
3. Should **project stages** be fixed globally or customizable per project in Phase 1?
4. Is **strict completion** required (all tasks done before project complete)?
5. Should **sales executives** edit tasks or view-only on linked projects?
6. Do tasks need **estimated hours** in Phase 1 or Phase 2 only?
7. Should **Follow-up reminders** auto-create from overdue project tasks?

---

## Appendix A: Suggested Screen Inventory

1. Projects - Index
2. Projects - My Tasks
3. Projects - Create / Edit
4. Projects - Detail (tasks + team + progress)
5. Contact detail - Projects summary strip
6. Deal / Sales Order detail - Linked projects panel

---

## Appendix B: Recommended Badge Labels

- Draft
- Active
- On Hold
- Completed
- Cancelled
- To Do
- In Progress
- Blocked
- Done
- Overdue
- Unassigned
- High Priority

---

## Appendix C: Default Stage Template (Client Service)

| Order | Stage | Example tasks |
|-------|-------|---------------|
| 1 | Kickoff | Intro call, access checklist, scope sign-off |
| 2 | Discovery | Document collection, site visit, requirements note |
| 3 | Execution | Deliverable preparation, filing/submission, implementation |
| 4 | Review | Internal QA, client review meeting |
| 5 | Closure | Final sign-off, handover, archive |

---

## Appendix D: Example Project Detail View

**Project:** GST Registration — Acme Industries · **PRJ-2026-0018**  
**Manager:** Priya Sharma · **Deadline:** 30 Jun 2026 · **Progress:** 60%

| Stage | Tasks done | Overdue |
|-------|------------|---------|
| Kickoff | 2/2 | — |
| Discovery | 3/4 | 1 |
| Execution | 0/5 | — |
| Review | 0/2 | — |
| Closure | 0/1 | — |

**Open tasks (excerpt):**

| Task | Assignee | Due | Status |
|------|----------|-----|--------|
| Collect board resolution | Rahul | 18 Jun | Overdue |
| Prepare registration forms | Priya | 22 Jun | In Progress |
| Client document review | Priya | 25 Jun | To Do |

---

## Appendix E: Project Management vs Related Modules

| Aspect | Deals | Sales Orders | Project Management | Follow-ups |
|--------|-------|--------------|-------------------|------------|
| Purpose | Sales pipeline | Commercial commitment | Delivery execution | Personal reminders |
| Primary unit | Deal stage | Order + milestones | Project + tasks | Reminder item |
| User | Sales | Sales, operations | Operations, delivery | Anyone |
| Deadlines | Expected close | Order due / milestone due | Project + task due dates | Reminder due_at |
| Progress | Pipeline stage | fulfillment_progress | Task-based % | Complete/pending |
| Team | Assignee | Milestone owner | PM + members + assignees | Assignee |

---

End of document.
