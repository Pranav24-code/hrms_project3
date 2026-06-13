import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('hr@nexahr.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid email or password. Please try again.');
  };

  const setDemo = (role: 'hr' | 'employee') => {
    if (role === 'hr') { setEmail('hr@nexahr.com'); setPassword('Admin@123'); }
    else { setEmail('john.doe@nexahr.com'); setPassword('Employee@123'); }
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-sm border-1.5 border-border bg-primary flex items-center justify-center shadow-[2px_2px_0px_0px_var(--border)]">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
        </div>

        <div className="neo-card p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your NexaHR account</p>
          </div>

          {/* Demo credentials */}
          <div className="flex gap-3 mb-5">
            <button onClick={() => setDemo('hr')} className="flex-1 text-xs py-2 px-3 rounded-sm border-1.5 border-border bg-card hover:bg-accent hover:-translate-y-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_var(--border)] active:shadow-[1px_1px_0px_var(--border)] transition-all font-semibold font-mono">
              👤 HR Manager
            </button>
            <button onClick={() => setDemo('employee')} className="flex-1 text-xs py-2 px-3 rounded-sm border-1.5 border-border bg-card hover:bg-accent hover:-translate-y-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_var(--border)] active:shadow-[1px_1px_0px_var(--border)] transition-all font-semibold font-mono">
              👨‍💼 Employee
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono text-center mb-5 -mt-2">← Click to auto-fill credentials</p>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input id="email" type="email" placeholder="you@nexahr.com" value={email}
                onChange={e => setEmail(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">Remember me</Label>
            </div>
            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 NexaHR · Enterprise HRMS Platform · v1.0.0
        </p>
      </div>
    </div>
  );
}
