/**
 * AllocationAdminPage.jsx
 *
 * Admin control panel for the room allocation cycle (Year-Based Architecture):
 *   • Event orchestrator (Select Target Year -> Create/Manage Event)
 *   • Room pool configurator (multi-hostel, per-room selection for the event)
 *   • Rank / CGPA upload panel
 *   • Events status table
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { adminKeys } from '../hooks/queryKeys.js';
import { getEvents, createEvent, updateEventDate } from '../api/admin.api.js';
import RankUpdatePanel from '../components/admin/RankUpdatePanel';
import RoomPoolConfigurator from '../components/admin/RoomPoolConfigurator';

const TARGET_YEARS = [1, 2, 3, 4, 5];

export default function AllocationAdminPage() {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const assignedHostel = user?.hostel || 'Unknown Hostel';

    const [selectedTargetYear, setSelectedTargetYear] = useState(2); // Default to 2nd Year
    const [allocationDateInput, setAllocationDateInput] = useState('');
    const [poolSavedMsg, setPoolSavedMsg] = useState('');
    const [dateSavedMsg, setDateSavedMsg] = useState('');

    // Fetch all events
    const {
        data: events = [],
        isLoading: isLoadingEvents,
        error: eventsError,
    } = useQuery({
        queryKey: adminKeys.events(),
        queryFn: getEvents,
        staleTime: 30_000,
    });

    // Find the event for the currently selected target year
    const currentEvent = useMemo(
        () => events.find(e => e.target_year === selectedTargetYear) ?? null,
        [events, selectedTargetYear]
    );

    // Sync local date input with the current event
    useEffect(() => {
        if (currentEvent?.allocation_date) {
            setAllocationDateInput(String(currentEvent.allocation_date).slice(0, 10));
        } else {
            setAllocationDateInput('');
        }
        setPoolSavedMsg('');
        setDateSavedMsg('');
    }, [currentEvent]);

    // Create Event Mutation
    const { mutate: doCreateEvent, isPending: isCreating } = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.events() });
            setDateSavedMsg('Event created successfully.');
        }
    });

    // Update Date Mutation
    const { mutate: doUpdateDate, isPending: isUpdating } = useMutation({
        mutationFn: ({ eventId, date }) => updateEventDate(eventId, { allocationDate: date }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.events() });
            setDateSavedMsg('Allocation date updated successfully.');
        }
    });

    const handleCreateOrUpdate = () => {
        if (!allocationDateInput) return;
        if (currentEvent) {
            doUpdateDate({ eventId: currentEvent.id, date: allocationDateInput });
        } else {
            doCreateEvent({ targetYear: selectedTargetYear, allocationDate: allocationDateInput });
        }
    };

    const handlePoolSaved = (result) => {
        setPoolSavedMsg(`✅ Pool saved — ${result.poolSize} rooms assigned to Year ${selectedTargetYear}`);
        queryClient.invalidateQueries({ queryKey: adminKeys.events() });
    };

    return (
        <div className="flex flex-col min-h-screen bg-canvas overflow-y-auto">
            {/* WARDEN DASHBOARD NAVBAR */}
            <header className="bg-[#6d0f16] text-white px-8 py-4 shadow-md flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight">
                        Warden Dashboard
                    </h1>
                    <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                        <span>📍 Assigned Hostel:</span>
                        <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md font-semibold">
                            {assignedHostel}
                        </strong>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/wardenhostel')}
                        className="bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto flex flex-col gap-5 p-8 w-full">

                {/* Header */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                    <h1 className="text-[20px] font-black text-text-primary tracking-tight">
                        Allocation Admin
                    </h1>
                    <p className="text-[12px] text-text-muted mt-1">
                        Configure the room pool, set the allocation date, and orchestrate year-based allocation events.
                    </p>
                </div>

                {/* Event + date + pool configurator */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                    <h2 className="text-[13px] font-bold text-text-secondary tracking-[0.05em] mb-4">
                        ALLOCATION SCHEDULE (YEAR-BASED)
                    </h2>

                    <div className="flex flex-col md:flex-row items-end gap-4 mb-4">
                        <label className="flex-1 text-[12px] font-semibold text-text-secondary">
                            Target Year
                            <select
                                className="mt-1 w-full border border-border rounded px-3 py-2 bg-canvas text-text-primary"
                                value={selectedTargetYear}
                                onChange={(e) => setSelectedTargetYear(Number(e.target.value))}
                                disabled={isLoadingEvents}
                            >
                                {TARGET_YEARS.map(year => (
                                    <option key={year} value={year}>Year {year}</option>
                                ))}
                            </select>
                        </label>

                        <label className="flex-1 text-[12px] font-semibold text-text-secondary">
                            Allocation Date
                            <input
                                type="date"
                                className="mt-1 block w-full border border-border rounded px-3 py-2 bg-canvas text-text-primary"
                                value={allocationDateInput}
                                onChange={(e) => {
                                    setAllocationDateInput(e.target.value);
                                    setDateSavedMsg('');
                                }}
                                disabled={isLoadingEvents}
                            />
                        </label>

                        <button
                            onClick={handleCreateOrUpdate}
                            disabled={!allocationDateInput || isCreating || isUpdating}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[12px] disabled:opacity-50"
                        >
                            {currentEvent ? 'UPDATE DATE' : 'CREATE EVENT'}
                        </button>
                    </div>

                    {dateSavedMsg && (
                        <p className="text-[12px] font-semibold text-emerald-700 mb-3">{dateSavedMsg}</p>
                    )}
                    {eventsError && (
                        <p className="text-[12px] font-semibold text-crimson mb-3">{eventsError.message}</p>
                    )}

                    {/* Room Pool Configurator */}
                    <div className="border-t border-border pt-4 mt-4">
                        <p className="text-[12px] font-bold text-text-secondary tracking-[0.05em] mb-3">
                            ROOM POOL
                            <span className="ml-2 font-normal text-text-muted normal-case tracking-normal">
                                Select specific rooms from any hostel to contribute to this year's allocation
                            </span>
                        </p>

                        {currentEvent ? (
                            <RoomPoolConfigurator
                                eventId={currentEvent.id}
                                onSaved={handlePoolSaved}
                            />
                        ) : (
                            <p className="text-[12px] text-text-muted italic bg-canvas p-3 rounded border border-border border-dashed">
                                You must create an Allocation Event for Year {selectedTargetYear} before configuring the room pool.
                            </p>
                        )}
                        {poolSavedMsg && (
                            <p className="text-[12px] font-semibold text-emerald-700 mt-3">{poolSavedMsg}</p>
                        )}
                    </div>
                </div>

                {/* Rank + CGPA upload */}
                <RankUpdatePanel />

                {/* Events status table */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border text-[12px] font-bold tracking-[0.06em] text-text-secondary">
                        ACTIVE EVENTS
                    </div>

                    {isLoadingEvents ? (
                        <div className="p-4 text-[12px] text-text-muted animate-pulse">
                            Loading events...
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-4 text-[12px] text-text-muted">
                            No allocation events created yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12px]">
                                <thead className="bg-canvas text-text-secondary">
                                    <tr>
                                        <th className="text-left px-4 py-2">Target Year</th>
                                        <th className="text-left px-4 py-2">Status (Phase)</th>
                                        <th className="text-left px-4 py-2">Allocation Date</th>
                                        <th className="text-left px-4 py-2">Lobby Opens At</th>
                                        <th className="text-left px-4 py-2">Paused?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                        <tr key={ev.id} className="border-t border-border">
                                            <td className="px-4 py-2 text-text-primary font-bold">
                                                Year {ev.target_year}
                                            </td>
                                            <td className="px-4 py-2 text-text-secondary">
                                                {ev.status}
                                            </td>
                                            <td className="px-4 py-2 text-text-secondary">
                                                {ev.allocation_date ? String(ev.allocation_date).slice(0, 10) : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-text-secondary">
                                                {ev.lobby_opens_at ? new Date(ev.lobby_opens_at).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {ev.is_paused ? (
                                                    <span className="text-crimson font-bold">Yes</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}