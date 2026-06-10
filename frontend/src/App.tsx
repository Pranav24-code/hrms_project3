import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layouts/MainLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import EmployeeListPage from "@/pages/employees/EmployeeListPage";
import EmployeeDetailsPage from "@/pages/employees/EmployeeDetailsPage";
import AddEmployeePage from "@/pages/employees/AddEmployeePage";
import DepartmentListPage from "@/pages/departments/DepartmentListPage";
import DepartmentDetailsPage from "@/pages/departments/DepartmentDetailsPage";
import LeaveRequestPage from "@/pages/leave/LeaveRequestPage";
import LeaveHistoryPage from "@/pages/leave/LeaveHistoryPage";
import LeaveApprovalPage from "@/pages/leave/LeaveApprovalPage";
import PayrollDashboardPage from "@/pages/payroll/PayrollDashboardPage";
import PayslipViewerPage from "@/pages/payroll/PayslipViewerPage";
import AttendancePage from "@/pages/attendance/AttendancePage";
import ReportsPage from "@/pages/reports/ReportsPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFound from "@/pages/NotFoundPage";
import {useSelector} from "react-redux";  

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
 const user = useSelector((state: any) => state.auth.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const user = useSelector((state: any) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>

      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="employees" element={<RoleRoute allowedRoles={['Manager']}><EmployeeListPage /></RoleRoute>} />
              <Route path="employees/add" element={<RoleRoute allowedRoles={['Manager']}><AddEmployeePage /></RoleRoute>} />
              <Route path="employees/:id" element={<RoleRoute allowedRoles={['Manager']}><EmployeeDetailsPage /></RoleRoute>} />
              <Route path="departments" element={<RoleRoute allowedRoles={['Manager']}><DepartmentListPage /></RoleRoute>} />
              <Route path="departments/:id" element={<RoleRoute allowedRoles={['Manager']}><DepartmentDetailsPage /></RoleRoute>} />
              <Route path="leave/request" element={<RoleRoute allowedRoles={['employee']}><LeaveRequestPage /></RoleRoute>} />
              <Route path="leave/history" element={<RoleRoute allowedRoles={['employee']}><LeaveHistoryPage /></RoleRoute>} />
              <Route path="leave/approvals" element={<RoleRoute allowedRoles={['Manager']}><LeaveApprovalPage /></RoleRoute>} />
              <Route path="payroll" element={<RoleRoute allowedRoles={['Manager']}><PayrollDashboardPage /></RoleRoute>} />
              <Route path="payroll/payslip/:id" element={<RoleRoute allowedRoles={['employee', 'Manager']}><PayslipViewerPage /></RoleRoute>} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="reports" element={<RoleRoute allowedRoles={['Manager']}><ReportsPage /></RoleRoute>} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="app" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>

  </QueryClientProvider>
);

export default App;
