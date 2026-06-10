import { useState } from 'react';
import { CalendarDays, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', balance: 12 },
  { value: 'sick', label: 'Sick Leave', balance: 8 },
  { value: 'casual', label: 'Casual Leave', balance: 6 },
  { value: 'maternity', label: 'Maternity Leave', balance: 90 },
  { value: 'paternity', label: 'Paternity Leave', balance: 15 },
  { value: 'unpaid', label: 'Unpaid Leave', balance: 30 },
];

export default function LeaveRequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const d1 = new Date(form.startDate), d2 = new Date(form.endDate);
    return Math.max(0, Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      toast.error('Please fill all required fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success('Leave request submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Request Submitted!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">Your leave request has been submitted and is pending approval from HR.</p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="h-8 text-xs">Submit Another</Button>
          <Button size="sm" onClick={() => window.location.hash = '#/leave/history'} className="h-8 text-xs">View History</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Apply for Leave</h1>
        <p className="text-sm text-muted-foreground">Submit a leave request for HR approval</p>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {leaveTypes.slice(0, 6).map(lt => (
          <div key={lt.value} className="bg-card border border-border rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{lt.balance}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{lt.label.replace(' Leave', '')}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs">Leave Type *</Label>
          <Select value={form.leaveType} onValueChange={v => set('leaveType', v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select leave type" /></SelectTrigger>
            <SelectContent>
              {leaveTypes.map(lt => <SelectItem key={lt.value} value={lt.value}>{lt.label} ({lt.balance} days available)</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Start Date *</Label>
            <Input type="date" className="h-9" value={form.startDate} onChange={e => set('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">End Date *</Label>
            <Input type="date" className="h-9" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.startDate || new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {calcDays() > 0 && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-3 py-2">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">{calcDays()} day{calcDays() > 1 ? 's' : ''} selected</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs">Reason *</Label>
          <Textarea placeholder="Please provide a reason for your leave request…" className="min-h-[100px] text-sm resize-none" value={form.reason} onChange={e => set('reason', e.target.value)} />
        </div>

        <Button type="submit" className="w-full h-9 font-semibold" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Leave Request'}
        </Button>
      </form>
    </div>
  );
}
