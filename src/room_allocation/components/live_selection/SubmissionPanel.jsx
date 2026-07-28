import { useState } from 'react';

/** Submit button + validation panel — only leader can submit */
export default function SubmissionPanel({ cart, isLeader, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isLeader || cart.length === 0 || submitting) return;
    setSubmitting(true);
    await onSubmit(cart);
    setSubmitting(false);
  };

  const canSubmit = isLeader && cart.length > 0 && !submitting;

  return (
    <div className="p-3 border-t border-border bg-card">
      {!isLeader && (
        <p className="text-[11px] text-text-muted text-center mb-2 tracking-[0.02em]">
          Only the squad leader can submit preferences.
        </p>
      )}
      {cart.length === 0 && isLeader && (
        <p className="text-[11px] text-amber-600 text-center mb-2 font-semibold">
          Add at least 1 room to submit.
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={[
          'w-full py-3 text-[12px] font-black tracking-[0.08em] rounded transition-all duration-150 border-0',
          canSubmit
            ? 'bg-crimson text-white hover:bg-crimson-dark cursor-pointer'
            : 'bg-border text-text-muted cursor-not-allowed',
        ].join(' ')}
      >
        {submitting ? 'SUBMITTING…' : 'SUBMIT PREFERENCES'}
      </button>
    </div>
  );
}
