import { useLocation } from "react-router-dom";
import "./problems.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../api";

const problemCategories = {
  "/javaproblem": "Java",
  "/cppproblem": "C++",
  "/quiz/cppproblem": "C++",
  "/htmlproblem": "HTML",
  "/cssproblem": "CSS",

  "/javascriptproblem": "JavaScript",
};

const Problems = () => {
  const { pathname } = useLocation();
  const category = problemCategories[pathname] || "Java";
 
  return (

<div className="Container">
  <div className="f">Sachin kumar</div>
  
  <div className="s">puja kumar
    <div class="practiesmodularheader">
      <div class="PracticemoduleNumberbadge">
        <span class="PracticemoduleNumber">1</span>
        </div>
        <div class="practicemoduleinfo">
          <h3 class="practicemoduletitel">Print statement and java Syntex</h3>
          <p class="practicemoduledescription">
            Practice the basic concept of java one of the moust widly used object oriented programing languages 
          </p>
        </div>

        <div class="practicemoduleprogress"></div>
        <span></span>
      </div>
     <div class="div2">div2</div>
     <div class="div3">div3</div>
     <div class="div4">div4</div>
     <div class ="div5">div5</div>
     <div class="div6">div6</div>
     <div class="div7">div7</div>
     <div class="div8">div8</div>
     <div class="div9">div9</div>
  </div>
</div>























    
    
  const category = problemCategories[pathname] || "";
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    programmingLanguage: category,
    page: 1,
  });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFilters((current) => ({ ...current, programmingLanguage: category, page: 1 }));
  }, [category]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: "12",
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

  useEffect(() => {
    let isCancelled = false;

    const loadProblems = async () => {
      setStatus("loading");
      setMessage("");

      try {
        const response = await apiFetch(`/api/problems?${queryString}`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Could not load problems.");
        }

        if (!isCancelled) {
          setProblems(Array.isArray(payload.items) ? payload.items : []);
          setMeta({
            page: payload.page || 1,
            totalPages: payload.totalPages || 1,
            total: payload.total || 0,
          });
          setStatus("ready");
        }
      } catch (error) {
        if (!isCancelled) {
          setProblems([]);
          setStatus("error");
          setMessage(error?.message || "Could not load problems.");
        }
      }
    };

    loadProblems();

    return () => {
      isCancelled = true;
    };
  }, [queryString]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  };

  const changePage = (direction) => {
    setFilters((current) => ({
      ...current,
      page: Math.min(meta.totalPages, Math.max(1, current.page + direction)),
    }));
  };

  return (
    <main className="problems-shell">
      <section className="problems-header">
        <div>
          <p className="eyebrow">Problem Collection</p>
          <h1>{category || "All"} Problems</h1>
          <p>Practice coding problems with codesniper. And crack interview your dream company..</p>
        </div>
        <span>{meta.total} problems</span>
      </section>

      <section className="problem-filter-bar" aria-label="Problem filters">
        <input
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search by title or tag"
          value={filters.search}
        />
        <select
          onChange={(event) => updateFilter("difficulty", event.target.value)}
          value={filters.difficulty}
        >
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          onChange={(event) => updateFilter("programmingLanguage", event.target.value)}
          value={filters.programmingLanguage}
        >
          <option value="">All languages</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="Python">Python</option>
          <option value="JavaScript">JavaScript</option>
          <option value="HTML">HTML</option>
          <option value="CSS">CSS</option>
        </select>
      </section>

      {status === "loading" && <p className="problem-state">Loading problems...</p>}
      {status === "error" && <p className="problem-state error">{message}</p>}
      {status === "ready" && !problems.length && (
        <p className="problem-state">No problems found. Add problems from the Admin Panel.</p>
      )}

      <section className="problem-list" aria-label="Problems">
        {problems.map((problem) => (
          <article className="problem-list-card" key={problem.id}>
            <div>
              <div className="problem-card-meta">
                <span className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
                <span>{problem.programmingLanguage}</span>
              </div>
              <h2>{problem.title}</h2>
              {problem.tags?.length > 0 && (
                <div className="problem-tags">
                  {problem.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <Link className="problem-solve-button" to={`/problem/${problem.id}`}>
              Solve
            </Link>
          </article>
        ))}
      </section>

      {meta.totalPages > 1 && (
        <div className="problem-pagination">
          <button disabled={meta.page <= 1} onClick={() => changePage(-1)} type="button">
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button disabled={meta.page >= meta.totalPages} onClick={() => changePage(1)} type="button">
            Next
          </button>
        </div>
      )}
    </main>
  );
};

export default Problems;
