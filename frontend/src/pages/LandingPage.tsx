import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm border-1.5 border-border bg-primary flex items-center justify-center shadow-[2px_2px_0px_0px_var(--border)]">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Features</button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Pricing</button>
            <Button variant="default" size="sm" onClick={() => navigate('/login')} className="h-9 px-5 font-semibold">
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-32 px-4 relative overflow-hidden">
          {/* Background shapes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 animate-fade-in">
              <Zap className="w-3 h-3" /> THE FUTURE OF HR MANAGEMENT
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Manage your workforce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">without the complexity.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
              Experience the next generation HRMS platform. Streamline payroll, attendance, 
              leaves, and employee management all in one secure, high-performance dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate('/login')} className="h-12 px-8 text-base font-bold group">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-muted/30 border-y border-border px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Smart Payroll', desc: 'Automated salary processing with legal compliance and instant payslips.', icon: BarChart3 },
                { title: 'Hybrid Attendance', desc: 'Track workforce presence across remote and office environments seamlessy.', icon: Users },
                { title: 'Leave Tracking', desc: 'Advanced approval workflows with real-time balance management.', icon: Shield },
                { title: 'Enterprise Security', desc: 'Role-based access control with secure data encryption at every level.', icon: Zap }
              ].map((f, i) => (
                <div key={i} className="neo-card p-6">
                  <div className="w-10 h-10 rounded-sm border-1.5 border-border bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
          </div>
          <p className="text-xs text-muted-foreground italic">© 2025 NexaHR Platform. Built for excellence in human resource management.</p>
          <div className="flex gap-6">
            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</button>
            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
