import { useEffect, useState } from "react";
import { apiGetUsage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Zap, TrendingUp, Award, Users, Crown } from "lucide-react";

interface UsageData {
  currentMonth: number;
  usageLimit: number;
  plan: string;
  totalLeads: number;
  leadsThisWeek: number;
  averageMatchScore: number;
  history: Array<{ month: string; requestsCount: number }>;
}

const PLANS: Record<string, { limit: number; price: string; features: string[] }> = {
  starter: { limit: 50, price: "Free", features: ["50 analyses/month", "All cabin designs", "WhatsApp CTA", "Lead tracking"] },
  pro: { limit: 500, price: "$49/mo", features: ["500 analyses/month", "Priority AI", "Custom branding", "CSV export", "Analytics"] },
  enterprise: { limit: 5000, price: "Custom", features: ["5000 analyses/month", "Dedicated support", "SLA", "White-label", "API access"] },
};

export default function Usage() {
  const { tenant } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetUsage().then(setUsage).finally(() => setLoading(false));
  }, []);

  const usagePct = usage ? Math.round((usage.currentMonth / usage.usageLimit) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-foreground">Usage & Statistics</h1>
        <p className="text-muted-foreground mt-1">Track your API usage and performance metrics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads", value: usage?.totalLeads ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Leads This Week", value: usage?.leadsThisWeek ?? 0, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Avg Match Score", value: `${usage?.averageMatchScore ?? 0}%`, icon: Award, color: "text-primary", bg: "bg-primary/10" },
          { label: "This Month", value: `${usage?.currentMonth ?? 0}/${usage?.usageLimit ?? 50}`, icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "—" : s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Usage bar */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Current Month Usage</h3>
          <span className={`text-sm font-bold ${usagePct > 80 ? "text-destructive" : usagePct > 60 ? "text-yellow-400" : "text-primary"}`}>{usagePct}% used</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden mb-2">
          <motion.div
            className={`h-full rounded-full ${usagePct > 80 ? "bg-destructive" : "gradient-gold"}`}
            initial={{ width: 0 }} animate={{ width: `${Math.min(usagePct, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{usage?.currentMonth ?? 0} used</span>
          <span>{(usage?.usageLimit ?? 50) - (usage?.currentMonth ?? 0)} remaining</span>
        </div>
      </div>

      {/* History chart */}
      {usage?.history && usage.history.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-6">12-Month Usage History</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...usage.history].reverse()} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#666" }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="requestsCount" name="API Calls" fill="#b8960c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-primary" /> Available Plans</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = tenant?.plan === key;
            return (
              <div key={key} className={`bg-card rounded-xl p-5 border transition-all ${isCurrent ? "border-primary/50 shadow-[0_0_24px_rgba(184,150,12,0.15)]" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize text-foreground">{key}</h4>
                  {isCurrent && <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">Current</span>}
                </div>
                <div className="text-2xl font-bold text-foreground mb-4">{plan.price}</div>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button className="w-full mt-4 py-2 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                    Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
