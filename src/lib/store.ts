import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: string[];
}

export interface MoodEntry {
  date: string;
  mood: "happy" | "calm" | "neutral" | "stressed" | "tired";
}

export interface Event {
  id: string;
  name: string;
  date: string;
}

export interface PomodoroSession {
  id: string;
  completedAt: string;
  type: "focus" | "break";
}

export const today = () => new Date().toISOString().split("T")[0];

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasksState] = useState<Task[]>([]);
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) { console.error("Fetch tasks error:", error); return; }
      if (data) {
        const mapped = data.map(t => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          priority: t.priority as Task["priority"],
          createdAt: t.created_at,
        }));
        setTasksState(mapped);
        tasksRef.current = mapped;
      }
    };
    fetch();
  }, [user?.id]);

  const setTasks = useCallback(async (newTasks: Task[]) => {
    if (!user) return;
    const oldTasks = tasksRef.current;
    setTasksState(newTasks);
    tasksRef.current = newTasks;

    const currentIds = newTasks.map(t => t.id);
    const oldIds = oldTasks.map(t => t.id);

    const deletedIds = oldIds.filter(id => !currentIds.includes(id));
    if (deletedIds.length > 0) {
      await supabase.from("tasks").delete().in("id", deletedIds);
    }

    for (const task of newTasks) {
      const { error } = await supabase.from("tasks").upsert({
        id: task.id,
        user_id: user.id,
        text: task.text,
        completed: task.completed,
        priority: task.priority,
        created_at: task.createdAt,
      });
      if (error) console.error("Upsert task error:", error);
    }
  }, [user?.id]);

  return [tasks, setTasks] as const;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const habitsRef = useRef<Habit[]>([]);
  habitsRef.current = habits;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);
      if (error) { console.error("Fetch habits error:", error); return; }
      if (data) {
        const mapped = data.map(h => ({
          id: h.id,
          name: h.name,
          streak: h.streak,
          completedDays: h.completed_days || [],
        }));
        setHabitsState(mapped);
        habitsRef.current = mapped;
      }
    };
    fetch();
  }, [user?.id]);

  const setHabits = useCallback(async (newHabits: Habit[]) => {
    if (!user) return;
    const oldHabits = habitsRef.current;
    setHabitsState(newHabits);
    habitsRef.current = newHabits;

    const currentIds = newHabits.map(h => h.id);
    const oldIds = oldHabits.map(h => h.id);
    const deletedIds = oldIds.filter(id => !currentIds.includes(id));
    if (deletedIds.length > 0) {
      await supabase.from("habits").delete().in("id", deletedIds);
    }

    for (const habit of newHabits) {
      const { error } = await supabase.from("habits").upsert({
        id: habit.id,
        user_id: user.id,
        name: habit.name,
        streak: habit.streak,
        completed_days: habit.completedDays,
      });
      if (error) console.error("Upsert habit error:", error);
    }
  }, [user?.id]);

  return [habits, setHabits] as const;
}

export function useMoodLog() {
  const { user } = useAuth();
  const [moods, setMoodsState] = useState<MoodEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) { console.error("Fetch moods error:", error); return; }
      if (data) {
        setMoodsState(data.map(m => ({ date: m.date, mood: m.mood as MoodEntry["mood"] })));
      }
    };
    fetch();
  }, [user?.id]);

  const setMoods = useCallback(async (newMoods: MoodEntry[]) => {
    if (!user) return;
    setMoodsState(newMoods);

    const todayMood = newMoods.find(m => m.date === today());
    if (todayMood) {
      const { error } = await supabase.from("moods").upsert({
        user_id: user.id,
        date: todayMood.date,
        mood: todayMood.mood,
      }, { onConflict: "user_id,date" });
      if (error) console.error("Upsert mood error:", error);
    }
  }, [user?.id]);

  return [moods, setMoods] as const;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEventsState] = useState<Event[]>([]);
  const eventsRef = useRef<Event[]>([]);
  eventsRef.current = events;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      if (error) { console.error("Fetch events error:", error); return; }
      if (data) {
        const mapped = data.map(e => ({ id: e.id, name: e.name, date: e.date }));
        setEventsState(mapped);
        eventsRef.current = mapped;
      }
    };
    fetch();
  }, [user?.id]);

  const setEvents = useCallback(async (newEvents: Event[]) => {
    if (!user) return;
    const oldEvents = eventsRef.current;
    setEventsState(newEvents);
    eventsRef.current = newEvents;

    const currentIds = newEvents.map(e => e.id);
    const oldIds = oldEvents.map(e => e.id);
    const deletedIds = oldIds.filter(id => !currentIds.includes(id));
    if (deletedIds.length > 0) {
      await supabase.from("events").delete().in("id", deletedIds);
    }

    for (const event of newEvents) {
      const { error } = await supabase.from("events").upsert({
        id: event.id,
        user_id: user.id,
        name: event.name,
        date: event.date,
      });
      if (error) console.error("Upsert event error:", error);
    }
  }, [user?.id]);

  return [events, setEvents] as const;
}

export function usePomodoroSessions() {
  const { user } = useAuth();
  const [sessions, setSessionsState] = useState<PomodoroSession[]>([]);
  const sessionsRef = useRef<PomodoroSession[]>([]);
  sessionsRef.current = sessions;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (error) { console.error("Fetch sessions error:", error); return; }
      if (data) {
        const mapped = data.map(s => ({
          id: s.id,
          completedAt: s.completed_at,
          type: s.type as PomodoroSession["type"],
        }));
        setSessionsState(mapped);
        sessionsRef.current = mapped;
      }
    };
    fetch();
  }, [user?.id]);

  const setSessions = useCallback(async (newSessions: PomodoroSession[]) => {
    if (!user) return;
    const oldSessions = sessionsRef.current;
    setSessionsState(newSessions);
    sessionsRef.current = newSessions;

    const oldIds = oldSessions.map(s => s.id);
    const added = newSessions.filter(s => !oldIds.includes(s.id));
    for (const session of added) {
      const { error } = await supabase.from("pomodoro_sessions").insert({
        id: session.id,
        user_id: user.id,
        completed_at: session.completedAt,
        type: session.type,
      });
      if (error) console.error("Insert session error:", error);
    }
  }, [user?.id]);

  return [sessions, setSessions] as const;
}

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("studentos-theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("studentos-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}
