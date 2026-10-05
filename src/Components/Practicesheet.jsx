import { Link } from "react-router-dom";
import Footer from "./LandingPage/Footer.jsx";

const practiceLanguages = [
  {
    name: "Java",
    icon: "☕",
    questions: 164,
    color: "from-orange-50 to-orange-100",
    iconBg: "bg-orange-100",
    description: "Master Java programming",
    path: "/practice/java",
  },
  {
    name: "C++",
    icon: "⚡",
    questions: 110,
    color: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-100",
    description: "Practice modern C++",
    path: "/practice/cpp",
  },
  {
    name: "Python",
    icon: "🐍",
    questions: 16,
    color: "from-green-50 to-green-100",
    iconBg: "bg-green-100",
    description: "Learn Python programming",
    path: "/practice/python",
  },
  {
    name: "JavaScript",
    icon: "📜",
    questions: 0,
    color: "from-yellow-50 to-yellow-100",
    iconBg: "bg-yellow-100",
    description: "Practice JavaScript",
    path: "/practice/javascript",
  },
  {
    name: "C",
    icon: "🔧",
    questions: 0,
    color: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-100",
    description: "Build strong C fundamentals",
    path: "/practice/c",
  },
  {
    name: "SQL",
    icon: "▣",
    questions: 2,
    color: "from-cyan-50 to-cyan-100",
    iconBg: "bg-cyan-100",
    description: "Practice SQL queries",
    path: "/practice/sql",
  },
];

const Practice = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
            Practice Sheet
          </span>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Practice
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Improve your programming skills with carefully selected coding
            questions. Choose a language and start solving.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-slate-950">6</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Languages
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-blue-600">500+</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Questions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-emerald-600">50+</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Active Topics
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-purple-600">∞</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Practice
            </p>
          </div>
        </div>

        {/* Language Cards */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Choose a Language
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a language to explore practice questions.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {practiceLanguages.map((language) => (
              <Link
                key={language.name}
                to={language.path}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                {/* Background decoration */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <div
                  className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${language.iconBg} bg-gradient-to-br ${language.color} text-4xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  {language.icon}
                </div>

                {/* Name */}
                <div className="relative mt-5 text-center">
                  <h3 className="text-lg font-extrabold text-slate-950">
                    {language.name}
                  </h3>

                  <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-400">
                    {language.description}
                  </p>
                </div>

                {/* Questions */}
                <div className="relative mt-4 text-center">
                  {language.questions > 0 ? (
                    <span className="text-sm font-semibold text-slate-600">
                      {language.questions} questions
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">
                      No questions yet
                    </span>
                  )}
                </div>

                {/* Button */}
                <div className="relative mt-5">
                  <div className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all duration-300 group-hover:bg-blue-700 group-hover:shadow-lg">
                    <a href="/practice/java">open</a>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-center shadow-xl sm:px-10">
          <div className="mx-auto max-w-2xl">
            <span className="text-4xl">🚀</span>

            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Ready to improve your coding skills?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Pick a programming language, solve problems, and strengthen your
              problem-solving skills one question at a time.
            </p>

            <Link
              to="/problem-sheet"
              className="mt-6 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              Explore All Problems
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>
      </div>
      <div><Footer></Footer></div>
    </main>
  );
};

export default Practice;