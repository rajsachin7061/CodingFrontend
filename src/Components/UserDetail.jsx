/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import javaCertificateImage from "../Imaige/certificate100.png";
import UserMenu from "./UserMenu";

const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";
const JAVA_CERTIFICATE_REQUIREMENT = 100;

const resumeTemplates = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];

const getJavaSolvedCount = (user) => user.stats?.categories?.Java?.solved || 0;
const formatCertificateDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, "-");

function UserDetail({
  section = "profile",
  user,
  users = [],
  contestSettings = {},
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
  const contestName = (contestSettings?.contestName || "Weekly Contest").trim();
  const showPublishedLeaderboard = Boolean(contestSettings?.showLeaderboardToUsers);
  const javaSolvedCount = getJavaSolvedCount(user);
  const javaCertificateDate = formatCertificateDate();
  const isJavaCertificateUnlocked = javaSolvedCount >= JAVA_CERTIFICATE_REQUIREMENT;
  const javaCertificateProgress = Math.min(
    100,
    Math.round((javaSolvedCount / JAVA_CERTIFICATE_REQUIREMENT) * 100),
  );
  const contestLeaderboard = useMemo(
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

  const downloadJavaCertificate = () => {
    if (!isJavaCertificateUnlocked) {
      return;
    }

    const certificateImage = new Image();
    certificateImage.crossOrigin = "anonymous";

    certificateImage.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const certificateName = user.name || "Student";

      canvas.width = certificateImage.naturalWidth;
      canvas.height = certificateImage.naturalHeight;
      context.drawImage(certificateImage, 0, 0);

      context.fillStyle = "#f9f3e6";
      context.fillRect(canvas.width * 0.29, canvas.height * 0.32, canvas.width * 0.42, canvas.height * 0.08);
      context.fillRect(canvas.width * 0.11, canvas.height * 0.8, canvas.width * 0.24, canvas.height * 0.07);

      context.fillStyle = "#111111";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `700 ${Math.max(42, canvas.width * 0.038)}px Georgia, serif`;
      context.fillText(certificateName, canvas.width * 0.5, canvas.height * 0.36, canvas.width * 0.4);

      context.font = `700 ${Math.max(30, canvas.width * 0.028)}px Georgia, serif`;
      context.fillText(javaCertificateDate, canvas.width * 0.22, canvas.height * 0.827, canvas.width * 0.22);

      const link = document.createElement("a");
      link.download = `java-100-problems-certificate-${certificateName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "student"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    certificateImage.src = javaCertificateImage;
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
            {showPublishedLeaderboard && (
              <div className="detail-list" aria-label="Published contest leaderboard">
                <h2>{contestName} LeaderBoard</h2>
                {contestLeaderboard.length ? (
                  contestLeaderboard.map((row, index) => (
                    <div key={`${row.name}-${index}`}>
                      <strong>#{index + 1} {row.name}</strong>
                      <span>{row.totalCorrect} correct | {row.avgTimePerQuestion.toFixed(2)}s avg</span>
                    </div>
                  ))
                ) : (
                  <p>No leaderboard data available yet.</p>
                )}
              </div>
            )}
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
          <div className="certificate-grid java-certificate-grid">
            <article
              className={`account-card certificate-card java-certificate-card ${
                isJavaCertificateUnlocked ? "unlocked" : "locked"
              }`}
            >
              <div className="certificate-preview">
                <img alt="Java 100 problems certificate" src={javaCertificateImage} />
                <span className="certificate-overlay-name">{user.name}</span>
                <span className="certificate-overlay-date">{javaCertificateDate}</span>
                {!isJavaCertificateUnlocked && (
                  <div className="certificate-lock">
                    <span>Locked</span>
                    <strong>{JAVA_CERTIFICATE_REQUIREMENT - javaSolvedCount} problems left</strong>
                  </div>
                )}
              </div>

              <div className="certificate-content">
                <span>{isJavaCertificateUnlocked ? "Certificate Unlocked" : "Certificate Locked"}</span>
                <strong>Java 100 Problems Certificate</strong>
                <p>
                  {isJavaCertificateUnlocked
                    ? `Awarded to ${user.name} for completing 100 Java practice problems.`
                    : `Solve ${JAVA_CERTIFICATE_REQUIREMENT} Java practice problems to unlock and download this certificate.`}
                </p>
                <div className="certificate-progress" aria-label="Java certificate progress">
                  <div>
                    <span>Java solved</span>
                    <strong>
                      {Math.min(javaSolvedCount, JAVA_CERTIFICATE_REQUIREMENT)}/{JAVA_CERTIFICATE_REQUIREMENT}
                    </strong>
                  </div>
                  <div className="certificate-progress-track">
                    <span style={{ width: `${javaCertificateProgress}%` }} />
                  </div>
                </div>
                {isJavaCertificateUnlocked ? (
                  <button
                    className="primary-action certificate-download"
                    onClick={downloadJavaCertificate}
                    type="button"
                  >
                    Download Certificate
                  </button>
                ) : (
                  <button className="primary-action certificate-download" disabled type="button">
                    Download Locked
                  </button>
                )}
              </div>
            </article>
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
