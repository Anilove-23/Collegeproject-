/** Convert total seconds to { hh, mm, ss } parts */
export const secondsToParts = (total) => {
  const t = Math.max(0, total);
  return {
    hh: String(Math.floor(t / 3600)).padStart(2, '0'),
    mm: String(Math.floor((t % 3600) / 60)).padStart(2, '0'),
    ss: String(t % 60).padStart(2, '0'),
  };
};

/** "00:18:32" string from seconds */
export const secondsToCountdown = (total) => {
  const { hh, mm, ss } = secondsToParts(total);
  return `${hh}:${mm}:${ss}`;
};
