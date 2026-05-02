import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, BarChart2, Palette, Package, Code2, LogOut, Building2, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Overview" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/usage", icon: BarChart2, label: "Usage & Stats" },
  { href: "/cabins", icon: Package, label: "Cabin Designs" },
  { href: "/branding", icon: Palette, label: "Branding" },
  { href: "/widget", icon: Code2, label: "Widget Embed" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { tenant, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{tenant?.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                {tenant?.plan ?? "starter"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = href === "/" ? location === "/" : location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <a className={`sidebar-link ${isActive ? "active" : ""}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="w-full sidebar-link text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
