import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

import Index from "./pages/Index.tsx";
import Courses from "./pages/Courses.tsx";
import Downloads from "./pages/Downloads.tsx";
import Notifications from "./pages/Notifications.tsx";
import Timetable from "./pages/Timetable.tsx";
import Textbooks from "./pages/Textbooks.tsx";
import Attendance from "./pages/Attendance.tsx";
import Progress from "./pages/Progress.tsx";
import Profile from "./pages/Profile.tsx";
import Leave from "./pages/Leave.tsx";
import TeacherChat from "./pages/TeacherChat.tsx";
import LiveChatPage from "./pages/LiveChatPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ExtraCurriculars from "./pages/ExtraCurriculars.tsx";
import ClubApplication from "./pages/ClubApplication.tsx";
import ClubApplications from "./pages/ClubApplications.tsx";
import ClubChat from "./pages/ClubChat.tsx";
import ClubManagement from "./pages/ClubManagement.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Index />} />
          <Route path="courses" element={<Courses />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="textbooks" element={<Textbooks />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="progress" element={<Progress />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leave" element={<Leave />} />
          <Route path="teacher-chat" element={<TeacherChat />} />
          <Route path="live-chat" element={<LiveChatPage />} />
          <Route path="extra-curriculars" element={<ExtraCurriculars />} />
          <Route path="club-application/:clubId" element={<ClubApplication />} />
          <Route path="club-applications/:clubId" element={<ClubApplications />} />
          <Route path="club-chat/:clubId" element={<ClubChat />} />
          <Route path="club-management/:clubId" element={<ClubManagement />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
