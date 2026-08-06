/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

const emptyTestCase = { input: "", output: "", explanation: "" };
const emptyProblem = {
  title: "",
  slug: "",
  difficulty: "Easy",
  programmingLanguage: "Java",
  tags: "",
  description: "",
  notes: "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  timeLimit: "1 second",
  memoryLimit: "256 MB",
  explanation: "",
  sampleTestCases: [{ ...emptyTestCase }],
  hiddenTestCases: [{ ...emptyTestCase }],
  starterCode: {
    java: "",
    cpp: "",
    python: "",
    javascript: "",
  },
};

const languageOptions = ["Java", "C++", "Python", "JavaScript", "HTML", "CSS"];
const difficulties = ["Easy", "Medium", "Hard"];

const toSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const normalizeProblemForm = (problem = {}) => {
  const starterCode = problem.starterCode || {};

  return {
    ...emptyProblem,
    ...problem,
    programmingLanguage:
      problem.programmingLanguage || emptyProblem.programmingLanguage,
    tags: Array.isArray(problem.tags)
      ? problem.tags.join(", ")
      : problem.tags || "",
    sampleTestCases: problem.sampleTestCases?.length
      ? problem.sampleTestCases
      : [{ ...emptyTestCase }],
    hiddenTestCases: problem.hiddenTestCases?.length
      ? problem.hiddenTestCases
      : [{ ...emptyTestCase }],
    starterCode: {
      ...emptyProblem.starterCode,
      ...starterCode,
    },
  };
};

const buildPayload = (form) => {
  return {
    ...form,
    slug: form.slug.trim() || toSlug(form.title),
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    sampleTestCases: form.sampleTestCases.filter(
      (testCase) =>
        testCase.input.trim() ||
        testCase.output.trim() ||
        testCase.explanation.trim(),
    ),
    hiddenTestCases: form.hiddenTestCases.filter(
      (testCase) =>
        testCase.input.trim() ||
        testCase.output.trim() ||
        testCase.explanation.trim(),
    ),
  };
};

function ProblemManagement() {
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    programmingLanguage: "",
    page: 1,
  });
  const [form, setForm] = useState(emptyProblem);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: "10",
    });

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.difficulty) {
      params.set("difficulty", filters.difficulty);
    }

    if (filters.programmingLanguage) {
      params.set("programmingLanguage", filters.programmingLanguage);
    }

    return params.toString();
  }, [filters]);

  const loadProblems = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await apiFetch(`/api/problems?${queryString}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "Could not load problems.");
      }

      setProblems(Array.isArray(payload.items) ? payload.items : []);
      setMeta({
        page: payload.page || 1,
        totalPages: payload.totalPages || 1,
        total: payload.total || 0,
      });
    } catch (error) {
      setMessage(error?.message || "Could not load problems.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [queryString]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const updateStarterCode = (field, value) => {
    setForm((current) => ({
      ...current,
      starterCode: { ...current.starterCode, [field]: value },
    }));
  };

  const updateTestCase = (field, index, key, value) => {
    setForm((current) => {
      const nextCases = [...current[field]];
      nextCases[index] = { ...nextCases[index], [key]: value };
      return { ...current, [field]: nextCases };
    });
  };

  const addTestCase = (field) => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], { ...emptyTestCase }],
    }));
  };

  const removeTestCase = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(emptyProblem);
    setEditingId("");
    setMessage("");
  };

  const editProblem = (problem) => {
    setEditingId(problem.id);
    setForm(normalizeProblemForm(problem));
    setMessage("");
  };

  const saveProblem = async (event) => {
    event.preventDefault();

    const payload = buildPayload(form);

    if (
      !payload.title.trim() ||
      !payload.description.trim() ||
      !payload.programmingLanguage.trim()
    ) {
      setMessage("Title, programming language, and description are required.");
      return;
    }

    try {
      const response = await apiFetch(
        editingId ? `/api/problems/${editingId}` : "/api/problems",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Could not save problem.");
      }

      resetForm();
      await loadProblems();
      setMessage(editingId ? "Problem updated." : "Problem created.");
    } catch (error) {
      setMessage(error?.message || "Could not save problem.");
    }
  };

  const deleteProblem = async (problemId) => {
    const response = await apiFetch(`/api/problems/${problemId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await loadProblems();
      setMessage("Problem deleted.");
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setMessage(payload.message || "Could not delete problem.");
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  };

  const renderProblemList = () => {
    if (isLoading) {
      return <p className="empty-state">Loading problems...</p>;
    }

    if (!problems.length) {
      return <p className="empty-state">No problems found.</p>;
    }

    return problems.map((problem) => {
      const problemLanguage = problem.programmingLanguage || "Unknown";
      const problemTags = Array.isArray(problem.tags)
        ? problem.tags.join(", ")
        : problem.tags || "No tags";

      return (
        <article className="admin-row problem-admin-row" key={problem.id}>
          <div>
            <strong>{problem.title}</strong>
            <span>
              {problem.difficulty} | {problemLanguage} | {problemTags}
            </span>
          </div>
          <div className="user-edit-actions">
            <button
              className="secondary-action"
              onClick={() => editProblem(problem)}
              type="button"
            >
              Edit
            </button>
            <button
              className="danger-action"
              onClick={() => deleteProblem(problem.id)}
              type="button"
            >
              Delete
            </button>
          </div>
        </article>
      );
    });
  };

  return (
    <section className="admin-problem-manager">
      <div className="section-title">
        <h2>Problem Management</h2>
        <span>{meta.total} problems</span>
      </div>

      <div className="problem-admin-filters">
        <input
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search title or tag"
          value={filters.search}
        />
        <select
          onChange={(event) => updateFilter("difficulty", event.target.value)}
          value={filters.difficulty}
        >
          <option value="">All difficulties</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <select
          onChange={(event) => updateFilter("programmingLanguage", event.target.value)}
          value={filters.programmingLanguage}
        >
          <option value="">All languages</option>
          {languageOptions.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="problem-admin-message">{message}</p>}

      <div className="admin-list question-list">{renderProblemList()}</div>

      {meta.totalPages > 1 && (
        <div className="problem-pagination admin-problem-pagination">
          <button
            disabled={meta.page <= 1}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
            type="button"
          >
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
            type="button"
          >
            Next
          </button>
        </div>
      )}

      <form className="admin-form problem-form" onSubmit={saveProblem}>
        <div className="section-title">
          <h2>{editingId ? "Edit Problem" : "Add Problem"}</h2>
          {editingId && (
            <button
              className="secondary-action"
              onClick={resetForm}
              type="button"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="user-edit-fields">
          <label>
            Problem Title
            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              placeholder="Auto-generated if empty"
              value={form.slug}
              onChange={(event) => updateForm("slug", event.target.value)}
            />
          </label>
          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(event) => updateForm("difficulty", event.target.value)}
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
          <label>
            Programming Language
            <select
              value={form.programmingLanguage}
              onChange={(event) => updateForm("programmingLanguage", event.target.value)}
            >
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Tags
          <input
            placeholder="arrays, math, strings"
            value={form.tags}
            onChange={(event) => updateForm("tags", event.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => updateForm("notes", event.target.value)}
          />
        </label>
        <label>
          Input Format
          <textarea
            value={form.inputFormat}
            onChange={(event) => updateForm("inputFormat", event.target.value)}
          />
        </label>
        <label>
          Output Format
          <textarea
            value={form.outputFormat}
            onChange={(event) => updateForm("outputFormat", event.target.value)}
          />
        </label>
        <label>
          Constraints
          <textarea
            value={form.constraints}
            onChange={(event) => updateForm("constraints", event.target.value)}
          />
        </label>
        <div className="user-edit-fields">
          <label>
            Time Limit
            <input
              value={form.timeLimit}
              onChange={(event) => updateForm("timeLimit", event.target.value)}
            />
          </label>
          <label>
            Memory Limit
            <input
              value={form.memoryLimit}
              onChange={(event) =>
                updateForm("memoryLimit", event.target.value)
              }
            />
          </label>
        </div>

        <TestCaseEditor
          field="sampleTestCases"
          items={form.sampleTestCases}
          label="Sample Test Cases"
          onAdd={addTestCase}
          onRemove={removeTestCase}
          onUpdate={updateTestCase}
        />
        <TestCaseEditor
          field="hiddenTestCases"
          items={form.hiddenTestCases}
          label="Hidden Test Cases"
          onAdd={addTestCase}
          onRemove={removeTestCase}
          onUpdate={updateTestCase}
        />

        <label>
          Explanation
          <textarea
            value={form.explanation}
            onChange={(event) => updateForm("explanation", event.target.value)}
          />
        </label>

        <div className="starter-code-editor">
          <h3>Starter Code</h3>
          {[
            ["java", "Java"],
            ["cpp", "C++"],
            ["python", "Python"],
            ["javascript", "JavaScript"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                value={form.starterCode[key]}
                onChange={(event) => updateStarterCode(key, event.target.value)}
              />
            </label>
          ))}
        </div>

        <button className="primary-action" type="submit">
          {editingId ? "Update Problem" : "Add Problem"}
        </button>
      </form>
    </section>
  );
}

function TestCaseEditor({ field, items, label, onAdd, onRemove, onUpdate }) {
  return (
    <section className="testcase-editor">
      <div className="section-title">
        <h2>{label}</h2>
        <button
          className="secondary-action"
          onClick={() => onAdd(field)}
          type="button"
        >
          Add Case
        </button>
      </div>
      {items.map((item, index) => (
        <article className="testcase-row" key={`${field}-${index}`}>
          <div className="user-edit-fields">
            <label>
              Input
              <textarea
                value={item.input}
                onChange={(event) =>
                  onUpdate(field, index, "input", event.target.value)
                }
              />
            </label>
            <label>
              Output
              <textarea
                value={item.output}
                onChange={(event) =>
                  onUpdate(field, index, "output", event.target.value)
                }
              />
            </label>
          </div>
          <label>
            Explanation
            <textarea
              value={item.explanation}
              onChange={(event) =>
                onUpdate(field, index, "explanation", event.target.value)
              }
            />
          </label>
          {items.length > 1 && (
            <button
              className="danger-action"
              onClick={() => onRemove(field, index)}
              type="button"
            >
              Remove Case
            </button>
          )}
        </article>
      ))}
    </section>
  );
}

export default ProblemManagement;
