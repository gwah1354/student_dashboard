import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Target, Timer, TrendingUp } from "lucide-react";
import { Task, Habit, PomodoroSession, today } from "@/lib/store";
import GlassCard from "@/components/GlassCard";

interface Props {
  tasks: Task[];
  habits: Habit[];
  sessions: PomodoroSession[];
}

const StatCard = ({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string | number; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="p-4 rounded-xl liquid-glass-inner flex items-center gap-3"
  >
    <div className="h-10 w-10 rounded-xl liquid-glass-inner flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
    </div>
  </motion.div>
);

const ProductivityAnalytics = ({ tasks, habits, sessions }: Props) => {
  const todayStr = today();
  const completedTasks = tasks.filter((t) => t.createdAt === todayStr && t.completed).length;
  const habitRate = habits.length > 0
    ? Math.round((habits.filter((h) => h.completedDays.includes(todayStr)).length / habits.length) * 100) : 0;
  const todaySessions = sessions.filter((s) => s.completedAt.split("T")[0] === todayStr && s.type === "focus").length;

  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }).charAt(0),
      total: tasks.filter((t) => t.createdAt === iso && t.completed).length +
             sessions.filter((s) => s.completedAt.split("T")[0] === iso && s.type === "focus").length,
    };
  });
  const maxVal = Math.max(...weekData.map((d) => d.total), 1);

  return (
    <GlassCard delay={0.45}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Productivity</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <StatCard icon={CheckCircle2} label="Tasks done" value={completedTasks} delay={0.5} />
        <StatCard icon={Target} label="Habit rate" value={`${habitRate}%`} delay={0.6} />
        <StatCard icon={Timer} label="Focus sessions" value={todaySessions} delay={0.7} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-1 mb-3">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs font-medium text-muted-foreground">This week</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.total / maxVal) * 100, 5)}%` }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full rounded-lg bg-primary/20 border border-primary/25 relative overflow-hidden"
                style={{ minHeight: 4, boxShadow: '0 2px 8px hsl(var(--primary) / 0.15)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary/10 rounded-lg" />
              </motion.div>
              <span className="text-[9px] font-medium text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductivityAnalytics;
