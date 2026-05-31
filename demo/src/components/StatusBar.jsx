// Mock iOS-style status bar (time / LTE / battery), matches ACN designs
export default function StatusBar() {
  return (
    <div className="status-bar select-none">
      <span>09:30</span>
      <span className="flex items-center gap-2 tab-num">
        <span>LTE</span>
        <span>87%</span>
        <span className="inline-block w-5 h-2 border border-ink relative">
          <span className="absolute inset-y-0 left-0 bg-ink" style={{ width: '70%' }} />
        </span>
      </span>
    </div>
  );
}
