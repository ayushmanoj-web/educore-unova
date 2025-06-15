
import CourseCard from "./CourseCard";

const sampleCourses = [
  {
    title: "Math Mastery 101",
    description: "Fun, interactive lessons to build math confidence.",
    progress: 85,
  },
  {
    title: "Science Explorers",
    description: "Discover the wonders of the world through experiments.",
    progress: 60,
  },
  {
    title: "History Adventures",
    description: "Travel to the past and meet famous figures in history.",
    progress: 35,
  },
];

const CourseList = () => (
  <section id="courses">
    <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Courses</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {sampleCourses.map((course, i) => (
        <CourseCard key={i} {...course} />
      ))}
    </div>
  </section>
);

export default CourseList;
