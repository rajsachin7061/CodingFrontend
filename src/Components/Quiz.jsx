/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import quizCategories from "./QuizCategories";
import UserMenu from "./UserMenu";
import { pageRoutes } from "../pageRoutes";


function Quiz({
  user,
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
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const selectedCategory = routeCategory;
  const started = Boolean(selectedCategory);

  const practiceQuestions = selectedCategory
    ? questions.filter((question) => question.category === selectedCategory)
    : [];
  const currentQuestion = practiceQuestions[index];
  const questionNumber = index + 1;
  const progress = practiceQuestions.length
    ? (questionNumber / practiceQuestions.length) * 100
    : 0;

  const getQuestionCount = (category) =>
    questions.filter((question) => question.category === category).length;

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
  }, [selectedCategory]);

  const startPractice = (category) => {
    onSelectCategory(category);
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
      } else {
        onPracticeComplete({
          category: selectedCategory,
          totalQuestions: practiceQuestions.length,
          score: nextScore,
        });
        setIsFinished(true);
      }
    }, 700);
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
  };

  const changePractice = () => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setIsFinished(false);
    onChangePractice();
  };

  if (!started) {
    return (
      <main className={`quiz-shell ${theme}-theme`}>
        <header className="user-bar" aria-label="Signed in user">
          <span>Hi, {user.name}</span>
          <div className="user-actions">
            {!userBlocked && (
              <Link className="secondary-action" to={pageRoutes.profile}>
                My Profile
              </Link>
            )}
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
              <button className="secondary-action" onClick={onLogout} type="button">
                Logout
              </button>
            )}
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Quick brain workout</p>
            <h1>Online Quiz</h1>
            <p className="hero-text">
              Pick a practice topic and challenge yourself with fast questions,
              instant feedback, and a final score to beat next time.
            </p>
            <div className="practice-panel" aria-label="Practice quiz categories">
              <strong>Practice</strong>
              <div className="practice-grid">
                {quizCategories.map((category) => {
                  const questionCount = getQuestionCount(category);

                  return (
                    <button
                      className="practice-card"
                      disabled={!questionCount}
                      key={category}
                      onClick={() => startPractice(category)}
                      type="button"
                    >
                      <span>{category}</span>
                      <small>
                        {questionCount
                          ? `${questionCount} question${questionCount === 1 ? "" : "s"}`
                          : "No questions yet"}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="feature-row" aria-label="Quiz features">
          <div>
            <strong>Instant</strong>
            <span>Answer feedback</span>
          </div>
          <div>
            <strong>{questions.length}</strong>
            <span>Total questions</span>
          </div>
          <div>
            <strong>Replay</strong>
            <span>Try for a better score</span>
          </div>
        </section>
      </main>
    );
  }

  if (isFinished) {
    const practicePercentage = Math.round((score / practiceQuestions.length) * 100);

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
              <button className="secondary-action" onClick={onLogout} type="button">
                Logout
              </button>
            )}
          </div>
        </header>

        <section className="result-panel">
          <p className="eyebrow">Quiz complete</p>
          <h1>{practicePercentage}% Score</h1>
          <p className="hero-text">
            You answered {score} out of {practiceQuestions.length} {selectedCategory}{" "}
            questions correctly.
          </p>
          <div className="score-ring" aria-label={`Score ${score}`}>
            {score}/{practiceQuestions.length}
          </div>
          <div className="result-actions">
            <button className="primary-action" onClick={restartQuiz}>
              Play Again
            </button>
            <button className="secondary-action" onClick={changePractice} type="button">
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
              <button className="secondary-action" onClick={onLogout} type="button">
                Logout
              </button>
            )}
          </div>
        </header>

        <section className="result-panel">
          <p className="eyebrow">{selectedCategory} Practice</p>
          <h1>No Questions</h1>
          <p className="hero-text">
            This practice section does not have any questions yet.
          </p>
          <button className="primary-action" onClick={changePractice} type="button">
            Choose Practice
          </button>
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
            <button className="secondary-action" onClick={onLogout} type="button">
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
          <strong>{selectedCategory}</strong>
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
      </section>
    </main>
  );
}

export default Quiz;
