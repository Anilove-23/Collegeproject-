/** "2 Beds Left" / "Full" / "1 Bed Left" */
export const getOccupancyLabel = (total, occupied) => {
  const left = total - occupied;
  if (left <= 0) return 'Full';
  return `${left} Bed${left !== 1 ? 's' : ''} Left`;
};

/** 0–1 fill ratio */
export const getOccupancyRatio = (total, occupied) =>
  total > 0 ? Math.min(occupied / total, 1) : 0;

/** Tailwind color class based on availability */
export const getAvailabilityColor = (total, occupied) => {
  const left = total - occupied;
  if (left <= 0)       return 'text-red-500';
  if (left === 1)      return 'text-amber-500';
  return 'text-emerald-600';
};

/** Check if room is available (has beds left) */
export const isRoomAvailable = (room) => room.occupied < room.total;
