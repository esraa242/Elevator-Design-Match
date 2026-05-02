import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Layers, Lightbulb, Sparkles, RotateCcw } from "lucide-react";

interface CabinViewerProps {
  imageUrl: string;
  cabinName: string;
  specs: {
    wallPanels?: string;
    lighting?: string;
    finish?: string;
    ceiling?: string;
  };
  on3D: () => void;
}

export function CabinViewer({ imageUrl, cabinName, specs, on3D }: CabinViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const specRows = [
    { icon: <Layers className="w-3 h-3" />,   label: "Material", value: specs.wallPanels || "Italian Wood Panels" },
    { icon: <Lightbulb className="w-3 h-3" />, label: "Lighting", value: specs.lighting  || "Crystal Lighting 2700K" },
    { icon: <Sparkles className="w-3 h-3" />,  label: "Finish",   value: specs.finish    || "Handcrafted Finish" },
  ];

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800 }}
      className="relative h-full w-full"
    >
      <motion.div
        style={{
          rotateX, rotateY,
          transformStyle: "preserve-3d",
          background: "radial-gradient(ellipse 75% 80% at 50% 50%, rgba(110,75,8,0.22) 0%, rgba(8,6,4,1) 68%)",
          boxShadow: "0 0 0 1px rgba(184,150,12,0.15), 0 0 60px rgba(184,150,12,0.12), inset 0 0 80px rgba(0,0,0,0.35)",
        } as React.CSSProperties}
        initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-full w-full rounded-2xl overflow-hidden"
      >
        {/* Cabin image */}
        <img
          src={imageUrl}
          alt={cabinName}
          className="w-full h-full object-contain"
          style={{ objectPosition: "center" }}
        />

        {/* Light sweep animation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,220,120,0.06) 50%, transparent 60%)",
          }}
        />

        {/* Glass reflection top-right */}
        <div
          className="absolute top-0 right-0 w-2/3 h-1/3 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 70%)",
            borderRadius: "0 16px 0 0",
          }}
        />

        {/* Edge glow */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
          boxShadow: "inset 0 0 40px rgba(184,150,12,0.06)",
        }} />

        {/* Technical spec card — top-left */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute top-3 left-3 z-10 rounded-xl overflow-hidden"
          style={{
            background: "rgba(6,4,2,0.72)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            minWidth: "170px",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(184,150,12,0.07)" }}
          >
            <div className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="text-[8px] uppercase tracking-[0.2em] font-semibold text-amber-400/70">
              Specifications
            </span>
          </div>

          {/* Rows */}
          <div className="px-3 py-2 flex flex-col gap-2">
            {specRows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="flex items-center gap-2"
              >
                <span className="text-amber-500/50 flex-shrink-0">{row.icon}</span>
                <span className="text-[9px] text-white/35 uppercase tracking-wider w-12 flex-shrink-0">
                  {row.label}
                </span>
                <span className="text-[10px] text-white/85 font-medium leading-tight">
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 360° rotate hint — bottom-left */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={on3D}
          whileHover={{ scale: 1.04 }}
          className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(8,6,4,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-white/70">Drag to rotate 360°</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
