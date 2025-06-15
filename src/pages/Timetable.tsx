
import React from "react";

const Timetable = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-4 py-10 flex flex-col items-center">
      <main className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center tracking-tight">
          Class Timetable
        </h1>
        <div className="flex justify-center items-center">
          <img
            src="/lovable-uploads/3e963fc2-ed72-4d26-94ca-466d6837870b.png"
            alt="Class Timetable"
            className="rounded-xl shadow-lg max-w-full h-auto border"
            style={{ background: "white" }}
          />
        </div>
      </main>
    </div>
  );
};

export default Timetable;
