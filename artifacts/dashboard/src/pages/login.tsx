import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiLogin, apiRegister } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, Lock, User, Phone, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", whatsappNumber: "" });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await apiLogin(form.email, form.password);
      } else {
        result = await apiRegister(form.name, form.email, form.password, form.whatsappNumber || undefined);
      }
      login(result.token, result.tenant);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary/8 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Ascend Platform</h1>
          <p className="text-muted-foreground mt-2 text-sm">SaaS Dashboard for Elevator Companies</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-8 bg-secondary/50 p-1 rounded-xl">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Sign In" : "Get Started"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === "register" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <InputField icon={<User className="w-4 h-4" />} type="text" placeholder="Company Name" value={form.name} onChange={v => set("name", v)} required />
                  <InputField icon={<Phone className="w-4 h-4" />} type="text" placeholder="WhatsApp Number (e.g. 971501234567)" value={form.whatsappNumber} onChange={v => set("whatsappNumber", v)} />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField icon={<Mail className="w-4 h-4" />} type="email" placeholder="Email address" value={form.email} onChange={v => set("email", v)} required />
            <InputField icon={<Lock className="w-4 h-4" />} type="password" placeholder="Password" value={form.password} onChange={v => set("password", v)} required />

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-primary-foreground gradient-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Demo: <span className="text-primary font-mono">demo@ascend.com / demo1234</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, required }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full h-12 bg-input border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      />
    </div>
  );
}
