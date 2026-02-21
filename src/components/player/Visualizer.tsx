import { useRef, useEffect, useCallback } from "react";
import type { VisualizerMode } from "./types";
import { renderSpectrum } from "./visualizers/spectrum";
import { renderWaterfall } from "./visualizers/waterfall";
import { renderWaveform } from "./visualizers/waveform";
import { renderLissajous } from "./visualizers/lissajous";
import { renderBraille } from "./visualizers/braille";
import { renderMatrix } from "./visualizers/matrix";

interface Props {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  isPlaying: boolean;
}

const RENDERERS = {
  spectrum: renderSpectrum,
  waterfall: renderWaterfall,
  waveform: renderWaveform,
  lissajous: renderLissajous,
  braille: renderBraille,
  matrix: renderMatrix,
} as const;

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function Visualizer({ analyser, mode, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const metricsRef = useRef({ cssW: 0, cssH: 0, charW: 0, charH: 18 });

  const draw = useCallback(
    (timestamp: number) => {
      rafRef.current = requestAnimationFrame(draw);

      if (timestamp - lastFrameRef.current < FRAME_INTERVAL) return;
      lastFrameRef.current = timestamp;

      const canvas = canvasRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { cssW, cssH, charW, charH } = metricsRef.current;

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
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.font = '14px "JetBrains Mono", monospace';
          const charW = ctx.measureText("█").width;
          metricsRef.current = { cssW: width, cssH: height, charW, charH: 18 };
        }
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

  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <div
      className="w-full overflow-hidden transition-[height,opacity] duration-300 ease-in-out"
      style={{
        height: mode === "off" ? 0 : "7.2rem",
        opacity: mode === "off" ? 0 : 1,
      }}
    >
      {prefersReducedMotion.current ? (
        <div className="w-full h-[7.2rem] flex items-center justify-center text-text-faint text-sm">
          [ visualizer paused — reduced motion ]
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-[7.2rem] block"
          style={{ imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}
