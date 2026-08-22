/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  buildProblemPayload,
  difficulties,
  emptyProblemForm,
  emptyTestCase,
  normalizeProblemForm,
  toSlug,
} from "./problemFormUtils";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";
const labelClass = "grid gap-1.5 text-sm font-semibold text-slate-700";

export default function ProblemEditorForm({
  initialProblem,
  onCancel,
  onSave,
  submitLabel = "Save Problem",
}) {
  const [form, setForm] = useState(emptyProblemForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialProblem ? normalizeProblemForm(initialProblem) : emptyProblemForm);
    setError("");
  }, [initialProblem]);

  const updateForm = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !current.slug) {
        next.slug = toSlug(value);
      }
      return next;
    });
    setError("");
  };

  const updateCase = (field, index, key, value) => {
    setForm((current) => {
      const nextCases = [...current[field]];
      nextCases[index] = { ...nextCases[index], [key]: value };
      return { ...current, [field]: nextCases };
    });
  };

  const addCase = (field) => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], { ...emptyTestCase }],
    }));
  };

  const removeCase = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildProblemPayload(form);

    if (!payload.title || !payload.difficulty) {
      setError("Problem title and difficulty are required.");
      return;
    }

    await onSave(payload);
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_240px_180px]">
        <label className={labelClass}>
          Problem Title
          <input
            className={fieldClass}
            onChange={(event) => updateForm("title", event.target.value)}
            value={form.title}
          />
        </label>
        <label className={labelClass}>
          Slug
          <input
            className={fieldClass}
            onChange={(event) => updateForm("slug", event.target.value)}
            placeholder="auto-generated"
            value={form.slug}
          />
        </label>
        <label className={labelClass}>
          Difficulty
          <select
            className={fieldClass}
            onChange={(event) => updateForm("difficulty", event.target.value)}
            value={form.difficulty}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Problem Statement
        <textarea
          className={`${fieldClass} min-h-36`}
          onChange={(event) => updateForm("description", event.target.value)}
          value={form.description}
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className={labelClass}>
          Constraints
          <textarea
            className={`${fieldClass} min-h-28`}
            onChange={(event) => updateForm("constraints", event.target.value)}
            value={form.constraints}
          />
        </label>
        <label className={labelClass}>
          Input Format
          <textarea
            className={`${fieldClass} min-h-28`}
            onChange={(event) => updateForm("inputFormat", event.target.value)}
            value={form.inputFormat}
          />
        </label>
        <label className={labelClass}>
          Output Format
          <textarea
            className={`${fieldClass} min-h-28`}
            onChange={(event) => updateForm("outputFormat", event.target.value)}
            value={form.outputFormat}
          />
        </label>
      </div>

      <TestCaseEditor
        field="sampleTestCases"
        items={form.sampleTestCases}
        label="Sample Input / Output"
        onAdd={addCase}
        onRemove={removeCase}
        onUpdate={updateCase}
      />

      <label className={labelClass}>
        Explanation
        <textarea
          className={`${fieldClass} min-h-28`}
          onChange={(event) => updateForm("explanation", event.target.value)}
          value={form.explanation}
        />
      </label>

      <TestCaseEditor
        field="hiddenTestCases"
        items={form.hiddenTestCases}
        label="Hidden Test Cases"
        onAdd={addCase}
        onRemove={removeCase}
        onUpdate={updateCase}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <label className={labelClass}>
          Starter Code
          <textarea
            className={`${fieldClass} min-h-44 font-mono`}
            onChange={(event) =>
              updateForm("starterCodeTemplate", event.target.value)
            }
            value={form.starterCodeTemplate}
          />
        </label>
        <label className={labelClass}>
          Solution Code
          <textarea
            className={`${fieldClass} min-h-44 font-mono`}
            onChange={(event) => updateForm("solution", event.target.value)}
            value={form.solution}
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <label className={labelClass}>
          Tags
          <input
            className={fieldClass}
            onChange={(event) => updateForm("tags", event.target.value)}
            placeholder="arrays, strings, math"
            value={form.tags}
          />
        </label>
        <label className={labelClass}>
          Status
          <select
            className={fieldClass}
            onChange={(event) => updateForm("status", event.target.value)}
            value={form.status}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        {onCancel && (
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
        <button
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function TestCaseEditor({ field, items, label, onAdd, onRemove, onUpdate }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        <button
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          onClick={() => onAdd(field)}
          type="button"
        >
          Add Case
        </button>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3"
            key={`${field}-${index}`}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <label className={labelClass}>
                {field === "sampleTestCases" ? "Sample Input" : "Input"}
                <textarea
                  className={`${fieldClass} min-h-24 font-mono`}
                  onChange={(event) =>
                    onUpdate(field, index, "input", event.target.value)
                  }
                  value={item.input}
                />
              </label>
              <label className={labelClass}>
                {field === "sampleTestCases" ? "Sample Output" : "Output"}
                <textarea
                  className={`${fieldClass} min-h-24 font-mono`}
                  onChange={(event) =>
                    onUpdate(field, index, "output", event.target.value)
                  }
                  value={item.output}
                />
              </label>
            </div>
            <label className={labelClass}>
              Case Explanation
              <textarea
                className={`${fieldClass} min-h-20`}
                onChange={(event) =>
                  onUpdate(field, index, "explanation", event.target.value)
                }
                value={item.explanation}
              />
            </label>
            {items.length > 1 && (
              <button
                className="justify-self-start rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                onClick={() => onRemove(field, index)}
                type="button"
              >
                Remove Case
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
