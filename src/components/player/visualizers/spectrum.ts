const BLOCKS = "█▇▆▅▄▃▂▁ ";
const GRAY = Array.from({ length: 256 }, (_, i) => `rgb(${i},${i},${i})`);

export function renderSpectrum(
  analyser: AnalyserNode,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  charW: number,
  charH: number
) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  const binCount = data.length;
  const cols = Math.floor(width / charW);
  const rows = Math.floor(height / charH);
  const binsPerCol = Math.floor(binCount / cols);

  ctx.clearRect(0, 0, width, height);
  ctx.font = '14px "JetBrains Mono", monospace';

  for (let col = 0; col < cols; col++) {
    // Average bins for this column
    let sum = 0;
    for (let b = 0; b < binsPerCol; b++) {
      sum += data[col * binsPerCol + b];
    }
    const avg = sum / binsPerCol / 255;
    const barHeight = avg * rows;

    for (let row = 0; row < rows; row++) {
      const rowFromBottom = rows - 1 - row;
      const fill = barHeight - rowFromBottom;

      let charIdx: number;
      if (fill >= 1) charIdx = 0; // full block
      else if (fill > 0) charIdx = Math.floor((1 - fill) * (BLOCKS.length - 1));
      else charIdx = BLOCKS.length - 1; // space

      const char = BLOCKS[charIdx];
      if (char === " ") continue;

      const intensity = fill >= 1 ? 1 : fill;
      const isPeak = rowFromBottom >= rows - 2 && avg > 0.6;

      if (isPeak) {
        ctx.fillStyle = "#f97316";
      } else {
        ctx.fillStyle = GRAY[Math.floor(80 + intensity * 140)];
      }

      ctx.fillText(char, col * charW, row * charH + charH);
    }
  }
}
