import { motion } from "framer-motion";
import { Sparkles, Layers, Lightbulb, Maximize2, Shield, Pencil, Box } from "lucide-react";

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

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── Score gauge ── */
function ScoreGauge({ value, size = 80 }: { value: number; size?: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(184,150,12,0.15)" strokeWidth="5" />
        <motion.circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="url(#sg)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8960c" />
            <stop offset="100%" stopColor="#f0d060" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-amber-400 leading-none">{value}%</span>
        <span className="text-[7px] uppercase tracking-widest text-amber-500/60 mt-0.5">Match</span>
      </div>
    </div>
  );
}

/* ── Spec callout line (overlaid on the right side of the image) ── */
function SpecLine({ label, value, delay, topPct }: { label: string; value: string; delay: number; topPct: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="absolute right-0 flex items-center"
      style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_2px_rgba(251,191,36,0.45)] flex-shrink-0" />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.08, duration: 0.35 }}
        className="w-5 h-px bg-amber-400/70 origin-left flex-shrink-0"
      />
      <div className="w-4 h-4 bg-black/75 border border-amber-500/35 flex-shrink-0 flex items-center justify-center">
        <div className="w-2 h-2 border border-amber-500/50" />
      </div>
      <div className="ml-1.5 min-w-[90px]">
        <p className="text-[8px] font-bold uppercase tracking-widest text-amber-400 leading-none">{label}</p>
        <p className="text-[9px] text-white/75 leading-tight mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Golden rays (clipped to card) ── */
function GoldenRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.10, 0.04] }}
          transition={{ delay: 0.2 + i * 0.05, duration: 1.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.5 + i * 0.25 }}
          className="absolute"
          style={{
            bottom: "20%",
            left: "50%",
            width: "1.5px",
            height: "80%",
            background: "linear-gradient(to top, rgba(184,150,12,0.6), transparent)",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${(i - 8) * 11}deg)`,
          }}
        />
      ))}
      <div
        className="absolute"
        style={{
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "260px",
          height: "260px",
          background: "radial-gradient(ellipse, rgba(184,150,12,0.14) 0%, rgba(184,150,12,0.04) 50%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

/* ── Main card ── */
export function CabinMatchCard({ cabin, matchScore, analysis, onWhatsApp, on3D }: CabinMatchCardProps) {
  const specs = cabin.specs;

  const specLines = [
    { label: "Ceiling",     value: specs.ceiling,    topPct: 20 },
    { label: "Wall Panels", value: specs.wallPanels,  topPct: 40 },
    { label: "Handrail",    value: specs.handrail,    topPct: 60 },
    { label: "Flooring",    value: specs.flooring,    topPct: 78 },
  ].filter(s => s.value);

  const statItems = [
    { icon: <Layers className="w-3 h-3 text-amber-500" />,   label: "Style",    value: specs.style || cabin.style },
    { icon: <Lightbulb className="w-3 h-3 text-amber-500" />, label: "Lighting", value: specs.lighting },
    { icon: <Maximize2 className="w-3 h-3 text-amber-500" />, label: "Capacity", value: specs.capacity },
    { icon: <Pencil className="w-3 h-3 text-amber-500" />,    label: "Finish",   value: specs.finish },
    { icon: <Shield className="w-3 h-3 text-amber-500" />,    label: "Warranty", value: specs.warranty },
  ].filter(s => s.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-amber-500/15 shadow-[0_0_60px_rgba(184,150,12,0.12)]"
      style={{ background: "#070504" }}
    >
      {/* ── IMAGE ZONE ── */}
      <div className="relative" style={{ paddingBottom: "62%" }}>
        <GoldenRays />

        {/* Cabin photo */}
        <motion.img
          src={cabin.imageUrl}
          alt={cabin.name}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center top" }}
        />

        {/* Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-transparent to-transparent" />

        {/* TOP-LEFT: AI badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/55 backdrop-blur border border-amber-500/40 px-2.5 py-1.5 rounded-lg z-10"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">AI Matched Design</p>
            {analysis && (
              <p className="text-[8px] text-white/55 mt-0.5 max-w-[150px] leading-tight truncate">{analysis}</p>
            )}
          </div>
        </motion.div>

        {/* TOP-RIGHT: Score gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute top-3 right-3 bg-black/65 backdrop-blur border border-amber-500/20 rounded-xl p-2 z-10 flex flex-col items-center gap-0.5"
        >
          <ScoreGauge value={matchScore} size={76} />
          <p className="text-[7px] uppercase tracking-widest text-amber-500/55 text-center leading-tight">
            Perfect match<br/>with your style
          </p>
        </motion.div>

        {/* RIGHT EDGE: Spec callout lines */}
        <div className="absolute inset-y-0 right-0 z-10 pointer-events-none" style={{ width: "160px" }}>
          {specLines.map((s, i) => (
            <SpecLine key={s.label} label={s.label} value={s.value} delay={0.7 + i * 0.12} topPct={s.topPct} />
          ))}
        </div>

        {/* BOTTOM-LEFT: 3D view thumb */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          onClick={on3D}
          className="absolute bottom-3 left-3 z-10 group flex items-center gap-1.5 bg-black/55 backdrop-blur border border-white/10 hover:border-amber-500/40 rounded-lg p-1.5 transition-all"
        >
          <div className="w-10 h-8 rounded overflow-hidden border border-amber-500/20 flex-shrink-0">
            <img src={cabin.thumbnailUrl || cabin.imageUrl} className="w-full h-full object-cover opacity-65 group-hover:opacity-90 transition-opacity" />
          </div>
          <div className="flex items-center gap-1 pr-1">
            <Box className="w-2.5 h-2.5 text-amber-400" />
            <p className="text-[7px] text-white/50 uppercase tracking-wider">3D View</p>
          </div>
        </motion.button>

        {/* BOTTOM: cabin name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-3 left-0 right-0 z-10 px-4"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-amber-400/65 mb-0.5">Selected Design</p>
          <h2 className="text-xl font-serif text-white tracking-wide leading-tight">
            {cabin.name.toUpperCase()}
          </h2>
        </motion.div>
      </div>

      {/* ── BOTTOM INFO STRIP ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="px-4 pt-3 pb-3 space-y-3"
        style={{ background: "#070504" }}
      >
        {/* Description */}
        {cabin.description && (
          <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{cabin.description}</p>
        )}

        {/* WhatsApp CTA — single button, full width */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={onWhatsApp}
          className="w-full flex items-center justify-center gap-2.5 bg-[#1DA851] hover:bg-[#22c55e] text-white rounded-xl px-4 py-3 font-semibold text-sm transition-colors shadow-[0_0_24px_rgba(29,168,81,0.35)]"
        >
          {WA_ICON}
          <span>GET YOUR QUOTE ON WHATSAPP</span>
          <span className="ml-auto text-white/60">→</span>
        </motion.button>

        <p className="text-[9px] text-white/25 text-center flex items-center justify-center gap-1.5">
          <Shield className="w-2.5 h-2.5" />
          No commitment · Instant response
        </p>

        {/* Stats bar */}
        {statItems.length > 0 && (
          <div className="border-t border-amber-500/10 pt-2.5 flex items-center divide-x divide-amber-500/10 overflow-x-auto">
            {statItems.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 first:pl-0 last:pr-0 flex-shrink-0">
                {s.icon}
                <div>
                  <p className="text-[7px] uppercase tracking-widest text-amber-500/45 leading-none">{s.label}</p>
                  <p className="text-[9px] text-white/70 leading-tight mt-0.5 whitespace-nowrap">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
