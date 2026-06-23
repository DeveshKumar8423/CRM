from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth_utils import get_db, require_permission
from models import Expense, LeaveRequest, PurchaseOrder, Quotation, TimesheetEntry, User, VendorBill
from permissions import role_has_permission
from schemas import ApprovalQueueItem, ApprovalsSummaryResponse

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("/summary", response_model=ApprovalsSummaryResponse)
def approvals_summary(
    current_user: User = Depends(require_permission("approvals.view")),
    db: Session = Depends(get_db),
):
    queues: list[ApprovalQueueItem] = []

    if role_has_permission(db, current_user.role, "leaves.approve"):
        count = db.query(LeaveRequest).filter(LeaveRequest.status == "pending").count()
        if count:
            queues.append(ApprovalQueueItem(module="leaves", label="Leave requests", count=count, path="/leaves/approval-queue"))

    if role_has_permission(db, current_user.role, "timesheets.approve"):
        count = db.query(TimesheetEntry).filter(TimesheetEntry.status == "submitted").count()
        if count:
            queues.append(ApprovalQueueItem(module="timesheets", label="Timesheets", count=count, path="/timesheets/approval-queue"))

    if role_has_permission(db, current_user.role, "expenses.approve"):
        count = db.query(Expense).filter(Expense.status.in_(["submitted", "under_review"])).count()
        if count:
            queues.append(ApprovalQueueItem(module="expenses", label="Expenses", count=count, path="/expenses/approval-queue"))

    if role_has_permission(db, current_user.role, "quotations.approve"):
        count = db.query(Quotation).filter(Quotation.status == "pending_approval").count()
        if count:
            queues.append(ApprovalQueueItem(module="quotations", label="Quotations", count=count, path="/quotations/approval-queue"))

    if role_has_permission(db, current_user.role, "purchase_orders.approve"):
        count = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["submitted", "under_review"])).count()
        if count:
            queues.append(ApprovalQueueItem(module="purchase_orders", label="Purchase orders", count=count, path="/purchase-orders/approval-queue"))

    if role_has_permission(db, current_user.role, "vendor_bills.approve"):
        count = db.query(VendorBill).filter(VendorBill.status.in_(["submitted", "under_review"])).count()
        if count:
            queues.append(ApprovalQueueItem(module="vendor_bills", label="Vendor bills", count=count, path="/vendor-bills/approval-queue"))

    total = sum(q.count for q in queues)
    return ApprovalsSummaryResponse(total_pending=total, queues=queues)
