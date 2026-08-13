// ┌─────────────────────────────────────────────────────────────────┐
// │  RadarScanner — Full Sci-Fi HUD                                  │
// │  Concentric rings · Rotating sphere · Sweep arm · Module pods   │
// └─────────────────────────────────────────────────────────────────┘
import { useEffect, useRef } from 'react';

const MODULES = [
  { key: 'ports',      angle: -90,  icon: '🛰️', label: 'PORT SCAN',   short: 'PRT' },
  { key: 'subdomains', angle: -30,  icon: '🌐', label: 'SUBDOMAINS',  short: 'SUB' },
  { key: 'emails',     angle: 30,   icon: '✉️',  label: 'EMAILS',      short: 'EML' },
  { key: 'breach',     angle: 90,   icon: '🔓', label: 'BREACH',      short: 'BRH' },
  { key: 'social',     angle: 150,  icon: '🕵️', label: 'SOCIAL',      short: 'SOC' },
  { key: 'phone',      angle: 210,  icon: '📱', label: 'PHONE',       short: 'PHN' },
];

const SIZE   = 560;
const CENTER = SIZE / 2;
const ORBIT  = 198;
const POD    = 80;

function degToXY(angle, r = ORBIT) {
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

// Rotating wire-sphere canvas
function SphereCanvas({ scanning }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 110, H = 110;
    canvas.width  = W;
    canvas.height = H;
    let t = 0;

    const RINGS = 7;
    const R = 46;
    const dots = [];
    // Generate sphere wireframe dots
    for (let lat = 0; lat <= RINGS; lat++) {
      const phi = (lat / RINGS) * Math.PI;
      const lngCount = lat === 0 || lat === RINGS ? 1 : Math.max(4, Math.round(8 * Math.sin(phi)));
      for (let lng = 0; lng < lngCount; lng++) {
        const theta = (lng / lngCount) * 2 * Math.PI;
        dots.push({
          x: R * Math.sin(phi) * Math.cos(theta),
          y: R * Math.cos(phi),
          z: R * Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += scanning ? 0.012 : 0.004;

      const cosT = Math.cos(t), sinT = Math.sin(t);
      const tiltX = Math.PI / 6;
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);

      // Project + sort
      const projected = dots.map(d => {
        // Rotate around Y
        const rx = d.x * cosT - d.z * sinT;
        const rz = d.x * sinT + d.z * cosT;
        // Tilt around X
        const ry2 = d.y * cosX - rz * sinX;
        const rz2 = d.y * sinX + rz * cosX;
        const fov = 220 / (220 + rz2);
        return {
          sx: W / 2 + rx * fov,
          sy: H / 2 + ry2 * fov,
          z:  rz2,
          fov,
        };
      });
      projected.sort((a, b) => a.z - b.z);

      // Draw rings (latitude circles)
      for (let lat = 1; lat < RINGS; lat++) {
        const phi = (lat / RINGS) * Math.PI;
        const ringDots = [];
        const lngCount = 64;
        for (let lng = 0; lng <= lngCount; lng++) {
          const theta = (lng / lngCount) * 2 * Math.PI;
          const dx = R * Math.sin(phi) * Math.cos(theta);
          const dy = R * Math.cos(phi);
          const dz = R * Math.sin(phi) * Math.sin(theta);
          const rx = dx * cosT - dz * sinT;
          const rz = dx * sinT + dz * cosT;
          const ry2 = dy * cosX - rz * sinX;
          const rz2 = dy * sinX + rz * cosX;
          const fov = 220 / (220 + rz2);
          ringDots.push({ sx: W / 2 + rx * fov, sy: H / 2 + ry2 * fov, z: rz2 });
        }
        ringDots.forEach((pt, i) => {
          if (i === 0) return;
          const prev = ringDots[i - 1];
          const alpha = pt.z < 0 ? 0.06 : 0.28;
          const glowAlpha = scanning && pt.z >= 0 ? 0.55 : alpha;
          ctx.strokeStyle = scanning
            ? `rgba(34,211,238,${glowAlpha})`
            : `rgba(34,211,238,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(prev.sx, prev.sy);
          ctx.lineTo(pt.sx, pt.sy);
          ctx.stroke();
        });
      }

      // Draw longitude lines
      for (let lng = 0; lng < 8; lng++) {
        const theta = (lng / 8) * 2 * Math.PI;
        const mDots = [];
        const latCount = 48;
        for (let lat = 0; lat <= latCount; lat++) {
          const phi = (lat / latCount) * Math.PI;
          const dx = R * Math.sin(phi) * Math.cos(theta);
          const dy = R * Math.cos(phi);
          const dz = R * Math.sin(phi) * Math.sin(theta);
          const rx = dx * cosT - dz * sinT;
          const rz = dx * sinT + dz * cosT;
          const ry2 = dy * cosX - rz * sinX;
          const rz2 = dy * sinX + rz * cosX;
          const fov = 220 / (220 + rz2);
          mDots.push({ sx: W / 2 + rx * fov, sy: H / 2 + ry2 * fov, z: rz2 });
        }
        mDots.forEach((pt, i) => {
          if (i === 0) return;
          const prev = mDots[i - 1];
          const alpha = pt.z < 0 ? 0.05 : 0.22;
          ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(prev.sx, prev.sy);
          ctx.lineTo(pt.sx, pt.sy);
          ctx.stroke();
        });
      }

      // Glowing center dot
      const glowR = scanning ? (Math.sin(t * 4) * 2 + 5) : 3;
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, glowR * 3);
      grad.addColorStop(0, 'rgba(34,211,238,0.9)');
      grad.addColorStop(0.4, 'rgba(34,211,238,0.4)');
      grad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(W/2, H/2, glowR * 3, 0, Math.PI * 2);
      ctx.fill();

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [scanning]);

  return <canvas ref={canvasRef} style={{ width: 110, height: 110 }} />;
}

export default function RadarScanner({ target, scanning, podStages, onPodClick }) {
  // Animated tick marks data array
  const tickCount = 72;

  return (
    <div
      className="relative select-none"
      style={{ width: SIZE, height: SIZE, flexShrink: 0 }}
    >
      {/* ── Outer HUD frame corners ──────────────────────────── */}
      {[
        { top: 0,    left: 0,    borderTop: '2px solid', borderLeft: '2px solid' },
        { top: 0,    right: 0,   borderTop: '2px solid', borderRight: '2px solid' },
        { bottom: 0, left: 0,    borderBottom: '2px solid', borderLeft: '2px solid' },
        { bottom: 0, right: 0,   borderBottom: '2px solid', borderRight: '2px solid' },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...s,
            width: 28, height: 28,
            borderColor: 'rgba(34,211,238,0.5)',
          }}
        />
      ))}

      {/* ── SVG: rings, spokes, ticks, connectors ───────────── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={SIZE} height={SIZE}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.0)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.15)" />
          </radialGradient>
        </defs>

        {/* Concentric rings */}
        {[0.96, 0.78, 0.60, 0.42, 0.26].map((scale, i) => (
          <circle
            key={i}
            cx={CENTER} cy={CENTER}
            r={SIZE * scale / 2}
            fill="none"
            stroke={`rgba(34,211,238,${[0.20, 0.12, 0.10, 0.08, 0.06][i]})`}
            strokeWidth={[1.5, 1, 1, 0.8, 0.6][i]}
          />
        ))}

        {/* Tick marks around outermost ring */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
          const outerR = SIZE * 0.96 / 2;
          const isMajor = i % 6 === 0;
          const tickLen = isMajor ? 12 : 5;
          const x1 = CENTER + (outerR - tickLen) * Math.cos(angle);
          const y1 = CENTER + (outerR - tickLen) * Math.sin(angle);
          const x2 = CENTER + outerR * Math.cos(angle);
          const y2 = CENTER + outerR * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'rgba(34,211,238,0.55)' : 'rgba(34,211,238,0.18)'}
              strokeWidth={isMajor ? 1.5 : 0.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Cross-hair */}
        <line x1={CENTER} y1={16} x2={CENTER} y2={SIZE - 16}
          stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="4 8" />
        <line x1={16} y1={CENTER} x2={SIZE - 16} y2={CENTER}
          stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="4 8" />

        {/* 30° grid spokes */}
        {[30, 60, 90, 120, 150].map(deg => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={CENTER - 270 * Math.cos(r)} y1={CENTER - 270 * Math.sin(r)}
              x2={CENTER + 270 * Math.cos(r)} y2={CENTER + 270 * Math.sin(r)}
              stroke="rgba(34,211,238,0.04)" strokeWidth="0.8"
            />
          );
        })}

        {/* Connector lines — center to each pod */}
        {MODULES.map(({ key, angle }) => {
          const { x, y } = degToXY(angle);
          const active = podStages[key] === 'visible';
          return (
            <line
              key={key}
              x1={CENTER} y1={CENTER}
              x2={x}      y2={y}
              stroke={active ? 'rgba(34,211,238,0.7)' : 'rgba(255,255,255,0.07)'}
              strokeWidth={active ? 1.5 : 0.8}
              strokeDasharray={active ? 'none' : '3 9'}
              className={active ? 'connector-active' : ''}
              style={{ transition: 'stroke 0.5s ease, stroke-width 0.4s ease' }}
              filter={active ? 'url(#glowFilter)' : undefined}
            />
          );
        })}

        {/* Orbit dot rings per module */}
        {MODULES.map(({ key, angle }) => {
          const { x, y } = degToXY(angle);
          const active = podStages[key] === 'visible';
          return (
            <circle
              key={`orbit-${key}`}
              cx={x} cy={y} r={3}
              fill={active ? 'rgba(34,211,238,0.9)' : 'rgba(255,255,255,0.12)'}
              filter={active ? 'url(#glowFilter)' : undefined}
              style={{ transition: 'fill 0.4s ease' }}
            />
          );
        })}

        {/* Angle labels on outer ring at 0°, 90°, 180°, 270° */}
        {[
          { angle: 0,   label: '000°' },
          { angle: 90,  label: '090°' },
          { angle: 180, label: '180°' },
          { angle: 270, label: '270°' },
        ].map(({ angle, label }) => {
          const r = (angle * Math.PI) / 180;
          const dist = SIZE * 0.96 / 2 + 14;
          return (
            <text
              key={angle}
              x={CENTER + dist * Math.cos(r)}
              y={CENTER + dist * Math.sin(r)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(34,211,238,0.35)"
              fontSize={7.5}
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="1"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* ── Radar sweep arm ──────────────────────────────────── */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: '50%', overflow: 'hidden' }}>
          <div
            className="radar-arm absolute inset-0"
            style={{
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, transparent 280deg, rgba(34,211,238,0.04) 310deg, rgba(34,211,238,0.22) 345deg, rgba(34,211,238,0.5) 358deg, rgba(34,211,238,0.04) 360deg)',
            }}
          />
        </div>
      )}

      {/* ── Scanning ring pulse ──────────────────────────────── */}
      {scanning && (
        <div
          className="absolute pointer-events-none animate-pulse"
          style={{
            inset: 0,
            borderRadius: '50%',
            border: '1.5px solid rgba(34,211,238,0.4)',
            boxShadow: '0 0 40px rgba(34,211,238,0.12), inset 0 0 60px rgba(34,211,238,0.04)',
          }}
        />
      )}

      {/* ── Central target node ──────────────────────────────── */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center rounded-full"
        style={{
          width: 138, height: 138,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(2,18,30,0.98) 55%, rgba(1,8,18,0.96) 100%)',
          border: scanning
            ? '1.5px solid rgba(34,211,238,0.9)'
            : '1.5px solid rgba(34,211,238,0.3)',
          boxShadow: scanning
            ? '0 0 50px rgba(34,211,238,0.35), 0 0 120px rgba(34,211,238,0.08), inset 0 0 30px rgba(34,211,238,0.08)'
            : '0 0 20px rgba(34,211,238,0.08), inset 0 0 12px rgba(34,211,238,0.03)',
          transition: 'all 0.6s ease',
        }}
      >
        <SphereCanvas scanning={scanning} />
        <span className="text-[8px] text-cyan-500/55 font-mono uppercase tracking-widest mt-0.5">
          {scanning ? 'SWEEPING' : target ? '◉ TARGET' : '◎ STANDBY'}
        </span>
        {target && (
          <span className="text-[9px] font-bold text-white font-mono truncate max-w-[118px] text-center leading-tight px-1 mt-0.5" title={target}>
            {target}
          </span>
        )}
      </div>

      {/* ── Module pods ──────────────────────────────────────── */}
      {MODULES.map(({ key, angle, icon, label, short }) => {
        const { x, y } = degToXY(angle);
        const active = podStages[key] === 'visible';

        return (
          <button
            key={key}
            title={active ? `Inspect ${label}` : label}
            onClick={() => active && onPodClick(key)}
            style={{
              position: 'absolute',
              left: x - POD / 2,
              top:  y - POD / 2,
              width:  POD,
              height: POD,
              background: active
                ? 'radial-gradient(circle, rgba(6,45,65,0.98) 30%, rgba(2,22,38,0.96) 100%)'
                : 'radial-gradient(circle, rgba(6,12,24,0.96) 30%, rgba(2,6,14,0.94) 100%)',
              border: active
                ? '1.5px solid rgba(34,211,238,0.85)'
                : '1px solid rgba(255,255,255,0.12)',
              boxShadow: active
                ? '0 0 30px rgba(34,211,238,0.4), inset 0 0 18px rgba(34,211,238,0.1)'
                : '0 0 10px rgba(0,0,0,0.6), inset 0 0 6px rgba(255,255,255,0.015)',
              cursor:     active ? 'pointer' : 'default',
              transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`rounded-full z-10 flex flex-col items-center justify-center gap-0.5 ${active ? 'pod-active' : ''}`}
          >
            {/* HUD corner brackets */}
            {active && (
              <>
                <span style={{ position:'absolute',top:4,left:4,width:8,height:8,borderTop:'1px solid rgba(34,211,238,0.7)',borderLeft:'1px solid rgba(34,211,238,0.7)' }} />
                <span style={{ position:'absolute',top:4,right:4,width:8,height:8,borderTop:'1px solid rgba(34,211,238,0.7)',borderRight:'1px solid rgba(34,211,238,0.7)' }} />
                <span style={{ position:'absolute',bottom:4,left:4,width:8,height:8,borderBottom:'1px solid rgba(34,211,238,0.7)',borderLeft:'1px solid rgba(34,211,238,0.7)' }} />
                <span style={{ position:'absolute',bottom:4,right:4,width:8,height:8,borderBottom:'1px solid rgba(34,211,238,0.7)',borderRight:'1px solid rgba(34,211,238,0.7)' }} />
              </>
            )}
            <span className="text-xl leading-none">{icon}</span>
            <span
              className="text-[7.5px] font-mono font-bold uppercase tracking-wide mt-0.5"
              style={{ color: active ? '#22d3ee' : 'rgba(255,255,255,0.28)' }}
            >
              {short}
            </span>
            {active
              ? <span className="text-[6px] text-green-400 font-mono leading-tight animate-pulse">● LIVE</span>
              : <span className="text-[6px] text-gray-700 font-mono leading-tight">○ idle</span>
            }
          </button>
        );
      })}
    </div>
  );
}
