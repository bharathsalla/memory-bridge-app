import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { VoiceOverProvider } from "@/contexts/VoiceOverContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TabletVitals from "./pages/TabletVitals";
import LockScreenNotifications from "./pages/LockScreenNotifications";
import CrisisLive from "./pages/CrisisLive";
import PreventionPlan from "./pages/PreventionPlan";
import SmartHomeGPS from "./pages/SmartHomeGPS";
import RiskResolution from "./pages/RiskResolution";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <VoiceOverProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tablet-vitals" element={<TabletVitals />} />
              <Route path="/lock-screen" element={<LockScreenNotifications />} />
              <Route path="/crisis-live" element={<CrisisLive />} />
              <Route path="/prevention-plan" element={<PreventionPlan />} />
              <Route path="/smart-home" element={<SmartHomeGPS />} />
              <Route path="/risk-resolution" element={<RiskResolution />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </VoiceOverProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
