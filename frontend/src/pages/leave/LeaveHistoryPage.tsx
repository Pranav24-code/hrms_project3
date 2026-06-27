import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarDays, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import api from '@/utils/api';

export default function LeaveHistoryPage() {
  const user = useSelector((state: any) => state.auth.user);
  
  // States
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchMyLeaves();
  }, [user]);

  const fetchMyLeaves = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/leave/my/${user.id}`);
      setLeaves(res.data.leaves || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch = (l.leaveType || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (l.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort leaves (by startDate or createdAt)
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    const dateA = new Date(a.startDate || a.createdAt).getTime();
    const dateB = new Date(b.startDate || b.createdAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Paginate leaves
  const totalPages = Math.ceil(sortedLeaves.length / perPage);
  const paginatedLeaves = sortedLeaves.slice((page - 1) * perPage, page * perPage);

  // Stats
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Leave History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">View all your submitted leave requests and approval remarks</p>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount, color: 'amber', bg: 'border-amber-500/20 bg-amber-500/5' },
          { label: 'Approved', count: approvedCount, color: 'green', bg: 'border-green-500/20 bg-green-500/5' },
          { label: 'Rejected', count: rejectedCount, color: 'red', bg: 'border-red-500/20 bg-red-500/5' },
        ].map(s => (
          <div key={s.label} className={cn("bg-card border rounded-xl p-4 text-center shadow-sm", s.bg)}>
            <p className={cn("text-2xl font-bold font-mono leading-none", 
              s.color === 'amber' ? 'text-amber-500' : 
              s.color === 'green' ? 'text-green-500' : 'text-red-500'
            )}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by leave type or reason..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-32 text-xs border-border bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleToggleSort} className="h-9 gap-1 text-xs font-semibold border-border">
            Date <ArrowUpDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ) : paginatedLeaves.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-xs text-muted-foreground">No leave requests found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedLeaves.map(l => (
              <div key={l._id || l.id} className="p-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold capitalize text-foreground">{l.leaveType} Leave</span>
                      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5",
                        l.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        l.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}>{l.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {l.startDate} → {l.endDate} · <span className="font-bold text-foreground font-mono">{l.totalDays || l.days} day{ (l.totalDays || l.days) > 1 ? 's' : '' }</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic font-medium">
                      "{l.reason}"
                    </p>
                    {l.managerRemark && (
                      <div className="mt-3 p-2.5 rounded bg-muted/40 border border-border/60 text-xs">
                        <span className="font-semibold text-foreground block">Approver Remark:</span>
                        <span className="text-muted-foreground mt-0.5 block">{l.managerRemark}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredLeaves.length)} of {filteredLeaves.length} logs
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs font-semibold border-border" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs font-semibold" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs font-semibold border-border" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next<ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
