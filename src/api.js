const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const apiUrl = (path) =>
  /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;

const CONNECTION_ERROR_MESSAGE =
  "Unable to connect to server. Please try again.";
const REQUEST_TIMEOUT_MS = 30000;

export const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const externalSignal = options.signal;
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
      ...options,
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
