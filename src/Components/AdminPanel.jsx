/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import quizCategories, { defaultQuizCategory } from "./QuizCategories";

const emptyQuestion = {
  category: defaultQuizCategory,
  question: "",
  options: ["", "", "", ""],
  answer: "",
  section: "both",
};

const toDateTimeLocal = (iso) => {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function AdminPanel({
  backLabel = "Quiz",
  contestSettings,
  theme,
  users,
  questions,
  onAddQuestion,
  onBackToQuiz,
  onDeleteQuestion,
  onDeleteUser,
  onLogout,
  onToggleTheme,
  onToggleUserBlock,
  onUpdateContestSettings,
  onUpdateQuestion,
  onUpdateUser,
}) {
  const [draft, setDraft] = useState(emptyQuestion);
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [activeView, setActiveView] = useState("users");
  const [editingUser, setEditingUser] = useState("");
  const [editingQuestion, setEditingQuestion] = useState("");
  const [userDrafts, setUserDrafts] = useState({});
  const [questionDrafts, setQuestionDrafts] = useState({});
  const [showContestPreview, setShowContestPreview] = useState(false);
  const [showLeaderboardVerify, setShowLeaderboardVerify] = useState(false);
  const [leaderboardVerifyChecked, setLeaderboardVerifyChecked] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState({
    contestName: "Weekly Contest",
    contestQuestionCount: 10,
    contestDurationSeconds: 600,
    isScheduled: false,
    startAt: "",
    endAt: "",
    selectedQuestionIds: [],
    showLeaderboardToUsers: false,
  });

  useEffect(() => {
    setSettingsDraft({
      contestName: contestSettings?.contestName || "Weekly Contest",
      contestQuestionCount: contestSettings?.contestQuestionCount || 10,
      contestDurationSeconds: contestSettings?.contestDurationSeconds || 600,
      isScheduled: Boolean(contestSettings?.isScheduled),
      startAt: toDateTimeLocal(contestSettings?.startAt),
      endAt: toDateTimeLocal(contestSettings?.endAt),
      selectedQuestionIds: contestSettings?.selectedQuestionIds || [],
      showLeaderboardToUsers: Boolean(contestSettings?.showLeaderboardToUsers),
    });
    setShowContestPreview(false);
    setShowLeaderboardVerify(false);
    setLeaderboardVerifyChecked(false);
  }, [contestSettings]);

  const leaderboard = useMemo(
    () =>
      users
        .map((user) => {
          const contestStats =
            user.stats?.contestByName?.[(settingsDraft.contestName || "Weekly Contest").trim()] ||
            user.stats?.contest ||
            {};
          const totalQuestions = contestStats.totalQuestions || 0;
          const totalCorrect = contestStats.totalCorrect || 0;
          const totalTimeSeconds = contestStats.totalTimeSeconds || 0;
          const avgTimePerQuestion = totalQuestions ? totalTimeSeconds / totalQuestions : Number.POSITIVE_INFINITY;

          return {
            email: user.email,
            name: user.name,
            totalCorrect,
            attempts: contestStats.attempts || 0,
            avgTimePerQuestion,
          };
        })
        .filter((item) => item.attempts > 0)
        .sort((a, b) => {
          if (b.totalCorrect !== a.totalCorrect) {
            return b.totalCorrect - a.totalCorrect;
          }

          return a.avgTimePerQuestion - b.avgTimePerQuestion;
        }),
    [settingsDraft.contestName, users],
  );

  const clearMessage = () => {
    setMessage({ text: "", type: "error" });
  };
  const showError = (text) => setMessage({ text, type: "error" });
  const showSuccess = (text) => setMessage({ text, type: "success" });

  useEffect(() => {
    if (!message.text || message.type !== "success") {
      return undefined;
    }

    const timerId = window.setTimeout(clearMessage, 2500);
    return () => window.clearTimeout(timerId);
  }, [message]);

  const statusMessage =
    message.text && message.type === "error" ? (
      <div className="form-message" role="alert">
        <span>{message.text}</span>
      </div>
    ) : null;

  const successMessage =
    message.text && message.type === "success" ? (
      <div className="success-overlay" role="status">
        <div className="success-message">
          <span className="success-icon" aria-hidden="true">
            ✓
          </span>
          <span>{message.text}</span>
        </div>
      </div>
    ) : null;

  const getUserDraft = (user) => ({
    name: userDrafts[user.email]?.name ?? user.name,
    password: userDrafts[user.email]?.password ?? user.password,
  });

  const getQuestionDraft = (question) => {
    const cached = questionDrafts[question.id];
    return {
      category: cached?.category ?? question.category,
      question: cached?.question ?? question.question,
      options: cached?.options ?? [...question.options],
      answer: cached?.answer ?? question.answer,
      section: cached?.section ?? (question.section || "both"),
    };
  };

  const startEditingUser = (user) => {
    setEditingUser(user.email);
    setUserDrafts((current) => ({
      ...current,
      [user.email]: { name: user.name, password: user.password },
    }));
    clearMessage();
  };

  const startEditingQuestion = (question) => {
    if (!question.id) {
      return;
    }

    setEditingQuestion(question.id);
    setQuestionDrafts((current) => ({
      ...current,
      [question.id]: {
        category: question.category,
        question: question.question,
        options: [...question.options],
        answer: question.answer,
        section: question.section || "both",
      },
    }));
    clearMessage();
  };

  const cancelEditingUser = (email) => {
    setEditingUser("");
    setUserDrafts((current) => {
      const next = { ...current };
      delete next[email];
      return next;
    });
    clearMessage();
  };

  const cancelEditingQuestion = (questionId) => {
    setEditingQuestion("");
    setQuestionDrafts((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    clearMessage();
  };

  const updateUserDraft = (email, field, value) => {
    setUserDrafts((current) => ({
      ...current,
      [email]: { ...current[email], [field]: value },
    }));
    clearMessage();
  };

  const updateQuestionDraft = (questionId, field, value) => {
    setQuestionDrafts((current) => ({
      ...current,
      [questionId]: { ...current[questionId], [field]: value },
    }));
    clearMessage();
  };

  const saveUser = (event, user) => {
    event.preventDefault();
    const userDraft = getUserDraft(user);
    const name = userDraft.name.trim();

    if (!name) {
      showError("User name cannot be empty.");
      return;
    }

    onUpdateUser(user.email, { name, password: userDraft.password });
    setEditingUser("");
    showSuccess("User details updated successfully.");
  };

  const saveQuestion = async (event, question) => {
    event.preventDefault();
    const questionDraft = getQuestionDraft(question);
    const payload = {
      category: questionDraft.category,
      question: questionDraft.question.trim(),
      options: questionDraft.options.map((item) => item.trim()).filter(Boolean),
      answer: questionDraft.answer.trim(),
      section: questionDraft.section,
    };

    if (!payload.question || payload.options.length < 2 || !payload.answer) {
      showError("Question, answer and at least two options are required.");
      return;
    }

    if (!payload.options.includes(payload.answer)) {
      showError("Correct answer must match one of the options.");
      return;
    }

    try {
      await onUpdateQuestion(question.id, payload);
      setEditingQuestion("");
      showSuccess("Question updated successfully.");
    } catch (error) {
      showError(error?.message || "Could not update question.");
    }
  };

  const handleAddQuestion = async (event) => {
    event.preventDefault();
    const question = draft.question.trim();
    const options = draft.options.map((option) => option.trim()).filter(Boolean);
    const answer = draft.answer.trim();
    const category = draft.category;

    if (!question || options.length < 2 || !answer) {
      showError("Add a question, at least two options, and the correct answer.");
      return;
    }

    if (!options.includes(answer)) {
      showError("Correct answer must match one of the options.");
      return;
    }

    try {
      await onAddQuestion({ ...draft, category, question, options, answer });
      setDraft(emptyQuestion);
      showSuccess(`${category} question added successfully.`);
    } catch (error) {
      showError(error?.message || "Could not add question.");
    }
  };

  const saveContestSettings = async (event) => {
    event.preventDefault();

    try {
      await onUpdateContestSettings({
        contestName: (settingsDraft.contestName || "").trim() || "Weekly Contest",
        contestQuestionCount: Number(settingsDraft.contestQuestionCount),
        contestDurationSeconds: Number(settingsDraft.contestDurationSeconds),
        isScheduled: Boolean(settingsDraft.isScheduled),
        startAt: settingsDraft.startAt ? new Date(settingsDraft.startAt).toISOString() : null,
        endAt: settingsDraft.endAt ? new Date(settingsDraft.endAt).toISOString() : null,
        selectedQuestionIds: settingsDraft.selectedQuestionIds,
        showLeaderboardToUsers: Boolean(settingsDraft.showLeaderboardToUsers),
      });
      showSuccess("Contest settings saved.");
    } catch (error) {
      showError(error?.message || "Could not save contest settings.");
    }
  };

  const selectedQuestionsPreview = settingsDraft.selectedQuestionIds
    .map((questionId) => questions.find((item) => item.id === questionId))
    .filter(Boolean);

  const toggleContestQuestionSelection = (questionId, checked) => {
    setSettingsDraft((current) => {
      const currentIds = current.selectedQuestionIds || [];
      const nextIds = checked
        ? [...currentIds, questionId].filter((id, index, list) => list.indexOf(id) === index)
        : currentIds.filter((id) => id !== questionId);

      return { ...current, selectedQuestionIds: nextIds };
    });
  };

  const moveContestQuestion = (index, direction) => {
    setSettingsDraft((current) => {
      const ids = [...(current.selectedQuestionIds || [])];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= ids.length) {
        return current;
      }

      const temp = ids[index];
      ids[index] = ids[nextIndex];
      ids[nextIndex] = temp;
      return { ...current, selectedQuestionIds: ids };
    });
  };

  return (
    <main className={`quiz-shell admin-shell ${theme}-theme`}>
      {successMessage}
      <header className="user-bar" aria-label="Admin navigation">
        <span>Admin Panel</span>
        <div className="user-actions">
          <button className="secondary-action" onClick={onToggleTheme} type="button">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button className="secondary-action" onClick={onBackToQuiz} type="button">
            {backLabel}
          </button>
          <button className="secondary-action" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <section className="admin-panel">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Control Center</p>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-stats" aria-label="Admin stats">
            <strong>{users.length}</strong>
            <span>Users</span>
            <strong>{questions.length}</strong>
            <span>Questions</span>
          </div>
        </div>

        <div className="admin-tabs" aria-label="Admin views">
          {["users", "questions", "add", "contest", "leaderboard"].map((view) => (
            <button
              key={view}
              className={activeView === view ? "tab-action active" : "tab-action"}
              onClick={() => setActiveView(view)}
              type="button"
            >
              {view === "users" && "User Detail"}
              {view === "questions" && "Question Bank"}
              {view === "add" && "Add Question"}
              {view === "contest" && "Contest Settings"}
              {view === "leaderboard" && "LeaderBoard"}
            </button>
          ))}
        </div>

        {activeView === "users" && (
          <section className="admin-section">
            {statusMessage}
            <div className="admin-list">
              {users.map((user) => {
                const userDraft = getUserDraft(user);
                const isEditing = editingUser === user.email;
                return (
                  <article className="admin-row user-edit-row" key={user.email}>
                    <div className="user-edit-heading">
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        {!isEditing && <span>Password: {user.password}</span>}
                      </div>
                      <span className={user.blocked ? "status blocked" : "status active"}>
                        {user.blocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    {isEditing ? (
                      <form onSubmit={(event) => saveUser(event, user)}>
                        <div className="user-edit-fields">
                          <label>
                            Name
                            <input value={userDraft.name} onChange={(event) => updateUserDraft(user.email, "name", event.target.value)} />
                          </label>
                          <label>
                            Password
                            <input value={userDraft.password} onChange={(event) => updateUserDraft(user.email, "password", event.target.value)} />
                          </label>
                        </div>
                        <div className="user-edit-actions">
                          <button className="secondary-action" type="submit">Save</button>
                          <button className="secondary-action" onClick={() => cancelEditingUser(user.email)} type="button">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="user-edit-actions">
                        <button className="secondary-action" onClick={() => startEditingUser(user)} type="button">Edit</button>
                        <button className="secondary-action" onClick={() => onToggleUserBlock(user.email)} type="button">
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                        <button className="danger-action" onClick={() => onDeleteUser(user.email)} type="button">Delete</button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "questions" && (
          <section className="admin-section">
            {statusMessage}
            <div className="admin-list question-list">
              {questions.map((question) => {
                const isEditing = editingQuestion === question.id;
                const questionDraft = getQuestionDraft(question);
                return (
                  <article className="admin-row user-edit-row question-row" key={question.id || question.question}>
                    {isEditing ? (
                      <form onSubmit={(event) => saveQuestion(event, question)}>
                        <div className="user-edit-fields">
                          <label>
                            Category
                            <select value={questionDraft.category} onChange={(event) => updateQuestionDraft(question.id, "category", event.target.value)}>
                              {quizCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                          </label>
                          <label>
                            Section
                            <select value={questionDraft.section} onChange={(event) => updateQuestionDraft(question.id, "section", event.target.value)}>
                              <option value="quiz">Quiz only</option>
                              <option value="contest">Contest only</option>
                              <option value="both">Quiz + Contest</option>
                            </select>
                          </label>
                        </div>
                        <label>
                          Question
                          <input value={questionDraft.question} onChange={(event) => updateQuestionDraft(question.id, "question", event.target.value)} />
                        </label>
                        <div className="option-editor">
                          {questionDraft.options.map((option, index) => (
                            <label key={index}>
                              Option {index + 1}
                              <input
                                value={option}
                                onChange={(event) => {
                                  const next = [...questionDraft.options];
                                  next[index] = event.target.value;
                                  updateQuestionDraft(question.id, "options", next);
                                }}
                              />
                            </label>
                          ))}
                        </div>
                        <label>
                          Correct answer
                          <select value={questionDraft.answer} onChange={(event) => updateQuestionDraft(question.id, "answer", event.target.value)}>
                            <option value="">Choose answer</option>
                            {questionDraft.options.map((item) => item.trim()).filter(Boolean).map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </label>
                        <div className="user-edit-actions">
                          <button className="secondary-action" type="submit">Save</button>
                          <button className="secondary-action" onClick={() => cancelEditingQuestion(question.id)} type="button">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div>
                          <strong>{question.question}</strong>
                          <span>{question.category} | {question.section || "both"} | Answer: {question.answer}</span>
                        </div>
                        <div className="user-edit-actions">
                          <button className="secondary-action" onClick={() => startEditingQuestion(question)} type="button">Edit</button>
                          <button className="danger-action" disabled={questions.length <= 1} onClick={() => onDeleteQuestion(question.id)} type="button">Delete</button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "add" && (
          <form className="admin-form" onSubmit={handleAddQuestion}>
            <label>
              Category
              <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                {quizCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label>
              Section
              <select value={draft.section} onChange={(event) => setDraft((current) => ({ ...current, section: event.target.value }))}>
                <option value="quiz">Quiz only</option>
                <option value="contest">Contest only</option>
                <option value="both">Quiz + Contest</option>
              </select>
            </label>
            <label>
              Question
              <input value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} />
            </label>
            <div className="option-editor">
              {draft.options.map((option, index) => (
                <label key={index}>
                  Option {index + 1}
                  <input
                    value={option}
                    onChange={(event) => {
                      const next = [...draft.options];
                      next[index] = event.target.value;
                      setDraft((current) => ({ ...current, options: next }));
                    }}
                  />
                </label>
              ))}
            </div>
            <label>
              Correct answer
              <select value={draft.answer} onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))}>
                <option value="">Choose answer</option>
                {draft.options.map((item) => item.trim()).filter(Boolean).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            {statusMessage}
            <button className="primary-action" type="submit">Add Question</button>
          </form>
        )}

        {activeView === "contest" && (
          <form className="admin-form" onSubmit={saveContestSettings}>
            <label>
              Contest name
              <input
                value={settingsDraft.contestName}
                onChange={(event) => setSettingsDraft((current) => ({ ...current, contestName: event.target.value }))}
              />
            </label>
            <label>
              Contest questions
              <input type="number" min="1" max="100" value={settingsDraft.contestQuestionCount} onChange={(event) => setSettingsDraft((current) => ({ ...current, contestQuestionCount: event.target.value }))} />
            </label>
            <label>
              Full contest duration (seconds)
              <input type="number" min="30" max="14400" value={settingsDraft.contestDurationSeconds} onChange={(event) => setSettingsDraft((current) => ({ ...current, contestDurationSeconds: event.target.value }))} />
            </label>
            <label>
              <input type="checkbox" checked={settingsDraft.isScheduled} onChange={(event) => setSettingsDraft((current) => ({ ...current, isScheduled: event.target.checked }))} />
              Enable schedule
            </label>
            <label>
              Start time
              <input type="datetime-local" value={settingsDraft.startAt} onChange={(event) => setSettingsDraft((current) => ({ ...current, startAt: event.target.value }))} />
            </label>
            <label>
              End time
              <input type="datetime-local" value={settingsDraft.endAt} onChange={(event) => setSettingsDraft((current) => ({ ...current, endAt: event.target.value }))} />
            </label>
            <label>
              <input
                type="checkbox"
                checked={settingsDraft.showLeaderboardToUsers}
                onChange={(event) => setSettingsDraft((current) => ({ ...current, showLeaderboardToUsers: event.target.checked }))}
              />
              Allow users to view contest ranking
            </label>
            {settingsDraft.selectedQuestionIds.length > 0 && (
              <button className="secondary-action" onClick={() => setShowContestPreview(true)} type="button">
                Contest Preview
              </button>
            )}
            <div className="user-edit-actions">
              <button
                className="secondary-action"
                onClick={() => {
                  setDraft((current) => ({ ...current, section: "contest" }));
                  setActiveView("add");
                }}
                type="button"
              >
                Add Question For Contest
              </button>
            </div>
            <div className="section-title">
              <h2>Select Contest Questions</h2>
              <span>{settingsDraft.selectedQuestionIds.length} selected</span>
            </div>
            <div className="admin-list contest-question-picker">
              {questions.map((question) => (
                <label className="admin-row contest-pick-row" key={question.id || question.question}>
                  <input
                    type="checkbox"
                    checked={settingsDraft.selectedQuestionIds.includes(question.id)}
                    disabled={!question.id}
                    onChange={(event) => toggleContestQuestionSelection(question.id, event.target.checked)}
                  />
                  <div>
                    <strong>{question.question}</strong>
                    <span>{question.category} | {question.section || "both"}</span>
                  </div>
                </label>
              ))}
            </div>
            {showContestPreview && (
              <section className="admin-section">
                <div className="section-title">
                  <h2>Contest Preview</h2>
                  <span>
                    {Math.min(Number(settingsDraft.contestQuestionCount) || 0, selectedQuestionsPreview.length || questions.length)} questions | {Number(settingsDraft.contestDurationSeconds) || 0}s
                  </span>
                </div>
                <div className="admin-list question-list">
                  {selectedQuestionsPreview.length ? (
                    selectedQuestionsPreview.map((question, index) => (
                      <article className="admin-row user-edit-row question-row" key={`${question.id}-${index}`}>
                        <div>
                          <strong>#{index + 1} {question.question}</strong>
                          <span>{question.category} | Answer: {question.answer}</span>
                        </div>
                        <div className="user-edit-actions">
                          <button className="secondary-action" disabled={index === 0} onClick={() => moveContestQuestion(index, -1)} type="button">Up</button>
                          <button className="secondary-action" disabled={index === selectedQuestionsPreview.length - 1} onClick={() => moveContestQuestion(index, 1)} type="button">Down</button>
                          <button className="danger-action" onClick={() => toggleContestQuestionSelection(question.id, false)} type="button">Remove</button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="empty-state">No selected questions yet. Select questions to lock order.</p>
                  )}
                </div>
              </section>
            )}
            {statusMessage}
            <button className="primary-action" type="submit">Save Contest Settings</button>
          </form>
        )}

        {activeView === "leaderboard" && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Contest LeaderBoard</h2>
              <span>{(settingsDraft.contestName || "Weekly Contest").trim()}</span>
            </div>
            <div className="section-title">
              <span>Rank: right answers first, then lower avg time</span>
            </div>
            <div className="user-edit-actions">
              <button
                className="secondary-action"
                disabled={settingsDraft.showLeaderboardToUsers || showLeaderboardVerify}
                onClick={() => {
                  setShowLeaderboardVerify(true);
                  setLeaderboardVerifyChecked(false);
                }}
                type="button"
              >
                Allow LeaderBoard For All Users
              </button>
            </div>
            {showLeaderboardVerify && (
              <div className="user-edit-actions">
                <label>
                  <input
                    checked={leaderboardVerifyChecked}
                    onChange={(event) => setLeaderboardVerifyChecked(event.target.checked)}
                    type="checkbox"
                  />
                  Verify: Allow LeaderBoard for all users
                </label>
                <button
                  className="secondary-action"
                  disabled={!leaderboardVerifyChecked}
                  onClick={() => {
                    setSettingsDraft((current) => ({ ...current, showLeaderboardToUsers: true }));
                    setShowLeaderboardVerify(false);
                    setLeaderboardVerifyChecked(false);
                  }}
                  type="button"
                >
                  Confirm Allow
                </button>
              </div>
            )}
            <div className="admin-list">
              {leaderboard.length ? leaderboard.map((row, index) => (
                <article className="admin-row" key={row.email}>
                  <div>
                    <strong>#{index + 1} {row.name}</strong>
                    <span>{row.email}</span>
                  </div>
                  <div>
                    <strong>{row.totalCorrect} correct</strong>
                    <span>{Number.isFinite(row.avgTimePerQuestion) ? `${row.avgTimePerQuestion.toFixed(2)}s / question` : "-"}</span>
                  </div>
                </article>
              )) : <p className="empty-state">No contest attempts yet.</p>}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default AdminPanel;
