/**
 * face_recognition/EnrollFace.jsx  →  /face/enroll
 *
 * Mobile-first face enrollment page.
 *
 * Flow per slot:
 *   1. User picks / captures a photo
 *   2. Image is immediately sent to POST /api/face-auth/validate (blur/spoof/NSFW)
 *   3. Slot shows a spinner → green ✔ (valid) or red ✘ + reason (rejected)
 *   4. Submit button enabled only when exactly 5 slots all have valid=true
 *   5. On submit, all 5 files are sent to POST /api/face-auth/enroll
 */
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateFaceImage, enrollFaceImages } from './faceApi';

const REQUIRED_IMAGES = 5;

// ── Icons ─────────────────────────────────────────────────────────────────────
const CameraIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const SpinnerIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
);
const FaceIcon = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="5"/>
        <circle cx="10" cy="8.5" r="0.75" fill="currentColor"/>
        <circle cx="14" cy="8.5" r="0.75" fill="currentColor"/>
        <path d="M9.5 10.5c.5.8 1.2 1.2 2.5 1.2s2-.4 2.5-1.2"/>
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
    </svg>
);

// ── Slot states ────────────────────────────────────────────────────────────────
// { file: File|null, preview: string|null, status: 'empty'|'validating'|'valid'|'invalid', reason: string|null }
const emptySlot = () => ({ file: null, preview: null, status: 'empty', reason: null });

// ── Quality badge ──────────────────────────────────────────────────────────────
function QualityBadge({ status, reason }) {
    if (status === 'empty') return null;

    if (status === 'validating') {
        return (
            <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(0,0,0,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <SpinnerIcon size={14} />
            </div>
        );
    }

    if (status === 'valid') {
        return (
            <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 26, height: 26, borderRadius: '50%',
                background: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <CheckIcon />
            </div>
        );
    }

    // invalid
    return (
        <>
            <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 26, height: 26, borderRadius: '50%',
                background: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <XIcon />
            </div>
            {reason && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(239,68,68,0.92)',
                    padding: '5px 6px',
                    fontSize: '9px', fontWeight: 700,
                    color: '#fff', lineHeight: 1.3,
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                }}>
                    {reason}
                </div>
            )}
        </>
    );
}

// ── Single photo slot ─────────────────────────────────────────────────────────
function PhotoSlot({ index, slot, onFileSelected, onDelete, globalLoading }) {
    const inputRef = useRef(null);
    const isDisabled = globalLoading || slot.status === 'validating';

    const borderColor = slot.status === 'valid'
        ? '#22c55e'
        : slot.status === 'invalid'
            ? '#ef4444'
            : slot.status === 'validating'
                ? '#f59e0b'
                : '#d1d5db';

    return (
        <div style={{
            position: 'relative',
            aspectRatio: '3/4',
            borderRadius: '12px',
            overflow: 'hidden',
            background: slot.preview ? 'transparent' : '#f9fafb',
            border: `2px ${slot.preview ? 'solid' : 'dashed'} ${borderColor}`,
            cursor: isDisabled ? 'default' : (slot.preview ? 'default' : 'pointer'),
            transition: 'border-color 0.25s',
            boxShadow: slot.status === 'valid' ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
        }}>
            {slot.preview ? (
                <>
                    <img
                        src={slot.preview}
                        alt={`Photo ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />

                    {/* Slot number */}
                    <div style={{
                        position: 'absolute', top: 6, left: 6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        fontSize: '10px', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {index + 1}
                    </div>

                    {/* Quality badge (spinner / check / ✘ + reason) */}
                    <QualityBadge status={slot.status} reason={slot.reason} />

                    {/* Explicit Reupload Prompt for Rejected Images */}
                    {slot.status === 'invalid' && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(239, 68, 68, 0.2)',
                            backdropFilter: 'blur(2px)',
                        }}>
                            <button
                                onClick={() => inputRef.current?.click()}
                                style={{
                                    padding: '8px 16px',
                                    background: '#ef4444',
                                    border: 'none', borderRadius: '20px',
                                    fontSize: '11px', fontWeight: 800,
                                    color: '#fff', cursor: 'pointer',
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                                }}
                            >
                                REUPLOAD
                            </button>
                        </div>
                    )}

                    {/* Hover controls — shown only when not busy and not rejected (rejected has explicit reupload) */}
                    {!isDisabled && slot.status !== 'validating' && slot.status !== 'invalid' && (
                        <div className="slot-hover" style={{
                            position: 'absolute', inset: 0,
                            background: 'transparent',
                            display: 'flex', alignItems: 'flex-end',
                            padding: '8px', gap: '5px',
                            transition: 'background 0.2s',
                        }}>
                            <button
                                onClick={() => inputRef.current?.click()}
                                style={{
                                    flex: 1, padding: '5px 0',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none', borderRadius: '6px',
                                    fontSize: '9px', fontWeight: 800,
                                    cursor: 'pointer', color: '#1a1a18',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                REPLACE
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                style={{
                                    padding: '5px 7px',
                                    background: 'rgba(239,68,68,0.9)',
                                    border: 'none', borderRadius: '6px',
                                    cursor: 'pointer', color: '#fff',
                                    display: 'flex', alignItems: 'center',
                                }}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <button
                    onClick={() => !isDisabled && inputRef.current?.click()}
                    style={{
                        width: '100%', height: '100%',
                        background: 'transparent', border: 'none',
                        cursor: isDisabled ? 'default' : 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                        color: '#9ca3af',
                    }}
                >
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6b7280',
                    }}>
                        <CameraIcon />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        PHOTO {index + 1}
                    </span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelected(index, file);
                    e.target.value = '';   // reset so same file can be re-selected
                }}
            />
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function EnrollFace() {
    const navigate = useNavigate();

    // AUTH GUARD: Ensure user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !role || role.toUpperCase() !== 'STUDENT') {
        return (
            <div style={{ padding: 60, textAlign: 'center', fontFamily: 'sans-serif', background: '#fef2f2', height: '100vh' }}>
                <h2 style={{ color: '#ef4444' }}>Authentication Required</h2>
                <p>You must be logged in as a Student to access Face Enrollment.</p>
                <button 
                    onClick={() => navigate('/signin')}
                    style={{ padding: '10px 20px', marginTop: 15, background: '#7b1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const [slots, setSlots] = useState(Array.from({ length: REQUIRED_IMAGES }, emptySlot));
    const [submitting, setSubmitting]   = useState(false);
    const [success, setSuccess]         = useState(false);
    const [submitError, setSubmitError] = useState('');

    const studentId = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').id ?? 'unknown'; }
        catch { return 'unknown'; }
    })();

    const validCount     = slots.filter(s => s.status === 'valid').length;
    const validatingAny  = slots.some(s => s.status === 'validating');
    const allValid       = validCount === REQUIRED_IMAGES;
    const canSubmit      = allValid && !submitting && !validatingAny;

    // ── Handle file selected in a slot ─────────────────────────────────────
    const handleFileSelected = useCallback(async (index, file) => {
        // Preview immediately
        const preview = URL.createObjectURL(file);

        setSlots(prev => {
            const next = [...prev];
            next[index] = { file, preview, status: 'validating', reason: null };
            return next;
        });
        setSubmitError('');

        // Fire validate request
        try {
            const result = await validateFaceImage(file);

            setSlots(prev => {
                const next = [...prev];
                next[index] = {
                    ...next[index],
                    status: result.valid ? 'valid' : 'invalid',
                    reason: result.reason ?? null,
                };
                return next;
            });
        } catch (err) {
            setSlots(prev => {
                const next = [...prev];
                next[index] = {
                    ...next[index],
                    status: 'invalid',
                    reason: err.message || 'Validation failed. Please try a different image.',
                };
                return next;
            });
        }
    }, []);

    // ── Delete a slot ──────────────────────────────────────────────────────
    const handleDelete = useCallback((index) => {
        setSlots(prev => {
            const next = [...prev];
            const old = next[index];
            if (old.preview) URL.revokeObjectURL(old.preview);
            next[index] = emptySlot();
            return next;
        });
    }, []);

    // ── Bulk file picker ───────────────────────────────────────────────────
    const bulkInputRef = useRef(null);
    const handleBulkFiles = useCallback(async (files) => {
        const fileArr = Array.from(files).slice(0, REQUIRED_IMAGES);
        setSlots(prev => {
            const next = [...prev];
            let fi = 0;
            for (let i = 0; i < next.length && fi < fileArr.length; i++) {
                if (next[i].status === 'empty') {
                    const file = fileArr[fi++];
                    if (next[i].preview) URL.revokeObjectURL(next[i].preview);
                    next[i] = { file, preview: URL.createObjectURL(file), status: 'validating', reason: null };
                }
            }
            return next;
        });

        // Validate each SEQUENTIALLY to avoid overloading ZepIris (CPU bound)
        for (let i = 0; i < fileArr.length; i++) {
            const file = fileArr[i];
            try {
                const result = await validateFaceImage(file);
                setSlots(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(s => s.file === file);
                    if (idx !== -1) {
                        next[idx] = { ...next[idx], status: result.valid ? 'valid' : 'invalid', reason: result.reason ?? null };
                    }
                    return next;
                });
            } catch (err) {
                setSlots(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(s => s.file === file);
                    if (idx !== -1) {
                        next[idx] = { ...next[idx], status: 'invalid', reason: err.message || 'Validation failed.' };
                    }
                    return next;
                });
            }
        }
    }, []);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const files = slots.map(s => s.file);
            await enrollFaceImages(files);
            setSuccess(true);
            setTimeout(() => navigate('/student'), 2500);
        } catch (err) {
            setSubmitError(err.message || 'Enrollment failed. Please try again.');
            setSubmitting(false);
        }
    };

    // ── Success screen ─────────────────────────────────────────────────────
    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #7b1c1c 0%, #2d0a0a 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '20px', padding: '32px',
                fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 1.2s ease-in-out infinite',
                }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Face Profile Registered</h2>
                    <p style={{ marginTop: 8, opacity: 0.75, fontSize: 14 }}>All 5 photos enrolled successfully.</p>
                    <p style={{ marginTop: 4, opacity: 0.5, fontSize: 12 }}>Redirecting to dashboard…</p>
                </div>
                <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} } @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    // ── Main UI ────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #f7f7f5 0%, #ede8e4 100%)',
            display: 'flex', flexDirection: 'column',
            fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
        }}>
            {/* Header */}
            <header style={{
                background: '#7b1c1c', color: '#fff',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FaceIcon />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Face Enrollment</h1>
                    <p style={{ margin: 0, fontSize: '11px', opacity: 0.65, marginTop: 1 }}>Student ID: {studentId}</p>
                </div>
            </header>

            {/* Progress bar */}
            <div style={{ height: 4, background: '#e5e7eb' }}>
                <div style={{
                    height: '100%',
                    width: `${(validCount / REQUIRED_IMAGES) * 100}%`,
                    background: 'linear-gradient(90deg, #7b1c1c, #c0392b)',
                    transition: 'width 0.3s ease',
                    borderRadius: '0 2px 2px 0',
                }}/>
            </div>

            <main style={{ flex: 1, padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>

                {/* Status card */}
                <div style={{
                    background: '#fff', borderRadius: 14,
                    padding: '14px 16px', marginBottom: 20,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: allValid ? '#22c55e' : validatingAny ? '#f59e0b' : '#7b1c1c',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                            transition: 'background 0.3s',
                        }}>
                            {allValid ? '✓' : validatingAny ? <SpinnerIcon size={13}/> : validCount}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                            {allValid
                                ? 'All 5 photos approved — ready to submit!'
                                : validatingAny
                                    ? 'Checking image quality…'
                                    : `${validCount} of ${REQUIRED_IMAGES} photos approved`}
                        </span>
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#6b7280', fontSize: 12, lineHeight: 1.9 }}>
                        <li>Each photo is instantly checked for clarity and liveness</li>
                        <li>Blurry, spoofed, or unsafe images will be rejected immediately</li>
                        <li>Use natural lighting and face the camera directly</li>
                    </ul>
                </div>

                {/* Bulk add shortcut */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }}/>
                    <button
                        disabled={submitting || validatingAny}
                        onClick={() => bulkInputRef.current?.click()}
                        style={{
                            padding: '6px 14px',
                            background: '#fff', border: '1px solid #d1d5db',
                            borderRadius: 20, fontSize: 11, fontWeight: 700,
                            color: '#6b7280', cursor: submitting ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.05em',
                        }}
                    >
                        + ADD MULTIPLE PHOTOS
                    </button>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }}/>
                    <input
                        ref={bulkInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleBulkFiles(e.target.files)}
                    />
                </div>

                {/* Photo grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12, marginBottom: 24,
                }}>
                    {slots.map((slot, i) => (
                        <PhotoSlot
                            key={i}
                            index={i}
                            slot={slot}
                            onFileSelected={handleFileSelected}
                            onDelete={handleDelete}
                            globalLoading={submitting}
                        />
                    ))}
                </div>

                {/* Per-slot validation legend */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                        { color: '#22c55e', label: 'Approved' },
                        { color: '#f59e0b', label: 'Checking…' },
                        { color: '#ef4444', label: 'Rejected' },
                    ].map(({ color, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}/>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Submit error */}
                {submitError && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: 10, padding: '11px 14px', marginBottom: 14,
                        color: '#b91c1c', fontSize: 13, fontWeight: 600,
                        display: 'flex', gap: 8, alignItems: 'center',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {submitError}
                    </div>
                )}

                {/* Submit button */}
                <button
                    id="enroll-submit-btn"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{
                        width: '100%', padding: '15px',
                        borderRadius: 14, border: 'none',
                        background: canSubmit
                            ? 'linear-gradient(135deg, #7b1c1c, #c0392b)'
                            : '#e5e7eb',
                        color: canSubmit ? '#fff' : '#9ca3af',
                        fontSize: 14, fontWeight: 800, letterSpacing: '0.06em',
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: canSubmit ? '0 4px 20px rgba(123,28,28,0.3)' : 'none',
                    }}
                >
                    {submitting ? (
                        <><SpinnerIcon size={17}/> ENROLLING FACE PROFILE…</>
                    ) : (
                        'SUBMIT FACE PROFILE'
                    )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 14 }}>
                    Photos are processed securely and linked to your student ID
                </p>
            </main>

            <style>{`
                .slot-hover:hover { background: rgba(0,0,0,0.4) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.08) } }
            `}</style>
        </div>
    );
}
