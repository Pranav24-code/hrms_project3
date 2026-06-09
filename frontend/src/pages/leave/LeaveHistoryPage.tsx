import { useState } from 'react';
import { mockLeaveRequests } from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

export default function LeaveHistoryPage() {
  const [filter, setFilter] = useState('all');
  const leaves = mockLeaveRequests.filter(l => filter === 'all' || l.status === filter);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Leave History</h1>
          <p className="text-sm text-muted-foreground">View all your leave requests and their status</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', count: mockLeaveRequests.filter(l => l.status === 'pending').length, color: 'amber' },
          { label: 'Approved', count: mockLeaveRequests.filter(l => l.status === 'approved').length, color: 'green' },
          { label: 'Rejected', count: mockLeaveRequests.filter(l => l.status === 'rejected').length, color: 'red' },
        ].map(s => (
          <div key={s.label} className={cn("bg-card border rounded-xl p-4 text-center",
            s.color === 'amber' ? 'border-amber-500/20' : s.color === 'green' ? 'border-green-500/20' : 'border-red-500/20')}>
            <p className={cn("text-2xl font-bold", s.color === 'amber' ? 'text-amber-500' : s.color === 'green' ? 'text-green-500' : 'text-red-500')}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {leaves.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No leave requests found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaves.map(l => (
              <div key={l.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold capitalize">{l.leaveType} Leave</span>
                      <Badge variant="outline" className={cn("text-[10px] capitalize",
                        l.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        l.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20')}>{l.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{l.startDate} → {l.endDate} · <strong>{l.days} days</strong></p>
                    <p className="text-xs text-muted-foreground mt-1 italic">"{l.reason}"</p>
                    {l.approvalComments && <p className="text-xs text-primary mt-1">HR Comment: {l.approvalComments}</p>}
                  </div>
                  <p className="text-[10px] text-muted-foreground shrink-0">{new Date(l.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
