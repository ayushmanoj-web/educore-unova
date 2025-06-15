
import { GraduationCap } from "lucide-react";

const DashboardHero = () => (
  <header className="flex items-center gap-8 bg-gradient-to-r from-blue-100 via-white to-green-100 p-8 rounded-2xl mb-10 shadow">
    <div className="flex-shrink-0 bg-blue-200 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
      <GraduationCap size={40} className="text-blue-700" />
    </div>
    <div>
      <h1 className="text-4xl font-bold mb-2 text-blue-900 tracking-tighter">Welcome to Educore</h1>
      <p className="text-lg text-slate-700 mb-4 max-w-xl">
        Discover courses, complete fun assignments, and track your learning progress and see everything about your education— all in one place!
      </p>
      <a
        href="#courses"
        className="inline-block font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform duration-150 animate-fade-in"
      >
        Browse Courses
      </a>
    </div>
  </header>
);

export default DashboardHero;
