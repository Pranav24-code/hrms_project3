import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DollarSign, FileText, Eye, CalendarDays, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '@/utils/api';

type PayrollRecord = {
  _id: string;
  id: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  allowance: number;
  bonus: number;
  tax: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paidDate?: string;
};

const statusConfig = {
  paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  processed: { label: 'Processed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function PayslipHistoryPage() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.auth.user);

  const fetchPayrolls = async () => {
    if (!user?.id) {
      setPayrolls([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/payroll/my');
      setPayrolls(res.data.payrolls ?? []);
    } catch (err) {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [user?.id]);

  const totalEarnings = payrolls
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.netSalary, 0);

  const lastPayout = payrolls.length > 0 ? payrolls[0].netSalary : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>My Payslip History</h1>
        <p className="text-sm text-muted-foreground">View and download your official monthly payslips</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Paid This Year', value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'green' },
          { title: 'Last Net Payout', value: `$${lastPayout.toLocaleString()}`, icon: TrendingUp, color: 'blue' },
          { title: 'Total Payslips Available', value: `${payrolls.length}`, icon: FileText, color: 'violet' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.title}</p>
                <p className="text-xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                s.color === 'green' ? 'bg-green-500/10 text-green-500' : 
                s.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
                'bg-violet-500/10 text-violet-500')}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Payslips List Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Historical Records</h3>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading payslip records...</div>
        ) : payrolls.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No payroll or payslip records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Pay Period', 'Basic Salary', 'Bonus & Allowances', 'Deductions', 'Net Salary', 'Status', 'Payment Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrolls.map(p => (
                  <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-xs">
                      {p.month} {p.year}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">${p.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-green-600">
                      +${(p.bonus + p.allowance).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-red-500">
                      -${p.deductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold font-mono">${p.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px]", statusConfig[p.status].className)}>
                        {statusConfig[p.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => navigate(`/payroll/payslip/${p._id}`)}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
