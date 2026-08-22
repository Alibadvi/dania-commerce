export function DaniaWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`dania-wordmark${compact ? " is-compact" : ""}`} aria-hidden="true">
      <span className="dania-wordmark-text">DANIA</span>
      <i className="dania-mark-d" />
      <i className="dania-mark-n" />
      <i className="dania-mark-sun" />
    </span>
  );
}
