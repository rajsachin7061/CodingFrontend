import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import "./PracticeLearningPath.css";
import Footer from "./LandingPage/Footer.jsx";

const requestJson = async (path) => {
  const response = await apiFetch(path);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed.");
  return payload;
};

const isImageUrl = (value = "") => /^(https?:\/\/|\/|data:image\/)/i.test(value);

export default function PracticeLearningPath() {
  const { languageSlug, moduleId } = useParams();
  const [language, setLanguage] = useState(null);
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      setMessage("");
      try {
        const languages = await requestJson("/api/practice/languages");
        const selectedLanguage = (languages.items || []).find((item) => item.slug === languageSlug);
        if (!selectedLanguage) throw new Error("Learning path not found.");
        const modulePayload = await requestJson(`/api/practice/languages/${encodeURIComponent(languageSlug)}/modules`);
        const nextModules = modulePayload.items || [];
        let nextQuestions = [];
        if (moduleId) {
          if (!nextModules.some((item) => item.id === moduleId)) throw new Error("Module not found in this learning path.");
          const questionPayload = await requestJson(`/api/practice/languages/${encodeURIComponent(languageSlug)}/modules/${encodeURIComponent(moduleId)}/questions`);
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
    return () => { cancelled = true; };
  }, [languageSlug, moduleId]);

  if (status === "loading") return <main className="learning-path-shell"><p>Loading learning path…</p></main>;
  if (status === "error") return <main className="learning-path-shell"><h1>Practice unavailable</h1><p>{message}</p><Link to="/quiz">Back to Practice</Link></main>;

  const activeModule = modules.find((item) => item.id === moduleId);
  
  return (
    <main className="learning-path-shell">
      <Link className="learning-back" to="/quiz">← All learning paths</Link>
      <header className="learning-path-header">
        <span className="learning-language-icon">{isImageUrl(language.icon) ? <img alt="" src={language.icon} /> : language.icon || language.name.slice(0, 2).toUpperCase()}</span>
        <div><p className="eyebrow">Learning path</p><h1>{language.name}</h1></div>
      </header>
      {!moduleId ? (
        <section>
          <h2>Modules</h2>
          <div className="learning-module-grid">
            {modules.map((module) => <Link className="learning-card" key={module.id} reloadDocument to={`/practice/${encodeURIComponent(language.slug)}/modules/${encodeURIComponent(module.id)}`}><strong>{module.title}</strong><span>{module.description || "Start this module"}</span><small>{module.questionCount || 0} questions</small></Link>)}
          </div>
          {!modules.length && <p>No modules have been added yet.</p>}
          <div className="px-0px"><Footer></Footer></div>
        </section>
      ) : (
        <section>
          <Link className="learning-back" to={`/practice/${language.slug}`}>← {language.name} modules</Link>
          <h2>{activeModule?.title}</h2>
          {activeModule?.description && <p>{activeModule.description}</p>}
          <div className="learning-question-list">
            {questions.map((item, index) => {
              const question = item.question || {};
              const target = item.questionType === "practice" ? `/practice-question/${item.questionId}` : `/problem/${question.slug || item.problemId}`;
              return <Link className="learning-question" key={item.id} to={target}><span>{index + 1}</span><div><strong>{question.title || question.name || "Practice question"}</strong><small>{question.difficulty || "Practice"}{question.tags?.length ? ` · ${question.tags.join(", ")}` : ""}</small></div><b>Open →</b></Link>;
            })}
          </div>
          {!questions.length && <p>No active questions are available in this module.</p>}
          <div className="px-0px"><Footer></Footer></div>
        </section>
      )}
    </main>
  );
}
