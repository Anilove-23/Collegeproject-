import { useState, useEffect } from 'react';

export function useCountdown(targetDate) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => Math.max(0, Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000));
    setSecs(calc());
    const t = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!targetDate || secs === 0) return '--';
  
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  
  return `${hh}:${mm}:${ss}`;
}
