import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from "@/utils/api";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "Employee"
      });
      
      setSuccess("Account created successfully. You can now login.");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Create an Account</h1>
            <p className="text-sm text-muted-foreground">Sign up as an Employee</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" value={name}
                onChange={e => setName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input id="email" type="email" placeholder="you@nexahr.com" value={email}
                onChange={e => setEmail(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              </div>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Create a password"
                  value={password} onChange={e => setPassword(e.target.value)} className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</> : 'Sign Up'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 NexaHR · Enterprise HRMS Platform · v1.0.0
        </p>
      </div>
    </div>
  );
}
