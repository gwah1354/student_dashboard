import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Timer, Coffee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PomodoroSession } from "@/lib/store";
import GlassCard from "@/components/GlassCard";
import confetti from "canvas-confetti";

interface Props {
  sessions: PomodoroSession[];
  setSessions: (s: PomodoroSession[]) => void;
}

const BREAK_TIME = 5 * 60;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER = Math.floor(VISIBLE_ITEMS / 2);

// Apple-style scroll wheel picker
const ScrollWheelPicker = ({
  value,
  onChange,
  min = 1,
  max = 60,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to value on mount and when value changes externally
  useEffect(() => {
    if (scrollRef.current && !isScrolling.current) {
      const idx = value - min;
      scrollRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [value, min]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    isScrolling.current = true;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const scrollTop = scrollRef.current.scrollTop;
      const idx = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIdx = Math.max(0, Math.min(idx, items.length - 1));

      // Snap to nearest item
      scrollRef.current.scrollTo({ top: clampedIdx * ITEM_HEIGHT, behavior: "smooth" });
      onChange(items[clampedIdx]);
      isScrolling.current = false;
    }, 80);
  };

  const getItemStyle = (idx: number) => {
    const scrollTop = scrollRef.current?.scrollTop || (value - min) * ITEM_HEIGHT;
    const itemCenter = idx * ITEM_HEIGHT + ITEM_HEIGHT / 2;
    const viewCenter = scrollTop + (VISIBLE_ITEMS * ITEM_HEIGHT) / 2;
    const distance = Math.abs(itemCenter - viewCenter) / ITEM_HEIGHT;
    const scale = Math.max(0.6, 1 - distance * 0.15);
    const opacity = Math.max(0.2, 1 - distance * 0.35);
    return { scale, opacity };
  };

  return (
    <div className="relative w-full" style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}>
      {/* Selection highlight */}
      <div
        className="absolute left-2 right-2 rounded-xl liquid-glass-inner pointer-events-none z-10"
        style={{
          top: CENTER * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
        }}
      />
      {/* Top/bottom fade masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent z-20 pointer-events-none rounded-t-xl" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent z-20 pointer-events-none rounded-b-xl" />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          paddingTop: CENTER * ITEM_HEIGHT,
          paddingBottom: CENTER * ITEM_HEIGHT,
        }}
      >
        {items.map((item, idx) => {
          const isSelected = item === value;
          return (
            <div
              key={item}
              className="flex items-center justify-center cursor-pointer"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: "center",
              }}
              onClick={() => {
                onChange(item);
                scrollRef.current?.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
              }}
            >
              <span
                className={`font-display tabular-nums transition-all duration-200 ${
                  isSelected
                    ? "text-2xl font-bold text-foreground"
                    : "text-lg font-medium text-muted-foreground/50"
                }`}
              >
                {String(item).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PomodoroTimer = ({ sessions, setSessions }: Props) => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startTimeLeftRef = useRef(25 * 60);
  const rafRef = useRef<number | null>(null);

  const focusTime = focusMinutes * 60;
  const total = mode === "focus" ? focusTime : BREAK_TIME;
  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  // Smooth progress via requestAnimationFrame
  useEffect(() => {
    if (running) {
      startTimeRef.current = performance.now();
      startTimeLeftRef.current = timeLeft;

      const tick = () => {
        if (!startTimeRef.current) return;
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        const currentTimeLeft = Math.max(0, startTimeLeftRef.current - elapsed);
        const progress = 1 - currentTimeLeft / total;
        setSmoothProgress(Math.min(1, Math.max(0, progress)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setSmoothProgress(1 - timeLeft / total);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, timeLeft, total]);

  const todaySessions = sessions.filter(
    (s) => s.completedAt.split("T")[0] === new Date().toISOString().split("T")[0] && s.type === "focus"
  );

  const playChime = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.8);
    });
  }, []);

  const completeSession = useCallback(() => {
    // Confetti burst
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['hsl(263,70%,62%)', 'hsl(330,80%,60%)', '#ffffff'] });
    // Soft chime
    playChime();

    setSessions([...sessions, { id: crypto.randomUUID(), completedAt: new Date().toISOString(), type: mode }]);
    if (mode === "focus") { setMode("break"); setTimeLeft(BREAK_TIME); }
    else { setMode("focus"); setTimeLeft(focusTime); }
    setRunning(false);
  }, [mode, sessions, setSessions, focusTime, playChime]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(intervalRef.current!); completeSession(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, completeSession]);

  const reset = () => {
    setRunning(false);
    setTimeLeft(mode === "focus" ? focusTime : BREAK_TIME);
  };

  const handleTimeChange = (mins: number) => {
    setFocusMinutes(mins);
    if (!running && mode === "focus") {
      setTimeLeft(mins * 60);
    }
  };

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - smoothProgress);

  return (
    <GlassCard delay={0.35} className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-6 self-start relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <Timer className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Pomodoro Timer</h3>
      </div>

      <div className="relative mb-6 z-10">
        <div className="absolute inset-[-12px] rounded-full liquid-glass-inner" />
        <svg width="160" height="160" viewBox="0 0 160 160" className="relative z-10">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="6" />
          <motion.circle cx="80" cy="80" r={radius} fill="none" stroke="url(#timer-gradient)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }} transition={{ duration: 0.3, ease: "linear" }} transform="rotate(-90 80 80)"
            style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.4))" }} />
          <motion.circle cx="80" cy="80" r={radius} fill="none" stroke="url(#timer-gradient)" strokeWidth="12"
            strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }} transition={{ duration: 0.3, ease: "linear" }} transform="rotate(-90 80 80)"
            opacity="0.15" style={{ filter: "blur(6px)" }} />
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ marginTop: "-6px" }}>
          <span className="font-display text-3xl font-bold tabular-nums text-foreground">
            {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-4 relative z-10">
        <Button
          size="sm"
          onClick={() => setRunning(!running)}
          className="w-28 h-9 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md reactive-hover shadow-md text-primary font-semibold hover:text-primary hover:bg-primary/10"
        >
          {running ? <Pause className="h-4 w-4 mr-1" strokeWidth={1.5} /> : <Play className="h-4 w-4 mr-1" strokeWidth={1.5} />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" onClick={reset} className="h-9 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md shadow-md text-muted-foreground hover:text-foreground hover:bg-muted/20">
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {/* Time picker toggle */}
      <button
        onClick={() => !running && setShowPicker(!showPicker)}
        disabled={running}
        className="mb-4 relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-btn text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
        {focusMinutes} min · Set Time
      </button>

      {/* Apple-style scroll wheel picker */}
      <AnimatePresence>
        {showPicker && !running && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: VISIBLE_ITEMS * ITEM_HEIGHT + 24 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full mb-4 relative z-10 overflow-hidden"
          >
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: "hsl(var(--background) / 0.25)",
                backdropFilter: "blur(30px) saturate(1.6)",
                WebkitBackdropFilter: "blur(30px) saturate(1.6)",
                border: "1px solid hsl(var(--foreground) / 0.06)",
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.08), 0 8px 24px hsl(0 0% 0% / 0.06)",
                padding: "12px 8px",
              }}
            >
              <div className="text-center mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Minutes</span>
              </div>
              <ScrollWheelPicker
                value={focusMinutes}
                onChange={handleTimeChange}
                min={1}
                max={60}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 relative z-10 px-4 py-2.5 rounded-xl liquid-glass-inner">
        <span className="text-xs font-medium text-muted-foreground">Sessions:</span>
        <div className="flex gap-2">
          {Array.from({ length: Math.max(todaySessions.length, 4) }).map((_, i) => (
            <motion.div
              key={i}
              initial={i < todaySessions.length ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`h-4 w-4 rounded-full transition-all duration-500 ${
                i < todaySessions.length
                  ? "bg-primary/30 border border-primary/40 shadow-md"
                  : "border-2 border-border/50 bg-background/30"
              }`}
              style={i < todaySessions.length ? { boxShadow: '0 0 8px hsl(var(--primary) / 0.3)' } : {}}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default PomodoroTimer;
