import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { adminAccessUser } from "./Components/AdminAccess";
import AdminLogin from "./Components/AdminLogin";
import AdminPanel from "./Components/AdminPanel";
import AuthPage from "./Components/AuthPage";
import Quiz from "./Components/Quiz";
import { defaultQuizCategory, getQuizCategoryPath } from "./Components/QuizCategories";
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
const IS_DEV = Boolean(import.meta.env.DEV);
const apiUrl = (path) => `${API_BASE_URL}${path}`;
const fallbackApiUrl = (path) => `${API_FALLBACK_BASE_URL}${path}`;

const apiFetch = async (path, options) => {
  const primaryUrl = apiUrl(path);
  const canUseFallback = !IS_DEV;
  let isSameOrigin = false;

  try {
    const resolvedPrimaryUrl = new URL(primaryUrl, window.location.origin);
    isSameOrigin = resolvedPrimaryUrl.origin === window.location.origin;
  } catch {
    isSameOrigin = primaryUrl.startsWith("/");
  }

  try {
    const response = await fetch(primaryUrl, options);

    const shouldUseFallback =
      canUseFallback && isSameOrigin && (response.status === 404 || response.status >= 500);

    if (!shouldUseFallback) {
      return response;
    }
  } catch (error) {
    if (!canUseFallback || !isSameOrigin) {
      throw error;
    }
  }

  if (!canUseFallback) {
    throw new Error("Primary API request failed.");
  }

  return fetch(fallbackApiUrl(path), options);
};

const makeUsername = (name = "", email = "") => {
  const base = name.trim() || email.split("@")[0] || "user";

  return base.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "user";
};

const getDefaultStats = () => ({
  totalSolved: 0,
  totalCorrect: 0,
  completedQuizzes: 0,
  bestScore: 0,
  categories: {},
});

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
  },
  resume: {
    ...getDefaultResume(user),
    ...(user.resume || {}),
  },
});

const getStoredUsers = () => {
  try {
    return (JSON.parse(localStorage.getItem(USERS_KEY)) || []).map(normalizeUser);
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
    }));
  } catch {
    return defaultQuestions.map((question) => ({
      ...question,
      category: question.category || defaultQuizCategory,
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
  const [registerStep, setRegisterStep] = useState("details");
  const mode = getAllowedPage(location.pathname, currentUser);
  const routeCategory = mode === "quiz" ? getQuizCategoryFromPath(location.pathname) : "";

  const goToPage = (page, options = {}) => {
    navigate(pageRoutes[page] || pageRoutes.login, { replace: Boolean(options.replace) });
  };

  const goToQuizCategory = (category, options = {}) => {
    navigate(getQuizCategoryPath(category), { replace: Boolean(options.replace) });
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

        if (!isCancelled) {
          localStorage.setItem(USERS_KEY, JSON.stringify(apiUsers));
          setUsers(apiUsers);
        }

        if (!isCancelled) {
          setQuestions(apiQuestions);
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

    if (
      username !== adminAccessUser.username ||
      password !== adminAccessUser.password
    ) {
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
        const response = await apiFetch("/api/auth/register-with-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            otp: form.otp.trim(),
            password,
            username: makeUsername(name, email),
            stats: getDefaultStats(),
            resume: getDefaultResume({ name, email }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setMessage(errorData.message || "Could not create account.");
          return;
        }

        const apiUsers = await syncUsersFromApi();
        const newUser = apiUsers.find((user) => user.email === email);

        if (newUser) {
          identifyUser(newUser);
        }
      } catch {
        setMessage("Could not connect to server. Please try again.");
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
      setMessage("Could not connect to server. Please try again.");
    }
  };

  const handleSendRegisterOtp = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      setMessage("Please fill in name, email and password first.");
      return;
    }

    try {
      const response = await apiFetch("/api/auth/request-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Could not send verification OTP.");
        return;
      }

      setRegisterStep("otp");
      setForm((current) => ({ ...current, otp: "" }));
      setMessage(data.message || "Verification OTP sent to your email.");
    } catch {
      setMessage("Could not connect to server. Please try again.");
    }
  };

  const switchMode = () => {
    goToPage(mode === "login" ? "register" : "login");
    setForm({ name: "", email: "", otp: "", password: "" });
    setRegisterStep("details");
    setMessage("");
  };

  const openResetPassword = () => {
    goToPage("reset");
    setResetStep("email");
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
    try {
      const response = await apiFetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Could not send OTP right now.");
        return;
      }

      setResetStep("otp");
      setForm((current) => ({ ...current, email, otp: "", password: "" }));
      setMessage(data.message || "OTP sent to your email.");
    } catch {
      setMessage("Could not connect to server. Please try again.");
    }
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
    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Could not update password right now.");
        return;
      }

      await syncUsersFromApi();
      setResetStep("email");
      goToPage("login");
      setForm({ name: "", email, otp: "", password: "" });
      setMessage(data.message || "Password updated. Please log in.");
    } catch {
      setMessage("Could not connect to server. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    goToPage("login");
    setResetStep("email");
    setRegisterStep("details");
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
      throw new Error(errorData.message || "Could not save question to database.");
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

  const deleteUser = async (email) => {
    const user = users.find((item) => item.email === email);

    if (!user?.id) {
      return;
    }

    const response = await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });

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

  const recordQuizComplete = async ({ category, totalQuestions, score }) => {
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
    const nextStats = {
      ...stats,
      totalSolved: stats.totalSolved + totalQuestions,
      totalCorrect: stats.totalCorrect + score,
      completedQuizzes: stats.completedQuizzes + 1,
      bestScore: Math.max(stats.bestScore, score),
      categories: {
        ...stats.categories,
        [category]: {
          solved: categoryStats.solved + totalQuestions,
          correct: categoryStats.correct + score,
          completed: categoryStats.completed + 1,
          bestScore: Math.max(categoryStats.bestScore, score),
        },
      },
    };

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
        onAddQuestion={addQuestion}
        onBackToQuiz={closeAdminPanel}
        onDeleteQuestion={deleteQuestion}
        onDeleteUser={deleteUser}
        onLogout={logoutAdmin}
        onToggleTheme={toggleTheme}
        onToggleUserBlock={toggleUserBlock}
        onUpdateUser={updateUser}
        questions={questions}
        theme={theme}
        users={users}
      />
    );
  }

  if (currentUser) {
    const currentUserRecord = getCurrentUserRecord();
    const isCurrentUserBlocked = Boolean(currentUserRecord?.blocked);
    const activeUser = currentUserRecord || currentUser;
    const accountSections = ["profile", "editProfile", "certificate", "resume", "logout"];

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
          userBlocked={isCurrentUserBlocked}
          onChangePractice={() => goToPage("quiz")}
          onSelectCategory={goToQuizCategory}
        />
      ) : (
        <UserDetail
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
        userBlocked={isCurrentUserBlocked}
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
        isRegisterOtpStep={isRegister && registerStep === "otp"}
        message={message}
        onChange={updateForm}
        onForgotPassword={openResetPassword}
        onSendRegisterOtp={handleSendRegisterOtp}
        onSubmit={handleSubmit}
        onSwitchMode={switchMode}
      />
    );
  };

  const currentPage = renderPage();

  return (
    <Routes>
      <Route path="/" element={currentPage} />
      <Route path="/index.html" element={currentPage} />
      <Route path={pageRoutes.login} element={currentPage} />
      <Route path={pageRoutes.register} element={currentPage} />
      <Route path={pageRoutes.reset} element={currentPage} />
      <Route path={pageRoutes.quiz} element={currentPage} />
      <Route path="/quiz/:categorySlug" element={currentPage} />
      <Route path={pageRoutes.profile} element={currentPage} />
      <Route path={pageRoutes.editProfile} element={currentPage} />
      <Route path={pageRoutes.certificate} element={currentPage} />
      <Route path={pageRoutes.resume} element={currentPage} />
      <Route path={pageRoutes.logout} element={currentPage} />
      <Route path={pageRoutes.admin} element={currentPage} />
      <Route path="*" element={<Navigate to={currentUser ? pageRoutes.quiz : pageRoutes.login} replace />} />
    </Routes>
  );
}

export default App;
