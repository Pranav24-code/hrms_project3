import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, CheckCheck, Eye, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/utils/api';

const statusConfig = {
  paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  processed: { label: 'Processed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function PayrollDashboardPage() {
  const navigate = useNavigate();

  // Dynamic States
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employee/get-emp");
      const list = res.data.employees || [];
      setEmployees(list);

      // Transform employees into stateful payroll entries
      const payList = list.map((emp: any) => {
        const basic = emp.basicSalary || 5000;
        const allowance = emp.allowance || 300;
        const bonus = emp.bonus || 0;
        
        // Calculate deductions and tax
        const tax = Math.round(basic * 0.12);
        const deductions = Math.round(basic * 0.05);
        const netSalary = basic + allowance + bonus - tax - deductions;

        return {
          id: emp._id || emp.id,
          employeeId: emp.employeeId,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          designation: emp.designation,
          department: emp.department,
          basicSalary: basic,
          hra: Math.round(basic * 0.4), // 40% of basic
          allowance,
          bonus,
          deductions,
          tax,
          netSalary,
          status: 'paid', // default status
        };
      });
      setPayrollList(payList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = () => {
    // Process all pending or unprocessed payroll
    setPayrollList(prev => prev.map(p => ({ ...p, status: 'paid' })));
    toast.success("Payroll processed and released for all employees!");
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Filter payroll list
  const filteredPayroll = payrollList.filter((p) => {
    const matchName = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (p.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchName && matchStatus;
  });

  // Sort payroll list
  const sortedPayroll = [...filteredPayroll].sort((a, b) => {
    let valA = '';
    let valB = '';

    if (sortField === 'name') {
      valA = a.employeeName.toLowerCase();
      valB = b.employeeName.toLowerCase();
    } else if (sortField === 'netSalary') {
      return sortOrder === 'asc' ? a.netSalary - b.netSalary : b.netSalary - a.netSalary;
    } else if (sortField === 'basicSalary') {
      return sortOrder === 'asc' ? a.basicSalary - b.basicSalary : b.basicSalary - a.basicSalary;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginated payroll list
  const totalPages = Math.ceil(sortedPayroll.length / perPage);
  const paginatedPayroll = sortedPayroll.slice((page - 1) * perPage, page * perPage);

  // Statistics
  const totalDisbursed = payrollList.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netSalary, 0);
  const pendingCount = payrollList.filter(p => p.status === 'pending').length;
  const processedCount = payrollList.filter(p => p.status === 'paid' || p.status === 'processed').length;

  const handleExportCSV = () => {
    if (sortedPayroll.length === 0) {
      toast.error("No payroll data to export");
      return;
    }
    const headers = ['Employee Name', 'Employee ID', 'Designation', 'Basic Salary', 'Bonus/Allowances', 'Deductions/Tax', 'Net Salary', 'Status'];
    const rows = sortedPayroll.map(p => [
      p.employeeName,
      p.employeeId,
      p.designation,
      p.basicSalary,
      p.bonus + p.allowance,
      p.deductions + p.tax,
      p.netSalary,
      p.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payroll CSV database exported");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Payroll</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage base salaries, HRA, TDS deductions, and payslips</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold shadow-sm" onClick={handleProcessPayroll}>
          <DollarSign className="w-4 h-4" />Process Payroll
        </Button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Disbursed', value: `$${totalDisbursed.toLocaleString()}`, icon: DollarSign, color: 'green', bg: 'bg-green-500/10 text-green-600' },
          { title: 'Pending Payroll', value: `${pendingCount} employees`, icon: Clock, color: 'amber', bg: 'bg-amber-500/10 text-amber-500' },
          { title: 'Payroll Growth', value: '+4.2%', icon: TrendingUp, color: 'blue', bg: 'bg-blue-500/10 text-blue-500' },
          { title: 'Processed Rate', value: `${processedCount}/${payrollList.length}`, icon: CheckCheck, color: 'violet', bg: 'bg-purple-500/10 text-purple-500' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none font-mono">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name or ID..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-36 text-xs bg-background border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 gap-1.5 text-xs font-semibold border-border">
            <Download className="w-3.5 h-3.5" />Export
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleToggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase hover:text-foreground">
                    Employee
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleToggleSort('basicSalary')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase hover:text-foreground">
                    Basic Salary
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">HRA (40%)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Allowance/Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tax/PF Deduct</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleToggleSort('netSalary')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase hover:text-foreground">
                    Net Salary
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-32 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-12 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-12 h-4 bg-muted rounded-full" /></td>
                    <td className="p-4 text-right"><div className="w-8 h-8 ml-auto bg-muted rounded" /></td>
                  </tr>
                ))
              ) : paginatedPayroll.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-muted-foreground font-medium">
                    No payroll files match this search query.
                  </td>
                </tr>
              ) : (
                paginatedPayroll.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7.5 w-7.5 shrink-0 border border-border">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {p.employeeName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{p.employeeName}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{p.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground">${p.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">${p.hra.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-green-600 font-semibold">+${(p.bonus + p.allowance).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-red-500">-${(p.tax + p.deductions).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground font-mono">${p.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5", statusConfig[p.status as keyof typeof statusConfig].className)}>
                        {statusConfig[p.status as keyof typeof statusConfig].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/payroll/payslip/${p.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredPayroll.length)} of {filteredPayroll.length} records
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs font-semibold border-border" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs font-semibold" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs font-semibold border-border" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next<ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
