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
import FollowUps from "./pages/FollowUps";
import Payments from "./pages/Payments";
import ProtectedRoute from "./components/ProtectedRoute";

// New password‑reset pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
