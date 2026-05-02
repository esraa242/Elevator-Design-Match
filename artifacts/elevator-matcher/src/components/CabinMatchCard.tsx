import { motion } from "framer-motion";
import { Sparkles, Layers, Lightbulb, Maximize2, Shield, Pencil, Smartphone, Box } from "lucide-react";

interface Cabin {
  id: number;
  name: string;
  style: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  specs: {
    ceiling: string;
    wallPanels: string;
    handrail: string;
    flooring: string;
    lighting: string;
    capacity: string;
    finish: string;
    warranty: string;
    style?: string;
  };
}

interface CabinMatchCardProps {
  cabin: Cabin;
  matchScore: number;
  /** e.g. "Modern Luxury · marble, gold, minimal" */
  analysis?: string;
  onWhatsApp: () => void;
  on3D: () => void;
}

/* ─── Circular score gauge ─── */
function ScoreGauge({ value }: { value: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(184,150,12,0.15)" strokeWidth="6" />
          {/* Gold fill */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.6 }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8960c" />
              <stop offset="100%" stopColor="#f0d060" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-amber-400 leading-none">{value}%</span>
          <span className="text-[8px] uppercase tracking-widest text-amber-500/70 mt-0.5">Match</span>
        </div>
      </div>
      <p className="text-xs text-amber-400/70 text-center mt-1 leading-tight">Match<br/>Score</p>
    </motion.div>
  );
}

/* ─── Single spec callout line ─── */
function SpecLine({
  label, value, delay, topPct
}: { label: string; value: string; delay: number; topPct: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute right-0 flex items-center gap-0"
      style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
    >
      {/* Dot on image */}
      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.5)] flex-shrink-0 -mr-px" />
      {/* Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.4 }}
        className="w-8 h-px bg-gradient-to-r from-amber-400 to-amber-400/60 origin-left flex-shrink-0"
      />
      {/* Small square icon */}
      <div className="w-5 h-5 bg-black/80 border border-amber-500/40 flex-shrink-0 flex items-center justify-center">
        <div className="w-2.5 h-2.5 border border-amber-500/60" />
      </div>
      {/* Text */}
      <div className="ml-2 min-w-[120px]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">{label}</p>
        <p className="text-[10px] text-white/80 leading-tight mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

/* ─── Golden radial rays background ─── */
function GoldenRays() {
  const rays = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {rays.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.12, 0.06] }}
          transition={{ delay: 0.3 + i * 0.04, duration: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 + i * 0.3 }}
          className="absolute"
          style={{
            bottom: "30%",
            left: "50%",
            width: "2px",
            height: "70%",
            background: "linear-gradient(to top, rgba(184,150,12,0.5), transparent)",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${(i - 10) * 9}deg)`,
          }}
        />
      ))}
      {/* Central glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(184,150,12,0.18) 0%, rgba(184,150,12,0.06) 40%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      {/* Side glows */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-amber-900/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-amber-900/10 to-transparent pointer-events-none" />
    </div>
  );
}

/* ─── Main component ─── */
export function CabinMatchCard({ cabin, matchScore, analysis, onWhatsApp, on3D }: CabinMatchCardProps) {
  const specs = cabin.specs;

  const specLines = [
    { label: "Ceiling", value: specs.ceiling, topPct: 22 },
    { label: "Wall Panels", value: specs.wallPanels, topPct: 42 },
    { label: "Handrail", value: specs.handrail, topPct: 60 },
    { label: "Flooring", value: specs.flooring, topPct: 78 },
  ].filter(s => s.value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full min-h-screen flex flex-col"
      style={{ background: "#060404" }}
    >
      {/* Radial rays */}
      <GoldenRays />

      {/* ── Main content area ── */}
      <div className="relative flex-1 flex flex-col lg:flex-row items-stretch">

        {/* ── LEFT: Cabin image zone ── */}
        <div className="relative flex-1 min-h-[55vh] lg:min-h-screen">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={cabin.imageUrl}
              alt={cabin.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center top" }}
            />
            {/* Vignette overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent lg:from-black/95" />
          </motion.div>

          {/* ── TOP-LEFT badge ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-5 left-5 z-10"
          >
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-500/40 px-3 py-2 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">AI Matched Design</p>
                {analysis && <p className="text-[9px] text-white/60 mt-0.5 max-w-[160px] leading-tight">{analysis.slice(0, 50)}{analysis.length > 50 ? "…" : ""}</p>}
              </div>
            </div>
          </motion.div>

          {/* ── TOP-RIGHT score gauge ── */}
          <div className="absolute top-5 right-5 z-10 hidden lg:flex flex-col items-end gap-2">
            <div className="bg-black/70 backdrop-blur-md border border-amber-500/25 rounded-xl p-3">
              <ScoreGauge value={matchScore} />
              <p className="text-[9px] text-amber-500/60 text-center mt-1 uppercase tracking-widest">
                Perfect harmony<br/>with your style
              </p>
            </div>
          </div>

          {/* ── SPEC CALLOUT LINES (desktop) ── */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none">
            <div className="absolute right-0 inset-y-0 w-48 pr-1">
              {specLines.map((s, i) => (
                <SpecLine
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  delay={0.8 + i * 0.15}
                  topPct={s.topPct}
                />
              ))}
            </div>
          </div>

          {/* ── BOTTOM-LEFT thumbnail + 3D hint ── */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="absolute bottom-24 left-5 z-10 hidden lg:block"
          >
            <button
              onClick={on3D}
              className="group flex flex-col items-center gap-1.5 bg-black/60 backdrop-blur border border-white/10 hover:border-amber-500/50 rounded-lg p-2 transition-all"
            >
              <div className="w-16 h-12 rounded overflow-hidden border border-amber-500/20">
                <img src={cabin.thumbnailUrl || cabin.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-1">
                <Box className="w-3 h-3 text-amber-400" />
                <p className="text-[8px] text-white/50 uppercase tracking-wider leading-none">View 3D</p>
              </div>
            </button>
          </motion.div>

          {/* ── BOTTOM name + desc + WhatsApp ── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 mb-1">Selected Design</p>
              <h2 className="text-2xl lg:text-4xl font-serif text-white mb-1 tracking-wide">
                {cabin.name.toUpperCase()}
              </h2>
              <p className="text-sm text-white/50 max-w-sm mb-4 leading-relaxed hidden lg:block">{cabin.description}</p>

              {/* WhatsApp CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onWhatsApp}
                className="flex items-center gap-3 bg-[#1DA851] hover:bg-[#22c55e] text-white rounded-xl px-5 py-3 font-semibold text-sm transition-colors shadow-[0_0_30px_rgba(29,168,81,0.4)]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>GET YOUR QUOTE ON WHATSAPP</span>
                <span className="ml-auto text-white/60 text-lg">→</span>
              </motion.button>
              <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                No commitment · Instant response
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT PANEL (mobile: below image) ── */}
        <div className="lg:hidden relative z-10 bg-black/90 p-5 space-y-4 border-t border-amber-500/10">
          <MobileScoreAndSpecs matchScore={matchScore} specs={specs} />
          <button
            onClick={onWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#1DA851] text-white rounded-xl px-5 py-3.5 font-semibold text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            GET YOUR QUOTE ON WHATSAPP
          </button>
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="relative z-10 border-t border-amber-500/10 bg-black/80 backdrop-blur px-5 lg:px-10 py-3"
      >
        <div className="flex items-center divide-x divide-amber-500/10 overflow-x-auto">
          {[
            { icon: <Layers className="w-3.5 h-3.5 text-amber-500" />, label: "STYLE", value: specs.style || cabin.style },
            { icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" />, label: "LIGHTING", value: specs.lighting },
            { icon: <Maximize2 className="w-3.5 h-3.5 text-amber-500" />, label: "CAPACITY", value: specs.capacity },
            { icon: <Pencil className="w-3.5 h-3.5 text-amber-500" />, label: "FINISH", value: specs.finish },
            { icon: <Shield className="w-3.5 h-3.5 text-amber-500" />, label: "WARRANTY", value: specs.warranty },
          ].filter(s => s.value).map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-4 lg:px-6 first:pl-0 last:pr-0 flex-shrink-0">
              {s.icon}
              <div>
                <p className="text-[8px] uppercase tracking-widest text-amber-500/50 leading-none">{s.label}</p>
                <p className="text-[10px] text-white/80 leading-tight mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Mobile score + specs ─── */
function MobileScoreAndSpecs({ matchScore, specs }: { matchScore: number; specs: CabinMatchCardProps["cabin"]["specs"] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreGauge value={matchScore} />
        <div className="space-y-1">
          {[
            { label: "Ceiling", value: specs.ceiling },
            { label: "Wall Panels", value: specs.wallPanels },
            { label: "Handrail", value: specs.handrail },
          ].filter(s => s.value).map(s => (
            <div key={s.label}>
              <p className="text-[8px] uppercase tracking-widest text-amber-500/60">{s.label}</p>
              <p className="text-xs text-white/80">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
