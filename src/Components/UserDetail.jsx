/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import javaCertificateImage from "../Imaige/certificate100.png";
import { pageRoutes } from "../pageRoutes";
import UserMenu from "./UserMenu";


const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";
const JAVA_CERTIFICATE_REQUIREMENT = 100;

const resumeTemplates = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];

const PROFILE_LANGUAGES = [
  { label: "Python", key: "Python", icon: "Python", totalModules: 10 },
  { label: "C++", key: "C++", icon: "C++", totalModules: 10 },
  { label: "Java", key: "Java", icon: "Ja", totalModules: 10 },
  { label: "Html", key: "Html", icon: "Ht", totalModules: 10 },
  { label: "Css", key: "Css", icon: "Cs", totalModules: 10 },
  { label: "JavaScript", key: "JavaScript", icon: "JS", totalModules: 10 },
  { label: "Sql", key: "Sql", icon: "Sql", totalModules: 10 },
];

const BADGE_THRESHOLDS = [
  { label: "Bronze", threshold: 50, color: "#cd7f32" },
  { label: "Silver", threshold: 150, color: "#c0c0c0" },
  { label: "Gold", threshold: 300, color: "#f4c542" },
  { label: "Diamond", threshold: 1000, color: "#5ae4ff" },
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

const getLocalDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getActivityMap = (user) => {
  const activityDates = Array.isArray(user?.activityDates)
    ? user.activityDates
    : Array.isArray(user?.stats?.activityDates)
      ? user.stats.activityDates
      : [];
  const activityMap = new Map();

  activityDates.forEach((value) => {
    const dateKey = getLocalDateKey(value);

    if (!dateKey) {
      return;
    }

    activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
  });

  return activityMap;
};

const getStreakSummary = (activityDates = []) => {
  const dateSet = new Set(
    activityDates
      .map((value) => getLocalDateKey(value))
      .filter(Boolean),
  );

  if (!dateSet.size) {
    return { current: 0, longest: 0, todayActive: false };
  }

  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const sorted = Array.from(dateSet).sort();
  let current = 0;
  let cursor = new Date(today);

  while (dateSet.has(getLocalDateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 1;
  let running = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00`);
    const currentDate = new Date(`${sorted[index]}T00:00:00`);
    const differenceInDays = Math.round(
      (previous.getTime() - currentDate.getTime()) / 86400000,
    );

    if (differenceInDays === 1) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  return {
    current,
    longest,
    todayActive: Boolean(todayKey && dateSet.has(todayKey)),
  };
};

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
  const navigate = useNavigate();
  const [draft, setDraft] = useState({
    name: user.name,
    username: user.username || "",
    password: user.password || "",
    photo: user.photo || "",
    resume: user.resume || {},
  });
  const [message, setMessage] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [heatmapRangeMonths, setHeatmapRangeMonths] = useState(6);
  const saveInFlight = useRef(false);
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
  const activityMap = useMemo(() => getActivityMap(user), [user]);
  const streak = useMemo(
    () => getStreakSummary(Array.from(activityMap.keys())),
    [activityMap],
  );
  const totalActiveDays = useMemo(
    () => Array.from(activityMap.values()).filter((count) => count > 0).length,
    [activityMap],
  );
  const recentQuestions = useMemo(() => {
    const maybeRecent = Array.isArray(user?.recentSolved)
      ? user.recentSolved
      : Array.isArray(user?.recentQuestions)
        ? user.recentQuestions
        : Array.isArray(stats?.recentSolved)
          ? stats.recentSolved
          : [];

    return maybeRecent.slice(0, 5);
  }, [stats, user]);

  const solvedCount = Math.max(0, Number(stats.totalSolved || 0));
  const totalCorrect = Math.max(0, Number(stats.totalCorrect || 0));
  const completedQuizzes = Math.max(0, Number(stats.completedQuizzes || 0));
  const accuracy = solvedCount > 0 ? Math.min(100, Math.round((totalCorrect / solvedCount) * 100)) : 0;
  const availableCredits = Math.max(0, Math.floor(solvedCount / 3));
  const nextCreditProgress = solvedCount % 3;
  const nextBadgeIndex = BADGE_THRESHOLDS.findIndex(
    (badge) => solvedCount < badge.threshold,
  );
  const currentBadge =
    BADGE_THRESHOLDS.filter((badge) => solvedCount >= badge.threshold).at(-1) ||
    { label: "No badge yet", threshold: 0, color: "#94a3b8" };
  const nextBadge =
    nextBadgeIndex >= 0 ? BADGE_THRESHOLDS[nextBadgeIndex] : null;
  const badgeProgress = nextBadge
    ? Math.min(100, Math.round((solvedCount / nextBadge.threshold) * 100))
    : 100;
  const badgeProgressRemaining = nextBadge
    ? Math.max(0, nextBadge.threshold - solvedCount)
    : 0;
  const unlockedBadges = BADGE_THRESHOLDS.filter(
    (badge) => solvedCount >= badge.threshold,
  );
  const recentDifficultyCounts = useMemo(() => {
    const recent = Array.isArray(user?.recentSolved) ? user.recentSolved : [];

    return recent.reduce(
      (counts, item) => {
        const difficulty = String(item.difficulty || "").toLowerCase();

        if (difficulty === "easy") counts.easy += 1;
        if (difficulty === "medium") counts.medium += 1;
        if (difficulty === "hard") counts.hard += 1;

        return counts;
      },
      { easy: 0, medium: 0, hard: 0, total: recent.length },
    );
  }, [user?.recentSolved]);
  const languageCards = useMemo(
    () =>
      PROFILE_LANGUAGES.map((language) => {
        const categoryStats = stats.categories?.[language.key] || {};
        const completed = Math.max(
          0,
          Math.min(
            language.totalModules,
            Math.round(Number(categoryStats.completed || categoryStats.solved || 0)),
          ),
        );
        const percentage = language.totalModules
          ? Math.min(100, Math.round((completed / language.totalModules) * 100))
          : 0;

        return {
          ...language,
          completed,
          total: language.totalModules,
          percentage,
        };
      }),
    [stats.categories],
  );
  const heatmapWeeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const originalDay = start.getDate();
    start.setDate(1);
    start.setMonth(start.getMonth() - heatmapRangeMonths);
    start.setDate(
      Math.min(
        originalDay,
        new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate(),
      ),
    );

    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const gridEnd = new Date(today);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const weeks = [];
    const monthLabels = [];
    let previousMonth = "";

    for (
      let weekStart = new Date(gridStart);
      weekStart <= gridEnd;
      weekStart.setDate(weekStart.getDate() + 7)
    ) {
      const week = Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayIndex);
        const key = getLocalDateKey(date);
        const inRange = date >= start && date <= today;
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        if (inRange && monthKey !== previousMonth) {
          monthLabels.push({
            weekIndex: weeks.length,
            label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
          });
          previousMonth = monthKey;
        }

        return {
          key,
          count: inRange ? activityMap.get(key) || 0 : 0,
          inRange,
        };
      });
      weeks.push(week);
    }

    return {
      weeks,
      monthLabels,
      activeDays: weeks.flat().filter((cell) => cell.inRange && cell.count > 0).length,
    };
  }, [activityMap, heatmapRangeMonths]);
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

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saveInFlight.current) return;

    const name = draft.name.trim();
    const username = draft.username.trim();

    if (!name || !username) {
      setMessage("Name and username cannot be empty.");
      return;
    }

    saveInFlight.current = true;
    setSaveLoading(true);
    try {
      await onSaveProfile(user.email, {
        name,
        username,
        password: draft.password,
        photo: draft.photo,
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error?.message || "Could not save profile. Please try again.");
    } finally {
      saveInFlight.current = false;
      setSaveLoading(false);
    }
  };

  const updateDailyEmailPreference = async (event) => {
    if (saveInFlight.current) {
      return;
    }

    const optedIn = event.target.checked;
    saveInFlight.current = true;
    setSaveLoading(true);
    try {
      await onSaveProfile(user.email, {
        dailyChallengeEmailOptIn: optedIn,
      });
      setMessage(
        optedIn
          ? "Daily challenge emails enabled."
          : "Daily challenge emails disabled.",
      );
    } catch (error) {
      setMessage(error?.message || "Could not update email preferences.");
    } finally {
      saveInFlight.current = false;
      setSaveLoading(false);
    }
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

  const saveResume = async (event) => {
    event.preventDefault();
    if (saveInFlight.current) return;

    saveInFlight.current = true;
    setSaveLoading(true);
    try {
      await onSaveProfile(user.email, {
        resume: {
          ...draft.resume,
          name: draft.resume.name || user.name,
          email: draft.resume.email || user.email,
        },
      });
      setMessage("Resume saved successfully.");
    } catch (error) {
      setMessage(error?.message || "Could not save resume. Please try again.");
    } finally {
      saveInFlight.current = false;
      setSaveLoading(false);
    }
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
    <main className={`quiz-shell auth-shell ${section === "profile" ? "profile-shell" : ""} ${theme}-theme`}>
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

      <section className={`result-panel user-detail-panel ${section === "profile" ? "profile-result-panel" : ""}`}>
        {section === "profile" ? (
          <h1 className="profile-page-title">My Profile</h1>
        ) : (
          <>
            <p className="eyebrow">Account</p>
            <h1>{pageTitle}</h1>
          </>
        )}

        {section === "profile" && (
          <div className="profile-dashboard">
            <div className="profile-overview-grid">
              <section className="profile-overview-card profile-identity-card">
                <div className="profile-identity">
                  <div className="profile-avatar-wrap">{renderAvatar("profile-photo-large")}</div>
                  <div className="profile-header-text">
                    <p className="eyebrow">CodeSniper profile</p>
                    <h2>{user.name}</h2>
                    <p className="profile-username">@{user.username || user.name}</p>
                  </div>
                </div>
                <div className="profile-header-actions">
                  <button
                    className="primary-action"
                    onClick={() => navigate(pageRoutes.editProfile)}
                    type="button"
                  >
                    Edit Profile
                  </button>
                  <button className="secondary-action" onClick={onBackToQuiz} type="button">
                    Back to dashboard
                  </button>
                </div>
                <div className="profile-identity-meta">
                  <span>{user.email}</span>
                  <span>{streak.current} day{streak.current === 1 ? "" : "s"} current streak</span>
                </div>
              </section>

              <section className="profile-overview-card profile-solved-card">
                <div
                  className="profile-solved-ring"
                  style={{
                    "--profile-solved-progress": `${badgeProgress}%`,
                    "--profile-solved-midpoint": `${badgeProgress / 2}%`,
                  }}
                  role="img"
                  aria-label={`${solvedCount} coding problems solved; ${badgeProgress}% progress toward the next badge`}
                >
                  <div className="profile-solved-ring-center">
                    <strong>{solvedCount}</strong>
                    <span>Solved</span>
                  </div>
                </div>
                <div className="profile-difficulty-summary">
                  <p>Recent accepted</p>
                  {[
                    { label: "Easy", value: recentDifficultyCounts.easy, className: "easy" },
                    { label: "Medium", value: recentDifficultyCounts.medium, className: "medium" },
                    { label: "Hard", value: recentDifficultyCounts.hard, className: "hard" },
                  ].map((item) => (
                    <div className="profile-difficulty-row" key={item.label}>
                      <span className={item.className}>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                  <small>From your {recentDifficultyCounts.total} latest accepted submissions</small>
                </div>
              </section>

              <section className="profile-overview-card profile-badges-card">
                <div className="profile-badge-count">
                  <span>Badges</span>
                  <strong>{unlockedBadges.length}</strong>
                </div>
                <div className="profile-next-badge">
                  <span className="profile-next-badge-icon" aria-hidden="true">
                    {nextBadge ? nextBadge.label[0] : currentBadge.label[0]}
                  </span>
                  <div>
                    <small>{nextBadge ? "Locked badge" : "Highest badge"}</small>
                    <strong>{nextBadge ? nextBadge.label : currentBadge.label}</strong>
                    <small>
                      {nextBadge
                        ? `${badgeProgressRemaining} more accepted ${badgeProgressRemaining === 1 ? "solution" : "solutions"} to unlock`
                        : "All badges unlocked"}
                    </small>
                  </div>
                </div>
              </section>
            </div>

            {/* <div className="stat-grid">
              {[
                { label: "Total Problems Solved", value: solvedCount },
                { label: "Correct Answers", value: totalCorrect },
                { label: "Accuracy", value: `${accuracy}%` },
                { label: "Completed Quizzes", value: completedQuizzes },
                { label: "Current Streak", value: `${streak.current}d` },
                { label: "Longest Streak", value: `${streak.longest}d` },
                { label: "Total Active Days", value: totalActiveDays },
                { label: "Available Solution Credits", value: availableCredits },
              ].map((item) => (
                <div className="stat-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div> */}

            <div className="profile-two-column">
              <section className="profile-panel streak-panel">
                <div className="panel-header">
                  <h3>Coding Streak</h3>
                  <span>{streak.todayActive ? "Active today" : "No activity today"}</span>
                </div>
                <div className="streak-highlight-row">
                  <div>
                    <small>Current streak</small>
                    <strong>{streak.current} Days</strong>
                  </div>
                  <div>
                    <small>Longest streak</small>
                    <strong>{streak.longest} Days</strong>
                  </div>
                </div>
                <div className="week-activity" aria-label="Weekly activity">
                  {[
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                  ].map((day) => (
                    <span key={day} className="week-dot active">
                      {day}
                    </span>
                  ))}
                </div>
                <p className="motivational-note">
                  {streak.current > 0
                    ? "Keep the momentum going — you are building a strong coding routine."
                    : "Start today by solving one problem to build your streak."}
                </p>
              </section>

              <section className="profile-panel badge-panel">
                <div className="panel-header">
                  <h3>Badges & Achievements</h3>
                  <span>{currentBadge.label}</span>
                </div>
                <div className="badge-list">
                  {BADGE_THRESHOLDS.map((badge) => {
                    const unlocked = solvedCount >= badge.threshold;

                    return (
                      <div
                        key={badge.label}
                        className={`badge-tier ${unlocked ? "unlocked" : "locked"}`}
                        style={{ borderColor: badge.color }}
                      >
                        <span className="badge-icon" style={{ background: badge.color }}>
                          {badge.label[0]}
                        </span>
                        <div>
                          <strong>{badge.label}</strong>
                          <small>{badge.threshold} problems</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="badge-progress-block">
                  <div className="progress-label-row">
                    <span>Next badge</span>
                    <strong>{nextBadge ? nextBadge.label : "Completed"}</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${badgeProgress}%` }} />
                  </div>
                  <small>
                    {nextBadge
                      ? `${solvedCount} / ${nextBadge.threshold} problems toward ${nextBadge.label}`
                      : "You have unlocked every badge."}
                  </small>
                  {nextBadge && (
                    <small>
                      {badgeProgressRemaining} more problems to unlock {nextBadge.label}
                    </small>
                  )}
                </div>
              </section>
            </div>

            <div className="profile-two-column profile-language-layout">
              <section className="profile-panel language-panel">
                <div className="panel-header">
                  <h3>Programming Language Progress</h3>
                  <span>Modules</span>
                </div>
                <div className="language-card-list">
                  {languageCards.map((language) => (
                    <div className="language-card" key={language.key}>
                      <div className="language-icon-box" aria-hidden="true">
                        {language.icon}
                      </div>
                      <div className="language-card-content">
                        <div className="language-card-head">
                          <strong>Practice {language.label}</strong>
                          <span>{language.percentage}% Completed</span>
                        </div>
                        <div
                          className="progress-track language-progress-track"
                          role="progressbar"
                          aria-label={`${language.label} modules completed`}
                          aria-valuemin={0}
                          aria-valuemax={language.total}
                          aria-valuenow={language.completed}
                        >
                          <span style={{ width: `${language.percentage}%` }} />
                        </div>
                        <small>
                          {language.completed} of {language.total} modules completed
                        </small>
                      </div>
                      <button
                        className="secondary-action"
                        onClick={() => navigate(pageRoutes.Practice || "/practice")}
                        type="button"
                      >
                        Continue
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* <section className="profile-panel credit-panel">
                <div className="panel-header">
                  <h3>Solution Credits</h3>
                  <span>Credit rule</span>
                </div>
                <div className="credit-summary-row">
                  <div>
                    <small>Available Credits</small>
                    <strong>{availableCredits}</strong>
                  </div>
                  <div>
                    <small>Total Credits Earned</small>
                    <strong>{availableCredits}</strong>
                  </div>
                  <div>
                    <small>Total Credits Used</small>
                    <strong>0</strong>
                  </div>
                </div>
                <div className="credit-progress-block">
                  <div className="progress-label-row">
                    <span>Problems to next credit</span>
                    <strong>{nextCreditProgress} / 3</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${Math.min(100, (nextCreditProgress / 3) * 100)}%` }} />
                  </div>
                  <small>
                    {nextCreditProgress === 0
                      ? "You have earned your next credit."
                      : `Solve ${3 - nextCreditProgress} more eligible problem${3 - nextCreditProgress === 1 ? "" : "s"} to earn your next credit.`}
                  </small>
                </div>
              </section> */}
            </div>

            <section className="profile-panel heatmap-panel">
              <div className="panel-header">
                <h3>Submissions Heat Map</h3>
                <select
                  className="heatmap-range"
                  aria-label="Heatmap time range"
                  value={heatmapRangeMonths}
                  onChange={(event) => setHeatmapRangeMonths(Number(event.target.value))}
                >
                  <option value={3}>Last 3 Months</option>
                  <option value={6}>Last 6 Months</option>
                  <option value={12}>Last 12 Months</option>
                </select>
              </div>
              <div
                className="heatmap-calendar"
                role="img"
                aria-label={`Activity heatmap for the last ${heatmapRangeMonths} months. ${heatmapWeeks.activeDays} active days.`}
              >
                <div className="heatmap-weekday-labels" aria-hidden="true">
                  {["Sun", "", "Tue", "", "Thu", "", "Sat"].map((day, index) => (
                    <span key={index}>{day}</span>
                  ))}
                </div>
                <div className="heatmap-calendar-content">
                  <div
                    className="heatmap-grid"
                    style={{ "--heatmap-week-count": heatmapWeeks.weeks.length }}
                  >
                    {heatmapWeeks.weeks.map((week, weekIndex) => (
                      <div className="heatmap-week" key={weekIndex}>
                        {week.map((cell) => {
                          const colorClass =
                            !cell.inRange || cell.count === 0
                              ? "heatmap-empty"
                              : cell.count <= 2
                                ? "heatmap-low"
                                : cell.count <= 4
                                  ? "heatmap-medium"
                                  : cell.count <= 6
                                    ? "heatmap-high"
                                    : "heatmap-very-high";

                          return (
                            <span
                              key={cell.key}
                              className={`heatmap-cell ${colorClass}`}
                              title={
                                cell.inRange
                                  ? `${cell.key}: ${cell.count} qualifying activity`
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div
                    className="heatmap-month-labels"
                    style={{ "--heatmap-week-count": heatmapWeeks.weeks.length }}
                    aria-hidden="true"
                  >
                    {heatmapWeeks.monthLabels.map((month) => (
                      <span
                        key={`${month.weekIndex}-${month.label}`}
                        style={{ gridColumnStart: month.weekIndex + 1 }}
                      >
                        {month.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="profile-two-column">
              <section className="profile-panel recent-panel">
                <div className="panel-header">
                  <h3>Recently Solved Questions</h3>
                  <span>{recentQuestions.length} records</span>
                </div>
                {recentQuestions.length ? (
                  <div className="recent-question-list">
                    {recentQuestions.map((question, index) => (
                      <div className="recent-question-row" key={`${question.title || "question"}-${index}`}>
                        <div>
                          <strong>{question.title || `Question ${index + 1}`}</strong>
                          <small>{question.topic || "General"}</small>
                        </div>
                        <span>{question.difficulty || "N/A"}</span>
                        <small>{question.date || question.solvedAt || "Recently"}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No recent accepted solutions yet.</div>
                )}
              </section>

              <section className="profile-panel leaderboard-panel">
                <div className="panel-header">
                  <h3>{contestName} Leaderboard</h3>
                  <span>Current result</span>
                </div>
                {showPublishedLeaderboard && contestLeaderboard.length ? (
                  <div className="leaderboard-list">
                    {contestLeaderboard.map((row, index) => (
                      <div key={`${row.name}-${index}`} className="leaderboard-row">
                        <span>#{index + 1}</span>
                        <strong>{row.name}</strong>
                        <small>{row.totalCorrect} correct</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No contest data available yet.</div>
                )}
              </section>
            </div>

            <div className="stat-grid">
              {[
                { label: "Total Problems Solved", value: solvedCount },
                { label: "Correct Answers", value: totalCorrect },
                { label: "Accuracy", value: `${accuracy}%` },
                { label: "Completed Quizzes", value: completedQuizzes },
                { label: "Current Streak", value: `${streak.current}d` },
                { label: "Longest Streak", value: `${streak.longest}d` },
                { label: "Total Active Days", value: totalActiveDays },
                { label: "Available Solution Credits", value: availableCredits },
              ].map((item) => (
                <div className="stat-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>


            <label className="daily-email-preference">
              <input
                checked={user.dailyChallengeEmailOptIn === true}
                disabled={saveLoading}
                onChange={updateDailyEmailPreference}
                type="checkbox"
              />
              <span>Send me the daily coding challenge email.</span>
            </label>
            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
            <div className="result-actions">
              <button className="secondary-action" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </div>
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

            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}

            <button
              className="primary-action"
              disabled={saveLoading}
              type="submit"
            >
              {saveLoading ? "Saving profile..." : "Save Profile"}
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

              {message && (
                <p className="form-message" role="status">
                  {message}
                </p>
              )}

              <button
                className="primary-action"
                disabled={saveLoading}
                type="submit"
              >
                {saveLoading ? "Saving resume..." : "Save Resume"}
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
