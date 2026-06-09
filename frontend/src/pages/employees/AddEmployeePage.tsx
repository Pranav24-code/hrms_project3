import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, Briefcase, DollarSign, Eye, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Employment', icon: Briefcase },
  { id: 3, title: 'Salary Details', icon: DollarSign },
  { id: 4, title: 'Review & Submit', icon: Eye },
];

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
    address: '', department: '', designation: '', joiningDate: '', role: 'employee',
    basicSalary: '', bonus: '', allowance: ''
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Employee added successfully!');
    navigate('/employees');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-3.5 h-3.5" />Employees
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Add Employee</span>
      </div>

      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Add New Employee</h1>
        <p className="text-sm text-muted-foreground">Complete all steps to onboard a new team member</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = current > step.id;
          const active = current === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                  done ? "bg-primary border-primary text-primary-foreground" :
                  active ? "border-primary text-primary bg-primary/10" :
                  "border-border text-muted-foreground bg-muted/40"
                )}>
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn("text-[10px] font-medium whitespace-nowrap", active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground")}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 mb-4 transition-all", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {current === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">First Name *</Label><Input placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Last Name *</Label><Input placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Email Address *</Label><Input type="email" placeholder="john@nexahr.com" value={form.email} onChange={e => set('email', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Phone Number</Label><Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label className="text-xs">Address</Label><Input placeholder="123 Main St, City, State" value={form.address} onChange={e => set('address', e.target.value)} className="h-9" /></div>
            </div>
          </div>
        )}
        {current === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Department *</Label>
                <Select value={form.department} onValueChange={v => set('department', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {['Engineering','Product','Design','Finance','Sales','Marketing','Human Resources'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Designation *</Label><Input placeholder="e.g. Software Engineer" value={form.designation} onChange={e => set('designation', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Joining Date *</Label><Input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={v => set('role', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="employee">Employee</SelectItem><SelectItem value="hr_manager">HR Manager</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        {current === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Basic Salary (Annual) *</Label><Input type="number" placeholder="80000" value={form.basicSalary} onChange={e => set('basicSalary', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Bonus</Label><Input type="number" placeholder="5000" value={form.bonus} onChange={e => set('bonus', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Allowance</Label><Input type="number" placeholder="2000" value={form.allowance} onChange={e => set('allowance', e.target.value)} className="h-9" /></div>
            </div>
            {form.basicSalary && (
              <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Estimated Monthly Breakdown</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Basic / mo', value: `$${Math.round(+form.basicSalary / 12).toLocaleString()}` },
                    { label: 'HRA (20%)', value: `$${Math.round(+form.basicSalary * 0.2 / 12).toLocaleString()}` },
                    { label: 'Deductions (4%)', value: `-$${Math.round(+form.basicSalary * 0.04 / 12).toLocaleString()}` },
                    { label: 'Est. Net', value: `$${Math.round(+form.basicSalary * 1.16 / 12).toLocaleString()}`, highlight: true },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className={cn("text-sm font-bold", item.highlight ? "text-primary" : "text-foreground")}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {current === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Review & Confirm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: `${form.firstName || '—'} ${form.lastName || ''}` },
                { label: 'Email', value: form.email || '—' },
                { label: 'Phone', value: form.phone || '—' },
                { label: 'Department', value: form.department || '—' },
                { label: 'Designation', value: form.designation || '—' },
                { label: 'Joining Date', value: form.joiningDate || '—' },
                { label: 'Basic Salary', value: form.basicSalary ? `$${(+form.basicSalary).toLocaleString()} / yr` : '—' },
                { label: 'Role', value: form.role === 'hr_manager' ? 'HR Manager' : 'Employee' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs text-primary font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Security Notice
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Upon submission, a unique **temporary password** and welcome credentials will be automatically sent to **{form.email || 'the provided email'}**.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => current > 1 ? setCurrent(p => p - 1) : navigate('/employees')}>
          <ArrowLeft className="w-3.5 h-3.5" />{current === 1 ? 'Cancel' : 'Back'}
        </Button>
        {current < 4 ? (
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setCurrent(p => p + 1)}>
            Next <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Adding...</> : <><Check className="w-3.5 h-3.5" />Add Employee</>}
          </Button>
        )}
      </div>
    </div>
  );
}
