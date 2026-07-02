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

function CodeCompiler({ onLogout, onToggleTheme, theme, user }) {
  const [language, setLanguage] = useState("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    Object.fromEntries(Object.entries(languageConfigs).map(([key, config]) => [key, config.starter])),
  );
  const [stdinByLanguage, setStdinByLanguage] = useState(() =>
    Object.fromEntries(Object.entries(languageConfigs).map(([key, config]) => [key, config.stdin || ""])),
  );
  const [output, setOutput] = useState("Choose a language, write code, then click Run Code.");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isRunning, setIsRunning] = useState(false);
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

  const updateCode = (nextCode) => {
    setCodeByLanguage((current) => ({ ...current, [language]: nextCode }));
  };

  const updateStdin = (event) => {
    setStdinByLanguage((current) => ({ ...current, [language]: event.target.value }));
  };

  const changeLanguage = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setPreviewHtml("");
    setOutput(`Ready to run ${languageConfigs[nextLanguage].label}.`);
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
    } catch (error) {
      setOutput(error?.message || "Could not run this code.");
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    updateCode(config.starter);
    setStdinByLanguage((current) => ({ ...current, [language]: config.stdin || "" }));
    setPreviewHtml("");
    setOutput(`Reset ${config.label} starter code.`);
  };

  return (
    <main className={`quiz-shell compiler-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Compiler navigation">
        <span>Code Compiler</span>
        <div className="user-actions">
          <Link className="secondary-action" to={pageRoutes.quiz}>Quiz</Link>
          <button className="secondary-action" onClick={onToggleTheme} type="button">
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
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </label>
            <button className="secondary-action" onClick={resetCode} type="button">Reset</button>
            <button className="primary-action" disabled={isRunning} onClick={runCode} type="button">
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {config.showInput && (
          <label className="compiler-input">
            Input
            <textarea onChange={updateStdin} placeholder="Program input / stdin" rows={3} value={stdin} />
          </label>
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
              <strong>{previewLanguages.has(language) ? "Preview" : "Output"}</strong>
              <span>{previewLanguages.has(language) ? "Browser" : "Console"}</span>
            </div>
            {previewHtml ? (
              <iframe className="compiler-preview" sandbox="allow-scripts" srcDoc={previewHtml} title="Code output preview" />
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
