import { useRef, useEffect, useCallback } from "react";
import type { VisualizerMode } from "./types";
import { renderSpectrum } from "./visualizers/spectrum";
import { renderWaveform } from "./visualizers/waveform";
import { renderBraille } from "./visualizers/braille";
import { renderMatrix } from "./visualizers/matrix";

interface Props {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  isPlaying: boolean;
}

const RENDERERS = {
  spectrum: renderSpectrum,
  waveform: renderWaveform,
  braille: renderBraille,
  matrix: renderMatrix,
} as const;

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function Visualizer({ analyser, mode, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  const draw = useCallback(
    (timestamp: number) => {
      rafRef.current = requestAnimationFrame(draw);

      if (timestamp - lastFrameRef.current < FRAME_INTERVAL) return;
      lastFrameRef.current = timestamp;

      const canvas = canvasRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;

      // Measure char dimensions at CSS scale
      ctx.font = '14px "JetBrains Mono", monospace';
      const metrics = ctx.measureText("█");
      const charW = metrics.width;
      const charH = 18;

      if (mode === "off") {
        ctx.clearRect(0, 0, cssW, cssH);
        return;
      }
      const renderer = RENDERERS[mode];
      renderer(analyser, ctx, cssW, cssH, charW, charH);
    },
    [analyser, mode]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || !analyser) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, analyser, draw]);

  // Clear canvas when visualizer is turned off
  useEffect(() => {
    if (mode === "off") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
  }, [mode]);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return (
      <div
        className="w-full overflow-hidden transition-[height,opacity] duration-300 ease-in-out"
        style={{
          height: mode === "off" ? 0 : "7.2rem",
          opacity: mode === "off" ? 0 : 1,
        }}
      >
        <div className="w-full h-[7.2rem] flex items-center justify-center text-[var(--color-text-faint)] text-sm">
          [ visualizer paused — reduced motion ]
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden transition-[height,opacity] duration-300 ease-in-out"
      style={{
        height: mode === "off" ? 0 : "7.2rem",
        opacity: mode === "off" ? 0 : 1,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-[7.2rem] block"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
