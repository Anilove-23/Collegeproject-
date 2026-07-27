import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomFilters from './RoomFilters';
import RoomGrid from './RoomGrid';
import PreferenceCart from './PreferenceCart';
import SubmissionPanel from './SubmissionPanel';
import PhaseBanner from '../shared/PhaseBanner';
import { useRooms } from '../../hooks/useRooms';
import { usePreferenceCart } from '../../hooks/usePreferenceCart';
import { submitPreferences } from '../../api/allocation.api';
import { ROUTES } from '../../constants/routes';

const DEFAULT_FILTERS = { type: 'All Types', block: 'All Blocks', status: 'All Rooms', search: '' };

function applyFilters(rooms, f) {
  return rooms.filter((r) => {
    if (f.search && !r.roomNo.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.type !== 'All Types' && r.type !== f.type) return false;
    if (f.block !== 'All Blocks' && r.block !== f.block) return false;
    if (f.status === 'Available Only' && r.occupied >= (r.total || r.capacity)) return false;
    return true;
  });
}

export default function PreferenceBuilder({
  studentId,
  allocationState,
  isLiveMode = false,
  onClose = null
}) {
  const navigate = useNavigate();
  const hostelId = allocationState?.hostelId ?? null;
  const isLeader = allocationState?.isLeader ?? false;

  const { data: rooms = [], isLoading: loading } = useRooms(hostelId, studentId);
  const { cart, add, remove, moveUp, moveDown, isInCart, isFull, MAX_PREFERENCES, clear } = usePreferenceCart(studentId);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredRooms = applyFilters(rooms, filters);

  const handleToggle = (roomId) => {
    if (isInCart(roomId)) remove(roomId);
    else if (!isFull) add(roomId);
  };

  const handleSubmit = async (roomIds) => {
    if (!isLiveMode) {
      alert("Preferences saved locally! You can only submit during your live batch.");
      if (onClose) onClose();
      return;
    }

    try {
      await submitPreferences({
        groupId: allocationState?.groupId,
        submittedBy: studentId,
        hostelId: allocationState?.hostelId,
        batchNumber: allocationState?.batchNumber,
        roundNumber: allocationState?.roundNumber ?? 1,
        preferences: roomIds,
      });
      // Clear cart on successful submit to avoid stale data later
      clear();
      if (onClose) onClose();
      navigate(ROUTES.LOCKED);
    } catch (err) {
      alert(err.message || 'Failed to submit preferences');
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-full bg-canvas">
      {isLiveMode ? (
        <PhaseBanner 
          phase="ROUND ACTIVE" 
          sub="Select your room preferences below. Leader submits for the squad." 
        />
      ) : (
        <PhaseBanner 
          phase="PREFERENCE BUILDER" 
          sub="Pre-configure your preferences here. They are saved automatically to this device." 
          color="bg-amber-500"
        />
      )}

      {onClose && !isLiveMode && (
        <div className="flex justify-end -mt-2 mb-2">
          <button 
            onClick={onClose}
            className="text-[12px] font-bold text-text-secondary hover:text-text-primary underline cursor-pointer"
          >
            Close & Go Back
          </button>
        </div>
      )}

      <div className="flex gap-5 items-start flex-1 min-h-0 relative">
        <div className="flex-1 flex flex-col gap-3 min-w-0 pb-20">
          <RoomFilters filters={filters} onChange={setFilters} />
          {loading ? (
            <p className="text-[13px] text-text-secondary py-10 text-center">Loading rooms...</p>
          ) : (
            <RoomGrid 
              rooms={filteredRooms} 
              isInCart={isInCart} 
              onToggle={handleToggle} 
              isLeader={isLeader || !isLiveMode} 
            />
          )}
        </div>
      </div>

      {/* FAB for Cart */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-crimson rounded-full shadow-lg flex items-center justify-center text-white border-0 cursor-pointer z-40 hover:bg-crimson-dark transition-transform hover:scale-105"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span className="absolute top-0 right-0 w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-canvas">
          {cart.length}
        </span>
      </button>

      {/* Cart Popup Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-canvas w-full max-w-sm rounded shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-border bg-card flex justify-between items-center shrink-0">
              <h3 className="text-[13px] font-black tracking-[0.05em] text-text-primary m-0">PREFERENCE CART</h3>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="text-text-muted hover:text-text-primary border-0 bg-transparent text-[18px] font-bold cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto bg-card flex-1 p-0">
              <PreferenceCart
                cart={cart}
                rooms={rooms}
                onRemove={remove}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                isLeader={isLeader || !isLiveMode}
                MAX_PREFERENCES={MAX_PREFERENCES}
              />
            </div>
            
            <div className="p-3 bg-card border-t border-border shrink-0">
              <SubmissionPanel 
                cart={cart} 
                isLeader={isLeader || !isLiveMode} 
                onSubmit={(ids) => {
                  handleSubmit(ids);
                  setIsCartOpen(false);
                }} 
                customLabel={isLiveMode ? 'SUBMIT PREFERENCES' : 'SAVE DRAFT ONLY'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
