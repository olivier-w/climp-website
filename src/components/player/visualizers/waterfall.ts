let offscreen: OffscreenCanvas | null = null;
let offCtx: OffscreenCanvasRenderingContext2D | null = null;

export function renderWaterfall(
  analyser: AnalyserNode,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _charW: number,
  _charH: number
) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  const w = Math.floor(width);
  const h = Math.floor(height);

  // Initialize or resize offscreen buffer
  if (!offscreen || offscreen.width !== w || offscreen.height !== h) {
    offscreen = new OffscreenCanvas(w, h);
    offCtx = offscreen.getContext("2d");
  }
  if (!offCtx) return;

  const scrollPx = 2;

  // Shift existing content down
  const imageData = offCtx.getImageData(0, 0, w, h - scrollPx);
  offCtx.putImageData(imageData, 0, scrollPx);

  // Paint new frequency strip at top
  const stripData = offCtx.createImageData(w, scrollPx);
  const bins = data.length;
  for (let x = 0; x < w; x++) {
    const binIdx = Math.floor((x / w) * bins);
    const value = data[binIdx] / 255;

    // Monochrome brightness — slightly warm (less blue), matching site theme #e0e0e0
    const base = Math.floor(value * 224);
    const r = value > 0.85 ? 249 : base;       // #f97316 orange accent at peaks
    const g = value > 0.85 ? 115 : base;
    const b = value > 0.85 ? 22  : Math.floor(value * 200);

    for (let row = 0; row < scrollPx; row++) {
      const idx = (row * w + x) * 4;
      stripData.data[idx]     = r;
      stripData.data[idx + 1] = g;
      stripData.data[idx + 2] = b;
      stripData.data[idx + 3] = 255;
    }
  }
  offCtx.putImageData(stripData, 0, 0);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreen, 0, 0, width, height);
}
