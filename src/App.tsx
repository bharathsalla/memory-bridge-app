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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </VoiceOverProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
