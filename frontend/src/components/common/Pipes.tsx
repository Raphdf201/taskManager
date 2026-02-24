import { useEffect, useRef } from "react"  // ← Fixed typo

const COLORS: string[] = ["#FF69B4",  "#F5DEB3", "#FFC300",]
const CELL: number = 28;
const NUM_PIPES: number = 6;
const SPEED: number = 50;
const MAX_LENGTH_PER_PIPE: number = 130;
const DX: number[] = [1, 0, -1, 0];
const DY: number[] = [0, 1, 0, -1];

interface Pipe {
  x: number;
  y: number;
  dir: number;
  color: string;
  steps: number;
}

interface PipesBackgroundParameters {
  opacity?: number;
}

function newPipe(cols: number, rows: number): Pipe {
  const dir = Math.floor(Math.random() * 4);
  return {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
    dir,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    steps: 0,
  };
}

function turnDir(current: number): number {
  const r = Math.random();
  if (r < 0.70) return current;
  if (r < 0.85) return (current + 1) % 4;
  return (current + 3) % 4;
}

export default function PipesBackground({ opacity = 0.18 }: PipesBackgroundParameters) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pipes: Pipe[] = [];
    let interval: ReturnType<typeof setInterval>;

    function resize(): void {
      if (!canvas || !ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const cols = Math.floor(canvas.width / CELL);
      const rows = Math.floor(canvas.height / CELL);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pipes = Array.from({ length: NUM_PIPES }, () => newPipe(cols, rows));
    }

    function step(): void {
  if (!canvas || !ctx) return;

  ctx.fillStyle = 'rgba(250, 255, 240, 0.02)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cols = Math.floor(canvas.width / CELL);
  const rows = Math.floor(canvas.height / CELL);

  pipes.forEach((pipe, i) => {
    const newDir = turnDir(pipe.dir);
    const nx = pipe.x + DX[newDir];
    const ny = pipe.y + DY[newDir];

    if (
      nx < 0 || nx >= cols ||
      ny < 0 || ny >= rows ||
      pipe.steps >= MAX_LENGTH_PER_PIPE  
    ) {
      pipes[i] = newPipe(cols, rows);
      return;  
    }

    const x1 = pipe.x * CELL + CELL / 2;
    const y1 = pipe.y * CELL + CELL / 2;
    const x2 = nx * CELL + CELL / 2;
    const y2 = ny * CELL + CELL / 2;

    ctx.strokeStyle = pipe.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (newDir !== pipe.dir) {
      ctx.fillStyle = pipe.color;
      ctx.beginPath();
      ctx.arc(x1, y1, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    pipe.steps++;
    pipe.x = nx;
    pipe.y = ny;
    pipe.dir = newDir;
  });
}

    resize();
    interval = setInterval(step, SPEED);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      clearInterval(interval);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "20vh",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
