import { formatDateTime } from '../../utils/formatters';

/** Main allocation result card */
export default function AllocationResultCard({ result }) {
  const { room, method, round, batch, allocatedAt } = result;
  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3 bg-canvas">
        <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <p className="text-[15px] font-extrabold text-text-primary">Room Allocated Successfully</p>
          <p className="text-[12px] text-text-secondary">{formatDateTime(allocatedAt)}</p>
        </div>
      </div>

      <div className="px-6 py-5 flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] text-text-muted mb-1">YOUR ROOM</p>
          <p className="text-[48px] font-black tracking-[-0.02em] text-text-primary leading-none">{room.id}</p>
          <p className="text-[13px] text-text-secondary mt-1.5">{room.hostel} · {room.type} · Floor {room.floor}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 shrink-0">
          {[['Method', method], ['Round', `Round ${round}`], ['Batch', batch], ['Block', `Block ${room.block}`]].map(([l, v]) => (
            <div key={l} className="bg-canvas rounded border border-border px-3 py-2.5">
              <p className="text-[10px] font-bold tracking-[0.08em] text-text-muted">{l}</p>
              <p className="text-[13px] font-bold text-text-primary">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
