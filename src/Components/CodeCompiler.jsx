/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Link } from "react-router-dom";
import { pageRoutes } from "../pageRoutes";
import UserMenu from "./UserMenu";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://codingbackend-rdyv.onrender.com")
).replace(/\/+$/, "");
const API_FALLBACK_BASE_URL = "https://codingbackend-rdyv.onrender.com";
const apiUrl = (path) => `${API_BASE_URL}${path}`;
const fallbackApiUrl = (path) => `${API_FALLBACK_BASE_URL}${path}`;

const languageConfigs = {
  javascript: {
    label: "JavaScript",
    eyebrow: "Browser Runner",
    extension: javascript({ jsx: true }),
    showInput: false,
    starter: `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Coder"));
console.log(2 + 2);`,
  },
  python: {
    label: "Python",
    eyebrow: "Server Runner",
    extension: python(),
    showInput: true,
    starter: `name = input() or "Coder"
print(f"Hello, {name}!")
print(2 + 2)`,
    stdin: "Coder",
  },
  java: {
    label: "Java",
    eyebrow: "Server Runner",
    extension: java(),
    showInput: true,
    starter: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    String name = scanner.hasNextLine() ? scanner.nextLine() : "Coder";
    System.out.println("Hello, " + name + "!");
    System.out.println(2 + 2);
  }
}`,
    stdin: "Coder",
  },
  cpp: {
    label: "C++",
    eyebrow: "Server Runner",
    extension: cpp(),
    showInput: true,
    starter: `#include <iostream>
#include <string>
using namespace std;

int main() {
  string name;
  getline(cin, name);
  if (name.empty()) {
    name = "Coder";
  }
  cout << "Hello, " << name << "!" << endl;
  cout << 2 + 2 << endl;
  return 0;
}`,
    stdin: "Coder",
  },
  html: {
    label: "HTML",
    eyebrow: "Live Preview",
    extension: html(),
    showInput: false,
    starter: `<!doctype html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 24px;
      }
      h1 {
        color: #0f766e;
      }
    </style>
  </head>
  <body>
    <h1>Hello, Coder!</h1>
    <button onclick="document.querySelector('p').textContent = 'Button clicked!'">
      Click me
    </button>
    <p>HTML, CSS and JavaScript preview runs here.</p>
  </body>
</html>`,
  },
  css: {
    label: "CSS",
    eyebrow: "Style Preview",
    extension: css(),
    showInput: false,
    starter: `body {
  background: #f8fafc;
  color: #14213d;
  font-family: Arial, sans-serif;
  padding: 24px;
}

.card {
  border: 2px solid #14b8a6;
  border-radius: 8px;
  padding: 20px;
}

h1 {
  color: #0f766e;
}`,
  },
};

const serverLanguages = new Set(["python", "java", "cpp"]);
const previewLanguages = new Set(["html", "css"]);

const normalizeLanguageKey = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (["java", "javac", "jvm"].includes(normalized)) {
    return "java";
  }

  if (["c++", "cpp", "c/c++", "c"].includes(normalized)) {
    return "cpp";
  }

  if (["python", "py"].includes(normalized)) {
    return "python";
  }

  if (["javascript", "js"].includes(normalized)) {
    return "javascript";
  }

  return normalized;
};

const runApiFetch = async (path, options) => {
  const primaryUrl = apiUrl(path);
  const response = await fetch(primaryUrl, options);

  if (response.status !== 404) {
    return response;
  }

  let isSameOrigin = false;

  try {
    const resolvedPrimaryUrl = new URL(primaryUrl, window.location.origin);
    isSameOrigin = resolvedPrimaryUrl.origin === window.location.origin;
  } catch {
    isSameOrigin = primaryUrl.startsWith("/");
  }

  if (!isSameOrigin) {
    return response;
  }

  return fetch(fallbackApiUrl(path), options);
};

const getCssPreview = (code) => `<!doctype html>
<html>
  <head>
    <style>${code}</style>
  </head>
  <body>
    <main class="card">
      <h1>CSS Preview</h1>
      <p>Edit the CSS and run again to see the style output.</p>
      <button>Sample Button</button>
    </main>
  </body>
</html>`;

function CodeCompiler({
  onLogout,
  onToggleTheme,
  theme,
  user,
  preferredLanguage,
  problemId,
  starterCode = {},
  hiddenTestCases = [],
  onVerificationStateChange,
  onCodeStateChange,
  onSolutionSubmitted,
}) {
  const [language, setLanguage] = useState("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    Object.fromEntries(
      Object.entries(languageConfigs).map(([key, config]) => [
        key,
        starterCode[key] || config.starter,
      ]),
    ),
  );
  const [stdinByLanguage, setStdinByLanguage] = useState(() =>
    Object.fromEntries(
      Object.entries(languageConfigs).map(([key, config]) => [
        key,
        config.stdin || "",
      ]),
    ),
  );
  const [output, setOutput] = useState(
    "Choose a language, write code, then click Run Code.",
  );
  const [previewHtml, setPreviewHtml] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeState, setCodeState] = useState({
    language,
    code: languageConfigs[language].starter,
  });
  const [verificationState, setVerificationState] = useState({
    status: "idle",
    passed: 0,
    total: 0,
    message: "",
    canSubmit: false,
  });
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  const config = languageConfigs[language];
  const code = codeByLanguage[language];
  const stdin = stdinByLanguage[language] || "";
  const editorTheme = theme === "dark" ? oneDark : "light";
  const extensions = useMemo(() => [config.extension], [config]);

  const clearRun = () => {
    window.clearTimeout(timeoutRef.current);
    if (frameRef.current) {
      frameRef.current.remove();
      frameRef.current = null;
    }
  };

  useEffect(() => clearRun, []);

  useEffect(() => {
    const nextLanguage = normalizeLanguageKey(preferredLanguage);

    if (!nextLanguage || !languageConfigs[nextLanguage]) {
      return;
    }

    setLanguage(nextLanguage);
    setPreviewHtml("");
    setOutput(`Ready to run ${languageConfigs[nextLanguage].label}.`);
  }, [preferredLanguage]);

  const updateVerificationState = (nextState) => {
    setVerificationState((current) => {
      const nextValue = { ...current, ...nextState };
      onVerificationStateChange?.(nextValue);
      return nextValue;
    });
  };

  const updateCode = (nextCode) => {
    setCodeByLanguage((current) => ({ ...current, [language]: nextCode }));
    setCodeState({ language, code: nextCode });
    updateVerificationState({
      status: "idle",
      passed: 0,
      total: 0,
      message: "",
      canSubmit: false,
    });
    onCodeStateChange?.({ language, code: nextCode });
  };

  useEffect(() => {
    const nextCode = codeByLanguage[language] || config.starter;
    setCodeState({ language, code: nextCode });
    onCodeStateChange?.({ language, code: nextCode });
  }, [language, codeByLanguage, config.starter, onCodeStateChange]);

  const updateStdin = (event) => {
    setStdinByLanguage((current) => ({
      ...current,
      [language]: event.target.value,
    }));
  };

  const changeLanguage = (event) => {
    const nextLanguage = event.target.value;
    const nextCode =
      codeByLanguage[nextLanguage] || languageConfigs[nextLanguage].starter;
    setLanguage(nextLanguage);
    setPreviewHtml("");
    setOutput(`Ready to run ${languageConfigs[nextLanguage].label}.`);
    setCodeState({ language: nextLanguage, code: nextCode });
    updateVerificationState({
      status: "idle",
      passed: 0,
      total: 0,
      message: "",
      canSubmit: false,
    });
    onCodeStateChange?.({ language: nextLanguage, code: nextCode });
  };

  const runJavaScript = () =>
    new Promise((resolve) => {
      clearRun();
      const frame = document.createElement("iframe");
      const runId = crypto.randomUUID?.() || String(Date.now());
      const safeCode = JSON.stringify(code).replace(/<\//g, "<\\/");
      frame.sandbox = "allow-scripts";
      frame.style.display = "none";
      frameRef.current = frame;

      const handleMessage = (event) => {
        if (event.data?.runId !== runId) {
          return;
        }

        window.removeEventListener("message", handleMessage);
        clearRun();
        resolve(event.data.output || "Code ran successfully with no output.");
      };

      window.addEventListener("message", handleMessage);

      timeoutRef.current = window.setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        clearRun();
        resolve("Execution stopped: code took too long to finish.");
      }, 3000);

      frame.srcdoc = `
        <script>
          const lines = [];
          const print = (...values) => {
            lines.push(values.map((value) => {
              if (typeof value === "string") return value;
              try {
                return JSON.stringify(value, null, 2);
              } catch {
                return String(value);
              }
            }).join(" "));
          };

          console.log = print;
          console.warn = (...values) => print("Warning:", ...values);
          console.error = (...values) => print("Error:", ...values);
          window.onerror = (message, source, line, column) => {
            lines.push("Error: " + message + " at line " + line + ":" + column);
            parent.postMessage({ runId: ${JSON.stringify(runId)}, output: lines.join("\\n") }, "*");
            return true;
          };

          try {
            const result = Function(${safeCode})();
            if (result !== undefined) {
              print(result);
            }
            parent.postMessage({ runId: ${JSON.stringify(runId)}, output: lines.join("\\n") }, "*");
          } catch (error) {
            lines.push(error?.stack || String(error));
            parent.postMessage({ runId: ${JSON.stringify(runId)}, output: lines.join("\\n") }, "*");
          }
        </script>
      `;

      document.body.appendChild(frame);
    });

  const runServerCode = async () => {
    const response = await runApiFetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code, stdin }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "Could not run this code.");
    }

    return `${payload.output}${payload.runtime ? `\n\nRuntime: ${payload.runtime}` : ""}`;
  };

  const runPreview = () => {
    const nextPreview = language === "css" ? getCssPreview(code) : code;
    setPreviewHtml(nextPreview);
    return "Preview updated.";
  };

  const runVerification = async () => {
    const totalCases = Array.isArray(hiddenTestCases)
      ? hiddenTestCases.length
      : 0;

    if (!problemId || totalCases === 0 || !serverLanguages.has(language)) {
      updateVerificationState({
        status: "idle",
        passed: 0,
        total: 0,
        message: "",
        canSubmit: false,
      });
      return;
    }

    updateVerificationState({
      status: "running",
      passed: 0,
      total: totalCases,
      message: "Verifying against hidden test cases...",
      canSubmit: false,
    });

    try {
      const response = await runApiFetch(
        `/api/problems/${problemId}/verify-solution`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code }),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "Could not verify this solution.");
      }

      const passed = Number(payload.passedCount || 0);
      const total = Number(payload.totalCount || 0);
      const allPassed = Boolean(
        total > 0 && payload.allPassed && passed === total,
      );
      const nextMessage = allPassed
        ? "✅ All test cases verified successfully.\nYou can now submit your solution."
        : "❌ Test cases failed.\nPlease check your logic and try again.";

      updateVerificationState({
        status: allPassed ? "passed" : "failed",
        passed,
        total,
        message: nextMessage,
        canSubmit: allPassed,
      });
    } catch {
      updateVerificationState({
        status: "failed",
        passed: 0,
        total: totalCases,
        message:
          "❌ Test cases failed.\nPlease check your logic and try again.",
        canSubmit: false,
      });
    }
  };

  const submitSolution = async () => {
    if (!problemId) {
      updateVerificationState({
        status: "failed",
        message: "Problem context is missing. Cannot submit.",
      });
      return;
    }

    if (!verificationState.canSubmit) {
      updateVerificationState({
        status: "failed",
        message: "You must pass verification before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    updateVerificationState({
      status: "running",
      message: "Submitting solution...",
    });

    try {
      const response = await runApiFetch(
        `/api/problems/${problemId}/submit-solution`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: codeState.language,
            code: codeState.code,
            userEmail: user?.email || "",
            username: user?.name || "",
          }),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "Could not submit this solution.");
      }

      updateVerificationState({
        status: "passed",
        message: "✅ Solution submitted and accepted.",
      });
      setOutput(payload.message || "Solution accepted.");
      onSolutionSubmitted?.();
    } catch (error) {
      updateVerificationState({
        status: "failed",
        message: error?.message || "Solution submission failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    setPreviewHtml("");

    try {
      const nextOutput = previewLanguages.has(language)
        ? runPreview()
        : serverLanguages.has(language)
          ? await runServerCode()
          : await runJavaScript();

      setOutput(nextOutput);
      await runVerification();
    } catch (error) {
      setOutput(error?.message || "Could not run this code.");
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    updateCode(config.starter);
    setStdinByLanguage((current) => ({
      ...current,
      [language]: config.stdin || "",
    }));
    setPreviewHtml("");
    setOutput(`Reset ${config.label} starter code.`);
  };

  return (
    <main className={`quiz-shell compiler-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Compiler navigation">
        <span>Code Compiler</span>
        <div className="user-actions">
          <Link className="secondary-action" to={pageRoutes.quiz}>
            Quiz
          </Link>
          <button
            className="secondary-action"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </header>

      <section className="compiler-panel">
        <div className="compiler-heading">
          <div>
            <p className="eyebrow">{config.eyebrow}</p>
            <h1>Code Compiler</h1>
          </div>
          <div className="compiler-actions">
            <label className="compiler-select">
              Language
              <select onChange={changeLanguage} value={language}>
                {Object.entries(languageConfigs).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="secondary-action"
              onClick={resetCode}
              type="button"
            >
              Reset
            </button>
            <button
              className="primary-action"
              disabled={isRunning}
              onClick={runCode}
              type="button"
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
            <button
              className="primary-action"
              disabled={
                !verificationState.canSubmit || isSubmitting || !problemId
              }
              onClick={submitSolution}
              type="button"
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>

        {config.showInput && (
          <label className="compiler-input">
            Input
            <textarea
              onChange={updateStdin}
              placeholder="Program input / stdin"
              rows={3}
              value={stdin}
            />
          </label>
        )}

        {(verificationState.total > 0 ||
          verificationState.status !== "idle") && (
          <div
            className="compiler-verification-card"
            style={{
              background:
                verificationState.status === "passed"
                  ? "#ecfdf3"
                  : verificationState.status === "running"
                    ? "#eff6ff"
                    : "#fef2f2",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "grid",
              gap: "6px",
            }}
          >
            <strong
              style={{
                color:
                  verificationState.status === "passed"
                    ? "#166534"
                    : verificationState.status === "running"
                      ? "#1d4ed8"
                      : "#991b1b",
              }}
            >
              {verificationState.message || "Verification status"}
            </strong>
            <span style={{ color: "#334155", fontSize: "0.95rem" }}>
              {verificationState.total > 0
                ? `Passed: ${verificationState.passed} / ${verificationState.total} test cases`
                : "Verification pending."}
            </span>
          </div>
        )}

        <div className="compiler-grid">
          <div className="compiler-card">
            <div className="compiler-card-header">
              <strong>Editor</strong>
              <span>{config.label}</span>
            </div>
            <CodeMirror
              basicSetup={{ lineNumbers: true, foldGutter: true }}
              className="compiler-editor"
              extensions={extensions}
              height="420px"
              onChange={updateCode}
              theme={editorTheme}
              value={code}
            />
          </div>

          <div className="compiler-card output-card">
            <div className="compiler-card-header">
              <strong>
                {previewLanguages.has(language) ? "Preview" : "Output"}
              </strong>
              <span>
                {previewLanguages.has(language) ? "Browser" : "Console"}
              </span>
            </div>
            {previewHtml ? (
              <iframe
                className="compiler-preview"
                sandbox="allow-scripts"
                srcDoc={previewHtml}
                title="Code output preview"
              />
            ) : (
              <pre className="compiler-output">{output}</pre>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CodeCompiler;
