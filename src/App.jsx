import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Courses from "./Components/Courses/Course.jsx";
import AboutUs from "./Components/LandingPage/Aboutus.jsx";
import PrivacyPolicy from "./Components/LandingPage/privacyPolicy.jsx";
import ContactUs from "./Components/LandingPage/Contctus.jsx";
import Participates from "./Components/LandingPage/Participate.jsx";
import Compiler from "./Components/LandingPage/Compiler.jsx";
import Problems from "./Components/Problems.jsx";
// import Practice from "./Components/Practice/Practices.jsx";
import Practice from "./Components/Practicesheet.jsx";
import Game from "./Components/Game.jsx";
import StartQuiz1 from "./Components/Quiz/StartQuiz.jsx";

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
import Thanks from "./Components/LandingPage/Thanku.jsx";
import Questiondetail from "./Components/Questiondetail.jsx";
import PracticeLearningPath from "./Components/PracticeLearningPath.jsx";
import Problemsheet from "./Components/Problemsheet.jsx";
import LoadingState from "./Components/LoadingState.jsx";
import { apiFetch } from "./api";

const CodeCompiler = lazy(() => import("./Components/CodeCompiler"));

const USERS_KEY = "onlineQuizUsers";
const SESSION_KEY = "onlineQuizCurrentUser";
const QUESTIONS_KEY = "onlineQuizQuestions";
const ADMIN_SESSION_KEY = "onlineQuizAdminSession";
const THEME_KEY = "onlineQuizTheme";

const makeUsername = (name = "", email = "") => {
  const base = name.trim() || email.split("@")[0] || "user";

  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "user"
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

const defaultQuizSettings = {
  quizName: "Practice Quiz",
  quizQuestionCount: 10,
  quizDurationSeconds: 600,
  selectedQuizQuestionIds: [],
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
  dailyChallengeEmailOptIn: user.dailyChallengeEmailOptIn === true,
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
  const [remoteDataStatus, setRemoteDataStatus] = useState({
    status: "loading",
    message: "",
  });
  const [remoteDataAttempt, setRemoteDataAttempt] = useState(0);
  const [contestSettings, setContestSettings] = useState(
    defaultContestSettings,
  );
  const [quizSettings, setQuizSettings] = useState(defaultQuizSettings);
  const [form, setForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    dailyChallengeEmailOptIn: false,
  });
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const authRequestInFlight = useRef(false);
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
      throw new Error("Unable to load quiz questions. Please try again.");
    }

    const apiQuestions = await response.json();
    if (!Array.isArray(apiQuestions)) {
      throw new Error("The server returned an unexpected questions response.");
    }

    return apiQuestions.map((question) => ({
      ...question,
      category: question.category || defaultQuizCategory,
      section: question.section || "both",
    }));
  };

  const fetchUsersFromApi = async () => {
    const response = await apiFetch("/api/users");

    if (!response.ok) {
      throw new Error("Unable to load user data. Please try again.");
    }

    const apiUsers = await response.json();
    if (!Array.isArray(apiUsers)) {
      throw new Error("The server returned an unexpected users response.");
    }

    return apiUsers.map(normalizeUser);
  };

  const updateForm = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      setRemoteDataStatus({ status: "loading", message: "" });

      try {
        const [apiUsers, apiQuestions, apiContestSettings] = await Promise.all([
          fetchUsersFromApi(),
          fetchQuestionsFromApi(),
          fetchContestSettingsFromApi(),
        ]);

        if (!isCancelled) {
          localStorage.setItem(USERS_KEY, JSON.stringify(apiUsers));
          setUsers(apiUsers);
        }

        if (!isCancelled) {
          setQuestions(apiQuestions);
        }

        if (!isCancelled) {
          setContestSettings(apiContestSettings);
          setQuizSettings({ ...defaultQuizSettings, ...apiContestSettings });
          setRemoteDataStatus({ status: "ready", message: "" });
        }
      } catch (error) {
        if (!isCancelled) {
          setRemoteDataStatus({
            status: "error",
            message:
              error?.message ||
              "Unable to load application data. Please try again.",
          });
        }
      }
    };

    loadRemoteData();

    return () => {
      isCancelled = true;
    };
  }, [remoteDataAttempt]);

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
    const normalizedUser = normalizeUser(user);
    const sessionUser = {
      name: normalizedUser.name,
      email: normalizedUser.email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUsers((currentUsers) => [
      normalizedUser,
      ...currentUsers.filter((item) => item.email !== normalizedUser.email),
    ]);
    setCurrentUser(sessionUser);
    goToPage("quiz");
  };

  const completeAuthentication = (user) => {
    authRequestInFlight.current = false;
    setAuthLoading(false);
    identifyUser(user);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (authRequestInFlight.current) {
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password || (mode === "register" && !name)) {
      setMessage("Please fill in all fields.");
      return;
    }

    authRequestInFlight.current = true;
    setAuthLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const response = await apiFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            dailyChallengeEmailOptIn: form.dailyChallengeEmailOptIn === true,
            username: makeUsername(name, email),
            stats: getDefaultStats(),
            resume: getDefaultResume({ name, email }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setMessage(
            response.status >= 500
              ? "Unable to connect to server. Please try again."
              : errorData.message || "Could not create account.",
          );
          return;
        }

        const data = await response.json();
        let registeredUser = data?.user
          ? normalizeUser({ ...data.user, password })
          : null;

        if (!registeredUser?.email) {
          const apiUsers = await fetchUsersFromApi();
          registeredUser =
            apiUsers.find((user) => user.email === email) || null;
        }

        if (!registeredUser?.email) {
          setMessage(
            "Your account was created, but we could not load it. Please log in.",
          );
          return;
        }

        completeAuthentication(registeredUser);
        return;
      }

      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          response.status >= 500
            ? "Unable to connect to server. Please try again."
            : response.status === 401
              ? "Invalid email or password."
              : errorData.message || "Could not log in right now. Please try again.",
        );
        return;
      }

      const data = await response.json();
      const loggedInUser = data?.user ? normalizeUser(data.user) : null;

      if (!loggedInUser?.email) {
        setMessage("The server returned an invalid login response.");
        return;
      }

      completeAuthentication(loggedInUser);
    } catch (error) {
      setMessage(
        error?.message || "Unable to connect to server. Please try again.",
      );
    } finally {
      authRequestInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const switchMode = () => {
    goToPage(mode === "login" ? "register" : "login");
    setForm({
      name: "",
      email: "",
      otp: "",
      password: "",
      dailyChallengeEmailOptIn: false,
    });
    setMessage("");
  };

  const openResetPassword = () => {
    goToPage("reset");
    setResetStep("email");
    setResetRequest(null);
    setForm({
      name: "",
      email: form.email,
      otp: "",
      password: "",
      dailyChallengeEmailOptIn: false,
    });
    setMessage("");
  };

  const handleSendResetOtp = async (event) => {
    event.preventDefault();

    if (authRequestInFlight.current) {
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }

    authRequestInFlight.current = true;
    setAuthLoading(true);
    setMessage("");
    try {
      const response = await apiFetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          response.status >= 500
            ? "Unable to connect to server. Please try again."
            : errorData.message || "Could not send OTP right now.",
        );
        return;
      }

      setResetRequest({ email, mode: "api" });
      setResetStep("otp");
      setForm((current) => ({ ...current, email, otp: "", password: "" }));
      setMessage(`OTP sent to ${email}. Please check your inbox.`);
    } catch (error) {
      setMessage(
        error?.message || "Unable to connect to server. Please try again.",
      );
    } finally {
      authRequestInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const fetchContestSettingsFromApi = async () => {
    const response = await apiFetch("/api/contest-settings");

    if (!response.ok) {
      throw new Error("Unable to load contest settings. Please try again.");
    }

    const settings = await response.json();
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      throw new Error("The server returned an unexpected settings response.");
    }

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

    if (authRequestInFlight.current) {
      return;
    }

    authRequestInFlight.current = true;
    setAuthLoading(true);
    setMessage("");
    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          response.status >= 500
            ? "Unable to connect to server. Please try again."
            : errorData.message || "Could not update password right now.",
        );
        return;
      }

      setResetRequest(null);
      setResetStep("email");
      goToPage("login");
      setForm({
        name: "",
        email,
        otp: "",
        password: "",
        dailyChallengeEmailOptIn: false,
      });
      setMessage("Password updated. Please log in.");
    } catch (error) {
      setMessage(
        error?.message || "Unable to connect to server. Please try again.",
      );
    } finally {
      authRequestInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    goToPage("landing");
    setResetStep("email");
    setResetRequest(null);
    setForm({
      name: "",
      email: "",
      otp: "",
      password: "",
      dailyChallengeEmailOptIn: false,
    });
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
    return updatedQuestions.find(
      (item) =>
        item.question === question.question &&
        item.category === question.category,
    );
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Could not delete question. Please try again.",
        );
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

  const updateQuizSettings = async (updates) => {
    const response = await apiFetch("/api/contest-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Could not update quiz settings.");
    }
    const payload = await response.json();
    setQuizSettings({ ...defaultQuizSettings, ...(payload.settings || {}) });
  };

  const deleteUser = async (email) => {
    const user = users.find((item) => item.email === email);

    if (!user?.id) {
      throw new Error("This account could not be identified. Please refresh.");
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not delete user. Please try again.",
      );
    }

    setUsers((currentUsers) =>
      currentUsers.filter((item) => item.email !== email),
    );

    if (currentUser?.email === email) {
      logout();
    }
  };

  const updateUser = async (email, changes) => {
    const user = users.find((item) => item.email === email);

    if (!user?.id) {
      throw new Error("This account could not be identified. Please refresh.");
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not update user. Please try again.",
      );
    }

    const payload = await response.json();
    const savedUser = payload?.user ? normalizeUser(payload.user) : null;

    if (!savedUser?.email) {
      throw new Error("The server returned an unexpected profile response.");
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) => (item.email === email ? savedUser : item)),
    );

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
      throw new Error("Please log in again before saving quiz results.");
    }

    const user = users.find((item) => item.email === currentUser.email);

    if (!user?.id) {
      throw new Error("Your account could not be identified. Please log in again.");
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not save quiz results. Please try again.",
      );
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.email === currentUser.email ? { ...item, stats: nextStats } : item,
      ),
    );
  };

  const toggleUserBlock = async (email) => {
    const user = users.find((item) => item.email === email);
    const isBlocking = !user?.blocked;

    if (!user?.id) {
      throw new Error("This account could not be identified. Please refresh.");
    }

    const response = await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: isBlocking }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Could not update user status. Please try again.",
      );
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.email === email ? { ...item, blocked: isBlocking } : item,
      ),
    );

    if (
      currentUser?.email === email &&
      isBlocking &&
      ["profile", "editProfile", "certificate", "resume"].includes(mode)
    ) {
      goToPage("quiz");
    }
  };

  const renderPage = () => {
    const requiresRemoteData = Boolean(
      currentUser || (mode === "admin" && isAdminLoggedIn),
    );

    if (
      requiresRemoteData &&
      mode !== "Questiondetail" &&
      remoteDataStatus.status !== "ready"
    ) {
      return (
        <main className={`quiz-shell ${theme}-theme`}>
          <LoadingState
            error={
              remoteDataStatus.status === "error"
                ? remoteDataStatus.message
                : ""
            }
            label={
              ["profile", "editProfile", "certificate", "resume"].includes(
                mode,
              )
                ? "Loading profile..."
                : mode === "admin"
                  ? "Loading admin data..."
                  : "Loading dashboard..."
            }
            onRetry={
              remoteDataStatus.status === "error"
                ? () => setRemoteDataAttempt((attempt) => attempt + 1)
                : undefined
            }
            skeleton={
              ["profile", "editProfile", "certificate", "resume"].includes(
                mode,
              )
                ? "profile"
                : "dashboard"
            }
          />
        </main>
      );
    }

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
          quizSettings={quizSettings}
          onAddQuestion={addQuestion}
          onBackToQuiz={closeAdminPanel}
          onDeleteQuestion={deleteQuestion}
          onDeleteUser={deleteUser}
          onLogout={logoutAdmin}
          onToggleTheme={toggleTheme}
          onToggleUserBlock={toggleUserBlock}
          onUpdateContestSettings={updateContestSettings}
          onUpdateQuizSettings={updateQuizSettings}
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
            contestLanding={mode === "contest"}
            onChangePractice={() => goToPage("quiz")}
            onOpenContest={() => goToPage("contest")}
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

      if (mode === "Questiondetail") {
        return (
          <Questiondetail
            theme={theme}
            user={activeUser}
            problemId={location.pathname.replace(/^\/problem\//, "")}
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
          contestLanding={mode === "contest"}
          quizLanding={mode === "quizStart"}
          quizSettings={quizSettings}
          onChangePractice={() => goToPage("quiz")}
          onOpenContest={() => goToPage("contest")}
          onSelectCategory={goToQuizCategory}
        />
      );
    }

    if (mode === "reset") {
      return (
        <ResetPassword
          form={form}
          isLoading={authLoading}
          message={message}
          onBack={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              goToPage("login", { replace: true });
            }
            setResetStep("email");
            setResetRequest(null);
            setForm({
              name: "",
              email: "",
              otp: "",
              password: "",
              dailyChallengeEmailOptIn: false,
            });
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
        isLoading={authLoading}
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
          <LoadingState label="Loading page..." />
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
      <Route path="/joinnow" element={<Join />} />

      <Route path="/aboutus/codesnipers" element={<AboutUs />} />
      <Route path="/privacy/codesnipers" element={<PrivacyPolicy />} />
      <Route path="/contactus/codesnipers" element={<ContactUs />} />
      <Route path="/participate/challenge/react/" element={<Participates />} />
      <Route path="/submit" element={<Thanks />} />
      <Route
        path="/participate/challenge/frontend/"
        element={<Participates />}
      />
      <Route
        path="/participate/challenge/javascript/"
        element={<Participates />}
      />
      <Route path="/participate/challenge/react/" element={<Participates />} />
      <Route path="/submit" element={<Thanks />} />
      <Route
        path="/participate/challenge/frontend/"
        element={<Participates />}
      />
      <Route
        path="/participate/challenge/javascript/"
        element={<Participates />}
      />
      <Route path="/quiz/start" element={currentPage} />
      <Route path="/quiz/start/" element={currentPage} />
      <Route path="/javaproblem" element={<Problems />} />
      <Route path="/quiz/cppproblem" element={<Problems />} />
      <Route path="/htmlproblem" element={<Problems />} />
      <Route path="/cssproblem" element={<Problems />} />
      <Route path="/javascriptproblem" element={<Problems />} />
      <Route path="/question-details" element={currentPage} />
      <Route path="/problem/:id" element={currentPage} />

      <Route
        path="/practice/:languageSlug"
        element={<PracticeLearningPath />}
      />
      <Route
        path="/practice/:languageSlug/modules/:moduleId"
        element={<PracticeLearningPath />}
      />
      <Route
        path="/practice-question/:id"
        element={
          <Questiondetail
            questionSource="practice"
            theme={theme}
            user={currentUser}
          />
        }
      />

      <Route path="/practice" element={<Practice></Practice>} />
      <Route path="/game" element={<Game></Game>} />
      <Route path="/all-problem" element={<Problems />} />
      <Route path="/startquiz" element={<StartQuiz1 />} />
      <Route path="/practice-sheet" element={<Practice />} />
      <Route path="/dsa-problem-sheet" element={<Problemsheet />} />

      <Route path={pageRoutes.login} element={currentPage} />
      <Route path={pageRoutes.register} element={currentPage} />
      <Route path={pageRoutes.reset} element={currentPage} />
      <Route path={pageRoutes.quiz} element={currentPage} />
      <Route path={pageRoutes.quizJava} element={currentPage} />
      <Route path={pageRoutes.contest} element={currentPage} />
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
