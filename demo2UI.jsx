import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  Brain,
  Dumbbell,
  Moon,
  Code,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = "mindful-life-os-master-setup";
const DAYS_OF_WEEK = ["M", "T", "W", "Th", "F", "S", "Su"];
const TRAINING_SPLITS = [
  "Push / Pull / Legs",
  "Upper / Lower",
  "Full Body",
  "Custom Split",
];

const Card = ({ children, className, active, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative group rounded-2xl border bg-[#121214] p-6 transition-all duration-300",
      active
        ? "border-violet-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] bg-violet-500/5"
        : "border-white/10 hover:border-white/20",
      onClick && "cursor-pointer",
      className,
    )}
  >
    {children}
  </div>
);

const DaySelector = ({ selectedDays, onToggle, label = "Days" }) => (
  <div className="flex flex-col gap-3">
    {label && (
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
    )}
    <div className="flex gap-2 flex-wrap">
      {DAYS_OF_WEEK.map((d) => (
        <button
          key={d}
          onClick={() => onToggle(d)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border",
            selectedDays.includes(d)
              ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10",
          )}
        >
          {d}
        </button>
      ))}
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      {...props}
      className={cn(
        "bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-white/20",
        props.className,
      )}
    />
  </div>
);

const Select = ({ label, options, value, onChange, className }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none cursor-pointer",
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#1A1A1D]">
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default function MasterSetupOnboarding() {
  const [step, setStep] = useState(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [commitments, setCommitments] = useState([
    {
      id: "1",
      title: "Data Structures Lecture",
      type: "Academic",
      days: ["M", "W", "F"],
      startTime: "10:00",
      endTime: "11:30",
    },
  ]);

  const [training, setTraining] = useState({
    split: "Push / Pull / Legs",
    workoutDays: ["M", "T", "Th", "F", "S"],
    durationMinutes: 60,
    preferredTime: "17:00",
  });

  const [recovery, setRecovery] = useState({
    targetBedtime: "23:00",
    targetWakeTime: "07:00",
    codingBlockMinutes: 120,
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (parsed?.commitments) setCommitments(parsed.commitments);
      if (parsed?.training) setTraining(parsed.training);
      if (parsed?.recovery) setRecovery(parsed.recovery);
      if (parsed?.isComplete) setIsComplete(parsed.isComplete);
      if (parsed?.isComplete) setStep(4);
    } catch (error) {
      console.warn("Could not restore onboarding state", error);
    }
  }, []);

  const toggleCommitmentDay = (id, day) => {
    setCommitments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const days = c.days.includes(day)
            ? c.days.filter((d) => d !== day)
            : [...c.days, day];
          return { ...c, days };
        }
        return c;
      }),
    );
  };

  const updateCommitment = (id, updates) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const toggleWorkoutDay = (day) => {
    setTraining((prev) => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter((d) => d !== day)
        : [...prev.workoutDays, day],
    }));
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const osConfig = { commitments, training, recovery, isComplete: true };
      setIsSynthesizing(false);
      setIsComplete(true);
      setStep(4);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(osConfig));
      } catch (error) {
        console.warn("Could not save onboarding config", error);
      }
    }, 2500);
  };

  const handleFinish = () => {
    const osConfig = { commitments, training, recovery, isComplete: true };
    setIsComplete(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(osConfig));
    } catch (error) {
      console.warn("Could not save onboarding config", error);
    }
    console.log("Master OS Configured:", osConfig);
    alert("OS Dashboard Baseline Saved! Check your browser console.");
  };

  const calculateSleepDuration = () => {
    const [bedH, bedM] = recovery.targetBedtime.split(":").map(Number);
    const [wakeH, wakeM] = recovery.targetWakeTime.split(":").map(Number);
    let durationMins = wakeH * 60 + wakeM - (bedH * 60 + bedM);
    if (durationMins < 0) durationMins += 24 * 60;
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-violet-500/30 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {step < 4 && !isSynthesizing && (
          <div className="flex flex-col gap-6 pt-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Mindful Life OS
              </h1>
              <p className="text-white/50 mt-1">Master Setup Onboarding</p>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step >= i ? "100%" : "0%" }}
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && !isSynthesizing && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-violet-400" />
                    Fixed Commitments
                  </h2>
                  <p className="text-white/50 text-sm mt-2">
                    Establish your baseline schedule with non-negotiable blocks.
                  </p>
                </div>

                <div className="space-y-4">
                  {commitments.map((c) => (
                    <Card key={c.id} className="flex flex-col gap-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <Input
                            label="Title"
                            value={c.title}
                            onChange={(e) =>
                              updateCommitment(c.id, { title: e.target.value })
                            }
                            placeholder="e.g. Data Structures Lecture"
                          />
                          <Select
                            label="Type"
                            value={c.type}
                            onChange={(v) =>
                              updateCommitment(c.id, { type: v })
                            }
                            options={["Academic", "Work", "Other"]}
                          />
                        </div>
                        <button
                          onClick={() =>
                            setCommitments((prev) =>
                              prev.filter((item) => item.id !== c.id),
                            )
                          }
                          className="text-white/30 hover:text-red-400 transition-colors p-2 mt-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DaySelector
                          selectedDays={c.days}
                          onToggle={(d) => toggleCommitmentDay(c.id, d)}
                        />

                        <div className="flex gap-4">
                          <Input
                            label="Start"
                            type="time"
                            value={c.startTime}
                            onChange={(e) =>
                              updateCommitment(c.id, {
                                startTime: e.target.value,
                              })
                            }
                          />
                          <Input
                            label="End"
                            type="time"
                            value={c.endTime}
                            onChange={(e) =>
                              updateCommitment(c.id, {
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  <button
                    onClick={() =>
                      setCommitments([
                        ...commitments,
                        {
                          id: Math.random().toString(36).slice(2),
                          title: "",
                          type: "Other",
                          days: [],
                          startTime: "09:00",
                          endTime: "10:00",
                        },
                      ])
                    }
                    className="w-full border border-dashed border-white/20 rounded-2xl p-4 text-white/50 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/5 flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Commitment
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && !isSynthesizing && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <Dumbbell className="w-6 h-6 text-cyan-400" />
                    Physical Health
                  </h2>
                  <p className="text-white/50 text-sm mt-2">
                    Design your training regimen to maintain peak performance.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    Training Split
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TRAINING_SPLITS.map((split) => (
                      <Card
                        key={split}
                        active={training.split === split}
                        onClick={() => setTraining({ ...training, split })}
                        className="flex items-center gap-4 py-4"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2",
                            training.split === split
                              ? "border-violet-500 bg-violet-500"
                              : "border-white/20",
                          )}
                        />
                        <span className="font-medium">{split}</span>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="flex flex-col gap-6">
                  <DaySelector
                    label="Workout Days"
                    selectedDays={training.workoutDays}
                    onToggle={toggleWorkoutDay}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between">
                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                          Session Duration
                        </label>
                        <span className="text-xs text-violet-400 font-mono">
                          {training.durationMinutes} mins
                        </span>
                      </div>
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
                        className="w-full accent-violet-500"
                      />
                    </div>

                    <Input
                      label="Preferred Time Window"
                      type="time"
                      value={training.preferredTime}
                      onChange={(e) =>
                        setTraining({
                          ...training,
                          preferredTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 3 && !isSynthesizing && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <Moon className="w-6 h-6 text-indigo-400" />
                    Recovery & Deep Work
                  </h2>
                  <p className="text-white/50 text-sm mt-2">
                    Optimize cognitive load and recovery metrics.
                  </p>
                </div>

                <Card className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold text-lg">
                      Circadian Baseline
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Target Bedtime"
                      type="time"
                      value={recovery.targetBedtime}
                      onChange={(e) =>
                        setRecovery({
                          ...recovery,
                          targetBedtime: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Target Wake Time"
                      type="time"
                      value={recovery.targetWakeTime}
                      onChange={(e) =>
                        setRecovery({
                          ...recovery,
                          targetWakeTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm text-white/70">
                      Calculated Sleep Duration
                    </span>
                    <span className="font-mono text-violet-400 font-semibold text-lg">
                      {calculateSleepDuration()}
                    </span>
                  </div>
                </Card>

                <Card className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-lg">
                      Coding Non-Negotiable
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Daily Deep Work Block
                      </label>
                      <span className="text-xs text-cyan-400 font-mono">
                        {recovery.codingBlockMinutes} mins
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="180"
                      step="15"
                      value={recovery.codingBlockMinutes}
                      onChange={(e) =>
                        setRecovery({
                          ...recovery,
                          codingBlockMinutes: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {isSynthesizing && (
              <motion.div
                key="synthesize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] gap-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-t-2 border-l-2 border-violet-500 w-16 h-16 opacity-50 blur-sm"
                  />
                  <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
                </div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-lg font-medium text-white/80"
                >
                  Synthesizing constraints with AI...
                </motion.p>
              </motion.div>
            )}

            {step === 4 && !isSynthesizing && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-8 py-8"
              >
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Master OS Synthesized
                  </h2>
                  <p className="text-white/50 max-w-md">
                    Your baseline constraints have been integrated. The system
                    is ready to orchestrate your week.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="flex flex-col gap-2">
                    <Calendar className="w-5 h-5 text-violet-400 mb-2" />
                    <span className="text-xs text-white/50 uppercase">
                      Commitments
                    </span>
                    <span className="font-semibold text-lg">
                      {commitments.length} Fixed Blocks
                    </span>
                  </Card>

                  <Card className="flex flex-col gap-2">
                    <Dumbbell className="w-5 h-5 text-cyan-400 mb-2" />
                    <span className="text-xs text-white/50 uppercase">
                      Training
                    </span>
                    <span className="font-semibold text-lg">
                      {training.split}
                    </span>
                    <span className="text-sm text-white/40">
                      {training.workoutDays.length} days/wk @{" "}
                      {training.durationMinutes}m
                    </span>
                  </Card>

                  <Card className="flex flex-col gap-2">
                    <Brain className="w-5 h-5 text-indigo-400 mb-2" />
                    <span className="text-xs text-white/50 uppercase">
                      Recovery
                    </span>
                    <span className="font-semibold text-lg">
                      {calculateSleepDuration()} Sleep
                    </span>
                    <span className="text-sm text-white/40">
                      {recovery.codingBlockMinutes}m Deep Work
                    </span>
                  </Card>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full mt-4 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  Enter OS Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 4 && !isSynthesizing && (
          <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-4">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                step === 1
                  ? "opacity-0 pointer-events-none"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              )}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-lg shadow-white/10"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSynthesize}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Synthesize Master OS <Brain className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
