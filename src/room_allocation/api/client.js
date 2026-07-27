/**
 * api/client.js — Shared fetch wrapper for room-allocation API calls
 *
 * Matches the pattern used by the rest of Collegeproject-:
 * raw fetch() calls to http://localhost:5000 (hostel_backend port).
 *
 * Auth: reads token from localStorage["token"] the same way
 * complaint.jsx / outpass.jsx / etc. do.
 *
 * Returns parsed JSON data directly (throws on non-2xx).
 */

const BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
    let token = localStorage.getItem('token') ?? '';
    // Strip surrounding quotes if stored with them (same fix as complaint.jsx)
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);

    const userStr = localStorage.getItem('user');
    const role = userStr ? (JSON.parse(userStr).role ?? 'student') : 'student';

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        role,
    };
}

async function request(method, path, body) {
    const headers = getAuthHeaders();
    const isFormData = body instanceof FormData;

    // fetch automatically sets correct multipart/form-data boundary when we omit Content-Type
    if (isFormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message ?? `Request failed: ${res.status}`);
    }

    return data;
}

const client = {
    get:    (path)        => request('GET',    path),
    post:   (path, body)  => request('POST',   path, body),
    put:    (path, body)  => request('PUT',    path, body),
    patch:  (path, body)  => request('PATCH',  path, body),
    delete: (path)        => request('DELETE', path),
};

export default client;
