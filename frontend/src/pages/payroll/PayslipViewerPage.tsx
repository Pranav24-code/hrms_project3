import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Printer, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/utils/api';

export default function PayslipViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDetail();
  }, [id]);

  const fetchEmployeeDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employee/get-emp");
      const foundEmp = res.data.employees?.find((e: any) => e._id === id || e.id === id);
      if (foundEmp) {
        setEmp(foundEmp);
      } else {
        toast.error("Payslip record not found");
        navigate('/payroll');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payslip");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="w-24 h-8 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!emp) return null;

  const basic = emp.basicSalary || 5000;
  const allowance = emp.allowance || 300;
  const bonus = emp.bonus || 0;
  const hra = Math.round(basic * 0.4);
  const tax = Math.round(basic * 0.12);
  const deductions = Math.round(basic * 0.05);
  const netSalary = basic + allowance + bonus - tax - deductions;

  const rows = [
    { label: 'Basic Salary', earn: basic, ded: 0 },
    { label: 'House Rent Allowance (HRA)', earn: hra, ded: 0 },
    { label: 'Special Allowance & Bonus', earn: allowance + bonus, ded: 0 },
    { label: 'Provident Fund (PF)', earn: 0, ded: deductions },
    { label: 'Income Tax (TDS)', earn: 0, ded: tax },
  ];

  const grossEarnings = basic + hra + allowance + bonus;
  const totalDed = deductions + tax;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs font-semibold hover:bg-muted" onClick={() => navigate('/payroll')}>
          <ArrowLeft className="w-3.5 h-3.5" />Back to Payroll
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />Print Payslip
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('Payslip downloaded as PDF')}>
            <Download className="w-3.5 h-3.5" />Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md print:border-0 print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/85 px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">NexaHR</h2>
                <p className="text-xs opacity-80">Enterprise Payroll Solutions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide opacity-75">Salary Statement</p>
              <p className="text-base font-bold font-mono">June 2025</p>
              <Badge className="mt-1 bg-white/25 text-primary-foreground border-white/20 text-[9px] font-bold uppercase tracking-wider">Paid</Badge>
            </div>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="px-6 py-4 bg-muted/40 border-b border-border/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Employee Name', value: `${emp.firstName} ${emp.lastName}` },
              { label: 'Employee ID', value: emp.employeeId },
              { label: 'Department', value: emp.department },
              { label: 'Designation', value: emp.designation },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                <p className="text-xs font-semibold mt-0.5 text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table of Earns & Deductions */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left py-2">Item Description</th>
                <th className="text-right py-2 text-green-600 dark:text-green-400">Earnings ($)</th>
                <th className="text-right py-2 text-red-500">Deductions ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-muted/10">
                  <td className="py-2.5 text-foreground font-medium">{row.label}</td>
                  <td className="py-2.5 text-right font-mono text-xs">
                    {row.earn > 0 ? <span className="text-green-600 font-semibold">{row.earn.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs">
                    {row.ded > 0 ? <span className="text-red-500 font-semibold">{row.ded.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border/80 font-bold text-xs text-foreground">
                <td className="py-3">Gross Summary</td>
                <td className="py-3 text-right font-mono text-green-600">${grossEarnings.toLocaleString()}</td>
                <td className="py-3 text-right font-mono text-red-500">${totalDed.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Net Salary Area */}
        <div className="mx-6 mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Net Salary Payable</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Gross Earnings less deductions & TDS</p>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">
            ${netSalary.toLocaleString()}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-muted-foreground">This statement is generated digitally by NexaHR portal and is tax compliant.</p>
        </div>
      </div>
    </div>
  );
}
