import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";
import "./Questiondetail.css";

const CodeCompiler = lazy(() => import("./CodeCompiler.jsx"));

const tabs = ["Statement", "Submissions", "Solution", "Hints", "AI Help"];
const customActions = ["Visualize Code", "Run", "Submit", "Next"];
const starterLanguages = [
  ["java", "Java"],
  ["cpp", "C++"],
  ["python", "Python"],
  ["javascript", "JavaScript"],
];

const DetailSection = ({ title, children }) => {
  if (!children) {
    return null;
  }

  return (
    <section className="statement-section">
      <h2>{title}</h2>
      {typeof children === "string" ? <p>{children}</p> : children}
    </section>
  );
};

const Questiondetail = ({ theme, user, problemId: providedProblemId }) => {
  const { id } = useParams();
  const problemId = providedProblemId || id;
  const [problem, setProblem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [verificationState, setVerificationState] = useState({
    status: "idle",
    passed: 0,
    total: 0,
    message: "",
    canSubmit: false,
  });

  const goBack = () => {
    window.history.back();
  };

  const openCustomInput = (action) => {
    if (action === "Next") {
      return;
    }

    if (action === "Submit") {
      if (!verificationState.canSubmit) {
        setMessage(
          "You must pass all verification test cases before submitting.",
        );
      } else {
        setMessage("✅ Solution is ready to submit.");
      }
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
        const response = await apiFetch(`/api/problems/${problemId}`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Could not load this problem.");
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
  }, [id]);

  useEffect(() => {
    if (!isCustomInputOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        closeCustomInput();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCustomInputOpen]);

  const starterEntries = starterLanguages.filter(
    ([key]) => problem?.starterCode?.[key],
  );

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
            Next Module
          </button>
        </div>
      </header>

      <section className="problem-layout">
        <article className="problem-panel problem-statement-panel">
          <nav className="problem-tabs" aria-label="Problem sections">
            {tabs.map((tab, index) => (
              <button
                className={`problem-tab ${index === 0 ? "active" : ""}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="statement-content">
            {status === "loading" && (
              <p className="problem-detail-state">Loading problem...</p>
            )}
            {status === "error" && (
              <p className="problem-detail-state error">{message}</p>
            )}
            {status === "ready" && problem && (
              <>
                <div className="problem-title-row">
                  <div>
                    <p className="problem-kicker">
                      {problem.programmingLanguage}
                    </p>
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

                <button className="ai-tutor-button" type="button">
                  AI Tutor
                </button>

                <DetailSection title="Description">
                  {problem.description}
                </DetailSection>
                <DetailSection title="Notes">{problem.notes}</DetailSection>
                <DetailSection title="Input Format">
                  {problem.inputFormat}
                </DetailSection>
                <DetailSection title="Output Format">
                  {problem.outputFormat}
                </DetailSection>
                <DetailSection title="Constraints">
                  {problem.constraints}
                </DetailSection>

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

                <DetailSection title="Explanation">
                  {problem.explanation}
                </DetailSection>

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
                    <p>{problem.hiddenTestCases?.length || 0} configured</p>
                  </div>
                </section>

                {problem.hiddenTestCases?.length > 0 && (
                  <section className="statement-section">
                    <h2>Hidden Verification</h2>
                    <p>
                      Hidden verification tests are used to evaluate your
                      solution. Their inputs and expected outputs are not shown.
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
            )}
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
              hiddenTestCases={problem?.hiddenTestCases || []}
              onVerificationStateChange={setVerificationState}
            />
          </Suspense>

          <div className="custom-trigger-actions" aria-label="Code actions">
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
          </div>
        </aside>
      </section>

      {isCustomInputOpen && (
        <div
          className="custom-input-overlay"
          onClick={closeCustomInput}
          role="presentation"
        >
          <section
            aria-label="Custom input"
            aria-modal="true"
            className="custom-input-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="custom-input-header">
              <h2>Test against Custom Input</h2>
              <button
                aria-label="Close custom input"
                className="custom-close-button"
                onClick={closeCustomInput}
                type="button"
              >
                ✕
              </button>
            </div>
            <textarea aria-label="Custom input" rows={6} />
            <div className="custom-input-actions">
              {customActions.map((action) => (
                <button
                  className={`custom-action ${action.toLowerCase().replace(/\s+/g, "-")}`}
                  key={action}
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Questiondetail;
