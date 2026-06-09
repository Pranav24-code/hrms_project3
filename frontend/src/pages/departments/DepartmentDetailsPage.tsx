import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Edit } from 'lucide-react';
import { mockDepartments, mockEmployees } from '@/constants/mockData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DepartmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dept = mockDepartments.find(d => d.id === id) || mockDepartments[0];
  const employees = mockEmployees.filter(e => e.departmentId === dept.id);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate('/departments')}>
          <ArrowLeft className="w-3.5 h-3.5" />Departments
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{dept.name}</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {dept.code}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{dept.name}</h1>
              <p className="text-sm text-muted-foreground">{dept.description}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><Edit className="w-3.5 h-3.5" />Edit</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          {[
            { label: 'Department Head', value: dept.managerName, icon: Users },
            { label: 'Headcount', value: `${dept.employeeCount} employees`, icon: Users },
            { label: 'Annual Budget', value: `$${(dept.budget / 1000000).toFixed(1)}M`, icon: DollarSign },
            { label: 'Dept Code', value: dept.code, icon: null },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Team Members ({employees.length})</h3>
        </div>
        {employees.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">No employees found in this department.</div>
        ) : (
          <div className="divide-y divide-border">
            {employees.map(emp => (
              <div key={emp.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/employees/${emp.id}`)}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground">{emp.designation}</p>
                </div>
                <p className="text-xs text-muted-foreground hidden md:block font-mono">{emp.employeeId}</p>
                <Badge variant="outline" className={cn("text-[10px] capitalize",
                  emp.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                  emp.status === 'on_leave' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                  'bg-red-500/10 text-red-600 border-red-500/20'
                )}>{emp.status.replace('_',' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
