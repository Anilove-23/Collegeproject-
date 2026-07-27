import { useState, useEffect } from 'react';
import AllocationLayout from '../layouts/AllocationLayout';
import { useActiveBatch } from '../hooks/useActiveBatch';
import { useGroupMembers } from '../hooks/useGroupMembers';
import { useCreateGroup } from '../mutations/useCreateGroup';
import { useLeaveGroup } from '../mutations/useLeaveGroup';
import { useAcceptInvite } from '../mutations/useAcceptInvite';
import { queryClient } from '../lib/queryClient.js';
import { groupKeys, batchKeys } from '../hooks/queryKeys.js';
import {
  getGroupMembersWithCgpa, getPendingRequests,
  getAllGroups, searchStudents, sendInvite, rejectInvite,
  addBotToSquad, kickMember,
} from '../api/squad.api';
import { useQuery } from '@tanstack/react-query';
import LoadingScreen from '../components/shared/LoadingScreen';

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const CheckIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronRight= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const PlusIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const SoloIcon    = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8c8c2" strokeWidth="1.2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════ */
function CardHeader({ label, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
      <span className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">{label}</span>
      {right}
    </div>
  );
}

function AcceptRejectRow({ name, meta, abbr, onAccept, onReject }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 gap-3">
      {abbr && (
        <div className="w-9 h-9 rounded bg-canvas border border-border-dark text-[11px] font-bold text-text-secondary flex items-center justify-center shrink-0">
          {abbr}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold tracking-[0.04em] text-text-primary mb-0.5 truncate">{name}</p>
        <p className="text-[11px] text-text-secondary">{meta}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onReject} className="w-[30px] h-[30px] flex items-center justify-center border-[1.5px] border-border-dark text-text-secondary rounded hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 bg-transparent cursor-pointer">
          <XIcon />
        </button>
        <button onClick={onAccept} className="w-[30px] h-[30px] flex items-center justify-center bg-crimson text-white rounded hover:bg-crimson-dark transition-colors duration-150 border-0 cursor-pointer">
          <CheckIcon />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT 1 — PHASE BANNER
══════════════════════════════════════════════════════════════ */
function PhaseBanner({ state }) {
  if (state.hasSquad) {
    const isLobby      = state.groupStatus === 'FORMING';
    const isSoftLocked = state.groupStatus === 'SOFT_LOCKED';
    const isHardLocked = state.groupStatus === 'HARD_LOCKED';
    const isAllocated  = state.groupStatus === 'ALLOCATED';

    const title = isLobby
      ? 'Phase 1: Squad Formation'
      : isSoftLocked
      ? 'Phase 2: Soft Lock — Awaiting Your Batch'
      : isHardLocked
      ? 'Phase 3: Batch Active — Selection Window Open'
      : isAllocated
      ? 'Allocated — Room Secured'
      : 'Phase Active';

    const subtitle = isLobby
      ? 'Squad formation is currently open. Ensure all members have accepted invites before the soft lock deadline.'
      : isSoftLocked
      ? 'Your squad is locked in. No new members can join or be kicked. Waiting for your batch window.'
      : isHardLocked
      ? 'Your batch is active. Submit room preferences before your window closes.'
      : isAllocated
      ? 'Your squad has been successfully allocated a room.'
      : 'Your squad is currently locked into a batch.';
    
    return (
      <div className="flex items-start justify-between bg-card border border-border rounded shadow-sm border-l-4 border-l-crimson pl-5 pr-6 py-4 gap-4">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-text-primary mb-1.5">
            {title}
          </h2>
          <p className="text-[12.5px] text-text-secondary leading-relaxed max-w-xl">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-bold tracking-[0.1em] text-text-muted">STATUS</span>
          <span className="text-[22px] font-extrabold tracking-[0.04em] text-text-primary">{state.groupStatus || 'FORMING'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-card border border-crimson rounded px-4 py-3.5 shadow-sm">
      <svg className="text-crimson mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>
      </svg>
      <div className="flex-1">
        <p className="text-[13px] font-bold text-text-primary mb-0.5">Lobby Phase Open</p>
        <p className="text-[12px] text-text-secondary">You have until Soft Lock to finalize your squad before Batch Generation locks.</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-[10px] font-bold tracking-[0.1em] text-text-muted">PHASE</span>
        <span className="text-[18px] font-extrabold tracking-[0.04em] text-crimson">{state.phase}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT 2 — SQUAD PANEL
══════════════════════════════════════════════════════════════ */
function SquadPanel({ state, members, onLeave, onCreate, onSearchInvite }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStudents(searchQuery).then(res => setSearchResults(res.students || []));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  if (state.hasSquad) {
    const filledSlots = members.length;
    const emptySlots = Math.max(0, 4 - filledSlots);

    return (
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden flex flex-col">
        <CardHeader label={`MY SQUAD (${filledSlots}/4)`} />
        <div className="flex flex-col gap-0.5 p-2">
          {members.map((m) => (
            <div key={m.id} className={`flex items-center gap-3 px-2.5 py-2.5 rounded ${m.is_leader ? 'border border-border' : ''}`}>
              <div className="w-9 h-9 rounded bg-text-secondary text-white text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
                {m.name.substring(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold tracking-[0.04em] text-text-primary leading-tight truncate">{m.name}</p>
                <p className="text-[10.5px] text-text-muted tracking-[0.02em]">{m.is_leader ? 'LDR' : 'MEM'} • {m.department || 'N/A'}</p>
              </div>
              {state.isLeader && !m.is_leader && state.phase === 'LOBBY' && state.groupStatus === 'FORMING' && (
                <button onClick={() => window.handleKickMember && window.handleKickMember(m.id)} className="w-[30px] h-[30px] flex items-center justify-center border-[1.5px] border-border-dark text-text-secondary rounded hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 bg-transparent cursor-pointer ml-auto shrink-0" title="Kick Member">
                  <XIcon />
                </button>
              )}
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, idx) => (
            <div key={`slot-${idx}`} className="flex items-center gap-3 px-2.5 py-2.5 rounded opacity-55">
              <div className="w-9 h-9 rounded border-[1.5px] border-dashed border-border-dark text-text-muted flex items-center justify-center shrink-0">
                <PlusIcon />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.04em] text-text-muted">EMPTY SLOT</p>
                  <p className="text-[10.5px] text-text-muted">Awaiting Invite</p>
                </div>
                {state.isLeader && (
                  <button onClick={() => window.handleAddBot && window.handleAddBot()} className="text-[10px] bg-canvas border border-border-dark text-text-secondary px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                    + Add Bot (Dev)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {state.isLeader && emptySlots > 0 && state.phase === 'LOBBY' && (
          <div className="p-3 border-t border-border bg-canvas">
            <input 
              type="text" 
              placeholder="Search by name/roll to invite..." 
              className="w-full px-3 py-2 text-[12px] rounded border border-border bg-white text-text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-1 max-h-32 overflow-y-auto bg-white border border-border rounded shadow-sm">
                {searchResults.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-canvas">
                    <span className="text-[11px] font-semibold">{s.name} ({s.roll_no})</span>
                    <button onClick={() => { onSearchInvite(s.id); setSearchQuery(''); }} className="text-[10px] bg-crimson text-white px-2 py-1 rounded border-0 cursor-pointer">Invite</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state.phase === 'LOBBY' && (
          <div className="p-2 border-t border-border">
            <button onClick={onLeave} className="w-full py-2.5 bg-transparent text-crimson text-[11px] font-bold tracking-[0.06em] rounded hover:bg-red-50 transition-colors border border-crimson cursor-pointer">
              LEAVE SQUAD
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <CardHeader label="MY SQUAD" />
      <div className="flex flex-col items-center px-5 py-8 gap-4 text-center">
        <SoloIcon />
        <div>
          <h3 className="text-[16px] font-extrabold tracking-tight text-text-primary mb-1.5">You are currently Solo</h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Solo allocators are placed in Batch D automatically. Create or join a squad to improve your housing options.
          </p>
        </div>
        {state.phase === 'LOBBY' && (
          <div className="flex gap-2.5 w-full mt-2">
            <button onClick={onCreate} className="flex-1 py-2.5 bg-crimson text-white text-[11px] font-bold tracking-[0.06em] rounded hover:bg-crimson-dark transition-colors duration-150 border-0 cursor-pointer">
              CREATE SQUAD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT 3 — INVITE INBOX
══════════════════════════════════════════════════════════════ */
function InviteInbox({ pendingRequests, onAccept, onReject }) {
  const incoming = pendingRequests.filter(r => 
    r.status === 'PENDING' && 
    (r.request_type === 'INVITE_FROM_PRIMARY' || r.request_type === 'APPLICATION_FROM_STUDENT')
  );
  
  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <CardHeader
        label="INVITE INBOX"
        right={
          incoming.length > 0
            ? <span className="bg-crimson text-white text-[10px] font-bold tracking-[0.06em] px-2 py-0.5 rounded">{incoming.length} PENDING</span>
            : null
        }
      />
      {incoming.length === 0
        ? <p className="text-[12px] text-text-muted text-center py-5">No pending invites</p>
        : incoming.map(inv => {
            const isInvite = inv.request_type === 'INVITE_FROM_PRIMARY';
            const name = isInvite ? (inv.leader_name ? `${inv.leader_name}'s Squad` : `Squad #${inv.group_id}`) : (inv.student_name || 'Student');
            const meta = isInvite ? 'Squad Invite' : 'Join Request';
            const abbr = name.substring(0, 2).toUpperCase();

            return (
              <AcceptRejectRow
                key={inv.id}
                name={name}
                meta={meta}
                abbr={abbr}
                onAccept={() => onAccept(inv.id)}
                onReject={() => onReject(inv.id)}
              />
            );
          })
      }
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT 4 — CENTER BOTTOM PANEL
══════════════════════════════════════════════════════════════ */
function CenterBottomPanel({ state, publicSquads, pendingRequests, onApplyToSquad }) {
  const [squadSearch, setSquadSearch] = useState('');

  if (state.hasSquad) {
    const sent = pendingRequests.filter(r => r.request_type === 'INVITE_FROM_PRIMARY' && r.status === 'PENDING');
    return (
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden flex-1">
        <CardHeader label="SENT INVITES" />
        {sent.length === 0
          ? <p className="text-[12px] text-text-muted text-center py-5">No sent invites</p>
          : sent.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 bg-canvas gap-3">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.04em] text-text-primary mb-0.5">{s.student_name || 'Student'}</p>
                  <p className="text-[11px] text-text-muted">Awaiting Response</p>
                </div>
              </div>
            ))
        }
      </div>
    );
  }

  const filteredSquads = publicSquads.filter(sq => 
    (sq.leader_name || '').toLowerCase().includes(squadSearch.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden flex-1 flex flex-col">
      <CardHeader label="PUBLIC SQUADS" />
      <div className="p-2 border-b border-border bg-canvas shrink-0">
        <input 
          type="text" 
          placeholder="Search by Leader Name..." 
          className="w-full px-3 py-2 text-[12px] rounded border border-border bg-white text-text-primary"
          value={squadSearch}
          onChange={(e) => setSquadSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredSquads.length === 0 
          ? <p className="text-[12px] text-text-muted text-center py-5">No active forming squads found</p>
          : filteredSquads.map(sq => (
            <div 
              key={sq.id} 
              onClick={() => onApplyToSquad && onApplyToSquad(sq.id, sq.leader_name)}
              className="flex items-center px-4 py-3.5 border-b border-border last:border-0 hover:bg-canvas cursor-pointer transition-colors duration-100 gap-2"
            >
              <div className="flex-1">
                <p className="text-[12.5px] font-bold text-text-primary">{sq.leader_name ? `${sq.leader_name}'s Squad` : 'Squad'}</p>
                <p className="text-[11px] text-text-muted">{sq.group_size || 1} Member{(sq.group_size || 1) !== 1 ? 's' : ''}</p>
              </div>
              <span className="text-text-muted"><ChevronRight /></span>
            </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT 5 — YOUR STANDING
══════════════════════════════════════════════════════════════ */
function YourStanding({ state, members }) {
  let cgpa = '—';
  
  if (state.hasSquad && members.length > 0) {
    const leader = members.find(m => m.is_leader) || members[0];
    cgpa = leader.cgpa ? parseFloat(leader.cgpa).toFixed(2) : '—';
  } else {
    cgpa = state.cgpa ? parseFloat(state.cgpa).toFixed(2) : '—';
  }

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <CardHeader label="YOUR STANDING" />
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10.5px] text-text-muted font-semibold tracking-[0.06em] mb-0.5">{state.hasSquad ? 'Group Rank' : 'Your Rank'}</p>
        <p className="text-[26px] font-black tracking-tight text-text-primary">{state.hasSquad ? (state.groupRank || '—') : (state.studentRank || '—')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 py-2">
        <div className="bg-canvas rounded px-3 py-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[0.06em] text-text-muted">{state.hasSquad ? 'Squad CGPA' : 'Your CGPA'}</span>
          <span className="text-base font-black text-text-primary">{cgpa}</span>
        </div>
        <div className="bg-canvas rounded px-3 py-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[0.06em] text-text-muted">Batch</span>
          <span className="text-base font-black text-text-primary">{state.batchNumber || '—'}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function SquadLobbyPage() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  // ── TanStack Query: allocation state (replaces useAllocationState + manual loading) ──
  const { data: state, isLoading: stateLoading } = useActiveBatch(studentId);

  // ── TanStack Query: group members with CGPA (replaces useEffect + getGroupMembersWithCgpa) ──
  const { data: membersData } = useQuery({
    queryKey: groupKeys.members(state?.groupId),
    queryFn:  () => getGroupMembersWithCgpa(state.groupId),
    enabled:  !!state?.groupId,
    staleTime: 30_000,
    select:   (res) => res.members ?? [],
  });
  const members = membersData ?? [];

  // ── TanStack Query: public groups (replaces useEffect + getAllGroups) ──
  const { data: publicSquadsData } = useQuery({
    queryKey: [...groupKeys.all, 'public'],
    queryFn:  () => getAllGroups(),
    enabled:  !state?.hasSquad,
    staleTime: 30_000,
    select:   (res) => (res.groups ?? []).filter(g => g.status === 'FORMING'),
  });
  const publicSquads = publicSquadsData ?? [];

  // ── TanStack Query: pending requests (replaces useEffect + getPendingRequests) ──
  const { data: pendingRequestsData } = useQuery({
    queryKey: groupKeys.requests,
    queryFn:  () => getPendingRequests(),
    enabled:  !!studentId,
    staleTime: 30_000,
    select:   (res) => res.requests ?? [],
  });
  const pendingRequests = pendingRequestsData ?? [];

  // ── Mutations ──────────────────────────────────────────────
  const createGroupMutation = useCreateGroup(studentId);
  const leaveGroupMutation  = useLeaveGroup({ studentId, groupId: state?.groupId });
  const acceptInviteMutation = useAcceptInvite({ studentId, groupId: state?.groupId });

  if (stateLoading || !state) return <LoadingScreen label="Loading Lobby..." />;

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = () => {
    createGroupMutation.mutate(undefined, {
      onSuccess: () => window.location.reload(),
      onError: (err) => alert(err.message || 'Error'),
    });
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this squad?')) {
      leaveGroupMutation.mutate(undefined, {
        onSuccess: () => window.location.reload(),
        onError: (err) => alert(err.message || 'Error'),
      });
    }
  };

  const handleAccept = (reqId) => {
    acceptInviteMutation.mutate(reqId, {
      onSuccess: () => {
        // Also refresh requests list
        queryClient.invalidateQueries({ queryKey: groupKeys.requests });
      },
      onError: (err) => alert(err.message || 'Error'),
    });
  };

  const handleReject = (reqId) => {
    rejectInvite(reqId)
      .then(() => queryClient.invalidateQueries({ queryKey: groupKeys.requests }))
      .catch(err => alert(err.message || 'Error'));
  };

  const handleSearchInvite = (inviteStudentId) => {
    sendInvite({ groupId: state.groupId, studentId: inviteStudentId, requestType: 'INVITE_FROM_PRIMARY' })
      .then(() => {
        alert('Invite sent');
        queryClient.invalidateQueries({ queryKey: groupKeys.requests });
      })
      .catch(err => alert(err.message || 'Error'));
  };

  const handleKickMember = (memberId) => {
    if (confirm('Are you sure you want to kick this member?')) {
      kickMember(state.groupId, studentId, memberId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: groupKeys.members(state.groupId) });
          queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
        })
        .catch(err => alert(err.message || 'Error'));
    }
  };
  window.handleKickMember = handleKickMember;

  const handleAddBot = () => {
    addBotToSquad(state.groupId)
      .then(() => queryClient.invalidateQueries({ queryKey: groupKeys.members(state.groupId) }))
      .catch(err => alert(err.message || 'Error'));
  };
  window.handleAddBot = handleAddBot;

  const handleApplyToSquad = (groupId, leaderName) => {
    if (confirm(`Send join request to ${leaderName ? leaderName + "'s" : 'this'} squad?`)) {
      sendInvite({ groupId, studentId, requestType: 'APPLICATION_FROM_STUDENT' })
        .then(() => {
          alert('Join request sent!');
          queryClient.invalidateQueries({ queryKey: groupKeys.requests });
        })
        .catch(err => alert(err.message || 'Error sending request'));
    }
  };

  return (
    <AllocationLayout phase="Selection Phase" batch={state.batchNumber ? `Batch ${state.batchNumber}` : "Batch TBD"} hostelId={state.hostelId}>
      <div className="flex flex-col gap-5 h-[calc(100vh-120px)]">

        <PhaseBanner state={state} />

        <div className="grid grid-cols-[280px_1fr_260px] gap-5 flex-1 min-h-0">
          {/* LEFT */}
          <SquadPanel 
            state={state} 
            members={members} 
            onCreate={handleCreate} 
            onLeave={handleLeave} 
            onSearchInvite={handleSearchInvite}
          />

          {/* CENTER */}
          <div className="flex flex-col gap-5 min-h-0 h-full">
            <CenterBottomPanel state={state} publicSquads={publicSquads} pendingRequests={pendingRequests} onApplyToSquad={handleApplyToSquad} />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <YourStanding state={state} members={members} />
          </div>
        </div>
      </div>
    </AllocationLayout>
  );
}