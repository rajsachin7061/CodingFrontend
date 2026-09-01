import { apiFetch } from "../../../api";

const jsonRequest = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
};

export const problemsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return jsonRequest(`/api/problems?${query}`);
  },
  get: (id) => jsonRequest(`/api/problems/${id}`),
  create: (body) =>
    jsonRequest("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    jsonRequest(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  remove: (id) => jsonRequest(`/api/problems/${id}`, { method: "DELETE" }),
  tags: () => jsonRequest("/api/problems/tags"),
};

export const problemSheetApi = {
  get: () => jsonRequest("/api/problem-sheet"),
  save: (problemIds) =>
    jsonRequest("/api/problem-sheet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemIds }),
    }),
};

export const practiceQuestionDataApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return jsonRequest(`/api/practice-question-data?${query}`);
  },
  get: (id) => jsonRequest(`/api/practice-question-data/${id}`),
  create: (body) =>
    jsonRequest("/api/practice-question-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    jsonRequest(`/api/practice-question-data/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  remove: (id) => jsonRequest(`/api/practice-question-data/${id}`, { method: "DELETE" }),
};

export const languagesApi = {
  list: () => jsonRequest("/api/languages"),
  create: (body) =>
    jsonRequest("/api/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    jsonRequest(`/api/languages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  remove: (id) => jsonRequest(`/api/languages/${id}`, { method: "DELETE" }),
  reorder: (orderedIds) =>
    jsonRequest("/api/languages/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    }),
};

export const modulesApi = {
  listByLanguage: (languageId) =>
    jsonRequest(`/api/languages/${languageId}/modules`),
  get: (id) => jsonRequest(`/api/modules/${id}`),
  create: (languageId, body) =>
    jsonRequest(`/api/languages/${languageId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    jsonRequest(`/api/modules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  remove: (id) => jsonRequest(`/api/modules/${id}`, { method: "DELETE" }),
  reorder: (orderedIds) =>
    jsonRequest("/api/modules/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    }),
};

export const practiceQuestionsApi = {
  listByModule: (moduleId) =>
    jsonRequest(`/api/modules/${moduleId}/questions`),
  add: (moduleId, body) =>
    jsonRequest(`/api/modules/${moduleId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    jsonRequest(`/api/practice-questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  remove: (id) =>
    jsonRequest(`/api/practice-questions/${id}`, { method: "DELETE" }),
  reorder: (moduleId, orderedIds) =>
    jsonRequest(`/api/modules/${moduleId}/questions/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    }),
};
