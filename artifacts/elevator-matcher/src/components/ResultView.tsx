import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Grid3x3, BarChart2, Heart, MessageCircle,
  Settings, Sparkles, Bot, Shield, Cpu, UserCheck, Lock
} from "lucide-react";
import { CabinViewer } from "./CabinViewer";
import { MatchPanel } from "./MatchPanel";
import { DesignCarousel } from "./DesignCarousel";

interface Cabin {
  id: number;
  name: string;
  style: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  specs: {
    ceiling?: string;
    wallPanels?: string;
    handrail?: string;
    flooring?: string;
    lighting?: string;
    capacity?: string;
    finish?: string;
    warranty?: string;
    style?: string;
  };
}

interface CabinMatch {
  cabin: Cabin;
  matchScore: number;
}

interface ResultViewProps {
  matches: CabinMatch[];
  activeIndex: number;
  interiorStyle: string;
  analysis: string;
  onSelectMatch: (idx: number) => void;
  onWhatsApp: () => void;
  on3D: () => void;
  onNewPhoto: () => void;
}

/* ── Left nav ── */
const NAV_ITEMS = [
  { icon: Star,         label: "Best Match",   active: true },
  { icon: Grid3x3,      label: "All Designs",  active: false },
  { icon: BarChart2,    label: "My Analyses",  active: false },
  { icon: Heart,        label: "Favorites",    active: false },
  { icon: MessageCircle,label: "Contact Us",   active: false },
];

function LeftNav({ onNewPhoto }: { onNewPhoto: () => void }) {
  return (
    <nav
      className="flex-shrink-0 flex flex-col items-center py-4 gap-1"
      style={{
        width: 64,
        background: "rgba(6,4,2,0.95)",
        borderRight: "1px solid rgba(184,150,12,0.1)",
      }}
    >
      {/* Logo mark */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #7a5c0a, #d4a830)" }}
      >
        <span className="text-black font-black text-sm">E</span>
      </div>

      {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          title={label}
          className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl w-full transition-all hover:bg-white/5"
          style={{ opacity: active ? 1 : 0.45 }}
        >
          <Icon className="w-4 h-4" style={{ color: active ? "#d4a830" : "rgba(255,255,255,0.7)" }} />
          <span className="text-[8px] leading-none text-center" style={{ color: active ? "#d4a830" : "rgba(255,255,255,0.5)" }}>
            {label.split(" ")[0]}
          </span>
        </button>
      ))}

      <div className="flex-1" />

      {/* New photo / reset */}
      <button
        onClick={onNewPhoto}
        title="New Analysis"
        className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl w-full hover:bg-white/5 transition-all opacity-50 hover:opacity-80"
      >
        <Settings className="w-4 h-4 text-white/50" />
        <span className="text-[7px] text-white/40 text-center leading-tight">New<br/>Photo</span>
      </button>

      <div className="flex flex-col items-center gap-0.5 mt-1 px-1">
        <Cpu className="w-3.5 h-3.5 text-amber-500/40" />
        <span className="text-[6px] text-white/25 text-center leading-tight">Powered<br/>by AI</span>
      </div>
    </nav>
  );
}

/* ── Header ── */
function Header({ analysis }: { analysis: string }) {
  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b"
      style={{ borderColor: "rgba(184,150,12,0.12)", background: "rgba(6,4,2,0.7)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7a5c0a, #d4a830)" }}
        >
          <span className="text-black font-black text-xs">E</span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/80 leading-none">ELEVATOR</p>
          <p className="text-[8px] text-amber-500/60 leading-none tracking-wider">DESIGN STUDIO</p>
        </div>
      </div>

      {/* Center title */}
      <div className="text-center">
        <h1 className="text-sm font-bold tracking-widest flex items-center gap-1.5 justify-center" style={{ color: "#d4a830" }}>
          AI MATCHED DESIGN <Sparkles className="w-3.5 h-3.5" />
        </h1>
        <p className="text-[10px] text-white/45">Designed specifically for your villa</p>
      </div>

      {/* Right badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{ border: "1px solid rgba(184,150,12,0.25)", background: "rgba(184,150,12,0.06)" }}
      >
        <Bot className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-amber-400/80">AI Optimized Design</span>
      </motion.div>
    </header>
  );
}

/* ── Trust footer ── */
function TrustBar() {
  const items = [
    { icon: <Cpu className="w-3.5 h-3.5 text-amber-500" />,      title: "AI Analyzed",     sub: "Advanced AI technology" },
    { icon: <UserCheck className="w-3.5 h-3.5 text-amber-500" />, title: "Tailored for You", sub: "Designed for your villa style" },
    { icon: <Shield className="w-3.5 h-3.5 text-amber-500" />,    title: "Premium Quality",  sub: "Luxury materials & finishes" },
    { icon: <Lock className="w-3.5 h-3.5 text-amber-500" />,      title: "Secure & Private", sub: "We never share your information." },
  ];
  return (
    <div
      className="flex-shrink-0 flex items-center divide-x px-4 py-2"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {items.map(item => (
        <div key={item.title} className="flex items-center gap-2 flex-1 px-3 first:pl-0 last:pr-0">
          {item.icon}
          <div>
            <p className="text-[9px] font-semibold text-white/70 leading-none">{item.title}</p>
            <p className="text-[8px] text-white/35 leading-tight mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── CTA bar ── */
function CTABar({ onWhatsApp }: { onWhatsApp: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex-shrink-0 mx-4 mb-2 rounded-2xl flex items-center justify-between px-5 py-3"
      style={{
        background: "linear-gradient(135deg, rgba(20,14,4,0.95), rgba(14,10,2,0.95))",
        border: "1px solid rgba(184,150,12,0.2)",
        boxShadow: "0 0 30px rgba(184,150,12,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(184,150,12,0.12)", border: "1px solid rgba(184,150,12,0.2)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-400">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">Get Your Custom Elevator Quote</p>
          <p className="text-[10px] text-white/40">No commitment • Instant WhatsApp response</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onWhatsApp}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm"
        style={{
          background: "linear-gradient(135deg, #8a6510, #c89620, #f0b830)",
          color: "#000",
          boxShadow: "0 0 20px rgba(184,150,12,0.3)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        GET QUOTE ON WHATSAPP →
      </motion.button>
    </motion.div>
  );
}

/* ══ Main ResultView ══ */
export function ResultView({
  matches, activeIndex, interiorStyle, analysis,
  onSelectMatch, onWhatsApp, on3D, onNewPhoto
}: ResultViewProps) {
  const active = matches[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen overflow-hidden"
      style={{ background: "#080604", color: "#fff" }}
    >
      <LeftNav onNewPhoto={onNewPhoto} />

      {/* Right: full content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header analysis={analysis} />

        {/* ── Main viewer + match panel ── */}
        <div className="flex gap-3 px-4 pt-3 min-h-0" style={{ flex: "0 0 52%" }}>
          {/* Cabin viewer 70% */}
          <div className="min-w-0" style={{ flex: "7" }}>
            <CabinViewer
              imageUrl={active.cabin.imageUrl}
              cabinName={active.cabin.name}
              specs={active.cabin.specs}
              on3D={on3D}
            />
          </div>
          {/* Match panel 30% */}
          <div className="min-w-0" style={{ flex: "3" }}>
            <MatchPanel matchScore={active.matchScore} />
          </div>
        </div>

        {/* ── Design info + carousel ── */}
        <div className="flex items-center gap-4 px-4 pt-3 pb-1 min-h-0" style={{ flex: "0 0 22%" }}>
          {/* Design info left */}
          <div className="flex-shrink-0" style={{ width: "220px" }}>
            <p className="text-[8px] uppercase tracking-[0.25em] font-semibold mb-1" style={{ color: "#d4a830" }}>
              Selected Design
            </p>
            <h2 className="text-lg font-serif text-white leading-tight mb-1">
              {active.cabin.name}
            </h2>
            <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">
              {active.cabin.description}
            </p>
          </div>

          {/* Carousel right */}
          <div className="flex-1 min-w-0 h-full pb-5">
            <DesignCarousel
              matches={matches}
              activeIndex={activeIndex}
              onSelect={onSelectMatch}
            />
          </div>
        </div>

        {/* ── CTA ── */}
        <CTABar onWhatsApp={onWhatsApp} />

        {/* ── Trust footer ── */}
        <TrustBar />
      </div>
    </motion.div>
  );
}
