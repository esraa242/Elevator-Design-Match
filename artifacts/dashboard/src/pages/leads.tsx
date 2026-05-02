import { useEffect, useState } from "react";
import { apiGetLeads } from "@/lib/api";
import { format } from "date-fns";
import { Search, Download, MessageSquare, Award } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  phone: string;
  matchScore: number;
  createdAt: string;
  cabinName: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGetLeads().then(setLeads).finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.cabinName.toLowerCase().includes(search.toLowerCase())
  );

  const exportCsv = () => {
    const header = "Name,Phone,Cabin,Match Score,Date\n";
    const rows = leads.map(l =>
      `"${l.name}","${l.phone}","${l.cabinName}",${l.matchScore}%,"${format(new Date(l.createdAt), "yyyy-MM-dd HH:mm")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
  };

  const openWhatsApp = (phone: string, name: string, cabin: string, score: number) => {
    const msg = encodeURIComponent(`Hi ${name}! Following up on your elevator match — ${score}% match with ${cabin}. Ready to discuss?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">{leads.length} total leads captured</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary/50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search leads..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 bg-card border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matched Cabin</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td colSpan={5} className="px-6 py-4"><div className="h-6 bg-secondary/50 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No leads found</td></tr>
            ) : (
              filtered.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {lead.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{lead.cabinName}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">
                      <Award className="w-3 h-3" />
                      {lead.matchScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(lead.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openWhatsApp(lead.phone, lead.name, lead.cabinName, lead.matchScore)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-xs font-medium transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
