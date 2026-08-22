/* eslint-disable react/prop-types */
const styles = {
  Easy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Hard: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[difficulty] || "bg-slate-50 text-slate-600 ring-slate-200"}`}
    >
      {difficulty}
    </span>
  );
}
