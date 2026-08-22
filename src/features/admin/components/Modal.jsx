/* eslint-disable react/prop-types */
export default function Modal({ open, title, children, onClose, size = "md" }) {
  if (!open) return null;

  const sizeClass =
    size === "lg"
      ? "max-w-4xl"
      : size === "xl"
        ? "max-w-6xl"
        : size === "sm"
          ? "max-w-md"
          : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className={`relative w-full ${sizeClass} max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
