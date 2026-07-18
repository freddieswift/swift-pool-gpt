const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api/v1";

let csrfToken = null;

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function loadCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
    credentials: "include"
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || "Unable to obtain a security token",
      response.status,
      payload?.error?.code,
      payload?.error?.details
    );
  }

  csrfToken =
    payload?.data?.csrfToken ||
    payload?.csrfToken ||
    payload?.data?.token ||
    payload?.token;

  return csrfToken;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (isMutation && !csrfToken) {
    await loadCsrfToken();
  }

  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (isMutation && csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    body:
      options.body === undefined || options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body)
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 403 && isMutation) {
      csrfToken = null;
    }

    throw new ApiError(
      payload?.error?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.code,
      payload?.error?.details
    );
  }

  return payload?.data ?? payload;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
  resetCsrf: () => {
    csrfToken = null;
  }
};
