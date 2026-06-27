import { useState, useEffect } from 'react';
import { Check, X, Clock, CheckCheck, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";
import { useSelector } from "react-redux";

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.auth.user);

  // Filters & Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentTab, setCurrentTab] = useState<LeaveStatus | 'all'>('pending');

  // Pagination states
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leave/all");
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leave database");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.put(`/leave/status/${id}`, {
        status,
        managerRemark: comments,
        approvedBy: user.id || user._id,
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

  const leaveBadge = (status: LeaveStatus) => {
    return status === 'approved'
      ? 'bg-green-500/10 text-green-600 border-green-500/20'
      : status === 'rejected'
      ? 'bg-red-500/10 text-red-600 border-red-500/20'
      : 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  };

  const handleToggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  // Filter & Sort requests
  const filteredLeaves = leaves.filter((l) => {
    const statusMatch = currentTab === 'all' || l.status === currentTab;
    const empName = l.employee?.name || 'Anonymous';
    const nameMatch = empName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (l.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = typeFilter === 'all' || l.leaveType === typeFilter;
    return statusMatch && nameMatch && typeMatch;
  });

  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    const timeA = new Date(a.startDate || a.createdAt).getTime();
    const timeB = new Date(b.startDate || b.createdAt).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  // Paginated leaves
  const totalPages = Math.max(1, Math.ceil(sortedLeaves.length / perPage));
  const paginatedLeaves = sortedLeaves.slice((page - 1) * perPage, page * perPage);

  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  const LeaveCard = ({ l }: { l: LeaveRequest }) => {
    const empName = l.employee?.name || 'Anonymous';
    const initials = empName.split(' ').map(n => n[0]).join('');

    return (
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all group">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 border border-border">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
              {initials || 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{empName}</span>
              <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5", leaveBadge(l.status))}>
                {l.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Employee ID: <span className="font-mono text-foreground font-semibold">{l.employeeId || 'N/A'}</span> · <span className="capitalize">{l.leaveType} Leave</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()} · <span className="font-bold text-foreground font-mono">{l.totalDays || l.days} day{(l.totalDays || l.days) > 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs italic text-muted-foreground mt-2 bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
              "{l.reason}"
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-[10px] text-muted-foreground font-mono">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}</p>
            {l.status === 'pending' && (
              <div className="flex gap-1.5 mt-1">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-7.5 w-7.5 border-green-500/30 text-green-600 hover:bg-green-500/10"
                  onClick={() => { setSelected(l); setAction('approve'); }}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-7.5 w-7.5 border-red-500/30 text-red-600 hover:bg-red-500/10"
                  onClick={() => { setSelected(l); setAction('reject'); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            {l.managerRemark && (
              <div className="mt-2 text-right max-w-[180px] bg-muted/20 p-2 rounded border border-border/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Manager Remark</p>
                <p className="text-[10px] text-foreground italic mt-0.5">"{l.managerRemark}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Leave Approvals</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Review, filter, and approve or reject employee leave requests</p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount, icon: Clock, color: 'amber', bg: 'bg-amber-500/10 text-amber-500' },
          { label: 'Approved', count: approvedCount, icon: CheckCheck, color: 'green', bg: 'bg-green-500/10 text-green-500' },
          { label: 'Rejected', count: rejectedCount, icon: X, color: 'red', bg: 'bg-red-500/10 text-red-500' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono leading-none">{s.count}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name or ID..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-36 text-xs bg-background border-border">
              <SelectValue placeholder="All Leave Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              <SelectItem value="annual">Annual Leave</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="maternity">Maternity Leave</SelectItem>
              <SelectItem value="paternity">Paternity Leave</SelectItem>
              <SelectItem value="unpaid">Unpaid Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleToggleSort} className="h-9 gap-1 text-xs font-semibold border-border">
            Date <ArrowUpDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={val => { setCurrentTab(val as any); setPage(1); }}>
        <TabsList className="bg-muted/50 border border-border/50 p-1">
          <TabsTrigger value="pending" className="text-xs font-semibold">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs font-semibold">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs font-semibold">Rejected ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="all" className="text-xs font-semibold">All Logs ({leaves.length})</TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-24 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
            </div>
          ) : paginatedLeaves.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-500" />
              <p className="text-xs text-muted-foreground font-semibold">No leave requests in this status</p>
            </div>
          ) : (
            paginatedLeaves.map(l => <LeaveCard key={l._id || l.id} l={l} />)
          )}
        </div>
      </Tabs>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl shadow-sm mt-4">
          <p className="text-xs text-muted-foreground">
            Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredLeaves.length)} of {filteredLeaves.length} requests
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs font-semibold border-border" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs font-semibold" onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs font-semibold border-border" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next<ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); setComments(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              {action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-muted/40 border border-border/80 rounded-lg p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground">
                  {selected.employee?.name || 'Anonymous'}
                </p>
                <p className="text-muted-foreground capitalize">{selected.leaveType} Leave · {selected.totalDays || selected.days} days</p>
                <p className="text-muted-foreground font-mono">{selected.startDate} → {selected.endDate}</p>
                <p className="text-muted-foreground italic mt-2">"{selected.reason}"</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Manager Remarks / Decision Comment</Label>
                <Textarea 
                  placeholder="Provide decision context (e.g., project coverage, approved coverer)..." 
                  className="min-h-[80px] text-xs resize-none" 
                  value={comments} 
                  onChange={e => setComments(e.target.value)} 
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="h-9 text-xs border-border" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button 
              size="sm" 
              className={cn("h-9 text-xs font-semibold", action === 'reject' ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/95")}
              onClick={() => selected && handleAction(selected._id, action === 'approve' ? 'approved' : 'rejected')}
            >
              {action === 'approve' ? 'Approve & Release' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
