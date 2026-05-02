import React, { useState, useRef } from "react";
import { useAnalyzeAndMatch, useCreateLead } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle, Sparkles, Layers, Maximize2, Lightbulb, Smartphone, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CabinViewer3D } from "@/components/CabinViewer3D";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

const CircularProgress = ({ value, label }: { value: number, label: string }) => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="283"
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (283 * value) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-serif text-primary font-bold">{value}%</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      const b64 = await fileToBase64(file);
      setImageBase64(b64);
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
      setStep(1); // fallback
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadName || !leadPhone || !analyzeMutation.data) return;
    const match = analyzeMutation.data.matches[activeMatchIndex];
    
    try {
      await createLeadMutation.mutateAsync({
        data: {
          name: leadName,
          phone: leadPhone,
          cabinId: match.cabin.id,
          matchScore: match.matchScore
        }
      });
      
      const message = encodeURIComponent(`Hi! I used your elevator matcher tool and got a ${match.cabin.name} match with ${match.matchScore}% compatibility. I'd like to learn more.`);
      window.open(`https://wa.me/971501234567?text=${message}`, '_blank');
      setShowLeadModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center"
          >
            <div className="mb-12 space-y-4">
              <h4 className="text-primary tracking-[0.2em] text-sm uppercase font-semibold">Ascend Elevators</h4>
              <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">
                Discover Your Perfect Cabin
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload a photo of your interior space. Our AI will analyze your style and match you with the ideal luxury elevator design from our collection.
              </p>
            </div>

            <div 
              className="w-full max-w-xl aspect-video border-2 border-dashed border-secondary hover:border-primary/50 transition-colors rounded-xl overflow-hidden bg-card/50 flex flex-col items-center justify-center cursor-pointer relative group"
              onClick={() => fileInputRef.current?.click()}
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
                  <p>Drag and drop or click to upload interior photo</p>
                </div>
              )}
            </div>

            <div className="mt-12">
              <Button size="lg" onClick={handleAnalyze} disabled={!imageBase64} className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg rounded-full">
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

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen text-center"
          >
            <div className="relative w-48 h-48 mb-8">
              {imagePreview && <img src={imagePreview} className="w-full h-full object-cover rounded-full opacity-30 animate-pulse-slow" />}
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin duration-1000"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary w-12 h-12" />
            </div>
            <h2 className="text-2xl font-serif text-foreground mb-4">Curating Your Match</h2>
            <div className="text-muted-foreground space-y-2 h-20">
              <p className="animate-pulse">Analyzing architectural style...</p>
              <p className="animate-pulse delay-150">Extracting dominant color palettes...</p>
              <p className="animate-pulse delay-300">Searching luxury collections...</p>
            </div>
          </motion.div>
        )}

        {step === 3 && analyzeMutation.data && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-6 lg:p-12 relative flex flex-col lg:flex-row gap-8 lg:gap-16"
          >
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Left: Cabin Image */}
            <div className="w-full lg:w-1/2 relative min-h-[60vh] lg:min-h-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={analyzeMutation.data.matches[activeMatchIndex].cabin.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cabin" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/50 text-primary px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase">
                  <Sparkles className="w-4 h-4" /> AI Matched Design
                </div>
                <button
                  onClick={() => setShow3DViewer(true)}
                  className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 hover:border-primary/60 text-white hover:text-primary px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-all group"
                >
                  <Box className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  View in 3D
                </button>
              </div>

              <div className="absolute top-6 right-6">
                <CircularProgress value={analyzeMutation.data.matches[activeMatchIndex].matchScore} label="Match Score" />
              </div>

              {/* Title & Desc */}
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-2">{analyzeMutation.data.matches[activeMatchIndex].cabin.name}</h2>
                <p className="text-gray-300 max-w-lg mb-6">{analyzeMutation.data.matches[activeMatchIndex].cabin.description}</p>
                
                {/* Stats Bar */}
                <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-gray-400 pt-6 border-t border-white/10">
                   <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> {analyzeMutation.data.matches[activeMatchIndex].cabin.specs.style || 'Custom'}</div>
                   <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> {analyzeMutation.data.matches[activeMatchIndex].cabin.specs.lighting}</div>
                   <div className="flex items-center gap-2"><Maximize2 className="w-4 h-4 text-primary" /> {analyzeMutation.data.matches[activeMatchIndex].cabin.specs.capacity}</div>
                </div>
              </div>
            </div>

            {/* Right: Details & CTA */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-12 py-8">
              
              <div>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Material Specifications</h3>
                <div className="space-y-6">
                  {['ceiling', 'wallPanels', 'handrail', 'flooring'].map((specKey) => {
                    const cabin = analyzeMutation.data!.matches[activeMatchIndex].cabin;
                    const val = cabin.specs[specKey as keyof typeof cabin.specs];
                    if(!val) return null;
                    return (
                      <div key={specKey} className="flex items-start gap-4 pb-6 border-b border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{specKey.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-lg text-foreground">{val}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <Button 
                  onClick={() => setShowLeadModal(true)} 
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white h-16 text-lg rounded-xl font-medium shadow-[0_0_40px_rgba(37,211,102,0.3)] transition-all hover:shadow-[0_0_60px_rgba(37,211,102,0.4)]"
                >
                  <Smartphone className="mr-2 w-6 h-6" />
                  Get Your Quote on WhatsApp
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">No commitment • Instant response</p>
              </div>

              {analyzeMutation.data.matches.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Alternative Matches</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {analyzeMutation.data.matches.map((match, idx) => {
                      if(idx === activeMatchIndex) return null;
                      return (
                        <div 
                          key={match.cabin.id} 
                          onClick={() => setActiveMatchIndex(idx)}
                          className="min-w-[160px] cursor-pointer group"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                            <img src={match.cabin.thumbnailUrl || match.cabin.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded">{match.matchScore}%</div>
                          </div>
                          <div className="mt-2 text-sm text-foreground truncate">{match.cabin.name}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {show3DViewer && analyzeMutation.data && (
        <CabinViewer3D
          imageUrl={analyzeMutation.data.matches[activeMatchIndex].cabin.imageUrl}
          cabinName={analyzeMutation.data.matches[activeMatchIndex].cabin.name}
          matchScore={analyzeMutation.data.matches[activeMatchIndex].matchScore}
          onClose={() => setShow3DViewer(false)}
        />
      )}

      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Get Your Custom Quote</DialogTitle>
            <DialogDescription>
              Enter your details to receive pricing for the <strong className="text-foreground">{analyzeMutation.data?.matches[activeMatchIndex]?.cabin.name}</strong> directly on WhatsApp.
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
