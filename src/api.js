const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://codingbackend-rdyv.onrender.com")
).replace(/\/+$/, "");

const API_FALLBACK_BASE_URL = "https://codingbackend-rdyv.onrender.com";

const apiUrl = (path) => `${API_BASE_URL}${path}`;
const fallbackApiUrl = (path) => `${API_FALLBACK_BASE_URL}${path}`;

export const apiFetch = async (path, options) => {
  const primaryUrl = apiUrl(path);
  const response = await fetch(primaryUrl, options);

  if (response.status !== 404 || import.meta.env.DEV) {
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
