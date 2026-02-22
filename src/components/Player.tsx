import { useState, useRef, useEffect, useCallback } from "react";
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

  const VISUALIZER_MODES: VisualizerMode[] = ["off", "spectrum", "waterfall", "waveform", "lissajous", "braille", "matrix"];

  const toggleVisualizer = useCallback(() => {
    setVisualizerMode((prev) => {
      const idx = VISUALIZER_MODES.indexOf(prev);
      return VISUALIZER_MODES[(idx + 1) % VISUALIZER_MODES.length];
    });
  }, []);

  useKeyBindings({
    togglePlay: engine.togglePlay,
    seek: engine.seek,
    adjustVolume: engine.adjustVolume,
    toggleVisualizer,
    toggleRepeat: engine.toggleRepeat,
    isVisible,
  });

  // Intersection observer for key bindings.
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

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="climp audio player demo"
      className="w-full max-w-[540px] relative cursor-pointer"
      onClick={engine.togglePlay}
    >

      {/* Song title + artist like real climp. */}
      <div className="mb-6">
        <div className="text-base font-bold text-text">
          Ghost (Kerrigan's Anthem)
        </div>
        <div className="text-sm text-text-muted">
          Maduk ft Veela
        </div>
      </div>

      {/* Visualizer (compact). */}
      <div className={`transition-[margin] duration-300 ease-in-out ${visualizerMode === "off" ? "mb-0" : "mb-4"}`}>
        <Visualizer
          analyser={engine.analyser}
          mode={visualizerMode}
          isPlaying={engine.isPlaying}
        />
      </div>

      {/* Progress bar. */}
      <div className="mb-2">
        <ProgressBar
          currentTime={engine.currentTime}
          duration={engine.duration}
          onSeek={engine.seekTo}
        />
      </div>

      {/* Controls. */}
      <div className="mb-0 sm:mb-4">
        <Controls
          isPlaying={engine.isPlaying}
          repeat={engine.repeat}
          volume={engine.volume}
        />
      </div>

      {/* Demo key help (hidden on mobile). */}
      <div className="hidden sm:flex flex-wrap gap-4 text-sm text-text-dim select-none">
        <span>space pause</span>
        <span>left/right or h/l seek</span>
        <span>+/- volume</span>
        <span>v visualizer</span>
        <span>r repeat</span>
      </div>

      {/* Play state for screen readers. */}
      <div aria-live="polite" className="sr-only">
        {engine.isPlaying ? "Playing" : "Paused"}
      </div>
    </div>
  );
}
