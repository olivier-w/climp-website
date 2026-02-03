import { useCallback, useRef } from "react";

interface Props {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ProgressBar({ currentTime, duration, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  const fraction = duration > 0 ? currentTime / duration : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      onSeek(Math.max(0, Math.min(1, x)) * duration);
    },
    [duration, onSeek]
  );

  return (
    <div className="flex items-center gap-3 text-sm select-none">
      <span className="text-text-dim shrink-0 min-w-[3ch]">
        {formatTime(currentTime)}
      </span>
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        className="flex-1 h-[3px] bg-text-dim rounded-full cursor-pointer relative"
        onClick={handleClick}
      >
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 bg-text rounded-full"
          style={{ width: `${fraction * 100}%` }}
        />
        {/* Scrubber dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-text rounded-full"
          style={{ left: `calc(${fraction * 100}% - 3.5px)` }}
        />
      </div>
      <span className="text-text-dim shrink-0 min-w-[3ch] text-right">
        {formatTime(duration)}
      </span>
    </div>
  );
}
