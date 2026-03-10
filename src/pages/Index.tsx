import { useState } from "react";
import Navbar from "@/components/Navbar";
import GreetingHeader from "@/components/GreetingHeader";
import TaskManager from "@/components/TaskManager";
import HabitTracker from "@/components/HabitTracker";
import MoodTracker from "@/components/MoodTracker";
import UpcomingEvents from "@/components/UpcomingEvents";
import PomodoroTimer from "@/components/PomodoroTimer";
import JournalWriter from "@/components/JournalWriter";
import JournalHistory from "@/components/JournalHistory";
import AIChatAssistant from "@/components/AIChatAssistant";
import {
  useTasks,
  useHabits,
  useMoodLog,
  useEvents,
  usePomodoroSessions,
  useTheme,
} from "@/lib/store";

const Index = () => {
  const [tasks, setTasks] = useTasks();
  const [habits, setHabits] = useHabits();
  const [moods, setMoods] = useMoodLog();
  const [events, setEvents] = useEvents();
  const [sessions, setSessions] = usePomodoroSessions();
  const [dark, setDark] = useTheme();
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background ambient-bg">
      <Navbar dark={dark} toggleTheme={() => setDark(!dark)} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <GreetingHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskManager tasks={tasks} setTasks={setTasks} />
          </div>
          <PomodoroTimer sessions={sessions} setSessions={setSessions} />
          <HabitTracker habits={habits} setHabits={setHabits} />
          <MoodTracker moods={moods} setMoods={setMoods} />
          <UpcomingEvents events={events} setEvents={setEvents} />
          <div className="lg:col-span-2">
            <JournalWriter onSaved={() => setJournalRefreshKey((k) => k + 1)} />
          </div>
          <JournalHistory refreshKey={journalRefreshKey} />
        </div>
      </main>

      <AIChatAssistant />
    </div>
  );
};

export default Index;