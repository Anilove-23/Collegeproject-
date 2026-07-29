import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AllocationLayout from '../layouts/AllocationLayout';
import { useActiveBatch } from '../hooks/useActiveBatch';
import { useRoundState } from '../hooks/useRoundState';
import { useCountdown } from '../hooks/useCountdown';
import { getBatches } from '../api/allocation.api';
import LoadingScreen from '../components/shared/LoadingScreen';

/* ─── System phase definitions ───────────────────────────────── */
const SYSTEM_PHASES = [
  {
    key:   'ADMIN_MODE',
    label: 'Pre-Registration',
    desc:  'Hostel admin configures allocation schedule.',
  },
  {
    key:   'LOBBY',
    label: 'Squad Formation',
    desc:  'Form or join a squad of 1–4 members.',
  },
  {
    key:   'SOFT_LOCK',
    label: 'Squads Locked',
    desc:  'No member changes. Batches are generated.',
  },
  {
    key:   'LIVE_BATCHES',
    label: 'Live Allocation',
    desc:  'Each batch gets a timed selection window.',
  },
  {
    key:   'FINAL_SWEEP',
    label: 'Final Sweep',
    desc:  'Remaining rooms filled. Results published.',
  },
];

const PHASE_ORDER = SYSTEM_PHASES.map(p => p.key);

/* ─── System phase stepper ───────────────────────────────────── */
function SystemPhaseStepper({ currentPhase, batches, myBatchNumber }) {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase ?? 'ADMIN_MODE');

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">ALLOCATION LIFECYCLE</p>
      </div>
      <div className="flex flex-col">
        {SYSTEM_PHASES.map((phase, idx) => {
          const isPast    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture  = idx > currentIdx;

          return (
            <div
              key={phase.key}
              className={[
                'flex items-start gap-3.5 px-5 py-4 border-b border-border last:border-0 relative',
                isCurrent ? 'bg-canvas' : '',
              ].join(' ')}
            >
              {/* Vertical connector line */}
              {idx < SYSTEM_PHASES.length - 1 && (
                <div className={`absolute left-[26px] top-[36px] w-px h-[calc(100%-20px)] ${isPast ? 'bg-crimson' : 'bg-border'}`} />
              )}

              {/* Dot */}
              <div className="shrink-0 mt-0.5 z-10">
                {isPast ? (
                  <div className="w-3 h-3 rounded-full bg-crimson flex items-center justify-center">
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                      <polyline points="1.5,5.5 4,8 8.5,2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-crimson shadow-[0_0_0_3px_rgba(123,28,28,0.12)] animate-pulse" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-border-dark opacity-40" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[12.5px] font-bold ${isFuture ? 'text-text-muted' : 'text-text-primary'}`}>
                    {phase.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[9px] font-bold tracking-[0.08em] px-1.5 py-0.5 bg-crimson text-white rounded">
                      NOW
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[9px] font-bold tracking-[0.08em] px-1.5 py-0.5 bg-canvas border border-border text-text-muted rounded">
                      DONE
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 ${isFuture ? 'text-text-muted opacity-60' : 'text-text-secondary'}`}>
                  {phase.desc}
                </p>

                {/* Batch sub-list inside LIVE_BATCHES step */}
                {phase.key === 'LIVE_BATCHES' && !isFuture && batches.length > 0 && (
                  <div className="mt-2.5 flex flex-col gap-1">
                    {batches.map(batch => {
                      const isMine      = batch.batch_number === myBatchNumber;
                      const isLive      = batch.status === 'ACTIVE';
                      const isDone      = batch.status === 'COMPLETED' || batch.status === 'EVALUATING';
                      const startTime   = batch.start_time
                        ? new Date(batch.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null;

                      return (
                        <div
                          key={batch.batch_id ?? batch.id}
                          className={[
                            'flex items-center justify-between px-3 py-1.5 rounded border text-[11px]',
                            isMine   ? 'border-crimson bg-canvas font-semibold' : 'border-border bg-transparent',
                            isDone   ? 'opacity-45' : '',
                          ].join(' ')}
                        >
                          <span className={isDone ? 'line-through text-text-muted' : 'text-text-primary'}>
                            Batch #{batch.batch_number}{isMine ? ' · You' : ''}
                          </span>
                          {isLive && (
                            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-crimson text-white rounded">
                              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />LIVE
                            </span>
                          )}
                          {isDone && <span className="text-[9px] font-bold text-text-muted">DONE</span>}
                          {!isLive && !isDone && startTime && (
                            <span className="text-text-muted tabular-nums">{startTime}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─── Page ───────────────────────────────────────────────────── */
export default function WaitingRoomPage() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  const { data: state, isLoading: loading } = useActiveBatch(studentId);

  // Use TanStack Query for batches instead of useEffect
  const { data: batchesData } = useQuery({
    queryKey: ['batches', state?.eventId],
    queryFn: () => getBatches(state?.eventId),
    enabled: !!state?.eventId,
    staleTime: 30_000,
    select: (res) => res.batches || res.result || [],
  });
  
  const batches = batchesData || [];

  const countdown   = useCountdown(state?.batchStartTime ?? null);
  const roundState  = useRoundState(state);          // socket-first, DB fallback
  const roundTimer  = useCountdown(roundState?.roundEndsAt ?? null);
  const totalRounds = 3; // fixed 3 rounds per batch
  const currentRound = roundState?.roundNumber ?? null;

  if (loading || !state) return <LoadingScreen label="Checking Waiting Room..." />;

  const myBatchId = state.batchId || state.batchNumber;

  // Status chip data — always use batchNumber (integer), never batchId (UUID)
  const statusChips = [
    ['SYSTEM PHASE', state.phase?.replace(/_/g, ' ') ?? '—'],
    ['YOUR BATCH',   state.batchNumber ? `#${state.batchNumber}` : 'TBD'],
    ['SQUAD STATUS', state.groupStatus ?? '—'],
  ];

  return (
    <AllocationLayout phase="Timeline" batch={state.batchNumber ? `Batch ${state.batchNumber}` : 'Batch TBD'} hostelId={state.hostelId}>
      <div className="flex flex-col gap-5">

        {/* Countdown card — only during SOFT_LOCK / LIVE_BATCHES */}
        {(state.phase === 'SOFT_LOCK' || state.phase === 'LIVE_BATCHES') && (
          <div className="bg-card border border-border rounded shadow-sm px-8 py-7 flex flex-col items-center text-center">
            {state.batchActive ? (
              /* ── Batch is LIVE: show round info + round countdown ── */
              <>
                {/* Round indicator pills */}
                <div className="flex items-center gap-2 mb-5">
                  {Array.from({ length: totalRounds }, (_, i) => i + 1).map(r => {
                    const isDone    = r < (currentRound ?? 1);
                    const isCurrent = r === (currentRound ?? 1);
                    return (
                      <div
                        key={r}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border transition-all ${
                          isCurrent
                            ? 'bg-crimson text-white border-crimson scale-110 shadow-md'
                            : isDone
                            ? 'bg-canvas border-border text-text-muted line-through opacity-50'
                            : 'bg-canvas border-border text-text-muted opacity-30'
                        }`}
                      >
                        {r}
                      </div>
                    );
                  })}
                </div>

                {/* Active round label */}
                <p className="text-[11px] font-bold tracking-[0.1em] text-text-muted mb-1">
                  ROUND {currentRound ?? '—'} OF {totalRounds} — TIME REMAINING
                </p>

                {/* Round countdown */}
                <p className="text-[52px] font-black tracking-[-0.02em] text-crimson leading-none tabular-nums mb-1">
                  {roundTimer}
                </p>

                {roundState?.source === 'derived' && (
                  <p className="text-[10px] text-text-muted opacity-60 mb-1">approx. — waiting for server sync</p>
                )}

                {/* Batch-level end time */}
                {state.batchEndTime && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Batch ends at{' '}
                    <span className="font-bold text-text-secondary">
                      {new Date(state.batchEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}

                <button
                  onClick={() => navigate('/allocation/preferences')}
                  className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-crimson text-white text-[11px] font-bold tracking-[0.1em] rounded border-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  GO TO PREFERENCES <ArrowRight />
                </button>
              </>
            ) : (
              /* ── Batch not yet live: show batch start countdown ── */
              <>
                <p className="text-[11px] font-bold tracking-[0.1em] text-text-muted mb-2">
                  {state.batchNumber
                    ? `TIME UNTIL BATCH #${state.batchNumber} BEGINS`
                    : 'WAITING FOR BATCH SCHEDULE'}
                </p>
                <p className="text-[52px] font-black tracking-[-0.02em] text-crimson leading-none tabular-nums mb-1">
                  {countdown}
                </p>
              </>
            )}
          </div>
        )}

        {/* Status chips */}
        <div className="grid grid-cols-3 gap-3">
          {statusChips.map(([label, value]) => (
            <div key={label} className="bg-card border border-border rounded shadow-sm px-4 py-4 flex flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.1em] text-text-muted">{label}</span>
              <span className="text-base font-extrabold text-text-primary tracking-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* 2-column layout: stepper (left) + global queue (right) */}
        <div className="grid grid-cols-[1fr_268px] gap-5 items-start">

          {/* LEFT — system phase stepper */}
          <SystemPhaseStepper
            currentPhase={state.phase}
            batches={batches}
            myBatchNumber={state.batchNumber}
          />

          {/* RIGHT — Global Queue */}
          <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">GLOBAL QUEUE</p>
              <p className="text-[11px] text-text-muted mt-0.5">All batches for this allocation cycle</p>
            </div>

            <div className="flex flex-col max-h-[520px] overflow-y-auto">
              {batches.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-center px-4">
                  <svg className="text-text-muted opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                  <p className="text-[12px] text-text-muted">Batches are generated when Soft Lock begins.</p>
                </div>
              ) : (
                batches.map((batch) => {
                  const isMine  = batch.batch_number === state.batchNumber;
                  const isLive  = batch.status === 'ACTIVE';
                  // EVALUATING treated same as COMPLETED — no separate display needed
                  const isDone  = batch.status === 'COMPLETED' || batch.status === 'EVALUATING';
                  const isPending = batch.status === 'PENDING';

                  const startTime = batch.start_time
                    ? new Date(batch.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : null;
                  const startDate = batch.start_time
                    ? new Date(batch.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : null;

                  return (
                    <div
                      key={batch.id ?? batch.batch_id}
                      className={[
                        'flex items-center justify-between px-4 py-3 border-b border-border last:border-0 transition-colors',
                        isDone  ? 'opacity-45' : '',
                        isMine  ? 'bg-canvas' : '',
                      ].join(' ')}
                    >
                      {/* Left: batch number + "You" label */}
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[13px] font-bold ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          Batch #{batch.batch_number}
                          {isMine && (
                            <span className="ml-1.5 text-[9px] font-bold tracking-[0.06em] px-1.5 py-0.5 bg-crimson text-white rounded">
                              YOU
                            </span>
                          )}
                        </span>
                        {/* Start time sub-label */}
                        {startTime && (
                          <span className="text-[10.5px] text-text-muted tabular-nums">
                            {startDate} · {startTime}
                          </span>
                        )}
                      </div>

                      {/* Right: status badge */}
                      {isLive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-[0.06em] px-2 py-0.5 bg-crimson text-white rounded shrink-0">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse shrink-0" />
                          LIVE
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[9px] font-bold tracking-[0.06em] px-2 py-0.5 bg-canvas border border-border text-text-muted rounded shrink-0">
                          DONE
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[9px] font-bold tracking-[0.06em] px-2 py-0.5 bg-canvas border border-border text-text-muted rounded shrink-0">
                          PENDING
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </AllocationLayout>
  );
}
