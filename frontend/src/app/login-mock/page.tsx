'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ThemeLogo from '../../components/ThemeLogo';

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

function LoginMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasElement = canvas;
    const context = ctx;

    const config = {
      spacing: 118,
      radius: 185,
      push: 46,
      idleRadius: 14,
      line: '180, 196, 199',
      dot: '180, 196, 199',
      activeDot: '255, 255, 255',
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
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

      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

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
            point.offsetX = Math.max(-config.idleRadius, Math.min(config.idleRadius, point.offsetX));
          }

          if (point.offsetY > config.idleRadius || point.offsetY < -config.idleRadius) {
            point.vy *= -1;
            point.offsetY = Math.max(-config.idleRadius, Math.min(config.idleRadius, point.offsetY));
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

      context.strokeStyle = `rgba(${config.line}, ${0.20 + glow * 0.20})`;
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

          context.fillStyle = `rgba(${color}, ${0.32 + glow * 0.50})`;

          context.beginPath();
          context.arc(point.x, point.y, 1.7 + glow * 2.4, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    function draw(time: number) {
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

export default function LoginMockPage() {
  const [showPassword, setShowPassword] = useState(false);

  const leftPanelStyle: CSSProperties = {
    background:
      'radial-gradient(circle at 12% 8%, rgb(211 216 217 / 0.38), transparent 34%), linear-gradient(180deg, var(--theme-surface), var(--theme-app))',
  };

  const heroPanelStyle: CSSProperties = {
    background: '#0a0a0a',
  };

  const heroOverlayStyle: CSSProperties = {
    background: 'transparent',
  };

  return (
    <main className="min-h-screen overflow-hidden bg-app text-content">
      <section className="grid min-h-screen lg:grid-cols-[48%_52%]">
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden border-r border-theme-border px-8 py-12"
          style={leftPanelStyle}
        >


      <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-[100px] bg-gradient-to-l from-[rgb(6_12_15_/_0.18)] via-[rgb(80_92_94_/_0.08)] via-[rgb(211_216_217_/_0.06)] to-transparent blur-2xl" />
         <section className="relative z-10 w-full max-w-[330px] -translate-y-6">

            <div className="mb-12 -ml-3"> 
              <ThemeLogo className="w-[350px]" />
            </div>

            <div>
              <h1 className="font-heading text-[23px] font-semibold leading-[0.96] tracking-[-0.005em] text-content-strong">
                Bienvenido
              </h1>

              <p className="mt-4 text-base leading-6 text-content-muted text-[15px]">
                Accede con tus credenciales para continuar.
              </p>
            </div>

            <form
              className="mt-9 space-y-6"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label
                  htmlFor="email"
                  className="font-sans text-xs font-semibold tracking-[0.05em] text-content-strong text-[14px]"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  className="mt-3 h-[50px] w-full rounded-[15px] border border-theme-border-strong bg-surface px-4 text-sm text-content-strong outline-none ring-4 ring-theme-border/50 transition placeholder:text-content-muted/55"
                  type="email"
                  placeholder="usuario@innovatech.cl"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="font-sans text-xs font-semibold tracking-[0.05em] text-content-strong text-[14px]"
                >
                  Contraseña
                </label>

                <div className="relative mt-3">
                  <input
                    id="password"
                    className="h-[50px] w-full rounded-[15px] border border-theme-border-strong bg-surface px-4 pr-12 text-sm text-content-strong outline-none ring-4 ring-theme-border/50 transition placeholder:text-content-muted/55"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted transition hover:text-content-strong"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className=" mt-9 flex h-[45px] w-full items-center justify-center rounded-full bg-primary px-5 text-sm text-primary-foreground shadow-[0_16px_36px_rgb(6_12_15_/_0.10)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_18px_42px_rgb(6_12_15_/_0.16)] active:translate-y-0"
              >
                Iniciar sesión
              </button>
            </form>
          </section>

          <p className="absolute bottom-8 left-1/2 z-10 w-full -translate-x-1/2 px-8 text-center text-xs tracking-wide text-content-muted/60">
            © 2026 Innovatech Solutions · Todos los derechos reservados
          </p>
        </section>

       <section
            className="relative hidden min-h-screen items-center overflow-hidden px-20 lg:flex"
            style={heroPanelStyle}
          >
            <LoginMeshBackground />

            <div className="absolute inset-0 z-[1]" style={heroOverlayStyle} />

            <div className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_70px_0_100px_rgb(6_12_15_/_0.85),inset_-38px_0_70px_rgb(6_12_15_/_0.55),inset_0_38px_60px_rgb(6_12_15_/_0.42),inset_0_-38px_60px_rgb(6_12_15_/_0.42)]" />

        <section className="relative z-10 max-w-[660px] pl-[40px]">
            <p
              className="mb-6 ml-2 font-mono text-[15px] uppercase tracking-[0.25em] text-[var(--rs-50)]"
            >
              Software & Technology Consulting
            </p>

            <h2 className="font-heading text-[clamp(58px,6.2vw,96px)] leading-[0.92] tracking-[-0.035em] text-[var(--rs-50)]">
              Construimos
              <br />
              el futuro
              <br />
          <span
            className="text-[var(--rs-50)] font-semibold">
            digital.
          </span>
            </h2>

            <p className="mt-9 ml-2 max-w-[540px] text-[18px] leading-[1.65] text-[var(--rs-300)]">
              Espacio de trabajo de Innovatech Solutions para la gestión interna de proyectos y recursos.
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}