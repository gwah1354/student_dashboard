import { motion } from "framer-motion";
import { Heart, Smile, Sun, Meh, CloudRain, Moon } from "lucide-react";
import { MoodEntry, today } from "@/lib/store";
import GlassCard from "@/components/GlassCard";

interface Props {
  moods: MoodEntry[];
  setMoods: (m: MoodEntry[]) => void;
}

const moodOptions = [
  { key: "happy" as const, icon: Smile, label: "Happy", color: "text-emerald-500", selectedBg: "bg-emerald-500/15 border-emerald-500/25" },
  { key: "calm" as const, icon: Sun, label: "Calm", color: "text-sky-500", selectedBg: "bg-sky-500/15 border-sky-500/25" },
  { key: "neutral" as const, icon: Meh, label: "Neutral", color: "text-amber-500", selectedBg: "bg-amber-500/15 border-amber-500/25" },
  { key: "stressed" as const, icon: CloudRain, label: "Stressed", color: "text-orange-500", selectedBg: "bg-orange-500/15 border-orange-500/25" },
  { key: "tired" as const, icon: Moon, label: "Tired", color: "text-indigo-500", selectedBg: "bg-indigo-500/15 border-indigo-500/25" },
];

const moodGradients: Record<string, string> = {
  happy: "from-emerald-400/60 to-emerald-500/60",
  calm: "from-sky-400/60 to-sky-500/60",
  neutral: "from-amber-400/60 to-amber-500/60",
  stressed: "from-orange-400/60 to-red-400/60",
  tired: "from-indigo-400/60 to-purple-500/60",
};

const moodIconMap: Record<string, typeof Smile> = {
  happy: Smile, calm: Sun, neutral: Meh, stressed: CloudRain, tired: Moon,
};

const getLast7Days = () => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const MoodTracker = ({ moods, setMoods }: Props) => {
  const todayMood = moods.find((m) => m.date === today());
  const days = getLast7Days();

  const selectMood = (mood: MoodEntry["mood"]) => {
    const d = today();
    setMoods([...moods.filter((m) => m.date !== d), { date: d, mood }]);
  };

  return (
    <GlassCard delay={0.4}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <Heart className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Mood Tracker</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4 relative z-10">How are you feeling today?</p>

      <div className="flex justify-between gap-2 mb-6 relative z-10">
        {moodOptions.map((m) => {
          const Icon = m.icon;
          const isSelected = todayMood?.mood === m.key;
          return (
            <motion.button
              key={m.key}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectMood(m.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                isSelected ? `${m.selectedBg} shadow-lg` : "liquid-glass-btn"
              }`}
            >
              <Icon className={`h-6 w-6 ${m.color}`} strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="relative z-10">
        <p className="text-xs font-medium text-muted-foreground mb-2">This week</p>
        <div className="flex gap-1.5">
          {days.map((day) => {
            const entry = moods.find((m) => m.date === day);
            const MoodIcon = entry ? moodIconMap[entry.mood] : null;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">
                  {new Date(day + "T12:00:00").toLocaleDateString("en", { weekday: "short" }).charAt(0)}
                </span>
                <div className={`h-9 w-full rounded-lg flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                  entry ? `bg-gradient-to-b ${moodGradients[entry.mood]} shadow-md` : "liquid-glass-inner"
                }`}>
                  {MoodIcon && <MoodIcon className="h-4 w-4 text-foreground" strokeWidth={1.5} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default MoodTracker;
