import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const JournalWriter = ({ onSaved }: { onSaved: () => void }) => {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const saveJournal = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("journals").insert({
      user_id: user.id,
      content: content.trim(),
    });
    if (error) console.error("Journal save error:", error);
    setSaving(false);
    if (error) {
      toast.error("Failed to save journal");
      return;
    }
    toast.success("Journal saved!");
    setContent("");
    onSaved();
  };

  return (
    <GlassCard delay={0.45} className="flex flex-col">
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="h-8 w-8 rounded-xl liquid-glass-inner flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Daily Journal</h3>
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your day? What did you learn? What are you grateful for?"
          className="flex-1 min-h-[140px] w-full rounded-xl p-4 text-sm leading-relaxed resize-none bg-background/80 backdrop-blur-sm border border-border/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 shadow-[0_3px_12px_hsl(var(--foreground)/0.1),0_1px_4px_hsl(var(--foreground)/0.06)] hover:shadow-[0_6px_24px_hsl(var(--primary)/0.18),0_3px_10px_hsl(var(--foreground)/0.1)] hover:border-primary/50 hover:-translate-y-0.5 placeholder:text-muted-foreground/50"
        />
        <Button
          onClick={saveJournal}
          disabled={!content.trim() || saving}
          className="self-end h-9 px-5 rounded-lg liquid-glass-btn border-0 bg-transparent backdrop-blur-md text-primary font-medium hover:bg-primary/10 shadow-md text-sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
          )}
          Save Entry
        </Button>
      </div>
    </GlassCard>
  );
};

export default JournalWriter;