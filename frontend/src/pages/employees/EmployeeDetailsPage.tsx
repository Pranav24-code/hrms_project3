import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Edit } from 'lucide-react';
import { mockEmployees, mockLeaveRequests, mockAttendance, mockPayroll } from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  on_leave: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = mockEmployees.find(e => e.id === id) || mockEmployees[0];
  const empLeaves = mockLeaveRequests.filter(l => l.employeeId === emp.id);
  const empAttendance = mockAttendance.filter(a => a.employeeId === emp.id);
  const empPayroll = mockPayroll.filter(p => p.employeeId === emp.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-3.5 h-3.5" />Employees
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{emp.firstName} {emp.lastName}</span>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                {emp.firstName[0]}{emp.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs mb-1">
              <Edit className="w-3.5 h-3.5" />Edit Profile
            </Button>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{emp.firstName} {emp.lastName}</h2>
              <p className="text-muted-foreground text-sm">{emp.designation}</p>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{emp.employeeId}</p>
            </div>
            <Badge variant="outline" className={cn("capitalize", statusConfig[emp.status])}>
              {emp.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
            {[
              { icon: Mail, label: 'Email', value: emp.email },
              { icon: Phone, label: 'Phone', value: emp.phone },
              { icon: Building2, label: 'Department', value: emp.department },
              { icon: Calendar, label: 'Joined', value: new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-medium text-foreground mt-0.5 break-all">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="personal" className="text-xs">Personal Info</TabsTrigger>
          <TabsTrigger value="employment" className="text-xs">Employment</TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs">Leaves ({empLeaves.length})</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Full Name', value: `${emp.firstName} ${emp.lastName}` },
                { label: 'Gender', value: emp.gender ? emp.gender.charAt(0).toUpperCase() + emp.gender.slice(1) : '—' },
                { label: 'Date of Birth', value: emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                { label: 'Address', value: emp.address || '—' },
                { label: 'Email', value: emp.email },
                { label: 'Phone', value: emp.phone },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-border/50 pb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Employee ID', value: emp.employeeId, mono: true },
                { label: 'Department', value: emp.department },
                { label: 'Designation', value: emp.designation },
                { label: 'Role', value: emp.role === 'Manager' ? 'HR Manager' : 'Employee' },
                { label: 'Joining Date', value: new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Annual Salary', value: `$${emp.salary.toLocaleString()}`, mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} className="border-b border-border/50 pb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className={cn("text-sm text-foreground", mono && "font-mono")}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaves" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/40">
                {['Type', 'Duration', 'Days', 'Status', 'Applied'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {empLeaves.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No leave history.</td></tr>
                : empLeaves.map(l => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 capitalize text-sm">{l.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{l.startDate} → {l.endDate}</td>
                    <td className="px-4 py-3 text-sm">{l.days}d</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px] capitalize",
                        l.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        l.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/40">
                {['Period', 'Basic', 'Bonus', 'Deductions', 'Net Salary', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {empPayroll.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No payroll records.</td></tr>
                : empPayroll.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{p.month} {p.year}</td>
                    <td className="px-4 py-3 text-sm font-mono">${p.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-mono text-green-600">+${p.bonus.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-mono text-red-500">-${p.deductions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold font-mono">${p.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px] capitalize",
                        p.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        p.status === 'processed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Small helper
function Building2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  );
}
