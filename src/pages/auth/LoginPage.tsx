import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IMAGES } from '@/assets/images';

/* @section: login-page */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
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

  const stats = [
    { value: '5,000+', label: 'Employees Managed', color: '#22c55e' },
    { value: '99.9%',  label: 'System Uptime',     color: '#22c55e' },
    { value: '150+',   label: 'Enterprise Clients', color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── LEFT PANEL: Form ── */}
      {/* @section: left-form-panel */}
      <div className="flex-1 flex flex-col bg-white min-h-screen overflow-y-auto">

        {/* Top logo bar */}
        {/* @section: top-logo-bar */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
              <span className="text-[11px] text-gray-400 block leading-none tracking-wide">ENTERPRISE PORTAL</span>
            </div>
          </div>
        </div>

        {/* Form content centered */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-[400px]">

            {/* @section: welcome-heading */}
            {/* Welcome text */}
            <div className="mb-7">
              <h1 className="text-[1.65rem] font-bold text-gray-900 mb-1.5" style={{ fontFamily: 'Sora, sans-serif' }}>
                Welcome to NexaHR!
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {activeTab === 'signin'
                  ? "Let's get you signed in to manage your workforce."
                  : "Create your account to start your journey with NexaHR."}
              </p>
            </div>

            {/* @section: tab-toggle */}
            {/* Sign In / Sign Up toggle */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('signin')}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
                style={activeTab === 'signin'
                  ? { background: '#1a56db', color: '#fff', boxShadow: '0 2px 8px rgba(26,86,219,0.3)' }
                  : { background: 'transparent', color: '#9ca3af' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
                style={activeTab === 'signup'
                  ? { background: '#1a56db', color: '#fff', boxShadow: '0 2px 8px rgba(26,86,219,0.3)' }
                  : { background: 'transparent', color: '#9ca3af' }}
              >
                Sign Up
              </button>
            </div>

            {/* @section: demo-tiles */}
            {/* Demo quick-access */}
            <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-2">Quick Demo Access</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDemo('hr')}
                  className="flex-1 text-xs py-2 px-3 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700 text-left"
                >
                  <span className="block text-[10px] text-blue-500 font-semibold mb-0.5">HR MANAGER</span>
                  hr@nexahr.com
                </button>
                <button
                  onClick={() => setDemo('employee')}
                  className="flex-1 text-xs py-2 px-3 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700 text-left"
                >
                  <span className="block text-[10px] text-indigo-500 font-semibold mb-0.5">EMPLOYEE</span>
                  john.doe@nexahr.com
                </button>
              </div>
            </div>

            {/* @section: error-alert */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* @section: login-form */}
            {/* Main form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password <span className="text-red-400">*</span>
                  </Label>
                  <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 pr-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <Button
                type="submit"
                className="w-full h-11 font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                  boxShadow: '0 4px 14px rgba(26,86,219,0.35)',
                }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Authenticating...</>
                  : activeTab === 'signin' ? 'Sign In' : 'Create Account'
                }
              </Button>
            </form>

            {/* @section: social-divider */}
            {/* Or continue with */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* @section: social-logins */}
            {/* Social login buttons */}
            <div className="flex gap-3 mb-6">
              {/* Google */}
              <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              {/* Microsoft */}
              <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
                  <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
                  <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
                  <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
                </svg>
                Microsoft
              </button>
              {/* Apple */}
              <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-800" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* @section: value-prop-footer */}
            {/* Value proposition */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Join top HR professionals who rely on <span className="font-semibold text-gray-600">NexaHR</span> to streamline
              talent management, payroll processing, and workforce analytics — trusted by 150+ enterprises.
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        {/* @section: left-footer */}
        <div className="px-8 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center">
            © 2025 <span className="font-semibold text-gray-600">INFOTACT Solutions & Co.</span> ·{' '}
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a> ·{' '}
            <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a> ·{' '}
            <a href="#" className="hover:text-blue-500 transition-colors">Support</a>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Photo + Overlay ── */}
      {/* @section: right-photo-panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-shrink-0">

        {/* Full-bleed background photo */}
        <img
          src={IMAGES.OFFICE_TEAM_1}
          alt="Professional team"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient overlay — transparent at top, dark at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,22,40,0.18) 0%, rgba(10,22,40,0.35) 40%, rgba(5,15,30,0.85) 75%, rgba(5,15,30,0.97) 100%)',
          }}
        />

        {/* Top-right status badge */}
        {/* @section: right-status-badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 z-10 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/90 text-[11px] font-medium">All Systems Live</span>
        </div>

        {/* Bottom content overlay */}
        {/* @section: right-overlay-content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-10">

          {/* Headline */}
          <h2
            className="text-white font-extrabold leading-tight mb-4"
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(1.75rem, 2.8vw, 2.4rem)' }}
          >
            Manage Your<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa 0%, #93c5fd 60%, #bfdbfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Workforce Smarter
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-[420px]">
            Experience the power of NexaHR — the trusted platform for HR teams looking to
            transform workforce management, automate payroll, and make data-driven decisions.
          </p>

          {/* @section: stats-row */}
          {/* Statistics row */}
          <div className="flex items-center gap-8 pt-6 border-t border-white/15">
            {stats.map(({ value, label, color }) => (
              <div key={label}>
                <div
                  className="font-extrabold text-2xl leading-none mb-1"
                  style={{ fontFamily: 'Sora, sans-serif', color }}
                >
                  {value}
                </div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
            ))}
            <div className="ml-auto flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-blue-400" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
                </svg>
                <span>Trusted by HR teams worldwide</span>
              </div>
              <div
                className="text-[11px] font-mono text-blue-400/80"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                NexaHR · v2.5.1 · INFOTACT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
