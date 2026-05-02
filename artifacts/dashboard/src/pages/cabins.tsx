import { useEffect, useState } from "react";
import { apiGetCabins, apiToggleCabin } from "@/lib/api";
import { Toggle, CheckCircle, XCircle, Package, Loader2 } from "lucide-react";

interface Cabin {
  id: number;
  name: string;
  style: string;
  imageUrl: string;
  thumbnailUrl: string;
  isEnabled: boolean;
  specs: { ceiling: string; wallPanels: string; handrail: string; flooring: string; lighting: string; capacity: string };
}

export default function Cabins() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    apiGetCabins().then(setCabins).finally(() => setLoading(false));
  }, []);

  const toggle = async (cabin: Cabin) => {
    setToggling(cabin.id);
    try {
      await apiToggleCabin(cabin.id, !cabin.isEnabled);
      setCabins(cs => cs.map(c => c.id === cabin.id ? { ...c, isEnabled: !c.isEnabled } : c));
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  };

  const enabled = cabins.filter(c => c.isEnabled).length;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Cabin Designs</h1>
          <p className="text-muted-foreground mt-1">{enabled} of {cabins.length} designs active for your widget</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Package className="w-4 h-4 text-primary" />
          AI matches against enabled designs only
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {cabins.map(cabin => (
            <div key={cabin.id} className={`bg-card border rounded-xl overflow-hidden transition-all ${cabin.isEnabled ? "border-border" : "border-border/30 opacity-60"}`}>
              <div className="relative aspect-video">
                <img src={cabin.thumbnailUrl || cabin.imageUrl} alt={cabin.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cabin.isEnabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-secondary/80 text-muted-foreground border border-border"}`}>
                  {cabin.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {cabin.isEnabled ? "Active" : "Disabled"}
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-semibold text-sm">{cabin.name}</p>
                  <p className="text-white/60 text-xs">{cabin.style}</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Floor: <span className="text-foreground">{cabin.specs.flooring?.split(" ").slice(0, 2).join(" ")}</span></span>
                  <span>Cap: <span className="text-foreground">{cabin.specs.capacity}</span></span>
                </div>
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
                  {cabin.isEnabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
