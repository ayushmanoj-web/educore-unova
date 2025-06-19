
import DashboardHero from "@/components/DashboardHero";
import CourseList from "@/components/CourseList";
import FloatingChatButton from "@/components/FloatingChatButton";

const Index = () => {
  return (
    <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50 animate-fade-in">
      <main className="max-w-6xl mx-auto">
        <DashboardHero />
        <div className="flex flex-col md:flex-row gap-10">
          <section className="flex-1">
            <CourseList />
          </section>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
};

export default Index;
