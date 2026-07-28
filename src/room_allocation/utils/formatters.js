/** "#412" from rank integer */
export const formatRank = (n) => `#${n}`;

/** "C-312" normalised uppercase */
export const formatRoomNumber = (r) => String(r).toUpperCase();

/** "May 11, 2026 11:34 PM" */
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/** "9.20" → "9.20" (2 decimal places) */
export const formatCgpa = (n) => Number(n).toFixed(2);

/** Initials from full name */
export const getInitials = (name = '') =>
  name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
