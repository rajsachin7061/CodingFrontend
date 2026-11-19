const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const apiUrl = (path) =>
  /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;

const CONNECTION_ERROR_MESSAGE =
  "Unable to connect to server. Please try again.";
const REQUEST_TIMEOUT_MS = 30000;
const USER_TOKEN_KEY = "onlineQuizAuthToken";
const ADMIN_TOKEN_KEY = "onlineQuizAdminToken";

const isAdminRequest = (path, method) => {
  const parsedUrl = new URL(path, window.location.origin);
  const pathname = parsedUrl.pathname;
  const requestMethod = method.toUpperCase();

  if (
    pathname.startsWith("/api/premium/admin/") ||
    pathname.startsWith("/api/admin/")
  ) {
    return true;
  }

  if (pathname === "/api/users" && requestMethod === "GET") {
    return true;
  }

  if (
    requestMethod === "GET" &&
    ["/api/problems", "/api/practice-question-data"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) &&
    parsedUrl.searchParams.get("includeHidden") === "1"
  ) {
    return true;
  }

  return (
    requestMethod !== "GET" &&
    [
      "/api/questions",
      "/api/problems",
      "/api/problem-sheet",
      "/api/practice-question-data",
      "/api/languages",
      "/api/modules",
      "/api/practice-questions",
      "/api/contest-settings",
    ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
};

export const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const externalSignal = options.signal;
  const { authRole, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const role =
    authRole ||
    (isAdminRequest(path, fetchOptions.method || "GET") ? "admin" : "user");
  const tokenKey = role === "admin" ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem(tokenKey) : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", abortFromExternalSignal, {
        once: true,
      });
    }
  }

  try {
    return await fetch(apiUrl(path), {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (externalSignal?.aborted) {
      throw error;
    }

    throw new Error(CONNECTION_ERROR_MESSAGE, { cause: error });
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
};
