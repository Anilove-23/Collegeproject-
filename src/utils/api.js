const BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export async function apiFetch(
  endpoint,
  options = {}
) {

  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  const response =
    await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            token
              ? `Bearer ${token}`
              : "",

          role: role || "",

          ...(options.headers || {}),
        },
      }
    );

  /* ================= AUTO LOGOUT ================= */

  // Only treat 401/403 as a session expiry if we're NOT on an auth endpoint.
  // A 401 on /api/auth/login just means wrong credentials — not an expired session.
  const isAuthEndpoint = endpoint.startsWith("/api/auth/");

  if (
    (response.status === 401 || response.status === 403) &&
    !endpoint.includes('/login') && !endpoint.includes('/verify-otp')
    !isAuthEndpoint &&
    (response.status === 401 ||
    response.status === 403)
  ) {
    localStorage.clear();
    window.location.href =
      "/signin";

    throw new Error(
      "Unauthorized"
    );
  }

  const text =
    await response.text();

  let data = {};

  try {

    data = text
      ? JSON.parse(text)
      : {};

  } catch {

    throw new Error(
      "Invalid server response"
    );
  }

  if (!response.ok) {

    const err = new Error(
      data.message ||
      data.error ||
      "Request failed"
    );
    err.data = data;
    throw err;
  }

  return data;
}