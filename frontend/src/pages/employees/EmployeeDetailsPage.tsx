import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Edit,
  Clock, FileText, Upload, Download, Building, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";

const statusConfig = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  on_leave: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const attStatusConfig = {
  present: 'bg-green-500/10 text-green-600 border-green-500/20',
  absent: 'bg-red-500/10 text-red-600 border-red-500/20',
  late: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  half_day: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  on_leave: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp] = useState<any | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([
    { name: 'Employment_Contract.pdf', size: '1.2 MB', category: 'Contract', uploadedAt: '2025-01-15' },
    { name: 'W-4_Tax_Form.pdf', size: '340 KB', category: 'Tax', uploadedAt: '2025-01-16' },
    { name: 'I-9_Verification.pdf', size: '450 KB', category: 'Identification', uploadedAt: '2025-01-16' }
  ]);

  useEffect(() => {
    loadEmployeeDetails();
  }, [id]);

  const loadEmployeeDetails = async () => {
    try {
      setLoading(true);
      // Fetch employees list to find the matching one
      const empRes = await api.get("/employee/get-emp");
      const foundEmp = empRes.data.employees?.find((e: any) => e._id === id || e.id === id);
      
      if (!foundEmp) {
        toast.error("Employee not found");
        navigate('/employees');
        return;
      }
      setEmp(foundEmp);

      // Fetch attendance
      const attRes = await api.get(`/attendance/${foundEmp.user?._id || foundEmp._id}`).catch(() => ({ data: { attendance: [] } }));
      setAttendance(attRes.data.attendance || []);

      // Fetch leaves
      const leaveRes = await api.get("/leave/all").catch(() => ({ data: { leaves: [] } }));
      const empLeaves = (leaveRes.data.leaves || []).filter((l: any) => 
        l.employee?._id === foundEmp.user?._id || 
        l.employee?._id === foundEmp._id || 
        l.employeeId === foundEmp.employeeId
      );
      setLeaves(empLeaves);

      // Load mock payroll locally
      const mockPay = [
        { id: '1', month: 'May', year: 2026, basicSalary: foundEmp.basicSalary || 6000, bonus: foundEmp.bonus || 200, deductions: 150, netSalary: (foundEmp.basicSalary || 6000) + (foundEmp.bonus || 200) - 150, status: 'paid' },
        { id: '2', month: 'April', year: 2026, basicSalary: foundEmp.basicSalary || 6000, bonus: foundEmp.bonus || 0, deductions: 120, netSalary: (foundEmp.basicSalary || 6000) - 120, status: 'paid' }
      ];
      setPayroll(mockPay);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      setDocuments(prev => [
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category: 'Uploaded Document',
          uploadedAt: new Date().toISOString().split('T')[0]
        },
        ...prev
      ]);
      setUploading(false);
      toast.success(`${file.name} uploaded successfully!`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="w-40 h-8 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!emp) return null;

  const isActive = emp.user?.isActive !== undefined ? emp.user.isActive : emp.status === 'active';
  const statusStr = isActive ? 'active' : 'inactive';

  return (
    <div className="space-y-5">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs font-semibold hover:bg-muted" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-3.5 h-3.5" />Employees
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-semibold text-foreground">{emp.firstName} {emp.lastName}</span>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
          <div className="absolute top-4 right-4 flex gap-1.5">
            <Badge variant="outline" className={cn("capitalize px-2.5 py-0.5 text-[10px] font-bold border", statusConfig[statusStr])}>
              {statusStr}
            </Badge>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-5 gap-4">
            <Avatar className="h-22 w-22 border-4 border-card shadow-md">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold border-border" onClick={() => {
                toast.info("Edit employee is coming soon");
              }}>
                <Edit className="w-3.5 h-3.5" />Edit Profile
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{emp.firstName} {emp.lastName}</h2>
              <p className="text-muted-foreground text-sm font-medium mt-0.5">{emp.designation} · {emp.department}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-wider">{emp.employeeId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            {[
              { icon: Mail, label: 'Email Address', value: emp.email },
              { icon: Phone, label: 'Phone Number', value: emp.phone || 'N/A' },
              { icon: Building, label: 'Department', value: emp.department },
              { icon: Calendar, label: 'Joining Date', value: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border/50 p-1 w-full sm:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="profile" className="text-xs font-semibold">Profile</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs font-semibold">Attendance ({attendance.length})</TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs font-semibold">Leave History ({leaves.length})</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs font-semibold">Payroll ({payroll.length})</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-semibold">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Details */}
        <TabsContent value="profile">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Full Name', value: `${emp.firstName} ${emp.lastName}` },
                  { label: 'Gender', value: emp.gender || '—' },
                  { label: 'Date of Birth', value: emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { label: 'Home Address', value: emp.address || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-border/40 pb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-4">Employment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Employee ID', value: emp.employeeId, mono: true },
                  { label: 'Department', value: emp.department },
                  { label: 'Designation', value: emp.designation },
                  { label: 'System Role', value: emp.user?.role || 'Employee' },
                  { label: 'Basic Monthly Salary', value: `$${(emp.basicSalary || 0).toLocaleString()}`, mono: true },
                  { label: 'Regular Allowance', value: `$${(emp.allowance || 0).toLocaleString()}`, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="border-b border-border/40 pb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                    <p className={cn("text-xs font-semibold text-foreground mt-1", mono && "font-mono")}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Attendance Logs */}
        <TabsContent value="attendance">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No attendance history logs found.
                      </td>
                    </tr>
                  ) : (
                    attendance.map(a => (
                      <tr key={a._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-foreground font-mono">{a.date}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-foreground font-mono">
                          {a.workingHours > 0 ? `${a.workingHours} hrs` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5", attStatusConfig[a.status as keyof typeof attStatusConfig])}>
                            {a.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Leave History */}
        <TabsContent value="leaves">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Type', 'Dates', 'Days', 'Reason', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    leaves.map(l => (
                      <tr key={l._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 capitalize text-xs font-bold text-foreground">{l.leaveType}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {l.startDate} → {l.endDate}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold font-mono">{l.totalDays}d</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[200px]">{l.reason}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5 capitalize",
                            l.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                            l.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          )}>{l.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Payroll details */}
        <TabsContent value="payroll">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Disbursement Month', 'Base Salary', 'Allowances/Bonus', 'Deductions', 'Total Net', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payroll.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No payroll receipts issued.
                      </td>
                    </tr>
                  ) : (
                    payroll.map(p => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-foreground">{p.month} {p.year}</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">${p.basicSalary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-mono text-green-600">+${p.bonus.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-mono text-red-500">-${p.deductions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-bold text-foreground font-mono">${p.netSalary.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5",
                            p.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                            p.status === 'processed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          )}>{p.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Documents Folder */}
        <TabsContent value="documents">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Uploaded Documents</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Manage HR file contracts, ID verification, and tax records</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  onChange={handleDocUpload}
                  disabled={uploading}
                />
                <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold border-border cursor-pointer">
                  <label htmlFor="doc-upload">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? "Uploading..." : "Upload File"}
                  </label>
                </Button>
              </div>
            </div>

            <div className="border border-border/80 rounded-lg divide-y divide-border">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.category} · {doc.size} · Uploaded {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => {
                    toast.success(`Downloaded ${doc.name}`);
                  }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
