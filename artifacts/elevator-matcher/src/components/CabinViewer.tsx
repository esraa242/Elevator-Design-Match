import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Layers, Lightbulb, Square, RotateCcw } from "lucide-react";

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

  const materialTags = [
    { icon: <Layers className="w-3 h-3" />, text: specs.wallPanels || "Italian Marble" },
    { icon: <Lightbulb className="w-3 h-3" />, text: specs.lighting || "LED Lighting 3000K" },
    { icon: <Square className="w-3 h-3" />, text: specs.finish || "Black Glass Finish" },
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
          background: "#0a0806",
          boxShadow: "0 0 0 1px rgba(184,150,12,0.15), 0 0 40px rgba(184,150,12,0.08), inset 0 0 60px rgba(0,0,0,0.4)",
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

        {/* Material tags — top-left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {materialTags.map((tag, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(8,6,4,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(184,150,12,0.2)" }}
            >
              <span className="text-amber-400">{tag.icon}</span>
              <span className="text-[10px] text-white/80 font-medium">{tag.text}</span>
            </motion.div>
          ))}
        </div>

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
