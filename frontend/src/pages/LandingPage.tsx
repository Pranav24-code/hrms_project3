import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { 
  Briefcase, 
  ArrowRight, 
  Users, 
  Clock, 
  CalendarDays, 
  CreditCard, 
  Check, 
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'attendance' | 'leaves'>('directory');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const tabs = [
    {
      id: 'directory' as const,
      label: 'Core Directory',
      icon: Users,
      title: 'One Secure Directory for All Employee Profiles',
      desc: 'Keep complete worker history, departments, roles, and contacts up to date. Avoid circular spreadsheets and store everything in a single database.',
      preview: (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground">Employee Profiles</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active Directory</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'EMP001', name: 'John Doe', role: 'Software Engineer', dept: 'Engineering', img: 'JD' },
              { id: 'EMP002', name: 'Jane Smith', role: 'UX Designer', dept: 'Design', img: 'JS' },
              { id: 'MGR001', name: 'Sarah Connor', role: 'HR Manager', dept: 'Human Resources', img: 'SC' },
            ].map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {emp.img}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{emp.name}</h5>
                    <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">{emp.dept}</span>
                  <p className="text-[9px] text-muted-foreground/85 mt-0.5">{emp.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'payroll' as const,
      label: 'Smart Payroll',
      icon: CreditCard,
      title: 'Automated Salaries, Deductions & Taxes',
      desc: 'Formulas calculate HRA, allowances, income tax deductions, and net salary. Instantly generate and print formatted professional payslips.',
      preview: (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground">Payslip Computation</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Formula Enabled</span>
          </div>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 p-2.5 rounded border border-border/50">
                <p className="text-[10px] text-muted-foreground">Earnings Breakdown</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between text-[11px] text-foreground"><span>Basic Pay</span><span className="font-semibold text-primary">₹50,000</span></div>
                  <div className="flex justify-between text-[11px] text-foreground"><span>HRA</span><span className="font-semibold text-primary">₹20,000</span></div>
                  <div className="flex justify-between text-[11px] text-foreground"><span>Allowances</span><span className="font-semibold text-primary">₹10,000</span></div>
                </div>
              </div>
              <div className="bg-muted/30 p-2.5 rounded border border-border/50">
                <p className="text-[10px] text-muted-foreground">Deductions</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between text-[11px] text-foreground"><span>Income Tax</span><span className="font-semibold text-primary">₹8,000</span></div>
                  <div className="flex justify-between text-[11px] text-foreground"><span>PF</span><span className="font-semibold text-primary">₹2,500</span></div>
                  <div className="flex justify-between text-[11px] text-foreground"><span>Other</span><span className="font-semibold text-primary">₹500</span></div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/40 rounded border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Calculated Net Pay</p>
                <h4 className="text-base font-extrabold text-foreground mt-0.5">₹69,000</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">Status: Paid</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'attendance' as const,
      label: 'Attendance tracker',
      icon: Clock,
      title: 'Seamless Self-Service Clock-in/Clock-out',
      desc: 'Employees log work hours with a single click. The system flags late arrivals, calculates shift hours, and generates daily logs automatically.',
      preview: (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground">Live Shifts Logging</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">Real-time GPS-free</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="flex gap-4">
              <div className="text-center">
                <span className="text-[9px] text-muted-foreground block">CLOCK-IN</span>
                <span className="text-xs font-bold text-foreground">09:15 AM</span>
              </div>
              <div className="w-[1px] h-8 bg-border" />
              <div className="text-center">
                <span className="text-[9px] text-muted-foreground block">SHIFT HOURS</span>
                <span className="text-xs font-bold text-foreground">8.2 Hours</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2">
              <button disabled className="h-8 text-[11px] font-semibold rounded bg-muted text-muted-foreground border border-border/50">Clock In</button>
              <button className="h-8 text-[11px] font-bold rounded bg-primary text-white hover:bg-primary/95 transition-colors shadow-md shadow-primary/20">Clock Out</button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'leaves' as const,
      label: 'Leave Workflows',
      icon: CalendarDays,
      title: 'Automated Requests & Approval Flows',
      desc: 'Say goodbye to paperwork. Employees check remaining balances, submit date ranges, and managers approve or reject requests instantly.',
      preview: (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground">Incoming Requests</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">Pending Action</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-xs font-bold text-foreground">Jane Smith</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">Vacation Leave · 3 Days</p>
                <p className="text-[9px] text-muted-foreground/80 mt-1">"Family trip to Himachal Pradesh"</p>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground">June 20 - 23</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="h-7 text-[10px] font-semibold rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors">Reject</button>
              <button className="h-7 text-[10px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">Approve</button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden select-none">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[140px] pointer-events-none -z-10" />

      {/* Marquee Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .neo-glass {
          background: rgba(255, 255, 255, 0.7);
          border: 1px file s= solid var(--border);
          backdrop-filter: blur(12px);
        }
        .neo-glass-hover:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(30, 64, 175, 0.3);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-border bg-card/65 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-border bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/10">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#roi-impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">ROI Impact</a>
            <a href="#features-tabs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#test-credentials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Credentials</a>
            <Button variant="default" size="sm" onClick={() => navigate('/login')} className="h-9 px-5 font-bold bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 border border-primary/20 rounded-lg">
              Sign In <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Banner */}
        <section className="py-20 lg:py-28 px-4 text-center max-w-5xl mx-auto space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> AUTOMATED HRMS & PAYROLL DASHBOARD
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08] lg:leading-[1.04]" style={{ fontFamily: 'Sora, sans-serif' }}>
            Make HR Simple, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">Accurate, and Automated.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            The high-performance workforce engine trusted to reduce payroll runtimes by <strong className="text-foreground font-bold">35%</strong>, eliminate manual compliance errors by <strong className="text-foreground font-bold">60%</strong>, and sync directory records instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground text-sm max-w-3xl mx-auto pt-2">
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
              <Check className="w-4 h-4 text-primary" /> One Accurate Source of Truth
            </div>
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
              <Check className="w-4 h-4 text-primary" /> Automated Approvals
            </div>
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
              <Check className="w-4 h-4 text-primary" /> Manager Self-Service
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button size="lg" onClick={() => navigate('/login')} className="h-12 px-8 text-base font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-xl shadow-primary/10 border border-primary/20">
              Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <a href="#features-tabs">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-bold text-muted-foreground border-border hover:bg-muted hover:text-foreground rounded-xl bg-card">
                Explore Features
              </Button>
            </a>
          </div>
        </section>

        {/* Brand Logos Marquee */}
        <section className="py-8 bg-card border-y border-border overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
            <p className="text-xs font-semibold text-muted-foreground/70 tracking-wider uppercase">10,000+ COMPANIES TRUST NE X A H R PLATFORM</p>
          </div>
          <div className="flex w-[200%] md:w-[150%] items-center overflow-hidden">
            <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
              {['ebay', 'oneplus', 'byd', 'cleartax', 'oyo', 'maersk', 'tata', 'wipro'].map((brand, i) => (
                <div key={i} className="flex items-center justify-center h-12 w-28 text-muted-foreground/60 hover:text-primary font-extrabold tracking-widest text-lg transition-colors italic">
                  {brand.toUpperCase()}
                </div>
              ))}
              {/* Duplicate for infinite loop */}
              {['ebay', 'oneplus', 'byd', 'cleartax', 'oyo', 'maersk', 'tata', 'wipro'].map((brand, i) => (
                <div key={`${i}-dup`} className="flex items-center justify-center h-12 w-28 text-muted-foreground/60 hover:text-primary font-extrabold tracking-widest text-lg transition-colors italic">
                  {brand.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quantified Business ROI Grid */}
        <section id="roi-impact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-20">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>HR That Delivers Measurable Results</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              From faster monthly payroll cycles to error-free tax computations and active employee collaboration—NexaHR transforms workforce administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '35%', label: 'Less Time Processing Payroll', desc: 'One-click automated computation cycles, built-in allowance formulas, and instantly compiled professional PDF-ready payslips.' },
              { num: '60%', label: 'Reduction in Manual Errors', desc: 'A unified single-source database links designations, leaves, check-ins, and earnings directly. Zero double entries.' },
              { num: '3X', label: 'Higher Manager & Team Engagement', desc: 'Smooth self-service pages allow employees to check-in/out and file leave requests while managers handle approvals in one click.' }
            ].map((roi, idx) => (
              <div key={idx} className="neo-card rounded-2xl p-8 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-blue-600 opacity-80 group-hover:w-2 transition-all duration-300" />
                <div className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-primary to-blue-600 bg-clip-text mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {roi.num}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{roi.label}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{roi.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Pillar Interactive Tabs */}
        <section id="features-tabs" className="py-20 bg-muted/30 border-y border-border scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>What Happens When HR Works As One?</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Explore our fully integrated modules. From onboarding details to the final monthly salary release, everything matches perfectly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Tab Selectors */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-card border-border shadow-md translate-x-2'
                          : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card/40'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg border transition-colors ${
                        isActive 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {tab.label}
                        </h4>
                        <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-1">
                          {tab.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Tab View Preview */}
              <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl min-h-[320px]">
                <div className="flex-1 space-y-4 text-left">
                  {tabs.map((tab) => {
                    if (tab.id !== activeTab) return null;
                    return (
                      <div key={tab.id} className="space-y-3 animate-fade-in">
                        <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                          <tab.icon className="w-3.5 h-3.5" /> FEATURE HIGHLIGHT
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {tab.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                          {tab.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full md:w-80 flex-shrink-0">
                  {tabs.find(t => t.id === activeTab)?.preview}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Credentials Sandbox */}
        <section id="test-credentials" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-20">
          <div className="bg-gradient-to-br from-card via-muted/40 to-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-600/5 blur-[80px] pointer-events-none" />

            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <ShieldAlert className="w-3.5 h-3.5" /> DEV ENVIRONMENT PLAYGROUND
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>Test & Evaluate NexaHR Instantly</h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
                No setup or registration required. Use our preloaded mock roles to login and experience both the Administrator (HR Manager) and Employee dashboard views.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HR Manager Role */}
              <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all shadow-sm">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">HR Manager Dashboard</span>
                  <h4 className="text-base font-bold text-foreground">Full Admin Access</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Access global workforce payroll trends, process monthly salaries, approve/reject employee leaves, and manage the full company employee roster.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-xs text-foreground"><span>Email:</span><code className="text-primary font-bold">hr@nexahr.com</code></div>
                  <div className="flex justify-between text-xs text-foreground"><span>Password:</span><code className="text-primary font-bold">Admin@123</code></div>
                </div>
              </div>

              {/* Employee Role */}
              <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all shadow-sm">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">Employee Portal</span>
                  <h4 className="text-base font-bold text-foreground">Employee Self-Service</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check-in (Clock-in) or Check-out of the shift, view monthly calculated payslips breakdown, apply for leaves, and track dates approval status.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-xs text-foreground"><span>Email:</span><code className="text-primary font-bold">employee@nexahr.com</code></div>
                  <div className="flex justify-between text-xs text-foreground"><span>Password:</span><code className="text-primary font-bold">Admin@123</code></div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <Button size="lg" onClick={() => navigate('/login')} className="h-11 px-8 font-bold bg-primary hover:bg-primary/95 text-white rounded-xl transition-all shadow-lg shadow-primary/25 border border-primary/20">
                Sign In to Playground <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
          </div>
          <p className="text-xs text-muted-foreground italic">© 2026 NexaHR Platform. Redesigned for excellence in human resources management.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
