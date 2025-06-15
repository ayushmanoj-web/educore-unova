
import React from "react";

const DashboardHero = () => (
  <section className="bg-blue-600 rounded-lg shadow p-8 flex flex-col items-center justify-center text-white mb-8">
    <h1 className="text-2xl md:text-4xl font-bold mb-2 text-center">Welcome to Educore</h1>
    <p className="text-lg md:text-xl mb-4 text-center max-w-xl">
      Your trusted platform for accessible, high-quality education. Discover courses, download resources, and connect with peers and educators.
    </p>
    <a
      href="/downloads"
      className="inline-block bg-white text-blue-700 font-semibold px-6 py-2 rounded shadow hover:bg-blue-50 transition"
    >
      Explore Downloads
    </a>
  </section>
);

export default DashboardHero;
