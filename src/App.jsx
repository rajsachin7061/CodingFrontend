import { lazy, Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { adminAccessUser } from "./Components/AdminAccess";
import AdminLogin from "./Components/AdminLogin";
import AdminPanel from "./Components/AdminPanel";
import AuthPage from "./Components/AuthPage";
import LandingPage from "./Components/LandingPage/LandingPage";
import Quiz from "./Components/Quiz";
import Join from "./Components/LandingPage/join.jsx";
import {
  defaultQuizCategory,
  getQuizCategoryPath,
} from "./Components/QuizCategories";
import defaultQuestions from "./Components/Question.jsx";
import ResetPassword from "./Components/ResetPassword";
import UserDetail from "./Components/UserDetail";
import {
  getAllowedPage,
  getQuizCategoryFromPath,
  getRequestedPageFromPath,
  pageRoutes,
} from "./pageRoutes";
import "./App.css";

const CodeCompiler = lazy(() => import("./Components/CodeCompiler"));

const USERS_KEY = "onlineQuizUsers";
const SESSION_KEY = "onlineQuizCurrentUser";
const QUESTIONS_KEY = "onlineQuizQuestions";
const ADMIN_SESSION_KEY = "onlineQuizAdminSession";
const THEME_KEY = "onlineQuizTheme";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://codingbackend-rdyv.onrender.com")
).replace(/\/+$/, "");
const API_FALLBACK_BASE_URL = "https://codingbackend-rdyv.onrender.com";
const apiUrl = (path) => `${API_BASE_URL}${path}`;
const fallbackApiUrl = (path) => `${API_FALLBACK_BASE_URL}${path}`;

const apiFetch = async (path, options) => {
  const primaryUrl = apiUrl(path);
  const response = await fetch(primaryUrl, options);

  if (response.status !== 404) {
    return response;
  }

  let isSameOrigin = false;

  try {
    const resolvedPrimaryUrl = new URL(primaryUrl, window.location.origin);
    isSameOrigin = resolvedPrimaryUrl.origin === window.location.origin;
  } catch {
    isSameOrigin = primaryUrl.startsWith("/");
  }

  if (!isSameOrigin) {
    return response;
  }

  return fetch(fallbackApiUrl(path), options);
};

const makeUsername = (name = "", email = "") => {
  const base = name.trim() || email.split("@")[0] || "user";

  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "user"
  );
};

const makeLocalOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const findLocalUserByEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    getStoredUsers().find((user) => user.email === normalizedEmail) || null
  );
};

const getDefaultStats = () => ({
  totalSolved: 0,
  totalCorrect: 0,
  completedQuizzes: 0,
  bestScore: 0,
  categories: {},
  contest: {
    attempts: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    totalTimeSeconds: 0,
    bestScore: 0,
    bestAvgTimePerQuestion: 0,
  },
  contestByName: {},
});

const defaultContestSettings = {
  contestName: "Weekly Contest",
  contestQuestionCount: 10,
  contestDurationSeconds: 600,
  isScheduled: false,
  startAt: null,
  endAt: null,
  selectedQuestionIds: [],
  showLeaderboardToUsers: false,
};

const getDefaultResume = (user = {}) => ({
  template: "classic",
  headline: "Frontend learner",
  summary: "Building skills through focused programming quiz practice.",
  skills: "Java, C++, HTML, CSS, JavaScript",
  education: "",
  experience: "",
  projects: "Online Quiz practice dashboard",
  name: user.name || "",
  email: user.email || "",
});

const normalizeUser = (user) => ({
  ...user,
  username: user.username || makeUsername(user.name, user.email),
  stats: {
    ...getDefaultStats(),
    ...(user.stats || {}),
    categories: user.stats?.categories || {},
    contest: {
      ...getDefaultStats().contest,
      ...(user.stats?.contest || {}),
    },
    contestByName: user.stats?.contestByName || {},
  },
  resume: {
    ...getDefaultResume(user),
    ...(user.resume || {}),
  },
});

const getStoredUsers = () => {
  try {
    return (JSON.parse(localStorage.getItem(USERS_KEY)) || []).map(
      normalizeUser,
    );
  } catch {
    return [];
  }
};

const saveStoredUsers = (nextUsers) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers.map(normalizeUser)));
};

const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

const getStoredQuestions = () => {
  try {
    const storedQuestions = JSON.parse(localStorage.getItem(QUESTIONS_KEY));
    const questions = storedQuestions || defaultQuestions;

    return questions.map((question) => ({
      ...question,
      category: question.category || defaultQuizCategory,
      section: question.section || "both",
    }));
  } catch {
    return defaultQuestions.map((question) => ({
      ...question,
      category: question.category || defaultQuizCategory,
      section: question.section || "both",
    }));
  }
};

const getStoredAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY)));
  } catch {
    return false;
  }
};

const getStoredTheme = () => localStorage.getItem(THEME_KEY) || "dark";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(getStoredSession);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(getStoredAdminSession);
  const [users, setUsers] = useState(getStoredUsers);
  const [questions, setQuestions] = useState(getStoredQuestions);
  const [theme, setTheme] = useState(getStoredTheme);
  const [contestSettings, setContestSettings] = useState(
    defaultContestSettings,
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [adminMessage, setAdminMessage] = useState("");
  const [resetStep, setResetStep] = useState("email");
  const [resetRequest, setResetRequest] = useState(null);
  const mode = getAllowedPage(location.pathname, currentUser);
  const routeCategory =
    mode === "quiz" ? getQuizCategoryFromPath(location.pathname) : "";

  const goToPage = (page, options = {}) => {
    navigate(pageRoutes[page] || pageRoutes.login, {
      replace: Boolean(options.replace),
    });
  };

  const goToQuizCategory = (category, options = {}) => {
    navigate(getQuizCategoryPath(category), {
      replace: Boolean(options.replace),
    });
  };

  const fetchQuestionsFromApi = async () => {
    const response = await apiFetch("/api/questions");

    if (!response.ok) {
      throw new Error("Could not load questions from database.");
    }

    const apiQuestions = await response.json();
    return Array.isArray(apiQuestions)
      ? apiQuestions.map((question) => ({
          ...question,
          category: question.category || defaultQuizCategory,
          section: question.section || "both",
        }))
      : [];
  };

  const fetchUsersFromApi = async () => {
    const response = await apiFetch("/api/users");

    if (!response.ok) {
      throw new Error("Could not load users from database.");
    }

    const apiUsers = await response.json();
    return Array.isArray(apiUsers) ? apiUsers.map(normalizeUser) : [];
  };

  const syncUsersFromApi = async () => {
    const apiUsers = await fetchUsersFromApi();
    localStorage.setItem(USERS_KEY, JSON.stringify(apiUsers));
    setUsers(apiUsers);
    return apiUsers;
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  const updateAdminForm = (event) => {
    const { name, value } = event.target;

    setAdminForm((current) => ({ ...current, [name]: value }));
    setAdminMessage("");
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";

      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  };

  const getCurrentUserRecord = () =>
    currentUser ? users.find((user) => user.email === currentUser.email) : null;

  useEffect(() => {
    const requestedMode = getRequestedPageFromPath(location.pathname);

    if (requestedMode !== mode && location.pathname !== pageRoutes[mode]) {
      navigate(pageRoutes[mode], { replace: true });
    }
  }, [currentUser, location.pathname, mode, navigate]);

  useEffect(() => {
    let isCancelled = false;

    const loadRemoteData = async () => {
      try {
        const apiUsers = await fetchUsersFromApi();
        const apiQuestions = await fetchQuestionsFromApi();
        const apiContestSettings = await fetchContestSettingsFromApi();

        if (!isCancelled) {
          localStorage.setItem(USERS_KEY, JSON.stringify(apiUsers));
          setUsers(apiUsers);
        }

        if (!isCancelled) {
          setQuestions(apiQuestions);
        }

        if (!isCancelled) {
          setContestSettings(apiContestSettings);
        }
      } catch {
        // Keep local fallback when API is unavailable.
      }
    };

    loadRemoteData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const closeAdminPanel = () => {
    const fallbackPage = currentUser ? "quiz" : "login";

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    goToPage(fallbackPage, { replace: true });
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();

    const username = adminForm.username.trim();
    const password = adminForm.password;

    if (!username || !password) {
      setAdminMessage("Please enter admin username and password.");
      return;
    }

    const validAdmin = adminAccessUser.some(
      (admin) => admin.username === username && admin.password === password,
    );

    if (!validAdmin) {
      setAdminMessage("Admin username or password is incorrect.");
      return;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(true));
    setIsAdminLoggedIn(true);
    setAdminForm({ username: "", password: "" });
    setAdminMessage("");
    goToPage("admin");
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminLoggedIn(false);
    setAdminForm({ username: "", password: "" });
    setAdminMessage("");
    closeAdminPanel();
  };

  const identifyUser = (user) => {
    const sessionUser = { name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    goToPage("quiz");
  };

  const registerLocalUser = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUsers = getStoredUsers();

    if (existingUsers.some((user) => user.email === normalizedEmail)) {
      setMessage("This email is already registered.");
      return null;
    }

    const newUser = normalizeUser({
      id: `local-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      username: makeUsername(name, normalizedEmail),
      stats: getDefaultStats(),
      resume: getDefaultResume({ name, email: normalizedEmail }),
    });
    const nextUsers = [...existingUsers, newUser];

    saveStoredUsers(nextUsers);
    setUsers(nextUsers);
    return newUser;
  };

  const loginLocalUser = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const localUsers = getStoredUsers();
    const user = localUsers.find(
      (item) => item.email === normalizedEmail && item.password === password,
    );

    if (!user) {
      setMessage("Email or password is incorrect.");
      return null;
    }

    if (user.blocked) {
      setMessage("Your account is blocked. Please contact the admin.");
      return null;
    }

    setUsers(localUsers);
    return user;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password || (mode === "register" && !name)) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (mode === "register") {
      try {
        const response = await apiFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            username: makeUsername(name, email),
            stats: getDefaultStats(),
            resume: getDefaultResume({ name, email }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status >= 500) {
            const localUser = registerLocalUser({ name, email, password });

            if (localUser) {
              identifyUser(localUser);
            }
            return;
          }

          setMessage(errorData.message || "Could not create account.");
          return;
        }

        const apiUsers = await syncUsersFromApi();
        const newUser = apiUsers.find((user) => user.email === email);

        if (newUser) {
          identifyUser(newUser);
        }
      } catch {
        const localUser = registerLocalUser({ name, email, password });

        if (localUser) {
          identifyUser(localUser);
        }
      }
      return;
    }

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status >= 500) {
          const localUser = loginLocalUser({ email, password });

          if (localUser) {
            identifyUser(localUser);
          }
          return;
        }

        setMessage(errorData.message || "Email or password is incorrect.");
        return;
      }

      const data = await response.json();
      const loggedInUser = normalizeUser(data.user || {});

      if (!loggedInUser?.email) {
        setMessage("Could not log in right now. Please try again.");
        return;
      }

      await syncUsersFromApi();
      identifyUser(loggedInUser);
    } catch {
      const localUser = loginLocalUser({ email, password });

      if (localUser) {
        identifyUser(localUser);
      }
    }
  };

  const switchMode = () => {
    goToPage(mode === "login" ? "register" : "login");
    setForm({ name: "", email: "", otp: "", password: "" });
    setMessage("");
  };

  const openResetPassword = () => {
    goToPage("reset");
    setResetStep("email");
    setResetRequest(null);
    setForm({ name: "", email: form.email, otp: "", password: "" });
    setMessage("");
  };

  const handleSendResetOtp = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }

    const localUser = findLocalUserByEmail(email);

    try {
      const response = await apiFetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if ((response.status === 404 || response.status >= 500) && localUser) {
          try {
            await apiFetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: localUser.name || email.split("@")[0],
                email,
                password: localUser.password,
                username:
                  localUser.username || makeUsername(localUser.name, email),
                stats: localUser.stats || getDefaultStats(),
                resume: localUser.resume || getDefaultResume(localUser),
              }),
            });

            const retryResponse = await apiFetch(
              "/api/auth/request-password-reset",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              },
            );

            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse
                .json()
                .catch(() => ({}));
              setMessage(
                retryErrorData.message || "Could not send OTP right now.",
              );
              return;
            }

            setResetRequest({ email, mode: "api" });
            setResetStep("otp");
            setForm((current) => ({
              ...current,
              email,
              otp: "",
              password: "",
            }));
            setMessage(`OTP sent to ${email}. Please check your inbox.`);
            return;
          } catch {
            const fallbackOtp = makeLocalOtp();

            setResetRequest({ email, otp: fallbackOtp, mode: "local" });
            setResetStep("otp");
            setForm((current) => ({
              ...current,
              email,
              otp: "",
              password: "",
            }));
            setMessage("OTP sent to your email. Please check your inbox.");
            return;
          }
        }

        setMessage(errorData.message || "Could not send OTP right now.");
        return;
      }

      setResetRequest({ email, mode: "api" });
      setResetStep("otp");
      setForm((current) => ({ ...current, email, otp: "", password: "" }));
      setMessage(`OTP sent to ${email}. Please check your inbox.`);
    } catch {
      if (localUser) {
        const fallbackOtp = makeLocalOtp();

        setResetRequest({ email, otp: fallbackOtp, mode: "local" });
        setResetStep("otp");
        setForm((current) => ({ ...current, email, otp: "", password: "" }));
        setMessage("OTP sent to your email. Please check your inbox.");
        return;
      }

      setMessage("Could not connect to server. Please try again.");
    }
  };

  const fetchContestSettingsFromApi = async () => {
    const response = await apiFetch("/api/contest-settings");

    if (!response.ok) {
      throw new Error("Could not load contest settings.");
    }

    const settings = await response.json();
    return {
      ...defaultContestSettings,
      ...(settings || {}),
    };
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const otp = form.otp.trim();
    const password = form.password;

    if (!otp || !password) {
      setMessage("Please enter OTP and new password.");
      return;
    }

    if (!resetRequest || resetRequest.email !== email) {
      setMessage("Please request a new OTP for this email.");
      return;
    }

    if (resetRequest.mode === "local") {
      if (String(resetRequest.otp) !== otp) {
        setMessage("OTP is incorrect.");
        return;
      }

      const localUsers = getStoredUsers();
      const userToUpdate = localUsers.find((user) => user.email === email);

      if (!userToUpdate) {
        setMessage("No local account found for this email.");
        return;
      }

      const nextUsers = localUsers.map((user) =>
        user.email === email ? { ...user, password } : user,
      );

      saveStoredUsers(nextUsers);
      setUsers(nextUsers);
      setResetRequest(null);
      setResetStep("email");
      goToPage("login");
      setForm({ name: "", email, otp: "", password: "" });
      setMessage("Password updated. Please log in.");
      return;
    }

    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || "Could not update password right now.");
        return;
      }

      await syncUsersFromApi();
      setResetRequest(null);
      setResetStep("email");
      goToPage("login");
      setForm({ name: "", email, otp: "", password: "" });
      setMessage("Password updated. Please log in.");
    } catch {
      setMessage("Could not connect to server. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    goToPage("login");
    setResetStep("email");
    setResetRequest(null);
    setForm({ name: "", email: "", otp: "", password: "" });
    setMessage("");
  };

  const saveQuestions = (updatedQuestions) => {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const addQuestion = async (question) => {
    const response = await apiFetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not save question to database.",
      );
    }

    const updatedQuestions = await fetchQuestionsFromApi();
    saveQuestions(updatedQuestions);
  };

  const deleteQuestion = async (questionIdOrIndex) => {
    if (questions.length <= 1) {
      return;
    }

    if (questions.some((item) => item.id === questionIdOrIndex)) {
      const response = await apiFetch(`/api/questions/${questionIdOrIndex}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      const updatedQuestions = await fetchQuestionsFromApi();
      saveQuestions(updatedQuestions);
      return;
    }

    saveQuestions(questions.filter((_, index) => index !== questionIdOrIndex));
  };

  const updateQuestion = async (questionId, updates) => {
    const response = await apiFetch(`/api/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Could not update question.");
    }

    const updatedQuestions = await fetchQuestionsFromApi();
    saveQuestions(updatedQuestions);
  };

  const updateContestSettings = async (updates) => {
    const response = await apiFetch("/api/contest-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not update contest settings.",
      );
    }

    const payload = await response.json();
    setContestSettings({
      ...defaultContestSettings,
      ...(payload.settings || {}),
    });
  };

  const deleteUser = async (email) => {
    const user = users.find((item) => item.email === email);

    if (!user?.id) {
      return;
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    await syncUsersFromApi();

    if (currentUser?.email === email) {
      logout();
    }
  };

  const updateUser = async (email, changes) => {
    const user = users.find((item) => item.email === email);

    if (!user?.id) {
      return;
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      return;
    }

    const apiUsers = await syncUsersFromApi();
    const savedUser = apiUsers.find((item) => item.email === email);

    if (currentUser?.email === email && savedUser) {
      const updatedSession = { name: savedUser.name, email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setCurrentUser(updatedSession);
    }
  };

  const recordQuizComplete = async ({
    category,
    totalQuestions,
    score,
    totalTimeSeconds = 0,
    contestName = "",
  }) => {
    if (!currentUser) {
      return;
    }

    const user = users.find((item) => item.email === currentUser.email);

    if (!user?.id) {
      return;
    }

    const stats = {
      ...getDefaultStats(),
      ...(user.stats || {}),
      categories: user.stats?.categories || {},
    };
    const categoryStats = stats.categories?.[category] || {
      solved: 0,
      correct: 0,
      completed: 0,
      bestScore: 0,
    };
    const nextCategorySolved = categoryStats.solved + totalQuestions;
    const nextCategoryStats = {
      ...categoryStats,
      solved: nextCategorySolved,
      correct: categoryStats.correct + score,
      completed: categoryStats.completed + 1,
      bestScore: Math.max(categoryStats.bestScore, score),
    };

    const nextStats = {
      ...stats,
      totalSolved: stats.totalSolved + totalQuestions,
      totalCorrect: stats.totalCorrect + score,
      completedQuizzes: stats.completedQuizzes + 1,
      bestScore: Math.max(stats.bestScore, score),
      categories: {
        ...stats.categories,
        [category]: nextCategoryStats,
      },
      contestByName: stats.contestByName || {},
    };

    if (category === "Contest") {
      const contestStats = stats.contest || getDefaultStats().contest;
      const normalizedContestName = (
        contestName ||
        contestSettings?.contestName ||
        "Weekly Contest"
      ).trim();
      const contestByNameStats = stats.contestByName || {};
      const namedContestStats = contestByNameStats[normalizedContestName] || {
        attempts: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTimeSeconds: 0,
        bestScore: 0,
        bestAvgTimePerQuestion: 0,
      };
      const avgTimePerQuestion = totalQuestions
        ? totalTimeSeconds / totalQuestions
        : 0;
      const bestAvgTimePerQuestion = contestStats.bestAvgTimePerQuestion || 0;
      const namedBestAvgTimePerQuestion =
        namedContestStats.bestAvgTimePerQuestion || 0;

      nextStats.contest = {
        attempts: (contestStats.attempts || 0) + 1,
        totalCorrect: (contestStats.totalCorrect || 0) + score,
        totalQuestions: (contestStats.totalQuestions || 0) + totalQuestions,
        totalTimeSeconds:
          (contestStats.totalTimeSeconds || 0) + totalTimeSeconds,
        bestScore: Math.max(contestStats.bestScore || 0, score),
        bestAvgTimePerQuestion:
          bestAvgTimePerQuestion === 0
            ? avgTimePerQuestion
            : Math.min(bestAvgTimePerQuestion, avgTimePerQuestion),
      };

      nextStats.contestByName = {
        ...contestByNameStats,
        [normalizedContestName]: {
          attempts: (namedContestStats.attempts || 0) + 1,
          totalCorrect: (namedContestStats.totalCorrect || 0) + score,
          totalQuestions:
            (namedContestStats.totalQuestions || 0) + totalQuestions,
          totalTimeSeconds:
            (namedContestStats.totalTimeSeconds || 0) + totalTimeSeconds,
          bestScore: Math.max(namedContestStats.bestScore || 0, score),
          bestAvgTimePerQuestion:
            namedBestAvgTimePerQuestion === 0
              ? avgTimePerQuestion
              : Math.min(namedBestAvgTimePerQuestion, avgTimePerQuestion),
        },
      };
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats: nextStats }),
    });

    if (response.ok) {
      await syncUsersFromApi();
    }
  };

  const toggleUserBlock = async (email) => {
    const user = users.find((item) => item.email === email);
    const isBlocking = !user?.blocked;

    if (!user?.id) {
      return;
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: isBlocking }),
    });

    if (!response.ok) {
      return;
    }

    await syncUsersFromApi();

    if (
      currentUser?.email === email &&
      isBlocking &&
      ["profile", "editProfile", "certificate", "resume"].includes(mode)
    ) {
      goToPage("quiz");
    }
  };

  const renderPage = () => {
    if (mode === "admin") {
      if (!isAdminLoggedIn) {
        return (
          <AdminLogin
            form={adminForm}
            message={adminMessage}
            onBack={closeAdminPanel}
            onChange={updateAdminForm}
            onSubmit={handleAdminLogin}
          />
        );
      }

      return (
        <AdminPanel
          backLabel={currentUser ? "Quiz" : "Login"}
          contestSettings={contestSettings}
          onAddQuestion={addQuestion}
          onBackToQuiz={closeAdminPanel}
          onDeleteQuestion={deleteQuestion}
          onDeleteUser={deleteUser}
          onLogout={logoutAdmin}
          onToggleTheme={toggleTheme}
          onToggleUserBlock={toggleUserBlock}
          onUpdateContestSettings={updateContestSettings}
          onUpdateQuestion={updateQuestion}
          onUpdateUser={updateUser}
          questions={questions}
          theme={theme}
          users={users}
        />
      );
    }

    if (mode === "landing") {
      return (
        <LandingPage
          onLogin={() => goToPage("login")}
          onSignup={() => goToPage("register")}
        />
      );
    }

    if (currentUser) {
      const currentUserRecord = getCurrentUserRecord();
      const isCurrentUserBlocked = Boolean(currentUserRecord?.blocked);
      const activeUser = currentUserRecord || currentUser;
      if (mode === "compiler") {
        return (
          <CodeCompiler
            onLogout={logout}
            onToggleTheme={toggleTheme}
            theme={theme}
            user={activeUser}
          />
        );
      }

      const accountSections = [
        "profile",
        "editProfile",
        "certificate",
        "resume",
        "logout",
      ];

      if (accountSections.includes(mode)) {
        return isCurrentUserBlocked ? (
          <Quiz
            onLogout={logout}
            onPracticeComplete={recordQuizComplete}
            onToggleTheme={toggleTheme}
            questions={questions}
            routeCategory={routeCategory}
            theme={theme}
            user={activeUser}
            users={users}
            userBlocked={isCurrentUserBlocked}
            contestSettings={contestSettings}
            onChangePractice={() => goToPage("quiz")}
            onSelectCategory={goToQuizCategory}
          />
        ) : (
          <UserDetail
            contestSettings={contestSettings}
            onBackToQuiz={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }

              goToPage("quiz", { replace: true });
            }}
            onLogout={logout}
            onSaveProfile={updateUser}
            onToggleTheme={toggleTheme}
            section={mode}
            theme={theme}
            user={activeUser}
            users={users}
          />
        );
      }

      return (
        <Quiz
          onLogout={logout}
          onPracticeComplete={recordQuizComplete}
          onToggleTheme={toggleTheme}
          questions={questions}
          routeCategory={routeCategory}
          theme={theme}
          user={activeUser}
          users={users}
          userBlocked={isCurrentUserBlocked}
          contestSettings={contestSettings}
          onChangePractice={() => goToPage("quiz")}
          onSelectCategory={goToQuizCategory}
        />
      );
    }

    if (mode === "reset") {
      return (
        <ResetPassword
          form={form}
          message={message}
          onBack={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              goToPage("login", { replace: true });
            }
            setResetStep("email");
            setResetRequest(null);
            setForm({ name: "", email: "", otp: "", password: "" });
            setMessage("");
          }}
          onChange={updateForm}
          onSendOtp={handleSendResetOtp}
          onSubmit={handleResetPassword}
          resetStep={resetStep}
        />
      );
    }

    const isRegister = mode === "register";

    return (
      <AuthPage
        form={form}
        isRegister={isRegister}
        message={message}
        onChange={updateForm}
        onForgotPassword={openResetPassword}
        onSubmit={handleSubmit}
        onSwitchMode={switchMode}
      />
    );
  };

  const currentPage = (
    <Suspense
      fallback={
        <main className={`quiz-shell ${theme}-theme`}>
          <section className="result-panel">
            <h1>Loading...</h1>
          </section>
        </main>
      }
    >
      {renderPage()}
    </Suspense>
  );

  return (
    <Routes>
      <Route path="/" element={currentPage} />
      <Route path="/index.html" element={currentPage} />
      <Route path="/joinnow" element={<Join/>} />
      <Route path={pageRoutes.login} element={currentPage} />
      <Route path={pageRoutes.register} element={currentPage} />
      <Route path={pageRoutes.reset} element={currentPage} />
      <Route path={pageRoutes.quiz} element={currentPage} />
      <Route path={pageRoutes.compiler} element={currentPage} />
      <Route path="/quiz/:categorySlug" element={currentPage} />
      <Route path={pageRoutes.profile} element={currentPage} />
      <Route path={pageRoutes.editProfile} element={currentPage} />
      <Route path={pageRoutes.certificate} element={currentPage} />
      <Route path={pageRoutes.resume} element={currentPage} />
      <Route path={pageRoutes.logout} element={currentPage} />
      <Route path={pageRoutes.admin} element={currentPage} />
      <Route
        path="*"
        element={
          <Navigate
            to={currentUser ? pageRoutes.quiz : pageRoutes.landing}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
