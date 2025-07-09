
const Downloads = () => (
  <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 px-6 py-10 animate-fade-in">
    <main className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 tracking-tight">
        Study Materials
      </h1>
      <p className="text-lg mb-6 text-slate-700">
        Access all your study resources and learning materials here.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Classes Button */}
        <a
          href="https://samagra.kite.kerala.gov.in/#/layout/learningroom"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl border p-6 shadow hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-700 text-lg mb-2">Classes</h3>
            <p className="text-slate-600 text-sm">Access your virtual classroom and live lessons</p>
          </div>
        </a>

        {/* Question Bank Box */}
        <a
          href="https://samagra.kite.kerala.gov.in/#/question-repository"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl border p-6 shadow hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-700 text-lg mb-2">Question Bank</h3>
            <p className="text-slate-600 text-sm">Browse through practice questions and exercises</p>
          </div>
        </a>

        {/* Model Question Papers Box */}
        <a
          href="https://samagra.kite.kerala.gov.in/#/model-questions"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl border p-6 shadow hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-purple-700 text-lg mb-2">Model Question Papers</h3>
            <p className="text-slate-600 text-sm">Download and practice with sample exam papers</p>
          </div>
        </a>
      </div>
    </main>
  </div>
);

export default Downloads;
