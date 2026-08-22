const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const apiFetch = async (path, options) => {
  return fetch(apiUrl(path), options);
};

