import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, CheckCheck, Eye, Trash2, Download, Plus, ChevronRight, ChevronLeft, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/utils/api';
import * as XLSX from 'xlsx';

type PayrollRecord = {
  _id: string; id: string; employee: string; employeeId: string;
  employeeName: string; email: string; department: string; designation: string;
  month: string; monthVal: number; year: number; basicSalary: number; hra: number;
  allowance: number; bonus: number; tax: number; deductions: number;
  leaveDeduction: number; grossSalary: number; netSalary: number;
  status: 'pending' | 'processed' | 'paid'; paidDate?: string;
};

type EmployeePreview = {
  userId: string; employeeId: string; name: string; email: string;
  department: string; designation: string; alreadyProcessed: boolean;
  presentCount: number; absentCount: number; halfDayCount: number;
  lateCount: number; onLeaveCount: number; totalWorkingHours: number;
  totalAttendanceDays: number; daysInMonth: number; basicSalary: number;
  hra: number; allowance: number; bonus: number; leaveDeduction: number;
  pf: number; tax: number; deductions: number; grossSalary: number; netSalary: number;
};

type SelectionEntry = {
  userId: string; selected: boolean;
  bonusOverride: string; extraDeduction: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  processed: { label: 'Processed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

const monthsList = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];
const yearsList = [
  { value: '2024', label: '2024' }, { value: '2025', label: '2025' },
  { value: '2026', label: '2026' }, { value: '2027', label: '2027' },
];

export default function PayrollDashboardPage() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [previews, setPreviews] = useState<EmployeePreview[]>([]);
  const [selections, setSelections] = useState<SelectionEntry[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/all');
      setPayrolls(res.data.payrolls ?? []);
    } catch { toast.error('Failed to fetch payroll records'); setPayrolls([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayrolls(); }, []);

  const openDialog = () => { setStep(1); setPreviews([]); setSelections([]); setIsOpen(true); };

  const handleLoadPreview = async () => {
    try {
      setPreviewLoading(true);
      const res = await api.get(`/payroll/preview?month=${selectedMonth}&year=${selectedYear}`);
      const emps: EmployeePreview[] = res.data.employees ?? [];
      setPreviews(emps);
      setSelections(emps.map(e => ({
        userId: String(e.userId),
        selected: !e.alreadyProcessed,
        bonusOverride: String(e.bonus),
        extraDeduction: '0',
      })));
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load employee preview');
    } finally { setPreviewLoading(false); }
  };

  const toggleSelect = (userId: string) =>
    setSelections(prev => prev.map(s => s.userId === userId ? { ...s, selected: !s.selected } : s));

  const updateField = (userId: string, field: 'bonusOverride' | 'extraDeduction', val: string) =>
    setSelections(prev => prev.map(s => s.userId === userId ? { ...s, [field]: val } : s));

  const toggleAll = (checked: boolean) =>
    setSelections(prev => prev.map((s, i) => previews[i]?.alreadyProcessed ? s : { ...s, selected: checked }));

  const handleProcess = async () => {
    const chosen = selections.filter(s => s.selected);
    if (chosen.length === 0) { toast.error('Select at least one employee'); return; }
    try {
      setProcessing(true);
      const res = await api.post('/payroll/process', {
        month: Number(selectedMonth),
        year: Number(selectedYear),
        selections: chosen.map(s => ({
          userId: s.userId,
          bonusOverride: Number(s.bonusOverride) || 0,
          extraDeduction: Number(s.extraDeduction) || 0,
        })),
      });
      toast.success(res.data.message || 'Payroll processed!');
      setIsOpen(false);
      fetchPayrolls();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process payroll');
    } finally { setProcessing(false); }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await api.put(`/payroll/status/${id}`, { status: 'paid' });
      toast.success('Marked as paid'); fetchPayrolls();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await api.delete(`/payroll/delete/${id}`);
      toast.success('Deleted'); fetchPayrolls();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleExport = () => {
    if (!payrolls.length) { toast.error('No records to export'); return; }
    const rows = payrolls.map(p => ({
      'Employee': p.employeeName, 'ID': p.employeeId, 'Dept': p.department,
      'Period': `${p.month} ${p.year}`, 'Basic($)': p.basicSalary,
      'HRA($)': p.hra, 'Bonus($)': p.bonus, 'Tax($)': p.tax,
      'Deductions($)': p.deductions, 'Net($)': p.netSalary, 'Status': p.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, `Payroll_${new Date().toLocaleDateString()}.xlsx`);
    toast.success('Exported!');
  };

  const filtered = payrolls.filter(p => {
    const okM = filterMonth === 'all' || p.monthVal.toString() === filterMonth;
    const okY = filterYear === 'all' || p.year.toString() === filterYear;
    return okM && okY;
  });

  const totalPaid = payrolls.filter(p => p.status === 'paid').reduce((s, p) => s + p.netSalary, 0);
  const totalPending = payrolls.filter(p => p.status !== 'paid').length;
  const processedCount = payrolls.filter(p => p.status !== 'pending').length;

  const allSelected = selections.filter((_, i) => !previews[i]?.alreadyProcessed).every(s => s.selected);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Payroll Management</h1>
          <p className="text-sm text-muted-foreground">Process and manage employee salaries</p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openDialog}>
          <Plus className="w-3.5 h-3.5" />Process Payroll
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'Total Disbursed', value: `$${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'green' },
          { title: 'Pending Payroll', value: `${totalPending} employees`, icon: Clock, color: 'amber' },
          { title: 'Payroll Growth', value: '+4.2%', icon: TrendingUp, color: 'blue' },
          { title: 'Processed', value: `${processedCount}/${payrolls.length}`, icon: CheckCheck, color: 'violet' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3',
                s.color === 'green' ? 'bg-green-500/10' : s.color === 'amber' ? 'bg-amber-500/10' :
                s.color === 'blue' ? 'bg-blue-500/10' : 'bg-violet-500/10')}>
                <Icon className={cn('w-4 h-4', s.color === 'green' ? 'text-green-500' : s.color === 'amber' ? 'text-amber-500' :
                  s.color === 'blue' ? 'text-blue-500' : 'text-violet-500')} />
              </div>
              <p className="text-base font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/30"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthsList.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-[110px] text-xs bg-muted/30"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearsList.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-full sm:w-auto" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" />Export Excel
        </Button>
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Payroll Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Employee', 'Pay Period', 'Basic', 'Bonus/Allow', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No payroll records found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {p.employeeName?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{p.employeeName}</p>
                        <p className="text-[10px] text-muted-foreground">{p.designation} · {p.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{p.month} {p.year}</td>
                  <td className="px-4 py-3 text-xs font-mono">${p.basicSalary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-green-600">+${(p.bonus + p.allowance).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-red-500">-${p.deductions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono">${p.netSalary.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('text-[10px]', statusConfig[p.status]?.className)}>
                      {statusConfig[p.status]?.label || p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/payroll/payslip/${p._id}`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {p.status !== 'paid' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:bg-green-500/10" onClick={() => handleMarkAsPaid(p._id)}>
                          <CheckCheck className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p._id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payroll Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={cn('transition-all', step === 2 ? 'max-w-5xl' : 'max-w-md')}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Sora, sans-serif' }}>
              {step === 1 ? 'Select Pay Period' : `Review Employees — ${monthsList.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {step === 1
                ? 'Choose the month and year to process payroll for.'
                : 'Select employees, review their work record, and optionally adjust bonus or add extra deductions before processing.'}
            </p>
          </DialogHeader>

          {/* Step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {monthsList.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {yearsList.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto mt-2">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/80 border-b border-border">
                    <th className="px-3 py-2.5 text-left">
                      <input type="checkbox" checked={allSelected} onChange={e => toggleAll(e.target.checked)} className="rounded" />
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide">Attendance</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-wide">Basic Salary</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide w-28">Bonus ($)</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide w-28">Extra Ded. ($)</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-wide">Est. Net</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previews.map((emp, i) => {
                    const sel = selections[i];
                    if (!sel) return null;
                    const bonusVal = Number(sel.bonusOverride) || 0;
                    const extraDed = Number(sel.extraDeduction) || 0;
                    const hra = Math.round(emp.basicSalary * 0.4 * 100) / 100;
                    const gross = emp.basicSalary + hra + emp.allowance + bonusVal;
                    const pf = Math.round(emp.basicSalary * 0.12 * 100) / 100;
                    const tax = Math.round(gross * 0.1 * 100) / 100;
                    const totalDed = Math.round((pf + tax + emp.leaveDeduction + extraDed) * 100) / 100;
                    const estNet = Math.max(0, Math.round((gross - totalDed) * 100) / 100);

                    return (
                      <tr key={emp.userId} className={cn('hover:bg-muted/20 transition-colors', emp.alreadyProcessed && 'opacity-50')}>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={sel.selected}
                            disabled={emp.alreadyProcessed}
                            onChange={() => toggleSelect(emp.userId)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                {emp.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-xs">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{emp.designation} · {emp.department}</p>
                              <p className="text-[10px] text-muted-foreground">{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              <span className="flex items-center gap-0.5 text-green-600 font-semibold">
                                <UserCheck className="w-3 h-3" />{emp.presentCount}
                              </span>
                              <span className="flex items-center gap-0.5 text-red-500 font-semibold">
                                <UserX className="w-3 h-3" />{emp.absentCount}
                              </span>
                              <span className="flex items-center gap-0.5 text-blue-500 font-semibold">
                                <AlertCircle className="w-3 h-3" />{emp.halfDayCount}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                <Clock className="w-3 h-3" />{emp.lateCount}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{emp.totalWorkingHours}h worked</p>
                            {emp.leaveDeduction > 0 && (
                              <span className="text-[10px] text-red-500 font-semibold">-${emp.leaveDeduction} leave ded.</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold">${emp.basicSalary.toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            value={sel.bonusOverride}
                            disabled={emp.alreadyProcessed || !sel.selected}
                            onChange={e => updateField(emp.userId, 'bonusOverride', e.target.value)}
                            className="w-full border border-border rounded-md px-2 py-1 text-xs bg-background text-center disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            value={sel.extraDeduction}
                            disabled={emp.alreadyProcessed || !sel.selected}
                            onChange={e => updateField(emp.userId, 'extraDeduction', e.target.value)}
                            className="w-full border border-border rounded-md px-2 py-1 text-xs bg-background text-center disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-primary">${estNet.toLocaleString()}</td>
                        <td className="px-3 py-3 text-center">
                          {emp.alreadyProcessed
                            ? <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                            : <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {previews.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">No employee profiles found.</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            {step === 2 && (
              <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={processing}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />Back
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={processing || previewLoading}>
              Cancel
            </Button>
            {step === 1 ? (
              <Button size="sm" onClick={handleLoadPreview} disabled={previewLoading}>
                {previewLoading ? 'Loading...' : <><span>Next</span><ChevronRight className="w-3.5 h-3.5 ml-1" /></>}
              </Button>
            ) : (
              <Button size="sm" onClick={handleProcess} disabled={processing}>
                {processing ? 'Processing...' : `Process (${selections.filter(s => s.selected).length} selected)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
