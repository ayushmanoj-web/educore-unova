
import DashboardHero from "@/components/DashboardHero";
import CourseList from "@/components/CourseList";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIBot from "@/components/AIBot";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, TrendingUp, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50 animate-fade-in">
      <main className="max-w-6xl mx-auto">
        <DashboardHero />
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link to="/teacher-chat">
            <Button className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <MessageCircle className="mr-3 h-6 w-6" />
              Chat with Teachers
            </Button>
          </Link>
          <Link to="/progress">
            <Button className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg">
              <TrendingUp className="mr-3 h-6 w-6" />
              Progress Tracker
            </Button>
          </Link>
          <Link to="/attendance">
            <Button className="w-full h-16 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
              <Calendar className="mr-3 h-6 w-6" />
              Your Attendance
            </Button>
          </Link>
          <Link to="/extra-curriculars">
            <Button className="w-full h-16 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
              <Calendar className="mr-3 h-6 w-6" />
              Extra Curriculars
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10">
          <section className="flex-1">
            <CourseList />
          </section>
        </div>
      </main>
      <AIBot />
      <FloatingChatButton />
    </div>
  );
};

export default Index;
