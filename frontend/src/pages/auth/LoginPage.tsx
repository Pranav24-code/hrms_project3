import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
    <div className="min-h-screen bg-background flex">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Welcome back</h1>
            <p className="text-base text-muted-foreground">Sign in to your NexaHR account to manage your workforce</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input id="email" type="email" placeholder="you@nexahr.com" value={email}
                onChange={e => setEmail(e.target.value)} className="h-11 text-base" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} className="h-11 pr-10 text-base" />
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
            <Button type="submit" className="w-full h-11 font-semibold text-base" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>

          {/* Or continue with section */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Google */}
            <Button variant="outline" className="h-11 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </Button>
            {/* Microsoft */}
            <Button variant="outline" className="h-11 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
                <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
                <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
                <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
              </svg>
              <span className="hidden sm:inline">Microsoft</span>
            </Button>
            {/* Apple */}
            <Button variant="outline" className="h-11 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M16.462 0c.174 1.615-.47 3.21-1.386 4.378-.942 1.19-2.461 2.104-3.963 1.98-.21-1.573.51-3.196 1.393-4.278C13.43.93 15.03.07 16.462 0zm4.16 17.108c-.56 1.228-1.23 2.364-2.203 3.445-.824.91-1.853 1.82-3.164 1.837-1.28.016-1.693-.76-3.156-.752-1.462.009-1.907.77-3.197.786-1.29.016-2.37-.958-3.2-1.87C3.344 17.75 1.76 13.94 1.76 10.257c0-4.5 2.94-6.888 5.843-6.929 1.252-.018 2.56.843 3.362.843.8 0 2.303-.972 3.885-.826.664.028 2.527.27 3.724 2.03l-.063.04c-.623.4-2.28 1.675-2.26 4.01.022 2.796 2.125 3.96 2.145 3.97l-.064.067-.65-.354z"/>
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </Button>
          </div>

          {/* Informative text */}
          <p className="text-center text-xs text-muted-foreground mb-6 leading-relaxed">
            Join top HR professionals who rely on <strong>NexaHR</strong> to streamline talent management, payroll processing, and workforce analytics — trusted by 150+ enterprises.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2025 INFOTACT Solutions & Co. · Privacy Policy · Terms of Service · Support
          </p>
        </div>
      </div>

      {/* Right Section - Full Hero Image with Info Overlay */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src="/images/login-hero.png"
          alt="Professional workplace team"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlays for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>

        {/* Informative Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-8">
          {/* Top - Empty */}
          <div></div>

          {/* Bottom - Stats and Description */}
          <div className="space-y-6">
            {/* Main Heading */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Manage Your<br />
                <span className="text-primary">Workforce Smarter</span>
              </h2>
              <p className="text-white/90 text-sm leading-relaxed max-w-md">
                Experience the power of NexaHR — the trusted platform for HR teams looking to transform workforce management, automate payroll, and make data-driven decisions.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <p className="text-2xl font-bold text-primary">5,000+</p>
                <p className="text-white/80 text-xs mt-1">Employees Managed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">99.9%</p>
                <p className="text-white/80 text-xs mt-1">System Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">150+</p>
                <p className="text-white/80 text-xs mt-1">Enterprise Clients</p>
              </div>
            </div>

            {/* Trust Badge & Company Info */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span>👥 Trusted by HR teams worldwide</span>
              </div>
              <div className="text-right text-xs text-white/60">
                <p><strong>NexaHR</strong> · v2.5.1 · INFOTACT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

