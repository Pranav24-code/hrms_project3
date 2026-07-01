import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});

const EVENT_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    const fetchCalendarLeaves = async () => {
      try {
        const res = await api.get('/leave/calendar');
        const leaves = res.data.leaves || [];

        // Map leaves to react-big-calendar event format
        const calendarEvents = leaves.map((leave: any, idx: number) => ({
          id: leave._id,
          title: `${leave.employee?.name || 'Employee'} — ${leave.leaveType} leave`,
          start: new Date(leave.startDate),
          end: new Date(leave.endDate),
          resource: leave,
          color: EVENT_COLORS[idx % EVENT_COLORS.length],
        }));

        setEvents(calendarEvents);
      } catch {
        toast.error('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarLeaves();
  }, []);

  const eventStyleGetter = (event: any) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '6px',
      border: 'none',
      color: '#fff',
      fontSize: '12px',
      padding: '2px 6px',
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Company Calendar</h1>
        <p className="text-sm text-muted-foreground">View approved leaves and company events</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden p-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div style={{ height: 620 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              date={date}
              view={view}
              onNavigate={setDate}
              onView={(v) => setView(v)}
              eventPropGetter={eventStyleGetter}
              popup
              style={{ height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      {!loading && events.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Leaves on Calendar</p>
          <div className="flex flex-wrap gap-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                <span className="text-muted-foreground">{ev.resource?.employee?.name}</span>
                <span className="text-foreground font-medium capitalize">({ev.resource?.leaveType})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
