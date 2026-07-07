import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, CheckCheck, Eye, Download } from 'lucide-react';
import { mockPayroll } from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";

const statusConfig = {
  paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  processed: { label: 'Processed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function PayrollDashboardPage() {
  const navigate = useNavigate();
  const [monthFilter, setMonthFilter] = useState('all');
  const [payrolls, setPayrolls] = useState([]);
const [loading, setLoading] = useState(true);

  const totalPaid = mockPayroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.netSalary, 0);
  const totalPending = mockPayroll.filter(p => p.status !== 'paid').length;


  useEffect(() => {
  fetchPayrolls();
}, []);

const fetchPayrolls = async () => {
  try {
    const res = await api.get("/payroll/all");
       console.log(res.data);


    if (res.data.success) {
      setPayrolls(res.data.payrolls);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

const handleGeneratePayroll = async () => {
  try {
    await api.post("/payroll/generate-all", {
      month: 6,
      year: 2026,
    });

    toast.success("Payroll Generated");

    fetchPayrolls();

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Payroll</h1>
          <p className="text-sm text-muted-foreground">Manage and process employee payroll</p>
        </div>
        <Button size="sm"   onClick={handleGeneratePayroll} className="h-8 gap-1.5 text-xs" >
          <DollarSign className="w-3.5 h-3.5" />Process Payroll
        </Button>
      </div>

      {/* Stats */}
  
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'Total Disbursed', value: `$${totalPaid.toLocaleString()}`, icon: DollarSign, color: 'green' },
          { title: 'Pending Payroll', value: `${totalPending} employees`, icon: Clock, color: 'amber' },
          { title: 'Payroll Growth', value: '+3.1%', icon: TrendingUp, color: 'blue' },
          { title: 'Processed', value: `${mockPayroll.filter(p => p.status !== 'pending').length}/${mockPayroll.length}`, icon: CheckCheck, color: 'violet' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-card border border-border rounded-xl p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3",
                s.color === 'green' ? 'bg-green-500/10' : s.color === 'amber' ? 'bg-amber-500/10' :
                s.color === 'blue' ? 'bg-blue-500/10' : 'bg-violet-500/10')}>
                <Icon className={cn("w-4 h-4",
                  s.color === 'green' ? 'text-green-500' : s.color === 'amber' ? 'text-amber-500' :
                  s.color === 'blue' ? 'text-blue-500' : 'text-violet-500')} />
              </div>
              <p className="text-sm font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Payroll Records — June 2025</h3>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" />Export</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Employee', 'Basic Salary', 'HRA', 'Bonus', 'Deductions', 'Tax', 'Net Salary', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payrolls.map(p => (
                <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
  <div className="flex items-center gap-2.5">
    <Avatar className="h-7 w-7">
      <AvatarFallback>
        {p.employee?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>

    <div>
      <p className="text-xs font-medium">
        {p.employee?.username}
      </p>

      <p className="text-[10px] text-muted-foreground">
        {p.employeeId}
      </p>
    </div>
  </div>
</td>
                 

<td className="px-4 py-3 text-xs font-mono">
  ₹{p.basicSalary.toLocaleString()}
</td>

<td className="px-4 py-3 text-xs font-mono">
  ₹{p.hra.toLocaleString()}
</td>

<td className="px-4 py-3 text-xs font-mono">
  ₹{p.bonus.toLocaleString()}
</td>

<td className="px-4 py-3 text-xs font-mono">
  ₹{p.deductions.toLocaleString()}
</td>

<td className="px-4 py-3 text-xs font-mono">
  ₹{p.tax.toLocaleString()}
</td>

<td className="px-4 py-3 text-xs font-bold">
  ₹{p.netSalary.toLocaleString()}
</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig[p.status].className)}>
                      {statusConfig[p.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/payroll/payslip/${p._id}`)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
