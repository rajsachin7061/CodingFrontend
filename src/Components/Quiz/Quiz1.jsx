import { useEffect, useRef, useState } from "react";
import Footer from "../LandingPage/Footer.jsx";
import { Link } from "react-router-dom";

/**
 * Small hook that flips `visible` to true the first time the element
 * scrolls into view, so sections animate in as the user scrolls instead
 * of all firing at once on mount.
 */
const useRevealOnScroll = (threshold = 0.2) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced-motion users: just show the content immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const StartQuiz = () => {
  const guidelines = [
    "Read each question carefully before answering.",
    "You can navigate between questions.",
    "You can bookmark questions for later.",
    "Once submitted, answers cannot be changed.",
    "Make sure you have a stable internet connection.",
    "Do not refresh the page during the quiz.",
  ];

  const features = [
    {
      icon: "📚",
      title: "Multiple Topics",
      description: "Choose from different programming subjects.",
    },
    {
      icon: "⚡",
      title: "Instant Results",
      description: "Get your performance immediately.",
    },
    {
      icon: "📈",
      title: "Track Progress",
      description: "Monitor your improvement over time.",
    },
    {
      icon: "🏆",
      title: "Compete & Improve",
      description: "Beat your previous score and improve.",
    },
  ];

  const quizDetails = [
    { icon: "📝", title: "Questions", value: "15" },
    { icon: "⭐", title: "Total Marks", value: "30" },
    { icon: "−", title: "Negative Mark", value: "-0.25" },
    { icon: "🏅", title: "Passing Marks", value: "50%" },
    { icon: "⏱️", title: "Time Limit", value: "15 Min" },
  ];

  const [guidelinesRef, guidelinesVisible] = useRevealOnScroll();
  const [quickInfoRef, quickInfoVisible] = useRevealOnScroll();
  const [detailsRef, detailsVisible] = useRevealOnScroll();
  const [ctaRef, ctaVisible] = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl" />
      </div>

      <main className="relative">
        {/* ================= HERO ================= */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-16">
          <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden">
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
                backgroundSize: "35px 35px",
              }}
            />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 md:p-14 lg:p-16">
              {/* LEFT */}
              <div className="animate-[fadeIn_0.7s_ease-out]">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Interactive Coding Quiz
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
                  Challenge Yourself.
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shine_4s_linear_infinite]">
                    Sharpen Your Mind.
                  </span>
                </h1>

                <p className="mt-6 text-lg text-slate-600 leading-8 max-w-xl">
                  Test your programming knowledge with interactive quizzes,
                  improve your concepts and discover how much you really
                  know.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <Link
                    to="/statquiz"
                    className="group relative inline-flex items-center gap-3 overflow-hidden bg-blue-600 text-white px-7 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300"
                  >
                    {/* hover shine sweep */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out" />
                    <span className="relative">Start Quiz</span>
                    <span className="relative group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-green-500">●</span>
                    15 Questions
                  </div>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-5 mt-12">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="group flex gap-4 p-4 rounded-xl hover:bg-blue-50/70 transition-all duration-300 hover:-translate-y-1"
                      style={{
                        animation: `fadeIn 0.6s ease-out ${
                          0.15 + index * 0.1
                        }s both`,
                      }}
                    >
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-blue-50 rounded-xl text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        {feature.icon}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 leading-5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — developer taking the quiz */}
              <div className="flex justify-center">
                <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
                  {/* Main circle */}
                  <div className="absolute inset-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full animate-[float_5s_ease-in-out_infinite]" />

                  {/* Glow that gently breathes, as if the developer is "thinking" */}
                  <div className="absolute inset-12 bg-blue-400/10 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_infinite]" />

                  {/* Developer */}
                  <div className="absolute inset-0 flex items-center justify-center text-[110px] md:text-[140px] animate-[float_4s_ease-in-out_infinite] [animation-delay:0.2s]">
                    👨‍💻
                  </div>

                  {/* Floating cards, staggered in on load then gently floating */}
                  <div
                    className="absolute top-5 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 animate-[float_3s_ease-in-out_infinite]"
                    style={{ animation: "popIn 0.6s ease-out 0.3s both, float 3s ease-in-out 0.9s infinite" }}
                  >
                    <div className="text-2xl">❓</div>
                    <p className="text-xs font-semibold mt-1">Quiz</p>
                  </div>

                  <div
                    className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4"
                    style={{ animation: "popIn 0.6s ease-out 0.5s both, float 4s ease-in-out 1.1s infinite" }}
                  >
                    <div className="text-2xl">✓</div>
                    <p className="text-xs font-semibold mt-1">Correct!</p>
                  </div>

                  <div
                    className="absolute top-28 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4"
                    style={{ animation: "popIn 0.6s ease-out 0.7s both, float 3.5s ease-in-out 1.3s infinite" }}
                  >
                    <div className="text-2xl">💡</div>
                    <p className="text-xs font-semibold mt-1">Learn</p>
                  </div>

                  <div
                    className="absolute bottom-0 right-5 bg-blue-600 text-white rounded-2xl shadow-xl px-5 py-4"
                    style={{ animation: "popIn 0.6s ease-out 0.9s both" }}
                  >
                    <p className="text-xs opacity-80">Score</p>
                    <p className="text-xl font-bold tabular-nums">
                      <span className="inline-block animate-[countGlow_2.4s_ease-in-out_1.5s_infinite]">
                        95%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GUIDELINES ================= */}
        <section
          ref={guidelinesRef}
          className="max-w-7xl mx-auto px-5 sm:px-8 pb-12"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Guidelines */}
            <div
              className={`bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-700 ${
                guidelinesVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex items-center gap-4 mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                  📋
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quiz Guidelines</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Keep these points in mind before starting.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {guidelines.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group transition-all duration-500"
                    style={{
                      transitionDelay: guidelinesVisible
                        ? `${index * 80}ms`
                        : "0ms",
                      opacity: guidelinesVisible ? 1 : 0,
                      transform: guidelinesVisible
                        ? "translateX(0)"
                        : "translateX(-12px)",
                    }}
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      ✓
                    </div>
                    <p className="text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div
              ref={quickInfoRef}
              className={`bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-10 shadow-lg transition-all duration-700 delay-150 ${
                quickInfoVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Before you begin
                  </p>
                  <h2 className="text-3xl font-bold mt-2">Are you ready?</h2>
                </div>
                <div className="text-5xl animate-bounce">🚀</div>
              </div>

              <p className="text-blue-100 mt-6 leading-7">
                Challenge yourself and find out how strong your programming
                fundamentals really are.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-blue-100">
                  Quiz is ready to start
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= QUIZ DETAILS ================= */}
        <section
          ref={detailsRef}
          className="max-w-7xl mx-auto px-5 sm:px-8 pb-16"
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Quiz Overview
              </p>
              <h2 className="text-3xl font-bold mt-2">Know Before You Start</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {quizDetails.map((detail, index) => (
                <div
                  key={index}
                  className="group text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 hover:-translate-y-2 hover:shadow-lg transition-all duration-500"
                  style={{
                    transitionProperty:
                      "opacity, transform, background-color, border-color, box-shadow",
                    transitionDelay: detailsVisible
                      ? `${index * 90}ms`
                      : "0ms",
                    opacity: detailsVisible ? 1 : 0,
                    transform: detailsVisible
                      ? "translateY(0)"
                      : "translateY(16px)",
                  }}
                >
                  <div className="w-12 h-12 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {detail.icon}
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    {detail.title}
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section
          ref={ctaRef}
          className="max-w-4xl mx-auto text-center px-5 pb-20"
        >
          <div
            className={`bg-white border border-slate-200 rounded-3xl p-10 md:p-14 shadow-sm transition-all duration-700 ${
              ctaVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-[0.98]"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to test your knowledge?
            </h2>

            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Start the quiz and challenge yourself. Your next best score
              could be waiting for you.
            </p>

            <a herf="/startquiz"
           
              className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden bg-blue-600 text-white px-9 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out" />
              <span className="relative">Start Quiz</span>
              <span className="relative text-xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {/* Custom animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes shine {
            to { background-position: 200% center; }
          }

          @keyframes popIn {
            from { opacity: 0; transform: scale(0.6) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          @keyframes countGlow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.65; }
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default StartQuiz;
