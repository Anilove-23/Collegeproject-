/**
 * face_recognition/faceApi.js
 *
 * Real API layer for the face recognition module.
 * Communicates with hostel_backend /api/face-auth/* endpoints.
 *
 * Auth token is read from localStorage (same as the rest of the project).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(role  ? { role }                              : {}),
    };
}

async function handleResponse(res) {
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) {}
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
}

/**
 * Validate a single image for blur / spoof / NSFW.
 * No enrollment — just a quality check.
 *
 * @param {File} imageFile
 * @returns {Promise<{
 *   valid: boolean,
 *   reason: string | null,
 *   imageQualityAssessment: object
 * }>}
 */
export async function validateFaceImage(imageFile) {
    const form = new FormData();
    form.append('photo', imageFile);

    const res = await fetch(`${BASE_URL}/api/face-auth/validate`, {
        method: 'POST',
        headers: getAuthHeaders(),   // NO Content-Type — browser sets multipart boundary
        body: form,
    });

    const data = await handleResponse(res);
    // data.data contains { valid, reason, imageQualityAssessment }
    return data.data;
}

/**
 * Enroll all 5 validated images for the logged-in student.
 *
 * @param {File[]} imageFiles - Array of exactly 5 File objects
 * @returns {Promise<{ success: boolean, enrolledCount: number, faces: object[] }>}
 */
export async function enrollFaceImages(imageFiles) {
    const form = new FormData();
    imageFiles.forEach(file => form.append('photos', file));

    const res = await fetch(`${BASE_URL}/api/face-auth/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
    });

    const data = await handleResponse(res);
    return data.data;
}

/**
 * Re-enroll: wipes existing face data and re-enrolls with 5 new images.
 *
 * @param {File[]} imageFiles
 */
export async function reEnrollFaceImages(imageFiles) {
    const form = new FormData();
    imageFiles.forEach(file => form.append('photos', file));

    const res = await fetch(`${BASE_URL}/api/face-auth/re-enroll`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: form,
    });

    const data = await handleResponse(res);
    return data.data;
}

/**
 * Verify a face (Guard use — sends a captured frame to search the enrolled index).
 *
 * @param {Blob|File} captureBlob - Base64 or Blob from webcam screenshot
 */
export async function verifyFaceCapture(captureBlob) {
    const form = new FormData();
    form.append('capture', captureBlob, 'capture.jpg');

    const res = await fetch(`${BASE_URL}/api/face-auth/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
    });

    const data = await handleResponse(res);
    return data.data;
}
