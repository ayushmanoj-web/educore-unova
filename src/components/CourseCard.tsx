
import React from "react";

interface CourseCardProps {
  title: string;
  description: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description }) => (
  <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col gap-2 border border-slate-100">
    <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
    <p className="text-sm text-slate-700">{description}</p>
  </div>
);

export default CourseCard;
