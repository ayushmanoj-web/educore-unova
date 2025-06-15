
import CourseCard from "./CourseCard";
import { Button } from "@/components/ui/button";

const sampleCourses: never[] = [];

const CourseList = () => (
  <section id="courses">
    <h2 className="text-2xl font-bold text-blue-900 mb-4">Study Essentials</h2>
    <div className="mb-6 flex justify-end">
      <Button
        variant="secondary"
        className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
        // Placeholder click; you can later link this to a route or modal
        onClick={() => { /* add navigation or modal code here */ }}
      >
        Textbooks
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* No courses to display */}
      {sampleCourses.length === 0 && (
        <div className="col-span-full text-slate-500 text-center py-10 text-lg font-medium">
          No courses available.
        </div>
      )}
    </div>
  </section>
);

export default CourseList;

