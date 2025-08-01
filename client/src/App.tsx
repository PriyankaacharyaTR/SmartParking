import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import QRGenerator from "@/pages/qr-generator";
import BookingForm from "@/pages/booking-form";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { UsersProvider } from "@/hooks/use-users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QRGenerator} />
      <Route path="/qr" component={QRGenerator} />
      <Route path="/book" component={BookingForm} />
      <Route path="/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UsersProvider>
    </QueryClientProvider>
  );
}

export default App;
