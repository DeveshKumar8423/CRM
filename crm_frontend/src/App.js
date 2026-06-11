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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
