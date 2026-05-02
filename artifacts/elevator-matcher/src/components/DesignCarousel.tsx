import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Match {
  cabin: {
    id: number;
    name: string;
    imageUrl: string;
  };
  matchScore: number;
}

interface DesignCarouselProps {
  matches: Match[];
  activeIndex: number;
  onSelect: (idx: number) => void;
}

const LABELS = ["Best Match", "Alternative", "Budget Option", "Option 4", "Option 5", "Option 6", "Option 7"];

export function DesignCarousel({ matches, activeIndex, onSelect }: DesignCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-2 h-full">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <ChevronLeft className="w-4 h-4 text-white/60" />
      </button>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex-1 flex gap-2.5 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {matches.map((m, idx) => {
          const isActive = idx === activeIndex;
          return (
            <motion.button
              key={m.cabin.id}
              onClick={() => onSelect(idx)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex-shrink-0 rounded-xl overflow-hidden transition-all"
              style={{
                width: "140px",
                height: "100%",
                border: isActive ? "2px solid #d4a830" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? "0 0 20px rgba(184,150,12,0.35), 0 0 6px rgba(184,150,12,0.15)" : "none",
              }}
            >
              <img
                src={m.cabin.imageUrl}
                alt={m.cabin.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Label badge */}
              <div
                className="absolute top-2 left-0 right-0 flex justify-center"
              >
                <span
                  className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(184,150,12,0.9)" : "rgba(0,0,0,0.65)",
                    color: isActive ? "#000" : "rgba(255,255,255,0.7)",
                    border: isActive ? "none" : "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {LABELS[idx] ?? `Option ${idx + 1}`}
                </span>
              </div>

              {/* Score */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="text-[10px] font-bold text-amber-400">{m.matchScore}%</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <ChevronRight className="w-4 h-4 text-white/60" />
      </button>

      {/* Dot indicators */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {matches.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === activeIndex ? "#d4a830" : "rgba(255,255,255,0.2)" }}
          />
        ))}
      </div>
    </div>
  );
}
