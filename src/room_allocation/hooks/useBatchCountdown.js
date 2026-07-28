import { useState, useEffect } from 'react';
import { secondsToCountdown } from '../utils/timers';

export function useBatchCountdown(initialSeconds = 0) {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    setSecs(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);

  return {
    seconds: secs,
    display: secondsToCountdown(secs),
    isExpired: secs === 0,
  };
}
