import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Footer from "./LandingPage/Footer.jsx";

const Problemsheet = () => {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const response = await apiFetch("/api/problem-sheet");
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload.message || "Could not load problem sheet.");
        if (!Array.isArray(payload.items)) {
          throw new Error(
            "The server returned an unexpected problem sheet response.",
          );
        }
        setProblems(payload.items);
      } catch (loadError) {
        setError(loadError.message || "Could not load problem sheet.");
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [reloadAttempt]);

  return (
    <main className="min-h-screen bg-[#f3f6ff] px-5 py-10 text-slate-900 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">
            Problem collection
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Problem Sheet
          </h1>
          <p className="mt-2 text-slate-500">
            Choose a problem to start solving.
          </p>
        </div>

        {loading && (
          <p aria-live="polite" className="text-sm font-semibold text-slate-500">
            Loading problems...
          </p>
        )}
        {error && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="rounded-lg bg-red-700 px-4 py-2 text-white"
              onClick={() => {
                setError("");
                setLoading(true);
                setReloadAttempt((attempt) => attempt + 1);
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && !problems.length && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No problems have been added to this sheet yet.
          </p>
        )}
        <div className="grid gap-4">
          {loading &&
            Array.from({ length: 5 }, (_, index) => (
              <div
                aria-hidden="true"
                className="flex min-h-[88px] animate-pulse items-center gap-5 rounded-3xl border border-slate-200 bg-white px-6 py-5"
                key={`problem-sheet-skeleton-${index}`}
              >
                <span className="h-12 w-12 shrink-0 rounded-full bg-slate-200" />
                <span className="h-5 flex-1 rounded bg-slate-200" />
              </div>
            ))}
          {problems.map((problem, index) => (
            <a
              className="group flex min-h-10 items-center gap-5 rounded-3xl border border-slate-200 bg-slate-50/90 px-6 py-5 transition hover:border-violet-300 hover:bg-white hover:shadow-[0_12px_28px_rgba(99,102,241,0.12)] sm:px-5"
              href={`/problem/${problem.id}`}
              key={problem.id}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xl font-bold text-white shadow-sm">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
                  {problem.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {problem.difficulty || "Practice"}
                  {problem.tags?.length ? ` • ${problem.tags.join(", ")}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-violet-700 transition group-hover:text-violet-900 sm:text-base">
                Open <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div><Footer></Footer></div>
    </main>
  );
};

export default Problemsheet;
