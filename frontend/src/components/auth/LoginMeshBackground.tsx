'use client';

import { useEffect, useRef } from 'react';

type MeshPoint = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
};

function readRgbVariable(element: HTMLElement, name: string, fallback: string) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();

  return value ? value.replaceAll(' ', ', ') : fallback;
}

function readNumberVariable(element: HTMLElement, name: string, fallback: number) {
  const value = Number(getComputedStyle(element).getPropertyValue(name).trim());

  return Number.isFinite(value) ? value : fallback;
}

export default function LoginMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasElement = canvas;
    const context = ctx;
    const themeElement = canvasElement;

    const config = {
      spacing: 130,
      radius: 185,
      push: 46,
      idleRadius: 14,
      line: readRgbVariable(themeElement, '--theme-login-mesh-line-rgb', '180, 196, 199'),
      dot: readRgbVariable(themeElement, '--theme-login-mesh-dot-rgb', '180, 196, 199'),
      activeDot: readRgbVariable(themeElement, '--theme-login-mesh-active-dot-rgb', '255, 255, 255'),
      lineBaseOpacity: readNumberVariable(themeElement, '--theme-login-mesh-line-base-opacity', 0.2),
      lineGlowOpacity: readNumberVariable(themeElement, '--theme-login-mesh-line-glow-opacity', 0.2),
      dotBaseOpacity: readNumberVariable(themeElement, '--theme-login-mesh-dot-base-opacity', 0.32),
      dotGlowOpacity: readNumberVariable(themeElement, '--theme-login-mesh-dot-glow-opacity', 0.5),
    };

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let grid: MeshPoint[][] = [];

    const mouse = {
      x: -9999,
      y: -9999,
    };

    function buildGrid() {
      const cols = Math.ceil(width / config.spacing) + 4;
      const rows = Math.ceil(height / config.spacing) + 4;

      grid = [];

      for (let row = 0; row < rows; row += 1) {
        const currentRow: MeshPoint[] = [];

        for (let col = 0; col < cols; col += 1) {
          const skew = row % 2 === 0 ? 0 : 18;
          const ox = col * config.spacing - config.spacing + skew;
          const oy = row * config.spacing - config.spacing;
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.12 + Math.random() * 0.1;

          currentRow.push({
            x: ox,
            y: oy,
            ox,
            oy,
            offsetX: (Math.random() - 0.5) * config.idleRadius,
            offsetY: (Math.random() - 0.5) * config.idleRadius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
          });
        }

        grid.push(currentRow);
      }
    }

    function resize() {
      const parent = canvasElement.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvasElement.width = Math.floor(width * dpr);
      canvasElement.height = Math.floor(height * dpr);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function updatePoints() {
      for (const row of grid) {
        for (const point of row) {
          point.offsetX += point.vx;
          point.offsetY += point.vy;

          if (point.offsetX > config.idleRadius || point.offsetX < -config.idleRadius) {
            point.vx *= -1;
            point.offsetX = Math.max(
              -config.idleRadius,
              Math.min(config.idleRadius, point.offsetX),
            );
          }

          if (point.offsetY > config.idleRadius || point.offsetY < -config.idleRadius) {
            point.vy *= -1;
            point.offsetY = Math.max(
              -config.idleRadius,
              Math.min(config.idleRadius, point.offsetY),
            );
          }

          const baseX = point.ox + point.offsetX;
          const baseY = point.oy + point.offsetY;
          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          let targetX = baseX;
          let targetY = baseY;

          if (distance < config.radius) {
            const force = 1 - distance / config.radius;
            const angle = Math.atan2(dy, dx);

            targetX += Math.cos(angle) * force * config.push;
            targetY += Math.sin(angle) * force * config.push;
          }

          point.x += (targetX - point.x) * 0.14;
          point.y += (targetY - point.y) * 0.14;
        }
      }
    }

    function drawLine(a: MeshPoint, b: MeshPoint) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = mx - mouse.x;
      const dy = my - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - distance / 240);

      context.strokeStyle = `rgba(${config.line}, ${config.lineBaseOpacity + glow * config.lineGlowOpacity})`;
      context.lineWidth = 1;

      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    function drawPoints() {
      for (const row of grid) {
        for (const point of row) {
          const dx = point.x - mouse.x;
          const dy = point.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const glow = Math.max(0, 1 - distance / 210);
          const color = glow > 0.6 ? config.activeDot : config.dot;

          context.fillStyle = `rgba(${color}, ${config.dotBaseOpacity + glow * config.dotGlowOpacity})`;

          context.beginPath();
          context.arc(point.x, point.y, 1.7 + glow * 2.4, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      updatePoints();

      for (let row = 0; row < grid.length; row += 1) {
        for (let col = 0; col < grid[row].length; col += 1) {
          const point = grid[row][col];
          const right = grid[row][col + 1];
          const bottom = grid[row + 1]?.[col];

          if (right) drawLine(point, right);
          if (bottom) drawLine(point, bottom);
        }
      }

      drawPoints();
      animationFrame = requestAnimationFrame(draw);
    }

    function updateMouse(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();

      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function clearMouse() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();

    const parent = canvasElement.parentElement;

    parent?.addEventListener('pointermove', updateMouse);
    parent?.addEventListener('pointerleave', clearMouse);
    window.addEventListener('resize', resize);

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      parent?.removeEventListener('pointermove', updateMouse);
      parent?.removeEventListener('pointerleave', clearMouse);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 h-full w-full opacity-55"
    />
  );
}
