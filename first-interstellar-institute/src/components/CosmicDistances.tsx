import { useEffect, useRef, useState } from 'react';

interface Destination {
  label: string;
  distance_km: number;
  distance_label: string;
  nep_time: string;
  fusion_time: string;
  warp_time: string;
}

const DESTINATIONS: Destination[] = [
  {
    label: 'Mars',
    distance_km: 2.25e8,
    distance_label: '225 million km',
    nep_time: '~3 months',
    fusion_time: '~2 weeks',
    warp_time: '~12 seconds',
  },
  {
    label: 'Saturn',
    distance_km: 1.2e9,
    distance_label: '1.2 billion km',
    nep_time: '2.2 years',
    fusion_time: '6 months',
    warp_time: '6.7 minutes',
  },
  {
    label: 'Voyager 1',
    distance_km: 2.4e10,
    distance_label: '24 billion km',
    nep_time: '~44 years',
    fusion_time: '~10 years',
    warp_time: '~2.2 hours',
  },
  {
    label: 'Proxima Centauri',
    distance_km: 4.01e13,
    distance_label: '4.24 light-years',
    nep_time: '2,093 years',
    fusion_time: '102 years',
    warp_time: '5.2 months',
  },
  {
    label: 'TRAPPIST-1',
    distance_km: 3.69e14,
    distance_label: '39 light-years',
    nep_time: '~19,000 years',
    fusion_time: '~940 years',
    warp_time: '~3.9 years',
  },
  {
    label: 'Kepler-452b',
    distance_km: 1.325e16,
    distance_label: '1,400 light-years',
    nep_time: '~690,000 years',
    fusion_time: '~33,700 years',
    warp_time: '~140 years',
  },
  {
    label: 'Galactic Center',
    distance_km: 2.46e17,
    distance_label: '26,000 light-years',
    nep_time: '~12.7 million years',
    fusion_time: '~620,000 years',
    warp_time: '~2,600 years',
  },
  {
    label: 'Andromeda Galaxy',
    distance_km: 2.365e19,
    distance_label: '2.5 million light-years',
    nep_time: '~1.2 billion years',
    fusion_time: '~60 million years',
    warp_time: '~250,000 years',
  },
  {
    label: 'Observable Universe Edge',
    distance_km: 4.4e23,
    distance_label: '46.5 billion light-years',
    nep_time: '~23 trillion years',
    fusion_time: '~1.1 trillion years',
    warp_time: '~4.65 billion years',
  },
];

const PROPULSION_COLORS = {
  nep: '#ff6b6b',
  fusion: '#ffd93d',
  warp: '#6bffb8',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function formatExponential(km: number): string {
  if (km < 1e9) return `${(km / 1e6).toFixed(0)}M km`;
  if (km < 1e12) return `${(km / 1e9).toFixed(1)}B km`;
  return `${(km / 9.461e12).toFixed(km > 1e16 ? 0 : 2)} ly`;
}

export default function CosmicDistances({ id }: { id?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [activeStage, setActiveStage] = useState(0);
  const stageRef = useRef(0);
  const progressRef = useRef(1);
  const pauseRef = useRef(4500);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    function resize() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
    }

    resize();
    window.addEventListener('resize', resize);

    const STAGE_DURATION = 6000;
    const PAUSE_DURATION = 4500;
    const TRANSITION_DURATION = 2000;

    let lastTime = performance.now();

    function draw(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      const W = canvas!.width;
      const H = canvas!.height;
      const dpr = dprRef.current;

      ctx!.clearRect(0, 0, W, H);

      const stage = stageRef.current;
      const totalStages = DESTINATIONS.length;

      if (pauseRef.current > 0) {
        pauseRef.current -= dt;
        if (pauseRef.current <= 0) {
          pauseRef.current = 0;
          progressRef.current = 0;
          stageRef.current = (stage + 1) % totalStages;
          setActiveStage(stageRef.current);
        }
      } else {
        progressRef.current += dt / TRANSITION_DURATION;
        if (progressRef.current >= 1) {
          progressRef.current = 1;
          pauseRef.current = stage === totalStages - 1 ? STAGE_DURATION : PAUSE_DURATION;
        }
      }

      const t = easeInOutCubic(Math.min(progressRef.current, 1));

      const prevStage = (stage - 1 + totalStages) % totalStages;
      const prevDest = DESTINATIONS[prevStage];
      const currDest = DESTINATIONS[stage];

      const logPrev = Math.log10(prevDest.distance_km);
      const logCurr = Math.log10(currDest.distance_km);
      const logMax = stage === 0 || pauseRef.current > 0
        ? logCurr
        : lerp(logPrev, logCurr, t);

      const padLeft = 80 * dpr;
      const padRight = 60 * dpr;
      const barY = H * 0.42;
      const barW = W - padLeft - padRight;

      // Background gradient along bar
      const grad = ctx!.createLinearGradient(padLeft, 0, padLeft + barW, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0.03)');
      grad.addColorStop(1, 'rgba(255,255,255,0.01)');
      ctx!.fillStyle = grad;
      ctx!.fillRect(padLeft, barY - 1 * dpr, barW, 2 * dpr);

      // Main axis line
      ctx!.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx!.lineWidth = 1.5 * dpr;
      ctx!.beginPath();
      ctx!.moveTo(padLeft, barY);
      ctx!.lineTo(padLeft + barW, barY);
      ctx!.stroke();

      // Earth marker
      ctx!.fillStyle = '#4da6ff';
      ctx!.beginPath();
      ctx!.arc(padLeft, barY, 5 * dpr, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.font = `${11 * dpr}px "JetBrains Mono", monospace`;
      ctx!.fillStyle = 'rgba(255,255,255,0.7)';
      ctx!.textAlign = 'center';
      ctx!.fillText('EARTH', padLeft, barY + 22 * dpr);

      // Draw all destinations up to current stage
      // Collision avoidance: current label has priority, others checked against all shown labels
      const positions: { x: number; i: number }[] = [];
      for (let i = 0; i <= stage; i++) {
        const dest = DESTINATIONS[i];
        const logDist = Math.log10(dest.distance_km);
        const frac = logDist / logMax;
        const x = padLeft + frac * barW;
        if (x >= padLeft && x <= padLeft + barW + 10) {
          positions.push({ x, i });
        }
      }

      const minSpacing = 150 * dpr;
      const shownLabelXs: number[] = [];

      // Reserve current destination's position first
      const currentPos = positions.find(p => p.i === stage);
      if (currentPos) shownLabelXs.push(currentPos.x);

      for (const { x, i } of positions) {
        const dest = DESTINATIONS[i];
        const isCurrent = i === stage;
        const alpha = isCurrent ? Math.min(t * 2, 1) : Math.max(0.3, 1 - (stage - i) * 0.15);

        // Distance tick
        ctx!.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
        ctx!.lineWidth = 1 * dpr;
        ctx!.beginPath();
        ctx!.moveTo(x, barY - 8 * dpr);
        ctx!.lineTo(x, barY + 8 * dpr);
        ctx!.stroke();

        // Destination dot
        ctx!.beginPath();
        ctx!.arc(x, barY, (isCurrent ? 6 : 3) * dpr, 0, Math.PI * 2);
        ctx!.fillStyle = isCurrent
          ? `rgba(255,255,255,${alpha})`
          : `rgba(180,180,180,${alpha * 0.7})`;
        ctx!.fill();

        if (isCurrent) {
          ctx!.strokeStyle = `rgba(255,255,255,${alpha * 0.3})`;
          ctx!.lineWidth = 1.5 * dpr;
          ctx!.stroke();

          const pulseAlpha = Math.sin(now / 600) * 0.15 + 0.15;
          ctx!.beginPath();
          ctx!.arc(x, barY, 10 * dpr, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255,255,255,${pulseAlpha})`;
          ctx!.lineWidth = 1 * dpr;
          ctx!.stroke();
        }

        // Label: current always shows; others only if far from ALL shown labels
        let showLabel = isCurrent;
        if (!isCurrent) {
          showLabel = !shownLabelXs.some(sx => Math.abs(x - sx) < minSpacing);
          if (showLabel) shownLabelXs.push(x);
        }

        if (showLabel) {
          ctx!.textAlign = 'center';
          ctx!.font = `bold ${(isCurrent ? 14 : 11) * dpr}px "EB Garamond", serif`;
          ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx!.fillText(dest.label, x, barY - 18 * dpr);

          ctx!.font = `${10 * dpr}px "JetBrains Mono", monospace`;
          ctx!.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
          ctx!.fillText(dest.distance_label, x, barY + 38 * dpr);
        }
      }

      // Scale indicator
      ctx!.textAlign = 'right';
      ctx!.font = `${9 * dpr}px "JetBrains Mono", monospace`;
      ctx!.fillStyle = 'rgba(255,255,255,0.35)';
      ctx!.fillText(`scale: ${formatExponential(Math.pow(10, logMax))}`, padLeft + barW, barY - 40 * dpr);

      // Transit time comparison (below the bar)
      const tableY = barY + 70 * dpr;
      const dest = currDest;
      const tableAlpha = pauseRef.current > 0 ? 1 : Math.min(t * 3 - 1, 1);

      if (tableAlpha > 0) {
        const methods = [
          { label: 'Nuclear Electric (NEP)', time: dest.nep_time, color: PROPULSION_COLORS.nep },
          { label: 'Fusion Propulsion', time: dest.fusion_time, color: PROPULSION_COLORS.fusion },
          { label: 'Space Warp (10c)', time: dest.warp_time, color: PROPULSION_COLORS.warp },
        ];

        const colX = W / 2;
        ctx!.textAlign = 'center';
        ctx!.font = `${10 * dpr}px "JetBrains Mono", monospace`;
        ctx!.fillStyle = `rgba(255,255,255,${tableAlpha * 0.5})`;
        ctx!.fillText(`TRANSIT TIME TO ${dest.label.toUpperCase()}`, colX, tableY);

        methods.forEach((m, idx) => {
          const y = tableY + (28 + idx * 32) * dpr;
          const a = Math.max(0, Math.min((tableAlpha - idx * 0.1) * 1.2, 1));

          // Color dot
          ctx!.beginPath();
          ctx!.arc(colX - 160 * dpr, y, 4 * dpr, 0, Math.PI * 2);
          ctx!.fillStyle = hexToRgba(m.color, a);
          ctx!.fill();

          // Method name
          ctx!.textAlign = 'left';
          ctx!.font = `${11 * dpr}px "EB Garamond", serif`;
          ctx!.fillStyle = `rgba(255,255,255,${a * 0.85})`;
          ctx!.fillText(m.label, colX - 145 * dpr, y + 4 * dpr);

          // Time
          ctx!.textAlign = 'right';
          ctx!.font = `bold ${13 * dpr}px "JetBrains Mono", monospace`;
          ctx!.fillStyle = hexToRgba(m.color, a);
          ctx!.fillText(m.time, colX + 160 * dpr, y + 4 * dpr);
        });
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id={id} className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="part-label block mb-4">The Time–Distance Problem</span>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 text-white">
          Why We Need Breakthrough Propulsion
        </h2>
        <div className="sep" />
        <p className="text-sm md:text-base text-[#888] mt-4 max-w-2xl mx-auto italic">
          The distances between stars are so vast that even our most advanced propulsion concepts 
          require centuries. Only a breakthrough at the frontier of physics can make interstellar 
          travel practical within a human lifetime.
        </p>
      </div>

      <div ref={containerRef} className="relative w-full h-[320px] md:h-[380px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Stage indicator dots */}
      <div className="flex justify-center gap-2 mt-4">
        {DESTINATIONS.map((dest, i) => (
          <button
            key={dest.label}
            onClick={() => {
              stageRef.current = i;
              progressRef.current = 1;
              pauseRef.current = 4500;
              setActiveStage(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStage === i ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
            }`}
            title={dest.label}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: PROPULSION_COLORS.nep }} />
          <span className="text-[#888]">NEP — Known physics, known engineering</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: PROPULSION_COLORS.fusion }} />
          <span className="text-[#888]">Fusion — Known physics, unknown engineering</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: PROPULSION_COLORS.warp }} />
          <span className="text-[#888]">Warp — Unknown physics, unknown engineering</span>
        </span>
      </div>
    </section>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
