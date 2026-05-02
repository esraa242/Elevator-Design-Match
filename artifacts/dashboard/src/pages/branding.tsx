import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiUpdateMe } from "@/lib/api";
import { motion } from "framer-motion";
import { Palette, Save, CheckCircle, Loader2, Eye } from "lucide-react";

export default function Branding() {
  const { tenant, refresh } = useAuth();
  const [form, setForm] = useState({
    name: tenant?.name ?? "",
    logoUrl: tenant?.logoUrl ?? "",
    primaryColor: tenant?.primaryColor ?? "#b8960c",
    accentColor: tenant?.accentColor ?? "#ffffff",
    whatsappNumber: tenant?.whatsappNumber ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiUpdateMe(form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-foreground">Brand Settings</h1>
        <p className="text-muted-foreground mt-1">Customize how your elevator matcher looks to visitors.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          <Card title="Company Identity">
            <Field label="Company Name">
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                className="input-base" placeholder="Your Company Name" />
            </Field>
            <Field label="Logo URL">
              <input type="url" value={form.logoUrl} onChange={e => set("logoUrl", e.target.value)}
                className="input-base" placeholder="https://your-domain.com/logo.png" />
            </Field>
            <Field label="WhatsApp Number">
              <input type="text" value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)}
                className="input-base" placeholder="971501234567" />
              <p className="text-xs text-muted-foreground mt-1">International format, no + or spaces</p>
            </Field>
          </Card>

          <Card title="Brand Colors">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Color">
                <div className="flex gap-2">
                  <input type="color" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent" />
                  <input type="text" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)}
                    className="input-base flex-1 font-mono text-sm" />
                </div>
              </Field>
              <Field label="Accent Color">
                <div className="flex gap-2">
                  <input type="color" value={form.accentColor} onChange={e => set("accentColor", e.target.value)}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent" />
                  <input type="text" value={form.accentColor} onChange={e => set("accentColor", e.target.value)}
                    className="input-base flex-1 font-mono text-sm" />
                </div>
              </Field>
            </div>
          </Card>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground gradient-gold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Eye className="w-3 h-3" /> Widget Preview
          </p>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 rounded" style={{ background: form.primaryColor }} />
              )}
              <span className="text-sm font-semibold text-foreground">{form.name || "Your Company"}</span>
            </div>
            <div className="h-px bg-border" />
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: form.primaryColor, color: form.accentColor }}
            >
              🏢 Find My Elevator
            </button>
            <p className="text-xs text-muted-foreground text-center">This is how the floating button appears</p>
          </div>

          <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">WhatsApp Link Preview</p>
            <a
              href={`https://wa.me/${form.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#25D366] break-all hover:underline"
            >
              wa.me/{form.whatsappNumber || "971501234567"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
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

declare module "react" {
  interface HTMLAttributes<T> {
    class?: string;
  }
}
