export function renderWaveform(
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

  const midY = height / 2;
  const sliceWidth = width / bufferLength;

  // Build the waveform path
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const normalized = (data[i] - 128) / 128;
    const y = midY - normalized * midY * 0.85;
    if (i === 0) {
      ctx.moveTo(0, y);
    } else {
      // Smooth curve between points
      const prevNormalized = (data[i - 1] - 128) / 128;
      const prevY = midY - prevNormalized * midY * 0.85;
      const prevX = (i - 1) * sliceWidth;
      const currX = i * sliceWidth;
      const cpX = (prevX + currX) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, currX, y);
    }
  }

  // Fill underneath with gradient
  const fillPath = new Path2D();
  fillPath.addPath(new Path2D());

  // Re-trace for fill
  ctx.lineTo(width, midY);
  ctx.lineTo(0, midY);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(51, 255, 102, 0.15)");
  gradient.addColorStop(0.5, "rgba(51, 255, 102, 0.03)");
  gradient.addColorStop(1, "rgba(51, 255, 102, 0.15)");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw the main line with glow
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const normalized = (data[i] - 128) / 128;
    const y = midY - normalized * midY * 0.85;
    if (i === 0) {
      ctx.moveTo(0, y);
    } else {
      const prevNormalized = (data[i - 1] - 128) / 128;
      const prevY = midY - prevNormalized * midY * 0.85;
      const prevX = (i - 1) * sliceWidth;
      const currX = i * sliceWidth;
      const cpX = (prevX + currX) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, currX, y);
    }
  }

  // Outer glow
  ctx.shadowColor = "rgba(51, 255, 102, 0.6)";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "rgba(51, 255, 102, 0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner bright line
  ctx.shadowBlur = 4;
  ctx.strokeStyle = "#33ff66";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Draw faint center line
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.strokeStyle = "rgba(51, 255, 102, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
