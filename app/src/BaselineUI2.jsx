import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  Moon,
  Sun,
  Terminal,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  BookOpen,
  Activity,
  Settings,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Flame,
  Coffee,
  Check,
  RotateCcw,
  ArrowUpRight,
  Timer,
  Sliders,
  ListTodo,
  LogOut,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

// --- Utilities ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DAYS_SHORT = ["Su", "M", "T", "W", "Th", "F", "S"];
const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SPLITS = [
  "Push / Pull / Legs",
  "Upper / Lower",
  "Full Body",
  "Custom Split",
];

function addMinutes(timeStr, minsToAdd) {
  if (!timeStr) return "00:00";
  let [h, m] = timeStr.split(":").map(Number);
  m += minsToAdd;
  h += Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getDurationString(startStr, endStr) {
  let startMins = timeToMinutes(startStr);
  let endMins = timeToMinutes(endStr);
  let diff = endMins - startMins;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getCurrentTimeString() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

const DEFAULT_CONFIG = {
  commitments: [
    {
      id: "c1",
      title: "Algorithms & Distributed Systems",
      type: "Academic",
      days: ["M", "W", "F"],
      startTime: "09:30",
      endTime: "11:00",
    },
    {
      id: "c2",
      title: "Core Architecture Sync & Standup",
      type: "Work",
      days: ["M", "T", "W", "Th", "F"],
      startTime: "11:30",
      endTime: "12:30",
    },
    {
      id: "c3",
      title: "Engineering Sprint Execution",
      type: "Work",
      days: ["M", "T", "W", "Th", "F"],
      startTime: "14:00",
      endTime: "16:30",
    },
  ],
  training: {
    split: "Push / Pull / Legs",
    workoutDays: ["M", "T", "Th", "F", "S"],
    durationMinutes: 75,
    preferredTime: "17:15",
  },
  recovery: {
    targetBedtime: "23:15",
    targetWakeTime: "07:00",
    codingBlockMinutes: 120,
    codingStartTime: "19:30",
  },
};

// --- Ambient Particle Background ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.5 ? "rgba(139, 92, 246, " : "rgba(6, 182, 212, ",
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};

// ==========================================
// AUTHENTICATION & LOGIN SCREEN
// ==========================================
function mapAuthError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    default:
      return error?.message || "Authentication failed. Try again.";
  }
}

function LoginScreen() {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email.trim());
        setResetSent(true);
      } else if (isCreateAccount) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-xs w-fit mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span>MIND-LIFE TIMETABLE OS</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isForgotPassword
              ? "Reset Password"
              : isCreateAccount
                ? "Create Account"
                : "Sign In"}
          </h2>
        </div>
        <p className="text-xs font-mono text-zinc-400 mb-8">
          {isForgotPassword
            ? "Enter your email to receive a secure recovery link."
            : isCreateAccount
              ? "Provision a new protocol identity with email and password."
              : "Authenticate to access your daily time-block protocol."}
        </p>

        {resetSent ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-xs font-mono text-emerald-300">
                Recovery email sent. Check your inbox for the secure link.
              </p>
            </div>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
              }}
              className="w-full px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-mono text-xs font-bold transition-all"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@protocol.os"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      isCreateAccount ? "new-password" : "current-password"
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                {!isCreateAccount && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError("");
                      }}
                      className="text-[11px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
              {submitting
                ? "Processing..."
                : isForgotPassword
                  ? "Send Recovery Link"
                  : isCreateAccount
                    ? "Create Account"
                    : "Sign In"}
            </button>
          </form>
        )}

        {!resetSent && (
          <button
            type="button"
            onClick={() => {
              if (isForgotPassword) {
                setIsForgotPassword(false);
              } else {
                setIsCreateAccount((v) => !v);
              }
              setError("");
            }}
            className="w-full mt-5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            {isForgotPassword
              ? "Remember your password? Sign In"
              : isCreateAccount
                ? "Already have an account? Sign In"
                : "Need an identity? Create Account"}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT ROOT
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const cfgSnap = await getDoc(
            doc(db, "users", nextUser.uid, "config", "main"),
          );
          if (!cfgSnap.exists()) {
            setCurrentView("onboarding");
          }
        } catch (e) {
          console.error("Failed to check user config:", e);
        }
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] font-sans selection:bg-violet-500/30 text-zinc-100 relative overflow-x-hidden">
      <ParticleBackground />

      {/* Ambient background glow orbs */}
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-violet-600/10 to-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tl from-cyan-500/10 to-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-5%] w-[35vw] h-[35vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {authLoading ? (
          <motion.div
            key="auth-loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen flex items-center justify-center relative z-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="font-mono text-sm text-zinc-400">
                Authenticating session...
              </p>
            </div>
          </motion.div>
        ) : !user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <LoginScreen />
          </motion.div>
        ) : currentView === "onboarding" ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <MasterSetupWizard
              user={user}
              onComplete={() => setCurrentView("dashboard")}
              onCancel={() => setCurrentView("dashboard")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <TimeblockTimetableDashboard
              user={user}
              onConfigure={() => setCurrentView("onboarding")}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 1. TIME-BLOCK TIMETABLE DASHBOARD (FIRESTORE)
// ==========================================
function TimeblockTimetableDashboard({ user, onConfigure, onLogout }) {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [currentSeconds, setCurrentSeconds] = useState(new Date().getSeconds());
  const [tasksMap, setTasksMap] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    type: "DeepWork",
    startTime: "13:00",
    endTime: "14:00",
    notes: "",
  });

  const todayIndex = new Date().getDay();
  const isSelectedDayToday = selectedDayIndex === todayIndex;

  // Real-time clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      );
      setCurrentSeconds(now.getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fetch User Config from Firestore
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function loadConfig() {
      try {
        const cfgRef = doc(db, "users", user.uid, "config", "main");
        const cfgSnap = await getDoc(cfgRef);
        if (cfgSnap.exists()) {
          if (isMounted) setConfig(cfgSnap.data());
        } else {
          await setDoc(cfgRef, DEFAULT_CONFIG);
          if (isMounted) setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error("Error loading config from Firestore:", err);
        if (isMounted) setConfig(DEFAULT_CONFIG);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    }

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch or Generate Daily Tasks from Firestore
  useEffect(() => {
    if (!user || !config) return;
    let isMounted = true;

    async function loadDayTasks() {
      setLoadingTasks(true);
      const dayShort = DAYS_SHORT[selectedDayIndex];
      const taskDocRef = doc(
        db,
        "users",
        user.uid,
        "dailyTasks",
        String(selectedDayIndex),
      );

      try {
        const taskSnap = await getDoc(taskDocRef);
        if (taskSnap.exists() && taskSnap.data().tasks) {
          if (isMounted) {
            setTasksMap((prev) => ({
              ...prev,
              [selectedDayIndex]: taskSnap.data().tasks,
            }));
            setLoadingTasks(false);
          }
          return;
        }

        // Generate schedule from config
        const generatedTasks = [];

        // Circadian Wake
        const wakeTime = config.recovery?.targetWakeTime || "07:00";
        generatedTasks.push({
          id: "morning-routine",
          title: "Circadian Wakeup & Morning Protocol",
          type: "Routine",
          startTime: wakeTime,
          endTime: addMinutes(wakeTime, 45),
          completed: false,
          notes: "Hydration, light exposure, cold plunge/shower, planning",
        });

        // Commitments
        (config.commitments || []).forEach((c) => {
          if (c.days.includes(dayShort)) {
            generatedTasks.push({
              id: c.id,
              title: c.title,
              type: c.type,
              startTime: c.startTime,
              endTime: c.endTime,
              completed: false,
              notes: `${c.type} priority session`,
            });
          }
        });

        // Training
        if ((config.training?.workoutDays || []).includes(dayShort)) {
          const trainStart = config.training.preferredTime || "17:15";
          const trainEnd = addMinutes(
            trainStart,
            config.training.durationMinutes || 60,
          );
          generatedTasks.push({
            id: "training",
            title: `${config.training.split || "Physical"} Regimen`,
            type: "Training",
            startTime: trainStart,
            endTime: trainEnd,
            completed: false,
            notes: `Intensity focus • ${config.training.durationMinutes || 60} min session`,
          });
        }

        // Deep Work
        const codeStart = config.recovery?.codingStartTime || "19:30";
        const codeEnd = addMinutes(
          codeStart,
          config.recovery?.codingBlockMinutes || 120,
        );
        generatedTasks.push({
          id: "deep-work",
          title: "Deep Focus Engineering Block",
          type: "DeepWork",
          startTime: codeStart,
          endTime: codeEnd,
          completed: false,
          notes: "High-leverage development, zero distractions, flow state",
        });

        // Recovery
        const bedtime = config.recovery?.targetBedtime || "23:15";
        generatedTasks.push({
          id: "sleep",
          title: "Circadian Wind-Down & Sleep Block",
          type: "Recovery",
          startTime: bedtime,
          endTime: "23:59",
          completed: false,
          notes: "Dim blue light, magnesium, read, restful sleep cycle",
        });

        generatedTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Save generated day to Firestore
        await setDoc(taskDocRef, { tasks: generatedTasks });

        if (isMounted) {
          setTasksMap((prev) => ({
            ...prev,
            [selectedDayIndex]: generatedTasks,
          }));
          setLoadingTasks(false);
        }
      } catch (err) {
        console.error("Error loading day tasks from Firestore:", err);
        if (isMounted) setLoadingTasks(false);
      }
    }

    loadDayTasks();
    return () => {
      isMounted = false;
    };
  }, [selectedDayIndex, config, user]);

  const currentDayTasks = useMemo(() => {
    return tasksMap[selectedDayIndex] || [];
  }, [tasksMap, selectedDayIndex]);

  // Save changes to Firestore and update local state
  const persistTasks = async (updated) => {
    setTasksMap((prev) => ({ ...prev, [selectedDayIndex]: updated }));
    if (!user) return;
    try {
      const taskDocRef = doc(
        db,
        "users",
        user.uid,
        "dailyTasks",
        String(selectedDayIndex),
      );
      await setDoc(taskDocRef, { tasks: updated });
    } catch (err) {
      console.error("Error syncing tasks to Firestore:", err);
    }
  };

  const toggleTask = (taskId) => {
    const updated = currentDayTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    persistTasks(updated);
  };

  const deleteTask = (taskId) => {
    const updated = currentDayTasks.filter((t) => t.id !== taskId);
    persistTasks(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const taskToAdd = {
      id: `task_${Date.now()}`,
      title: newTask.title.trim(),
      type: newTask.type,
      startTime: newTask.startTime,
      endTime: newTask.endTime,
      notes: newTask.notes.trim(),
      completed: false,
    };

    const updated = [...currentDayTasks, taskToAdd].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );

    persistTasks(updated);
    setNewTask({
      title: "",
      type: "DeepWork",
      startTime: "13:00",
      endTime: "14:00",
      notes: "",
    });
    setIsAddModalOpen(false);
  };

  const handleResetProgress = () => {
    const reset = currentDayTasks.map((t) => ({ ...t, completed: false }));
    persistTasks(reset);
  };

  // Productivity Score Calculation
  const actionableTasks = useMemo(() => {
    return currentDayTasks.filter((t) => t.type !== "Recovery");
  }, [currentDayTasks]);

  const completedCount = useMemo(() => {
    return actionableTasks.filter((t) => t.completed).length;
  }, [actionableTasks]);

  const productivityScore = useMemo(() => {
    if (actionableTasks.length === 0) return 100;
    return Math.round((completedCount / actionableTasks.length) * 100);
  }, [completedCount, actionableTasks.length]);

  const totalPlannedMinutes = useMemo(() => {
    return actionableTasks.reduce((acc, t) => {
      let diff = timeToMinutes(t.endTime) - timeToMinutes(t.startTime);
      if (diff < 0) diff += 24 * 60;
      return acc + diff;
    }, 0);
  }, [actionableTasks]);

  const completedMinutes = useMemo(() => {
    return actionableTasks
      .filter((t) => t.completed)
      .reduce((acc, t) => {
        let diff = timeToMinutes(t.endTime) - timeToMinutes(t.startTime);
        if (diff < 0) diff += 24 * 60;
        return acc + diff;
      }, 0);
  }, [actionableTasks]);

  const currentActiveTask = useMemo(() => {
    if (!isSelectedDayToday) return null;
    return currentDayTasks.find((task) => {
      return currentTime >= task.startTime && currentTime < task.endTime;
    });
  }, [currentDayTasks, currentTime, isSelectedDayToday]);

  const activeRemainingMins = useMemo(() => {
    if (!currentActiveTask) return 0;
    const nowMins = timeToMinutes(currentTime);
    const endMins = timeToMinutes(currentActiveTask.endTime);
    let diff = endMins - nowMins;
    if (diff < 0) diff += 24 * 60;
    return diff;
  }, [currentActiveTask, currentTime]);

  const getCategoryStyles = (type, isCurrent) => {
    switch (type) {
      case "DeepWork":
        return {
          icon: <Terminal className="w-4 h-4 text-emerald-400" />,
          badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          glow: "border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.25)] bg-emerald-950/20",
          accentColor: "#10b981",
          tag: "Deep Work",
        };
      case "Academic":
        return {
          icon: <BookOpen className="w-4 h-4 text-violet-400" />,
          badge: "bg-violet-500/10 text-violet-300 border-violet-500/30",
          glow: "border-violet-500/60 shadow-[0_0_35px_rgba(139,92,246,0.25)] bg-violet-950/20",
          accentColor: "#8b5cf6",
          tag: "Academic",
        };
      case "Work":
        return {
          icon: <Activity className="w-4 h-4 text-blue-400" />,
          badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
          glow: "border-blue-500/60 shadow-[0_0_35px_rgba(59,130,246,0.25)] bg-blue-950/20",
          accentColor: "#3b82f6",
          tag: "Work / Sync",
        };
      case "Training":
        return {
          icon: <Dumbbell className="w-4 h-4 text-cyan-400" />,
          badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
          glow: "border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-cyan-950/20",
          accentColor: "#06b6d4",
          tag: "Training",
        };
      case "Recovery":
        return {
          icon: <Moon className="w-4 h-4 text-indigo-400" />,
          badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
          glow: "border-indigo-500/60 shadow-[0_0_35px_rgba(99,102,241,0.25)] bg-indigo-950/20",
          accentColor: "#6366f1",
          tag: "Recovery & Sleep",
        };
      case "Routine":
      default:
        return {
          icon: <Sun className="w-4 h-4 text-amber-400" />,
          badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          glow: "border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] bg-amber-950/20",
          accentColor: "#f59e0b",
          tag: "Routine",
        };
    }
  };

  const getScoreStatus = (score) => {
    if (score === 100)
      return {
        label: "Peak Execution",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
      };
    if (score >= 75)
      return {
        label: "High Velocity Flow",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10 border-cyan-500/30",
      };
    if (score >= 50)
      return {
        label: "Building Momentum",
        color: "text-violet-400",
        bg: "bg-violet-500/10 border-violet-500/30",
      };
    return {
      label: "Protocol In Progress",
      color: "text-zinc-400",
      bg: "bg-zinc-800/40 border-zinc-700/40",
    };
  };

  const statusObj = getScoreStatus(productivityScore);

  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-mono text-xs text-zinc-400">
            Syncing Cloud Protocol...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 relative z-10 space-y-8">
      {/* HEADER & SCORE SECTION */}
      <header className="relative overflow-hidden rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span>MIND-LIFE TIMETABLE OS</span>
              </div>
              <span className="text-zinc-500 text-xs font-mono">
                {DAYS_FULL[selectedDayIndex]}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Daily Time-Block Protocol
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-white font-bold">{currentTime}</span>
                <span className="text-zinc-500">
                  :{currentSeconds.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {isSelectedDayToday && currentActiveTask && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Current: <strong>{currentActiveTask.title}</strong> (
                    {activeRemainingMins}m left)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Productivity Score Gauge */}
          <div className="w-full lg:w-80 bg-black/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Productivity Score
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                    {productivityScore}%
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    ({completedCount}/{actionableTasks.length} Done)
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono border font-semibold",
                  statusObj.bg,
                  statusObj.color,
                )}
              >
                {statusObj.label}
              </div>
            </div>

            <div className="h-3 w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${productivityScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  productivityScore === 100
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_20px_rgba(16,185,129,0.7)]"
                    : productivityScore >= 50
                      ? "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
                )}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-3 pt-2 border-t border-white/5">
              <span>
                Focus Time:{" "}
                <strong className="text-zinc-200">
                  {Math.round((completedMinutes / 60) * 10) / 10}h
                </strong>{" "}
                / {Math.round((totalPlannedMinutes / 60) * 10) / 10}h
              </span>
              <button
                onClick={handleResetProgress}
                className="hover:text-white transition-colors flex items-center gap-1 text-zinc-500"
                title="Reset completion checkboxes for today"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto max-w-full">
            {DAYS_SHORT.map((day, idx) => {
              const isToday = idx === todayIndex;
              const isSelected = idx === selectedDayIndex;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={cn(
                    "relative px-3 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0",
                    isSelected
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                  )}
                >
                  {isToday && (
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected
                          ? "bg-cyan-300 animate-ping"
                          : "bg-violet-400",
                      )}
                    />
                  )}
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Block</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfigure}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 text-xs font-mono font-semibold transition-all"
            >
              <Settings className="w-4 h-4 text-violet-400" />
              <span>OS Settings</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono font-semibold transition-all"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
              <span>Log Out</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ACTIVE BLOCK BANNER */}
      {isSelectedDayToday && currentActiveTask && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/30 to-cyan-950/40 border border-violet-500/40 p-5 shadow-[0_0_40px_rgba(139,92,246,0.25)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 shrink-0 mt-0.5">
                <Flame className="w-6 h-6 text-violet-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500 text-white uppercase tracking-wider">
                    ACTIVE NOW
                  </span>
                  <span className="text-xs font-mono text-violet-300">
                    {currentActiveTask.startTime} — {currentActiveTask.endTime}{" "}
                    (
                    {getDurationString(
                      currentActiveTask.startTime,
                      currentActiveTask.endTime,
                    )}
                    )
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {currentActiveTask.title}
                </h3>
                {currentActiveTask.notes && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentActiveTask.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <div className="text-right font-mono">
                <div className="text-xs text-zinc-400">Time Remaining</div>
                <div className="text-lg font-bold text-cyan-300">
                  {activeRemainingMins} mins
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTask(currentActiveTask.id)}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all",
                  currentActiveTask.completed
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-white text-zinc-950 hover:bg-zinc-200 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]",
                )}
              >
                {currentActiveTask.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Completed!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Block</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* FULL TIMETABLE SCHEDULE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              Schedule Timeline ({currentDayTasks.length} Blocks)
            </h2>
          </div>

          <div className="text-xs font-mono text-zinc-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Deep Work
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Training
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400" /> Academic
            </span>
          </div>
        </div>

        {loadingTasks ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-3xl">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-zinc-500 text-xs font-mono mt-3">
              Loading Blocks from Cloud...
            </p>
          </div>
        ) : currentDayTasks.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/10 rounded-3xl">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">
              No Blocks Scheduled
            </h3>
            <p className="text-zinc-400 text-xs mt-1 max-w-sm mx-auto">
              No tasks or commitments are configured for{" "}
              {DAYS_FULL[selectedDayIndex]}.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-mono font-bold hover:bg-zinc-200 transition-all"
            >
              + Add First Block
            </button>
          </div>
        ) : (
          <div className="relative pl-4 sm:pl-8 space-y-4 before:absolute before:left-[1.35rem] sm:before:left-[2.35rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-violet-500/50 before:via-cyan-500/30 before:to-indigo-500/20">
            {currentDayTasks.map((task, idx) => {
              const isCurrent =
                isSelectedDayToday &&
                currentTime >= task.startTime &&
                currentTime < task.endTime;
              const style = getCategoryStyles(task.type, isCurrent);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={cn(
                    "relative group flex items-start gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-300",
                    isCurrent
                      ? cn("scale-[1.01] z-20", style.glow)
                      : task.completed
                        ? "bg-zinc-900/20 border-white/[0.04] opacity-65"
                        : "bg-zinc-900/50 border-white/[0.08] hover:border-white/20 hover:bg-zinc-900/70",
                  )}
                >
                  <div
                    className={cn(
                      "absolute -left-[1.65rem] sm:-left-[2.65rem] top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isCurrent
                        ? "bg-violet-600 border-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.8)] scale-125"
                        : task.completed
                          ? "bg-emerald-600 border-emerald-400"
                          : "bg-zinc-950 border-zinc-700 group-hover:border-zinc-500",
                    )}
                  >
                    {task.completed ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    )}
                  </div>

                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "mt-1 p-1 rounded-lg transition-all shrink-0",
                      task.completed
                        ? "text-emerald-400 hover:text-emerald-300"
                        : isCurrent
                          ? "text-violet-400 hover:text-white"
                          : "text-zinc-600 hover:text-zinc-300",
                    )}
                    aria-label={`Toggle task completion for ${task.title}`}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Square className="w-6 h-6 stroke-[1.5]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold",
                            isCurrent
                              ? "bg-violet-500/20 text-violet-200 border border-violet-500/40"
                              : "bg-black/40 text-zinc-400 border border-white/5",
                          )}
                        >
                          {task.startTime} — {task.endTime}
                        </span>

                        <span className="text-[11px] font-mono text-zinc-500">
                          • {getDurationString(task.startTime, task.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1.5",
                            style.badge,
                          )}
                        >
                          {style.icon}
                          <span>{style.tag}</span>
                        </span>

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-600 text-white uppercase tracking-wider animate-pulse">
                            Current Block
                          </span>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 p-1 transition-opacity"
                          title="Delete this block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3
                      className={cn(
                        "text-lg font-semibold tracking-tight transition-all",
                        task.completed
                          ? "line-through text-zinc-500 font-normal"
                          : isCurrent
                            ? "text-white font-bold"
                            : "text-zinc-200",
                      )}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p
                        className={cn(
                          "text-xs mt-1",
                          task.completed ? "text-zinc-600" : "text-zinc-400",
                        )}
                      >
                        {task.notes}
                      </p>
                    )}

                    {isCurrent && (
                      <div className="mt-3 pt-3 border-t border-violet-500/20 flex items-center justify-between text-xs font-mono text-violet-300">
                        <span className="flex items-center gap-2">
                          <Timer className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                          <span>
                            {activeRemainingMins} minutes remaining in block
                          </span>
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {task.completed
                            ? "Marked as completed"
                            : "Click checkbox to finish"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK ADD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Add Time Block
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Schedule for {DAYS_FULL[selectedDayIndex]}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                    Task / Block Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems Lab / Workout"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      Category
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) =>
                        setNewTask({ ...newTask, type: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                    >
                      <option value="DeepWork">Deep Work</option>
                      <option value="Academic">Academic</option>
                      <option value="Work">Work / Sync</option>
                      <option value="Training">Training</option>
                      <option value="Routine">Routine</option>
                      <option value="Recovery">Recovery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      Notes / Focus Target
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 4, 3 sets bench"
                      value={newTask.notes}
                      onChange={(e) =>
                        setNewTask({ ...newTask, notes: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newTask.startTime}
                      onChange={(e) =>
                        setNewTask({ ...newTask, startTime: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newTask.endTime}
                      onChange={(e) =>
                        setNewTask({ ...newTask, endTime: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-zinc-400 hover:text-white font-mono text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all"
                  >
                    Save Time Block
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. MASTER SETUP WIZARD (FIRESTORE SYNC)
// ==========================================
function MasterSetupWizard({ user, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [commitments, setCommitments] = useState(DEFAULT_CONFIG.commitments);
  const [training, setTraining] = useState(DEFAULT_CONFIG.training);
  const [recovery, setRecovery] = useState(DEFAULT_CONFIG.recovery);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function fetchUserConfig() {
      try {
        const cfgSnap = await getDoc(
          doc(db, "users", user.uid, "config", "main"),
        );
        if (cfgSnap.exists()) {
          const data = cfgSnap.data();
          if (isMounted) {
            if (data.commitments) setCommitments(data.commitments);
            if (data.training) setTraining(data.training);
            if (data.recovery) setRecovery(data.recovery);
          }
        }
      } catch (err) {
        console.error("Error fetching wizard config from Firestore:", err);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    }

    fetchUserConfig();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setStep(4);

    try {
      if (user) {
        // Save Master Configuration
        await setDoc(doc(db, "users", user.uid, "config", "main"), {
          commitments,
          training,
          recovery,
        });

        // Clear existing generated daily tasks so they re-synthesize cleanly
        const clearPromises = DAYS_SHORT.map((_, idx) =>
          setDoc(doc(db, "users", user.uid, "dailyTasks", String(idx)), {
            tasks: null,
          }),
        );
        await Promise.all(clearPromises);
      }
    } catch (err) {
      console.error("Error saving synthesized protocol:", err);
    } finally {
      setTimeout(() => {
        setIsSynthesizing(false);
      }, 1200);
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative z-10">
      <div className="w-full max-w-2xl bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono text-violet-400 uppercase tracking-widest">
              Protocol Configuration
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {step === 1 && "1. Academic & Fixed Commitments"}
              {step === 2 && "2. Physical Training Baseline"}
              {step === 3 && "3. Circadian Recovery & Deep Work"}
              {step === 4 && "4. Protocol Synthesis"}
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10"
          >
            Exit to Timetable
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <p className="text-xs text-zinc-400 font-mono">
                Define recurring lectures, office hours, or fixed anchors.
              </p>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {commitments.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 relative space-y-3"
                  >
                    <button
                      onClick={() =>
                        setCommitments(commitments.filter((x) => x.id !== c.id))
                      }
                      className="absolute top-4 right-4 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          TITLE
                        </label>
                        <input
                          type="text"
                          value={c.title}
                          onChange={(e) => {
                            const updated = [...commitments];
                            updated[idx].title = e.target.value;
                            setCommitments(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          CATEGORY
                        </label>
                        <select
                          value={c.type}
                          onChange={(e) => {
                            const updated = [...commitments];
                            updated[idx].type = e.target.value;
                            setCommitments(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                        >
                          <option value="Academic">Academic</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                        RECURRING DAYS
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS_SHORT.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              const updated = [...commitments];
                              updated[idx].days = c.days.includes(d)
                                ? c.days.filter((x) => x !== d)
                                : [...c.days, d];
                              setCommitments(updated);
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded text-xs font-mono",
                              c.days.includes(d)
                                ? "bg-violet-600 text-white font-bold"
                                : "bg-zinc-800 text-zinc-400 hover:text-white",
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          START TIME
                        </label>
                        <input
                          type="time"
                          value={c.startTime}
                          onChange={(e) => {
                            const updated = [...commitments];
                            updated[idx].startTime = e.target.value;
                            setCommitments(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          END TIME
                        </label>
                        <input
                          type="time"
                          value={c.endTime}
                          onChange={(e) => {
                            const updated = [...commitments];
                            updated[idx].endTime = e.target.value;
                            setCommitments(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCommitments([
                      ...commitments,
                      {
                        id: `c_${Date.now()}`,
                        title: "New Commitment",
                        type: "Academic",
                        days: ["M", "W", "F"],
                        startTime: "10:00",
                        endTime: "11:30",
                      },
                    ])
                  }
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 text-xs font-mono"
                >
                  <Plus className="w-4 h-4" /> Add Commitment
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-2">
                  TRAINING SPLIT
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SPLITS.map((split) => (
                    <button
                      key={split}
                      type="button"
                      onClick={() => setTraining({ ...training, split })}
                      className={cn(
                        "p-4 rounded-xl border text-left font-mono text-xs transition-all flex items-center justify-between",
                        training.split === split
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20",
                      )}
                    >
                      <span>{split}</span>
                      <Dumbbell className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-2">
                  WORKOUT DAYS
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_SHORT.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        const days = training.workoutDays.includes(d)
                          ? training.workoutDays.filter((x) => x !== d)
                          : [...training.workoutDays, d];
                        setTraining({ ...training, workoutDays: days });
                      }}
                      className={cn(
                        "w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all",
                        training.workoutDays.includes(d)
                          ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                          : "bg-zinc-800 text-zinc-400 hover:text-white",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">
                    PREFERRED TIME
                  </label>
                  <input
                    type="time"
                    value={training.preferredTime}
                    onChange={(e) =>
                      setTraining({
                        ...training,
                        preferredTime: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">
                    DURATION ({training.durationMinutes} mins)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="15"
                    value={training.durationMinutes}
                    onChange={(e) =>
                      setTraining({
                        ...training,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 mt-2"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-2">
                    <Sun className="w-4 h-4 text-amber-400" /> WAKE TIME
                  </label>
                  <input
                    type="time"
                    value={recovery.targetWakeTime}
                    onChange={(e) =>
                      setRecovery({
                        ...recovery,
                        targetWakeTime: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-2">
                    <Moon className="w-4 h-4 text-indigo-400" /> BEDTIME
                  </label>
                  <input
                    type="time"
                    value={recovery.targetBedtime}
                    onChange={(e) =>
                      setRecovery({
                        ...recovery,
                        targetBedtime: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" /> DEEP WORK
                    BLOCK
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {recovery.codingBlockMinutes} mins
                  </span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="240"
                  step="30"
                  value={recovery.codingBlockMinutes}
                  onChange={(e) =>
                    setRecovery({
                      ...recovery,
                      codingBlockMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-400"
                />

                <div className="pt-2">
                  <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                    START TIME
                  </label>
                  <input
                    type="time"
                    value={recovery.codingStartTime || "19:30"}
                    onChange={(e) =>
                      setRecovery({
                        ...recovery,
                        codingStartTime: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              {isSynthesizing ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin mx-auto" />
                  <p className="font-mono text-sm text-zinc-400 animate-pulse">
                    Synthesizing weekly time-block protocol to Cloud
                    Firestore...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Protocol Generated Successfully!
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
                    Your timetable has been calculated and saved to your cloud
                    account across all 7 days.
                  </p>
                  <button
                    onClick={onComplete}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-mono font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:shadow-[0_0_40px_rgba(139,92,246,0.8)] transition-all"
                  >
                    Open Timetable Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-mono text-xs font-bold hover:bg-zinc-200 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSynthesize}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Timetable</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
