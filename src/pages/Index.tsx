
import DashboardHero from "@/components/DashboardHero";
import CourseList from "@/components/CourseList";

const Index = () => {
  return (
    <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50 animate-fade-in">
      <main className="max-w-6xl mx-auto">
        <DashboardHero />
        <div className="flex flex-col md:flex-row gap-10">
          <section className="flex-1">
            <CourseList />
          </section>
          <aside className="w-full md:w-[340px] flex-shrink-0 flex flex-col gap-8 pt-4">
            <div className="bg-white border rounded-xl p-6 shadow space-y-2 animate-fade-in">
              <h3 className="font-semibold text-green-700 text-lg mb-1">Assignments</h3>
              <ul className="space-y-1 text-slate-700 text-sm">
                <li>• Solve 3 math puzzles this week</li>
                <li>• Science Lab: Build a volcano model</li>
                <li>• Write about your favorite historical figure</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl border p-6 shadow animate-fade-in">
              <h3 className="font-semibold text-blue-800 text-lg mb-1">For Teachers</h3>
              <p className="text-sm text-slate-700 mb-2">
                Ready to inspire learning? Manage your classes and assignments here.
              </p>
              <a
                href="#"
                className="font-medium text-blue-700 hover:underline story-link hover-scale"
              >
                Go to Teacher Panel
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
