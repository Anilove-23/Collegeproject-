/**
 * face_recognition/VerifyFace.jsx  →  /face/verify
 *
 * Desktop live webcam verification page.
 * Captures a snapshot, sends it to the mock API, and shows a match/fail overlay.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { mockVerifyFace } from './mockApi';

/* ─── Icons ───────────────────────────────────────────────────────────── */
const ShieldIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

const ScanIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
);

/* ─── Scanning corner frame overlay ───────────────────────────────────── */
function ScanFrame({ scanning }) {
    const cornerStyle = (pos) => ({
        position: 'absolute',
        width: '36px', height: '36px',
        border: `3px solid ${scanning ? '#f59e0b' : 'rgba(255,255,255,0.85)'}`,
        transition: 'border-color 0.3s',
        ...pos,
    });

    return (
        <>
            {/* Top-left */}
            <div style={cornerStyle({ top: 0, left: 0, borderRight: 'none', borderBottom: 'none', borderRadius: '6px 0 0 0' })}/>
            {/* Top-right */}
            <div style={cornerStyle({ top: 0, right: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: '0 6px 0 0' })}/>
            {/* Bottom-left */}
            <div style={cornerStyle({ bottom: 0, left: 0, borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 6px' })}/>
            {/* Bottom-right */}
            <div style={cornerStyle({ bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 6px 0' })}/>

            {/* Scanning laser line */}
            {scanning && (
                <div style={{
                    position: 'absolute', left: '12px', right: '12px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                    boxShadow: '0 0 12px 2px rgba(245,158,11,0.6)',
                    animation: 'scanLine 1.2s ease-in-out infinite',
                }}/>
            )}
        </>
    );
}

/* ─── Result Overlay ──────────────────────────────────────────────────── */
function ResultOverlay({ result, onReset }) {
    const matched = result?.match;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: matched
                ? 'linear-gradient(135deg, rgba(5,40,5,0.88), rgba(20,83,45,0.88))'
                : 'linear-gradient(135deg, rgba(60,5,5,0.88), rgba(123,28,28,0.88))',
            borderRadius: '16px',
            backdropFilter: 'blur(4px)',
            gap: '16px',
            padding: '32px',
            animation: 'fadeIn 0.35s ease',
        }}>
            {/* Icon circle */}
            <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: matched ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                border: `2px solid ${matched ? '#22c55e' : '#ef4444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
                {matched ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                )}
            </div>

            <div style={{ textAlign: 'center', color: '#fff' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                    {matched ? 'Match Confirmed' : 'Verification Failed'}
                </h2>

                {matched && result && (
                    <div style={{
                        marginTop: '14px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '12px 20px',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '13px' }}>
                            <span style={{ opacity: 0.7 }}>Student ID</span>
                            <span style={{ fontWeight: 700 }}>{result.studentId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '13px' }}>
                            <span style={{ opacity: 0.7 }}>Confidence</span>
                            <span style={{
                                fontWeight: 700,
                                color: result.confidence >= 0.9 ? '#86efac' : '#fde68a',
                            }}>
                                {(result.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                )}

                {!matched && (
                    <p style={{ marginTop: '10px', opacity: 0.7, fontSize: '13px', maxWidth: '240px' }}>
                        No face match found. Ensure proper lighting and face the camera directly.
                    </p>
                )}
            </div>

            <button
                onClick={onReset}
                style={{
                    marginTop: '4px',
                    padding: '10px 28px',
                    borderRadius: '24px',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'background 0.2s',
                }}
            >
                <RefreshIcon />
                {matched ? 'SCAN AGAIN' : 'TRY AGAIN'}
            </button>
        </div>
    );
}

/* ─── Permission Denied State ─────────────────────────────────────────── */
function CameraPermissionDenied({ onRetry }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px', padding: '48px 24px',
            textAlign: 'center',
        }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#fef2f2', border: '2px solid #fca5a5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#b91c1c" strokeWidth="2"/>
                </svg>
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a18' }}>Camera Access Denied</h3>
                <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b6b66', maxWidth: '300px' }}>
                    Please allow camera access in your browser settings, then click Retry.
                </p>
                <ol style={{ textAlign: 'left', marginTop: '12px', paddingLeft: '20px', fontSize: '12px', color: '#6b6b66', lineHeight: 1.9 }}>
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Always allow" for this site</li>
                    <li>Reload or click Retry below</li>
                </ol>
            </div>
            <button
                onClick={onRetry}
                style={{
                    padding: '10px 28px',
                    background: '#7b1c1c', color: '#fff',
                    border: 'none', borderRadius: '24px',
                    fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}
            >
                <RefreshIcon /> RETRY
            </button>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────────────── */
const WEBCAM_CONSTRAINTS = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
};

export default function VerifyFace() {
    const webcamRef = useRef(null);
    const [scanning, setScanning]           = useState(false);
    const [result, setResult]               = useState(null);   // null | { match, studentId, confidence }
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [cameraKey, setCameraKey]         = useState(0);      // increment to force re-mount

    /* ── scan handler ─────────────────────────────────────────────────── */
    const handleScan = useCallback(async () => {
        if (scanning || result) return;
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;
        setScanning(true);
        try {
            const res = await mockVerifyFace(screenshot);
            setResult(res);
        } catch {
            setResult({ match: false, studentId: null, confidence: 0 });
        } finally {
            setScanning(false);
        }
    }, [scanning, result]);

    /* ── reset ────────────────────────────────────────────────────────── */
    const handleReset = useCallback(() => {
        setResult(null);
        setScanning(false);
    }, []);

    /* ── retry camera ─────────────────────────────────────────────────── */
    const handleRetryCamera = useCallback(() => {
        setPermissionDenied(false);
        setCameraKey(k => k + 1);
    }, []);

    /* ─── Render ──────────────────────────────────────────────────────── */
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a18 100%)',
            display: 'flex', flexDirection: 'column',
            fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
            color: '#fff',
        }}>
            {/* ── Header ── */}
            <header style={{
                padding: '18px 24px',
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(123,28,28,0.6)', border: '1px solid rgba(123,28,28,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ShieldIcon />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Face Verification</h1>
                    <p style={{ margin: 0, fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                        Live webcam identity check
                    </p>
                </div>

                {/* Live indicator */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: permissionDenied ? '#ef4444' : '#22c55e',
                        boxShadow: permissionDenied ? 'none' : '0 0 8px rgba(34,197,94,0.8)',
                        animation: permissionDenied ? 'none' : 'pulse 1.5s ease-in-out infinite',
                    }}/>
                    <span style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.06em', fontWeight: 700 }}>
                        {permissionDenied ? 'NO CAMERA' : 'LIVE'}
                    </span>
                </div>
            </header>

            {/* ── Main content ── */}
            <main style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '32px 24px', gap: '24px',
            }}>

                {/* Camera viewport card */}
                <div style={{
                    position: 'relative',
                    width: '100%', maxWidth: '640px',
                    aspectRatio: '16/9',
                    borderRadius: '16px', overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
                }}>
                    {permissionDenied ? (
                        <div style={{ background: '#0d0d0d', height: '100%', display: 'flex' }}>
                            <CameraPermissionDenied onRetry={handleRetryCamera} />
                        </div>
                    ) : (
                        <>
                            <Webcam
                                key={cameraKey}
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                screenshotQuality={0.92}
                                videoConstraints={WEBCAM_CONSTRAINTS}
                                mirrored
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onUserMediaError={(err) => {
                                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                                        setPermissionDenied(true);
                                    }
                                }}
                            />

                            {/* Dark vignette */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)',
                                pointerEvents: 'none',
                            }}/>

                            {/* Scan frame overlay */}
                            <div style={{
                                position: 'absolute',
                                top: '15%', left: '25%',
                                right: '25%', bottom: '10%',
                                pointerEvents: 'none',
                            }}>
                                <ScanFrame scanning={scanning} />
                            </div>

                            {/* Status label */}
                            <div style={{
                                position: 'absolute', bottom: '12px', left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '20px',
                                padding: '5px 14px',
                                fontSize: '11px', fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: scanning ? '#f59e0b' : 'rgba(255,255,255,0.7)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                whiteSpace: 'nowrap',
                            }}>
                                {scanning && <Spinner size={12} />}
                                {scanning ? 'ANALYZING FACE…' : 'POSITION YOUR FACE IN THE FRAME'}
                            </div>

                            {/* Result overlay */}
                            {result && (
                                <ResultOverlay result={result} onReset={handleReset} />
                            )}
                        </>
                    )}
                </div>

                {/* Instruction row */}
                {!permissionDenied && !result && (
                    <div style={{
                        display: 'flex', gap: '12px', flexWrap: 'wrap',
                        justifyContent: 'center', maxWidth: '640px',
                    }}>
                        {[
                            { icon: '☀️', text: 'Good lighting' },
                            { icon: '👤', text: 'Face camera directly' },
                            { icon: '📏', text: 'Stay 30–60 cm away' },
                        ].map(({ icon, text }) => (
                            <div key={text} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: '20px', padding: '6px 14px',
                                fontSize: '12px', color: 'rgba(255,255,255,0.65)',
                            }}>
                                <span>{icon}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Scan button */}
                {!permissionDenied && !result && (
                    <button
                        id="scan-face-btn"
                        onClick={handleScan}
                        disabled={scanning}
                        style={{
                            padding: '16px 48px',
                            borderRadius: '50px',
                            border: 'none',
                            background: scanning
                                ? 'rgba(255,255,255,0.1)'
                                : 'linear-gradient(135deg, #7b1c1c, #c0392b)',
                            color: '#fff',
                            fontSize: '15px', fontWeight: 800,
                            letterSpacing: '0.08em',
                            cursor: scanning ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: scanning ? 'none' : '0 4px 32px rgba(123,28,28,0.5)',
                            transition: 'all 0.2s',
                            minWidth: '220px', justifyContent: 'center',
                        }}
                    >
                        {scanning ? (
                            <><Spinner size={18} /> SCANNING…</>
                        ) : (
                            <><ScanIcon /> SCAN FACE</>
                        )}
                    </button>
                )}
            </main>

            <style>{`
                @keyframes scanLine {
                    0%   { top: 12px; opacity: 0.9; }
                    50%  { top: calc(100% - 12px); opacity: 1; }
                    100% { top: 12px; opacity: 0.9; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.4; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function Spinner({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
        </svg>
    );
}
