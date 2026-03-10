import { format } from "date-fns";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const GreetingHeader = () => {
  const { profile } = useAuth();
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const quote = quotes[dayOfYear % quotes.length];
  const displayName = profile?.display_name || "Student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      className="mb-8"
    >
      <h2 className="font-display text-3xl sm:text-4xl font-bold mb-1">
        {getGreeting()}, <span className="gradient-text">{displayName}</span>
      </h2>
      <p className="text-muted-foreground mb-3">
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-btn cursor-default"
      >
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm text-foreground/80 italic">"{quote.text}"</span>
        <span className="text-xs text-muted-foreground font-medium">— {quote.author}</span>
      </motion.div>
    </motion.div>
  );
};

export default GreetingHeader;
