import { format } from "date-fns";
import { Moon, Sun, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  dark: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ dark, toggleTheme }: NavbarProps) => {
  const { signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 liquid-glass-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold px-4 py-1.5 rounded-xl liquid-glass-inner text-foreground tracking-wide">Student Dashboard</h1>

        <span className="hidden sm:block text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="relative h-9 w-16 rounded-full liquid-glass-btn press-scale"
            aria-label="Toggle theme"
          >
            <motion.div
              className="absolute top-1 h-7 w-7 rounded-full gradient-bg flex items-center justify-center shadow-lg"
              animate={{ left: dark ? 32 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {dark ? (
                <Moon className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-primary-foreground" />
              )}
            </motion.div>
          </button>

          <button
            onClick={() => {
              console.log("Sign out clicked");
              signOut();
            }}
            className="h-9 w-9 rounded-full liquid-glass-btn flex items-center justify-center press-scale cursor-pointer relative z-[60]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-primary pointer-events-none" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
