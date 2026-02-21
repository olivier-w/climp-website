export function renderLissajous(
  analyser: AnalyserNode,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _charW: number,
  _charH: number
) {
  const bufferLength = analyser.fftSize;
  const data = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(data);

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.85;

  // Delay offset converts mono to a meaningful 2D loop (~1.5% of fftSize)
  const delayOffset = Math.max(1, Math.floor(bufferLength * 0.015));

  // Faint crosshair for scope-screen feel
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.strokeStyle = "rgba(224, 224, 224, 0.05)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Build Lissajous path: current sample → X axis, delayed sample → Y axis
  const path = new Path2D();
  for (let i = 0; i < bufferLength - delayOffset; i++) {
    const xSample = (data[i] - 128) / 128;
    const ySample = (data[i + delayOffset] - 128) / 128;
    const x = cx + xSample * radius;
    const y = cy - ySample * radius;
    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }

  // Outer glow pass — matches waveform.ts style
  ctx.shadowColor = "rgba(224, 224, 224, 0.5)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(224, 224, 224, 0.4)";
  ctx.lineWidth = 3;
  ctx.stroke(path);

  // Inner bright line
  ctx.shadowBlur = 4;
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1.5;
  ctx.stroke(path);

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}
