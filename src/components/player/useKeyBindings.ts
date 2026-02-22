import { useEffect } from "react";

interface KeyBindingsOptions {
  togglePlay: () => void;
  seek: (delta: number) => void;
  adjustVolume: (delta: number) => void;
  toggleVisualizer: () => void;
  toggleRepeat: () => void;
  isVisible: boolean;
}

export function useKeyBindings({
  togglePlay,
  seek,
  adjustVolume,
  toggleVisualizer,
  toggleRepeat,
  isVisible,
}: KeyBindingsOptions) {
  useEffect(() => {
    if (!isVisible) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input.
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
        case "H":
          e.preventDefault();
          seek(-5);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          e.preventDefault();
          seek(5);
          break;
        case "+":
        case "=":
          adjustVolume(0.05);
          break;
        case "-":
          adjustVolume(-0.05);
          break;
        case "v":
        case "V":
          toggleVisualizer();
          break;
        case "r":
        case "R":
          toggleRepeat();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, togglePlay, seek, adjustVolume, toggleVisualizer, toggleRepeat]);
}
