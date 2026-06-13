import { useState,useEffect } from 'react';
import { Check, X, Eye, Clock, Users, CheckCheck } from 'lucide-react';
import { mockLeaveRequests } from '@/constants/mockData';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";
import { useSelector } from "react-redux";


export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const user = useSelector((state: any) => state.auth.user);
const pending = leaves.filter(l => l.status === "Pending");
const approved = leaves.filter(l => l.status === "Approved");
const rejected = leaves.filter(l => l.status === "Rejected");
  

 const handleAction = async (
  id: string,
  status: "approved" | "rejected"
) => {
  try {
    await api.put(`/leave/status/${id}`, {
      status,
      managerRemark: comments,
      approvedBy: user._id, 
    });

    toast.success(`Leave ${status} successfully`);

    fetchLeaves();

    setSelected(null);
    setComments("");
    setAction(null);
  } catch (err) {
    toast.error("Something went wrong");
  }
};
  

  const leaveBadge = (status: LeaveStatus) => cn("text-[10px] capitalize",
    status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
    status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
    'bg-amber-500/10 text-amber-600 border-amber-500/20');

  const LeaveCard = ({ l }: { l: LeaveRequest }) => (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
            {`${l.employee?.firstName?.[0] ?? ""}${l.employee?.lastName?.[0] ?? ""}`}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">    {l.employee?.name}</span>
            <Badge variant="outline" className={leaveBadge(l.status)}>{l.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{l.department} · <span className="capitalize">{l.leaveType} Leave</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">{new Date(l.startDate).toLocaleDateString()} →
{new Date(l.endDate).toLocaleDateString()} · <strong>{l.totalDays} days</strong></p>
          <p className="text-xs italic text-muted-foreground mt-1.5 bg-muted/50 rounded px-2 py-1">"{l.reason}"</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</p>
          {l.status === 'pending' && (
            <div className="flex gap-1.5">
              <Button size="icon" variant="outline" className="h-7 w-7 border-green-500/40 text-green-600 hover:bg-green-500/10"
                onClick={() => { setSelected(l); setAction('approve'); }}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="outline" className="h-7 w-7 border-red-500/40 text-red-600 hover:bg-red-500/10"
                onClick={() => { setSelected(l); setAction('reject'); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          {l.managerRemark && (
  <p className="text-[10px] text-primary max-w-[150px] text-right italic">
    "{l.managerRemark}"
  </p>
)}
        </div>
      </div>
    </div>
  );


  useEffect(() => {
  fetchLeaves();
}, []);

const fetchLeaves = async () => {
  try {
    const res = await api.get("/leave/all");
    console.log(res.data);

    setLeaves(res.data.leaves);
  } catch (err) {
    console.log(err);
  }
};


  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Leave Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and manage employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', count: pending.length, icon: Clock, color: 'amber' },
          { label: 'Approved', count: approved.length, icon: CheckCheck, color: 'green' },
          { label: 'Rejected', count: rejected.length, icon: X, color: 'red' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                s.color === 'amber' ? 'bg-amber-500/10' : s.color === 'green' ? 'bg-green-500/10' : 'bg-red-500/10')}>
                <Icon className={cn("w-4.5 h-4.5", s.color === 'amber' ? 'text-amber-500' : s.color === 'green' ? 'text-green-500' : 'text-red-500')} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="text-xs">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? <p className="text-center py-10 text-muted-foreground text-sm">All caught up!</p>
            : pending.map(l => <LeaveCard key={l._id} l={l} />)}
        </TabsContent>
        <TabsContent value="approved" className="mt-4 space-y-3">
          {approved.map(l => <LeaveCard key={l._id} l={l} />)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejected.map(l => <LeaveCard key={l._id} l={l} />)}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); setComments(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
              {action === 'approve' ? '✅ Approve' : '❌ Reject'} Leave Request
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-semibold">
  {selected.employee?.firstName} {selected.employee?.lastName}
</p>
                <p className="text-muted-foreground capitalize">{selected.leaveType} Leave · {selected.totalDays}  days</p>
                <p className="text-muted-foreground">{selected.startDate} → {selected.endDate}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Comments (optional)</Label>
                <Textarea placeholder="Add a note for the employee…" className="min-h-[80px] text-sm resize-none" value={comments} onChange={e => setComments(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button size="sm" className={cn("h-8 text-xs", action === 'reject' ? "bg-destructive hover:bg-destructive/90" : "")}
              onClick={() => selected && handleAction(selected._id, action === 'approve' ? 'approved' : 'rejected')}>
              {action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
