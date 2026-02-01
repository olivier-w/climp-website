import { useState, useRef, useEffect } from "react";
import type { VisualizerMode } from "./player/types";
import { useAudioEngine } from "./player/useAudioEngine";
import { useKeyBindings } from "./player/useKeyBindings";
import { Visualizer } from "./player/Visualizer";
import { ProgressBar } from "./player/ProgressBar";
import { Controls } from "./player/Controls";

export default function Player() {
  const [visualizerMode, setVisualizerMode] =
    useState<VisualizerMode>("off");
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const engine = useAudioEngine("/audio/Maduk ft Veela - Ghost (Kerrigan's Anthem).mp3");

  useKeyBindings({
    ...engine,
    visualizerMode,
    setVisualizerMode,
    isVisible,
  });

  // Intersection observer for key bindings
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleInteraction() {
    engine.togglePlay();
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="climp audio player demo"
      className="w-full max-w-[540px] relative cursor-pointer"
      onClick={handleInteraction}
    >

      {/* Song title + artist — like real climp */}
      <div className="mb-6">
        <div className="text-base font-bold text-[var(--color-text)]">
          Ghost (Kerrigan's Anthem)
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          Maduk ft Veela
        </div>
      </div>

      {/* Visualizer — compact */}
      <div className={`transition-[margin] duration-300 ease-in-out ${visualizerMode === "off" ? "mb-0" : "mb-4"}`}>
        <Visualizer
          analyser={engine.analyser}
          mode={visualizerMode}
          isPlaying={engine.isPlaying}
        />
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <ProgressBar
          currentTime={engine.currentTime}
          duration={engine.duration}
          onSeek={engine.seekTo}
        />
      </div>

      {/* Controls */}
      <div className="mb-0 sm:mb-4">
        <Controls
          isPlaying={engine.isPlaying}
          repeat={engine.repeat}
          volume={engine.volume}
        />
      </div>

      {/* Keybinds help — matches real climp, hidden on mobile */}
      <div className="hidden sm:flex gap-4 text-sm text-[var(--color-text-dim)] select-none">
        <span><span>space</span> pause</span>
        <span><span>←/→</span> seek</span>
        <span><span>↑/↓</span> volume</span>
        <span><span>v</span> viz</span>
        <span><span>r</span> repeat</span>
      </div>

      {/* Play state for screen readers */}
      <div aria-live="polite" className="sr-only">
        {engine.isPlaying ? "Playing" : "Paused"}
      </div>
    </div>
  );
}
