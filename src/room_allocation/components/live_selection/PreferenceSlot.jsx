const UpIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
const DownIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const XIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/** Single preference row in the cart */
export default function PreferenceSlot({ rank, room, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-canvas rounded border border-border group">
      <span className="w-4 h-4 rounded-full bg-crimson text-white text-[9px] font-black flex items-center justify-center shrink-0">
        {rank}
      </span>
      <span className="flex-1 text-[11px] font-bold text-text-primary tracking-[0.04em] truncate">{room?.roomNo || 'Unknown'}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button disabled={isFirst}  onClick={onMoveUp}   className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 border-0 bg-transparent cursor-pointer rounded hover:bg-card transition-colors">
          <UpIcon />
        </button>
        <button disabled={isLast}   onClick={onMoveDown} className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 border-0 bg-transparent cursor-pointer rounded hover:bg-card transition-colors">
          <DownIcon />
        </button>
        <button onClick={onRemove} className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-crimson border-0 bg-transparent cursor-pointer rounded hover:bg-card transition-colors">
          <XIcon />
        </button>
      </div>
    </div>
  );
}
