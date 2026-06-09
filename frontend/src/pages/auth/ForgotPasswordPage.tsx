import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>NexaHR</span>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Check your email</h2>
              <p className="text-sm text-muted-foreground mb-6">We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login">
                <Button variant="outline" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Forgot password?</h1>
                <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@nexahr.com" className="pl-9 h-10"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Reset Link'}
                </Button>
                <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                  <ArrowLeft className="w-3.5 h-3.5" />Back to Sign In
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
