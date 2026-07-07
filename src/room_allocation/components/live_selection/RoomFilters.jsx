const STATUS = ['All Rooms', 'Available Only'];

/** Filter bar for the room grid */
export default function RoomFilters({ filters, onChange, availableTypes = [], availableBlocks = [] }) {
  const TYPES  = ['All Types', ...availableTypes];
  const BLOCKS = ['All Blocks', ...availableBlocks];
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
        <input 
          type="text" 
          placeholder="Search Room No..." 
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="text-[12px] font-semibold text-text-primary bg-card border border-border rounded pl-8 pr-3 py-2 w-full sm:w-[150px] focus:outline-none focus:border-crimson transition-colors"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      {[
        { key: 'type',   options: TYPES  },
        { key: 'block',  options: BLOCKS },
        { key: 'status', options: STATUS },
      ].map(({ key, options }) => (
        <select
          key={key}
          value={filters[key]}
          onChange={e => set(key, e.target.value)}
          className="text-[12px] font-semibold text-text-primary bg-card border border-border rounded px-3 py-2 cursor-pointer focus:outline-none focus:border-crimson transition-colors"
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ))}

      <button
        onClick={() => onChange({ type: 'All Types', block: 'All Blocks', status: 'All Rooms', search: '' })}
        className="text-[11px] font-bold text-text-muted hover:text-text-primary tracking-[0.04em] border-0 bg-transparent cursor-pointer px-2 py-2 transition-colors"
      >
        RESET
      </button>
    </div>
  );
}
