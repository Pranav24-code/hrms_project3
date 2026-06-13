# Human Resource Management System (HRMS) & Payroll Dashboard
## Product & Technical Requirements Specification

This document details the functional, non-functional, and technical requirements of the HRMS & Payroll Dashboard application.

---

## 👥 1. User Roles & Access Control

The system supports two core user roles with distinct permissions:

### 1.1 HR Manager (Administrator)
- **Dashboard Access**: Global overview of organization metrics (total workforce, total payroll costs, pending approvals).
- **Employee Management**: Create new employee accounts, view complete directory, edit profiles, toggle account status (Active/Inactive).
- **Department Management**: Create and configure organizational departments, set department managers, and track budget allocations.
- **Leave Approvals**: View all incoming leave requests from employees; approve or reject requests with status updates.
- **Payroll Processing**: Process monthly salary details, configure allowances/deductions, and release payslips.
- **Reports & Analytics**: Generate and export reports (workforce demographics, payroll trends, leave analytics).

### 1.2 Employee
- **Personal Dashboard**: View individual metrics (attendance summary, remaining leaves, current designation/department info).
- **Attendance Tracking**: Self-service check-in (clock-in) and check-out (clock-out) with timestamp logs.
- **Leave Application**: Submit new leave requests specifying dates and reasons, and view historical leave requests with real-time status tracking.
- **Payslip Access**: View and print/download monthly payslips containing salary breakdowns.
- **Settings & Notifications**: Adjust personal details, view recent notifications, and customize display settings (Theme).

---

## 🛠️ 2. Functional Requirements

### 2.1 Authentication & User Management
- **Registration**: Allows creating user accounts. The system must auto-generate sequential IDs prefixed with `MGR` for Managers and `EMP` for Employees (e.g. `EMP001`, `EMP002`).
- **Secure Sign-In**: Login using verified email and password. Passwords must be hashed using `bcrypt` (10 salt rounds) on the backend.
- **Session Management**: Secure authentication via JSON Web Tokens (JWT). JWT tokens are stored as `HttpOnly` cookies to protect against XSS attacks.
- **Account Status Validation**: Deactivated accounts must be blocked from logging in.

### 2.2 Dashboard & Analytics
- **HR Overview Widgets**: Display critical KPIs:
  - Total Employees (count)
  - Active Departments (count)
  - Pending Leaves (count)
  - Monthly Payroll Budget
- **Data Visualizations (Charts)**:
  - Department Employee Distribution (Pie/Donut chart)
  - Workforce Growth Trend (Line/Area chart)
  - Leave Request Analytics (Bar chart showing Approved vs. Pending)
  - Payroll Cost Trends over time (Bar/Line chart)

### 2.3 Employee Management
- **Profile Fields**: Maintain details including:
  - Full Name, Email, Phone, Role (Manager/Employee)
  - Date of Joining, Designation, Department
  - Salary Information (Basic Salary, HRA, Allowances)
- **Directory Page**: Paginated list of all employees with search and filter capabilities (by department, role, or status).

### 2.4 Department Management
- **Structure**: Create, edit, and list departments with fields:
  - Department Name & Code (e.g. ENG, HRD)
  - Department Manager (associated from user list)
  - Total Employee Count
  - Annual/Monthly Budget allocation

### 2.5 Attendance Tracking
- **Check-in/Check-out**: Single-click actions to log check-in/out times.
- **Hours Calculation**: Automatic calculation of total working hours per shift.
- **Status Log**: Daily attendance tracking classified as:
  - `Present`: On-time check-in
  - `Late`: Check-in after threshold time
  - `Absent`: No check-in logged for the day

### 2.6 Leave Management
- **Leave Types**: Sick Leave, Vacation, Casual Leave, Maternity/Paternity Leave.
- **Request Form**: Date pickers for start/end dates, total days calculation, and text reason input.
- **Workflow**: Submissions enter a `Pending` state, visible on the Manager's approval portal. Managers can update the status to `Approved` or `Rejected`.

### 2.7 Payroll Processing
- **Salary Computation**: Maintain detailed formulas:
  - Gross Salary = Basic Salary + HRA + Allowances/Bonus
  - Net Salary = Gross Salary - (Tax Deductions + Other Deductions)
- **Payslip Management**: Release monthly payslips with status `Paid` or `Pending`. Generate formatted print layouts for payslips.

---

## 🔒 3. Non-Functional Requirements

### 3.1 Security
- **Role Guards**: Frontend route protection using custom component wrappers (`ProtectedRoute` & `RoleRoute`). Unauthorized attempts must redirect back to safe pages.
- **API Security**: Middleware-driven JWT verification for all API routes under `/api`.
- **Database Safety**: Schema validation using Mongoose to ensure integrity and prevent invalid data entry.

### 3.2 Performance
- **Modern Bundling**: The frontend uses Vite for rapid compilation, tree-shaking, and efficient production bundles.
- **Data Fetching**: Utilization of `react-query` (TanStack Query) for smart caching, background fetching, and synchronization of server states.
- **Client-Side State**: Zustand for fast, lightweight client-side user session and preference storage.

### 3.3 Usability & Design
- **Theme**: Complete light and dark mode implementation.
- **Responsive Layout**: Designed with a mobile-first approach using Tailwind CSS, supporting desktop monitors, tablets, and smartphones seamlessly.
- **UI Toolkit**: Interactive dashboards, tables, and buttons built with Radix primitives via `shadcn/ui`.
- **Micro-Animations**: Framer Motion transitions for sidebar toggle, modal popup, page transitions, and toast alerts.
