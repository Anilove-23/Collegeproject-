export default function LoadingScreen({ label = 'Loading allocation state…' }) {
  return (
    <div className="fixed inset-0 bg-canvas flex flex-col items-center justify-center gap-5 z-50">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-crimson animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-[13px] font-semibold text-text-secondary tracking-[0.04em]">{label}</p>
    </div>
  );
}
