# Product Requirements Document (PRD)
## Task Management (Level 2 CRM Capability)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Delivery / Team Execution  
**Parent Module:** Project Management  
**Document Version:** v1.0  
**Date:** 2026-06-22  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Task Management is the **action layer** inside BlackPapers CRM delivery workflows. It lets teams **assign work**, **set priorities**, **add due dates**, **track status**, and **monitor team accountability**—without relying on chat threads, spreadsheets, or informal standups.

Tasks live inside **Projects** (client or internal delivery engagements). Each task has a clear owner, deadline, priority, and lifecycle status. Project managers see who owns what and what is overdue; team members see a personal **My Tasks** inbox; leadership sees completion and accountability signals rolled up at project and portfolio level.

This capability is delivered as part of the **Project Management** module and must feel native to the CRM. It complements **Follow-ups** (personal reminders), **Sales Order Milestones** (commercial checkpoints), and **Deals** (pipeline stages)—but replaces none of them. Task Management is for **structured, assignable, trackable delivery work**.

---

## 2. Problem Statement

Delivery teams know *what* must be done, but the CRM does not consistently capture *who* is doing it, *when* it is due, or *whether* it is on track.

Common issues Task Management should solve:

- Work items are discussed in meetings but not recorded as assignable tasks
- Priorities are implicit; urgent work is not visible across the team
- Due dates exist in people's heads or external tools, not in the CRM
- Status updates happen in chat; project health is unclear without manual reporting
- Managers cannot quickly see overdue work or unassigned tasks
- Team members lack a single inbox for "what I need to do today"
- Sales order milestones track billing/delivery checkpoints, not granular execution tasks
- Follow-up reminders are personal and unstructured—not a shared task board
- Accountability is hard to audit when ownership and status changes are not logged

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Assign tasks** to active staff members at project level, with optional auto-inclusion as project member.
2. **Set priorities** (low, normal, high) so teams can triage work consistently.
3. **Add due dates** at task level, with overdue indicators when past due and not complete.
4. **Track status** through a clear lifecycle: To Do → In Progress → Blocked → Done (or Cancelled).
5. **Monitor team accountability** via assignee visibility, My Tasks inbox, overdue counts, activity logs, and manager rollups.
6. Group tasks by **project stage** (Kickoff, Discovery, Execution, Review, Closure) for delivery methodology alignment.
7. Roll task completion into **project progress %** automatically.
8. Support **role-based permissions** so managers assign work and members update assigned tasks.
9. Preserve **audit trail** on task create, assign, status change, and completion.

### 3.2 Non-Goals (This Phase)

1. Standalone tasks outside a project container (Phase 2 optional personal task list).
2. Kanban drag-and-drop board (Phase 2; list view first).
3. Task dependencies, subtasks, and recurring tasks (Phase 2).
4. Time tracking, estimated hours, and billable hours (Phase 2).
5. Email/WhatsApp/push notifications on assignment or due date (Phase 2).
6. Client portal task visibility or approval workflows.
7. AI task generation, auto-scheduling, or workload balancing engines.
8. Replacing **Follow-ups**, **Sales Order Milestones**, or **Deal** pipeline stages.

---

## 4. Target Users and Roles

### 4.1 Primary Users

| User | Task Management need |
|------|----------------------|
| **Project Manager** | Create tasks, assign owners, set priorities and due dates, review blocked/overdue work |
| **Team Member / Employee** | View assigned tasks, update status, flag blockers, complete work on time |
| **Operations Manager** | Monitor accountability across projects; identify overdue and unassigned work |
| **Admin** | Configure permissions and default stage/status options |

### 4.2 Secondary Users

| User | Task Management need |
|------|----------------------|
| **Account Owner / Sales** | Read-only view of linked project tasks after deal win or order confirmation |
| **Leadership** | Scan portfolio overdue risk via project index KPIs and progress rollups |
| **Delivery Coordinator** | Manually break order scope into project tasks (Phase 1); milestone import Phase 2 |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Assign tasks** | Optional assignee per task (`assigned_to_id`); unassigned badge when empty; assign from project detail or quick-add |
| **Set priorities** | `low`, `normal`, `high` with visual badges |
| **Add due dates** | Optional task due date; defaults to project deadline on create (UX optional); overdue badge when past due |
| **Track status** | `todo`, `in_progress`, `blocked`, `done`, `cancelled`; quick actions: Start, Done, Block |
| **Monitor accountability** | My Tasks inbox, assignee column, overdue counts, blocked reason, activity log, project manager rollups |
| **Stage grouping** | Tasks grouped by project stage key within project detail |
| **Sort order** | Manual ordering within stage (`sort_order`) |
| **Progress rollup** | Project progress = done tasks / non-cancelled tasks × 100 |
| **Permissions** | `projects.manage_tasks` for create/edit/assign; assignees update own task status |
| **Export** | CSV export of project task list with assignee, due date, priority, status |

### 5.2 Out of Scope (Phase 1)

- Bulk assign / bulk status change
- Task comments and @mentions (Phase 2)
- File attachments on tasks (link to Documents in Phase 2)
- Task templates and copy-from-milestone import
- Cross-project task board (portfolio Kanban)
- Workload calendar and capacity planning
- Strict enforcement that all tasks must be done before project close (warn-only Phase 1)

---

## 6. Core Product Concept

A **task** is the smallest unit of accountable delivery work inside a **project**. Every task answers:

- **What** — title and optional description  
- **Who** — assignee (or Unassigned)  
- **When** — due date (optional)  
- **How urgent** — priority  
- **Where in delivery** — stage (Kickoff → Closure)  
- **Current state** — status  

Tasks roll up to **project progress** and **stage summaries**. The **My Tasks** view is the team member's daily execution inbox across all projects.

### 6.1 Relationship to Related CRM Objects

| Object | Role relative to Task Management |
|--------|----------------------------------|
| **Project** | Parent container; tasks cannot exist without a project in Phase 1 |
| **Project Member** | Team roster; assignees may be prompted to join as member when assigned |
| **User** | Task assignee, project manager, activity log actor |
| **Follow-up Reminder** | Personal reminder queue—not structured project tasks |
| **Sales Order Milestone** | Commercial/billing checkpoint—not the primary task store |
| **Deal stage** | Pipeline progression—not delivery task status |
| **Activity Log** | Audit trail for task lifecycle events |

### 6.2 Current Data Model (Phase 1)

Tasks are stored in **`project_tasks`**:

| Field | Purpose |
|-------|---------|
| `project_id` | Parent project (required) |
| `stage_key` | Delivery stage grouping |
| `title`, `description` | Task content |
| `assigned_to_id` | Assignee (optional) |
| `status` | Lifecycle state |
| `priority` | low / normal / high |
| `due_date` | Deadline for task |
| `completed_at` | Set when status → done |
| `sort_order` | Order within stage |
| `blocked_reason` | Optional text when status = blocked |
| `created_by_id` | Creator |

Configuration lives in **`projects_config.py`**: task statuses, priorities, stages, open-task statuses.

---

## 7. Task Lifecycle

### 7.1 Task Statuses

| Status | Label | Meaning |
|--------|-------|---------|
| `todo` | To Do | Not started |
| `in_progress` | In Progress | Actively being worked |
| `blocked` | Blocked | Waiting on dependency, client input, or internal blocker |
| `done` | Done | Completed |
| `cancelled` | Cancelled | No longer required; excluded from progress denominator |

### 7.2 Priority Levels

| Priority | Label | Typical use |
|----------|-------|-------------|
| `low` | Low | Nice-to-have, no immediate deadline pressure |
| `normal` | Normal | Standard delivery work (default) |
| `high` | High | Urgent, client-critical, or deadline-sensitive |

### 7.3 Default Stages (Task Grouping)

Tasks are grouped under project delivery stages:

| Stage key | Label |
|-----------|-------|
| `kickoff` | Kickoff |
| `discovery` | Discovery |
| `execution` | Execution |
| `review` | Review |
| `closure` | Closure |

Phase 1 uses a **global stage template**. Phase 2 may allow custom templates per project type.

### 7.4 Status Transition Rules (Phase 1)

- Any open status may move to any other status (flexible; no strict state machine).
- Moving to `done` sets `completed_at`.
- Moving away from `done` clears `completed_at`.
- `blocked` may include optional `blocked_reason` text.
- Cancelled tasks remain visible but are excluded from progress calculation.

### 7.5 Overdue Rules

A task is **overdue** when:

1. `due_date` is set, and  
2. `due_date < today`, and  
3. Status is not `done` or `cancelled`

Empty due date = no overdue flag.

### 7.6 Progress Rollup

```
project progress % = (count of done tasks) / (count of non-cancelled tasks) × 100
```

- Zero tasks → 0% progress with CTA to add tasks  
- Cancelled tasks excluded from denominator  
- Recalculated on every task status change  

---

## 8. Assignment and Accountability Model

### 8.1 Assignment Rules

1. Assignee must be an **active staff user** if set.
2. Unassigned tasks display an **Unassigned** badge on project detail.
3. Assigning a user not on the project team may prompt add-as-member (Phase 2 confirm dialog; Phase 1 optional auto-add).
4. Project manager is always accountable at project level even when individual tasks are unassigned.

### 8.2 Who Can Do What

| Action | Project Manager | Project Member | Assignee | Admin / Manager |
|--------|-----------------|----------------|----------|-----------------|
| Create task | ✓ | ✓ (if `manage_tasks`) | — | ✓ |
| Assign / reassign | ✓ | ✓ (if `manage_tasks`) | — | ✓ |
| Edit title, stage, due date | ✓ | ✓ (if `manage_tasks`) | — | ✓ |
| Update own task status | ✓ | ✓ (if assigned) | ✓ | ✓ |
| Delete task | ✓ | ✓ (if `manage_tasks`) | — | ✓ |
| View all company tasks | — | — | — | ✓ (if `view_all`) |

### 8.3 Accountability Signals

| Signal | Where surfaced |
|--------|----------------|
| Assignee name | Project task table, My Tasks |
| Unassigned count | Project detail summary |
| Overdue task count | Project detail, project index, contact summary |
| Blocked tasks + reason | Project detail task row |
| Open tasks per assignee | Project detail filters (Phase 2) |
| My open tasks KPI | Projects index |
| Activity log | Admin activity logs: task created, assigned, status changed, completed |
| Stage done/total | Project detail stage tabs and summary table |

### 8.4 Locked Projects

When project status is **completed** or **cancelled**:

- Task edits require `projects.edit` (manager/admin override)
- Assignees cannot casually change status on locked projects

---

## 9. Information Architecture and Navigation

### 9.1 Primary Surfaces

| Surface | Route | Purpose |
|---------|-------|---------|
| **Project detail — tasks** | `/projects/:id` | Stage-grouped task list, quick-add, status actions |
| **My Tasks** | `/projects/my-tasks` | Cross-project inbox for current user's open assigned tasks |
| **Projects index** | `/projects` | Portfolio view with open task count, overdue flags, progress % |

### 9.2 Entry Points for Tasks

- Project detail → Add task (inline quick-add per stage)
- Project detail → Start / Done / Block quick actions on task row
- My Tasks → Start / Done / Open project
- Contact / Deal / Sales Order → Create project → add tasks on project detail

There is no standalone `/tasks` route in Phase 1; tasks are always accessed via Projects or My Tasks.

---

## 10. Detailed Functional Requirements

### 10.1 Create Task

**Required fields**

- Title (required)
- Stage (default: active stage tab or `kickoff`)

**Optional fields**

- Description  
- Assignee  
- Due date (may default to project deadline)  
- Priority (default: normal)  
- Status (default: todo)  

**Behaviors**

- Cannot add tasks to completed/cancelled projects unless reopened  
- Activity log: `project_task_created`  
- Progress bar updates after save  

### 10.2 Assign Task

**Behaviors**

- Assignee dropdown lists active staff  
- Clearing assignee sets task to Unassigned  
- Activity log: `project_task_assigned` (on assignee change)  
- My Tasks reflects assignment immediately after save  

### 10.3 Set Priority

**Behaviors**

- Priority badge on task row and My Tasks  
- High priority visually distinct (red badge)  
- Default: normal on create  
- Sort in My Tasks may weight high priority (Phase 2); Phase 1 sort by due date  

### 10.4 Add Due Date

**Behaviors**

- Date picker on create/edit and quick-add  
- Overdue badge appears when rule in §7.5 applies  
- Task due date may exceed project deadline (warning only Phase 1)  
- Empty due date allowed but discouraged in UX copy  

### 10.5 Track Status

**Required behaviors**

- Status badge on every task row  
- Quick actions: **Start** (→ in_progress), **Done** (→ done), **Block** (→ blocked)  
- Blocked status supports optional reason text  
- Completed task shows `completed_at` timestamp internally  
- Activity log: `project_task_status_changed`, `project_task_completed`  

**My Tasks quick update**

- Start, Complete, Open project link without full page navigation where possible  

### 10.6 Monitor Team Accountability

**Project detail summary cards**

- Total tasks, Done, Overdue, Blocked  

**Stage summary table**

| Stage | Tasks done | Overdue |
|-------|------------|---------|

**Projects index columns**

- Open tasks count  
- Overdue flag / overdue task count  
- Progress %  
- Project manager (accountable owner)  

**My Tasks columns**

- Task, Project, Client, Due date, Priority, Status, Actions  

**Filters**

- My Tasks: overdue only, due this week, by project (Phase 1 partial)  
- Project index: overdue projects/tasks filter  

### 10.7 Delete Task

- Confirmation required  
- Hard delete in Phase 1  
- Activity log: `project_task_deleted`  
- Progress recalculates after delete  

### 10.8 Export

- CSV columns: project metadata + stage, task title, assignee, due date, priority, status, blocked reason  
- Filename: `project-{code}-tasks-{YYYY-MM}.csv`  
- Activity log: `project_exported`  
- Requires `projects.export` permission  

---

## 11. UX and Design Requirements

### 11.1 Visual Design

- Follow existing CRM design language (`crm-proj-*` badge and progress classes)
- Task status badges: todo (gray), in progress (blue), blocked (amber), done (green)
- Priority badges: low (slate), normal (indigo), high (red)
- Overdue tasks: red **Overdue** badge + subtle row highlight
- Unassigned: muted **Unassigned** label
- Progress bar on project header and index rows

### 11.2 Project Detail Task Layout

1. Progress bar + summary cards above task list  
2. Stage tabs with done/total counts  
3. Task table per active stage: title, assignee, due, priority, status, actions  
4. Quick-add row at bottom of stage section  
5. Team panel on sidebar for roster context  

### 11.3 My Tasks Layout

- Default sort: due date ascending (nulls last)  
- Overdue tasks visually prominent  
- Empty state: "No assigned tasks"  
- Link to parent project on every row  

### 11.4 Responsive Behavior

- Task table scrollable on tablet  
- My Tasks usable for daily check-in on laptop/tablet  
- Quick actions accessible without modal for common status changes  

### 11.5 Error Handling

- Invalid assignee → clear validation message  
- Task edit on locked project → permission message  
- Project not found → standard 404  
- Assignee without project access still sees task in My Tasks if assigned  

---

## 12. Permission Model

### 12.1 Relevant Permissions

| Permission | Task behavior |
|------------|---------------|
| `projects.view` | View tasks on accessible projects; My Tasks inbox |
| `projects.view_all` | View all company project tasks |
| `projects.manage_tasks` | Create, edit, assign, delete tasks on accessible projects |
| `projects.edit` | Override task edits on locked/completed projects |
| `projects.export` | Export task CSV |

### 12.2 Role Expectations

| Role | Task access |
|------|-------------|
| **Admin / Manager** | Full task management on all projects |
| **Operations / PM** | Create, assign, manage tasks on owned/member projects |
| **Employee** | View assigned projects; update status on own assigned tasks |
| **Sales** | Read-only on linked project tasks (Phase 1) |
| **User (portal)** | No access |

---

## 13. Data Fields (UI-Centric)

### 13.1 Task Row (List / Detail)

- `id`, `project_id`  
- `stage_key`, `stage_label`  
- `title`, `description`  
- `assigned_to_id`, `assigned_to_name`  
- `status`, `status_label`  
- `priority`, `priority_label`  
- `due_date`, `completed_at`  
- `sort_order`, `blocked_reason`  
- `is_overdue` (computed)  
- `created_at`, `updated_at`  

### 13.2 My Tasks Row

- All task fields above, plus:  
- `project_name`, `project_number`  
- `client_name`, `project_deadline`  

---

## 14. Validation and Business Rules

1. Task title required; max 200 characters.  
2. Assignee must be active staff if set.  
3. Status and priority must be valid enum values.  
4. Stage key must be valid global stage.  
5. Cancelled tasks excluded from progress denominator.  
6. Done tasks set `completed_at`; reverting clears it.  
7. Cannot add tasks to completed/cancelled projects (unless reopened).  
8. Task edits on locked projects require manager/admin permission.  
9. Activity log records status transitions with actor and timestamp.  
10. Deleted tasks cascade only via draft project delete; individual task delete is explicit.  

---

## 15. Notifications and Reminders (Phase 2)

Phase 1 surfaces overdue work **in UI only** (badges, KPIs, My Tasks filters).

Phase 2 may add:

- Notify assignee on task assignment  
- Reminder when task due tomorrow / overdue  
- Weekly digest: my open tasks  
- Optional sync to Follow-ups queue for personal nudges  

---

## 16. API Endpoints (Task Scope)

Implemented under `/projects` router:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/projects/my-tasks` | Current user's open assigned tasks |
| POST | `/projects/{id}/tasks` | Create task |
| PUT | `/projects/{id}/tasks/{task_id}` | Update task (assign, priority, due, status) |
| DELETE | `/projects/{id}/tasks/{task_id}` | Delete task |
| POST | `/projects/export-log` | Log CSV export |

Task data is also returned in `GET /projects/{id}` (detail) and `GET /projects` (list rollups).

---

## 17. Analytics Events

| Event | When |
|-------|------|
| `project_task_created` | Task created |
| `project_task_assigned` | Assignee changed |
| `project_task_status_changed` | Status updated |
| `project_task_completed` | Status → done |
| `my_tasks_viewed` | My Tasks page loaded |
| `project_exported` | Task CSV exported |

Payload should include: `project_id`, `task_id`, `status`, `assignee_id`, `priority`, `is_overdue`, `progress_percent`.

---

## 18. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Confusion with Follow-ups | Clear labels: Follow-ups = personal reminders; Tasks = structured delivery work |
| Confusion with order milestones | Orders = commercial; Projects/Tasks = execution |
| Low adoption if task entry is heavy | Quick-add task, sensible defaults, My Tasks inbox |
| Progress gaming via cancelling tasks | Cancelled excluded from progress; activity log audit |
| Unassigned work hides accountability | Unassigned badge, manager accountability at project level |
| Overdue noise without notifications | Phase 1 UI badges; Phase 2 notifications |

---

## 19. Release Phasing

### Phase 1 (MVP) — Current

- Task CRUD within projects  
- Assignee, priority, due date, status  
- Stage grouping and sort order  
- Quick status actions (Start, Done, Block)  
- My Tasks inbox  
- Overdue indicators and progress rollup  
- CSV export  
- Activity logging  
- Role-based task permissions  

### Phase 2

- Kanban board by stage/status  
- Bulk assign and bulk status update  
- Task comments and completion notes  
- Notifications on assign/due  
- Import tasks from sales order milestones  
- Task templates  
- Filter tasks by assignee on project detail  
- Strict project completion (all tasks done)  

### Phase 3

- Standalone tasks outside projects (optional)  
- Dependencies and subtasks  
- Estimated hours and time tracking  
- Workload calendar and capacity view  
- AI suggested task breakdown  

---

## 20. UAT Acceptance Checklist

1. User can create a task with title, stage, assignee, due date, and priority.  
2. User can assign or reassign a task to an active staff member.  
3. Priority displays correctly as low, normal, or high badge.  
4. Due date displays correctly; overdue badge appears when past due and not done.  
5. User can change task status via Start, Done, and Block actions.  
6. Blocked task can store an optional blocked reason.  
7. Task status change updates project progress percent correctly.  
8. Cancelled tasks do not count toward progress denominator.  
9. My Tasks shows only current user's open assigned tasks, sorted by due date.  
10. Unassigned tasks show Unassigned badge on project detail.  
11. Overdue task count appears on project detail and project index.  
12. Employee can update status on own assigned tasks but not reassign others' tasks.  
13. Completed project locks task edits for non-managers.  
14. CSV export matches on-screen task list with assignee and status columns.  
15. Activity log records task creation and completion.  

---

## 21. Open Product Questions

1. Should assigning a task auto-add the user as project member without confirmation?  
2. Should high-priority tasks sort above normal tasks in My Tasks when due dates tie?  
3. Is blocked reason required when status = blocked (Phase 2 strict mode)?  
4. Should sales users see task assignee names or only aggregate progress?  
5. Should overdue project tasks auto-create Follow-up reminders (Phase 2)?  

---

## Appendix A: Task Management vs Related Modules

| Aspect | Follow-ups | Sales Order Milestones | Task Management |
|--------|------------|------------------------|-----------------|
| Purpose | Personal reminder queue | Commercial checkpoint | Delivery execution unit |
| Owner | Reminder assignee | Milestone owner | Task assignee |
| Container | Lead/Deal/Contact | Sales Order | Project |
| Due date | `due_at` | Milestone due date | Task due date |
| Status | pending/complete | pending/done/etc. | todo/in_progress/blocked/done |
| Team visibility | Individual | Order team | Project team + My Tasks |
| Accountability | Self | Order fulfillment | Assignee + PM rollup |

---

## Appendix B: Example Task Table (Project Detail)

**Project:** GST Registration — Acme Industries · **Stage:** Discovery

| Task | Assignee | Due | Priority | Status |
|------|----------|-----|----------|--------|
| Collect board resolution | Rahul | 18 Jun | High | Overdue |
| Site visit checklist | Priya | 22 Jun | Normal | In Progress |
| Requirements sign-off | Priya | 25 Jun | Normal | To Do |
| Client document review | — | 28 Jun | Low | To Do |

**Summary:** 1 overdue · 1 blocked · 2 open · 60% project progress

---

## Appendix C: Badge Labels

- To Do · In Progress · Blocked · Done · Cancelled  
- Low Priority · Normal · High Priority  
- Overdue · Unassigned  

---

End of document.
