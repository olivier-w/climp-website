import { memo } from "react";

interface Props {
  isPlaying: boolean;
  repeat: boolean;
  volume: number;
}

export const Controls = memo(function Controls({ isPlaying, repeat, volume }: Props) {
  const icon = isPlaying ? "▶" : "▌▌";
  const status = isPlaying ? "playing" : "paused";
  const vol = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-4 text-sm select-none">
      <span className={`text-text ${isPlaying ? "" : "text-[0.65em] leading-none"}`}>{icon}</span>
      <span className="text-text-muted">{status}</span>
      {repeat && (
        <span className="text-text-dim">[repeat]</span>
      )}
      <span className="ml-auto text-text-dim">vol {vol}%</span>
    </div>
  );
});
