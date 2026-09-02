import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import "./PracticeLearningPath.css";
import Footer from "./LandingPage/Footer.jsx";

const STORAGE_KEY = "leaderS-practice-progress";

const requestJson = async (path) => {
  const response = await apiFetch(path);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed.");
  return payload;
};

const isImageUrl = (value = "") => /^(https?:\/\/|\/|data:image\/)/i.test(value);

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const getFallbackIcon = (languageName = "", slug = "") => {
  const key = (languageName || slug || "L").toLowerCase();

  if (key.includes("react")) return "⚛️";
  if (key.includes("python")) return "🐍";
  if (key.includes("java")) return "☕";
  if (key.includes("sql")) return "🗄️";
  if (key.includes("dsa") || key.includes("algorithm")) return "🧠";
  if (key.includes("javascript") || key.includes("js")) return "✨";
  if (key.includes("html") || key.includes("css")) return "🎨";
  if (key.includes("c++") || key.includes("cpp")) return "⚙️";
  if (key.includes("c#") || key.includes("csharp")) return "#";
  if (key.includes("node")) return "🚀";

  return (languageName || slug || "LP").slice(0, 2).toUpperCase();
};

const getLanguageDescription = (language = {}) => {
  const name = language.name || language.slug || "Learning path";
  const normalized = name.toLowerCase();

  if (normalized.includes("react")) {
    return "Build component-driven interfaces and strengthen your UI problem-solving workflow.";
  }
  if (normalized.includes("python")) {
    return "Practice clean logic, data handling, and execution patterns through guided problem solving.";
  }
  if (normalized.includes("java")) {
    return "Master core concepts, object-oriented thinking, and practical coding patterns step by step.";
  }
  if (normalized.includes("sql")) {
    return "Work with queries, joins, and relational thinking to unlock data-driven problem solving.";
  }
  if (normalized.includes("dsa") || normalized.includes("algorithm")) {
    return "Sharpen your strategy, efficiency, and interview-level reasoning with structured modules.";
  }
  if (normalized.includes("javascript") || normalized.includes("js")) {
    return "Practice modern syntax, web logic, and interactive problem solving with a progressive roadmap.";
  }
  if (normalized.includes("html") || normalized.includes("css")) {
    return "Develop layouts, styling systems, and front-end fundamentals in a clean, progressive path.";
  }
  if (normalized.includes("cpp") || normalized.includes("c++")) {
    return "Build a strong foundation in logic, memory, and performance-oriented programming.";
  }

  return `Follow a structured ${name} roadmap with guided modules and practical exercises designed to level up your skills.`;
};

const PATH_THEMES = {
  react: {
    hero: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 36%, #f5f3ff 100%)",
    accent: "#6366f1",
    accentSoft: "#eef2ff",
    iconSurface: "linear-gradient(135deg, #60a5fa 0%, #8b5cf6 100%)",
    shadow: "rgba(99, 102, 241, 0.24)",
  },
  python: {
    hero: "linear-gradient(135deg, #ecfeff 0%, #dbeafe 38%, #ede9fe 100%)",
    accent: "#0ea5e9",
    accentSoft: "#ecfeff",
    iconSurface: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    shadow: "rgba(14, 165, 233, 0.22)",
  },
  java: {
    hero: "linear-gradient(135deg, #fef3c7 0%, #ede9fe 40%, #ddd6fe 100%)",
    accent: "#a855f7",
    accentSoft: "#f5f3ff",
    iconSurface: "linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)",
    shadow: "rgba(168, 85, 247, 0.22)",
  },
  javascript: {
    hero: "linear-gradient(135deg, #fef9c3 0%, #dbeafe 36%, #fdf2f8 100%)",
    accent: "#f59e0b",
    accentSoft: "#fefce8",
    iconSurface: "linear-gradient(135deg, #facc15 0%, #f97316 100%)",
    shadow: "rgba(245, 158, 11, 0.2)",
  },
  dsa: {
    hero: "linear-gradient(135deg, #ecfccb 0%, #dbeafe 40%, #e0f2fe 100%)",
    accent: "#16a34a",
    accentSoft: "#f0fdf4",
    iconSurface: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    shadow: "rgba(22, 163, 74, 0.2)",
  },
  sql: {
    hero: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 35%, #ede9fe 100%)",
    accent: "#2563eb",
    accentSoft: "#eff6ff",
    iconSurface: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
    shadow: "rgba(37, 99, 235, 0.2)",
  },
  default: {
    hero: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 40%, #f5f3ff 100%)",
    accent: "#4f46e5",
    accentSoft: "#eef2ff",
    iconSurface: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    shadow: "rgba(79, 70, 229, 0.2)",
  },
};

const getThemeForPath = (language = {}) => {
  const safeLanguage = language || {};
  const name = (safeLanguage.name || safeLanguage.slug || "").toLowerCase();
  if (name.includes("react")) return PATH_THEMES.react;
  if (name.includes("python")) return PATH_THEMES.python;
  if (name.includes("java")) return PATH_THEMES.java;
  if (name.includes("javascript") || name.includes("js")) return PATH_THEMES.javascript;
  if (name.includes("dsa") || name.includes("algorithm")) return PATH_THEMES.dsa;
  if (name.includes("sql")) return PATH_THEMES.sql;
  return PATH_THEMES.default;
};

const readProgressState = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeProgressState = (nextState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
};

const getModuleAccent = (index) => {
  const palette = [
    { soft: "#eef2ff", strong: "#6366f1" },
    { soft: "#ecfeff", strong: "#06b6d4" },
    { soft: "#f0fdf4", strong: "#22c55e" },
    { soft: "#fff7ed", strong: "#f59e0b" },
    { soft: "#fdf2f8", strong: "#ec4899" },
    { soft: "#f5f3ff", strong: "#8b5cf6" },
  ];

  return palette[index % palette.length];
};

const buildModuleDescription = (module = {}, fallbackLabel = "Module") => {
  if (module.description) return module.description;
  return `Practice ${fallbackLabel.toLowerCase()} concepts with focused questions and guided progress.`;
};

export default function PracticeLearningPath() {
  const { languageSlug, moduleId } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(null);
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [progressState, setProgressState] = useState({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setMessage("");
      setProgressState(readProgressState());

      try {
        const languages = await requestJson("/api/practice/languages");
        const selectedLanguage = (languages.items || []).find((item) => item.slug === languageSlug);

        if (!selectedLanguage) {
          throw new Error("Learning path not found.");
        }

        const modulePayload = await requestJson(`/api/practice/languages/${encodeURIComponent(languageSlug)}/modules`);
        const nextModules = (modulePayload.items || []).map((module, index) => ({
          ...module,
          order: module.order ?? index,
        }));

        let nextQuestions = [];
        if (moduleId) {
          if (!nextModules.some((item) => item.id === moduleId)) {
            throw new Error("Module not found in this learning path.");
          }

          const questionPayload = await requestJson(
            `/api/practice/languages/${encodeURIComponent(languageSlug)}/modules/${encodeURIComponent(moduleId)}/questions`,
          );
          nextQuestions = questionPayload.items || [];
        }

        if (!cancelled) {
          setLanguage(selectedLanguage);
          setModules(nextModules);
          setQuestions(nextQuestions);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error?.message || "Could not load this learning path.");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [languageSlug, moduleId]);

  const pathProgress = useMemo(() => {
    const saved = progressState[languageSlug] || {};
    const total = modules.length || 1;
    const completed = modules.filter((module) => saved[module.id]?.status === "completed").length;
    const inProgress = modules.filter((module) => saved[module.id]?.status === "in-progress").length;
    const progress = ((completed + inProgress * 0.5) / total) * 100;
    return clamp(Math.round(progress), 0, 100);
  }, [languageSlug, modules, progressState]);

  const totalQuestions = modules.reduce((sum, module) => sum + Number(module.questionCount || 0), 0);
  const activeModule = modules.find((item) => item.id === moduleId);
  const theme = getThemeForPath(language);

  const getModuleState = (module, index) => {
    const saved = progressState[languageSlug]?.[module.id];
    const previousModules = modules.slice(0, index);
    const previousUnlocked = previousModules.every((item) => {
      const entry = progressState[languageSlug]?.[item.id];
      return entry?.status === "completed" || entry?.status === "in-progress";
    });

    const baseProgress = saved?.progress ?? (() => {
      if (saved?.status === "completed") return 100;
      if (saved?.status === "in-progress") return 52;
      if (index === 0) return 18;
      if (previousUnlocked) return 8;
      return 0;
    })();

    if (saved?.status === "completed") {
      return {
        status: "completed",
        label: "Completed",
        progress: clamp(Number(saved.progress) || 100),
      };
    }

    if (saved?.status === "in-progress") {
      return {
        status: "in-progress",
        label: "In progress",
        progress: clamp(Number(saved.progress) || baseProgress),
      };
    }

    if (index === 0 || previousUnlocked) {
      return {
        status: "available",
        label: "Ready to start",
        progress: clamp(Number(baseProgress) || 0),
      };
    }

    return {
      status: "locked",
      label: "Locked",
      progress: 0,
    };
  };

  const handleStartModule = (module, index) => {
    const nextState = readProgressState();
    const currentPath = nextState[languageSlug] || {};
    const moduleState = getModuleState(module, index);

    const derivedProgress = clamp(
      moduleState.progress ||
        Math.min(88, 24 + (index + 1) * 18 + Number(module.questionCount || 0) * 2),
      0,
      100,
    );

    const saved = {
      ...currentPath,
      [module.id]: {
        status: moduleState.status === "completed" ? "completed" : "in-progress",
        progress: derivedProgress,
      },
    };

    const nextProgressState = { ...nextState, [languageSlug]: saved };
    setProgressState(nextProgressState);
    writeProgressState(nextProgressState);

    if (language?.slug) {
      navigate(`/practice/${encodeURIComponent(language.slug)}/modules/${encodeURIComponent(module.id)}`);
    }
  };

  if (status === "loading") {
    return (
      <main className="learning-path-shell">
        <div className="learning-dashboard-shell">
          <div className="learning-skeleton learning-skeleton---hero" />
          <div className="learning-skeleton learning-skeleton---row" />
          <div className="learning-skeleton learning-skeleton---row" />
          <div className="learning-skeleton learning-skeleton---row" />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="learning-path-shell">
        <div className="learning-empty-state learning-empty-state--error">
          <span className="learning-empty-state__icon">⚠️</span>
          <h1>Practice unavailable</h1>
          <p>{message}</p>
          <Link className="learning-primary-button" to="/quiz">
            Back to learning paths
          </Link>
        </div>
      </main>
    );
  }

  const renderIcon = (iconValue, altText) => {
    if (isImageUrl(iconValue)) {
      return <img alt={altText} src={iconValue} />;
    }

    return <span>{iconValue || getFallbackIcon(language?.name, language?.slug)}</span>;
  };

  return (
    <main className="learning-path-shell">
      <div className="learning-dashboard-shell">
        <Link className="learning-back" to="/quiz">
          ← All learning paths
        </Link>

        {!moduleId ? (
          <>
            <header className="learning-hero" style={{ background: theme.hero, boxShadow: `0 24px 60px -28px ${theme.shadow}` }}>
              <div className="learning-hero__content">
                <p className="learning-hero__eyebrow">Learning path</p>
                <div className="learning-hero__title-wrap">
                  <span className="learning-language-icon" style={{ background: theme.iconSurface }}>
                    {renderIcon(language?.icon, language?.name)}
                  </span>
                  <h1>{language?.name}</h1>
                </div>
                <p className="learning-hero__description">{getLanguageDescription(language)}</p>

                <div className="learning-stat-grid">
                  <div className="learning-stat-card" style={{ background: "rgba(255,255,255,0.35)" }}>
                    <span>Modules</span>
                    <strong>{modules.length}</strong>
                  </div>
                  <div className="learning-stat-card" style={{ background: "rgba(255,255,255,0.35)" }}>
                    <span>Questions</span>
                    <strong>{totalQuestions}</strong>
                  </div>
                  <div className="learning-stat-card" style={{ background: "rgba(255,255,255,0.35)" }}>
                    <span>Progress</span>
                    <strong>{pathProgress}%</strong>
                  </div>
                </div>
              </div>

              <div className="learning-path-visual" aria-hidden="true">
                <div className="learning-path-visual__panel">
                  <div className="learning-path-visual__pin learning-path-visual__pin--primary" />
                  <div className="learning-path-visual__pin learning-path-visual__pin--secondary" />
                  <div className="learning-path-visual__pin learning-path-visual__pin--tertiary" />
                  <div className="learning-path-visual__track" />

                  <div className="learning-path-visual__screen">
                    <div className="learning-path-visual__screen-header">
                      <span className="learning-path-visual__dot learning-path-visual__dot--red" />
                      <span className="learning-path-visual__dot learning-path-visual__dot--amber" />
                      <span className="learning-path-visual__dot learning-path-visual__dot--green" />
                    </div>

                    <div className="learning-path-visual__screen-body">
                      <div className="learning-path-visual__ring-wrap">
                        <div className="learning-path-visual__ring">
                          <span>{pathProgress}%</span>
                        </div>
                      </div>

                      <div className="learning-path-visual__summary">
                        <strong>{language?.name || "Learning path"}</strong>
                        <small>
                          {modules.length} modules • {totalQuestions} questions
                        </small>
                      </div>
                    </div>
                  </div>

                  {modules.slice(0, 4).map((module, index) => (
                    <div
                      className="learning-path-visual__badge"
                      key={module.id || `${module.title}-${index}`}
                      style={{
                        background: getModuleAccent(index).soft,
                        borderColor: `${getModuleAccent(index).strong}22`,
                        color: getModuleAccent(index).strong,
                      }}
                    >
                      <span>{module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </header>

            <section className="learning-modules-section">
              <div className="learning-section-heading">
                <div>
                  <p className="learning-section-heading__eyebrow">Modules</p>
                  <h2>Progress roadmap</h2>
                </div>
                <span className="learning-section-badge">
                  {modules.length} {modules.length === 1 ? "module" : "modules"}
                </span>
              </div>

              {modules.length ? (
                <div className="learning-module-list">
                  {modules.map((module, index) => {
                    const itemState = getModuleState(module, index);
                    const accent = getModuleAccent(index);
                    const moduleQuestions = Number(module.questionCount || 0);

                    return (
                      <article
                        className="learning-module-card"
                        data-status={itemState.status}
                        key={module.id}
                        style={{
                          borderColor: itemState.status === "completed" ? `${accent.strong}40` : "rgba(148, 163, 184, 0.25)",
                          background: itemState.status === "locked" ? "rgba(248, 250, 252, 0.8)" : "#ffffff",
                        }}
                      >
                        <div className="learning-module-card__icon" style={{ background: accent.soft, color: accent.strong }}>
                          {module.icon || getFallbackIcon(module.title, module.slug || "M")}
                        </div>

                        <div className="learning-module-card__content">
                          <div className="learning-module-card__header">
                            <div>
                              <h3>{module.title}</h3>
                              <p>{buildModuleDescription(module, module.title)}</p>
                            </div>
                            <span className={`learning-module-chip learning-module-chip--${itemState.status}`}>
                              {itemState.label}
                            </span>
                          </div>

                          <div className="learning-module-card__meta">
                            <span>{moduleQuestions} question{moduleQuestions === 1 ? "" : "s"}</span>
                            <span>{itemState.progress}% complete</span>
                          </div>

                          <div className="learning-progress" aria-label={`${module.title} progress`}>
                            <span style={{ width: `${itemState.progress}%`, background: itemState.status === "locked" ? "#cbd5e1" : accent.strong }} />
                          </div>
                        </div>

                        <div className="learning-module-card__actions">
                          <button
                            className="learning-primary-button"
                            disabled={itemState.status === "locked"}
                            onClick={() => handleStartModule(module, index)}
                            type="button"
                          >
                            {itemState.status === "completed" ? "Review module" : "Start module"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="learning-empty-state">
                  <span className="learning-empty-state__icon">📚</span>
                  <h3>No modules available yet</h3>
                  <p>This learning path does not have any modules published yet.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="learning-module-details">
            <Link className="learning-back" to={`/practice/${language.slug}`}>
              ← {language.name} modules
            </Link>

            <article className="learning-module-detail-card">
              <div
                className="learning-module-detail-card__header"
                style={{ background: `linear-gradient(135deg, ${theme.accentSoft} 0%, #ffffff 100%)` }}
              >
                <div className="learning-module-detail-card__title-group">
                  <span className="learning-language-icon learning-language-icon--small" style={{ background: theme.iconSurface }}>
                    {renderIcon(activeModule?.icon || language?.icon, activeModule?.title || language?.name)}
                  </span>
                  <div>
                    <p className="learning-section-heading__eyebrow">Module</p>
                    <h2>{activeModule?.title}</h2>
                  </div>
                </div>
                <span className="learning-section-badge">{questions.length} questions</span>
              </div>

              <p className="learning-module-detail-card__description">
                {activeModule?.description || buildModuleDescription(activeModule, activeModule?.title || "Module")}
              </p>

              {questions.length ? (
                <div className="learning-question-list">
                  {questions.map((item, index) => {
                    const question = item.question || {};
                    const target =
                      item.questionType === "practice"
                        ? `/practice-question/${item.questionId}`
                        : `/problem/${question.slug || item.problemId}`;

                    return (
                      <Link className="learning-question" key={item.id} to={target}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{question.title || question.name || "Practice question"}</strong>
                          <small>
                            {question.difficulty || "Practice"}
                            {question.tags?.length ? ` • ${question.tags.join(", ")}` : ""}
                          </small>
                        </div>
                        <b>Open →</b>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="learning-empty-state">
                  <span className="learning-empty-state__icon">🧩</span>
                  <h3>No questions in this module yet</h3>
                  <p>New questions will appear here when this module is published.</p>
                </div>
              )}
            </article>
          </section>
        )}

        <div className="learning-footer-wrap">
          <Footer />
        </div>
      </div>
    </main>
  );
}
