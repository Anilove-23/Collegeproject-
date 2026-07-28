/**
 * face_recognition/VerifyFace.jsx  →  /face/verify
 *
 * Desktop live webcam verification page for Guards.
 * Captures a snapshot, sends it to the real backend API (/api/face-auth/verify),
 * and renders an overlay showing student details + active outpass status.
 */
import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { verifyFaceCapture } from './faceApi';

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
            <div style={cornerStyle({ top: 0, left: 0, borderRight: 'none', borderBottom: 'none', borderRadius: '6px 0 0 0' })}/>
            <div style={cornerStyle({ top: 0, right: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: '0 6px 0 0' })}/>
            <div style={cornerStyle({ bottom: 0, left: 0, borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 6px' })}/>
            <div style={cornerStyle({ bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 6px 0' })}/>

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
function ResultOverlay({ result, errorMsg, onReset }) {
    const matched = result?.matched;
    const student = result?.student;
    const outpass = result?.outpass;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: matched
                ? 'linear-gradient(135deg, rgba(5,40,5,0.92), rgba(20,83,45,0.92))'
                : 'linear-gradient(135deg, rgba(60,5,5,0.92), rgba(123,28,28,0.92))',
            borderRadius: '16px',
            backdropFilter: 'blur(6px)',
            gap: '16px',
            padding: '24px',
            animation: 'fadeIn 0.35s ease',
            overflowY: 'auto',
        }}>
            {/* Status Icon */}
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: matched ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                border: `2px solid ${matched ? '#22c55e' : '#ef4444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
                {matched ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                )}
            </div>

            <div style={{ textAlign: 'center', color: '#fff', width: '100%', maxWidth: '380px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                    {matched ? 'Match Confirmed' : 'Verification Failed'}
                </h2>

                {matched && student && (
                    <div style={{
                        marginTop: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        textAlign: 'left',
                        fontSize: '13px',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>Name:</span>
                            <span style={{ fontWeight: 700 }}>{student.name || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>Roll No:</span>
                            <span style={{ fontWeight: 700 }}>{student.roll_no || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>Match Distance:</span>
                            <span style={{ fontWeight: 700, color: '#86efac' }}>
                                {result.matchScore ? result.matchScore.toFixed(3) : 'N/A'}
                            </span>
                        </div>

                        {/* Outpass Status Badge */}
                        <div style={{
                            marginTop: '6px',
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <span style={{ opacity: 0.7 }}>Active Outpass:</span>
                            <span style={{
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                background: result.hasActiveOutpass ? '#166534' : 'rgba(255,255,255,0.1)',
                                color: result.hasActiveOutpass ? '#4ade80' : '#d1d5db',
                            }}>
                                {result.hasActiveOutpass ? 'APPROVED OUTPASS' : 'NO ACTIVE OUTPASS'}
                            </span>
                        </div>

                        {outpass && (
                            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', lineHeight: 1.4 }}>
                                Destination: {outpass.destination} | Reason: {outpass.reason}
                            </div>
                        )}
                    </div>
                )}

                {!matched && (
                    <p style={{ marginTop: '10px', opacity: 0.8, fontSize: '13px', margin: '10px 0 0 0' }}>
                        {errorMsg || 'No face match found. Ensure proper lighting and face the camera directly.'}
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
                    background: 'rgba(255,255,255,0.15)',
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

const WEBCAM_CONSTRAINTS = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
};

export default function VerifyFace() {
    // AUTH GUARD: Ensure user is logged in as GUARD
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // COMMENTED OUT FOR DEVELOPMENT: Allow anyone to access the scanner
    /*
    if (!token || !role || role.toUpperCase() !== 'GUARD') {
        return (
            <div style={{ padding: 60, textAlign: 'center', fontFamily: 'sans-serif', background: '#fef2f2', height: '100vh' }}>
                <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                <p>Only Hostel Guards are authorized to access the Face Verification scanner.</p>
                <button 
                    onClick={() => window.location.href = '/signin'}
                    style={{ padding: '10px 20px', marginTop: 15, background: '#7b1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Switch to Guard Account
                </button>
            </div>
        );
    }
    */

    const webcamRef = useRef(null);
    const [scanning, setScanning]                 = useState(false);
    const [result, setResult]                     = useState(null);
    const [errorMsg, setErrorMsg]                 = useState('');
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [cameraKey, setCameraKey]               = useState(0);

    /* ── helper to convert Data URI to Blob ── */
    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    /* ── scan handler ─────────────────────────────────────────────────── */
    const handleScan = useCallback(async () => {
        if (scanning || result) return;
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;

        setScanning(true);
        setErrorMsg('');
        try {
            const blob = dataURItoBlob(screenshot);
            const res = await verifyFaceCapture(blob);
            setResult(res);
        } catch (err) {
            setResult({ matched: false });
            setErrorMsg(err.message || 'Verification failed. Please try again.');
        } finally {
            setScanning(false);
        }
    }, [scanning, result]);

    /* ── reset ────────────────────────────────────────────────────────── */
    const handleReset = useCallback(() => {
        setResult(null);
        setErrorMsg('');
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
            {/* Header */}
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
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Guard Face Verification</h1>
                    <p style={{ margin: 0, fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                        Live student identity & outpass scanner
                    </p>
                </div>

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

            {/* Main content */}
            <main style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '32px 24px', gap: '24px',
            }}>

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

                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)',
                                pointerEvents: 'none',
                            }}/>

                            <div style={{
                                position: 'absolute',
                                top: '15%', left: '25%',
                                right: '25%', bottom: '10%',
                                pointerEvents: 'none',
                            }}>
                                <ScanFrame scanning={scanning} />
                            </div>

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
                                {scanning ? 'SEARCHING ENROLLED FACES…' : 'POSITION STUDENT FACE IN FRAME'}
                            </div>

                            {result && (
                                <ResultOverlay result={result} errorMsg={errorMsg} onReset={handleReset} />
                            )}
                        </>
                    )}
                </div>

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
                            <><ScanIcon /> VERIFY FACE</>
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
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes spin { to { transform: rotate(360deg); } }
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
