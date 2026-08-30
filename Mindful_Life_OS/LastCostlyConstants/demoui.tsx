import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Dumbbell, Clock, Moon, Sun, 
  Terminal, CheckCircle2, ChevronRight, ChevronLeft, Calendar 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
const SPLITS = ['Push / Pull / Legs', 'Upper / Lower', 'Full Body', 'Custom Split'];

// --- TYPES ---
type Commitment = { id: string; title: string; type: string; days: string[]; startTime: string; endTime: string; };
type Training = { split: string; workoutDays: string[]; durationMinutes: number; preferredTime: string; };
type Recovery = { targetBedtime: string; targetWakeTime: string; codingBlockMinutes: number; };

// --- MAIN COMPONENT ---
export default function MasterSetupOnboarding() {
  const [step, setStep] = useState(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Data Schema State
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [training, setTraining] = useState<Training>({
    split: 'Push / Pull / Legs',
    workoutDays: ['M', 'W', 'F'],
    durationMinutes: 60,
    preferredTime: '07:00'
  });
  const [recovery, setRecovery] = useState<Recovery>({
    targetBedtime: '23:00',
    targetWakeTime: '07:00',
    codingBlockMinutes: 120
  });

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setStep(4);
    setTimeout(() => {
      setIsSynthesizing(false);
      localStorage.setItem('mindfulOS_config', JSON.stringify({ commitments, training, recovery }));
    }, 2000);
  };

  // --- SUB-COMPONENTS ---
  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-3 mb-12">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={cn(
            "h-2 rounded-full transition-all duration-500",
            step >= num ? "bg-violet-500 w-12 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-white/10 w-4"
          )} />
        </div>
      ))}
    </div>
  );

  // --- STEP 1: COMMITMENTS ---
  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-white tracking-tight">Fixed Commitments</h2>
        <p className="text-zinc-400 mt-2">Define your absolute anchors for academics and work.</p>
      </div>

      <div className="space-y-4">
        {commitments.map((item, idx) => (
          <div key={item.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative group transition-colors hover:border-white/20">
            <button onClick={() => setCommitments(c => c.filter(x => x.id !== item.id))} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</label>
                <input type="text" value={item.title} onChange={e => {
                  const newC = [...commitments]; newC[idx].title = e.target.value; setCommitments(newC);
                }} placeholder="e.g. Data Structures Lecture" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</label>
                <select value={item.type} onChange={e => {
                  const newC = [...commitments]; newC[idx].type = e.target.value; setCommitments(newC);
                }} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 appearance-none">
                  <option value="Academic">Academic</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DAYS.map(d => (
                <button key={d} onClick={() => {
                  const newC = [...commitments];
                  newC[idx].days = item.days.includes(d) ? item.days.filter(day => day !== d) : [...item.days, d];
                  setCommitments(newC);
                }} className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", item.days.includes(d) ? "bg-violet-500/20 text-violet-300 border border-violet-500/50" : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10")}>
                  {d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-3 bg-black/40 rounded-lg px-4 py-2 border border-white/10">
                <Clock size={16} className="text-zinc-500" />
                <input type="time" value={item.startTime} onChange={e => {
                  const newC = [...commitments]; newC[idx].startTime = e.target.value; setCommitments(newC);
                }} className="bg-transparent text-white w-full focus:outline-none font-mono text-sm" />
              </div>
              <div className="flex items-center space-x-3 bg-black/40 rounded-lg px-4 py-2 border border-white/10">
                <Clock size={16} className="text-zinc-500" />
                <input type="time" value={item.endTime} onChange={e => {
                  const newC = [...commitments]; newC[idx].endTime = e.target.value; setCommitments(newC);
                }} className="bg-transparent text-white w-full focus:outline-none font-mono text-sm" />
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setCommitments([...commitments, { id: Math.random().toString(), title: '', type: 'Academic', days: [], startTime: '09:00', endTime: '10:00' }])} className="w-full flex items-center justify-center space-x-2 py-4 border border-dashed border-white/20 rounded-2xl text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all">
          <Plus size={18} />
          <span>Add Commitment</span>
        </button>
      </div>
    </motion.div>
  );

  // --- STEP 2: TRAINING ---
  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-white tracking-tight">Physical Protocol</h2>
        <p className="text-zinc-400 mt-2">Design your training regimen and physical health baselines.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SPLITS.map(split => (
          <button key={split} onClick={() => setTraining({ ...training, split })} className={cn(
            "p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-24",
            training.split === split 
              ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
              : "bg-white/[0.02] border-white/10 hover:border-white/30 text-zinc-400"
          )}>
            <Dumbbell size={20} className={training.split === split ? "text-cyan-400" : "text-zinc-500"} />
            <span className={cn("font-medium", training.split === split ? "text-cyan-300" : "")}>{split}</span>
          </button>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 block">Training Days</label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map(d => (
              <button key={d} onClick={() => {
                const days = training.workoutDays.includes(d) ? training.workoutDays.filter(day => day !== d) : [...training.workoutDays, d];
                setTraining({ ...training, workoutDays: days });
              }} className={cn("w-10 h-10 rounded-full font-medium transition-all flex items-center justify-center", training.workoutDays.includes(d) ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-white/10 text-zinc-400 hover:bg-white/20")}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300 mb-4 flex justify-between">
            <span>Session Duration</span>
            <span className="text-cyan-400 font-mono">{training.durationMinutes} mins</span>
          </label>
          <input type="range" min="30" max="120" step="15" value={training.durationMinutes} onChange={(e) => setTraining({ ...training, durationMinutes: parseInt(e.target.value) })} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
            <span>30m</span><span>120m</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // --- STEP 3: RECOVERY & CODING ---
  const sleepDuration = useMemo(() => {
    const [bH, bM] = recovery.targetBedtime.split(':').map(Number);
    const [wH, wM] = recovery.targetWakeTime.split(':').map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins > 0 ? mins + 'm' : ''}`;
  }, [recovery.targetBedtime, recovery.targetWakeTime]);

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-white tracking-tight">Recovery & Deep Work</h2>
        <p className="text-zinc-400 mt-2">Establish your restorative boundaries and deep work capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Moon size={100} />
          </div>
          <label className="text-sm font-medium text-zinc-300 mb-4 block flex items-center gap-2">
            <Moon size={16} className="text-indigo-400"/> Target Bedtime
          </label>
          <input type="time" value={recovery.targetBedtime} onChange={e => setRecovery({ ...recovery, targetBedtime: e.target.value })} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-mono focus:outline-none focus:border-indigo-500 w-full" />
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sun size={100} />
          </div>
          <label className="text-sm font-medium text-zinc-300 mb-4 block flex items-center gap-2">
            <Sun size={16} className="text-amber-400"/> Wake Time
          </label>
          <input type="time" value={recovery.targetWakeTime} onChange={e => setRecovery({ ...recovery, targetWakeTime: e.target.value })} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-mono focus:outline-none focus:border-amber-500 w-full" />
        </div>
      </div>
      
      <div className="text-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl py-3 text-indigo-300">
        Estimated Daily Sleep: <span className="font-mono font-bold">{sleepDuration}</span>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <label className="text-sm font-medium text-zinc-300 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2"><Terminal size={16} className="text-emerald-400"/> Daily Deep Code Block</span>
          <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded">{recovery.codingBlockMinutes} mins</span>
        </label>
        <input type="range" min="60" max="240" step="30" value={recovery.codingBlockMinutes} onChange={e => setRecovery({ ...recovery, codingBlockMinutes: parseInt(e.target.value) })} className="w-full accent-emerald-500 mt-2" />
        <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
          <span>60m (1h)</span><span>240m (4h)</span>
        </div>
      </div>
    </motion.div>
  );

  // --- STEP 4: SYNTHESIS & SUMMARY ---
  const renderStep4 = () => {
    if (isSynthesizing) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full animate-pulse" />
          </div>
          <p className="mt-8 text-xl font-mono text-zinc-300 animate-pulse">Synthesizing constraints with AI...</p>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight">OS Synthesized</h2>
          <p className="text-zinc-400 mt-2">Your baseline protocol is active and saved.</p>
        </div>

        <div className="grid gap-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-violet-400" />
              <span className="text-white">Fixed Commitments</span>
            </div>
            <span className="font-mono text-zinc-400">{commitments.length} Items</span>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="text-cyan-400" />
              <span className="text-white">Training Split</span>
            </div>
            <span className="font-mono text-zinc-400">{training.split} • {training.workoutDays.length}x/wk</span>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center justify-between">
             <div className="flex items-center gap-3">
              <Terminal className="text-emerald-400" />
              <span className="text-white">System Limits</span>
            </div>
            <span className="font-mono text-zinc-400">Sleep: {sleepDuration} • Code: {recovery.codingBlockMinutes}m</span>
          </div>
        </div>

        <button className="w-full bg-white text-black font-semibold rounded-xl py-4 mt-8 hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Enter OS Dashboard
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans selection:bg-violet-500/30 flex items-center justify-center p-4 sm:p-8">
      {/* Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10">
        {step < 4 && <StepIndicator />}

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
            {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
            {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
            {step === 4 && <motion.div key="step4">{renderStep4()}</motion.div>}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-12 border-t border-white/10 pt-6">
            <button onClick={prevStep} disabled={step === 1} className="flex items-center px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={20} className="mr-1" /> Back
            </button>
            
            {step < 3 ? (
              <button onClick={nextStep} className="flex items-center px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                Continue <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button onClick={handleSynthesize} className="flex items-center px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-500 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]">
                Synthesize Master OS
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}