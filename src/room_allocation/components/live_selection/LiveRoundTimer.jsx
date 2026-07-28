import { useState, useEffect } from 'react';
import { secondsToCountdown } from '../../utils/timers';

/** Sticky top timer bar for the live selection page */
export default function LiveRoundTimer({ round = 1, targetDate = null, isLeader = true }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!targetDate) {
      setSecs(0);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000));
      setSecs(remaining);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const display = secondsToCountdown(secs);
  const isExpired = secs === 0;

  return (
    <div className={`flex items-center justify-between px-6 py-3 border-b border-border ${isExpired ? 'bg-red-600' : 'bg-text-primary'} text-white`}>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] bg-white/15 px-2.5 py-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          ROUND {round} ACTIVE
        </span>
        {isLeader
          ? <span className="text-[11px] text-white/70 font-medium">You are the leader — only you can submit</span>
          : <span className="text-[11px] text-white/70 font-medium">Read-only — leader is making selections</span>
        }
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-white/60 tracking-[0.06em]">TIME REMAINING</span>
        <span className={`text-[28px] font-black tracking-[-0.02em] tabular-nums ${isExpired ? 'text-white animate-pulse' : 'text-white'}`}>
          {display}
        </span>
      </div>
    </div>
  );
}
