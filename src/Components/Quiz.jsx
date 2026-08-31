/* eslint-disable react/prop-types */
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import quizCategories from "./QuizCategories";
import UserMenu from "./UserMenu";
import Footer from "./LandingPage/Footer";
import { apiFetch } from "../api";

import logoImg from "./LandingPage/imaiges/logo.png";
import heroImg from "./LandingPage/imaiges/landingImaige.png";
import "./home.css";
import "./Questiondetail.css";

const CodeCompiler = lazy(() => import("./CodeCompiler"));

const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatLongCountdown = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const isImageUrl = (value = "") =>
  /^(https?:\/\/|\/|data:image\/)/i.test(value);

function Quiz({
  contestSettings,
  contestLanding = false,
  quizLanding = false,
  quizSettings = {},
  user,
  users = [],
  theme,
  questions,
  routeCategory = "",
  userBlocked = false,
  onChangePractice,
  onLogout,
  onOpenContest,
  onPracticeComplete,
  onSelectCategory,
  onToggleTheme,
}) {
  const CONTEST_CATEGORY = "__contest__";
  const QUIZ_CATEGORY = "__configured_quiz__";
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [localCategory, setLocalCategory] = useState("");
  const [contestQuestions, setContestQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [contestProblemsState, setContestProblemsState] = useState("loading");
  const [contestProblems, setContestProblems] = useState([]);
  const [contestRemainingSeconds, setContestRemainingSeconds] = useState(
    contestSettings?.contestDurationSeconds || 600,
  );
  const [contestElapsedSeconds, setContestElapsedSeconds] = useState(0);
  const [showContestLeaderboard, setShowContestLeaderboard] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [learningPaths, setLearningPaths] = useState([]);
  const [learningPathsState, setLearningPathsState] = useState("loading");

  const selectedCategory = routeCategory || localCategory;
  const isContest = selectedCategory === CONTEST_CATEGORY;
  const isConfiguredQuiz = selectedCategory === QUIZ_CATEGORY;
  const started = Boolean(selectedCategory);
  const contestDurationSeconds = contestSettings?.contestDurationSeconds || 600;
  const contestQuestionCount = contestSettings?.contestQuestionCount || 10;
  const contestName = (contestSettings?.contestName || "Weekly Contest").trim();
  const selectedContestQuestionIds = contestSettings?.selectedQuestionIds || [];
  const selectedQuizQuestionIds = quizSettings?.selectedQuizQuestionIds || [];
  const selectedQuizQuestions = selectedQuizQuestionIds
    .map((questionId) =>
      questions.find((question) => String(question.id) === String(questionId)),
    )
    .filter(Boolean);
  const selectedContestProblems = selectedContestQuestionIds
    .map((problemId) =>
      contestProblems.find(
        (problem) => String(problem.id) === String(problemId),
      ),
    )
    .filter(Boolean);
  const showLeaderboardToUsers = Boolean(
    contestSettings?.showLeaderboardToUsers,
  );
  const scheduleStart = contestSettings?.startAt
    ? new Date(contestSettings.startAt).getTime()
    : null;
  const scheduleEnd = contestSettings?.endAt
    ? new Date(contestSettings.endAt).getTime()
    : null;
  const isBeforeContest = Boolean(
    contestSettings?.isScheduled && scheduleStart && nowTs < scheduleStart,
  );
  const isAfterContest = Boolean(
    contestSettings?.isScheduled && scheduleEnd && nowTs > scheduleEnd,
  );
  const isContestOpen =
    !contestSettings?.isScheduled || (!isBeforeContest && !isAfterContest);
  const isLeaderboardPublished = showLeaderboardToUsers && isAfterContest;
  const timeToStartSeconds = scheduleStart
    ? Math.max(0, Math.floor((scheduleStart - nowTs) / 1000))
    : 0;
  const timeToScheduleEndSeconds = scheduleEnd
    ? Math.max(0, Math.floor((scheduleEnd - nowTs) / 1000))
    : Number.POSITIVE_INFINITY;

  useEffect(() => {
    let isCancelled = false;

    const loadContestProblems = async () => {
      try {
        const response = await apiFetch(
          "/api/problems?limit=100&status=published",
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            payload.message || "Could not load contest problems.",
          );
        }
        if (!isCancelled) {
          setContestProblems(payload.items || []);
          setContestProblemsState("ready");
        }
      } catch {
        if (!isCancelled) {
          setContestProblems([]);
          setContestProblemsState("error");
        }
      }
    };

    loadContestProblems();
    return () => {
      isCancelled = true;
    };
  }, []);

  const practiceQuestions = isContest
    ? contestQuestions
    : isConfiguredQuiz
      ? quizQuestions
      : selectedCategory
        ? questions.filter(
            (question) =>
              question.category === selectedCategory &&
              question.section !== "contest",
          )
        : [];
  const currentQuestion = practiceQuestions[index];
  const questionNumber = index + 1;
  const progress = practiceQuestions.length
    ? (questionNumber / practiceQuestions.length) * 100
    : 0;
  const effectiveContestRemaining = isContest
    ? Math.max(0, Math.min(contestRemainingSeconds, timeToScheduleEndSeconds))
    : 0;

  const leaderboard = useMemo(
    () =>
      users
        .map((item) => {
          const contest =
            item.stats?.contestByName?.[contestName] ||
            item.stats?.contest ||
            {};
          const totalQuestions = contest.totalQuestions || 0;
          const avg = totalQuestions
            ? (contest.totalTimeSeconds || 0) / totalQuestions
            : Number.POSITIVE_INFINITY;
          return {
            name: item.name,
            totalCorrect: contest.totalCorrect || 0,
            avgTimePerQuestion: avg,
            attempts: contest.attempts || 0,
          };
        })
        .filter((item) => item.attempts > 0)
        .sort(
          (a, b) =>
            b.totalCorrect - a.totalCorrect ||
            a.avgTimePerQuestion - b.avgTimePerQuestion,
        )
        .slice(0, 5),
    [contestName, users],
  );

  const getQuestionCount = (category) =>
    questions.filter(
      (question) =>
        question.category === category && question.section !== "contest",
    ).length;

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadLearningPaths = async () => {
      setLearningPathsState("loading");
      try {
        const response = await apiFetch("/api/practice/languages");
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload.message || "Could not load learning paths.");
        if (!isCancelled) {
          setLearningPaths(Array.isArray(payload.items) ? payload.items : []);
          setLearningPathsState("ready");
        }
      } catch {
        if (!isCancelled) {
          setLearningPaths([]);
          setLearningPathsState("error");
        }
      }
    };

    loadLearningPaths();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
    setContestElapsedSeconds(0);
    setContestRemainingSeconds(contestDurationSeconds);
  }, [selectedCategory, contestDurationSeconds]);

  const startPractice = (category) => {
    setLocalCategory(category);
    onSelectCategory(category);
  };

  const startConfiguredQuiz = (requestedQuestionId = "") => {
    const configuredQuestions = selectedQuizQuestions.slice(
      0,
      Math.min(
        quizSettings?.quizQuestionCount || 10,
        selectedQuizQuestions.length,
      ),
    );
    const requestedQuestion = selectedQuizQuestions.find(
      (question) => String(question.id) === String(requestedQuestionId),
    );
    const quizBank = requestedQuestion
      ? [
          requestedQuestion,
          ...configuredQuestions.filter(
            (question) => question.id !== requestedQuestion.id,
          ),
        ]
      : configuredQuestions;
    setQuizQuestions(quizBank);
    setLocalCategory(QUIZ_CATEGORY);
  };

  const startContest = (requestedProblemId = "") => {
    if (!isContestOpen) {
      return;
    }

    const configuredContestBank = selectedContestProblems.slice(
      0,
      Math.min(contestQuestionCount, selectedContestProblems.length),
    );
    const requestedProblem = contestProblems.find(
      (problem) => String(problem.id) === String(requestedProblemId),
    );
    const contestBank = requestedProblem
      ? [
          requestedProblem,
          ...configuredContestBank.filter(
            (problem) => problem.id !== requestedProblem.id,
          ),
        ].slice(0, contestQuestionCount)
      : configuredContestBank;

    setContestQuestions(contestBank);
    setContestRemainingSeconds(contestDurationSeconds);
    setContestElapsedSeconds(0);
    setLocalCategory(CONTEST_CATEGORY);
  };

  const openContest = () => onOpenContest?.();

  const handleContestSubmission = () => {
    const nextScore = score + 1;
    const nextIndex = index + 1;

    setScore(nextScore);
    if (nextIndex < practiceQuestions.length) {
      setIndex(nextIndex);
      return;
    }

    finishContestAttempt(nextScore, contestElapsedSeconds);
  };

  const finishContestAttempt = (finalScore, elapsedSeconds) => {
    onPracticeComplete({
      category: "Contest",
      totalQuestions: practiceQuestions.length,
      score: finalScore,
      totalTimeSeconds: elapsedSeconds,
      contestName,
    });
    setIsFinished(true);
  };

  const checkAnswer = (option) => {
    if (selectedAnswer) {
      return;
    }

    const isCorrect = option === currentQuestion.answer;

    setSelectedAnswer(option);
    if (isCorrect) {
      setScore((current) => current + 1);
    }
  };

  const goToNextQuestion = () => {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    const next = index + 1;

    if (next < practiceQuestions.length) {
      setIndex(next);
      setSelectedAnswer("");
    } else if (isContest) {
      finishContestAttempt(score, contestElapsedSeconds);
    } else {
      onPracticeComplete({
        category: selectedCategory,
        totalQuestions: practiceQuestions.length,
        score,
      });
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
    setContestElapsedSeconds(0);
    if (isContest) {
      setContestRemainingSeconds(contestDurationSeconds);
    }
  };

  const changePractice = () => {
    setLocalCategory("");
    setContestQuestions([]);
    setShowContestLeaderboard(false);
    setContestRemainingSeconds(contestDurationSeconds);
    setContestElapsedSeconds(0);
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
    onChangePractice();
  };

  useEffect(() => {
    if (!isContest || !started || isFinished || !currentQuestion) {
      return;
    }

    if (effectiveContestRemaining <= 0) {
      finishContestAttempt(score, contestElapsedSeconds);
      return;
    }

    const timerId = window.setTimeout(() => {
      setContestRemainingSeconds((current) => Math.max(0, current - 1));
      setContestElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [
    contestElapsedSeconds,
    currentQuestion,
    effectiveContestRemaining,
    isContest,
    isFinished,
    score,
    started,
  ]);

  if (quizLanding && !started) {
    return (
      <main className={`quiz-shell home-page ${theme}-theme`}>
        <header className="user-bar" aria-label="Quiz navigation">
          <span>{quizSettings.quizName || "Practice Quiz"}</span>
          <div className="user-actions">
            <button
              className="secondary-action"
              onClick={onChangePractice}
              type="button"
            >
              Back to Quiz
            </button>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </header>
        <section className="home-container contest-list-page">
          <div className="home-hero-content">
            <span className="home-badge">Multiple Choice Quiz</span>
            <h1 className="home-hero-title">
              {quizSettings.quizName || "Practice Quiz"}
            </h1>
            <p className="home-description">
              Select a question to begin the configured quiz.
            </p>
          </div>
          <section className="home-practice-section">
            <h2 className="home-section-title">Selected Quiz Questions</h2>
            <div className="admin-list">
              {selectedQuizQuestions.map((question, questionIndex) => (
                <article className="admin-row" key={question.id}>
                  <div>
                    <strong>
                      {questionIndex + 1}. {question.question}
                    </strong>
                    <span>
                      {question.category} | {question.options.join(" | ")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            {!selectedQuizQuestions.length && (
              <p className="home-empty-state">
                No questions have been selected for this quiz.
              </p>
            )}
            <button
              className="primary-action"
              disabled={!selectedQuizQuestions.length}
              onClick={() => startConfiguredQuiz()}
              type="button"
            >
              Start Quiz
            </button>
          </section>
        </section>
      </main>
    );
  }

  if (contestLanding && !started) {
    return (
      <main className={`quiz-shell home-page ${theme}-theme`}>
        <header className="user-bar" aria-label="Contest navigation">
          <span>{contestName}</span>
          <div className="user-actions">
            <button
              className="secondary-action"
              onClick={onChangePractice}
              type="button"
            >
              Back to Quiz
            </button>
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
        <section className="home-container contest-list-page">
          <div className="home-hero-content">
            <span className="home-badge">Coding Contest</span>
            <h1 className="home-hero-title">{contestName}</h1>
            <p className="home-description">
              Solve the selected coding problems with one shared contest timer.
            </p>
            <p className="home-description">
              {selectedContestProblems.length} selected problems for this
              contest
            </p>
          </div>
          <section className="home-practice-section">
            <h2 className="home-section-title">Selected Contest Problems</h2>
            <div className="admin-list">
              {selectedContestProblems.map((problem, problemIndex) => (
                <button
                  className="admin-row contest-problem-card"
                  key={problem.id}
                  onClick={() => startContest(problem.id)}
                  type="button"
                >
                  <div>
                    <strong>
                      {problemIndex + 1}. {problem.title}
                    </strong>
                    <span>
                      {problem.difficulty} |{" "}
                      {problem.programmingLanguage || "Language not set"}
                    </span>
                  </div>
                  <span aria-hidden="true">Open</span>
                </button>
              ))}
            </div>
            {!selectedContestProblems.length &&
              contestProblemsState === "ready" && (
                <p className="home-empty-state">
                  No problems have been selected for this contest.
                </p>
              )}
            {contestProblemsState === "loading" && (
              <p className="home-empty-state">
                Loading selected contest problems...
              </p>
            )}
            <button
              className="primary-action"
              disabled={
                !isContestOpen ||
                contestProblemsState !== "ready" ||
                !selectedContestProblems.length
              }
              onClick={startContest}
              type="button"
            >
              {isBeforeContest ? "Contest Not Started" : "Start Contest"}
            </button>
          </section>
        </section>
      </main>
    );
  }

  if (!started) {
    const contestCardSubtitle = isBeforeContest
      ? `Starts in ${formatClock(timeToStartSeconds)}`
      : isAfterContest
        ? "Contest has ended"
        : `Duration ${formatClock(contestDurationSeconds)} | ${contestQuestionCount} questions`;

    return (
      <main className={`quiz-shell home-page ${theme}-theme`}>
        <nav className="home-navbar" aria-label="Main navigation">
          <div className="home-navbar-left">
            <img alt="Code Snipers logo" className="home-logo" src={logoImg} />
            <span className="home-brand">Code Snipers</span>
            <span className="home-greeting">Hi, {user.name}</span>
          </div>

          <div className="home-nav-links">
            <a href="/all-courses">Course</a>

            <a href="/all-problem">Problem</a>
            <a href="/game">Game</a>
            <a href="/compiler">Compiler</a>
          </div>

          <div className="home-navbar-right">
            <button
              className="home-theme-btn"
              onClick={onToggleTheme}
              type="button"
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "🌙"}</span>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {!userBlocked ? (
              <UserMenu user={user} onLogout={onLogout} />
            ) : (
              <button
                className="secondary-action"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        <div className="home-container">
          <section className="home-hero">
            <div className="home-hero-content">
              <span className="home-badge">Quick brain workout ⚡</span>
              <h1 className="home-hero-title">
                Code <span className="accent">Snipers</span>
              </h1>
              <p className="home-contest-name">{contestName}</p>
              <p className="home-description">
                Contest uses one full timer for the entire exam. You can see
                remaining exam time live.
              </p>
              {isBeforeContest && (
                <p className="home-description">
                  Contest starts in{" "}
                  <strong>{formatLongCountdown(timeToStartSeconds)}</strong>
                </p>
              )}
            </div>

            <div className="home-hero-visual">
              <div
                aria-hidden="true"
                className="home-float-card home-float-code"
              >
                {"</>"}
              </div>
              <div
                aria-hidden="true"
                className="home-float-card home-float-rank"
              >
                <span>🏆 Rank</span>
                <strong>#128</strong>
              </div>
              <img
                alt="Developer coding on laptop"
                className="home-hero-img"
                src={heroImg}
              />
            </div>
          </section>

          <section className="home-start">
            <h2 className="home-section-title">Start</h2>
            <div className="home-start-cards">
              <button className="home-action-card" type="button">
                <a href="/quiz/start/">
                  <span aria-hidden="true" className="home-action-icon purple">
                    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span className="home-action-body">
                    <strong>Quiz</strong>
                    <small>Practice topic-wise questions.</small>
                  </span>
                  <span aria-hidden="true" className="home-action-arrow">
                    →
                  </span>
                </a>
              </button>

              <button
                className="home-action-card"
                disabled={
                  !isContestOpen ||
                  contestProblemsState !== "ready" ||
                  !contestProblems.length
                }
                onClick={openContest}
                type="button"
              >
                <span aria-hidden="true" className="home-action-icon green">
                  <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
                    <path
                      d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                <span className="home-action-body">
                  <strong>Contest</strong>
                  <small>{contestCardSubtitle}</small>
                </span>
                <span aria-hidden="true" className="home-action-arrow">
                  →
                </span>
              </button>

              {isLeaderboardPublished && (
                <button
                  className="home-action-card"
                  onClick={() =>
                    setShowContestLeaderboard((current) => !current)
                  }
                  type="button"
                >
                  <span aria-hidden="true" className="home-action-icon orange">
                    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
                      <path
                        d="M18 20V10M12 20V4M6 20v-6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span className="home-action-body">
                    <strong>
                      {showContestLeaderboard
                        ? "Hide Contest Leaderboard"
                        : "View Contest Leaderboard"}
                    </strong>
                    <small>See top performers in this contest.</small>
                  </span>
                  <span aria-hidden="true" className="home-action-arrow">
                    →
                  </span>
                </button>
              )}
            </div>
          </section>

          <section aria-label="Platform statistics" className="home-stats">
            <div className="home-stat-item">
              <span aria-hidden="true" className="home-stat-icon blue">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <div className="home-stat-text">
                <strong>1500+ Problems</strong>
                <span>Solve real coding problems</span>
              </div>
            </div>
            <div className="home-stat-item">
              <span aria-hidden="true" className="home-stat-icon green">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path
                    d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <div className="home-stat-text">
                <strong>50+ Courses</strong>
                <span>Structured learning paths</span>
              </div>
            </div>
            <div className="home-stat-item">
              <span aria-hidden="true" className="home-stat-icon purple">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path
                    d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <div className="home-stat-text">
                <strong>50+ Contests</strong>
                <span>Compete and win rewards</span>
              </div>
            </div>
            <div className="home-stat-item">
              <span aria-hidden="true" className="home-stat-icon orange">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <div className="home-stat-text">
                <strong>1K+ Users</strong>
                <span>Growing developer community</span>
              </div>
            </div>
          </section>

          <section className="home-practice-section">
            <h2 className="home-section-title">Quiz Categories</h2>
            <div className="home-category-grid">
              {quizCategories.map((category) => {
                const count = getQuestionCount(category);
                return (
                  <button
                    className="home-category-card"
                    disabled={!count}
                    key={category}
                    onClick={() => startPractice(category)}
                    type="button"
                  >
                    <span>{category}</span>
                    <small>
                      {count
                        ? `${count} question${count === 1 ? "" : "s"}`
                        : "No questions yet"}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="home-lang-section">
            <h2 className="home-section-title">Practice</h2>
            <div className="home-lang-grid">
              {learningPaths.map((language) => {
                const count = language.questionCount || 0;
                const icon =
                  language.icon || language.name.slice(0, 2).toUpperCase();
                return (
                  <Link
                    aria-label={`Open ${language.name} learning path`}
                    className="home-lang-card"
                    key={language.id}
                    to={`/practice/${encodeURIComponent(language.slug)}`}
                  >
                    {isImageUrl(icon) ? (
                      <img alt="" className="logo" src={icon} />
                    ) : (
                      <span className="home-language-icon">{icon}</span>
                    )}
                    <h2>{language.name}</h2>
                    <p>
                      {count
                        ? `${count} question${count === 1 ? "" : "s"}`
                        : "No questions yet"}
                    </p>
                    <span className="button">Open</span>
                  </Link>
                );
              })}
            </div>
            {learningPathsState === "loading" && (
              <p className="home-empty-state">Loading practice...</p>
            )}
            {learningPathsState === "error" && (
              <p className="home-empty-state">
                Unable to load practice questions. Please refresh and try again.
              </p>
            )}
            {learningPathsState === "ready" && !learningPaths.length && (
              <p className="home-empty-state">
                No learning paths have been published yet.
              </p>
            )}
          </section>

          {showContestLeaderboard &&
            isLeaderboardPublished &&
            leaderboard.length > 0 && (
              <section
                aria-label="Contest leaderboard"
                className="home-leaderboard"
              >
                <h2 className="home-section-title">{contestName}</h2>
                {leaderboard.map((row, idx) => (
                  <div
                    className="home-leaderboard-row"
                    key={`${row.name}-${idx}`}
                  >
                    <strong>
                      #{idx + 1} {row.name}
                    </strong>
                    <span>
                      {row.totalCorrect} correct |{" "}
                      {row.avgTimePerQuestion.toFixed(2)}s avg
                    </span>
                  </div>
                ))}
              </section>
            )}

          <div className="home-footer-wrap">
            <Footer />
          </div>
        </div>
      </main>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / practiceQuestions.length) * 100);
    return (
      <main className={`quiz-shell ${theme}-theme`}>
        <header className="user-bar" aria-label="Signed in user">
          <span>Hi, {user.name}</span>
          <div className="user-actions">
            <button
              className="secondary-action"
              onClick={onToggleTheme}
              type="button"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {!userBlocked ? (
              <UserMenu user={user} onLogout={onLogout} />
            ) : (
              <button
                className="secondary-action"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        </header>
        <section className="result-panel">
          <p className="eyebrow">
            {isContest ? "Contest complete" : "Quiz complete"}
          </p>
          <h1>{percentage}% Score</h1>
          <p className="hero-text">
            You answered {score} out of {practiceQuestions.length} correctly.
          </p>
          {isContest && (
            <p className="hero-text">
              Time used: {formatClock(contestElapsedSeconds)}
            </p>
          )}
          <div className="score-ring">
            {score}/{practiceQuestions.length}
          </div>
          <div className="result-actions">
            <button className="primary-action" onClick={restartQuiz}>
              Play Again
            </button>
            <button
              className="secondary-action"
              onClick={changePractice}
              type="button"
            >
              Change Practice
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className={`quiz-shell ${theme}-theme`}>
        <section className="result-panel">
          <h1>No Questions</h1>
          <button
            className="primary-action"
            onClick={changePractice}
            type="button"
          >
            Choose Practice
          </button>
        </section>
      </main>
    );
  }

  if (isConfiguredQuiz) {
    return (
      <main className={`quiz-shell ${theme}-theme`}>
        <header className="user-bar" aria-label="Quiz navigation">
          <span>{quizSettings.quizName || "Practice Quiz"}</span>
          <div className="user-actions">
            <span>
              {questionNumber} / {practiceQuestions.length}
            </span>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </header>
        <section className="question-panel">
          <div className="quiz-topbar">
            <strong>{quizSettings.quizName || "Practice Quiz"}</strong>
            <span>{practiceQuestions.length - index - 1} left</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <h2>{currentQuestion.question}</h2>
          <div className="answer-grid">
            {currentQuestion.options.map((option) => (
              <button
                className={`answer-option ${selectedAnswer === option ? (option === currentQuestion.answer ? "correct" : "wrong") : ""}`}
                disabled={Boolean(selectedAnswer)}
                key={option}
                onClick={() => checkAnswer(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="result-actions">
            <button
              className="primary-action"
              disabled={!selectedAnswer}
              onClick={goToNextQuestion}
              type="button"
            >
              {index + 1 < practiceQuestions.length ? "Next" : "Finish"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (isContest) {
    return (
      <main className={`quiz-shell contest-workspace ${theme}-theme`}>
        <header className="user-bar" aria-label="Contest navigation">
          <span>{contestName}</span>
          <div className="user-actions">
            <span className="contest-timer">
              {formatClock(effectiveContestRemaining)}
            </span>
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
        <section className="problem-layout contest-problem-layout">
          <article className="problem-panel problem-statement-panel">
            <div className="problem-tabs">
              <button className="problem-tab active" type="button">
                Statement
              </button>
              <button className="problem-tab" type="button">
                Submissions
              </button>
              <button className="problem-tab" type="button">
                Solution
              </button>
              <button className="problem-tab" type="button">
                Hints
              </button>
              <button className="problem-tab" type="button">
                AI Help
              </button>
            </div>
            <div className="statement-content">
              <div className="problem-title-row">
                <div>
                  <p className="problem-kicker">
                    Problem {questionNumber} of {practiceQuestions.length}
                    {currentQuestion.programmingLanguage &&
                      ` | ${currentQuestion.programmingLanguage}`}
                  </p>
                  <h1>{currentQuestion.title}</h1>
                </div>
                <span className="difficulty-badge">
                  {currentQuestion.difficulty}
                </span>
              </div>
              {currentQuestion.tags?.length > 0 && (
                <div className="detail-tags">
                  {currentQuestion.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              <h2>Description</h2>
              {currentQuestion.description && (
                <p>{currentQuestion.description}</p>
              )}
              {currentQuestion.notes && (
                <>
                  <h2>Notes</h2>
                  <p>{currentQuestion.notes}</p>
                </>
              )}
              {currentQuestion.inputFormat && (
                <>
                  <h2>Input Format</h2>
                  <p>{currentQuestion.inputFormat}</p>
                </>
              )}
              {currentQuestion.outputFormat && (
                <>
                  <h2>Output Format</h2>
                  <p>{currentQuestion.outputFormat}</p>
                </>
              )}
              {currentQuestion.constraints && (
                <>
                  <h2>Constraints</h2>
                  <p>{currentQuestion.constraints}</p>
                </>
              )}
              {currentQuestion.sampleTestCases?.length > 0 && (
                <section className="statement-section">
                  <h2>Sample Test Cases</h2>
                  {currentQuestion.sampleTestCases.map(
                    (sample, sampleIndex) => (
                      <article
                        className="sample-case-card"
                        key={`${sample.input}-${sampleIndex}`}
                      >
                        <strong>Sample {sampleIndex + 1}</strong>
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
                    ),
                  )}
                </section>
              )}
              {currentQuestion.explanation && (
                <>
                  <h2>Explanation</h2>
                  <p>{currentQuestion.explanation}</p>
                </>
              )}
              <div className="limit-grid">
                {currentQuestion.timeLimit && (
                  <div>
                    <h2>Time Limit</h2>
                    <p>{currentQuestion.timeLimit}</p>
                  </div>
                )}
                {currentQuestion.memoryLimit && (
                  <div>
                    <h2>Memory Limit</h2>
                    <p>{currentQuestion.memoryLimit}</p>
                  </div>
                )}
                {Array.isArray(currentQuestion.hiddenTestCases) && (
                  <div>
                    <h2>Hidden Test Cases</h2>
                    <p>{currentQuestion.hiddenTestCases.length}</p>
                  </div>
                )}
              </div>
            </div>
          </article>
          <aside
            className="problem-panel compiler-detail-panel"
            aria-label="Contest code editor"
          >
            <Suspense
              fallback={<p className="compiler-loading">Loading compiler...</p>}
            >
              <CodeCompiler
                hiddenTestCases={currentQuestion.hiddenTestCases}
                onLogout={onLogout}
                onSolutionSubmitted={handleContestSubmission}
                onToggleTheme={onToggleTheme}
                preferredLanguage={currentQuestion.programmingLanguage}
                problemId={currentQuestion.id}
                starterCode={currentQuestion.starterCode}
                theme={theme}
                user={user}
                key={currentQuestion.id}
              />
            </Suspense>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className={`quiz-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Signed in user">
        <span>Hi, {user.name}</span>
        <div className="user-actions">
          <button
            className="secondary-action"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {!userBlocked ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : (
            <button
              className="secondary-action"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <section className="question-panel">
        <div className="quiz-topbar">
          <div>
            <p className="eyebrow">Question {questionNumber}</p>
            <span>{practiceQuestions.length - index - 1} left</span>
          </div>
          <strong>{isContest ? "Contest" : selectedCategory}</strong>
          {isContest && (
            <span className="contest-timer">
              {formatClock(effectiveContestRemaining)}
            </span>
          )}
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <h2>{currentQuestion.question}</h2>
        <div className="answer-grid">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isAnswer = option === currentQuestion.answer;
            const stateClass =
              selectedAnswer && isAnswer
                ? "correct"
                : isSelected
                  ? "wrong"
                  : "";
            return (
              <button
                className={`answer-option ${stateClass}`}
                disabled={Boolean(selectedAnswer)}
                key={option}
                onClick={() => checkAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="result-actions">
          <button
            className="primary-action"
            disabled={!selectedAnswer}
            onClick={goToNextQuestion}
            type="button"
          >
            {index + 1 < practiceQuestions.length ? "Next" : "Finish"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Quiz;
