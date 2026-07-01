import { useState } from 'react';
import { Download, BarChart3, Users, DollarSign, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockEmployees, mockLeaveRequests, mockPayroll, mockAttendance } from '@/constants/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

const fallbackEmployeeRows = [
  { id: 'e1', firstName: 'Aman', lastName: 'Sharma', department: 'Engineering', status: 'active' },
  { id: 'e2', firstName: 'Maria', lastName: 'Khan', department: 'Design', status: 'active' },
  { id: 'e3', firstName: 'John', lastName: 'Carter', department: 'Sales', status: 'inactive' },
];

const fallbackPayrollRows = [
  { id: 'p1', employeeName: 'Aman Sharma', month: 'June', netSalary: 4200, status: 'paid' },
  { id: 'p2', employeeName: 'Maria Khan', month: 'June', netSalary: 3900, status: 'processed' },
  { id: 'p3', employeeName: 'John Carter', month: 'June', netSalary: 3600, status: 'pending' },
];

const fallbackLeaveRows = [
  { id: 'l1', employeeName: 'Aman Sharma', leaveType: 'annual', days: 3, status: 'approved' },
  { id: 'l2', employeeName: 'Maria Khan', leaveType: 'sick', days: 1, status: 'pending' },
  { id: 'l3', employeeName: 'John Carter', leaveType: 'casual', days: 2, status: 'rejected' },
];

const fallbackAttendanceRows = [
  { id: 'a1', employeeName: 'Aman Sharma', date: '2026-07-01', status: 'present', checkIn: '09:08 AM' },
  { id: 'a2', employeeName: 'Maria Khan', date: '2026-07-01', status: 'late', checkIn: '09:56 AM' },
  { id: 'a3', employeeName: 'John Carter', date: '2026-07-01', status: 'absent', checkIn: '-' },
];

const employeeRows = mockEmployees.length > 0 ? mockEmployees : fallbackEmployeeRows;
const payrollRows = mockPayroll.length > 0 ? mockPayroll : fallbackPayrollRows;
const leaveRows = mockLeaveRequests.length > 0 ? mockLeaveRequests : fallbackLeaveRows;
const attendanceRows = mockAttendance.length > 0 ? mockAttendance : fallbackAttendanceRows;

const reportTypes = [
  { id: 'employee', label: 'Employee Report', icon: Users, color: 'blue', desc: 'Full roster with department and status breakdown' },
  { id: 'payroll', label: 'Payroll Report', icon: DollarSign, color: 'green', desc: 'Monthly salary disbursements and summaries' },
  { id: 'attendance', label: 'Attendance Report', icon: Clock, color: 'amber', desc: 'Daily attendance, late arrivals, and absences' },
  { id: 'leave', label: 'Leave Report', icon: CalendarDays, color: 'violet', desc: 'Leave requests, approvals and balance usage' },
];

export default function ReportsPage() {
  const [dept, setDept] = useState('all');
  const [period, setPeriod] = useState('june-2025');
  const [active, setActive] = useState('employee');
  const [loading, setLoading] = useState(false);

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success(`${fileName} exported to Excel!`);
  };

  const downloadPdf = async (name: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.info(`Requesting ${name} PDF from server...`);
  };

  const summary = {
    employee: { total: employeeRows.length, active: employeeRows.filter(e => e.status === 'active').length, inactive: employeeRows.filter(e => e.status === 'inactive').length },
    payroll: { total: payrollRows.reduce((s, p) => s + p.netSalary, 0), paid: payrollRows.filter(p => p.status === 'paid').length, pending: payrollRows.filter(p => p.status === 'pending').length },
    leave: { total: leaveRows.length, approved: leaveRows.filter(l => l.status === 'approved').length, pending: leaveRows.filter(l => l.status === 'pending').length },
    attendance: { present: attendanceRows.filter(a => a.status === 'present').length, absent: attendanceRows.filter(a => a.status === 'absent').length, late: attendanceRows.filter(a => a.status === 'late').length },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and export HR analytics reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('PDF exported (demo)')}><Download className="w-3.5 h-3.5" />Export PDF</Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('Excel exported (demo)')}><BarChart3 className="w-3.5 h-3.5" />Export Excel</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Department</Label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {['Engineering','Product','Design','Finance','Sales','Marketing','Human Resources'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="june-2025">June 2025</SelectItem>
              <SelectItem value="may-2025">May 2025</SelectItem>
              <SelectItem value="q2-2025">Q2 2025</SelectItem>
              <SelectItem value="2025">Full Year 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportTypes.map(r => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setActive(r.id)}
              className={cn("bg-card border rounded-xl p-4 text-left hover:shadow-sm transition-all",
                active === r.id ? "border-primary ring-1 ring-primary" : "border-border")}>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3",
                r.color === 'blue' ? 'bg-blue-500/10' : r.color === 'green' ? 'bg-green-500/10' :
                r.color === 'amber' ? 'bg-amber-500/10' : 'bg-violet-500/10')}>
                <Icon className={cn("w-4 h-4", r.color === 'blue' ? 'text-blue-500' : r.color === 'green' ? 'text-green-500' : r.color === 'amber' ? 'text-amber-500' : 'text-violet-500')} />
              </div>
              <p className="text-xs font-semibold">{r.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{r.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Preview */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">
            {reportTypes.find(r => r.id === active)?.label} — {period.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => downloadPdf(active)} disabled={loading}>
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-green-600 hover:text-green-700" 
              onClick={() => {
                const data = active === 'employee' ? employeeRows : active === 'payroll' ? payrollRows : active === 'leave' ? leaveRows : attendanceRows;
                exportToExcel(data, `${active}_report_${period}`);
              }}>
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </div>

        {active === 'employee' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Employees', value: summary.employee.total },
                { label: 'Active', value: summary.employee.active },
                { label: 'Inactive', value: summary.employee.inactive },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border"><tr><th className="p-3">Name</th><th className="p-3">Department</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {employeeRows.slice(0, 3).map(e => (
                    <tr key={e.id}><td className="p-3">{e.firstName} {e.lastName}</td><td className="p-3">{e.department}</td><td className="p-3 capitalize">{e.status}</td></tr>
                  ))}
                  <tr><td colSpan={3} className="p-3 text-center text-xs text-muted-foreground">Showing 3 of {employeeRows.length} records. Export to see all.</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'payroll' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Disbursed', value: `$${summary.payroll.total.toLocaleString()}` },
                { label: 'Processed', value: summary.payroll.paid },
                { label: 'Pending', value: summary.payroll.pending },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border"><tr><th className="p-3">Employee</th><th className="p-3">Month</th><th className="p-3">Net Salary</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {payrollRows.slice(0, 3).map(p => (
                    <tr key={p.id}><td className="p-3">{p.employeeName}</td><td className="p-3">{p.month}</td><td className="p-3">${p.netSalary}</td><td className="p-3 capitalize">{p.status}</td></tr>
                  ))}
                  <tr><td colSpan={4} className="p-3 text-center text-xs text-muted-foreground">Showing 3 of {payrollRows.length} records. Export to see all.</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'leave' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Requests', value: summary.leave.total },
                { label: 'Approved', value: summary.leave.approved },
                { label: 'Pending', value: summary.leave.pending },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border"><tr><th className="p-3">Employee</th><th className="p-3">Leave Type</th><th className="p-3">Days</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {leaveRows.slice(0, 3).map(l => (
                    <tr key={l.id}><td className="p-3">{l.employeeName}</td><td className="p-3 capitalize">{l.leaveType}</td><td className="p-3">{l.days}</td><td className="p-3 capitalize">{l.status}</td></tr>
                  ))}
                  <tr><td colSpan={4} className="p-3 text-center text-xs text-muted-foreground">Showing 3 of {leaveRows.length} records. Export to see all.</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'attendance' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Present', value: summary.attendance.present },
                { label: 'Absent', value: summary.attendance.absent },
                { label: 'Late', value: summary.attendance.late },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border"><tr><th className="p-3">Employee</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Check In</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {attendanceRows.slice(0, 3).map(a => (
                    <tr key={a.id}><td className="p-3">{a.employeeName}</td><td className="p-3">{a.date}</td><td className="p-3 capitalize">{a.status}</td><td className="p-3">{a.checkIn || '-'}</td></tr>
                  ))}
                  <tr><td colSpan={4} className="p-3 text-center text-xs text-muted-foreground">Showing 3 of {attendanceRows.length} records. Export to see all.</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => toast.success('PDF exported (demo)')}><Download className="w-3 h-3" />PDF</Button>
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => toast.success('Excel exported (demo)')}><BarChart3 className="w-3 h-3" />Excel</Button>
        </div>
      </div>
    </div>
  );
}
