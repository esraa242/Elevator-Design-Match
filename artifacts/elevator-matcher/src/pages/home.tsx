import React, { useState, useRef } from "react";
import { useAnalyzeAndMatch, useCreateLead } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CabinViewer3D } from "@/components/CabinViewer3D";
import { CabinMatchCard } from "@/components/CabinMatchCard";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageBase64(await fileToBase64(file));
      setMimeType(file.type);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file));
      setImageBase64(await fileToBase64(file));
      setMimeType(file.type);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setStep(2);
    try {
      await analyzeMutation.mutateAsync({ data: { imageBase64, mimeType: mimeType || "image/jpeg" } });
      setStep(3);
    } catch (e) {
      console.error(e);
      setStep(1);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadName || !leadPhone || !analyzeMutation.data) return;
    const match = analyzeMutation.data.matches[activeMatchIndex];
    try {
      await createLeadMutation.mutateAsync({
        data: { name: leadName, phone: leadPhone, cabinId: match.cabin.id, matchScore: match.matchScore }
      });
      const message = encodeURIComponent(
        `Hi! I used your elevator matcher and got a ${match.cabin.name} match with ${match.matchScore}% compatibility. I'd like a quote.`
      );
      window.open(`https://wa.me/971501234567?text=${message}`, '_blank');
      setShowLeadModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const activeMatch = analyzeMutation.data?.matches[activeMatchIndex];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center"
          >
            <div className="mb-10 space-y-4">
              <h4 className="text-primary tracking-[0.2em] text-sm uppercase font-semibold">Ascend Elevators</h4>
              <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">
                Discover Your Perfect Cabin
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload a photo of your interior space. Our AI will analyze your style and match you with the ideal luxury elevator design.
              </p>
            </div>

            {/* Drop zone */}
            <div
              className={`w-full max-w-xl aspect-video border-2 border-dashed rounded-2xl overflow-hidden bg-card/50 flex flex-col items-center justify-center cursor-pointer relative group transition-all ${
                dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-secondary hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
              {imagePreview ? (
                <div className="absolute inset-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border border-white/10">Change Photo</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your interior photo here</p>
                    <p className="text-sm mt-1 text-muted-foreground/70">or click to browse — JPG, PNG, WebP</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!imageBase64}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg rounded-full shadow-[0_0_40px_rgba(184,150,12,0.3)]"
              >
                Analyze My Interior <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="mt-8 flex gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> AI-Powered</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Instant Results</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> No Commitment</span>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Analyzing ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen text-center px-6"
          >
            <div className="relative w-48 h-48 mb-8">
              {imagePreview && (
                <img src={imagePreview} className="w-full h-full object-cover rounded-full opacity-20 animate-pulse" alt="" />
              )}
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" style={{ animationDuration: "1.2s" }} />
              <div className="absolute inset-2 border-t border-primary/30 rounded-full animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-12 h-12" />
            </div>
            <h2 className="text-3xl font-serif text-foreground mb-4">Curating Your Match</h2>
            <div className="text-muted-foreground space-y-2">
              {["Analyzing architectural style...", "Extracting dominant color palettes...", "Searching luxury collections..."].map((t, i) => (
                <p key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{t}</p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Sidebar + card ── */}
        {step === 3 && analyzeMutation.data && activeMatch && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden"
          >
            {/* ── LEFT SIDEBAR ── */}
            <aside className="w-52 flex-shrink-0 border-r border-amber-500/10 bg-black/60 backdrop-blur flex flex-col h-full">
              <div className="px-4 pt-5 pb-3 border-b border-amber-500/10">
                <p className="text-[9px] uppercase tracking-widest text-amber-500/60 leading-none">AI Matches</p>
                <p className="text-[11px] text-white/40 mt-0.5">{analyzeMutation.data.interiorStyle}</p>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {analyzeMutation.data.matches.map((m, idx) => (
                  <button
                    key={m.cabin.id}
                    onClick={() => setActiveMatchIndex(idx)}
                    className={`flex-1 flex items-center gap-2.5 px-3 text-left transition-all group min-h-0 ${
                      idx === activeMatchIndex
                        ? "bg-amber-500/10 border-r-2 border-amber-500"
                        : "hover:bg-white/5 border-r-2 border-transparent"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={m.cabin.imageUrl}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-semibold truncate leading-tight ${idx === activeMatchIndex ? "text-amber-400" : "text-white/70"}`}>
                        {m.cabin.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${m.matchScore}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-amber-400 font-bold flex-shrink-0">{m.matchScore}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-amber-500/10">
                <button
                  onClick={() => { setStep(1); setImagePreview(null); setImageBase64(null); analyzeMutation.reset(); }}
                  className="w-full text-[10px] text-white/40 hover:text-white/70 transition-colors py-1.5 flex items-center justify-center gap-1.5"
                >
                  <span>↩</span> New Photo
                </button>
              </div>
            </aside>

            {/* ── MAIN: card ── */}
            <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
              <CabinMatchCard
                cabin={activeMatch.cabin as Parameters<typeof CabinMatchCard>[0]["cabin"]}
                matchScore={activeMatch.matchScore}
                analysis={`${analyzeMutation.data.interiorStyle} · ${analyzeMutation.data.styleKeywords.slice(0, 3).join(", ")}`}
                onWhatsApp={() => setShowLeadModal(true)}
                on3D={() => setShow3DViewer(true)}
              />
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── 3D Viewer modal ── */}
      {show3DViewer && activeMatch && (
        <CabinViewer3D
          imageUrl={activeMatch.cabin.imageUrl}
          cabinName={activeMatch.cabin.name}
          matchScore={activeMatch.matchScore}
          onClose={() => setShow3DViewer(false)}
        />
      )}

      {/* ── Lead capture modal ── */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Get Your Custom Quote</DialogTitle>
            <DialogDescription>
              Enter your details to receive pricing for the{" "}
              <strong className="text-foreground">{activeMatch?.cabin.name}</strong> on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={leadName} onChange={e => setLeadName(e.target.value)} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number</Label>
              <Input id="phone" placeholder="+971 50 123 4567" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} className="bg-background border-border" />
            </div>
          </div>
          <Button
            onClick={handleLeadSubmit}
            disabled={!leadName || !leadPhone || createLeadMutation.isPending}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white"
          >
            Continue to WhatsApp
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
