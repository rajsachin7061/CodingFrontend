/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import quizCategories, { defaultQuizCategory } from "./QuizCategories";

const emptyQuestion = {
  category: defaultQuizCategory,
  question: "",
  options: ["", "", "", ""],
  answer: "",
};

function AdminPanel({
  backLabel = "Quiz",
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
  onUpdateUser,
}) {
  const [draft, setDraft] = useState(emptyQuestion);
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [activeView, setActiveView] = useState("users");
  const [editingUser, setEditingUser] = useState("");
  const [userDrafts, setUserDrafts] = useState({});

  const clearMessage = () => {
    setMessage({ text: "", type: "error" });
  };

  const showError = (text) => {
    setMessage({ text, type: "error" });
  };

  const showSuccess = (text) => {
    setMessage({ text, type: "success" });
  };

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

  const getUserDraft = (user) => {
    const userDraft = userDrafts[user.email];

    return {
      name: userDraft?.name ?? user.name,
      password: userDraft?.password ?? user.password,
    };
  };

  const startEditingUser = (user) => {
    setEditingUser(user.email);
    setUserDrafts((current) => ({
      ...current,
      [user.email]: {
        name: user.name,
        password: user.password,
      },
    }));
    clearMessage();
  };

  const cancelEditingUser = (email) => {
    setEditingUser("");
    setUserDrafts((current) => {
      const nextDrafts = { ...current };

      delete nextDrafts[email];
      return nextDrafts;
    });
    clearMessage();
  };

  const updateUserDraft = (email, field, value) => {
    setUserDrafts((current) => ({
      ...current,
      [email]: {
        ...current[email],
        [field]: value,
      },
    }));
    clearMessage();
  };

  const saveUser = (event, user) => {
    event.preventDefault();

    const userDraft = getUserDraft(user);
    const name = userDraft.name.trim();
    const password = userDraft.password;

    if (!name) {
      showError("User name cannot be empty.");
      return;
    }

    onUpdateUser(user.email, {
      name,
      password,
    });
    setUserDrafts((current) => ({
      ...current,
      [user.email]: {
        name,
        password,
      },
    }));
    setEditingUser("");
    showSuccess("User details updated successfully.");
  };

  const updateQuestion = (event) => {
    setDraft((current) => ({ ...current, question: event.target.value }));
    clearMessage();
  };

  const updateCategory = (event) => {
    setDraft((current) => ({ ...current, category: event.target.value }));
    clearMessage();
  };

  const updateOption = (optionIndex, value) => {
    setDraft((current) => {
      const options = current.options.map((option, index) =>
        index === optionIndex ? value : option,
      );

      return {
        ...current,
        answer: current.answer === current.options[optionIndex] ? value : current.answer,
        options,
      };
    });
    clearMessage();
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
      await onAddQuestion({ category, question, options, answer });
      setDraft(emptyQuestion);
      showSuccess(`${category} question added successfully.`);
    } catch (error) {
      showError(error?.message || "Could not add question. Please try again.");
    }
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
          <button
            className={activeView === "users" ? "tab-action active" : "tab-action"}
            onClick={() => setActiveView("users")}
            type="button"
          >
            User Detail
          </button>
          <button
            className={activeView === "questions" ? "tab-action active" : "tab-action"}
            onClick={() => setActiveView("questions")}
            type="button"
          >
            Question Bank
          </button>
          <button
            className={activeView === "add" ? "tab-action active" : "tab-action"}
            onClick={() => setActiveView("add")}
            type="button"
          >
            Add Question
          </button>
        </div>

        {activeView === "users" && (
          <section className="admin-section" aria-labelledby="users-title">
            <div className="section-title">
              <h2 id="users-title">Registered Users</h2>
              <span>{users.length} total</span>
            </div>

            {statusMessage}

            <div className="admin-list">
              {users.length ? (
                users.map((user) => {
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
                              <input
                                onChange={(event) =>
                                  updateUserDraft(user.email, "name", event.target.value)
                                }
                                type="text"
                                value={userDraft.name}
                              />
                            </label>

                            <label>
                              Password
                              <input
                                onChange={(event) =>
                                  updateUserDraft(user.email, "password", event.target.value)
                                }
                                type="text"
                                value={userDraft.password}
                              />
                            </label>
                          </div>

                          <div className="user-edit-actions">
                            <button className="secondary-action" type="submit">
                              Save
                            </button>
                            <button
                              className="secondary-action"
                              onClick={() => cancelEditingUser(user.email)}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="user-edit-actions">
                          <button
                            className="secondary-action"
                            onClick={() => startEditingUser(user)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="secondary-action"
                            onClick={() => onToggleUserBlock(user.email)}
                            type="button"
                          >
                            {user.blocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            className="danger-action"
                            onClick={() => onDeleteUser(user.email)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="empty-state">No users have registered yet.</p>
              )}
            </div>
          </section>
        )}

        {activeView === "questions" && (
          <section className="admin-section" aria-labelledby="questions-title">
            <div className="section-title">
              <h2 id="questions-title">Question Bank</h2>
              <span>{questions.length} active</span>
            </div>

            <div className="admin-list question-list">
              {quizCategories.map((category) => {
                const categoryQuestions = questions
                  .map((item, index) => ({ ...item, originalIndex: index }))
                  .filter((item) => item.category === category);

                return (
                  <div className="admin-category-group" key={category}>
                    <div className="category-heading">
                      <strong>{category}</strong>
                      <span>
                        {categoryQuestions.length} question
                        {categoryQuestions.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {categoryQuestions.length ? (
                      categoryQuestions.map((item) => (
                        <article
                          className="admin-row question-row"
                          key={`${item.question}-${item.originalIndex}`}
                        >
                          <div>
                            <strong>{item.question}</strong>
                            <span>Answer: {item.answer}</span>
                          </div>
                          <button
                            className="danger-action"
                            disabled={questions.length <= 1}
                            onClick={() => onDeleteQuestion(item.id ?? item.originalIndex)}
                            type="button"
                          >
                            Delete
                          </button>
                        </article>
                      ))
                    ) : (
                      <p className="empty-state">No {category} questions yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "add" && (
          <form className="admin-form" onSubmit={handleAddQuestion}>
            <div className="section-title">
              <h2>Add Question</h2>
              <span>{draft.category} practice</span>
            </div>

            <label>
              Practice section
              <select name="category" onChange={updateCategory} value={draft.category}>
                {quizCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Question
              <input
                name="question"
                onChange={updateQuestion}
                placeholder="Enter quiz question"
                type="text"
                value={draft.question}
              />
            </label>

            <div className="option-editor">
              {draft.options.map((option, index) => (
                <label key={index}>
                  Option {index + 1}
                  <input
                    onChange={(event) => updateOption(index, event.target.value)}
                    placeholder={`Option ${index + 1}`}
                    type="text"
                    value={option}
                  />
                </label>
              ))}
            </div>

            <label>
              Correct answer
              <select
                onChange={(event) =>
                  setDraft((current) => ({ ...current, answer: event.target.value }))
                }
                value={draft.answer}
              >
                <option value="">Choose answer</option>
                {draft.options
                  .map((option) => option.trim())
                  .filter(Boolean)
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </label>

            {statusMessage}

            <button className="primary-action" type="submit">
              Add Question
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default AdminPanel;
