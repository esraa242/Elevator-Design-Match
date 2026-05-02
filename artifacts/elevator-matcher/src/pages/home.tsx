import React, { useState, useRef, useEffect } from "react";
import { useAnalyzeAndMatch, useCreateLead } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CabinViewer3D } from "@/components/CabinViewer3D";
import { ResultView } from "@/components/ResultView";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (err) => reject(err);
  });
}

/* ── Cinematic loading screen ── */
const LOADING_STEPS = [
  "Analyzing your villa...",
  "Matching materials...",
  "Generating best design...",
];

function LoadingScreen({ imagePreview }: { imagePreview: string | null }) {
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1)), 2800);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen gap-8"
      style={{ background: "#080604" }}
    >
      {/* Cinematic image reveal */}
      <div className="relative w-56 h-56">
        {imagePreview && (
          <motion.img
            src={imagePreview}
            alt=""
            initial={{ opacity: 0.15, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 0.35, scale: 1, filter: "blur(2px)" }}
            transition={{ duration: 1.2 }}
            className="w-full h-full object-cover rounded-2xl"
          />
        )}
        {/* Spinning ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-full h-full rounded-2xl"
            style={{ border: "2px solid transparent", borderTopColor: "#d4a830", borderRadius: "16px" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full"
            style={{ width: "75%", height: "75%", border: "1px solid rgba(184,150,12,0.3)", borderBottomColor: "#d4a830" }}
          />
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 60px rgba(184,150,12,0.15)" }} />
      </div>

      {/* Step messages */}
      <div className="flex flex-col items-center gap-3">
        {LOADING_STEPS.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: i <= stepIdx ? 1 : 0.2, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i < stepIdx ? "#d4a830" : i === stepIdx ? "#f0d060" : "rgba(255,255,255,0.15)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: i === stepIdx ? "#f0d060" : i < stepIdx ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}
            >
              {s}
            </span>
            {i < stepIdx && <CheckCircle className="w-3.5 h-3.5 text-amber-500" />}
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-white/25 tracking-widest uppercase">AI-Powered Analysis</p>
    </motion.div>
  );
}

/* ── Upload screen ── */
function UploadScreen({
  imagePreview, dragOver, fileInputRef,
  onFileChange, onDrop, onDragOver, onDragLeave, onAnalyze, canAnalyze,
}: {
  imagePreview: string | null;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
}) {
  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ background: "#080604" }}
    >
      {/* Header badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
        style={{ background: "rgba(184,150,12,0.1)", border: "1px solid rgba(184,150,12,0.25)" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs text-amber-400 font-medium tracking-widest uppercase">AI Design Studio</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h1 className="text-4xl md:text-6xl font-serif text-white mb-3 tracking-tight">
          Discover Your Perfect<br />
          <span style={{ color: "#d4a830" }}>Elevator Design</span>
        </h1>
        <p className="text-white/45 text-base max-w-xl mx-auto mb-10">
          Upload a photo of your villa or interior space. Our AI will analyze your style and curate the ideal luxury cabin design.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-lg mb-8 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div
          className="relative aspect-video rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all"
          style={{
            background: dragOver ? "rgba(184,150,12,0.08)" : "rgba(255,255,255,0.02)",
            border: dragOver ? "2px dashed #d4a830" : "2px dashed rgba(255,255,255,0.1)",
            boxShadow: dragOver ? "0 0 40px rgba(184,150,12,0.15)" : "none",
          }}
        >
          <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={onFileChange} />

          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="px-4 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-sm text-white/80">Click to change photo</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(184,150,12,0.1)", border: "1px solid rgba(184,150,12,0.2)" }}>
                <UploadCloud className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-white/75 font-medium mb-1">Drop your interior photo here</p>
                <p className="text-white/35 text-sm">or click to browse — JPG, PNG, WebP</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="h-14 px-10 rounded-2xl text-base font-bold transition-all"
          style={{
            background: canAnalyze ? "linear-gradient(135deg, #8a6510, #c89620, #f0b830)" : "rgba(255,255,255,0.07)",
            color: canAnalyze ? "#000" : "rgba(255,255,255,0.3)",
            boxShadow: canAnalyze ? "0 0 40px rgba(184,150,12,0.35)" : "none",
            border: "none",
          }}
        >
          Analyze My Interior <Sparkles className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex gap-8 mt-8 text-sm text-white/35">
        {["AI-Powered", "Instant Results", "No Commitment"].map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-500/60" /> {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ══ Page ══ */
export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useAnalyzeAndMatch();
  const createLeadMutation = useCreateLead();

  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImagePreview(URL.createObjectURL(file));
    setImageBase64(await fileToBase64(file));
    setMimeType(file.type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setStep(2);
    setActiveMatchIndex(0);
    try {
      await analyzeMutation.mutateAsync({ data: { imageBase64, mimeType: mimeType ?? "image/jpeg" } });
      setStep(3);
    } catch {
      setStep(1);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadName || !leadPhone || !analyzeMutation.data) return;
    const match = analyzeMutation.data.matches[activeMatchIndex];
    try {
      await createLeadMutation.mutateAsync({
        data: { name: leadName, phone: leadPhone, cabinId: match.cabin.id, matchScore: match.matchScore },
      });
      const msg = encodeURIComponent(
        `Hi! I used your AI elevator matcher and got a ${match.cabin.name} match with ${match.matchScore}% compatibility. I'd like a quote.`
      );
      window.open(`https://wa.me/971501234567?text=${msg}`, "_blank");
      setShowLeadModal(false);
    } catch {}
  };

  const handleNewPhoto = () => {
    setStep(1);
    setImagePreview(null);
    setImageBase64(null);
    analyzeMutation.reset();
  };

  const activeMatch = analyzeMutation.data?.matches[activeMatchIndex];

  return (
    <div className="font-sans selection:bg-amber-500/30">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <UploadScreen
            key="step1"
            imagePreview={imagePreview}
            dragOver={dragOver}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onAnalyze={handleAnalyze}
            canAnalyze={!!imageBase64}
          />
        )}

        {step === 2 && (
          <LoadingScreen key="step2" imagePreview={imagePreview} />
        )}

        {step === 3 && analyzeMutation.data && activeMatch && (
          <ResultView
            key="step3"
            matches={analyzeMutation.data.matches as Parameters<typeof ResultView>[0]["matches"]}
            activeIndex={activeMatchIndex}
            interiorStyle={analyzeMutation.data.interiorStyle}
            analysis={`${analyzeMutation.data.interiorStyle} · ${analyzeMutation.data.styleKeywords.slice(0, 3).join(", ")}`}
            onSelectMatch={setActiveMatchIndex}
            onWhatsApp={() => setShowLeadModal(true)}
            on3D={() => setShow3DViewer(true)}
            onNewPhoto={handleNewPhoto}
          />
        )}
      </AnimatePresence>

      {/* 3D Viewer */}
      {show3DViewer && activeMatch && (
        <CabinViewer3D
          imageUrl={activeMatch.cabin.imageUrl}
          cabinName={activeMatch.cabin.name}
          matchScore={activeMatch.matchScore}
          onClose={() => setShow3DViewer(false)}
        />
      )}

      {/* Lead modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="sm:max-w-md border-amber-500/20 bg-[#0f0c08] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-white">Get Your Custom Quote</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter your details to receive pricing for the{" "}
              <strong className="text-amber-400">{activeMatch?.cabin.name}</strong> on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-white/70">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={leadName} onChange={e => setLeadName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/70">WhatsApp Number</Label>
              <Input id="phone" placeholder="+971 50 123 4567" value={leadPhone} onChange={e => setLeadPhone(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
            </div>
          </div>
          <Button
            onClick={handleLeadSubmit}
            disabled={!leadName || !leadPhone || createLeadMutation.isPending}
            className="w-full font-bold h-11 rounded-xl"
            style={{ background: "linear-gradient(135deg, #8a6510, #c89620, #f0b830)", color: "#000", border: "none" }}
          >
            Continue to WhatsApp →
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
