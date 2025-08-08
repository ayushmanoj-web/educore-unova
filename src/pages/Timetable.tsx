
import React from "react";

// Helper function to get current user profile
function getCurrentUser() {
  try {
    const data = localStorage.getItem("student-profiles");
    const profiles = data ? JSON.parse(data) : [];
    return profiles.length > 0 ? profiles[profiles.length - 1] : null;
  } catch {
    return null;
  }
}

const Timetable = () => {
  const currentUser = getCurrentUser();
  const userClassDivision = currentUser ? `${currentUser.class}${currentUser.division}` : null;
  const canViewTimetable = userClassDivision === "9A";

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-4 py-10 flex flex-col items-center">
        <main className="w-full max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center tracking-tight">
            Class Timetable
          </h1>
          <div className="flex justify-center items-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border text-center">
              <p className="text-gray-600 mb-2">Please set up your profile first</p>
              <p className="text-sm text-gray-500">Go to Profile page to create your profile and access your class timetable</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!canViewTimetable) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-4 py-10 flex flex-col items-center">
        <main className="w-full max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center tracking-tight">
            Class Timetable
          </h1>
          <div className="flex justify-center items-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border text-center">
              <p className="text-gray-600 mb-2">Timetable for {userClassDivision} is not available</p>
              <p className="text-sm text-gray-500">The current timetable is specific to class 9A. Please contact your teacher for your class timetable.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-4 py-10 flex flex-col items-center">
      <main className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center tracking-tight">
          Class {userClassDivision} Timetable
        </h1>
        <div className="flex justify-center items-center">
          <img
            src="/lovable-uploads/3e963fc2-ed72-4d26-94ca-466d6837870b.png"
            alt="Class 9A Timetable"
            className="rounded-xl shadow-lg max-w-full h-auto border"
            style={{ background: "white" }}
          />
        </div>
      </main>
    </div>
  );
};

export default Timetable;
