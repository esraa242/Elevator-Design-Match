import { motion } from "framer-motion";
import { CheckCircle, Crown, Gem, Layers } from "lucide-react";

interface MatchPanelProps {
  matchScore: number;
}

function CircularGauge({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(184,150,12,0.12)" strokeWidth="7" />
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a07810" />
            <stop offset="100%" stopColor="#f0d060" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-4xl font-bold text-white leading-none"
        >
          {value}
          <span className="text-xl text-amber-400">%</span>
        </motion.span>
        <span className="text-[9px] uppercase tracking-widest text-amber-500/60 mt-1">Match Score</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, delay, icon }: { label: string; value: number; delay: number; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500/70">{icon}</span>
          <span className="text-[11px] text-white/70">{label}</span>
        </div>
        <span className="text-[11px] font-semibold text-amber-400">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #a07810, #f0d060)" }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.4, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

export function MatchPanel({ matchScore }: MatchPanelProps) {
  const bars = [
    { label: "Style Match",    value: Math.min(100, matchScore + 4),  icon: <Crown className="w-3 h-3" /> },
    { label: "Material Match", value: Math.min(100, matchScore - 3),  icon: <Layers className="w-3 h-3" /> },
    { label: "Luxury Match",   value: Math.min(100, matchScore + 2),  icon: <Gem className="w-3 h-3" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="h-full flex flex-col rounded-2xl p-4 space-y-4"
      style={{
        background: "rgba(10,8,5,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(184,150,12,0.15)",
        boxShadow: "0 0 30px rgba(184,150,12,0.05)",
      }}
    >
      {/* Gauge */}
      <div className="flex-shrink-0">
        <CircularGauge value={matchScore} />
      </div>

      {/* Breakdown bars */}
      <div className="flex-1 flex flex-col justify-center space-y-3">
        {bars.map((b, i) => (
          <BreakdownBar key={b.label} {...b} delay={0.6 + i * 0.15} />
        ))}
      </div>

      {/* "Perfect harmony" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex-shrink-0 flex items-center gap-2 pt-2 border-t"
        style={{ borderColor: "rgba(184,150,12,0.12)" }}
      >
        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-[11px] text-white/60 leading-tight">
          <span className="text-white/85 font-medium">Perfect harmony</span>
          <br />with your interior
        </p>
      </motion.div>
    </motion.div>
  );
}
