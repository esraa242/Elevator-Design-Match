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
  analysis?: string;
  onWhatsApp: () => void;
  on3D: () => void;
}

/* ── Score gauge ── */
function ScoreGauge({ value }: { value: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(184,150,12,0.18)" strokeWidth="5" />
        <motion.circle
          cx="44" cy="44" r={r}
          fill="none" stroke="url(#sg)" strokeWidth="5" strokeLinecap="round"
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

/* ── Spec callout line ── */
function SpecLine({ label, value, delay, topPct }: { label: string; value: string; delay: number; topPct: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="absolute right-0 flex items-center"
      style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_2px_rgba(251,191,36,0.4)] flex-shrink-0" />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.08, duration: 0.3 }}
        className="w-4 h-px bg-amber-400/70 origin-left flex-shrink-0"
      />
      <div className="w-4 h-4 bg-black/80 border border-amber-500/35 flex-shrink-0 flex items-center justify-center">
        <div className="w-2 h-2 border border-amber-500/50" />
      </div>
      <div className="ml-1.5" style={{ minWidth: 100 }}>
        <p className="text-[8px] font-bold uppercase tracking-widest text-amber-400 leading-none">{label}</p>
        <p className="text-[9px] text-white/75 leading-tight mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Golden rays ── */
function GoldenRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.08, 0.03] }}
          transition={{ delay: 0.2 + i * 0.06, duration: 1.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 + i * 0.2 }}
          className="absolute"
          style={{
            bottom: "10%", left: "50%",
            width: "1.5px", height: "90%",
            background: "linear-gradient(to top, rgba(184,150,12,0.55), transparent)",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${(i - 7) * 12}deg)`,
          }}
        />
      ))}
      <div className="absolute" style={{
        bottom: "5%", left: "50%", transform: "translateX(-50%)",
        width: "300px", height: "300px",
        background: "radial-gradient(ellipse, rgba(184,150,12,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
    </div>
  );
}

/* ── Main card ── */
export function CabinMatchCard({ cabin, matchScore, analysis, onWhatsApp, on3D }: CabinMatchCardProps) {
  const specs = cabin.specs;

  const specLines = [
    { label: "Ceiling",     value: specs.ceiling,    topPct: 20 },
    { label: "Wall Panels", value: specs.wallPanels,  topPct: 42 },
    { label: "Handrail",    value: specs.handrail,    topPct: 62 },
    { label: "Flooring",    value: specs.flooring,    topPct: 80 },
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-amber-500/15 shadow-[0_0_50px_rgba(184,150,12,0.1)]"
      style={{ background: "#060404" }}
    >
      {/* ══ IMAGE ZONE (takes all remaining height) ══ */}
      <div className="relative flex-1 min-h-0" style={{ background: "#0a0706" }}>
        <GoldenRays />

        {/* Cabin photo — object-contain so full cabin is always visible */}
        <motion.img
          src={cabin.imageUrl}
          alt={cabin.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "contain", objectPosition: "center center" }}
        />

        {/* Subtle bottom fade into the info strip */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* TOP-LEFT: AI badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur border border-amber-500/40 px-2.5 py-1.5 rounded-lg z-10"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">AI Matched Design</p>
            {analysis && <p className="text-[8px] text-white/50 mt-0.5 max-w-[140px] truncate leading-tight">{analysis}</p>}
          </div>
        </motion.div>

        {/* TOP-RIGHT: Score gauge card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute top-3 right-3 bg-black/65 backdrop-blur border border-amber-500/20 rounded-xl p-2.5 z-10 flex flex-col items-center gap-1"
        >
          <ScoreGauge value={matchScore} />
          <p className="text-[7px] uppercase tracking-widest text-amber-500/50 text-center leading-tight">
            Match Score
          </p>
          <p className="text-[7px] text-white/35 text-center leading-tight">
            Perfect harmony<br/>with your interior
          </p>
        </motion.div>

        {/* RIGHT EDGE: Spec callout lines */}
        <div className="absolute inset-y-0 right-0 z-10 pointer-events-none" style={{ width: "145px" }}>
          {specLines.map((s, i) => (
            <SpecLine key={s.label} label={s.label} value={s.value} delay={0.7 + i * 0.12} topPct={s.topPct} />
          ))}
        </div>

        {/* BOTTOM-LEFT: 3D thumb */}
        <motion.button
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          onClick={on3D}
          className="absolute bottom-3 left-3 z-10 group flex flex-col items-center gap-1 bg-black/60 backdrop-blur border border-amber-500/20 hover:border-amber-500/50 rounded-lg p-1.5 transition-all"
        >
          <div className="w-12 h-10 rounded overflow-hidden border border-amber-500/15">
            <img src={cabin.thumbnailUrl || cabin.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity" />
          </div>
          <div className="flex items-center gap-1">
            <Box className="w-2.5 h-2.5 text-amber-400" />
            <p className="text-[7px] text-white/45 uppercase tracking-wider leading-none">Drag to rotate</p>
          </div>
          <p className="text-[6px] text-white/30 uppercase tracking-widest leading-none">360° view</p>
        </motion.button>
      </div>

      {/* ══ BOTTOM INFO STRIP ══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        style={{ background: "#080504" }}
        className="flex-shrink-0"
      >
        {/* Name + desc  |  WhatsApp button */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.25em] text-amber-400/55 mb-0.5">Selected Design</p>
            <h2 className="text-base font-serif text-white tracking-wide leading-tight truncate">
              {cabin.name.toUpperCase()}
            </h2>
            {cabin.description && (
              <p className="text-[10px] text-white/40 leading-snug mt-0.5 line-clamp-2">{cabin.description}</p>
            )}
          </div>

          {/* WhatsApp CTA — right side, golden style matching reference */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onWhatsApp}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl px-4 py-3 font-semibold text-[11px] transition-colors border border-amber-700/40"
            style={{ background: "linear-gradient(135deg, #7a5c0a, #a07810)", minWidth: "130px" }}
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-white font-bold text-[11px] leading-tight text-left">GET YOUR QUOTE<br/>ON WHATSAPP</span>
              <span className="text-white/60 text-sm">→</span>
            </div>
          </motion.button>
        </div>

        <p className="text-[8px] text-white/25 text-center pb-1.5 flex items-center justify-center gap-1.5">
          <Shield className="w-2.5 h-2.5" />
          No commitment · Instant response
        </p>

        {/* Stats bar */}
        {statItems.length > 0 && (
          <div className="border-t border-amber-500/10 px-3 py-2 flex items-center divide-x divide-amber-500/10 overflow-x-auto">
            {statItems.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 first:pl-0 last:pr-0 flex-shrink-0">
                {s.icon}
                <div>
                  <p className="text-[7px] uppercase tracking-widest text-amber-500/40 leading-none">{s.label}</p>
                  <p className="text-[9px] text-white/65 leading-tight mt-0.5 whitespace-nowrap">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
