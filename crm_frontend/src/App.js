import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import ManagerLogin from "./pages/ManagerLogin";
import EmployeeLogin from "./pages/EmployeeLogin";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminCompany from "./pages/AdminCompany";
import NumberingConfig from "./pages/NumberingConfig";
import Contacts from "./pages/Contacts";
import ContactForm from "./pages/ContactForm";
import ContactDetail from "./pages/ContactDetail";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import Leads from "./pages/Leads";
import LeadForm from "./pages/LeadForm";
import LeadDetail from "./pages/LeadDetail";
import Pipeline from "./pages/Pipeline";
import Deals from "./pages/Deals";
import DealForm from "./pages/DealForm";
import DealDetail from "./pages/DealDetail";
import Quotations from "./pages/Quotations";
import QuotationForm from "./pages/QuotationForm";
import QuotationDetail from "./pages/QuotationDetail";
import QuotationPreview from "./pages/QuotationPreview";
import QuotationApprovalQueue from "./pages/QuotationApprovalQueue";
import ClientQuoteView from "./pages/ClientQuoteView";
import SalesOrders from "./pages/SalesOrders";
import SalesOrderForm from "./pages/SalesOrderForm";
import SalesOrderDetail from "./pages/SalesOrderDetail";
import ClientOrderView from "./pages/ClientOrderView";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoicePreview from "./pages/InvoicePreview";
import InvoiceReviewQueue from "./pages/InvoiceReviewQueue";
import ClientInvoiceView from "./pages/ClientInvoiceView";
import ClientNotes from "./pages/ClientNotes";
import ClientNotesFollowUpQueue from "./pages/ClientNotesFollowUpQueue";
import SalesReports from "./pages/SalesReports";
import TaxReports from "./pages/TaxReports";
import PLReports from "./pages/PLReports";
import CustomerLedger from "./pages/CustomerLedger";
import CustomerLedgerStatement from "./pages/CustomerLedgerStatement";
import CustomerLedgerUnassigned from "./pages/CustomerLedgerUnassigned";
import VendorLedger from "./pages/VendorLedger";
import VendorLedgerStatement from "./pages/VendorLedgerStatement";
import VendorLedgerUnassigned from "./pages/VendorLedgerUnassigned";
import Expenses from "./pages/Expenses";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseDetail from "./pages/ExpenseDetail";
import ExpenseApprovalQueue from "./pages/ExpenseApprovalQueue";
import VendorBills from "./pages/VendorBills";
import VendorBillForm from "./pages/VendorBillForm";
import VendorBillDetail from "./pages/VendorBillDetail";
import VendorBillApprovalQueue from "./pages/VendorBillApprovalQueue";
import VendorBillPayablesSummary from "./pages/VendorBillPayablesSummary";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderForm from "./pages/PurchaseOrderForm";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseOrderApprovalQueue from "./pages/PurchaseOrderApprovalQueue";
import Inventory from "./pages/Inventory";
import InventoryProductDetail from "./pages/InventoryProductDetail";
import InventoryRecordMovement from "./pages/InventoryRecordMovement";
import InventoryOpeningStock from "./pages/InventoryOpeningStock";
import InventoryMovements from "./pages/InventoryMovements";
import InventoryLowStock from "./pages/InventoryLowStock";
import StockMovements from "./pages/StockMovements";
import { StockMovementRecordIn, StockMovementRecordOut } from "./pages/StockMovementForm";
import StockMovementDetail from "./pages/StockMovementDetail";
import StockMovementSummary from "./pages/StockMovementSummary";
import Warehouses from "./pages/Warehouses";
import WarehouseLocationDetail from "./pages/WarehouseLocationDetail";
import WarehouseStockByLocation from "./pages/WarehouseStockByLocation";
import WarehouseRecordMovement from "./pages/WarehouseRecordMovement";
import WarehouseTransfer from "./pages/WarehouseTransfer";
import WarehouseTransferHistory from "./pages/WarehouseTransferHistory";
import FollowUps from "./pages/FollowUps";
import Payments from "./pages/Payments";
import ProtectedRoute from "./components/ProtectedRoute";

// New password‑reset pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SystemConfiguration from "./pages/SystemConfiguration";
import EmailTemplates from "./pages/EmailTemplates";
import Documents from "./pages/Documents";


const ALL_ROLES = ["Admin", "Manager", "Employee", "User"];
const STAFF_ROLES = ["Admin", "Manager", "Employee"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/quote/:token" element={<ClientQuoteView />} />
        <Route path="/order/:token" element={<ClientOrderView />} />
        <Route path="/invoice/:token" element={<ClientInvoiceView />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="users.view"
            >
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="activity.view"
            >
              <AdminActivityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/company"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="company.view"
            >
              <AdminCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/numbering-config"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="numbering_config.view"
            >
              <NumberingConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-config"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <SystemConfiguration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/email-templates"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EmailTemplates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="contacts.view"
            >
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="contacts.create"
            >
              <ContactForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="contacts.edit"
            >
              <ContactForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="contacts.view"
            >
              <ContactDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="products.view"
            >
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="products.create"
            >
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              requiredPermission="products.edit"
            >
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="products.view"
            >
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="leads.view"
            >
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="leads.create"
            >
              <LeadForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="leads.edit"
            >
              <LeadForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="leads.view"
            >
              <LeadDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="deals.view"
            >
              <Pipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="deals.view"
            >
              <Deals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="deals.create"
            >
              <DealForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="deals.edit"
            >
              <DealForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="deals.view"
            >
              <DealDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.view"
            >
              <Quotations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/approval-queue"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.approve"
            >
              <QuotationApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.create"
            >
              <QuotationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.edit_draft"
            >
              <QuotationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/:id/preview"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.view"
            >
              <QuotationPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="quotations.view"
            >
              <QuotationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-orders"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="sales_orders.view"
            >
              <SalesOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-orders/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="sales_orders.create"
            >
              <SalesOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-orders/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="sales_orders.edit_draft"
            >
              <SalesOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-orders/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="sales_orders.view"
            >
              <SalesOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.view"
            >
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/review-queue"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.review"
            >
              <InvoiceReviewQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.create"
            >
              <InvoiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.edit_draft"
            >
              <InvoiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id/preview"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.view"
            >
              <InvoicePreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="invoices.view"
            >
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-notes"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="client_notes.view"
            >
              <ClientNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-notes/follow-ups"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="client_notes.manage_followups"
            >
              <ClientNotesFollowUpQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tax-reports"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["tax_reports.view", "reports.view_financial"]}
            >
              <TaxReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pl-reports"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["pl_reports.view", "reports.view_financial"]}
            >
              <PLReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-ledger/unassigned"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["customer_ledger.view", "invoices.view", "payments.view"]}
            >
              <CustomerLedgerUnassigned />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-ledger/:contactId"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["customer_ledger.view", "invoices.view", "payments.view"]}
            >
              <CustomerLedgerStatement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-ledger"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["customer_ledger.view", "invoices.view", "payments.view"]}
            >
              <CustomerLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ledger/unassigned"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["vendor_ledger.view", "vendor_bills.view"]}
            >
              <VendorLedgerUnassigned />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ledger/:contactId"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["vendor_ledger.view", "vendor_bills.view"]}
            >
              <VendorLedgerStatement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ledger"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermissions={["vendor_ledger.view", "vendor_bills.view"]}
            >
              <VendorLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-reports"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="reports.view"
            >
              <SalesReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="expenses.view"
            >
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/approval-queue"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="expenses.approve"
            >
              <ExpenseApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="expenses.create"
            >
              <ExpenseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="expenses.edit_own"
            >
              <ExpenseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="expenses.view"
            >
              <ExpenseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.view"
            >
              <VendorBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills/payables-summary"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.view"
            >
              <VendorBillPayablesSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills/approval-queue"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.approve"
            >
              <VendorBillApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.create"
            >
              <VendorBillForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.edit_own"
            >
              <VendorBillForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-bills/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="vendor_bills.view"
            >
              <VendorBillDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="purchase_orders.view"
            >
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/approval-queue"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="purchase_orders.approve"
            >
              <PurchaseOrderApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/new"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="purchase_orders.create"
            >
              <PurchaseOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="purchase_orders.edit_own"
            >
              <PurchaseOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/:id"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="purchase_orders.view"
            >
              <PurchaseOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.view">
              <Warehouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/stock"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.view_stock">
              <WarehouseStockByLocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/record-movement"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.record_receipt">
              <WarehouseRecordMovement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/transfer"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.transfer">
              <WarehouseTransfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/transfers"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.view">
              <WarehouseTransferHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/locations/:locationId"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="warehouses.view">
              <WarehouseLocationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="stock_movements.view">
              <StockMovements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements/summary"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="stock_movements.view">
              <StockMovementSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements/in"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="stock_movements.record_in">
              <StockMovementRecordIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements/out"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="stock_movements.record_out">
              <StockMovementRecordOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-movements/:id"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="stock_movements.view">
              <StockMovementDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.view">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/movements"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.view">
              <InventoryMovements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/low-stock"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.view">
              <InventoryLowStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/record-movement"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.record_purchase">
              <InventoryRecordMovement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/opening-stock"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.record_opening">
              <InventoryOpeningStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:productId"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} requiredPermission="inventory.view">
              <InventoryProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="reminders.view"
            >
              <FollowUps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute
              allowedRoles={STAFF_ROLES}
              requiredPermission="payments.view"
            >
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
