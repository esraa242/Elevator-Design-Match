import { useEffect, useState } from "react";
import { apiGetUsage, apiGetLeads } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Users, Zap, TrendingUp, Award, ArrowUpRight, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";

interface UsageData {
  currentMonth: number;
  usageLimit: number;
  plan: string;
  totalLeads: number;
  leadsThisWeek: number;
  averageMatchScore: number;
  history: Array<{ month: string; requestsCount: number }>;
}

interface Lead {
  id: number;
  name: string;
  phone: string;
  matchScore: number;
  createdAt: string;
  cabinName: string;
}

export default function Overview() {
  const { tenant } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetUsage(), apiGetLeads()])
      .then(([u, l]) => { setUsage(u); setLeads(l); })
      .finally(() => setLoading(false));
  }, []);

  const usagePct = usage ? Math.round((usage.currentMonth / usage.usageLimit) * 100) : 0;
  const recentLeads = leads.slice(0, 5);

  const stats = [
    { label: "Total Leads", value: usage?.totalLeads ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "This Week", value: usage?.leadsThisWeek ?? 0, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Avg Match Score", value: `${usage?.averageMatchScore ?? 0}%`, icon: Award, color: "text-primary", bg: "bg-primary/10" },
    { label: "API Calls (month)", value: `${usage?.currentMonth ?? 0}/${usage?.usageLimit ?? 50}`, icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-foreground">Welcome back, {tenant?.name} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's how your elevator matcher is performing.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "—" : s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Usage Bar */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Monthly API Usage</h3>
            <span className="text-xs text-muted-foreground capitalize">{usage?.plan} plan</span>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{usage?.currentMonth ?? 0} requests used</span>
              <span className={`font-medium ${usagePct > 80 ? "text-destructive" : "text-primary"}`}>{usagePct}%</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${usagePct > 80 ? "bg-destructive" : "gradient-gold"}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePct, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{(usage?.usageLimit ?? 50) - (usage?.currentMonth ?? 0)} requests remaining this month</p>
          </div>

          {/* Usage History Chart */}
          {usage?.history && usage.history.length > 0 && (
            <div className="mt-6 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...usage.history].reverse()} barSize={20}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "#666" }} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff" }} />
                  <Bar dataKey="requestsCount" radius={[4, 4, 0, 0]}>
                    {usage.history.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "#b8960c" : "#2a2a2a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Leads</h3>
            <a href="/dashboard/leads" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-secondary/50 rounded-lg animate-pulse" />)}</div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No leads yet</div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {lead.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.cabinName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-primary">{lead.matchScore}%</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
