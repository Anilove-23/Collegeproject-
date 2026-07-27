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

  if (
    response.status === 401 ||
    response.status === 403
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

    throw new Error(
      data.message ||
      "Request failed"
    );
  }

  return data;
}