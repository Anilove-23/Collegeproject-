import { formatCgpa } from '../../utils/formatters';

/** List of roommates after allocation is finalised */
export default function RoommateList({ roommates = [] }) {
  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">YOUR ROOMMATES</p>
      </div>
      <div className="flex flex-col">
        {roommates.map(m => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
            <div className="w-9 h-9 rounded bg-text-secondary text-white text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
              {m.initials}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-text-primary">{m.name}</p>
              <p className="text-[11px] text-text-muted">{m.batch} · CGPA {formatCgpa(m.cgpa)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
