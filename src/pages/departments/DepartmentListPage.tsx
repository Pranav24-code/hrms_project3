import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, DollarSign, Edit, Trash2, ArrowRight } from 'lucide-react';
import { mockDepartments } from '@/constants/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

const deptColors = ['blue', 'violet', 'rose', 'amber', 'green', 'cyan', 'orange'] as const;
type DColor = typeof deptColors[number];
const colorMap: Record<DColor, string> = {
  blue: 'bg-blue-500/10 text-blue-600',
  violet: 'bg-violet-500/10 text-violet-600',
  rose: 'bg-rose-500/10 text-rose-600',
  amber: 'bg-amber-500/10 text-amber-600',
  green: 'bg-green-500/10 text-green-600',
  cyan: 'bg-cyan-500/10 text-cyan-600',
  orange: 'bg-orange-500/10 text-orange-600',
};

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = mockDepartments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Departments</h1>
          <p className="text-sm text-muted-foreground">{mockDepartments.length} departments · {mockDepartments.reduce((a, d) => a + d.employeeCount, 0)} total employees</p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => toast.success('Add department (demo)')}><Plus className="w-3.5 h-3.5" />Add Department</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input className="pl-9 h-8 text-sm" placeholder="Search departments…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((dept, i) => {
          const color = deptColors[i % deptColors.length];
          return (
            <div key={dept.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
              onClick={() => navigate(`/departments/${dept.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${colorMap[color]}`}>
                  {dept.code}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); toast.success('Edit (demo)'); }}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); toast.success('Delete (demo)'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{dept.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{dept.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{dept.managerName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <span className="truncate max-w-[90px]">{dept.managerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{dept.employeeCount}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(dept.budget / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
