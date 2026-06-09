export const mockEmployees: any[] = [
  { id: '1', employeeId: 'EMP-001', firstName: 'John', lastName: 'Doe', department: 'Engineering', departmentId: '1', designation: 'Sr. Developer', status: 'active', email: 'j.doe@company.com', phone: '+1 (555) 000-1111', joiningDate: '2023-01-15', salary: 120000 },
  { id: '2', employeeId: 'EMP-002', firstName: 'Jane', lastName: 'Smith', department: 'HR', departmentId: '2', designation: 'HR Manager', status: 'active', email: 'j.smith@company.com', phone: '+1 (555) 000-2222', joiningDate: '2022-06-20', salary: 95000 }
];


export const mockDepartments: any[] = [
  { id: '1', code: 'ENG', name: 'Engineering', managerName: 'Alice Johnson', employeeCount: 42, budget: 1200000, description: 'Product development and technical operations' },
  { id: '2', code: 'HRD', name: 'HR', managerName: 'Bob Wilson', employeeCount: 5, budget: 350000, description: 'Talent acquisition and employee relations' }
];

export const mockLeaveRequests: any[] = [
  { id: '1', employeeId: '1', employeeName: 'John Doe', leaveType: 'sick', days: 2, status: 'pending', startDate: '2025-06-10', endDate: '2025-06-11', reason: 'Flu symptoms', createdAt: new Date().toISOString() },
  { id: '2', employeeId: '2', employeeName: 'Jane Smith', leaveType: 'vacation', days: 5, status: 'approved', startDate: '2025-07-01', endDate: '2025-07-05', reason: 'Family trip', createdAt: new Date().toISOString() }
];
export const mockPayroll: any[] = [
  { id: '1', employeeId: '1', employeeName: 'John Doe', designation: 'Sr. Developer', month: 'June', year: '2025', basicSalary: 8000, hra: 2000, bonus: 500, deductions: 200, tax: 1500, netSalary: 8800, status: 'paid' },
  { id: '2', employeeId: '2', employeeName: 'Jane Smith', designation: 'HR Manager', month: 'June', year: '2025', basicSalary: 6500, hra: 1500, bonus: 0, deductions: 100, tax: 900, netSalary: 7000, status: 'pending' }
];
export const mockAttendance: any[] = [
  { id: '1', employeeId: '1', employeeName: 'John Doe', department: 'Engineering', date: '2025-06-09', status: 'present', checkIn: '09:00 AM', checkOut: '06:05 PM', workingHours: 9.1 },
  { id: '2', employeeId: '2', employeeName: 'Jane Smith', department: 'HR', date: '2025-06-09', status: 'late', checkIn: '10:15 AM', checkOut: '05:45 PM', workingHours: 7.5 }
];

export const mockNotifications: any[] = [
  { id: '1', title: 'New Leave Request', message: 'John Doe requested sick leave for 2 days', type: 'leave', createdAt: new Date().toISOString(), read: false },
  { id: '2', title: 'Payslip Available', message: 'Your payslip for May 2025 is now available', type: 'payroll', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true }
];


export const mockActivities = [
  { id: '1', title: 'New Employee Added', description: 'John Doe was added by HR', type: 'employee_added', timestamp: new Date().toISOString() },
  { id: '2', title: 'Leave Approved', description: 'Jane Smith approved a leave request', type: 'leave_approved', timestamp: new Date().toISOString() }
];

export const employeeGrowthData = [
  { month: 'Jan', employees: 45 },
  { month: 'Feb', employees: 52 },
  { month: 'Mar', employees: 48 },
  { month: 'Apr', employees: 61 },
  { month: 'May', employees: 55 },
  { month: 'Jun', employees: 67 },
];

export const leaveAnalyticsData = [
  { month: 'Jan', approved: 12, rejected: 2, pending: 3 },
  { month: 'Feb', approved: 15, rejected: 1, pending: 1 },
  { month: 'Mar', approved: 8, rejected: 3, pending: 0 },
  { month: 'Apr', approved: 22, rejected: 4, pending: 6 },
  { month: 'May', approved: 16, rejected: 0, pending: 2 },
  { month: 'Jun', approved: 10, rejected: 1, pending: 4 },
];

export const payrollTrendData = [
  { month: 'Jan', amount: 380000 },
  { month: 'Feb', amount: 410000 },
  { month: 'Mar', amount: 395000 },
  { month: 'Apr', amount: 435000 },
  { month: 'May', amount: 420000 },
  { month: 'Jun', amount: 455000 },
];

export const departmentDistributionData = [
  { name: 'Engineering', value: 35, fill: 'var(--chart-1)' },
  { name: 'HR', value: 12, fill: 'var(--chart-2)' },
  { name: 'Sales', value: 25, fill: 'var(--chart-3)' },
  { name: 'Marketing', value: 18, fill: 'var(--chart-4)' },
  { name: 'Design', value: 10, fill: 'var(--chart-5)' },
];

