const MATRIX_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
interface Column {
  y: number;
  speed: number;
  chars: string[];
}

let columns: Column[] | null = null;
let lastTime = 0;

function initColumns(cols: number, rows: number): Column[] {
  return Array.from({ length: cols }, () => ({
    y: Math.random() * rows * 2 - rows,
    speed: 0.5 + Math.random() * 1.5,
    chars: Array.from(
      { length: rows },
      () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
    ),
  }));
}

export function renderMatrix(
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
  const binsPerCol = Math.max(1, Math.floor(data.length / cols));

  // Overall energy
  let totalEnergy = 0;
  for (let i = 0; i < data.length; i++) totalEnergy += data[i];
  const avgEnergy = totalEnergy / data.length / 255;

  if (!columns || columns.length !== cols) {
    columns = initColumns(cols, rows);
    lastTime = performance.now();
  }

  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  ctx.clearRect(0, 0, width, height);

  for (let col = 0; col < cols; col++) {
    const column = columns[col];

    // Get energy for this column
    let sum = 0;
    for (let b = 0; b < binsPerCol; b++) {
      const idx = col * binsPerCol + b;
      if (idx < data.length) sum += data[idx];
    }
    const colEnergy = sum / binsPerCol / 255;

    // Update position - speed modulated by energy
    column.y += column.speed * (0.5 + avgEnergy * 2) * dt * 10;

    if (column.y > rows + 4) {
      column.y = -Math.random() * rows;
      column.speed = 0.5 + Math.random() * 1.5;
      column.chars = Array.from(
        { length: rows },
        () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      );
    }

    // Randomly change a char
    if (Math.random() < 0.05) {
      const idx = Math.floor(Math.random() * rows);
      column.chars[idx] =
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    for (let row = 0; row < rows; row++) {
      const distFromHead = column.y - row;
      if (distFromHead < 0 || distFromHead > rows) continue;

      const char = column.chars[row % column.chars.length];
      const fade = 1 - distFromHead / rows;

      if (distFromHead < 1) {
        // Head of trail - bright, orange if high energy
        if (colEnergy > 0.5) {
          ctx.fillStyle = "#f97316";
        } else {
          ctx.fillStyle = "#ffffff";
        }
      } else {
        const g = Math.floor(40 + fade * 120 + colEnergy * 60);
        ctx.fillStyle = `rgb(0,${g},0)`;
      }

      ctx.fillText(char, col * charW, row * charH + charH);
    }
  }
}
