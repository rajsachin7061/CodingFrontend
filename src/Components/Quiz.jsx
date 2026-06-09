/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import quizCategories from "./QuizCategories";
import UserMenu from "./UserMenu";
import { pageRoutes } from "../pageRoutes";

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

function Quiz({
  contestSettings,
  user,
  users = [],
  theme,
  questions,
  routeCategory = "",
  userBlocked = false,
  onChangePractice,
  onLogout,
  onPracticeComplete,
  onSelectCategory,
  onToggleTheme,
}) {
  const CONTEST_CATEGORY = "__contest__";
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [localCategory, setLocalCategory] = useState("");
  const [contestQuestions, setContestQuestions] = useState([]);
  const [contestRemainingSeconds, setContestRemainingSeconds] = useState(contestSettings?.contestDurationSeconds || 600);
  const [contestElapsedSeconds, setContestElapsedSeconds] = useState(0);
  const [showContestLeaderboard, setShowContestLeaderboard] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());

  const selectedCategory = routeCategory || localCategory;
  const isContest = selectedCategory === CONTEST_CATEGORY;
  const started = Boolean(selectedCategory);
  const contestDurationSeconds = contestSettings?.contestDurationSeconds || 600;
  const contestQuestionCount = contestSettings?.contestQuestionCount || 10;
  const contestName = (contestSettings?.contestName || "Weekly Contest").trim();
  const selectedContestQuestionIds = contestSettings?.selectedQuestionIds || [];
  const showLeaderboardToUsers = Boolean(contestSettings?.showLeaderboardToUsers);
  const scheduleStart = contestSettings?.startAt ? new Date(contestSettings.startAt).getTime() : null;
  const scheduleEnd = contestSettings?.endAt ? new Date(contestSettings.endAt).getTime() : null;
  const isBeforeContest = Boolean(contestSettings?.isScheduled && scheduleStart && nowTs < scheduleStart);
  const isAfterContest = Boolean(contestSettings?.isScheduled && scheduleEnd && nowTs > scheduleEnd);
  const isContestOpen = !contestSettings?.isScheduled || (!isBeforeContest && !isAfterContest);
  const isLeaderboardPublished = showLeaderboardToUsers && isAfterContest;
  const timeToStartSeconds = scheduleStart ? Math.max(0, Math.floor((scheduleStart - nowTs) / 1000)) : 0;
  const timeToScheduleEndSeconds = scheduleEnd ? Math.max(0, Math.floor((scheduleEnd - nowTs) / 1000)) : Number.POSITIVE_INFINITY;

  const practiceQuestions = isContest
    ? contestQuestions
    : selectedCategory
      ? questions.filter((question) => question.category === selectedCategory && question.section !== "contest")
      : [];
  const currentQuestion = practiceQuestions[index];
  const questionNumber = index + 1;
  const progress = practiceQuestions.length ? (questionNumber / practiceQuestions.length) * 100 : 0;
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
          const avg = totalQuestions ? (contest.totalTimeSeconds || 0) / totalQuestions : Number.POSITIVE_INFINITY;
          return {
            name: item.name,
            totalCorrect: contest.totalCorrect || 0,
            avgTimePerQuestion: avg,
            attempts: contest.attempts || 0,
          };
        })
        .filter((item) => item.attempts > 0)
        .sort((a, b) => (b.totalCorrect - a.totalCorrect) || (a.avgTimePerQuestion - b.avgTimePerQuestion))
        .slice(0, 5),
    [contestName, users],
  );

  const getQuestionCount = (category) =>
    questions.filter((question) => question.category === category && question.section !== "contest").length;

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
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

  const startContest = () => {
    if (!isContestOpen) {
      return;
    }

    const selectedContestBank = selectedContestQuestionIds
      .map((questionId) => questions.find((question) => question.id === questionId))
      .filter((question) => question && question.section !== "quiz");

    const fallbackContestBank = questions.filter((question) => question.section !== "quiz");
    const contestBank = selectedContestBank.length
      ? selectedContestBank.slice(0, Math.min(contestQuestionCount, selectedContestBank.length))
      : [...fallbackContestBank]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(contestQuestionCount, fallbackContestBank.length));

    setContestQuestions(contestBank);
    setContestRemainingSeconds(contestDurationSeconds);
    setContestElapsedSeconds(0);
    setLocalCategory(CONTEST_CATEGORY);
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
    const nextScore = isCorrect ? score + 1 : score;

    setSelectedAnswer(option);
    setScore(nextScore);

    window.setTimeout(() => {
      const next = index + 1;
      if (next < practiceQuestions.length) {
        setIndex(next);
        setSelectedAnswer("");
      } else if (isContest) {
        finishContestAttempt(nextScore, contestElapsedSeconds);
      } else {
        onPracticeComplete({
          category: selectedCategory,
          totalQuestions: practiceQuestions.length,
          score: nextScore,
        });
        setIsFinished(true);
      }
    }, 500);
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
  }, [contestElapsedSeconds, currentQuestion, effectiveContestRemaining, isContest, isFinished, score, started]);

  if (!started) {
    return (
      <main className={`quiz-shell ${theme}-theme`}>
        <header className="user-bar" aria-label="Signed in user">
          <span>Hi, {user.name}</span>
          <div className="user-actions">
            {!userBlocked && <Link className="secondary-action" to={pageRoutes.profile}>My Profile</Link>}
            <button className="secondary-action" onClick={onToggleTheme} type="button">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {!userBlocked ? <UserMenu user={user} onLogout={onLogout} /> : <button className="secondary-action" onClick={onLogout} type="button">Logout</button>}
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Quick brain workout</p>
            <h1>Online Quiz</h1>
            <p className="hero-text"><strong>{contestName}</strong></p>
            <p className="hero-text">Contest uses one full timer for the entire exam. You can see remaining exam time live.</p>
            {isBeforeContest && (
              <p className="hero-text">
                Contest starts in <strong>{formatLongCountdown(timeToStartSeconds)}</strong>
              </p>
            )}
            <div className="practice-panel">
              <strong>Start</strong>
              <div className="practice-grid">
                <button className="practice-card" type="button">
                  <span>Quiz</span>
                  <small>Practice topic-wise questions.</small>
                </button>
                <button className="practice-card" disabled={!isContestOpen || !questions.length} onClick={startContest} type="button">
                  <span>Contest</span>
                  <small>
                    {isBeforeContest
                      ? `Starts in ${formatClock(timeToStartSeconds)}`
                      : isAfterContest
                        ? "Contest has ended"
                        : `Duration ${formatClock(contestDurationSeconds)} | ${contestQuestionCount} questions`}
                  </small>
                </button>
              </div>
              {isLeaderboardPublished && (
                <button
                  className="secondary-action contest-leaderboard-toggle"
                  onClick={() => setShowContestLeaderboard((current) => !current)}
                  type="button"
                >
                  {showContestLeaderboard ? "Hide Contest Leaderboard" : "View Contest Leaderboard"}
                </button>
              )}
            </div>
            <div className="practice-panel">
              <strong>Quiz Categories</strong>
              <div className="practice-grid">
                {quizCategories.map((category) => {
                  const count = getQuestionCount(category);
                  return (
                    <button className="practice-card" disabled={!count} key={category} onClick={() => startPractice(category)} type="button">
                      <span>{category}</span>
                      <small>{count ? `${count} question${count === 1 ? "" : "s"}` : "No questions yet"}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {showContestLeaderboard && isLeaderboardPublished && leaderboard.length > 0 && (
          <section className="feature-row" aria-label="Contest leaderboard">
            <div>
              <strong>{contestName}</strong>
            </div>
            {leaderboard.map((row, idx) => (
              <div key={`${row.name}-${idx}`}>
                <strong>#{idx + 1} {row.name}</strong>
                <span>{row.totalCorrect} correct | {row.avgTimePerQuestion.toFixed(2)}s avg</span>
              </div>
            ))}
          </section>
        )}
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
            <button className="secondary-action" onClick={onToggleTheme} type="button">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
            {!userBlocked ? <UserMenu user={user} onLogout={onLogout} /> : <button className="secondary-action" onClick={onLogout} type="button">Logout</button>}
          </div>
        </header>
        <section className="result-panel">
          <p className="eyebrow">{isContest ? "Contest complete" : "Quiz complete"}</p>
          <h1>{percentage}% Score</h1>
          <p className="hero-text">You answered {score} out of {practiceQuestions.length} correctly.</p>
          {isContest && <p className="hero-text">Time used: {formatClock(contestElapsedSeconds)}</p>}
          <div className="score-ring">{score}/{practiceQuestions.length}</div>
          <div className="result-actions">
            <button className="primary-action" onClick={restartQuiz}>Play Again</button>
            <button className="secondary-action" onClick={changePractice} type="button">Change Practice</button>
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
          <button className="primary-action" onClick={changePractice} type="button">Choose Practice</button>
        </section>
      </main>
    );
  }

  return (
    <main className={`quiz-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Signed in user">
        <span>Hi, {user.name}</span>
        <div className="user-actions">
          <button className="secondary-action" onClick={onToggleTheme} type="button">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
          {!userBlocked ? <UserMenu user={user} onLogout={onLogout} /> : <button className="secondary-action" onClick={onLogout} type="button">Logout</button>}
        </div>
      </header>
      <section className="question-panel">
        <div className="quiz-topbar">
          <div>
            <p className="eyebrow">Question {questionNumber}</p>
            <span>{practiceQuestions.length - index - 1} left</span>
          </div>
          <strong>{isContest ? "Contest" : selectedCategory}</strong>
          {isContest && <span className="contest-timer">{formatClock(effectiveContestRemaining)}</span>}
        </div>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <h2>{currentQuestion.question}</h2>
        <div className="answer-grid">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isAnswer = option === currentQuestion.answer;
            const stateClass = selectedAnswer && isAnswer ? "correct" : isSelected ? "wrong" : "";
            return (
              <button className={`answer-option ${stateClass}`} disabled={Boolean(selectedAnswer)} key={option} onClick={() => checkAnswer(option)}>
                {option}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Quiz;
