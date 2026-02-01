import { useEffect } from "react";
import type { AudioControls } from "./types";
import type { VisualizerMode } from "./types";

const VISUALIZER_MODES: VisualizerMode[] = [
  "spectrum",
  "waveform",
  "braille",
  "matrix",
  "off",
];

interface KeyBindingsOptions extends AudioControls {
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  isVisible: boolean;
}

export function useKeyBindings({
  togglePlay,
  seek,
  adjustVolume,
  toggleRepeat,
  visualizerMode,
  setVisualizerMode,
  isVisible,
}: KeyBindingsOptions) {
  useEffect(() => {
    if (!isVisible) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "h":
          seek(-5);
          break;
        case "ArrowRight":
        case "l":
          seek(5);
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          adjustVolume(0.05);
          break;
        case "ArrowDown":
        case "j":
          e.preventDefault();
          adjustVolume(-0.05);
          break;
        case "v":
          {
            const idx = VISUALIZER_MODES.indexOf(visualizerMode);
            const next = VISUALIZER_MODES[(idx + 1) % VISUALIZER_MODES.length];
            setVisualizerMode(next);
          }
          break;
        case "r":
          toggleRepeat();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isVisible,
    togglePlay,
    seek,
    adjustVolume,
    toggleRepeat,
    visualizerMode,
    setVisualizerMode,
  ]);
}
