import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Downloads from "./pages/Downloads";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import Textbooks from "./pages/Textbooks";
import BottomNav from "./components/BottomNav";
import Timetable from "./pages/Timetable";
import LiveChatPage from "./pages/LiveChatPage";
import WhatsAppChatPage from "./pages/WhatsAppChatPage";
import DevadarMedia from "./pages/DevadarMedia";
import Leave from "./pages/Leave";
import TeacherChat from "./pages/TeacherChat";
import TeacherMessagesPage from "./pages/TeacherMessagesPage";
import Progress from "./pages/Progress";
import Attendance from "./pages/Attendance";
import ExtraCurriculars from "./pages/ExtraCurriculars";
import ClubApplication from "./pages/ClubApplication";
import ClubApplications from "./pages/ClubApplications";
import ClubChat from "./pages/ClubChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="pb-16 min-h-screen relative">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/textbooks" element={<Textbooks />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/chat" element={<LiveChatPage />} />
        <Route path="/whatsapp-chat" element={<WhatsAppChatPage />} />
        <Route path="/devadar-media" element={<DevadarMedia />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/teacher-chat" element={<TeacherChat />} />
            <Route path="/teacher-messages" element={<TeacherMessagesPage />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/extra-curriculars" element={<ExtraCurriculars />} />
            <Route path="/club-application/:clubId" element={<ClubApplication />} />
            <Route path="/club-applications/:clubId" element={<ClubApplications />} />
            <Route path="/club-chat/:clubId" element={<ClubChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
