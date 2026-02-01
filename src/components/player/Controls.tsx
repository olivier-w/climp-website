interface Props {
  isPlaying: boolean;
  repeat: boolean;
  volume: number;
}

export function Controls({ isPlaying, repeat, volume }: Props) {
  const icon = isPlaying ? "▶" : "▌▌";
  const status = isPlaying ? "playing" : "paused";
  const vol = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-4 text-sm select-none">
      <span className="text-[var(--color-text)]">{icon}</span>
      <span className="text-[var(--color-text-muted)]">{status}</span>
      {repeat && (
        <span className="text-[var(--color-text-dim)]">[repeat]</span>
      )}
      <span className="ml-auto text-[var(--color-text-dim)]">vol {vol}%</span>
    </div>
  );
}
