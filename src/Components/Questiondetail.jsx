import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";
import "./Questiondetail.css";

const CodeCompiler = lazy(() => import("./CodeCompiler.jsx"));

const tabs = ["Statement", "Submissions", "Solution", "Hints", "AI Help"];
// const customActions = ["Visualize Code", "Run", "Submit", "Next"];
const starterLanguages = [
  ["java", "Java"],
  ["cpp", "C++"],
  ["python", "Python"],
  ["javascript", "JavaScript"],
];

const formatDateTime = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const isAcceptedSubmission = (submission) =>
  /accepted|success|passed/i.test(String(submission?.status || ""));

const normalizeHints = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((hint) => {
        if (typeof hint === "string") return hint.trim();
        return String(hint?.text || hint?.content || hint?.hint || "").trim();
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n{2,}/)
      .map((hint) => hint.trim())
      .filter(Boolean);
  }

  return [];
};

const getSolutionEntries = (solution) => {
  if (!solution) return [];

  if (typeof solution === "string") {
    return solution.trim() ? [["official", "Official", solution.trim()]] : [];
  }

  if (typeof solution === "object") {
    return Object.entries(solution)
      .map(([key, value]) => [
        key,
        key.charAt(0).toUpperCase() + key.slice(1),
        String(value || "").trim(),
      ])
      .filter(([, , value]) => value);
  }

  return [];
};

const getFirstSampleInput = (problem) => {
  const sampleInput = problem?.sampleTestCases?.[0]?.input;

  return sampleInput == null ? "" : String(sampleInput);
};

const renderInlineMarkdown = (text, keyPrefix) =>
  text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;

      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={key}>{part.slice(1, -1)}</code>;
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }

      return part;
    });

const splitMarkdownTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isMarkdownTableSeparator = (line) =>
  splitMarkdownTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));

const isMarkdownListItem = (line) => /^\s*(?:[-*+]|\d+\.)\s+/.test(line);

const renderAssistantMarkdown = (content) => {
  const lines = String(content || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre key={`code-${blocks.length}`}>
          <code className={language ? `language-${language}` : undefined}>
            {codeLines.join("\n")}
          </code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Heading = `h${Math.min(3, heading[1].length)}`;
      blocks.push(
        <Heading key={`heading-${blocks.length}`}>
          {renderInlineMarkdown(heading[2], `heading-${blocks.length}`)}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      isMarkdownTableSeparator(lines[index + 1].trim())
    ) {
      const headers = splitMarkdownTableRow(line);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(splitMarkdownTableRow(lines[index].trim()));
        index += 1;
      }

      blocks.push(
        <div className="ai-markdown-table-wrap" key={`table-${blocks.length}`}>
          <table>
            <thead>
              <tr>
                {headers.map((cell, cellIndex) => (
                  <th key={`header-${cellIndex}`}>
                    {renderInlineMarkdown(cell, `table-head-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td key={`cell-${cellIndex}`}>
                      {renderInlineMarkdown(
                        row[cellIndex] || "",
                        `table-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (isMarkdownListItem(line)) {
      const ordered = /^\d+\./.test(line);
      const items = [];

      while (
        index < lines.length &&
        isMarkdownListItem(lines[index].trim()) &&
        /^\d+\./.test(lines[index].trim()) === ordered
      ) {
        items.push(lines[index].trim().replace(/^(?:[-*+]|\d+\.)\s+/, ""));
        index += 1;
      }

      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={`list-${blocks.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`}>
              {renderInlineMarkdown(item, `list-${blocks.length}-${itemIndex}`)}
            </li>
          ))}
        </List>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (
        next.startsWith("```") ||
        /^(#{1,6})\s+/.test(next) ||
        isMarkdownListItem(next) ||
        (next.includes("|") &&
          index + 1 < lines.length &&
          isMarkdownTableSeparator(lines[index + 1].trim()))
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${blocks.length}`}>
        {renderInlineMarkdown(
          paragraph.join(" "),
          `paragraph-${blocks.length}`,
        )}
      </p>,
    );
  }

  return blocks;
};

const DetailSection = ({ title, children }) => {
  if (!children) return null;

  return (
    <section className="statement-section">
      <h2>{title}</h2>
      {typeof children === "string" ? <p>{children}</p> : children}
    </section>
  );
};

const TabStateMessage = ({ type = "empty", children }) => (
  <div className={`tab-state-card ${type}`}>{children}</div>
);

const Questiondetail = ({
  theme,
  user,
  problemId: providedProblemId,
  questionSource = "problem",
}) => {
  const { id } = useParams();
  const problemId = providedProblemId || id;
  const [problem, setProblem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [activeTab, setActiveTab] = useState("Statement");
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [verificationState, setVerificationState] = useState({
    status: "idle",
    passed: 0,
    total: 0,
    message: "",
    canSubmit: false,
  });
  const [submissionsState, setSubmissionsState] = useState({
    status: "idle",
    items: [],
    message: "",
  });
  const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [solutionUnlockState, setSolutionUnlockState] = useState({
    key: "",
    status: "idle",
    message: "",
  });
  const [selectedSolutionKey, setSelectedSolutionKey] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiState, setAiState] = useState({ status: "idle", message: "" });
  const aiMessagesEndRef = useRef(null);

  const focusTabByIndex = (index) => {
    const tab = tabs[index];
    if (!tab) return;

    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`problem-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`)
        ?.focus();
    });
  };

  const handleTabKeyDown = (event, index) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTabByIndex((index + 1) % tabs.length);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTabByIndex((index - 1 + tabs.length) % tabs.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusTabByIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusTabByIndex(tabs.length - 1);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const openCustomInput = (action) => {
    if (action === "Next") return;

    if (action === "Submit") {
      setMessage(
        verificationState.canSubmit
          ? "Solution is ready to submit."
          : "You must pass all verification test cases before submitting.",
      );
      return;
    }

    if (action === "Run") {
      setMessage(
        "Use the Run Code button in the editor to verify your solution.",
      );
      return;
    }

    setIsCustomInputOpen(true);
  };

  const closeCustomInput = () => {
    setIsCustomInputOpen(false);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadProblem = async () => {
      if (!problemId) {
        setProblem(null);
        setStatus("error");
        setMessage("Select a problem from the problem list.");
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const endpoint =
          questionSource === "practice"
            ? "/api/practice-question-data"
            : "/api/problems";
        const response = await apiFetch(`${endpoint}/${problemId}`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Could not load this problem.");
        }
        if (!payload || typeof payload !== "object" || !payload.id) {
          throw new Error("The server returned an unexpected problem response.");
        }

        if (!isCancelled) {
          setProblem(payload);
          setStatus("ready");
        }
      } catch (error) {
        if (!isCancelled) {
          setProblem(null);
          setStatus("error");
          setMessage(error?.message || "Could not load this problem.");
        }
      }
    };

    loadProblem();

    return () => {
      isCancelled = true;
    };
  }, [problemId, questionSource, reloadAttempt]);

  useEffect(() => {
    if (!isCustomInputOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeCustomInput();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCustomInputOpen]);

  useEffect(() => {
    const solutionEntries = getSolutionEntries(problem?.solution);
    const preferredKey =
      solutionEntries.find(
        ([key]) =>
          key.toLowerCase() ===
          String(problem?.programmingLanguage || "").toLowerCase(),
      )?.[0] ||
      solutionEntries[0]?.[0] ||
      "";

    setSelectedSolutionKey(preferredKey);
    setUnlockedHints(1);
  }, [problem]);

  useEffect(() => {
    if (activeTab !== "Submissions") return undefined;

    if (!problemId || !user?.email) {
      setSubmissionsState({
        status: "empty",
        items: [],
        message: "No submissions yet.",
      });
      return undefined;
    }

    let isCancelled = false;

    const loadSubmissions = async () => {
      setSubmissionsState({ status: "loading", items: [], message: "" });

      try {
        const response = await apiFetch(
          `/api/problems/${problemId}/submissions?userEmail=${encodeURIComponent(
            user.email,
          )}`,
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Could not load submissions.");
        }

        if (!isCancelled) {
          const items = Array.isArray(payload.items) ? payload.items : [];
          setSubmissionsState({
            status: items.length ? "ready" : "empty",
            items,
            message: items.length ? "" : "No submissions yet.",
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setSubmissionsState({
            status: "error",
            items: [],
            message: error?.message || "Could not load submissions.",
          });
        }
      }
    };

    loadSubmissions();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, problemId, submissionsRefreshKey, user?.email]);

  useEffect(() => {
    if (activeTab === "AI Help") {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, aiMessages, aiState.status]);

  const starterEntries = starterLanguages.filter(
    ([key]) => problem?.starterCode?.[key],
  );
  const solutionUnlockKey = `${questionSource}:${problemId}`;
  const isUnlockingSolution =
    solutionUnlockState.key === solutionUnlockKey &&
    solutionUnlockState.status === "loading";
  const unlockedSolution =
    solutionUnlockState.key === solutionUnlockKey &&
    solutionUnlockState.status === "ready"
      ? solutionUnlockState
      : null;
  const solutionEntries = getSolutionEntries(unlockedSolution?.solution);
  const selectedSolution =
    solutionEntries.find(([key]) => key === selectedSolutionKey) ||
    solutionEntries[0];
  const earnedCredits = Math.floor(
    Math.max(0, Number(user?.stats?.totalSolved) || 0) / 3,
  );
  const usedCredits = Math.max(
    0,
    Number(user?.stats?.solutionCreditsUsed) || 0,
  );
  const profileAvailableCredits = Number(
    user?.stats?.availableSolutionCredits,
  );
  const availableCredits =
    typeof unlockedSolution?.availableCredits === "number"
      ? unlockedSolution.availableCredits
      : Number.isFinite(profileAvailableCredits)
        ? Math.max(0, profileAvailableCredits)
        : Math.max(0, earnedCredits - usedCredits);
  const hints = normalizeHints(problem?.hints);
  const visibleHints = hints.slice(0, Math.max(1, unlockedHints));
  const hiddenTestCaseCount =
    typeof problem?.hiddenTestCaseCount === "number"
      ? problem.hiddenTestCaseCount
      : Array.isArray(problem?.hiddenTestCases)
        ? problem.hiddenTestCases.length
        : 0;

  const sendAiMessage = async (event) => {
    event.preventDefault();

    const prompt = aiInput.trim();
    if (!prompt || aiState.status === "loading") return;

    const nextMessages = [...aiMessages, { role: "user", content: prompt }];
    setAiMessages(nextMessages);
    setAiInput("");
    setAiState({ status: "loading", message: "" });

    try {
      const response = await apiFetch("/api/ai/problem-help", {
        method: "POST",
        timeoutMs: 65000,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          questionSource,
          prompt,
          messages: nextMessages,
          problemContext: problem
            ? {
                title: problem.title,
                programmingLanguage: problem.programmingLanguage,
                programmingLanguageKey: String(
                  problem.programmingLanguage || "",
                ).toLowerCase(),
                difficulty: problem.difficulty,
                description: problem.description,
                inputFormat: problem.inputFormat,
                outputFormat: problem.outputFormat,
                constraints: problem.constraints,
                tags: problem.tags || [],
                starterCode: problem.starterCode || {},
                sampleTestCases: problem.sampleTestCases || [],
              }
            : null,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "AI Help is currently unavailable.");
      }

      const aiContent = String(
        payload.message || payload.response || payload.answer || "",
      ).trim();

      if (!aiContent) throw new Error("AI Help is currently unavailable.");

      setAiMessages((current) => [
        ...current,
        { role: "assistant", content: aiContent },
      ]);
      setAiState({ status: "idle", message: "" });
    } catch (error) {
      setAiState({
        status: "error",
        message: error?.message || "AI Help is currently unavailable.",
      });
    }
  };

  const unlockSolution = async () => {
    if (!user?.email || isUnlockingSolution) return;

    setSolutionUnlockState({
      key: solutionUnlockKey,
      status: "loading",
      message: "",
    });

    try {
      const endpoint =
        questionSource === "practice"
          ? `/api/practice-question-data/${encodeURIComponent(
              problemId,
            )}/unlock-solution`
          : `/api/problems/${encodeURIComponent(problemId)}/unlock-solution`;
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSolutionUnlockState({
          key: solutionUnlockKey,
          status: "error",
          message: payload.message || "Could not unlock the solution.",
          availableCredits:
            typeof payload.availableCredits === "number"
              ? payload.availableCredits
              : undefined,
        });
        return;
      }

      const entries = getSolutionEntries(payload.solution);
      const preferredKey =
        entries.find(
          ([key]) =>
            key.toLowerCase() ===
            String(problem?.programmingLanguage || "").toLowerCase(),
        )?.[0] ||
        entries[0]?.[0] ||
        "";
      setSelectedSolutionKey(preferredKey);
      setSolutionUnlockState({
        key: solutionUnlockKey,
        status: "ready",
        message: "",
        ...payload,
      });
    } catch (error) {
      setSolutionUnlockState({
        key: solutionUnlockKey,
        status: "error",
        message: error?.message || "Could not unlock the solution.",
      });
    }
  };

  const renderStatementPanel = () => (
    <>
      <div className="problem-title-row">
        <div>
          <p className="problem-kicker">{problem.programmingLanguage}</p>
          <h1>{problem.title}</h1>
        </div>
        <span className="difficulty-badge">{problem.difficulty}</span>
      </div>

      {problem.tags?.length > 0 && (
        <div className="detail-tags">
          {problem.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {message && <p className="problem-inline-message">{message}</p>}

      <DetailSection title="Description">{problem.description}</DetailSection>
      <DetailSection title="Notes">{problem.notes}</DetailSection>
      <DetailSection title="Input Format">{problem.inputFormat}</DetailSection>
      <DetailSection title="Output Format">
        {problem.outputFormat}
      </DetailSection>
      <DetailSection title="Constraints">{problem.constraints}</DetailSection>

      {problem.sampleTestCases?.length > 0 && (
        <section className="statement-section">
          <h2>Sample Test Cases</h2>
          <div className="sample-case-list">
            {problem.sampleTestCases.map((sample, index) => (
              <article
                className="sample-case-card"
                key={`${sample.input}-${index}`}
              >
                <strong>Sample {index + 1}</strong>
                <div className="sample-grid">
                  <div className="sample-card">
                    <span>Input</span>
                    <pre>{sample.input}</pre>
                  </div>
                  <div className="sample-card">
                    <span>Output</span>
                    <pre>{sample.output}</pre>
                  </div>
                </div>
                {sample.explanation && <p>{sample.explanation}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <DetailSection title="Explanation">{problem.explanation}</DetailSection>

      <section className="statement-section limit-grid">
        <div>
          <h2>Time Limit</h2>
          <p>{problem.timeLimit || "Not specified"}</p>
        </div>
        <div>
          <h2>Memory Limit</h2>
          <p>{problem.memoryLimit || "Not specified"}</p>
        </div>
        <div>
          <h2>Hidden Test Cases</h2>
          <p>{hiddenTestCaseCount} configured</p>
        </div>
      </section>

      {hiddenTestCaseCount > 0 && (
        <section className="statement-section">
          <h2>Hidden Verification</h2>
          <p>
            Hidden verification tests are used to evaluate your solution. Their
            inputs and expected outputs are not shown.
          </p>
        </section>
      )}

      {starterEntries.length > 0 && (
        <section className="statement-section">
          <h2>Starter Code</h2>
          <div className="starter-code-list">
            {starterEntries.map(([key, label]) => (
              <details key={key}>
                <summary>{label}</summary>
                <pre>{problem.starterCode[key]}</pre>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const renderSubmissionsPanel = () => {
    if (submissionsState.status === "loading") {
      return <TabStateMessage>Loading submissions...</TabStateMessage>;
    }

    if (submissionsState.status === "error") {
      return (
        <TabStateMessage type="error">
          Could not load submissions.
        </TabStateMessage>
      );
    }

    if (submissionsState.status === "empty") {
      return <TabStateMessage>No submissions yet.</TabStateMessage>;
    }

    return (
      <section className="tab-content-section">
        <div className="tab-section-heading">
          <h2>SUBMISSIONS</h2>
          <p>Your latest attempts for this problem.</p>
        </div>
        <div className="submission-list">
          {submissionsState.items.map((submission) => {
            const accepted = isAcceptedSubmission(submission);

            return (
              <article
                className={`submission-row ${accepted ? "accepted" : "failed"}`}
                key={submission.id}
              >
                <div>
                  <span className="submission-label">Verdict</span>
                  <strong>{submission.status || "Unknown"}</strong>
                </div>
                <div>
                  <span className="submission-label">Language</span>
                  <strong>{submission.language || "Not recorded"}</strong>
                </div>
                <div>
                  <span className="submission-label">Submitted</span>
                  <strong>{formatDateTime(submission.createdAt)}</strong>
                </div>
                <div>
                  <span className="submission-label">Runtime</span>
                  <strong>{submission.runtime || "Not recorded"}</strong>
                </div>
                <div>
                  <span className="submission-label">Memory</span>
                  <strong>{submission.memory || "Not recorded"}</strong>
                </div>
                <div>
                  <span className="submission-label">Score</span>
                  <strong>
                    {submission.score !== "" && submission.score != null
                      ? submission.score
                      : `${submission.passedCount || 0}/${
                          submission.totalCount || 0
                        }`}
                  </strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSolutionPanel = () => {
    if (status === "loading") {
      return <TabStateMessage>Loading solution...</TabStateMessage>;
    }

    if (problem?.hasSolution === false) {
      return (
        <TabStateMessage>
          No solution is available for this problem.
        </TabStateMessage>
      );
    }

    return (
      <section className="tab-content-section">
        <div className="tab-section-heading">
          <h2>SOLUTION</h2>
          <p>Official explanation and reference solution.</p>
        </div>

        {!unlockedSolution ? (
          <div className="solution-credit-gate">
            <p>
              Unlock this solution for 1 credit. Your solution credits are
              earned by solving 3 problems, and each solution only costs a
              credit the first time you unlock it.
            </p>
            <p className="solution-credit-balance">
              Available solution credits:{" "}
              {solutionUnlockState.key === solutionUnlockKey &&
              typeof solutionUnlockState.availableCredits === "number"
                ? solutionUnlockState.availableCredits
                : availableCredits}
            </p>
            {solutionUnlockState.key === solutionUnlockKey &&
              solutionUnlockState.status === "error" && (
                <p className="solution-credit-error" role="alert">
                  {solutionUnlockState.message}
                </p>
              )}
            {!user?.email && (
              <p className="solution-credit-error" role="alert">
                Sign in to use solution credits.
              </p>
            )}
            <button
              className="next-button"
              disabled={!user?.email || isUnlockingSolution}
              onClick={unlockSolution}
              type="button"
            >
              {isUnlockingSolution ? "Unlocking..." : "Unlock Solution (1 Credit)"}
            </button>
          </div>
        ) : (
          <>
            {unlockedSolution.explanation && (
              <div className="solution-explanation">
                <h3>Explanation</h3>
                <p>{unlockedSolution.explanation}</p>
              </div>
            )}

            {solutionEntries.length > 0 && (
              <div className="solution-code-panel">
                {solutionEntries.length > 1 && (
                  <label>
                    Language
                    <select
                      onChange={(event) =>
                        setSelectedSolutionKey(event.target.value)
                      }
                      value={selectedSolutionKey}
                    >
                      {solutionEntries.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <pre>
                  <code>{selectedSolution?.[2]}</code>
                </pre>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  const renderHintsPanel = () => {
    if (status === "loading") {
      return <TabStateMessage>Loading hints...</TabStateMessage>;
    }

    if (!hints.length) {
      return (
        <TabStateMessage>
          No hints are available for this problem.
        </TabStateMessage>
      );
    }

    return (
      <section className="tab-content-section">
        <div className="tab-section-heading">
          <h2>HINTS</h2>
          <p>Reveal one hint at a time when you need a nudge.</p>
        </div>
        <div className="hint-list">
          {visibleHints.map((hint, index) => (
            <article className="hint-card" key={`${hint}-${index}`}>
              <span>Hint {index + 1}</span>
              <p>{hint}</p>
            </article>
          ))}
        </div>
        {unlockedHints < hints.length && (
          <button
            className="ghost-button hint-next-button"
            onClick={() =>
              setUnlockedHints((current) => Math.min(current + 1, hints.length))
            }
            type="button"
          >
            Show Hint {unlockedHints + 1}
          </button>
        )}
      </section>
    );
  };

  const renderAiPanel = () => (
    <section className="tab-content-section ai-help-panel">
      <div className="tab-section-heading">
        <h2>AI HELP</h2>
        <p>Ask about the current problem, your approach, or an error.</p>
      </div>

      {status === "loading" && (
        <TabStateMessage>Preparing AI Help...</TabStateMessage>
      )}

      {aiState.status === "error" && (
        <TabStateMessage type="error">
          {aiState.message || "AI Help is currently unavailable."}
        </TabStateMessage>
      )}

      <div className="ai-message-list" aria-live="polite">
        {!aiMessages.length && (
          <div className="ai-empty-state">
            <strong>Ask for guidance without revealing the full answer.</strong>
            <div className="ai-prompt-grid">
              {[
                "Explain this problem.",
                "Give me a hint.",
                "What concept should I use?",
                "Give me a small example.",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setAiInput(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((chatMessage, index) => (
          <article
            className={`ai-message ${chatMessage.role}`}
            key={`${chatMessage.role}-${index}`}
          >
            <span>{chatMessage.role === "user" ? "You" : "AI"}</span>
            {chatMessage.role === "assistant" ? (
              <div className="ai-markdown">
                {renderAssistantMarkdown(chatMessage.content)}
              </div>
            ) : (
              <p>{chatMessage.content}</p>
            )}
          </article>
        ))}

        {aiState.status === "loading" && (
          <article className="ai-message assistant">
            <span>AI</span>
            <p>Analyzing..</p>
          </article>
        )}
        <div ref={aiMessagesEndRef} />
      </div>

      <form className="ai-input-form" onSubmit={sendAiMessage}>
        <textarea
          aria-label="Ask AI Help"
          onChange={(event) => setAiInput(event.target.value)}
          placeholder="Ask about this problem..."
          rows={3}
          value={aiInput}
        />
        <button
          className="next-button"
          disabled={!aiInput.trim() || aiState.status === "loading"}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );

  const renderActiveTabPanel = () => {
    if (status === "loading" && activeTab === "Statement") {
      return <p className="problem-detail-state">Loading problem...</p>;
    }

    if (status === "error") {
      const errorCopy =
        activeTab === "Statement"
          ? message
          : activeTab === "Submissions"
            ? "Could not load submissions."
            : activeTab === "Solution"
              ? "Could not load the solution."
              : activeTab === "Hints"
                ? "Could not load hints."
                : "AI Help is currently unavailable.";

      return (
        <div className="problem-detail-state error" role="alert">
          <p>{errorCopy}</p>
          {activeTab === "Statement" && (
            <button
              className="next-button"
              onClick={() => setReloadAttempt((attempt) => attempt + 1)}
              type="button"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    if (!problem) return null;

    if (activeTab === "Submissions") return renderSubmissionsPanel();
    if (activeTab === "Solution") return renderSolutionPanel();
    if (activeTab === "Hints") return renderHintsPanel();
    if (activeTab === "AI Help") return renderAiPanel();
    return renderStatementPanel();
  };

  return (
    <main className="problem-workspace">
      <header className="problem-header">
        <div className="problem-header-left">
          <button
            className="ghost-button back-button"
            onClick={goBack}
            type="button"
          >
            <span aria-hidden="true">&lt;</span>
            Back
          </button>
          {problem?.difficulty && (
            <span className="header-pill medium">{problem.difficulty}</span>
          )}
        </div>

        <div className="problem-header-actions" aria-label="Problem actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Bookmark problem"
          >
            *
          </button>
          <span className="timer-pill">Timer</span>
          <button className="ghost-button" type="button">
            Previous
          </button>
          <button className="next-button" type="button">
            Next
          </button>
        </div>
      </header>

      <section className="problem-layout">
        <article className="problem-panel problem-statement-panel">
          <nav
            className="problem-tabs"
            aria-label="Problem sections"
            role="tablist"
          >
            {tabs.map((tab, index) => {
              const tabId = `problem-tab-${tab
                .toLowerCase()
                .replace(/\s+/g, "-")}`;
              const panelId = `${tabId}-panel`;

              return (
                <button
                  aria-controls={panelId}
                  aria-selected={activeTab === tab}
                  className={`problem-tab ${activeTab === tab ? "active" : ""}`}
                  id={tabId}
                  key={tab}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  tabIndex={activeTab === tab ? 0 : -1}
                  type="button"
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          <div
            aria-labelledby={`problem-tab-${activeTab
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="statement-content"
            id={`problem-tab-${activeTab.toLowerCase().replace(/\s+/g, "-")}-panel`}
            role="tabpanel"
          >
            {renderActiveTabPanel()}
          </div>
        </article>

        <aside
          className="problem-panel compiler-detail-panel"
          aria-label="Code editor"
        >
          <Suspense
            fallback={
              <div className="compiler-loading">Loading compiler...</div>
            }
          >
            <CodeCompiler
              onLogout={() => {}}
              onToggleTheme={() => {}}
              theme={theme || "light"}
              user={user}
              preferredLanguage={problem?.programmingLanguage}
              problemId={problemId}
              starterCode={problem?.starterCode}
              sampleInput={getFirstSampleInput(problem)}
              hiddenTestCaseCount={hiddenTestCaseCount}
              onVerificationStateChange={setVerificationState}
              onSolutionSubmitted={() =>
                setSubmissionsRefreshKey((current) => current + 1)
              }
            />
          </Suspense>

          {/* <div className="custom-trigger-actions" aria-label="Code actions">
            {customActions.map((action) => (
              <button
                className={`custom-action ${action.toLowerCase().replace(/\s+/g, "-")}`}
                disabled={action === "Submit" && !verificationState.canSubmit}
                key={action}
                onClick={() => openCustomInput(action)}
                type="button"
              >
                {action}
              </button>
            ))}
          </div> */}
        </aside>
      </section>

      {/* {isCustomInputOpen && ( */}
        {/* // <div */}
        {/* //   className="custom-input-overlay"
        //   onClick={closeCustomInput}
        //   role="presentation" */}
        {/* // >
        //   <section */}
        {/* //     aria-label="Custom input"
        //     aria-modal="true"
        //     className="custom-input-panel"
        //     onClick={(event) => event.stopPropagation()}
        //     role="dialog" */}
        {/* //   > */}
        {/* //     <div className="custom-input-header">
        //       <h2>Test against Custom Input</h2>
        //       <button */}
        {/* //         aria-label="Close custom input"
        //         className="custom-close-button"
        //         onClick={closeCustomInput}
        //         type="button" */}
        {/* //       >
        //         x
        //       </button> */}
        {/* //     </div> */}
        {/* //     <textarea aria-label="Custom input" rows={6} />
        //     <div className="custom-input-actions">
        //       {customActions.map((action) => ( */}
        {/* //         <button */}
        {/* //           className={`custom-action ${action.toLowerCase().replace(/\s+/g, "-")}`}
        //           key={action}
        //           type="button"
        //         >
        //           {action}
        //         </button> */}
        {/* //       ))} */}
        {/* //     </div> */}
        {/* //   </section> */}
        {/* // </div> */}
      {/* // )} */}
    </main>
  );
};

export default Questiondetail;
