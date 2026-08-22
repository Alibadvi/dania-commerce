import Image from "next/image";

export function DaniaWordmark({ compact = false, animated = false }: { compact?: boolean; animated?: boolean }) {
  return (
    <span className={`dania-wordmark${compact ? " is-compact" : ""}${animated ? " is-animated" : ""}`} aria-hidden="true">
      <Image
        className="dania-wordmark-image"
        src="/brand/dania-wordmark.webp"
        alt=""
        width={1020}
        height={270}
        sizes="(max-width: 700px) 52vw, 260px"
        priority
      />
      {animated && (
        <span className="dania-wordmark-slices">
          {Array.from({ length: 5 }, (_, index) => <i key={index} />)}
        </span>
      )}
    </span>
  );
}
