
import React from "react";

const Textbooks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-6 py-10 animate-fade-in">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 tracking-tight">
          Textbooks
        </h1>
        <p className="text-lg mb-6 text-slate-700">
          Here you'll find all your available textbooks. Select one to begin reading or download for offline use.
        </p>
        <div className="rounded-xl border bg-white p-8 shadow flex flex-col items-center justify-center min-h-[320px]">
          <span className="text-slate-500 font-medium text-lg">
            No textbooks available yet.
          </span>
        </div>
      </main>
    </div>
  );
};

export default Textbooks;

