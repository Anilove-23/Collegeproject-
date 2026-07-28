import RoomCard from './RoomCard';

/** Maps room array into a responsive grid of RoomCards */
export default function RoomGrid({ rooms = [], isInCart, onToggle, isLeader = true }) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-[14px] font-bold text-text-primary">No rooms match your filters</p>
        <p className="text-[12px] text-text-secondary">Try adjusting the filter options above</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
      {rooms.map(room => (
        <RoomCard
          key={room.id}
          room={room}
          inCart={isInCart(room.id)}
          onToggle={onToggle}
          isLeader={isLeader}
        />
      ))}
    </div>
  );
}
