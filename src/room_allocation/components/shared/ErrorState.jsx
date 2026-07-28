export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>
        </svg>
      </div>
      <div>
        <p className="text-[15px] font-bold text-text-primary mb-1">{title}</p>
        {message && <p className="text-[13px] text-text-secondary max-w-sm">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-crimson text-white text-[12px] font-bold tracking-[0.06em] rounded hover:bg-crimson-dark transition-colors border-0 cursor-pointer"
        >
          RETRY
        </button>
      )}
    </div>
  );
}
