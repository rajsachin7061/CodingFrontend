/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  languagesApi,
  modulesApi,
  problemSheetApi,
  practiceQuestionsApi,
  problemsApi,
} from "../api/adminApi";
import ConfirmDialog from "../components/ConfirmDialog";
import DifficultyBadge from "../components/DifficultyBadge";
import DragReorderList from "../components/DragReorderList";
import Modal from "../components/Modal";
import ProblemEditorForm from "./ProblemEditorForm";
import { difficulties } from "./problemFormUtils";

const inputClass =
  "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";
const iconMap = {
  Java: "J",
  "C++": "C++",
  Python: "Py",
  JavaScript: "JS",
  C: "C",
  SQL: "SQL",
};

export default function ProblemManagementDashboard() {
  const [activeSection, setActiveSection] = useState("problems");
  const [problemView, setProblemView] = useState("all");
  const [practiceView, setPracticeView] = useState("languages");
  const [problemsState, setProblemsState] = useState({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [problemFilters, setProblemFilters] = useState({
    search: "",
    difficulty: "",
    status: "",
    page: 1,
  });
  const [problemModal, setProblemModal] = useState({
    open: false,
    problem: null,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [languages, setLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [moduleModal, setModuleModal] = useState({ open: false, module: null });
  const [moduleDraft, setModuleDraft] = useState({
    title: "",
    description: "",
  });
  const [moduleDeleteTarget, setModuleDeleteTarget] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [addProblemModal, setAddProblemModal] = useState(false);
  const [moduleCreateProblemModal, setModuleCreateProblemModal] =
    useState(false);
  const [questionDeleteTarget, setQuestionDeleteTarget] = useState(null);
  const [problemSheetItems, setProblemSheetItems] = useState([]);
  const [problemSheetLoading, setProblemSheetLoading] = useState(false);

  const selectedLanguage = languages.find(
    (item) => item.id === selectedLanguageId,
  );
  const selectedModule = modules.find((item) => item.id === selectedModuleId);

  const problemParams = useMemo(
    () => ({
      page: problemFilters.page,
      limit: 10,
      search: problemFilters.search,
      difficulty: problemFilters.difficulty,
      status: problemFilters.status,
    }),
    [problemFilters],
  );

  const loadProblems = async () => {
    setLoading(true);
    try {
      const payload = await problemsApi.list(problemParams);
      setProblemsState({
        items: payload.items || [],
        page: payload.page || 1,
        totalPages: payload.totalPages || 1,
        total: payload.total || 0,
      });
    } catch (error) {
      setMessage(error?.message || "Could not load problems.");
    } finally {
      setLoading(false);
    }
  };

  const loadLanguages = async () => {
    try {
      const payload = await languagesApi.list();
      const rows = payload.items || [];
      setLanguages(rows);
      setSelectedLanguageId((current) => current || rows[0]?.id || "");
    } catch (error) {
      setMessage(error?.message || "Could not load practice languages.");
    }
  };

  const loadModules = async (languageId = selectedLanguageId) => {
    if (!languageId) {
      setModules([]);
      setSelectedModuleId("");
      return;
    }

    try {
      const payload = await modulesApi.listByLanguage(languageId);
      const rows = payload.items || [];
      setModules(rows);
      setSelectedModuleId((current) =>
        rows.some((item) => item.id === current) ? current : rows[0]?.id || "",
      );
    } catch (error) {
      setMessage(error?.message || "Could not load modules.");
    }
  };

  const loadPracticeQuestions = async (moduleId = selectedModuleId) => {
    if (!moduleId) {
      setPracticeQuestions([]);
      return;
    }

    try {
      const payload = await practiceQuestionsApi.listByModule(moduleId);
      setPracticeQuestions(payload.items || []);
    } catch (error) {
      setMessage(error?.message || "Could not load module questions.");
    }
  };

  const loadProblemSheet = async () => {
    setProblemSheetLoading(true);
    try {
      const payload = await problemSheetApi.get();
      setProblemSheetItems(payload.items || []);
    } catch (error) {
      setMessage(error?.message || "Could not load problem sheet.");
    } finally {
      setProblemSheetLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [problemParams]);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    loadModules(selectedLanguageId);
  }, [selectedLanguageId]);

  useEffect(() => {
    loadPracticeQuestions(selectedModuleId);
  }, [selectedModuleId]);

  useEffect(() => {
    loadProblemSheet();
  }, []);

  const saveProblem = async (payload, { addToModule = false } = {}) => {
    const saved = problemModal.problem
      ? await problemsApi.update(problemModal.problem.id, payload)
      : await problemsApi.create(payload);
    const problem = saved.problem || saved;

    if (addToModule && selectedModuleId && problem?.id) {
      await practiceQuestionsApi.add(selectedModuleId, {
        problemId: problem.id,
      });
      await loadPracticeQuestions();
      await loadModules();
    }

    setProblemModal({ open: false, problem: null });
    setModuleCreateProblemModal(false);
    setMessage(problemModal.problem ? "Problem updated." : "Problem created.");
    await loadProblems();
  };

  const removeProblem = async () => {
    if (!deleteTarget) return;
    await problemsApi.remove(deleteTarget.id);
    setDeleteTarget(null);
    setMessage("Problem deleted.");
    await loadProblems();
  };

  const openModuleModal = (module = null) => {
    setModuleModal({ open: true, module });
    setModuleDraft({
      title: module?.title || "",
      description: module?.description || "",
    });
  };

  const saveModule = async (event) => {
    event.preventDefault();
    const payload = {
      title: moduleDraft.title.trim(),
      description: moduleDraft.description.trim(),
    };

    if (!payload.title || !selectedLanguageId) return;

    if (moduleModal.module) {
      await modulesApi.update(moduleModal.module.id, payload);
      setMessage("Module updated.");
    } else {
      await modulesApi.create(selectedLanguageId, payload);
      setMessage("Module created.");
    }

    setModuleModal({ open: false, module: null });
    await loadModules();
  };

  const deleteModule = async () => {
    if (!moduleDeleteTarget) return;
    await modulesApi.remove(moduleDeleteTarget.id);
    setModuleDeleteTarget(null);
    setMessage("Module deleted.");
    await loadModules();
  };

  const reorderModules = async (orderedModules) => {
    setModules(orderedModules);
    await modulesApi.reorder(orderedModules.map((item) => item.id));
    await loadModules();
  };

  const addExistingProblem = async (problemOrProblems) => {
    if (activeSection === "problemSheet") {
      const selectedProblems = Array.isArray(problemOrProblems)
        ? problemOrProblems
        : [problemOrProblems];
      setProblemSheetItems((current) => [
        ...current,
        ...selectedProblems.filter(
          (problem) => !current.some((item) => item.id === problem.id),
        ),
      ]);
      setAddProblemModal(false);
      setMessage("Problems added to sheet. Save the sheet to publish changes.");
      return;
    }

    if (!selectedModuleId) return;
    const selectedProblems = Array.isArray(problemOrProblems)
      ? problemOrProblems
      : [problemOrProblems];
    const problemIds = selectedProblems
      .map((problem) => problem.id)
      .filter(Boolean);

    if (!problemIds.length) return;

    const payload = await practiceQuestionsApi.add(selectedModuleId, {
      problemIds,
    });
    setAddProblemModal(false);
    setMessage(payload.message || "Problems added to module.");
    await loadPracticeQuestions();
    await loadModules();
  };

  const updatePracticeQuestionStatus = async (question) => {
    await practiceQuestionsApi.update(question.id, {
      status: question.status === "active" ? "inactive" : "active",
    });
    await loadPracticeQuestions();
  };

  const removePracticeQuestion = async () => {
    if (!questionDeleteTarget) return;
    await practiceQuestionsApi.remove(questionDeleteTarget.id);
    setQuestionDeleteTarget(null);
    setMessage("Question removed from module.");
    await loadPracticeQuestions();
    await loadModules();
  };

  const reorderPracticeQuestions = async (orderedQuestions) => {
    setPracticeQuestions(orderedQuestions);
    await practiceQuestionsApi.reorder(
      selectedModuleId,
      orderedQuestions.map((item) => item.id),
    );
    await loadPracticeQuestions();
  };

  const updateProblemFilter = (field, value) => {
    setProblemFilters((current) => ({ ...current, [field]: value, page: 1 }));
  };

  const saveProblemSheet = async () => {
    const payload = await problemSheetApi.save(
      problemSheetItems.map((problem) => problem.id),
    );
    setProblemSheetItems(payload.items || problemSheetItems);
    setMessage(payload.message || "Problem sheet saved.");
  };

  return (
    <section className="overflow-hidden rounded-lg bg-slate-50 text-slate-900">
      <div className="grid min-h-[720px] lg:grid-cols-[280px_1fr]">
        <AdminSidebar
          activeSection={activeSection}
          problemView={problemView}
          practiceView={practiceView}
          setActiveSection={setActiveSection}
          setPracticeView={setPracticeView}
          setProblemView={setProblemView}
        />

        <main className="min-w-0 p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Admin / {activeSection === "problems" ? "Problems" : "Practice"}
              </div>
              <h1 className="text-2xl font-bold text-slate-950">
                {activeSection === "problems"
                  ? "Problem Management"
                  : "Practice Management"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {activeSection === "problems"
                  ? "Manage global standalone coding problems."
                  : "Organize language learning paths with modules that reference global problems."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setActiveSection("practice");
                  setPracticeView("languages");
                }}
                type="button"
              >
                Practice
              </button>
              <button
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
                onClick={() => {
                  setActiveSection("problems");
                  setProblemView("add");
                  setProblemModal({ open: true, problem: null });
                }}
                type="button"
              >
                Add Problem
              </button>
            </div>
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
              {message}
            </div>
          )}

          {activeSection === "problems" ? (
            <ProblemsSection
              filters={problemFilters}
              loading={loading}
              onDelete={setDeleteTarget}
              onEdit={(problem) => setProblemModal({ open: true, problem })}
              onFilter={updateProblemFilter}
              onOpenAdd={() => setProblemModal({ open: true, problem: null })}
              onPage={(page) =>
                setProblemFilters((current) => ({ ...current, page }))
              }
              problemsState={problemsState}
              view={problemView}
            />
          ) : activeSection === "problemSheet" ? (
            <ProblemSheetSection
              items={problemSheetItems}
              loading={problemSheetLoading}
              onAdd={() => setAddProblemModal(true)}
              onRemove={(problem) =>
                setProblemSheetItems((current) =>
                  current.filter((item) => item.id !== problem.id),
                )
              }
              onReorder={setProblemSheetItems}
              onSave={saveProblemSheet}
            />
          ) : (
            <PracticeSection
              languages={languages}
              modules={modules}
              onAddExistingProblem={() => setAddProblemModal(true)}
              onCreateModule={() => openModuleModal()}
              onCreateProblem={() => setModuleCreateProblemModal(true)}
              onDeleteModule={setModuleDeleteTarget}
              onEditModule={openModuleModal}
              onEditProblem={(problem) =>
                setProblemModal({ open: true, problem })
              }
              onRemoveQuestion={setQuestionDeleteTarget}
              onReorderModules={reorderModules}
              onReorderQuestions={reorderPracticeQuestions}
              onSelectLanguage={setSelectedLanguageId}
              onSelectModule={setSelectedModuleId}
              onToggleQuestionStatus={updatePracticeQuestionStatus}
              practiceQuestions={practiceQuestions}
              selectedLanguage={selectedLanguage}
              selectedLanguageId={selectedLanguageId}
              selectedModule={selectedModule}
              selectedModuleId={selectedModuleId}
              view={practiceView}
            />
          )}
        </main>
      </div>

      <Modal
        onClose={() => setProblemModal({ open: false, problem: null })}
        open={problemModal.open}
        size="xl"
        title={problemModal.problem ? "Edit Problem" : "Add Problem"}
      >
        <ProblemEditorForm
          initialProblem={problemModal.problem}
          onCancel={() => setProblemModal({ open: false, problem: null })}
          onSave={saveProblem}
          submitLabel={problemModal.problem ? "Update Problem" : "Save Problem"}
        />
      </Modal>

      <Modal
        onClose={() => setModuleCreateProblemModal(false)}
        open={moduleCreateProblemModal}
        size="xl"
        title="Create New Problem For Module"
      >
        <ProblemEditorForm
          onCancel={() => setModuleCreateProblemModal(false)}
          onSave={(payload) => saveProblem(payload, { addToModule: true })}
          submitLabel="Create and Add"
        />
      </Modal>

      <Modal
        onClose={() => setModuleModal({ open: false, module: null })}
        open={moduleModal.open}
        title={moduleModal.module ? "Edit Module" : "Create Module"}
      >
        <form className="grid gap-4" onSubmit={saveModule}>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Module Title
            <input
              className={inputClass}
              onChange={(event) =>
                setModuleDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              value={moduleDraft.title}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Description
            <textarea
              className={`${inputClass} min-h-28`}
              onChange={(event) =>
                setModuleDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              value={moduleDraft.description}
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setModuleModal({ open: false, module: null })}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              type="submit"
            >
              Save Module
            </button>
          </div>
        </form>
      </Modal>

      <AddExistingProblemModal
        onAdd={addExistingProblem}
        onClose={() => setAddProblemModal(false)}
        open={addProblemModal}
      />

      <ConfirmDialog
        message={`Delete "${deleteTarget?.title || "this problem"}"? This removes the standalone problem.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeProblem}
        open={Boolean(deleteTarget)}
      />
      <ConfirmDialog
        message={`Delete "${moduleDeleteTarget?.title || "this module"}"? This removes its practice question links.`}
        onCancel={() => setModuleDeleteTarget(null)}
        onConfirm={deleteModule}
        open={Boolean(moduleDeleteTarget)}
        title="Delete Module"
      />
      <ConfirmDialog
        confirmLabel="Remove"
        message={`Remove "${questionDeleteTarget?.problem?.title || "this question"}" from the module?`}
        onCancel={() => setQuestionDeleteTarget(null)}
        onConfirm={removePracticeQuestion}
        open={Boolean(questionDeleteTarget)}
        title="Remove Practice Question"
      />
    </section>
  );
}

function AdminSidebar({
  activeSection,
  problemView,
  practiceView,
  setActiveSection,
  setPracticeView,
  setProblemView,
}) {
  const itemClass = (active) =>
    `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
      active
        ? "bg-cyan-700 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <aside className="border-r border-slate-200 bg-white p-4">
      <div className="mb-5 rounded-lg bg-slate-950 px-4 py-3 text-white">
        <div className="text-sm font-bold">Admin Panel</div>
        <div className="text-xs text-slate-300">Coding platform CMS</div>
      </div>
      <nav className="grid gap-5">
        <button className={itemClass(false)} type="button">
          <span>Dashboard</span>
        </button>
        <button
          className={itemClass(activeSection === "problemSheet")}
          onClick={() => setActiveSection("problemSheet")}
          type="button"
        >
          <span>Problem Sheet</span>
        </button>
        <SidebarGroup title="CONTENT">
          <button
            className={itemClass(activeSection === "problems")}
            onClick={() => setActiveSection("problems")}
            type="button"
          >
            <span>Problems</span>
            <span>{activeSection === "problems" ? "-" : "+"}</span>
          </button>
          {activeSection === "problems" && (
            <div className="ml-3 mt-2 grid gap-1 border-l border-slate-200 pl-3">
              {[
                ["all", "All Problems"],
                ["add", "Add Problem"],
                ["draft", "Draft Problems"],
                ["tags", "Problem Tags"],
              ].map(([id, label]) => (
                <button
                  className={itemClass(problemView === id)}
                  key={id}
                  onClick={() => setProblemView(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button
            className={itemClass(activeSection === "practice")}
            onClick={() => setActiveSection("practice")}
            type="button"
          >
            <span>Practice</span>
            <span>{activeSection === "practice" ? "-" : "+"}</span>
          </button>
          {activeSection === "practice" && (
            <div className="ml-3 mt-2 grid gap-1 border-l border-slate-200 pl-3">
              {[
                ["languages", "Languages"],
                ["modules", "Modules"],
                ["questions", "Practice Questions"],
              ].map(([id, label]) => (
                <button
                  className={itemClass(practiceView === id)}
                  key={id}
                  onClick={() => setPracticeView(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {["Contests", "All Contests", "Create Contest", "Leaderboard"].map(
            (label) => (
              <button className={itemClass(false)} key={label} type="button">
                {label}
              </button>
            ),
          )}
        </SidebarGroup>
        <SidebarGroup title="USERS">
          {["Students", "Mentors", "Admins"].map((label) => (
            <button className={itemClass(false)} key={label} type="button">
              {label}
            </button>
          ))}
        </SidebarGroup>
        <SidebarGroup title="MONITORING">
          {["Submissions", "Analytics", "Reports"].map((label) => (
            <button className={itemClass(false)} key={label} type="button">
              {label}
            </button>
          ))}
        </SidebarGroup>
        <SidebarGroup title="WEBSITE">
          {["Home Banner", "Announcements", "Blog", "Newsletter"].map(
            (label) => (
              <button className={itemClass(false)} key={label} type="button">
                {label}
              </button>
            ),
          )}
        </SidebarGroup>
        <SidebarGroup title="SETTINGS">
          {["General", "Authentication", "Email", "Compiler", "API Keys"].map(
            (label) => (
              <button className={itemClass(false)} key={label} type="button">
                {label}
              </button>
            ),
          )}
          <button
            className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            type="button"
          >
            Logout
          </button>
        </SidebarGroup>
      </nav>
    </aside>
  );
}

function SidebarGroup({ children, title }) {
  return (
    <div>
      <div className="mb-2 border-y border-slate-200 py-2 text-xs font-bold tracking-widest text-slate-400">
        {title}
      </div>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

function ProblemsSection({
  filters,
  loading,
  onDelete,
  onEdit,
  onFilter,
  onOpenAdd,
  onPage,
  problemsState,
  view,
}) {
  const visibleProblems =
    view === "draft"
      ? problemsState.items.filter((item) => item.status === "draft")
      : problemsState.items;

  if (view === "add") {
    return (
      <div className="rounded-lg border border-dashed border-cyan-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-950">
          Create a global problem
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Problems are independent. Practice modules reference them later
          without asking for language, course, or module fields here.
        </p>
        <button
          className="mt-5 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          onClick={onOpenAdd}
          type="button"
        >
          Open Add Problem Form
        </button>
      </div>
    );
  }

  if (view === "tags") {
    const tags = new Map();
    problemsState.items.forEach((problem) =>
      (problem.tags || []).forEach((tag) =>
        tags.set(tag, (tags.get(tag) || 0) + 1),
      ),
    );

    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[...tags.entries()].map(([tag, count]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4"
            key={tag}
          >
            <div className="text-sm font-bold text-slate-950">{tag}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {count} problems
            </div>
          </div>
        ))}
        {!tags.size && (
          <EmptyCard text="No tags found in the current problem page." />
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_180px_180px]">
        <input
          className={inputClass}
          onChange={(event) => onFilter("search", event.target.value)}
          placeholder="Search title, slug, or tag"
          value={filters.search}
        />
        <select
          className={inputClass}
          onChange={(event) => onFilter("difficulty", event.target.value)}
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
          className={inputClass}
          onChange={(event) => onFilter("status", event.target.value)}
          value={filters.status}
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_120px_110px_160px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 max-lg:hidden">
          <span>Title</span>
          <span>Difficulty</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {loading ? (
          <EmptyCard text="Loading problems..." />
        ) : visibleProblems.length ? (
          visibleProblems.map((problem) => (
            <ProblemRow
              key={problem.id}
              onDelete={onDelete}
              onEdit={onEdit}
              problem={problem}
            />
          ))
        ) : (
          <EmptyCard text="No problems found." />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>{problemsState.total} total problems</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 disabled:opacity-50"
            disabled={problemsState.page <= 1}
            onClick={() => onPage(problemsState.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span>
            Page {problemsState.page} of {problemsState.totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 disabled:opacity-50"
            disabled={problemsState.page >= problemsState.totalPages}
            onClick={() => onPage(problemsState.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ProblemRow({ onDelete, onEdit, problem }) {
  return (
    <div className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 lg:grid-cols-[1fr_120px_110px_160px] lg:items-center">
      <div className="min-w-0">
        <div className="font-semibold text-slate-950">{problem.title}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
          <span>/{problem.slug}</span>
          {(problem.tags || []).slice(0, 3).map((tag) => (
            <span className="rounded-full bg-slate-100 px-2 py-0.5" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <DifficultyBadge difficulty={problem.difficulty} />
      <span className="text-sm font-semibold capitalize text-slate-600">
        {problem.status || "published"}
      </span>
      <div className="flex justify-start gap-2 lg:justify-end">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => onEdit(problem)}
          type="button"
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          onClick={() => onDelete(problem)}
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ProblemSheetSection({
  items,
  loading,
  onAdd,
  onRemove,
  onReorder,
  onSave,
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Problem Sheet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select existing problems to display at /problem-sheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onAdd}
            type="button"
          >
            Select Existing Problems
          </button>
          <button
            className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
            disabled={loading}
            onClick={onSave}
            type="button"
          >
            Save Problem Sheet
          </button>
        </div>
      </div>
      {loading ? (
        <EmptyCard text="Loading problem sheet..." />
      ) : items.length ? (
        <DragReorderList
          items={items}
          onReorder={onReorder}
          renderItem={(problem, index) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold text-slate-950">
                  {index + 1}. {problem.title}
                </div>
                <div className="text-xs text-slate-500">/{problem.slug}</div>
              </div>
              <div className="flex items-center gap-3">
                <DifficultyBadge difficulty={problem.difficulty} />
                <button
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => onRemove(problem)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        />
      ) : (
        <EmptyCard text="No problems selected. Add existing problems to build the sheet." />
      )}
    </div>
  );
}

function PracticeSection({
  languages,
  modules,
  onAddExistingProblem,
  onCreateModule,
  onCreateProblem,
  onDeleteModule,
  onEditModule,
  onEditProblem,
  onRemoveQuestion,
  onReorderModules,
  onReorderQuestions,
  onSelectLanguage,
  onSelectModule,
  onToggleQuestionStatus,
  practiceQuestions,
  selectedLanguage,
  selectedLanguageId,
  selectedModule,
  selectedModuleId,
  view,
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {languages.map((language) => (
          <button
            className={`rounded-lg border p-4 text-left transition ${
              selectedLanguageId === language.id
                ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100"
                : "border-slate-200 bg-white hover:border-cyan-200"
            }`}
            key={language.id}
            onClick={() => onSelectLanguage(language.id)}
            type="button"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
              {language.icon && /^[ -~]+$/.test(language.icon)
                ? language.icon
                : iconMap[language.name] || language.name.slice(0, 2)}
            </div>
            <div className="font-bold text-slate-950">{language.name}</div>
            <div className="text-xs font-semibold text-slate-500">
              Learning path
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {selectedLanguage?.name || "Select Language"} Modules
              </h2>
              <p className="text-sm text-slate-500">
                Create, edit, delete, and reorder modules.
              </p>
            </div>
            <button
              className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800"
              disabled={!selectedLanguageId}
              onClick={onCreateModule}
              type="button"
            >
              Create Module
            </button>
          </div>
          {modules.length ? (
            <DragReorderList
              items={modules}
              onReorder={onReorderModules}
              renderItem={(module, index) => (
                <div
                  className={`grid gap-3 ${
                    selectedModuleId === module.id ? "text-cyan-900" : ""
                  }`}
                >
                  <button
                    className="text-left"
                    onClick={() => onSelectModule(module.id)}
                    type="button"
                  >
                    <div className="font-bold">
                      {index + 1}. {module.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {module.questionCount || 0} questions
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                      onClick={() => onEditModule(module)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                      onClick={() => onDeleteModule(module)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          ) : (
            <EmptyCard text="No modules yet. Create the first module for this language." />
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {selectedModule?.title || "Module Questions"}
              </h2>
              <p className="text-sm text-slate-500">
                Add existing problems, create new global problems, remove links,
                and reorder questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                disabled={!selectedModuleId}
                onClick={onAddExistingProblem}
                type="button"
              >
                Add Existing Problem
              </button>
              <button
                className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800"
                disabled={!selectedModuleId}
                onClick={onCreateProblem}
                type="button"
              >
                Create New Problem
              </button>
            </div>
          </div>
          {practiceQuestions.length ? (
            <DragReorderList
              items={practiceQuestions}
              onReorder={onReorderQuestions}
              renderItem={(question, index) => (
                <PracticeQuestionRow
                  index={index}
                  onEditProblem={onEditProblem}
                  onRemove={onRemoveQuestion}
                  onToggleStatus={onToggleQuestionStatus}
                  question={question}
                />
              )}
            />
          ) : (
            <EmptyCard text="No questions in this module yet." />
          )}
        </section>
      </div>

      {view === "languages" && (
        <WorkflowNote text="Practice starts at language level, then moves into modules and referenced questions." />
      )}
      {view === "modules" && (
        <WorkflowNote text="Modules belong to a language and can be reordered with drag and drop." />
      )}
      {view === "questions" && (
        <WorkflowNote text="Practice questions are links to standalone problems, so one problem can appear in many learning paths." />
      )}
    </div>
  );
}

function PracticeQuestionRow({
  index,
  onEditProblem,
  onRemove,
  onToggleStatus,
  question,
}) {
  const problem = question.problem || question.question || {};

  return (
    <div className="grid gap-3 xl:grid-cols-[72px_1fr_110px_90px_180px] xl:items-center">
      <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-bold text-slate-700">
        #{index + 1}
      </span>
      <div>
        <div className="font-bold text-slate-950">
          {problem.title || problem.slug || problem.name || "Missing problem"}
        </div>
        <div className="text-xs text-slate-500">
          {problem.slug ||
            problem.id ||
            question.problemId ||
            question.questionId}
        </div>
      </div>
      <DifficultyBadge difficulty={problem.difficulty} />
      <button
        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
          question.status === "active"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        }`}
        onClick={() => onToggleStatus(question)}
        type="button"
      >
        {question.status}
      </button>
      <div className="flex gap-2 xl:justify-end">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => onEditProblem(problem)}
          type="button"
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          onClick={() => onRemove(question)}
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AddExistingProblemModal({ onAdd, onClose, open }) {
  const [filters, setFilters] = useState({ search: "", difficulty: "" });
  const [items, setItems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedProblemIds = useMemo(
    () => selectedProblems.map((problem) => problem.id),
    [selectedProblems],
  );

  useEffect(() => {
    if (!open) {
      setSelectedProblems([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const payload = await problemsApi.list({
          limit: 20,
          search: filters.search,
          difficulty: filters.difficulty,
          status: "published",
        });
        setItems(payload.items || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, filters]);

  const toggleProblem = (problem, checked) => {
    setSelectedProblems((current) =>
      checked
        ? [...current, problem].filter(
            (item, index, list) =>
              list.findIndex((row) => row.id === item.id) === index,
          )
        : current.filter((item) => item.id !== problem.id),
    );
  };

  return (
    <Modal onClose={onClose} open={open} size="lg" title="Add Existing Problem">
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <input
            className={inputClass}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Search problems"
            value={filters.search}
          />
          <select
            className={inputClass}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                difficulty: event.target.value,
              }))
            }
            value={filters.difficulty}
          >
            <option value="">All difficulties</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-[440px] overflow-auto rounded-lg border border-slate-200">
          {loading ? (
            <EmptyCard text="Loading problems..." />
          ) : items.length ? (
            items.map((problem) => (
              <label
                className="grid cursor-pointer gap-3 border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 sm:grid-cols-[32px_1fr_110px] sm:items-center"
                key={problem.id}
              >
                <input
                  checked={selectedProblemIds.includes(problem.id)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                  onChange={(event) =>
                    toggleProblem(problem, event.target.checked)
                  }
                  type="checkbox"
                />
                <div>
                  <div className="font-bold text-slate-950">
                    {problem.title}
                  </div>
                  <div className="text-xs text-slate-500">/{problem.slug}</div>
                </div>
                <DifficultyBadge difficulty={problem.difficulty} />
              </label>
            ))
          ) : (
            <EmptyCard text="No matching problems found." />
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-slate-500">
            {selectedProblems.length} selected
          </span>
          <div className="flex gap-2 sm:justify-end">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedProblems.length}
              onClick={() => onAdd(selectedProblems)}
              type="button"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}

function WorkflowNote({ text }) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900">
      {text}
    </div>
  );
}
