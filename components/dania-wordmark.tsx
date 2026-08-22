import Image from "next/image";

export function DaniaWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`dania-wordmark${compact ? " is-compact" : ""}`} aria-hidden="true">
      <Image
        className="dania-wordmark-image"
        src="/brand/dania-wordmark.webp"
        alt=""
        width={1020}
        height={270}
        sizes="(max-width: 700px) 52vw, 260px"
        priority
      />
    </span>
  );
}
