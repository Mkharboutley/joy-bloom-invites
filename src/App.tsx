import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import VideoBackground from "@/components/VideoBackground";
import Index from "./pages/Index";
import ConfirmationPage from "./pages/ConfirmationPage";
import QRScanResult from "./pages/QRScanResult";
import AdminDashboard from "./pages/AdminDashboard";
import WeddingInvitation from "./pages/WeddingInvitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isWeddingPage = location.pathname === '/wedding';

  const handleVideoError = () => {
    console.log('Video failed to load from /G22.mp4');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /G22.mp4');
  };

  return (
    <>
      {!isAdminPage && !isWeddingPage && (
        <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/wedding" element={<WeddingInvitation />} />
        <Route path="/confirmation/:guestId" element={<ConfirmationPage />} />
        <Route path="/scan/:invitationId" element={<QRScanResult />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;