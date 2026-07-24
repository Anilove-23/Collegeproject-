/**
 * face_recognition/mockApi.js
 *
 * Local mock API layer for the facial recognition module.
 * All fake endpoints live here — do NOT touch src/utils/api.js.
 */

/**
 * Simulate enrolling a student's face profile.
 * @param {string} studentId
 * @param {File[]} imagesArray - Array of 5 File objects
 * @returns {Promise<{ status: string, message: string }>}
 */
export function mockEnrollFace(studentId, imagesArray) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status: 'success',
                message: 'Face profile registered successfully',
            });
        }, 2500);
    });
}

/**
 * Simulate verifying a face against enrolled profiles.
 * @param {string} imageFrame - Base64 encoded image from webcam screenshot
 * @returns {Promise<{ match: boolean, studentId: string, confidence: number }>}
 */
export function mockVerifyFace(imageFrame) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                match: true,
                studentId: 'STUDENT_123',
                confidence: 0.96,
            });
        }, 1500);
    });
}
