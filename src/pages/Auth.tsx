import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const getErrorMessage = (error: { message: string }) => {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) return "Invalid email or password. Please try again.";
    if (msg.includes("user already registered")) return "An account with this email already exists. Try signing in.";
    if (msg.includes("password") && msg.includes("least")) return "Password must be at least 6 characters.";
    if (msg.includes("email")) return "Please enter a valid email address.";
    return error.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name.trim() || "Student" },
        },
      });
      if (error) {
        toast.error(getErrorMessage(error));
      } else if (data.session) {
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        toast.success("Check your email to verify your account before signing in.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle 800px at 30% 20%, hsl(var(--primary) / 0.35) 0%, transparent 50%),
              radial-gradient(circle 600px at 70% 80%, hsl(var(--accent) / 0.30) 0%, transparent 50%),
              radial-gradient(circle 500px at 80% 20%, hsl(280 70% 60% / 0.20) 0%, transparent 45%),
              radial-gradient(circle 400px at 20% 70%, hsl(200 80% 60% / 0.15) 0%, transparent 40%),
              hsl(var(--background))
            `,
          }}
        />
        {/* Floating orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)", top: "10%", left: "15%" }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.10) 0%, transparent 70%)", bottom: "10%", right: "10%" }}
          animate={{ x: [0, -25, 15, 0], y: [0, 20, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main glass card */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "hsl(var(--background) / 0.25)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid hsl(var(--foreground) / 0.08)",
            boxShadow: `
              0 32px 64px hsl(0 0% 0% / 0.12),
              0 16px 32px hsl(0 0% 0% / 0.08),
              0 4px 16px hsl(0 0% 0% / 0.04),
              inset 0 1px 0 hsl(0 0% 100% / 0.12),
              inset 0 -1px 0 hsl(0 0% 0% / 0.04)
            `,
          }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top highlight */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.2), transparent)" }}
          />
          {/* Shine gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 50%, hsl(0 0% 100% / 0.03) 100%)",
            }}
          />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-foreground">
                Student Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Welcome back. Sign in to continue." : "Create your account to get started."}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name input (signup only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="relative rounded-2xl overflow-hidden"
                    animate={{
                      scale: nameFocused ? 1.02 : 1,
                      boxShadow: nameFocused
                        ? "0 0 0 2px hsl(var(--primary) / 0.25), 0 8px 24px hsl(0 0% 0% / 0.08)"
                        : "0 2px 8px hsl(0 0% 0% / 0.04)",
                    }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: "hsl(var(--background) / 0.3)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid hsl(var(--foreground) / 0.06)",
                    }}
                  >
                    <div className="flex items-center px-4">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        className="w-full h-12 px-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm outline-none"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Email input */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden"
                  animate={{
                    scale: emailFocused ? 1.02 : 1,
                    boxShadow: emailFocused
                      ? "0 0 0 2px hsl(var(--primary) / 0.25), 0 8px 24px hsl(0 0% 0% / 0.08)"
                      : "0 2px 8px hsl(0 0% 0% / 0.04)",
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: "hsl(var(--background) / 0.3)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid hsl(var(--foreground) / 0.06)",
                  }}
                >
                  <div className="flex items-center px-4">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="w-full h-12 px-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm outline-none"
                      required
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Password input */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden"
                  animate={{
                    scale: passwordFocused ? 1.02 : 1,
                    boxShadow: passwordFocused
                      ? "0 0 0 2px hsl(var(--primary) / 0.25), 0 8px 24px hsl(0 0% 0% / 0.08)"
                      : "0 2px 8px hsl(0 0% 0% / 0.04)",
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: "hsl(var(--background) / 0.3)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid hsl(var(--foreground) / 0.06)",
                  }}
                >
                  <div className="flex items-center px-4">
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full h-12 px-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm outline-none"
                      required
                      minLength={6}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-12 rounded-2xl font-semibold text-sm text-primary-foreground overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  }}
                  whileHover={{
                    scale: 1.06,
                    y: -3,
                    boxShadow: "0 16px 40px hsl(var(--primary) / 0.35), 0 8px 20px hsl(var(--accent) / 0.25)",
                  }}
                  whileTap={{ scale: 0.97, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {/* Button shine */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, hsl(0 0% 100% / 0.2) 0%, transparent 50%)",
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary font-medium">{isLogin ? "Sign up" : "Sign in"}</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
