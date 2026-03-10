import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  created_at: string;
}

const JournalHistory = ({ refreshKey }: { refreshKey: number }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setEntries((data as JournalEntry[]) || []);
      setLoading(false);
    };
    fetchEntries();
  }, [user, refreshKey]);

  return (
    <GlassCard delay={0.5} className="flex flex-col">
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <History className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Past Journals</h3>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full liquid-glass-inner text-muted-foreground font-medium">
          {entries.length} entries
        </span>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide relative z-10">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No journal entries yet. Start writing!</p>
        ) : (
          <AnimatePresence mode="popLayout">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl liquid-glass-inner cursor-pointer overflow-hidden"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary">
                        {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      {!isExpanded && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {entry.content}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    )}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <div className="px-3 pb-3">
                          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
};

export default JournalHistory;