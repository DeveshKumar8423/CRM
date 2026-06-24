"""POS API schemas."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


class PosSettingsResponse(BaseModel):
    is_enabled: bool
    default_register_id: int | None
    bill_number_prefix: str
    auto_create_invoice: bool
    inventory_deduct_on_sale: bool
    allow_negative_stock: bool
    receipt_header: str | None
    receipt_footer: str | None
    require_customer_phone: bool
    max_line_discount_pct: float
    return_window_days: int


class PosSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    default_register_id: int | None = None
    bill_number_prefix: str | None = Field(default=None, max_length=10)
    auto_create_invoice: bool | None = None
    inventory_deduct_on_sale: bool | None = None
    allow_negative_stock: bool | None = None
    receipt_header: str | None = None
    receipt_footer: str | None = None
    require_customer_phone: bool | None = None
    max_line_discount_pct: float | None = None
    return_window_days: int | None = None


class PosRegisterResponse(BaseModel):
    id: int
    name: str
    code: str
    is_active: bool
    default_payment_method: str
    opening_float_default: float
    has_open_session: bool = False


class PosRegisterCreateRequest(BaseModel):
    name: str
    code: str
    default_payment_method: str = "cash"
    opening_float_default: float = 2000


class PosDashboardResponse(BaseModel):
    sales_today: float
    bills_today: int
    open_sessions: int
    payment_mix: dict[str, float]
    recent_bills: list["PosBillListItem"]


class PosSessionResponse(BaseModel):
    id: int
    register_id: int
    register_name: str
    status: str
    opening_float: float
    closing_cash_counted: float | None
    expected_cash: float | None
    cash_variance: float | None
    opened_by_name: str
    opened_at: datetime
    closed_at: datetime | None


class PosSessionOpenRequest(BaseModel):
    register_id: int
    opening_float: float


class PosSessionCloseRequest(BaseModel):
    closing_cash_counted: float
    notes: str | None = None


class PosZReportResponse(BaseModel):
    session: PosSessionResponse
    bill_count: int
    gross_sales: float
    discount_total: float
    net_sales: float
    payment_breakdown: dict[str, float]
    cash_opening: float
    cash_sales: float
    cash_refunds: float
    cash_expected: float
    cash_counted: float | None
    cash_variance: float | None
    void_count: int
    return_count: int


class PosProductTerminal(BaseModel):
    id: int
    name: str
    category: str | None
    price: float | None
    gst_rate: float
    in_stock: bool
    service_code: str | None


class PosCatalogResponse(BaseModel):
    items: list[PosProductTerminal]
    categories: list[str]


class PosCartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: float
    unit_price: float
    discount_amount: float
    gst_rate: float
    line_total: float


class PosCartResponse(BaseModel):
    id: int
    status: str
    items: list[PosCartItemResponse]
    item_count: int
    subtotal: float
    discount_total: float
    tax_total: float
    grand_total: float
    customer_name: str | None
    customer_phone: str | None
    held_label: str | None


class PosCartAddRequest(BaseModel):
    product_id: int
    quantity: float = 1


class PosCartUpdateRequest(BaseModel):
    quantity: float | None = None
    discount_amount: float | None = None


class PosCartHoldRequest(BaseModel):
    held_label: str


class PosCartCustomerRequest(BaseModel):
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_gstin: str | None = None
    contact_id: int | None = None


class PosCheckoutRequest(BaseModel):
    payment_method: str = "cash"
    amount_tendered: float | None = None
    payment_reference: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_gstin: str | None = None
    contact_id: int | None = None


class PosCheckoutResponse(BaseModel):
    bill_id: int
    bill_number: str
    grand_total: float
    change_due: float
    payment_method: str
    invoice_id: int | None
    message: str


class PosBillListItem(BaseModel):
    id: int
    bill_number: str
    customer_name: str
    item_count: int
    grand_total: float
    status: str
    payment_method: str
    cashier_name: str
    completed_at: datetime | None


class PosBillListResponse(BaseModel):
    items: list[PosBillListItem]
    total: int


class PosBillItemResponse(BaseModel):
    id: int
    product_id: int | None
    product_name_snapshot: str
    quantity: float
    unit_price: float
    discount_amount: float
    gst_rate: float
    line_total: float


class PosBillPaymentResponse(BaseModel):
    id: int
    amount: float
    method: str
    reference: str | None
    status: str


class PosBillResponse(BaseModel):
    id: int
    bill_number: str
    status: str
    subtotal: float
    discount_total: float
    tax_total: float
    grand_total: float
    customer_name: str | None
    customer_phone: str | None
    customer_gstin: str | None
    contact_id: int | None
    invoice_id: int | None
    session_id: int
    register_name: str
    cashier_name: str
    completed_at: datetime | None
    items: list[PosBillItemResponse]
    payments: list[PosBillPaymentResponse]


class PosBillVoidRequest(BaseModel):
    reason: str


class PosReturnRequest(BaseModel):
    reason: str
    refund_method: str = "cash"
    items: list[dict[str, Any]]


class PosReturnListItem(BaseModel):
    id: int
    return_number: str
    bill_number: str
    status: str
    reason: str
    refund_amount: float | None
    processed_at: datetime | None


class PosReturnListResponse(BaseModel):
    items: list[PosReturnListItem]
    total: int


class PosCatalogItemResponse(BaseModel):
    id: int
    name: str
    service_code: str | None
    category: str | None
    sell_at_pos: bool
    pos_category: str | None
    pos_sort_order: int
    price: float | None
    in_stock: bool


class PosCatalogUpdateRequest(BaseModel):
    sell_at_pos: bool | None = None
    pos_category: str | None = None
    pos_sort_order: int | None = None


class PosReceiptResponse(BaseModel):
    bill_number: str
    html: str
