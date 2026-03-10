import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Habit, today } from "@/lib/store";
import GlassCard from "@/components/GlassCard";

interface Props {
  habits: Habit[];
  setHabits: (h: Habit[]) => void;
}

const getLast7Days = () => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const dayLabel = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" }).charAt(0);
};

const HabitTracker = ({ habits, setHabits }: Props) => {
  const [name, setName] = useState("");
  const days = getLast7Days();

  const addHabit = () => {
    if (!name.trim()) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: name.trim(), streak: 0, completedDays: [] }]);
    setName("");
  };

  const toggleDay = (habitId: string, day: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== habitId) return h;
        const has = h.completedDays.includes(day);
        const completedDays = has ? h.completedDays.filter((d) => d !== day) : [...h.completedDays, day];
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          if (completedDays.includes(d.toISOString().split("T")[0])) streak++;
          else break;
        }
        return { ...h, completedDays, streak };
      })
    );
  };

  const deleteHabit = (id: string) => setHabits(habits.filter((h) => h.id !== id));

  return (
    <GlassCard delay={0.3}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <Target className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Habit Tracker</h3>
      </div>

      <div className="flex gap-2 mb-4 relative z-10">
        <Input
          placeholder="New habit..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          className=""
        />
        <Button size="icon" onClick={addHabit} className="shrink-0 h-10 w-10 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md reactive-hover shadow-md text-primary hover:text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide relative z-10">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl liquid-glass-inner group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{habit.name}</span>
                <div className="flex items-center gap-2">
                  {habit.streak > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass-btn shadow-md">
                      <Flame className="h-3 w-3 text-amber-500" strokeWidth={1.5} />
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{habit.streak}</span>
                    </motion.div>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-all duration-200 reactive-hover rounded-lg p-1">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5">
                {days.map((day) => {
                  const done = habit.completedDays.includes(day);
                  return (
                    <button key={day} onClick={() => toggleDay(habit.id, day)} className="flex flex-col items-center gap-1 press-scale">
                      <span className="text-[9px] text-muted-foreground font-medium">{dayLabel(day)}</span>
                      <motion.div
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.85 }}
                        className={`h-7 w-7 rounded-lg transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                          done ? "bg-primary/20 text-primary border border-primary/30 shadow-md" : "liquid-glass-btn shadow-sm"
                        }`}
                      >
                        {done && "✓"}
                      </motion.div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {habits.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Track your daily habits here!</p>
        )}
      </div>
    </GlassCard>
  );
};

export default HabitTracker;
