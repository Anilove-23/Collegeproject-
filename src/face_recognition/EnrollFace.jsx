/**
 * face_recognition/EnrollFace.jsx  →  /face/enroll
 *
 * Mobile-first enrollment page.
 * Allows a student to select/capture exactly 5 photos and submit them
 * to the mock enrollment API.
 */
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockEnrollFace } from './mockApi';

const REQUIRED_IMAGES = 5;

/* ─── Small SVG icons ─────────────────────────────────────────────────── */
const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const FaceIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="8" r="5"/>
        <path d="M9 10c.333.667 1 1 1.5 1s1.167-.333 1.5-1"/>
        <circle cx="10" cy="8.5" r="0.75" fill="currentColor"/>
        <circle cx="14" cy="8.5" r="0.75" fill="currentColor"/>
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
    </svg>
);

/* ─── Photo Slot Component ────────────────────────────────────────────── */
function PhotoSlot({ index, image, onDelete, onReplace, loading }) {
    const inputRef = useRef(null);

    return (
        <div style={{
            position: 'relative',
            aspectRatio: '3/4',
            borderRadius: '12px',
            overflow: 'hidden',
            background: image ? 'transparent' : '#f0f0ec',
            border: image ? '2px solid #7b1c1c' : '2px dashed #c8c8c2',
            cursor: loading ? 'default' : (image ? 'default' : 'pointer'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: image ? '0 2px 12px rgba(123,28,28,0.12)' : 'none',
        }}>
            {image ? (
                <>
                    <img
                        src={image}
                        alt={`Photo ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Overlay controls */}
                    {!loading && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0)',
                            transition: 'background 0.2s',
                            display: 'flex', alignItems: 'flex-end',
                            padding: '8px', gap: '6px',
                        }}
                            className="slot-overlay"
                        >
                            <button
                                onClick={() => inputRef.current?.click()}
                                title="Replace"
                                style={{
                                    flex: 1, padding: '5px 0',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none', borderRadius: '6px',
                                    fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                                    color: '#1a1a18', letterSpacing: '0.04em',
                                }}
                            >
                                REPLACE
                            </button>
                            <button
                                onClick={onDelete}
                                title="Delete"
                                style={{
                                    padding: '5px 8px',
                                    background: 'rgba(200,30,30,0.9)',
                                    border: 'none', borderRadius: '6px',
                                    cursor: 'pointer', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    )}
                    {/* Number badge */}
                    <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: '#7b1c1c', color: '#fff',
                        fontSize: '11px', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {index + 1}
                    </div>
                    {/* Check badge */}
                    <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: '#22c55e', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CheckIcon />
                    </div>
                </>
            ) : (
                <button
                    onClick={() => !loading && inputRef.current?.click()}
                    style={{
                        width: '100%', height: '100%', background: 'transparent',
                        border: 'none', cursor: loading ? 'default' : 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                        color: '#9a9a94',
                    }}
                >
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: '#e8e8e4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6b6b66',
                    }}>
                        <CameraIcon />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                        PHOTO {index + 1}
                    </span>
                </button>
            )}
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={(e) => onReplace(e.target.files[0])}
            />
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function EnrollFace() {
    const navigate = useNavigate();
    const [images, setImages] = useState(Array(REQUIRED_IMAGES).fill(null));   // [dataURL | null]
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Read studentId from localStorage (same pattern used elsewhere in the project)
    const studentId = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').id ?? 'unknown'; }
        catch { return 'unknown'; }
    })();

    const filledCount = images.filter(Boolean).length;
    const allFilled = filledCount === REQUIRED_IMAGES;

    /* ── helpers ─────────────────────────────── */
    const readFile = (file) =>
        new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) => res(e.target.result);
            reader.readAsDataURL(file);
        });

    const handleReplace = useCallback(async (index, file) => {
        if (!file) return;
        const dataUrl = await readFile(file);
        setImages(prev => {
            const next = [...prev];
            next[index] = dataUrl;
            return next;
        });
        setError('');
    }, []);

    const handleDelete = useCallback((index) => {
        setImages(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    }, []);

    /* ── bulk file picker (add multiple at once) ─── */
    const bulkInputRef = useRef(null);
    const handleBulkFiles = async (files) => {
        const fileArr = Array.from(files).slice(0, REQUIRED_IMAGES);
        const dataUrls = await Promise.all(fileArr.map(readFile));
        setImages(prev => {
            const next = [...prev];
            let inserted = 0;
            for (let i = 0; i < next.length && inserted < dataUrls.length; i++) {
                if (!next[i]) { next[i] = dataUrls[inserted++]; }
            }
            return next;
        });
        setError('');
    };

    /* ── submit ──────────────────────────────── */
    const handleSubmit = async () => {
        if (!allFilled) { setError('Please fill all 5 photo slots before submitting.'); return; }
        setLoading(true);
        setError('');
        try {
            await mockEnrollFace(studentId, images);
            setSuccess(true);
            setTimeout(() => navigate('/student'), 2500);
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    /* ─── Success overlay ─────────────────────────────────────────────── */
    if (success) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7b1c1c 0%, #2d0a0a 100%)',
                flexDirection: 'column', gap: '20px', padding: '32px',
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 1.2s ease-in-out infinite',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Face Profile Registered</h2>
                    <p style={{ marginTop: '8px', opacity: 0.75, fontSize: '14px' }}>
                        Your 5 photos have been enrolled successfully.
                    </p>
                    <p style={{ marginTop: '4px', opacity: 0.55, fontSize: '12px' }}>
                        Redirecting to dashboard…
                    </p>
                </div>
            </div>
        );
    }

    /* ─── Main page ───────────────────────────────────────────────────── */
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #f7f7f5 0%, #ede8e4 100%)',
            display: 'flex', flexDirection: 'column',
            fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
        }}>
            {/* ── Header ── */}
            <header style={{
                background: '#7b1c1c',
                color: '#fff',
                padding: '18px 20px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FaceIcon />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                        Face Enrollment
                    </h1>
                    <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                        Student ID: {studentId}
                    </p>
                </div>
            </header>

            {/* ── Progress bar ── */}
            <div style={{ height: '4px', background: '#e2e2de' }}>
                <div style={{
                    height: '100%', width: `${(filledCount / REQUIRED_IMAGES) * 100}%`,
                    background: 'linear-gradient(90deg, #7b1c1c, #c0392b)',
                    transition: 'width 0.3s ease',
                    borderRadius: '0 2px 2px 0',
                }}/>
            </div>

            {/* ── Content ── */}
            <main style={{ flex: 1, padding: '24px 20px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>

                {/* Instructions */}
                <div style={{
                    background: '#fff',
                    borderRadius: '14px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid #e2e2de',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: filledCount === 5 ? '#22c55e' : '#7b1c1c',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 800, transition: 'background 0.3s',
                        }}>
                            {filledCount < 5 ? filledCount : '✓'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a18' }}>
                            {filledCount < 5
                                ? `${filledCount} of ${REQUIRED_IMAGES} photos added`
                                : 'All 5 photos ready — submit when ready!'}
                        </span>
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#6b6b66', fontSize: '12px', lineHeight: 1.8 }}>
                        <li>Face the camera directly with good lighting</li>
                        <li>Remove glasses or hats for at least 3 shots</li>
                        <li>Use different slight angles for better accuracy</li>
                    </ul>
                </div>

                {/* Bulk upload shortcut */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e2de' }}/>
                    <button
                        onClick={() => !loading && bulkInputRef.current?.click()}
                        style={{
                            padding: '7px 16px',
                            background: '#fff',
                            border: '1px solid #c8c8c2',
                            borderRadius: '20px',
                            fontSize: '11px', fontWeight: 700,
                            color: '#6b6b66', cursor: 'pointer',
                            letterSpacing: '0.05em',
                        }}
                    >
                        + ADD MULTIPLE PHOTOS
                    </button>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e2de' }}/>
                    <input
                        ref={bulkInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleBulkFiles(e.target.files)}
                    />
                </div>

                {/* Photo grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '28px',
                }}>
                    {images.map((img, i) => (
                        <PhotoSlot
                            key={i}
                            index={i}
                            image={img}
                            loading={loading}
                            onDelete={() => handleDelete(i)}
                            onReplace={(file) => handleReplace(i, file)}
                        />
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: '10px', padding: '12px 14px',
                        marginBottom: '16px', color: '#b91c1c',
                        fontSize: '13px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={!allFilled || loading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '14px',
                        border: 'none',
                        background: allFilled && !loading
                            ? 'linear-gradient(135deg, #7b1c1c, #c0392b)'
                            : '#e2e2de',
                        color: allFilled && !loading ? '#fff' : '#9a9a94',
                        fontSize: '14px', fontWeight: 800,
                        letterSpacing: '0.06em',
                        cursor: allFilled && !loading ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: allFilled && !loading ? '0 4px 20px rgba(123,28,28,0.3)' : 'none',
                    }}
                >
                    {loading ? (
                        <>
                            <Spinner />
                            REGISTERING FACE PROFILE…
                        </>
                    ) : (
                        'SUBMIT FACE PROFILE'
                    )}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#9a9a94', marginTop: '16px' }}>
                    Photos are processed securely and never shared
                </p>
            </main>

            <style>{`
                .slot-overlay:hover { background: rgba(0,0,0,0.45) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
            `}</style>
        </div>
    );
}

function Spinner() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
        </svg>
    );
}
