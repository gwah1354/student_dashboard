import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, today } from "@/lib/store";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
}

interface Suggestion {
  text: string;
  priority: "low" | "medium" | "high";
}

const priorityColors = {
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-sm",
  high: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shadow-sm",
};

const TaskManager = ({ tasks, setTasks }: Props) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { session } = useAuth();

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([
      ...tasks,
      { id: crypto.randomUUID(), text: text.trim(), completed: false, priority, createdAt: today() },
    ]);
    setText("");
  };

  const addSuggestion = (suggestion: Suggestion) => {
    setTasks([
      ...tasks,
      { id: crypto.randomUUID(), text: suggestion.text, completed: false, priority: suggestion.priority, createdAt: today() },
    ]);
    setSuggestions(prev => prev.filter(s => s.text !== suggestion.text));
    toast.success("Task added!");
  };

  const fetchSuggestions = async () => {
    if (loadingSuggestions) return;
    setLoadingSuggestions(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "suggest",
          tasks: tasks.map(t => ({ text: t.text, priority: t.priority, completed: t.completed })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get suggestions");
      }

      const data = await resp.json();
      setSuggestions(data.suggestions || []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoadingSuggestions(false);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    const todayItems = updated.filter(t => t.createdAt === today());
    if (todayItems.length > 0 && todayItems.every((t) => t.completed)) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const todayTasks = tasks.filter((t) => t.createdAt === today());

  return (
    <GlassCard delay={0.2}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <ListTodo className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Today's Tasks</h3>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full liquid-glass-inner text-muted-foreground font-medium">
          {todayTasks.filter((t) => t.completed).length}/{todayTasks.length}
        </span>
      </div>

      <div className="flex gap-2 mb-4 relative z-10">
        <Input
          placeholder="Add a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className=""
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
          <SelectTrigger className="h-10 w-[110px] shrink-0 rounded-lg liquid-glass-btn border-0 px-2.5 text-xs cursor-pointer shadow-md btn-pop focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-0 bg-transparent shadow-none p-0 min-w-[100px]">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "hsl(var(--background) / 0.6)",
                backdropFilter: "blur(30px) saturate(1.8)",
                WebkitBackdropFilter: "blur(30px) saturate(1.8)",
                border: "1px solid hsl(var(--glass-border))",
                boxShadow: "0 20px 60px hsl(0 0% 0% / 0.15), 0 8px 24px hsl(0 0% 0% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <SelectItem value="low" className="cursor-pointer text-xs font-medium hover:bg-primary/10 focus:bg-primary/10 rounded-lg mx-1 my-0.5 transition-all duration-200">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Low
                </span>
              </SelectItem>
              <SelectItem value="medium" className="cursor-pointer text-xs font-medium hover:bg-primary/10 focus:bg-primary/10 rounded-lg mx-1 my-0.5 transition-all duration-200">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="high" className="cursor-pointer text-xs font-medium hover:bg-primary/10 focus:bg-primary/10 rounded-lg mx-1 my-0.5 transition-all duration-200">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High
                </span>
              </SelectItem>
            </div>
          </SelectContent>
        </Select>
        <Button size="icon" onClick={addTask} className="shrink-0 h-10 w-10 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md reactive-hover shadow-md text-primary hover:text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {/* AI Suggest Button */}
      <div className="mb-4 relative z-10">
        <Button
          onClick={fetchSuggestions}
          disabled={loadingSuggestions}
          className="w-full h-9 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md text-primary font-medium hover:bg-primary/10 shadow-md text-sm"
        >
          {loadingSuggestions ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
          )}
          AI Suggest Tasks
        </Button>
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 relative z-10"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Suggestions
              </span>
              <button onClick={() => setSuggestions([])} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => addSuggestion(s)}
                className="w-full flex items-center gap-3 p-3 rounded-xl liquid-glass-inner hover:bg-primary/5 transition-colors text-left group"
              >
                <Plus className="h-4 w-4 text-primary shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                <span className="flex-1 text-sm font-medium text-foreground">{s.text}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityColors[s.priority]}`}>
                  {s.priority}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide relative z-10">
        <AnimatePresence mode="popLayout">
          {todayTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-3 p-3 rounded-xl liquid-glass-inner group"
            >
              <button onClick={() => toggleTask(task.id)} className="press-scale reactive-hover rounded-full">
                {task.completed ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                    <CheckCircle2 className="h-5 w-5 text-primary drop-shadow-sm" strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>
              <span className={`flex-1 text-sm font-medium transition-all duration-300 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.text}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 press-scale reactive-hover rounded-lg p-1"
              >
                <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {todayTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No tasks yet. Add one above!</p>
        )}
      </div>
    </GlassCard>
  );
};

export default TaskManager;
