import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Event } from "@/lib/store";
import GlassCard from "@/components/GlassCard";
import { cn } from "@/lib/utils";

interface Props {
  events: Event[];
  setEvents: (e: Event[]) => void;
}

const UpcomingEvents = ({ events, setEvents }: Props) => {
  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const addEvent = () => {
    if (!name.trim() || !selectedDate) return;
    setEvents([...events, { id: crypto.randomUUID(), name: name.trim(), date: format(selectedDate, "yyyy-MM-dd") }]);
    setName("");
    setSelectedDate(undefined);
  };

  const deleteEvent = (id: string) => setEvents(events.filter((e) => e.id !== id));

  const sorted = [...events]
    .filter((e) => new Date(e.date) >= new Date(new Date().toISOString().split("T")[0]))
    .sort((a, b) => a.date.localeCompare(b.date));

  const getDateBadge = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return { text: "Today", cls: "bg-primary/15 text-primary border border-primary/25 shadow-sm" };
    if (isTomorrow(d)) return { text: "Tomorrow", cls: "bg-accent/15 text-accent border border-accent/25 shadow-sm" };
    return null;
  };

  return (
    <GlassCard delay={0.5}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <CalendarIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Upcoming Events</h3>
      </div>

      <div className="flex gap-2 mb-4 relative z-10">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 min-w-[120px] rounded-lg liquid-glass-btn border-0 px-3 text-xs cursor-pointer shadow-md btn-pop",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" strokeWidth={1.5} />
              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 border-0 bg-transparent shadow-none" 
            align="start"
            sideOffset={8}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "hsl(var(--background) / 0.6)",
                backdropFilter: "blur(30px) saturate(1.8)",
                WebkitBackdropFilter: "blur(30px) saturate(1.8)",
                border: "1px solid hsl(var(--glass-border))",
                boxShadow: "0 20px 60px hsl(0 0% 0% / 0.15), 0 8px 24px hsl(0 0% 0% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Button size="icon" onClick={addEvent} className="shrink-0 h-10 w-10 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md reactive-hover shadow-md text-primary hover:text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide relative z-10">
        <AnimatePresence mode="popLayout">
          {sorted.map((event) => {
            const badge = getDateBadge(event.date);
            return (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-3 rounded-xl liquid-glass-inner group">
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(event.date), "MMM d, yyyy")}</p>
                </div>
                {badge && <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.text}</span>}
                <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 transition-all duration-200 press-scale reactive-hover rounded-lg p-1">
                  <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {sorted.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No upcoming events</p>}
      </div>
    </GlassCard>
  );
};

export default UpcomingEvents;