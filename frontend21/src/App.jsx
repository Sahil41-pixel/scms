import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import UserDashboard from "./pages/User/UserDashboard";
import MyComplaints from "./pages/User/MyComplaints";
import ComplaintTimeline from "./pages/User/ComplaintTimeline";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllComplaints from "./pages/Admin/AllComplaints";
import AdminTimeline from "./pages/Admin/AdminTimeline";
import ManageUsers from "./pages/Admin/ManageUsers";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import ResolvedComplaints from "./pages/Employee/ResolvedComplaints";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: "0.88rem",
            zIndex: 999999,
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#1e293b" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
        }}
        containerStyle={{
          top: 72,
          zIndex: 999999,
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/unauthorized"
          element={
            <div
              style={{
                textAlign: "center",
                paddingTop: "calc(var(--navbar-height) + 4rem)",
                color: "var(--text-muted)",
              }}
            >
              <i
                className="fa-solid fa-ban fa-3x"
                style={{
                  color: "#ef4444",
                  marginBottom: "1rem",
                  display: "block",
                }}
              ></i>
              <h3>Access Denied</h3>
            </div>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaint/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ComplaintTimeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AllComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timeline/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTimeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/resolved"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <ResolvedComplaints />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
