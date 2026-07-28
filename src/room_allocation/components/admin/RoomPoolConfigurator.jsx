/**
 * RoomPoolConfigurator.jsx
 *
 * Allows the admin to build a room pool for a given FROM hostel.
 * Multiple TO hostels can be selected, and within each hostel the admin
 * can pick specific rooms or select all at once.
 *
 * Data layer:
 *   - useQuery(adminKeys.hostelsWithRooms()) → all hostels + rooms
 *   - useQuery(adminKeys.pool(fromHostelId)) → existing pool for this source
 *   - useMutation(useSetAllocationPool)      → save new pool
 *
 * Props:
 *   fromHostelId  — UUID of the source (FROM) hostel
 *   eventId        — UUID of the event
 *   onSaved(result) — callback after a successful save
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminKeys } from '../../hooks/queryKeys.js';
import { getHostelsWithRooms, getEventPool, setEventRooms } from '../../api/admin.api.js';

// ─── Main component ───────────────────────────────────────────────────────────

export default function RoomPoolConfigurator({ eventId, onSaved }) {
    const [pool, setPool]                 = useState({});   // { hostelId: Set<roomId> }
    const [expandedHostel, setExpandedHostel] = useState(null);

    // ── Queries ───────────────────────────────────────────────────────────────
    const {
        data: allHostels = [],
        isLoading: loadingHostels,
        error: hostelsError,
    } = useQuery({
        queryKey: adminKeys.hostelsWithRooms(),
        queryFn:  getHostelsWithRooms,
        staleTime: 5 * 60_000,   // 5 min — room list rarely changes mid-session
    });

    const {
        data: existingPool,
        isLoading: loadingPool,
    } = useQuery({
        queryKey: adminKeys.pool(eventId),
        queryFn:  () => getEventPool(eventId),
        enabled:  !!eventId,
        staleTime: 30_000,
    });

    // ── Populate pool from fetched existing config ────────────────────────────
    useEffect(() => {
        if (!existingPool?.hostels?.length) {
            setPool({});
            return;
        }
        const rebuilt = {};
        for (const h of existingPool.hostels) {
            rebuilt[h.hostelId] = new Set(h.rooms.map(r => r.id));
        }
        setPool(rebuilt);
    }, [existingPool, eventId]);

    // ── Mutation ──────────────────────────────────────────────────────────────
    const { mutate: savePool, isPending: saving, error: saveError } = useMutation({
        mutationFn: (payload) => setEventRooms(eventId, payload),
        onSuccess: onSaved,
    });

    // ── Derived stats ─────────────────────────────────────────────────────────
    const totalSelectedRooms = useMemo(
        () => Object.values(pool).reduce((acc, s) => acc + s.size, 0),
        [pool]
    );
    const selectedHostelCount = useMemo(
        () => Object.values(pool).filter(s => s.size > 0).length,
        [pool]
    );

    // ── Toggle helpers ────────────────────────────────────────────────────────
    const toggleHostel = useCallback((hostelId, rooms) => {
        setPool(prev => {
            const next = { ...prev };
            const existing = next[hostelId];
            if (existing && existing.size === rooms.length) {
                delete next[hostelId];
            } else {
                next[hostelId] = new Set(rooms.map(r => r.id));
            }
            return next;
        });
    }, []);

    const toggleRoom = useCallback((hostelId, roomId) => {
        setPool(prev => {
            const next = { ...prev };
            const s = new Set(next[hostelId] ?? []);
            if (s.has(roomId)) {
                s.delete(roomId);
                if (s.size === 0) delete next[hostelId];
                else next[hostelId] = s;
            } else {
                s.add(roomId);
                next[hostelId] = s;
            }
            return next;
        });
    }, []);

    const toggleBlockRooms = useCallback((hostelId, roomsInBlock) => {
        setPool(prev => {
            const next = { ...prev };
            const s = new Set(next[hostelId] ?? []);
            
            // Check if all rooms in this block are already selected
            const allSelected = roomsInBlock.every(r => s.has(r.id));
            
            if (allSelected) {
                // Deselect them all
                for (const r of roomsInBlock) s.delete(r.id);
                if (s.size === 0) delete next[hostelId];
                else next[hostelId] = s;
            } else {
                // Select them all 
                for (const r of roomsInBlock) s.add(r.id);
                next[hostelId] = s;
            }
            return next;
        });
    }, []);

    // ── Save handler ──────────────────────────────────────────────────────────
    const handleSave = () => {
        if (!eventId || totalSelectedRooms === 0) return;
        const hostels = Object.entries(pool)
            .filter(([, s]) => s.size > 0)
            .map(([hostelId, s]) => ({ hostelId, rooms: [...s] }));
        savePool({ hostels });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const loading = loadingHostels || loadingPool;

    if (loading) {
        return (
            <div className="text-[12px] text-text-muted animate-pulse py-4">
                Loading hostels and rooms…
            </div>
        );
    }

    const loadError = hostelsError?.message;
    // For year-based events, ALL hostels are theoretically selectable.
    const toHostels = allHostels;

    return (
        <div className="flex flex-col gap-3">

            {/* Summary pill + save button */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold
                    tracking-wide border transition-colors
                    ${totalSelectedRooms > 0
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-canvas border-border text-text-muted'}`}>
                    <span className="w-2 h-2 rounded-full inline-block"
                        style={{ background: totalSelectedRooms > 0 ? '#6366f1' : '#d1d5db' }} />
                    {totalSelectedRooms > 0
                        ? `${totalSelectedRooms} rooms · ${selectedHostelCount} hostel${selectedHostelCount !== 1 ? 's' : ''}`
                        : 'No rooms selected'}
                </span>

                <button
                    id="save-room-pool-btn"
                    onClick={handleSave}
                    disabled={saving || totalSelectedRooms === 0}
                    className="ml-auto px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white
                        text-[11px] font-bold tracking-widest disabled:opacity-40 transition-colors"
                >
                    {saving ? 'SAVING…' : 'SAVE POOL'}
                </button>
            </div>

            {saveError && (
                <p className="text-[11px] font-semibold text-crimson">{saveError.message}</p>
            )}
            {loadError && (
                <p className="text-[11px] font-semibold text-crimson">{loadError}</p>
            )}

            {/* Hostel list */}
            {toHostels.length === 0 ? (
                <p className="text-[12px] text-text-muted italic">No other hostels found.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {toHostels.map(hostel => {
                        const selectedSet  = pool[hostel.id] ?? new Set();
                        const allSelected  = selectedSet.size === hostel.rooms.length && hostel.rooms.length > 0;
                        const someSelected = selectedSet.size > 0 && !allSelected;
                        const isExpanded   = expandedHostel === hostel.id;

                        return (
                            <div
                                key={hostel.id}
                                className={`border rounded-lg overflow-hidden transition-colors
                                    ${selectedSet.size > 0
                                        ? 'border-indigo-300 bg-indigo-50/40'
                                        : 'border-border bg-card'}`}
                            >
                                {/* Hostel header */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <button
                                        id={`hostel-toggle-${hostel.id}`}
                                        onClick={() => toggleHostel(hostel.id, hostel.rooms)}
                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center
                                            flex-shrink-0 transition-colors
                                            ${allSelected
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : someSelected
                                                    ? 'bg-indigo-300 border-indigo-400'
                                                    : 'bg-white border-border hover:border-indigo-400'}`}
                                        title={allSelected ? 'Deselect all' : 'Select all rooms'}
                                    >
                                        {allSelected && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2"
                                                    strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {someSelected && !allSelected && (
                                            <div className="w-2 h-0.5 bg-white rounded" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-text-primary truncate">
                                            {hostel.name}
                                        </p>
                                        <p className="text-[11px] text-text-muted">
                                            {hostel.rooms.length} rooms
                                            {selectedSet.size > 0 && (
                                                <span className="ml-2 text-indigo-600 font-semibold">
                                                    · {selectedSet.size} selected
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        id={`hostel-expand-${hostel.id}`}
                                        onClick={() => setExpandedHostel(isExpanded ? null : hostel.id)}
                                        className="text-text-muted hover:text-text-primary transition-colors px-1"
                                        title={isExpanded ? 'Collapse' : 'Expand to pick rooms'}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5">
                                            <path d={isExpanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                                        </svg>
                                    </button>
                                </div>

                                {/* Room grid */}
                                {isExpanded && (
                                    <div className="border-t border-border px-4 py-3">
                                        {hostel.rooms.length === 0 ? (
                                            <p className="text-[11px] text-text-muted italic">
                                                No rooms in this hostel.
                                            </p>
                                        ) : (
                                            <RoomGrid
                                                hostelId={hostel.id}
                                                rooms={hostel.rooms}
                                                selectedSet={selectedSet}
                                                onToggle={toggleRoom}
                                                onToggleBlock={toggleBlockRooms}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Room Grid sub-component ──────────────────────────────────────────────────

function RoomGrid({ hostelId, rooms, selectedSet, onToggle, onToggleBlock }) {
    const byBlock = useMemo(() => {
        const map = {};
        for (const r of rooms) {
            const key = r.block ?? '—';
            if (!map[key]) map[key] = [];
            map[key].push(r);
        }
        return map;
    }, [rooms]);

    return (
        <div className="flex flex-col gap-4">
            {Object.entries(byBlock).map(([block, blockRooms]) => {
                const allSelected = blockRooms.every(r => selectedSet.has(r.id));
                const someSelected = blockRooms.some(r => selectedSet.has(r.id));

                return (
                <div key={block}>
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => onToggleBlock(hostelId, blockRooms)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors
                                ${allSelected 
                                    ? 'bg-indigo-600 border-indigo-600' 
                                    : someSelected 
                                        ? 'bg-indigo-300 border-indigo-400' 
                                        : 'bg-white border-border hover:border-indigo-400'}`}
                            title={allSelected ? 'Deselect block' : 'Select block'}
                        >
                            {allSelected && (
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                            {someSelected && !allSelected && (
                                <div className="w-2 h-0.5 bg-white rounded" />
                            )}
                        </button>
                        <p 
                            className="text-[10px] font-bold text-text-muted tracking-widest uppercase cursor-pointer select-none"
                            onClick={() => onToggleBlock(hostelId, blockRooms)}
                        >
                            {block === '—' ? 'No Block' : `Block ${block}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {blockRooms.map(room => {
                            const selected  = selectedSet.has(room.id);
                            const full      = room.current_occupancy >= room.max_capacity;
                            const halfFull  = !full && room.current_occupancy > 0;

                            return (
                                <button
                                    key={room.id}
                                    id={`room-tile-${room.id}`}
                                    onClick={() => onToggle(hostelId, room.id)}
                                    title={`Room ${room.room_number} · ${room.current_occupancy}/${room.max_capacity} beds`}
                                    className={`relative px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold
                                        border transition-all duration-100 select-none
                                        ${selected
                                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                                            : full
                                                ? 'bg-canvas border-border text-text-muted opacity-50 cursor-default'
                                                : halfFull
                                                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:border-indigo-400'
                                                    : 'bg-white border-border text-text-primary hover:border-indigo-400'}`}
                                >
                                    {room.room_number}
                                    {!full && room.current_occupancy > 0 && (
                                        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
                                            ${selected ? 'bg-amber-300' : 'bg-amber-400'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )})}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-1 text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-border bg-white inline-block" />
                    Available
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-amber-300 bg-amber-50 inline-block" />
                    Partially filled
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-indigo-700 bg-indigo-600 inline-block" />
                    Selected
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-border bg-canvas opacity-50 inline-block" />
                    Full
                </span>
            </div>
        </div>
    );
}
