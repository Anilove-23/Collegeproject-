const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

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

  // Do not trigger auto logout on login or signup endpoints
  const isAuthEndpoint = endpoint.includes('/api/auth/login') || endpoint.includes('/api/auth/signup');

  if (
    !isAuthEndpoint &&
    (response.status === 401 ||
    response.status === 403)
  ) {

    localStorage.clear();

    window.location.href =
      "/signin";

    return;
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

    throw new Error(
      data.message ||
      "Request failed"
    );
  }

  return data;
}