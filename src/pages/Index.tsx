
import DashboardHero from "../components/DashboardHero";
import CourseList from "../components/CourseList";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-slate-50 via-white to-blue-50 flex flex-col items-center">
      <div className="w-full max-w-3xl mt-8 px-4">
        <DashboardHero />
        <CourseList />
        <section className="mt-8 py-8 w-full flex flex-col items-center bg-white bg-opacity-60 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2 text-blue-800">Ready to start learning?</h3>
          <p className="text-slate-700 mb-4 text-center max-w-lg">
            Access a variety of resources and connect with a community of learners and teachers. Visit <a href="/downloads" className="text-blue-600 underline font-medium">Downloads</a> to get started or check the <a href="/notifications" className="text-blue-600 underline font-medium">Notifications</a> page for updates.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Index;
