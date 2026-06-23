import { useState } from 'react';
import { User, Shield, Bell, Palette, Save, Loader2, Eye, EyeOff, Camera } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const user = useSelector((state: any) => state.auth.user);
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: user?.phone || '',
    designation: user?.designation || '', department: user?.department || '',
  });
  const [notifications, setNotifications] = useState({
    leaveUpdates: true, payrollUpdates: true, announcements: true, systemAlerts: false, emailDigest: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="w-3.5 h-3.5" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1.5"><Palette className="w-3.5 h-3.5" />Appearance</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all shadow-md">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold">{profile.firstName} {profile.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')} · {profile.department}</p>
                <button className="text-xs text-primary hover:underline mt-1">Change photo</button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">First Name</Label><Input className="h-9" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Last Name</Label><Input className="h-9" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input className="h-9" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input className="h-9" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Designation</Label><Input value={profile.designation} readOnly className="h-9 bg-muted/50 cursor-not-allowed" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Department</Label><Input value={profile.department} readOnly className="h-9 bg-muted/50 cursor-not-allowed" /></div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={save} disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : <><Save className="w-3.5 h-3.5" />Save Changes</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Change Password</h3>
              <div className="space-y-4 max-w-sm">
                <div className="space-y-1.5"><Label className="text-xs">Current Password</Label>
                  <div className="relative"><Input type={showOld ? 'text' : 'password'} className="h-9 pr-10" placeholder="Enter current password" />
                    <button onClick={() => setShowOld(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">New Password</Label>
                  <div className="relative"><Input type={showNew ? 'text' : 'password'} className="h-9 pr-10" placeholder="Min. 8 characters" />
                    <button onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Confirm New Password</Label><Input type="password" className="h-9" placeholder="Re-enter new password" /></div>
                <Button size="sm" className="h-8 text-xs" onClick={() => toast.success('Password changed (demo)')}>Update Password</Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-1">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security to your account.</p>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg max-w-sm">
                <div>
                  <p className="text-sm font-medium">Authenticator App</p>
                  <p className="text-xs text-muted-foreground">Use TOTP app for 2FA</p>
                </div>
                <Switch onCheckedChange={() => toast.success('2FA toggled (demo)')} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold mb-2">Notification Preferences</h3>
            {[
              { key: 'leaveUpdates', label: 'Leave Updates', desc: 'Get notified when your leave requests are approved or rejected' },
              { key: 'payrollUpdates', label: 'Payroll Updates', desc: 'Receive alerts when your payslip is available' },
              { key: 'announcements', label: 'HR Announcements', desc: 'Company-wide announcements and policy updates' },
              { key: 'systemAlerts', label: 'System Alerts', desc: 'Security and system maintenance notifications' },
              { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Receive a weekly summary of all activities' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={v => setNotifications(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={save} disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : <><Save className="w-3.5 h-3.5" />Save</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold">Theme Preference</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button key={t} onClick={() => { setTheme(t); document.documentElement.classList.toggle('dark', t === 'dark'); toast.success(`Theme: ${t}`); }}
                  className={cn("border-2 rounded-xl p-4 text-center transition-all capitalize",
                    theme === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                  <div className={cn("w-full h-12 rounded-lg mb-2 border border-border", t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-white to-slate-800')} />
                  <p className="text-xs font-medium capitalize">{t}</p>
                  {theme === t && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mx-auto mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
