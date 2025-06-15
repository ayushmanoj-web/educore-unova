
import CourseList from "@/components/CourseList";

const Courses = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-6 py-10">
      <main className="max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900 tracking-tight">
          Your Courses
        </h1>
        <p className="text-lg mb-8 text-slate-700 max-w-2xl">
          All your enrolled courses are listed here. Track your progress and continue learning!
        </p>
        <CourseList />
      </main>
    </div>
  );
};

export default Courses;
