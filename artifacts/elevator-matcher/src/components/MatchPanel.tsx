import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CheckCircle, Crown, Gem, Layers } from "lucide-react";

interface MatchPanelProps {
  matchScore: number;
}

function CircularGauge({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const ctrl = animate(count, value, { duration: 2.2, ease: "easeOut", delay: 0.3 });
    return ctrl.stop;
  }, [value]);

  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Ambient glow ring behind */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: "0 0 40px rgba(184,150,12,0.12)", borderRadius: "50%" }}
      />

      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="rgba(184,150,12,0.10)"
          strokeWidth="8"
        />
        {/* Soft shadow ring (offset slightly) */}
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="rgba(184,150,12,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 2.2, ease: "easeOut", delay: 0.3 }}
        />
        {/* Main progress arc */}
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 2.2, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a07810" />
            <stop offset="60%" stopColor="#d4a830" />
            <stop offset="100%" stopColor="#f0d060" />
          </linearGradient>
        </defs>
      </svg>

      {/* Counter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-end leading-none">
          <motion.span className="text-4xl font-bold text-white tabular-nums">
            {rounded}
          </motion.span>
          <span className="text-lg font-bold text-amber-400 mb-0.5">%</span>
        </div>
        <span className="text-[8px] uppercase tracking-[0.2em] text-amber-500/55 mt-1.5">
          Match Score
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label, value, delay, icon,
}: {
  label: string;
  value: number;
  delay: number;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500/60">{icon}</span>
          <span className="text-[11px] font-medium text-white/65">{label}</span>
        </div>
        <motion.span
          className="text-[12px] font-bold text-amber-400 tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8 }}
        >
          {value}%
        </motion.span>
      </div>

      {/* Bar track */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {/* Glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(240,208,96,0.15))", filter: "blur(3px)" }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.1 }}
        />
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, #8a6010, #c89620, #f0d060)" }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.1 }}
        />
      </div>
    </motion.div>
  );
}

export function MatchPanel({ matchScore }: MatchPanelProps) {
  const bars = [
    { label: "Style Match",    value: Math.min(100, matchScore + 4), icon: <Crown className="w-3 h-3" />,  delay: 0.7  },
    { label: "Material Match", value: Math.min(100, matchScore - 3), icon: <Layers className="w-3 h-3" />, delay: 0.95 },
    { label: "Luxury Match",   value: Math.min(100, matchScore + 2), icon: <Gem className="w-3 h-3" />,    delay: 1.2  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="h-full flex flex-col rounded-2xl p-4"
      style={{
        background: "rgba(10,8,5,0.90)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(184,150,12,0.15)",
        boxShadow: "0 0 40px rgba(184,150,12,0.06), inset 0 1px 0 rgba(184,150,12,0.08)",
      }}
    >
      {/* Gauge */}
      <div className="flex-shrink-0 pt-1 pb-3">
        <CircularGauge value={matchScore} />
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px mb-3" style={{ background: "rgba(184,150,12,0.1)" }} />

      {/* Breakdown bars */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        {bars.map((b) => (
          <BreakdownBar key={b.label} {...b} />
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="flex-shrink-0 flex items-center gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: "rgba(184,150,12,0.1)" }}
      >
        <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <p className="text-[10px] text-white/50 leading-tight">
          <span className="text-white/80 font-semibold">Perfect harmony</span>
          {" "}with your interior
        </p>
      </motion.div>
    </motion.div>
  );
}
