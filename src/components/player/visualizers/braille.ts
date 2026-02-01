// Braille patterns: 2x4 dot grid per character (U+2800..U+28FF)
// Dot positions:  0 3
//                 1 4
//                 2 5
//                 6 7
const DOT_OFFSETS = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

export function renderBraille(
  analyser: AnalyserNode,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  charW: number,
  charH: number
) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  const cols = Math.floor(width / charW);
  const rows = Math.floor(height / charH);
  // Each braille char encodes a 2-wide x 4-tall pixel grid
  const dotCols = cols * 2;
  const dotRows = rows * 4;
  const binsPerDotCol = Math.max(1, Math.floor(data.length / dotCols));

  ctx.clearRect(0, 0, width, height);
  ctx.font = '14px "JetBrains Mono", monospace';

  // Build dot grid
  const grid: boolean[][] = Array.from({ length: dotRows }, () =>
    Array(dotCols).fill(false)
  );

  for (let dc = 0; dc < dotCols; dc++) {
    let sum = 0;
    for (let b = 0; b < binsPerDotCol; b++) {
      const idx = dc * binsPerDotCol + b;
      if (idx < data.length) sum += data[idx];
    }
    const avg = sum / binsPerDotCol / 255;
    const barH = Math.round(avg * dotRows);

    for (let dr = 0; dr < barH; dr++) {
      grid[dotRows - 1 - dr][dc] = true;
    }
  }

  // Convert to braille characters
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let code = 0x2800;
      const baseR = row * 4;
      const baseC = col * 2;

      // Left column dots (0,1,2,6)
      if (baseR < dotRows && grid[baseR][baseC]) code |= DOT_OFFSETS[0];
      if (baseR + 1 < dotRows && grid[baseR + 1][baseC]) code |= DOT_OFFSETS[1];
      if (baseR + 2 < dotRows && grid[baseR + 2][baseC]) code |= DOT_OFFSETS[2];
      if (baseR + 3 < dotRows && grid[baseR + 3][baseC]) code |= DOT_OFFSETS[6];

      // Right column dots (3,4,5,7)
      if (baseR < dotRows && baseC + 1 < dotCols && grid[baseR][baseC + 1])
        code |= DOT_OFFSETS[3];
      if (
        baseR + 1 < dotRows &&
        baseC + 1 < dotCols &&
        grid[baseR + 1][baseC + 1]
      )
        code |= DOT_OFFSETS[4];
      if (
        baseR + 2 < dotRows &&
        baseC + 1 < dotCols &&
        grid[baseR + 2][baseC + 1]
      )
        code |= DOT_OFFSETS[5];
      if (
        baseR + 3 < dotRows &&
        baseC + 1 < dotCols &&
        grid[baseR + 3][baseC + 1]
      )
        code |= DOT_OFFSETS[7];

      if (code === 0x2800) continue;

      const char = String.fromCharCode(code);
      const dotCount = (code - 0x2800).toString(2).split("1").length - 1;
      const intensity = dotCount / 8;

      if (intensity > 0.7) {
        ctx.fillStyle = "#f97316";
      } else {
        const gray = Math.floor(80 + intensity * 140);
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      }

      ctx.fillText(char, col * charW, row * charH + charH);
    }
  }
}
