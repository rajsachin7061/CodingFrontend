/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import quizCategories from "./QuizCategories";
import UserMenu from "./UserMenu";

const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";

const resumeTemplates = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];

const getCertificates = (user) => {
  const stats = user.stats || {};
  const certificates = [];

  if ((stats.totalSolved || 0) >= 1) {
    certificates.push({
      title: "Practice Starter",
      text: "Completed the first quiz practice set.",
    });
  }

  if ((stats.totalSolved || 0) >= 10) {
    certificates.push({
      title: "Question Solver",
      text: "Solved 10 or more quiz questions.",
    });
  }

  quizCategories.forEach((category) => {
    if ((stats.categories?.[category]?.completed || 0) > 0) {
      certificates.push({
        title: `${category} Practice`,
        text: `Completed a ${category} practice quiz.`,
      });
    }
  });

  return certificates;
};

function UserDetail({
  section = "profile",
  user,
  theme,
  onBackToQuiz,
  onLogout,
  onSaveProfile,
  onToggleTheme,
}) {
  const [draft, setDraft] = useState({
    name: user.name,
    username: user.username || "",
    password: user.password || "",
    photo: user.photo || "",
    resume: user.resume || {},
  });
  const [message, setMessage] = useState("");
  const stats = user.stats || {};
  const certificates = getCertificates(user);

  useEffect(() => {
    setDraft({
      name: user.name,
      username: user.username || "",
      password: user.password || "",
      photo: user.photo || "",
      resume: user.resume || {},
    });
    setMessage("");
  }, [user]);

  useEffect(() => {
    if (section !== "logout") {
      return undefined;
    }

    const timerId = window.setTimeout(onLogout, 700);

    return () => window.clearTimeout(timerId);
  }, [onLogout, section]);

  const updatePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((current) => ({ ...current, photo: reader.result }));
      setMessage("Photo selected. Save profile to keep it.");
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    const username = draft.username.trim();

    if (!name || !username) {
      setMessage("Name and username cannot be empty.");
      return;
    }

    onSaveProfile(user.email, {
      name,
      username,
      password: draft.password,
      photo: draft.photo,
    });
    setMessage("Profile updated successfully.");
  };

  const updateResume = (field, value) => {
    setDraft((current) => ({
      ...current,
      resume: {
        ...current.resume,
        [field]: value,
      },
    }));
  };

  const saveResume = (event) => {
    event.preventDefault();

    onSaveProfile(user.email, {
      resume: {
        ...draft.resume,
        name: draft.resume.name || user.name,
        email: draft.resume.email || user.email,
      },
    });
    setMessage("Resume saved successfully.");
  };

  const renderAvatar = (className = "profile-photo-large") =>
    draft.photo || user.photo ? (
      <img alt={`${user.name} profile`} className={className} src={draft.photo || user.photo} />
    ) : (
      <span className={className}>{getInitial(user.name)}</span>
    );

  const pageTitle = {
    profile: "My Profile",
    editProfile: "Edit Profile",
    certificate: "My Certificate",
    resume: "My Resume",
    logout: "Logout",
  }[section];

  return (
    <main className={`quiz-shell auth-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Signed in user">
        <span>Hi, {user.name}</span>
        <div className="user-actions">
          <button className="secondary-action" onClick={onToggleTheme} type="button">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {section !== "logout" && (
            <UserMenu user={user} onLogout={onLogout} />
          )}
        </div>
      </header>

      <section className="result-panel user-detail-panel">
        <p className="eyebrow">Account</p>
        <h1>{pageTitle}</h1>

        {section === "profile" && (
          <>
            {renderAvatar()}
            <div className="detail-list profile-detail-grid" aria-label="User details">
              <div>
                <span>Username</span>
                <strong>@{user.username}</strong>
              </div>
              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>Questions Solved</span>
                <strong>{stats.totalSolved || 0}</strong>
              </div>
              <div>
                <span>Correct Answers</span>
                <strong>{stats.totalCorrect || 0}</strong>
              </div>
              <div>
                <span>Completed Quizzes</span>
                <strong>{stats.completedQuizzes || 0}</strong>
              </div>
            </div>
            <div className="result-actions">
              <button className="secondary-action" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </>
        )}

        {section === "editProfile" && (
          <form className="profile-edit-form" onSubmit={saveProfile}>
            <label className="photo-upload">
              {renderAvatar("profile-photo-upload")}
              <span>Change photo</span>
              <input accept="image/*" onChange={updatePhoto} type="file" />
            </label>

            <label>
              Username
              <input
                onChange={(event) =>
                  setDraft((current) => ({ ...current, username: event.target.value }))
                }
                type="text"
                value={draft.username}
              />
            </label>

            <label>
              Full name
              <input
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                type="text"
                value={draft.name}
              />
            </label>

            <label>
              Password
              <input
                onChange={(event) =>
                  setDraft((current) => ({ ...current, password: event.target.value }))
                }
                type="text"
                value={draft.password}
              />
            </label>

            {message && <p className="form-message">{message}</p>}

            <button className="primary-action" type="submit">
              Save Profile
            </button>
          </form>
        )}

        {section === "certificate" && (
          <div className="certificate-grid">
            {certificates.length ? (
              certificates.map((certificate) => (
                <div className="account-card certificate-card" key={certificate.title}>
                  <span>Certificate</span>
                  <strong>{certificate.title}</strong>
                  <p>{certificate.text}</p>
                  <small>Awarded to {user.name}</small>
                </div>
              ))
            ) : (
              <div className="account-card">
                <span>No certificate yet</span>
                <strong>Start practicing</strong>
                <p>Complete a quiz to unlock your first certificate.</p>
              </div>
            )}
          </div>
        )}

        {section === "resume" && (
          <div className="resume-builder">
            <form className="profile-edit-form" onSubmit={saveResume}>
              <label>
                Template
                <select
                  onChange={(event) => updateResume("template", event.target.value)}
                  value={draft.resume.template || "classic"}
                >
                  {resumeTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>

              {[
                ["name", "Name"],
                ["email", "Email"],
                ["headline", "Headline"],
                ["summary", "Summary"],
                ["skills", "Skills"],
                ["education", "Education"],
                ["experience", "Experience"],
                ["projects", "Projects"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}
                  <textarea
                    onChange={(event) => updateResume(field, event.target.value)}
                    rows={field === "summary" ? 4 : 2}
                    value={draft.resume[field] || ""}
                  />
                </label>
              ))}

              {message && <p className="form-message">{message}</p>}

              <button className="primary-action" type="submit">
                Save Resume
              </button>
            </form>

            <article className={`resume-preview ${draft.resume.template || "classic"}`}>
              <span>{draft.resume.headline || "Frontend learner"}</span>
              <h2>{draft.resume.name || user.name}</h2>
              <p>{draft.resume.email || user.email}</p>
              <strong>Summary</strong>
              <p>{draft.resume.summary || "Add a summary for your resume."}</p>
              <strong>Skills</strong>
              <p>{draft.resume.skills || "Add your skills."}</p>
              <strong>Projects</strong>
              <p>{draft.resume.projects || "Add your projects."}</p>
            </article>
          </div>
        )}

        {section === "logout" && (
          <div className="account-card">
            <span>Signing out</span>
            <strong>Please wait...</strong>
            <p>You are being logged out of your quiz account.</p>
          </div>
        )}

        {section !== "logout" && (
          <button className="primary-action" onClick={onBackToQuiz} type="button">
            Back to Quiz
          </button>
        )}
      </section>
    </main>
  );
}

export default UserDetail;
