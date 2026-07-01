import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Briefcase } from 'lucide-react';
import { mockPayroll } from '@/constants/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PayslipViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const payroll = mockPayroll.find(p => p.id === id) || mockPayroll[0];

  if (!payroll) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold mb-2">Payslip Not Found</h2>
        <p className="text-muted-foreground mb-4">The payslip you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/payroll')}>Return to Payroll</Button>
      </div>
    );
  }

  const rows = [
    { label: 'Basic Salary', earn: payroll.basicSalary, ded: 0 },
    { label: 'House Rent Allowance (HRA)', earn: payroll.hra, ded: 0 },
    { label: 'Performance Bonus', earn: payroll.bonus, ded: 0 },
    { label: 'Provident Fund (PF)', earn: 0, ded: payroll.deductions },
    { label: 'Income Tax (TDS)', earn: 0, ded: payroll.tax },
  ];
  const grossEarnings = rows.reduce((s, r) => s + r.earn, 0);
  const totalDed = rows.reduce((s, r) => s + r.ded, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate('/payroll')}>
          <ArrowLeft className="w-3.5 h-3.5" />Payroll
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Payslip</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { window.print(); }}>
            <Printer className="w-3.5 h-3.5" />Print
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('Payslip downloaded (demo)')}>
            <Download className="w-3.5 h-3.5" />Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</h2>
                <p className="text-xs opacity-80">Enterprise Human Resource Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Payslip</p>
              <p className="text-base font-bold">{payroll.month} {payroll.year}</p>
              <Badge className="mt-1 bg-white/20 text-primary-foreground text-[10px] border-white/30 capitalize">{payroll.status}</Badge>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="px-6 py-4 bg-muted/30 border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Employee', value: payroll.employeeName },
              { label: 'Department', value: payroll.department },
              { label: 'Designation', value: payroll.designation },
              { label: 'Pay Period', value: `${payroll.month} ${payroll.year}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-xs font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                <th className="text-right py-2 text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Earnings ($)</th>
                <th className="text-right py-2 text-xs font-semibold text-red-500 uppercase tracking-wide">Deductions ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-muted/20">
                  <td className="py-2.5 text-sm text-foreground">{row.label}</td>
                  <td className="py-2.5 text-right font-mono text-sm">
                    {row.earn > 0 ? <span className="text-green-600">{row.earn.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sm">
                    {row.ded > 0 ? <span className="text-red-500">{row.ded.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold">
                <td className="py-3 text-sm">Gross Total</td>
                <td className="py-3 text-right font-mono text-green-600">{grossEarnings.toLocaleString()}</td>
                <td className="py-3 text-right font-mono text-red-500">{totalDed.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Net Salary Banner */}
        <div className="mx-6 mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Net Salary</p>
            <p className="text-[10px] text-muted-foreground">Gross Earnings − Deductions</p>
          </div>
          <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>
            ${payroll.netSalary.toLocaleString()}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-muted-foreground">This is a computer-generated payslip and does not require a signature. Generated by NexaHR.</p>
        </div>
      </div>
    </div>
  );
}
