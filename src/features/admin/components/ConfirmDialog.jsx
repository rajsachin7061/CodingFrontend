/* eslint-disable react/prop-types */
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm Delete",
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal onClose={onCancel} open={open} size="sm" title={title}>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          disabled={loading}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          disabled={loading}
          onClick={onConfirm}
          type="button"
        >
          {loading ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
