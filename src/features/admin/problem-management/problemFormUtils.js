export const difficulties = ["Easy", "Medium", "Hard"];

export const emptyTestCase = { input: "", output: "", explanation: "" };

export const emptyProblemForm = {
  title: "",
  slug: "",
  difficulty: "Easy",
  status: "published",
  description: "",
  constraints: "",
  inputFormat: "",
  outputFormat: "",
  sampleTestCases: [{ ...emptyTestCase }],
  hiddenTestCases: [{ ...emptyTestCase }],
  explanation: "",
  starterCodeTemplate: "",
  solution: "",
  tags: "",
};

export const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export const normalizeProblemForm = (problem = {}) => ({
  ...emptyProblemForm,
  ...problem,
  description: problem.description || problem.statement || "",
  tags: Array.isArray(problem.tags) ? problem.tags.join(", ") : problem.tags || "",
  sampleTestCases: problem.sampleTestCases?.length
    ? problem.sampleTestCases
    : [{ ...emptyTestCase }],
  hiddenTestCases: problem.hiddenTestCases?.length
    ? problem.hiddenTestCases
    : [{ ...emptyTestCase }],
  starterCodeTemplate:
    problem.starterCodeTemplate ||
    (typeof problem.starterCode === "string" ? problem.starterCode : ""),
  solution: problem.solution || "",
});

export const buildProblemPayload = (form) => ({
  title: form.title.trim(),
  slug: form.slug.trim() || toSlug(form.title),
  difficulty: form.difficulty,
  status: form.status || "published",
  description: form.description.trim(),
  constraints: form.constraints.trim(),
  inputFormat: form.inputFormat.trim(),
  outputFormat: form.outputFormat.trim(),
  sampleTestCases: form.sampleTestCases.filter(
    (item) => item.input.trim() || item.output.trim() || item.explanation.trim(),
  ),
  hiddenTestCases: form.hiddenTestCases.filter(
    (item) => item.input.trim() || item.output.trim() || item.explanation.trim(),
  ),
  explanation: form.explanation.trim(),
  starterCodeTemplate: form.starterCodeTemplate.trim(),
  solution: form.solution.trim(),
  tags: form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
});
