# Product Requirements Document (PRD)
## Client Notes (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Customer Intelligence / Communication History / Relationship Management  
**Document Version:** v1.0  
**Date:** 2026-06-13  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Client Notes is a unified customer intelligence surface for maintaining call notes, requirements, objections, preferences, follow-up context, and communication history. It should help sales, account, and operations teams retain everything that matters about a client relationship in one place so the next interaction is faster, more relevant, and less dependent on memory.

The module must be easy to use during real customer conversations, quickly searchable later, and visible in the right CRM contexts such as Contact, Lead, Deal, Quotation, Sales Order, and Invoice detail views. The experience should feel like a natural extension of the CRM rather than a separate knowledge base.

---

## 2. Problem Statement

Today, important client context is often scattered across call logs, message threads, personal notebooks, and memory. That creates a risk that teams repeat questions, miss objections, forget client preferences, or lose the rationale behind commercial decisions.

This module should solve the following problems:

- Call notes are not consistently captured in a structured way
- Requirements and objections are buried in general notes fields
- Client preferences are remembered by individuals rather than the team
- Communication history is hard to reconstruct before a follow-up
- Teams cannot easily see the latest context before making a quote, order, or invoice decision
- High-value customer insights are not accessible across roles and screens

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a unified, searchable record of client notes and relationship context.
2. Capture call notes, requirements, objections, preferences, and follow-up items in a structured UI.
3. Surface the latest client context directly in CRM workflows.
4. Preserve a chronological communication history for each customer.
5. Reduce duplicate questioning and inconsistent handoffs between team members.
6. Make note entry fast enough to use during live calls or after meetings.
7. Support role-based visibility, editing, and auditability.

### 3.2 Non-Goals (This Phase)

1. Full contact center telephony integration.
2. Automated transcription or AI summarization of calls.
3. Real-time omnichannel messaging inbox.
4. Advanced knowledge graph or recommendation engine.
5. Formal CRM case management or support ticketing.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Sales Executive: Records calls, objections, preferences, and next steps.
- Account Manager: Maintains relationship memory and follow-up context.
- Team Lead / Manager: Reviews customer intelligence quality and consistency.
- Operations / Delivery Owner: Reads notes before execution or handoff.
- Admin: Configures note categories, permissions, and retention rules.

### 4.2 Secondary Users

- Finance User: Reviews billing-related client instructions or exceptions.
- Support or Back Office Staff: Checks relationship notes before responding.
- New Team Member: Learns account history without relying on informal handoff.

---

## 5. Scope Overview

### 5.1 In Scope

- Add client notes to contacts and related CRM entities
- Record call notes, meeting notes, and communication updates
- Capture structured fields for requirements, objections, preferences, risks, and next steps
- Maintain a chronological communication history
- Show note timeline and recent interactions in detail views
- Search and filter notes across customers and note types
- Pin important notes or mark as key client insight
- Track ownership, timestamps, and edit history
- Link notes to deals, quotations, orders, and invoices where relevant
- Provide reminders or follow-up flags

### 5.2 Out of Scope (Phase 1)

- Full omnichannel messaging archive
- Automatic call recording or speech-to-text
- External note collaboration with clients
- AI-based insight extraction
- Task management replacing the existing CRM follow-up patterns

---

## 6. Core Product Concept

Client Notes is not just a free-text comment box. It is a relationship memory layer for the CRM. Every meaningful interaction with a customer should be able to add structured context that can be read later without ambiguity.

The product should support both:

- Quick note capture during or immediately after a conversation
- Rich relationship history that can be reviewed before the next interaction

The system should treat notes as part of the customer’s living history, not as temporary scratch text.

---

## 7. Note Lifecycle and Information Model

### 7.1 Canonical Note Types

1. Call note
2. Meeting note
3. Email summary
4. WhatsApp / message summary
5. Requirement note
6. Objection note
7. Preference note
8. Follow-up note
9. Risk note
10. Internal relationship note
11. Escalation note
12. Billing / payment context note

### 7.2 Note Status or Visibility Flags

- Internal only
- Shareable across team
- Pinned / important
- Follow-up required
- Closed / resolved
- Sensitive / restricted

### 7.3 Suggested Note Attributes

- Note title or summary
- Note body
- Note type
- Client/contact linkage
- Related lead/deal/order/invoice linkage
- Owner/author
- Visibility scope
- Priority or importance flag
- Follow-up due date
- Tags or topic labels
- Created at / updated at
- Last reviewed timestamp

### 7.4 Relationship Rules

- A note may belong to a contact and optionally link to other CRM records.
- The most recent note should be easy to find without deep navigation.
- Important notes should be pinnable so they remain visible at the top of the relationship history.
- Objections and preferences should be preserved as durable relationship context rather than buried in chronological text.

---

## 8. Information Architecture and Navigation

### 8.1 Where Client Notes Appear

- Contact detail page
- Lead detail page
- Deal detail page
- Quotation detail page
- Sales order detail page
- Invoice detail page
- Global search / notes search page
- Manager dashboard relationship summary area

### 8.2 Primary Screens

1. Client Notes timeline view
2. Add Note dialog or side panel
3. Client Notes detail page
4. Filtered search results page
5. Relationship summary sidebar
6. Follow-up queue
7. Pinned notes / important insights view

### 8.3 Cross-Module Entry Points

- From Contact detail: open full client notes timeline
- From Lead detail: convert lead note into client note context
- From Deal detail: attach negotiation notes or objections
- From Quotation detail: attach quote-specific objections or preferences
- From Sales Order / Invoice detail: attach execution or billing notes

---

## 9. Detailed Functional Requirements

## 9.1 Client Notes Timeline Page

### Required Elements

- Chronological note feed
- Filters:
  - note type
  - author
  - tag
  - date range
  - linked module type
  - pinned / follow-up required / sensitive
- Search within notes by keyword
- Quick summary header for the customer
- Counts for notes, follow-ups, pinned items, and recent activity

### Note Card Contents

- Date and time
- Author
- Type badge
- Summary/title
- Full note excerpt or expandable body
- Linked entities
- Tags
- Follow-up indicator
- Edit history indicator where relevant

### UX Behaviors

- Sticky note composer at top or bottom depending on screen
- Infinite scroll or paginated timeline for long histories
- “Most recent first” as the default ordering
- Pinned notes clearly separated from regular notes

## 9.2 Quick Note Capture

### Capture Entry Points

- Add note from contact header
- Add note from lead detail
- Add note from deal, quotation, order, or invoice detail
- Global quick action “New client note”

### Required Quick Capture Fields

- Client/contact
- Note type
- Summary
- Body
- Follow-up required toggle
- Follow-up date
- Visibility scope

### UX Expectations

- Can be completed in a few seconds during a call
- Defaults should minimize typing
- Mobile-friendly and keyboard-friendly entry experience

## 9.3 Structured Note Categories

### Call Notes

- Call summary
- Client mood / tone
- Questions asked
- Promises made
- Next steps

### Requirement Notes

- Business requirement
- Scope clarification
- Urgency
- Deliverable expectations
- Constraints

### Objection Notes

- Price concern
- Timing concern
- Trust concern
- Feature gap concern
- Decision blocker

### Preference Notes

- Communication channel preference
- Time-of-day preference
- Brand/style preference
- Pricing format preference
- Documentation preference

### Follow-Up Notes

- Action owner
- Due date
- Pending response
- Escalation path

### Risk Notes

- Procurement risk
- Payment risk
- Delivery risk
- Decision-maker risk
- Competition risk

## 9.4 Communication History View

### Required Elements

- Unified interaction timeline
- Separate visual markers for notes, calls, emails, meetings, and major decisions
- Latest communication summary at top
- Related commercial milestones:
  - lead conversion
  - quote sent
  - order confirmed
  - invoice issued
  - payment follow-up

### Communication History Behaviors

- Timeline should read like a relationship story, not a raw activity log.
- Major milestones should be visually distinct from ordinary notes.
- The user should be able to jump from a note to the related quote, order, or invoice.

## 9.5 Search and Discovery

### Required Search Modes

- Search across note text
- Search by contact/company name
- Search by note type
- Search by author
- Search by tag or theme
- Search by linked deal/order/invoice

### Search UX

- Search bar should be prominent at the top of the notes area
- Filter chips should update results without confusion
- Search results should show a short excerpt with highlighted keyword match

## 9.6 Follow-Up Management

### Required Capabilities

- Mark a note as follow-up required
- Set due date and reminder priority
- Assign follow-up owner
- Mark follow-up complete
- Filter notes by pending follow-up

### UX Expectations

- Follow-up items should be visible from a dedicated queue
- Overdue follow-ups should stand out in color and ordering
- A note should remain linked to the follow-up until it is resolved

## 9.7 Pinned and Key Insights

### Requirements

- Important notes can be pinned to the top of the customer record.
- Teams should be able to mark notes as “client preference”, “decision factor”, or “critical warning”.
- Pinned notes should be visible in compact summary cards within linked CRM pages.

### UI Suggestions

- Use a prominent pin icon or highlight state
- Keep pinned insights visible even when the timeline is long
- Allow managers to quickly identify the most important customer context

## 9.8 Edit History and Audit Trail

### Requirements

- Notes should show author and time created.
- Edited notes should show last edited time and editor.
- The user should be able to view change history for important or sensitive notes.
- Deletions should be handled carefully and visible in audit context when permitted.

### UX Expectations

- “Edited” indicator beside note timestamps
- Collapsed history panel for detailed audit information
- Clear distinction between current note content and previous versions

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, card, badge, and timeline styling patterns.
- Notes should look like relationship intelligence, not a generic comments box.
- The latest context should be easy to scan within a few seconds.

## 10.2 Suggested Layouts

### Contact / Client Record

- Top summary area with customer identity and key relationship chips
- Middle section with pinned notes and recent notes
- Side panel with preferences, objections, and follow-up status
- Bottom section with full communication history

### Dedicated Notes Page

- Left: filters and search
- Center: note timeline
- Right: relationship summary and follow-up queue

### Quick Capture Modal / Drawer

- Title, type, summary, body, follow-up toggle
- Minimal distractions
- Primary save action clearly visible

## 10.3 Interaction Patterns

- Quick-add note should not require leaving the customer record.
- Long note bodies should expand/collapse cleanly.
- Notes should be taggable and filterable without visual clutter.
- Pinned or important notes should be visually distinct but not overwhelming.

## 10.4 Empty, Loading, and Error States

- Empty customer note state should encourage first capture.
- Empty search state should explain that no matching notes were found.
- Loading state should use lightweight skeletons in the timeline.
- Error state should preserve typed draft if save fails.

## 10.5 Accessibility

- Keyboard shortcuts for quick note saving should be considered in the product experience.
- Timeline entries should be readable by screen readers in logical order.
- Color should not be the only signal for note importance or follow-up status.
- All form fields should have explicit labels.

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- client_notes.view
- client_notes.create
- client_notes.edit_own
- client_notes.edit_all
- client_notes.delete
- client_notes.pin
- client_notes.view_sensitive
- client_notes.manage_followups
- client_notes.manage_settings

### Role Expectations

- Sales Executive: create and edit own notes, mark follow-ups, see team-shared notes
- Account Manager: create and edit notes across assigned accounts, pin key insights
- Manager/Admin: manage sensitive notes, audit visibility, and configure note policy
- Operations/Billing: view relevant notes tied to execution or billing, but not necessarily all sensitive relationship notes

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Fields

- Note ID
- Note title or summary
- Note body
- Note type
- Client/contact
- Linked deal
- Linked quotation
- Linked sales order
- Linked invoice
- Owner/author
- Created at
- Updated at

### 12.2 Context Fields

- Tag or category
- Follow-up required
- Follow-up due date
- Priority
- Visibility scope
- Pinned state
- Sensitive state
- Related task or milestone

### 12.3 Audit Fields

- Last edited by
- Edit timestamp
- History count
- Archived / deleted indicator

---

## 13. Validation and Business Rules

1. Notes must be linked to at least one customer record.
2. Sensitive notes should require appropriate permission to view.
3. Follow-up dates cannot be set in invalid formats.
4. Pinned notes should have a clear priority hierarchy if multiple notes are pinned.
5. Notes marked as resolved should remain searchable and historically visible.
6. Communication history should preserve order and timestamps.
7. Required customer context should be visible in linked detail pages.
8. Deletions should not silently erase audit-relevant information.

---

## 14. Notifications and Reminders

### Internal Notifications

- New note added to assigned customer
- Follow-up due soon
- Follow-up overdue
- Important note pinned
- Sensitive note updated

### Workflow Reminders

- Prompt user to add call notes after a logged activity
- Remind owner when a follow-up remains incomplete
- Surface recent objections before creating a quote or order

---

## 15. Reporting and Insights

### Operational Reports

- Notes by customer
- Notes by owner
- Follow-up completion rate
- Overdue follow-up count
- Most common objections
- Most common client preferences
- Customers with most recent activity

### UI Artifacts

- Relationship health cards
- Follow-up queue summary
- Recent notes feed on dashboards
- Preference and objection tags distribution

---

## 16. Analytics Events

- client_note_created
- client_note_edited
- client_note_deleted
- client_note_pinned
- client_note_followup_set
- client_note_followup_completed
- client_note_shared_to_team
- client_note_viewed
- client_note_search_performed

Event payload should include customer, note type, author, follow-up flag, and linked module context.

---

## 17. Risks and Mitigations

1. Risk: Notes become a dumping ground for unstructured text.  
   Mitigation: Use note types, tags, and guided capture fields.

2. Risk: Sensitive relationship context is too widely visible.  
   Mitigation: Add visibility scopes and permission-aware views.

3. Risk: The team stops using the system because note entry is slow.  
   Mitigation: Make quick capture prominent and minimal.

4. Risk: Important preferences and objections get lost in long timelines.  
   Mitigation: Pin key insights and surface them in summary cards.

5. Risk: Communication history becomes cluttered with low-value events.  
   Mitigation: Distinguish major milestones from ordinary notes and allow filtering.

---

## 18. Release Phasing

### Phase 1 (MVP)

- Note capture from contact and related record pages
- Note timeline and search
- Note types, tags, follow-up flags
- Pinned notes and visibility basics
- Communication history view

### Phase 2

- More structured objections and preferences
- Follow-up queue and reminders
- Sensitive note permissions
- Edit history and change tracking

### Phase 3

- Dashboard insights and trend reporting
- Advanced customer intelligence summary cards
- Deeper contextual surfacing across quotes, orders, and invoices

---

## 19. UAT Acceptance Checklist

1. User can add a note from a contact or related CRM record.
2. Notes appear in chronological communication history.
3. User can categorize notes as calls, objections, preferences, requirements, or follow-ups.
4. User can search notes by keyword and filter by type.
5. User can pin important relationship insights.
6. User can set and complete follow-up tasks linked to notes.
7. Sensitive notes are visible only to authorized roles.
8. Recent notes are surfaced in linked customer screens.
9. Edit history is visible for modified notes.
10. The UI makes it easy to capture and review client context without leaving the CRM flow.

---

## 20. UI Suggestions Summary

1. Make the note composer available directly inside customer records.
2. Use pinned insight cards to keep preferences and objections visible.
3. Separate call notes, requirements, and follow-up items visually so the timeline is scannable.
4. Show communication history as a story of interactions, not a raw log dump.
5. Make search and filtering fast and obvious for long-running accounts.
6. Surface the latest context in other modules so teams do not have to hunt for it.

---

## 21. Open Product Questions for Final Sign-Off

1. Should notes be shared across the entire company by default or restricted to assigned teams?
2. Should note categories be fixed or configurable by admin?
3. Do we want a single unified history per customer or separate timelines per contact and organization?
4. Should pinned notes expire or require review after a period of time?
5. Which note types should appear in dashboard summaries versus only in detail views?

---

## Appendix A: Suggested Screen Inventory

1. Client Notes - Timeline
2. Client Notes - Quick Add
3. Client Notes - Search Results
4. Client Notes - Follow-Up Queue
5. Client Notes - Pinned Insights
6. Client Notes - Customer Summary Sidebar
7. Client Notes - Audit / Edit History

---

## Appendix B: Recommended Badge Labels

- Call Note
- Meeting Note
- Requirement
- Objection
- Preference
- Follow-Up
- Risk
- Internal
- Pinned
- Sensitive
- Resolved
- Overdue

---

End of document.
