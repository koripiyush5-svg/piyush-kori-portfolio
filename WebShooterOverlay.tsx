import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  WebFluidMode,
  SuitTheme,
  WebShot,
  CrawlingSpider,
  createWebShot,
  stepWebShots,
  computeWebGeometry,
  createInitialSpiders,
  stepCrawlingSpider,
  attractNearestSpiderToWeb,
  getWebShooterOverlayStyle,
} from '../utils/spiderPhysics';
import { playWebShootSound } from '../utils/webSound';

interface WebShooterOverlayProps {
  suitTheme?: SuitTheme;
  webMode: WebFluidMode;
  spidersEnabled: boolean;
  soundEnabled?: boolean;
  externalShotTrigger: number;
  onWebShotFired?: (totalShots: number, lastCoord: { x: number; y: number }) => void;
}

/**
 * Interactive full-viewport Spider-Man / Venom overlay:
 * 1. Applies a custom cursor style ('classic-red' Spider-Man reticle vs 'venom' black/silver symbiote reticle).
 * 2. Shoots a web strand from the wrist-shooter origin to the exact cursor click point,
 *    switching from crimson/silk to a black-and-silver symbiote tendril aesthetic when 'venom' is active.
 * 3. Animates autonomous crawling spiders across the portfolio carrying domain symbols on their backs.
 */
export const WebShooterOverlay: React.FC<WebShooterOverlayProps> = ({
  suitTheme = 'classic-red',
  webMode,
  spidersEnabled,
  soundEnabled = true,
  externalShotTrigger,
  onWebShotFired,
}) => {
  const [shots, setShots] = useState<WebShot[]>([]);
  const [soundsPlayedCount, setSoundsPlayedCount] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 720, y: 360 });
  const [spiders, setSpiders] = useState<CrawlingSpider[]>(() =>
    typeof window !== 'undefined'
      ? createInitialSpiders(window.innerWidth, window.innerHeight)
      : createInitialSpiders(1440, 900)
  );
  const shotCounterRef = useRef(0);
  const onWebShotFiredRef = useRef(onWebShotFired);
  onWebShotFiredRef.current = onWebShotFired;

  const activeOverlayStyle = getWebShooterOverlayStyle(suitTheme, webMode);

  // Synchronize custom SVG cursor style on document.body when theme or cartridge changes
  useEffect(() => {
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = activeOverlayStyle.cursorCss;
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [activeOverlayStyle.cursorCss]);

  const fireWebAt = useCallback(
    (clientX: number, clientY: number) => {
      const vw = window.innerWidth || 1440;
      const vh = window.innerHeight || 900;
      const now = Date.now();
      const seed = ((shotCounterRef.current * 0.37) % 1) + 0.1;
      const newShot = createWebShot(clientX, clientY, vw, vh, webMode, now, seed);

      setCursorPos({ x: Math.round(clientX), y: Math.round(clientY) });

      // Trigger subtle Spider-Man "thwip!" sound effect
      const didPlay = playWebShootSound(webMode, soundEnabled);
      if (didPlay) {
        setSoundsPlayedCount((c) => c + 1);
      }

      shotCounterRef.current += 1;
      setShots((prev) => [...prev.slice(-9), newShot]);
      setSpiders((prev) => attractNearestSpiderToWeb(prev, clientX, clientY));

      if (onWebShotFiredRef.current) {
        onWebShotFiredRef.current(shotCounterRef.current, {
          x: Math.round(clientX),
          y: Math.round(clientY),
        });
      }
    },
    [webMode, soundEnabled]
  );

  // Trigger a web shot when requested externally (e.g. via Terminal "shoot" command or HUD button)
  useEffect(() => {
    if (externalShotTrigger > 0) {
      const vw = window.innerWidth || 1440;
      const vh = window.innerHeight || 900;
      const targetX = Math.round(vw * (0.28 + ((externalShotTrigger * 0.19) % 0.48)));
      const targetY = Math.round(vh * (0.25 + ((externalShotTrigger * 0.23) % 0.45)));
      fireWebAt(targetX, targetY);
    }
  }, [externalShotTrigger, fireWebAt]);

  // Global cursor move & click listeners for the custom cursor reticle and web-shooting effect
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      fireWebAt(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [fireWebAt]);

  // Lightweight 60ms physics & spider-crawling interval
  useEffect(() => {
    const interval = window.setInterval(() => {
      const vw = window.innerWidth || 1440;
      const vh = window.innerHeight || 900;
      const dt = 60;

      setShots((prev) => (prev.length > 0 ? stepWebShots(prev, dt) : prev));

      if (spidersEnabled) {
        setSpiders((prev) =>
          prev.map((sp, idx) => stepCrawlingSpider(sp, dt, vw, vh, (Date.now() * 0.001 + idx) % 1))
        );
      }
    }, 60);

    return () => window.clearInterval(interval);
  }, [spidersEnabled]);

  return (
    <div
      data-testid="web-shooter-overlay"
      data-suit-theme={suitTheme}
      data-cursor-style={suitTheme === 'venom' ? 'venom-symbiote' : 'classic-red'}
      data-web-main-stroke={activeOverlayStyle.mainStrandStroke}
      data-web-core-stroke={activeOverlayStyle.symbioteCoreStroke}
      data-active-webs={shots.length}
      data-corner-trails={shots.length * 4}
      data-active-spiders={spidersEnabled ? spiders.length : 0}
      data-sound-enabled={soundEnabled}
      data-sounds-played={soundsPlayedCount}
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      <svg className="w-full h-full">
        {/* Render Active Web Shots, Dynamic Screen-Corner Anchor Trails & Radial Spiderwebs */}
        {shots.map((shot) => {
          const geo = computeWebGeometry(shot);
          const shotStyle = getWebShooterOverlayStyle(suitTheme, shot.mode);

          return (
            <g
              key={shot.id}
              className="web-shot-group"
              data-shot-theme={suitTheme}
              opacity={shot.opacity}
            >
              {/* Dynamic Fading SVG Line Trails Connecting Click Point to the 4 Screen Corners */}
              {geo.cornerTrails.map((trail) => (
                <g
                  key={`corner-${trail.cornerIndex}`}
                  className="web-corner-trail"
                  opacity={trail.trailOpacity}
                >
                  {/* Obsidian / Crimson Catenary Under-Strand for high-contrast Symbiote depth */}
                  <path
                    d={`M ${trail.x1.toFixed(1)} ${trail.y1.toFixed(1)} Q ${trail.controlX.toFixed(1)} ${trail.controlY.toFixed(1)} ${trail.x2.toFixed(1)} ${trail.y2.toFixed(1)}`}
                    fill="none"
                    stroke={shotStyle.symbioteCoreStroke}
                    strokeWidth={shotStyle.isSymbiote ? '3.4' : '2.2'}
                    opacity={shotStyle.isSymbiote ? '0.9' : '0.45'}
                  />
                  {/* Primary Curved Catenary Silk / Silver Symbiote Strand to Screen Corner */}
                  <path
                    d={`M ${trail.x1.toFixed(1)} ${trail.y1.toFixed(1)} Q ${trail.controlX.toFixed(1)} ${trail.controlY.toFixed(1)} ${trail.x2.toFixed(1)} ${trail.y2.toFixed(1)}`}
                    fill="none"
                    stroke={shotStyle.mainStrandStroke}
                    strokeWidth="1.6"
                    strokeDasharray={shot.mode === 'taser' ? '8 4' : '14 5'}
                  />
                  {/* Secondary Taut Linear Guide Filament to Screen Corner */}
                  <line
                    x1={trail.x1}
                    y1={trail.y1}
                    x2={trail.x2}
                    y2={trail.y2}
                    stroke={shotStyle.ringStroke}
                    strokeWidth="1.15"
                    opacity="0.85"
                  />
                  {/* Screen-Corner Silk Anchor Node */}
                  <circle
                    cx={trail.x2}
                    cy={trail.y2}
                    r="3.8"
                    fill={shotStyle.nodeFill}
                    stroke={shotStyle.nodeStroke}
                    strokeWidth="1.2"
                    opacity="0.92"
                  />
                </g>
              ))}

              {/* Symbiote Black / Crimson Core Under-Strand from Wrist Origin to Cursor Click */}
              <line
                x1={geo.mainLine.x1}
                y1={geo.mainLine.y1}
                x2={geo.mainLine.x2}
                y2={geo.mainLine.y2}
                stroke={shotStyle.symbioteCoreStroke}
                strokeWidth={shotStyle.isSymbiote ? '4.4' : '3.0'}
                opacity={shotStyle.isSymbiote ? '0.92' : '0.5'}
              />
              {/* Main Web-Shooter Strand from Wrist Origin to Cursor Click */}
              <line
                x1={geo.mainLine.x1}
                y1={geo.mainLine.y1}
                x2={geo.mainLine.x2}
                y2={geo.mainLine.y2}
                stroke={shotStyle.mainStrandStroke}
                strokeWidth="2.2"
                strokeDasharray={shot.mode === 'taser' ? '6 3' : undefined}
              />
              {/* Secondary braided silk/silver strand */}
              <line
                x1={geo.mainLine.x1 + 4}
                y1={geo.mainLine.y1}
                x2={geo.mainLine.x2}
                y2={geo.mainLine.y2}
                stroke={shotStyle.ringStroke}
                strokeWidth="1.1"
                opacity="0.78"
              />

              {/* Radial Spokes at Click Impact Point */}
              {geo.spokeLines.map((spoke, sIdx) => (
                <g key={sIdx}>
                  {shotStyle.isSymbiote && (
                    <line
                      x1={spoke.x1}
                      y1={spoke.y1}
                      x2={spoke.x2}
                      y2={spoke.y2}
                      stroke={shotStyle.symbioteCoreStroke}
                      strokeWidth="3.2"
                      opacity="0.9"
                    />
                  )}
                  <line
                    x1={spoke.x1}
                    y1={spoke.y1}
                    x2={spoke.x2}
                    y2={spoke.y2}
                    stroke={shotStyle.mainStrandStroke}
                    strokeWidth="1.45"
                  />
                </g>
              ))}

              {/* Concentric Silk / Symbiote Rings */}
              {geo.ringPolygons.map((poly, rIdx) => {
                const pointsStr = poly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                return (
                  <g key={rIdx}>
                    {shotStyle.isSymbiote && (
                      <polygon
                        points={pointsStr}
                        fill="none"
                        stroke={shotStyle.symbioteCoreStroke}
                        strokeWidth="3.0"
                        opacity="0.88"
                      />
                    )}
                    <polygon
                      points={pointsStr}
                      fill="none"
                      stroke={rIdx === 1 ? shotStyle.ringStroke : shotStyle.mainStrandStroke}
                      strokeWidth="1.25"
                      opacity="0.9"
                    />
                  </g>
                );
              })}

              {/* Center Anchor Node at Cursor Click */}
              <circle
                cx={shot.targetX}
                cy={shot.targetY}
                r={shotStyle.isSymbiote ? '5' : '4'}
                fill={shotStyle.nodeFill}
                stroke={shotStyle.nodeStroke}
                strokeWidth="1.6"
              />
            </g>
          );
        })}

        {/* Live Custom Cursor Reticle Visual (Classic Red vs Venom Black/Silver Symbiote) */}
        <g
          data-testid="web-shooter-cursor-reticle"
          data-reticle-theme={suitTheme}
          transform={`translate(${cursorPos.x}, ${cursorPos.y})`}
          opacity="0.88"
        >
          {activeOverlayStyle.isSymbiote ? (
            <>
              {/* Venom Black & Silver Symbiote Cursor Reticle */}
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="rgba(9, 9, 11, 0.55)"
                stroke={activeOverlayStyle.reticleOuterStroke}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              {/* 4 Jagged Symbiote Spikes */}
              <path
                d="M 0 -19 L 2.5 -10 L 0 -12 L -2.5 -10 Z M 19 0 L 10 2.5 L 12 0 L 10 -2.5 Z M 0 19 L 2.5 10 L 0 12 L -2.5 10 Z M -19 0 L -10 2.5 L -12 0 L -10 -2.5 Z"
                fill={activeOverlayStyle.reticleAccentStroke}
                stroke={activeOverlayStyle.reticleInnerFill}
                strokeWidth="0.9"
              />
              <circle
                cx="0"
                cy="0"
                r="3.8"
                fill={activeOverlayStyle.reticleInnerFill}
                stroke={activeOverlayStyle.reticleOuterStroke}
                strokeWidth="1.5"
              />
            </>
          ) : (
            <>
              {/* Classic Red Spider-Man Cursor Reticle */}
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="rgba(225, 29, 72, 0.1)"
                stroke={activeOverlayStyle.reticleOuterStroke}
                strokeWidth="1.4"
              />
              <line x1="0" y1="-17" x2="0" y2="-8" stroke={activeOverlayStyle.reticleAccentStroke} strokeWidth="1.4" />
              <line x1="0" y1="8" x2="0" y2="17" stroke={activeOverlayStyle.reticleAccentStroke} strokeWidth="1.4" />
              <line x1="-17" y1="0" x2="-8" y2="0" stroke={activeOverlayStyle.reticleAccentStroke} strokeWidth="1.4" />
              <line x1="8" y1="0" x2="17" y2="0" stroke={activeOverlayStyle.reticleAccentStroke} strokeWidth="1.4" />
              <circle
                cx="0"
                cy="0"
                r="3.2"
                fill={activeOverlayStyle.reticleInnerFill}
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
            </>
          )}
        </g>

        {/* Render Roaming Crawling Spiders with Domain Symbols on their Backs */}
        {spidersEnabled &&
          spiders.map((sp) => {
            const rotDeg = (sp.angle * 180) / Math.PI + 90;
            const legSwing = Math.sin(sp.legPhase) * 3.5;
            const tailX = sp.x - Math.cos(sp.angle) * 44;
            const tailY = sp.y - Math.sin(sp.angle) * 44;

            return (
              <g key={sp.id} opacity="0.9">
                {/* Directional Silk Dragline trailing behind the crawling spider */}
                <line
                  x1={tailX}
                  y1={tailY}
                  x2={sp.x}
                  y2={sp.y}
                  stroke="var(--theme-spider-stroke)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.45"
                />

                <g transform={`translate(${sp.x.toFixed(1)}, ${sp.y.toFixed(1)}) rotate(${rotDeg.toFixed(1)})`}>
                  {/* 8 Articulated Crawling Legs */}
                  <g stroke="var(--theme-spider-stroke)" strokeWidth="1.6" strokeLinecap="round" fill="none">
                    <path d={`M-5 -4 L-14 ${-12 + legSwing} L-20 ${-18 - legSwing}`} />
                    <path d={`M-6 -1 L-17 ${-3 - legSwing} L-23 ${-5 + legSwing}`} />
                    <path d={`M-6 3 L-17 ${7 + legSwing} L-23 ${12 - legSwing}`} />
                    <path d={`M-5 6 L-14 ${14 - legSwing} L-19 ${22 + legSwing}`} />

                    <path d={`M5 -4 L14 ${-12 - legSwing} L20 ${-18 + legSwing}`} />
                    <path d={`M6 -1 L17 ${-3 + legSwing} L23 ${-5 - legSwing}`} />
                    <path d={`M6 3 L17 ${7 - legSwing} L23 ${12 + legSwing}`} />
                    <path d={`M5 6 L14 ${14 + legSwing} L19 ${22 - legSwing}`} />
                  </g>

                  {/* Spider Head */}
                  <circle cx="0" cy="-6" r="4.5" fill="#18181B" stroke="var(--theme-spider-stroke)" strokeWidth="1.2" />
                  <circle cx="-1.6" cy="-8" r="0.9" fill="var(--theme-accent-soft)" />
                  <circle cx="1.6" cy="-8" r="0.9" fill="var(--theme-accent-soft)" />

                  {/* Spider Abdomen Carrying Domain Symbol */}
                  <ellipse
                    cx="0"
                    cy="6"
                    rx="9.5"
                    ry="11.5"
                    fill="#09090B"
                    stroke={sp.isInvestigatingWeb ? 'var(--theme-spider-joint)' : 'var(--theme-spider-stroke)'}
                    strokeWidth="1.5"
                  />
                </g>

                {/* Upright Domain Symbol Label on the Spider's Back so it's always legible */}
                <text
                  x={sp.x}
                  y={sp.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {sp.symbolLabel}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};
