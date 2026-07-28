import { getOccupancyLabel, getAvailabilityColor, isRoomAvailable } from '../../utils/roomHelpers';

/**
 * RoomCard — single room tile in the grid.
 * Props: room, inCart, onToggle, isLeader
 */
export default function RoomCard({ room, inCart, onToggle, isLeader = true }) {
  const available = isRoomAvailable(room);
  const availLabel = getOccupancyLabel(room.total, room.occupied);
  const availColor = getAvailabilityColor(room.total, room.occupied);
  const ratio = room.total > 0 ? room.occupied / room.total : 0;

  const handleClick = () => {
    if (!available || !isLeader) return;
    onToggle(room.id);
  };

  return (
    <div
      onClick={handleClick}
      className={[
        'relative flex flex-col gap-2 p-4 rounded border transition-all duration-150',
        !available
          ? 'opacity-45 cursor-not-allowed bg-canvas border-border'
          : !isLeader
            ? 'cursor-default bg-card border-border'
            : inCart
              ? 'cursor-pointer bg-crimson-muted border-crimson ring-1 ring-crimson'
              : 'cursor-pointer bg-card border-border hover:border-border-dark hover:shadow-sm',
      ].join(' ')}
    >
      {/* Cart badge */}
      {inCart && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-crimson text-white text-[10px] font-black flex items-center justify-center">✓</span>
      )}

      {/* Room number */}
      <p className="text-[20px] font-black tracking-tight text-text-primary leading-none">{room.roomNo}</p>

      {/* Type + Floor */}
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold tracking-[0.06em] px-2 py-0.5 bg-canvas border border-border rounded text-text-secondary">
          {room.type}
        </span>
        <span className="text-[10px] font-bold tracking-[0.06em] px-2 py-0.5 bg-canvas border border-border rounded text-text-secondary">
          FL {room.floor}
        </span>
      </div>

      {/* Occupancy bar */}
      <div className="flex flex-col gap-1">
        <div className="w-full h-1 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ratio >= 1 ? 'bg-red-400' : ratio >= 0.75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <p className={`text-[11px] font-bold ${availColor}`}>{availLabel}</p>
      </div>
    </div>
  );
}
