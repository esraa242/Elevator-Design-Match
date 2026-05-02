import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout";
import Login from "@/pages/login";
import Overview from "@/pages/overview";
import Leads from "@/pages/leads";
import Usage from "@/pages/usage";
import Cabins from "@/pages/cabins";
import Branding from "@/pages/branding";
import WidgetEmbed from "@/pages/widget-embed";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { tenant, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
  if (!tenant) return <Redirect to="/dashboard/login" />;
  return <DashboardLayout><Component /></DashboardLayout>;
}

function Router() {
  const { tenant, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/dashboard/login" component={Login} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Overview} />}
      </Route>
      <Route path="/dashboard/leads">
        {() => <ProtectedRoute component={Leads} />}
      </Route>
      <Route path="/dashboard/usage">
        {() => <ProtectedRoute component={Usage} />}
      </Route>
      <Route path="/dashboard/cabins">
        {() => <ProtectedRoute component={Cabins} />}
      </Route>
      <Route path="/dashboard/branding">
        {() => <ProtectedRoute component={Branding} />}
      </Route>
      <Route path="/dashboard/widget">
        {() => <ProtectedRoute component={WidgetEmbed} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
