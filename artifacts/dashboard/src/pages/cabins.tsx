import { useEffect, useRef, useState } from "react";
import { apiGetCabins, apiToggleCabin, apiCreateCabin, apiDeleteCabin, apiUploadFile, apiObjectUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Package, Loader2, Plus, X, Trash2,
  Image, Tag, Ruler, AlertCircle, Upload, Link, Check
} from "lucide-react";

interface Cabin {
  id: number;
  name: string;
  style: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  isEnabled: boolean;
  specs: {
    ceiling: string; wallPanels: string; handrail: string;
    flooring: string; lighting: string; capacity: string;
    finish: string; warranty: string;
  };
}

const EMPTY_FORM = {
  name: "", style: "", description: "", imageUrl: "", thumbnailUrl: "", tags: "",
  ceiling: "", wallPanels: "", handrail: "", flooring: "",
  lighting: "", capacity: "", finish: "", warranty: "",
};

type ImageMode = "url" | "upload";

export default function Cabins() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGetCabins().then(setCabins).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggle = async (cabin: Cabin) => {
    setToggling(cabin.id);
    try {
      await apiToggleCabin(cabin.id, !cabin.isEnabled);
      setCabins(cs => cs.map(c => c.id === cabin.id ? { ...c, isEnabled: !c.isEnabled } : c));
    } finally {
      setToggling(null);
    }
  };

  const deleteCabin = async (cabin: Cabin) => {
    if (!confirm(`Delete "${cabin.name}"? This cannot be undone.`)) return;
    setDeleting(cabin.id);
    try {
      await apiDeleteCabin(cabin.id);
      setCabins(cs => cs.filter(c => c.id !== cabin.id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10 MB");
      return;
    }
    setUploadError("");
    setUploading(true);
    setUploadedPath(null);
    setUploadedPreview(null);
    try {
      const objectPath = await apiUploadFile(file);
      setUploadedPath(objectPath);
      setUploadedPreview(URL.createObjectURL(file));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let finalImageUrl = form.imageUrl;
    if (imageMode === "upload") {
      if (!uploadedPath) {
        setError("Please upload a cabin image first");
        return;
      }
      finalImageUrl = apiObjectUrl(uploadedPath);
    } else {
      if (!finalImageUrl) {
        setError("Please provide an image URL");
        return;
      }
    }

    setSaving(true);
    try {
      const newCabin = await apiCreateCabin({ ...form, imageUrl: finalImageUrl, thumbnailUrl: finalImageUrl });
      setCabins(cs => [...cs, { ...newCabin, isEnabled: true }]);
      setShowAdd(false);
      setForm(EMPTY_FORM);
      setUploadedPath(null);
      setUploadedPreview(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create cabin");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setUploadedPath(null);
    setUploadedPreview(null);
    setUploadError("");
    setError("");
    setImageMode("upload");
  };

  const enabled = cabins.filter(c => c.isEnabled).length;

  const previewUrl = imageMode === "upload"
    ? uploadedPreview
    : form.imageUrl || null;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Cabin Designs</h1>
          <p className="text-muted-foreground mt-1">{enabled} of {cabins.length} designs active for your widget</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-primary-foreground gradient-gold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Cabin Design
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-muted-foreground">
        <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <span>The AI matches customers against <strong className="text-foreground">enabled</strong> cabins only. New cabins you add are enabled for all tenants by default.</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : cabins.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No cabin designs yet</p>
          <p className="text-sm mt-1">Click "Add Cabin Design" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {cabins.map(cabin => (
              <motion.div
                key={cabin.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${cabin.isEnabled ? "border-border" : "border-border/30 opacity-60"}`}
              >
                <div className="relative aspect-video">
                  <img
                    src={cabin.thumbnailUrl || cabin.imageUrl}
                    alt={cabin.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/400x225/111/555?text=No+Image"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Status badge */}
                  <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cabin.isEnabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-secondary/80 text-muted-foreground border border-border"}`}>
                    {cabin.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {cabin.isEnabled ? "Active" : "Disabled"}
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={() => deleteCabin(cabin)}
                    disabled={deleting === cabin.id}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-destructive/80 flex items-center justify-center transition-colors"
                    title="Delete cabin"
                  >
                    {deleting === cabin.id ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Trash2 className="w-3 h-3 text-white" />}
                  </button>

                  <div className="absolute bottom-3 left-3 right-8">
                    <p className="text-white font-semibold text-sm truncate">{cabin.name}</p>
                    <p className="text-white/60 text-xs">{cabin.style}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {cabin.specs.capacity && (
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      {cabin.specs.flooring && <span>Floor: <span className="text-foreground">{cabin.specs.flooring.split(" ").slice(0, 2).join(" ")}</span></span>}
                      <span>Cap: <span className="text-foreground">{cabin.specs.capacity}</span></span>
                    </div>
                  )}
                  {cabin.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cabin.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => toggle(cabin)}
                    disabled={toggling === cabin.id}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      cabin.isEnabled
                        ? "border border-destructive/50 text-destructive/70 hover:bg-destructive/10"
                        : "border border-primary/50 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {toggling === cabin.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    {cabin.isEnabled ? "Disable for my widget" : "Enable for my widget"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Cabin Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Add Cabin Design</h2>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                {/* Basic Info */}
                <Section icon={<Package className="w-4 h-4" />} title="Basic Information">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Cabin Name *">
                      <input type="text" required value={form.name} onChange={e => set("name", e.target.value)}
                        className="input-base" placeholder="e.g. Modern Luxury Cabin" />
                    </Field>
                    <Field label="Style *">
                      <input type="text" required value={form.style} onChange={e => set("style", e.target.value)}
                        className="input-base" placeholder="e.g. Modern Luxury" />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea value={form.description} onChange={e => set("description", e.target.value)}
                      className="input-base h-20 resize-none py-2.5" placeholder="Describe this cabin design..." />
                  </Field>
                </Section>

                {/* Images */}
                <Section icon={<Image className="w-4 h-4" />} title="Cabin Image">
                  {/* Mode toggle */}
                  <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl w-fit mb-4">
                    <button
                      type="button"
                      onClick={() => { setImageMode("upload"); setUploadError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        imageMode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageMode("url"); setUploadError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        imageMode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      Image URL
                    </button>
                  </div>

                  {imageMode === "upload" ? (
                    <div>
                      {/* Drop zone */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      />
                      {!uploadedPreview ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            dragOver
                              ? "border-primary bg-primary/5 scale-[1.01]"
                              : "border-border hover:border-primary/50 hover:bg-secondary/30"
                          }`}
                        >
                          {uploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                              <p className="text-sm text-muted-foreground">Uploading image...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Drop image here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · Max 10 MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-secondary/50 border border-border group">
                          <img src={uploadedPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5"
                            >
                              <Upload className="w-3 h-3" />
                              Replace
                            </button>
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            Uploaded
                          </div>
                        </div>
                      )}
                      {uploadError && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive mt-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {uploadError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Field label="Image URL *">
                        <input type="url" value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)}
                          className="input-base" placeholder="https://example.com/cabin-photo.jpg" />
                        <p className="text-xs text-muted-foreground mt-1">Use any public image URL — Unsplash, your CDN, etc.</p>
                      </Field>
                      {form.imageUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-secondary/50 border border-border">
                          <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                    </div>
                  )}
                </Section>

                {/* Tags */}
                <Section icon={<Tag className="w-4 h-4" />} title="Tags">
                  <Field label="Tags (comma-separated)">
                    <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)}
                      className="input-base" placeholder="marble, luxury, gold, modern, led" />
                    <p className="text-xs text-muted-foreground mt-1">The AI uses these tags to match customers to this design</p>
                  </Field>
                </Section>

                {/* Specs */}
                <Section icon={<Ruler className="w-4 h-4" />} title="Technical Specifications">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "ceiling", label: "Ceiling" },
                      { key: "wallPanels", label: "Wall Panels" },
                      { key: "handrail", label: "Handrail" },
                      { key: "flooring", label: "Flooring" },
                      { key: "lighting", label: "Lighting" },
                      { key: "capacity", label: "Capacity" },
                      { key: "finish", label: "Finish" },
                      { key: "warranty", label: "Warranty" },
                    ].map(({ key, label }) => (
                      <Field key={key} label={label}>
                        <input type="text" value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
                          className="input-base" placeholder={`e.g. ${getPlaceholder(key)}`} />
                      </Field>
                    ))}
                  </div>
                </Section>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 py-3 rounded-xl font-semibold text-primary-foreground gradient-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {saving ? "Creating..." : "Add Cabin"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function getPlaceholder(key: string): string {
  const map: Record<string, string> = {
    ceiling: "Stainless Steel Mirror", wallPanels: "Italian Marble",
    handrail: "Polished Steel", flooring: "Porcelain Tile",
    lighting: "LED Spotlights", capacity: "8 persons / 630 kg",
    finish: "Mirror Polish", warranty: "5 years",
  };
  return map[key] ?? "";
}
