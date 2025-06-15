
import React from "react";
import CourseCard from "./CourseCard";

const courses = [
  {
    title: "Mathematics Essentials",
    description: "Master foundational math concepts from algebra to calculus with interactive lessons."
  },
  {
    title: "Introduction to Programming",
    description: "Learn coding basics using Python and JavaScript with hands-on exercises."
  },
  {
    title: "Creative Writing",
    description: "Unlock your writing potential with guided workshops and expert feedback."
  }
];

const CourseList = () => (
  <section className="w-full my-8">
    <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">Featured Courses</h2>
    <div className="grid md:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.title} {...course} />
      ))}
    </div>
  </section>
);

export default CourseList;
