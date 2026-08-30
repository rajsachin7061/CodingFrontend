import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const Problemsheet = () => {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const response = await apiFetch("/api/problem-sheet");
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload.message || "Could not load problem sheet.");
        setProblems(payload.items || []);
      } catch (loadError) {
        setError(loadError.message || "Could not load problem sheet.");
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">
            Practice collection
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Problem Sheet
          </h1>
          <p className="mt-2 text-slate-500">
            Choose a problem to start solving.
          </p>
        </div>

        {loading && (
          <p className="text-sm font-semibold text-slate-500">
            Loading problems...
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && !problems.length && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No problems have been added to this sheet yet.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <a
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
              href={`/problem/${problem.id}`}
              key={problem.id}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-cyan-700">
                  #{index + 1}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {problem.difficulty}
                </span>
              </div>
              <h2 className="font-bold text-slate-950">{problem.title}</h2>
              <p className="mt-2 text-xs text-slate-500">/{problem.slug}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Problemsheet;
