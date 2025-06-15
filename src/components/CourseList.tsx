
import CourseCard from "./CourseCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sampleCourses: never[] = [];

const CourseList = () => {
  const navigate = useNavigate();
  return (
    <section id="courses">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Study Essentials</h2>
      {/* Timetable Card */}
      <div className="mb-8 flex justify-end">
        <div className="w-full md:w-[380px] bg-white border rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-semibold text-blue-700 text-lg mb-2">
              Timetable
            </h3>
            <p className="text-slate-700 mb-6 text-sm">
              View your class timetable and schedule.
            </p>
          </div>
          <Button
            className="mt-auto w-full bg-blue-600 text-white text-base font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
            size="lg"
            onClick={() => navigate("/timetable")}
          >
            Timetable
          </Button>
        </div>
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
};

export default CourseList;
