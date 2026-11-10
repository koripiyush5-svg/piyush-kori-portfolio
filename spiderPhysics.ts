import { DomainId, DOMAIN_SKILLS, PROFILE_DATA, PROJECTS_DATA } from '../data/portfolioData';

export type WebFluidMode = 'classic' | 'impact' | 'taser';

export interface WebShot {
  id: string;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  viewportWidth: number;
  viewportHeight: number;
  createdAt: number;
  progress: number; // 0 to 1 (shoot travel)
  opacity: number;  // 1 down to 0 (fade out)
  mode: WebFluidMode;
  radius: number;
  spokes: number;
  seed: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface CornerTrailLine {
  cornerIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  controlX: number;
  controlY: number;
  trailOpacity: number;
}

export interface WebGeometry {
  mainLine: { x1: number; y1: number; x2: number; y2: number };
  spokeLines: { x1: number; y1: number; x2: number; y2: number }[];
  ringPolygons: Point2D[][];
  cornerTrails: CornerTrailLine[];
}

export interface CrawlingSpider {
  id: string;
  domainId: DomainId;
  symbolLabel: string;
  domainName: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  angle: number; // radians
  legPhase: number;
  speed: number;
  scale: number;
  isInvestigatingWeb: boolean;
}

export interface TerminalEntry {
  id: string;
  command: string;
  output: string[];
  isError?: boolean;
}

/**
 * Creates a new WebShot instance when the user clicks at (targetX, targetY).
 * The web shoots from a bottom-center wrist-shooter anchor toward the cursor.
 */
export function createWebShot(
  targetX: number,
  targetY: number,
  viewportWidth: number,
  viewportHeight: number,
  mode: WebFluidMode = 'classic',
  now: number = Date.now(),
  seed: number = 0.5
): WebShot {
  const clampedWidth = Math.max(320, viewportWidth);
  const clampedHeight = Math.max(320, viewportHeight);

  // Origin from left or right wrist shooter near the bottom of the viewport depending on click side
  const isRightSide = targetX >= clampedWidth * 0.5;
  const originX = isRightSide ? clampedWidth * 0.62 : clampedWidth * 0.38;
  const originY = clampedHeight - 12;

  const baseRadius = mode === 'impact' ? 68 : mode === 'taser' ? 58 : 52;
  const spokes = mode === 'impact' ? 10 : 8;

  return {
    id: `web-${now}-${Math.round(targetX)}-${Math.round(targetY)}`,
    originX,
    originY,
    targetX,
    targetY,
    viewportWidth: clampedWidth,
    viewportHeight: clampedHeight,
    createdAt: now,
    progress: 0.15,
    opacity: 1,
    mode,
    radius: baseRadius + (seed - 0.5) * 12,
    spokes,
    seed,
  };
}

/**
 * Advances active web shots over elapsed time (ms), removing expired ones.
 */
export function stepWebShots(shots: WebShot[], dtMs: number): WebShot[] {
  const safeDt = Math.max(0, Math.min(dtMs, 200));
  const updated: WebShot[] = [];

  for (const shot of shots) {
    // Fast initial shoot-out (reaches 1.0 in ~120ms)
    const nextProgress = Math.min(1, shot.progress + safeDt / 110);
    // Begins fading after reaching target, lasting ~4.5 seconds
    const fadeRate = nextProgress >= 1 ? safeDt / 4500 : 0;
    const nextOpacity = Math.max(0, shot.opacity - fadeRate);

    if (nextOpacity > 0.03) {
      updated.push({
        ...shot,
        progress: nextProgress,
        opacity: Number(nextOpacity.toFixed(4)),
      });
    }
  }

  return updated;
}

/**
 * Computes the shoot line, radial spokes, concentric silk rings, and dynamic
 * fading SVG corner trails connecting the click point to the 4 screen corners.
 */
export function computeWebGeometry(shot: WebShot): WebGeometry {
  const currentX = shot.originX + (shot.targetX - shot.originX) * shot.progress;
  const currentY = shot.originY + (shot.targetY - shot.originY) * shot.progress;

  const mainLine = {
    x1: shot.originX,
    y1: shot.originY,
    x2: currentX,
    y2: currentY,
  };

  // Dynamic corner anchor trails connecting (targetX, targetY) to the 4 screen corners
  const vw = shot.viewportWidth || 1440;
  const vh = shot.viewportHeight || 900;
  const corners: Point2D[] = [
    { x: 0, y: 0 },
    { x: vw, y: 0 },
    { x: vw, y: vh },
    { x: 0, y: vh },
  ];
  const maxDiag = Math.hypot(vw, vh) || 1;
  const trailReach = Math.min(1, Math.max(0.25, shot.progress));
  const cornerTrails: CornerTrailLine[] = corners.map((corner, cornerIndex) => {
    const endX = shot.targetX + (corner.x - shot.targetX) * trailReach;
    const endY = shot.targetY + (corner.y - shot.targetY) * trailReach;
    const midX = (shot.targetX + endX) * 0.5;
    const midY = (shot.targetY + endY) * 0.5;
    const sagOffset = (cornerIndex % 2 === 0 ? 22 : -22) * trailReach;
    const dist = Math.hypot(corner.x - shot.targetX, corner.y - shot.targetY);
    const proximityWeight = Math.max(0.58, 0.92 - (dist / maxDiag) * 0.25);
    const trailOpacity = Number(
      Math.max(0, Math.min(1, Math.pow(shot.opacity, 1.15) * proximityWeight)).toFixed(4)
    );

    return {
      cornerIndex,
      x1: shot.targetX,
      y1: shot.targetY,
      x2: endX,
      y2: endY,
      controlX: midX + sagOffset * 0.4,
      controlY: midY + Math.abs(sagOffset),
      trailOpacity,
    };
  });

  // Radial web expands once the strand is >= 35% of the way to the cursor
  const bloomFactor = shot.progress < 0.35 ? 0 : (shot.progress - 0.35) / 0.65;
  const effectiveRadius = shot.radius * bloomFactor;

  const spokeLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const ringPolygons: Point2D[][] = [];

  if (effectiveRadius <= 1) {
    return { mainLine, spokeLines, ringPolygons, cornerTrails };
  }

  const spokeAngles: number[] = [];
  const angleOffset = shot.seed * Math.PI * 0.25;

  for (let i = 0; i < shot.spokes; i++) {
    const theta = angleOffset + (i * Math.PI * 2) / shot.spokes;
    spokeAngles.push(theta);
    spokeLines.push({
      x1: shot.targetX,
      y1: shot.targetY,
      x2: shot.targetX + Math.cos(theta) * effectiveRadius,
      y2: shot.targetY + Math.sin(theta) * effectiveRadius,
    });
  }

  const ringFractions = [0.32, 0.64, 0.95];
  for (const frac of ringFractions) {
    const ringRadius = effectiveRadius * frac;
    const polygon: Point2D[] = spokeAngles.map((theta, idx) => {
      // Subtle organic silk sag on alternating spokes
      const sag = idx % 2 === 0 ? 0.94 : 1.0;
      return {
        x: shot.targetX + Math.cos(theta) * ringRadius * sag,
        y: shot.targetY + Math.sin(theta) * ringRadius * sag,
      };
    });
    ringPolygons.push(polygon);
  }

  return { mainLine, spokeLines, ringPolygons, cornerTrails };
}

/**
 * Initializes the 6 autonomous roaming spiders—each carrying one of Piyush's 6 domain symbols on its back!
 */
export function createInitialSpiders(viewportWidth: number, viewportHeight: number): CrawlingSpider[] {
  const w = Math.max(600, viewportWidth);
  const h = Math.max(500, viewportHeight);

  const presets: { xFrac: number; yFrac: number; txFrac: number; tyFrac: number; speed: number }[] = [
    { xFrac: 0.08, yFrac: 0.22, txFrac: 0.24, tyFrac: 0.45, speed: 46 },
    { xFrac: 0.91, yFrac: 0.18, txFrac: 0.78, tyFrac: 0.52, speed: 52 },
    { xFrac: 0.14, yFrac: 0.74, txFrac: 0.35, tyFrac: 0.28, speed: 44 },
    { xFrac: 0.86, yFrac: 0.68, txFrac: 0.64, tyFrac: 0.82, speed: 50 },
    { xFrac: 0.48, yFrac: 0.12, txFrac: 0.18, tyFrac: 0.62, speed: 48 },
    { xFrac: 0.54, yFrac: 0.88, txFrac: 0.88, tyFrac: 0.34, speed: 54 },
  ];

  return DOMAIN_SKILLS.map((skill, idx) => {
    const p = presets[idx % presets.length];
    const x = Math.round(w * p.xFrac);
    const y = Math.round(h * p.yFrac);
    const targetX = Math.round(w * p.txFrac);
    const targetY = Math.round(h * p.tyFrac);
    const angle = Math.atan2(targetY - y, targetX - x);

    return {
      id: `roaming-spider-${skill.id}`,
      domainId: skill.id,
      symbolLabel: skill.symbolLabel,
      domainName: skill.name,
      x,
      y,
      vx: Math.cos(angle) * p.speed,
      vy: Math.sin(angle) * p.speed,
      targetX,
      targetY,
      angle,
      legPhase: idx * 1.1,
      speed: p.speed,
      scale: 0.95,
      isInvestigatingWeb: false,
    };
  });
}

/**
 * Steps a crawling spider toward its current waypoint and picks a new deterministic waypoint upon arrival.
 */
export function stepCrawlingSpider(
  spider: CrawlingSpider,
  dtMs: number,
  viewportWidth: number,
  viewportHeight: number,
  nextWaypointSeed: number = 0.5
): CrawlingSpider {
  const w = Math.max(320, viewportWidth);
  const h = Math.max(320, viewportHeight);
  const dtSec = Math.max(0, Math.min(dtMs, 100)) / 1000;

  const dx = spider.targetX - spider.x;
  const dy = spider.targetY - spider.y;
  const dist = Math.hypot(dx, dy);

  let targetX = spider.targetX;
  let targetY = spider.targetY;
  let isInvestigatingWeb = spider.isInvestigatingWeb;

  // If spider reached its waypoint, choose a new patrol waypoint favoring perimeter & margin corridors
  if (dist < 18) {
    const margin = 36;
    const hashA = Math.abs(Math.sin(nextWaypointSeed * 12.9898 + spider.legPhase) * 43758.5453) % 1;
    const hashB = Math.abs(Math.cos(nextWaypointSeed * 78.233 + spider.x * 0.01) * 19341.123) % 1;
    // Favor left/right 22% perimeter lanes on desktop so central typography stays unobstructed
    const laneX =
      hashA < 0.5
        ? margin + (hashA * 2) * Math.min(220, w * 0.18)
        : w - margin - ((hashA - 0.5) * 2) * Math.min(220, w * 0.18);
    targetX = Math.round(laneX);
    targetY = Math.round(margin + hashB * (h - margin * 2));
    isInvestigatingWeb = false;
  }

  const desiredAngle = Math.atan2(targetY - spider.y, targetX - spider.x);
  const currentSpeed = isInvestigatingWeb ? spider.speed * 1.55 : spider.speed;
  const vx = Math.cos(desiredAngle) * currentSpeed;
  const vy = Math.sin(desiredAngle) * currentSpeed;

  const nextX = Math.max(24, Math.min(w - 24, spider.x + vx * dtSec));
  const nextY = Math.max(24, Math.min(h - 24, spider.y + vy * dtSec));
  const nextLegPhase = (spider.legPhase + dtSec * (isInvestigatingWeb ? 14 : 9)) % (Math.PI * 2);

  return {
    ...spider,
    x: nextX,
    y: nextY,
    vx,
    vy,
    targetX,
    targetY,
    angle: desiredAngle,
    legPhase: nextLegPhase,
    isInvestigatingWeb,
  };
}

/**
 * Directs the nearest roaming spider to scurry toward a freshly shot web coordinate.
 */
export function attractNearestSpiderToWeb(
  spiders: CrawlingSpider[],
  webX: number,
  webY: number
): CrawlingSpider[] {
  if (spiders.length === 0) return spiders;

  let nearestIdx = 0;
  let bestDist = Infinity;

  spiders.forEach((sp, idx) => {
    const d = Math.hypot(sp.x - webX, sp.y - webY);
    if (d < bestDist) {
      bestDist = d;
      nearestIdx = idx;
    }
  });

  return spiders.map((sp, idx) => {
    if (idx !== nearestIdx) return sp;
    const angle = Math.atan2(webY - sp.y, webX - sp.x);
    return {
      ...sp,
      targetX: webX,
      targetY: webY,
      angle,
      isInvestigatingWeb: true,
    };
  });
}

/**
 * Pure CLI command interpreter for Piyush Kori's interactive portfolio terminal.
 */
export function executeTerminalCommand(rawInput: string): {
  clear?: boolean;
  triggerWebShot?: boolean;
  output: string[];
  isError?: boolean;
} {
  const trimmed = rawInput.trim();
  const cmd = trimmed.toLowerCase();

  if (!cmd) {
    return { output: ['Type "help" to list available Spider-OS terminal commands.'] };
  }

  if (cmd === 'clear' || cmd === 'cls') {
    return { clear: true, output: [] };
  }

  if (cmd === 'help') {
    return {
      output: [
        'Available commands in piyush@nst-adypu shell:',
        '  whoami       Display Piyush Kori profile & academic background',
        '  skills       List all 6 domain symbols carried by the portfolio spiders',
        '  projects     Inspect Pre-College Object Detection & Hacktoberfest Hostel Management App',
        '  opensource   View Open Source contribution focus & Git/GitHub readiness',
        '  git log      Show recent project & Hacktoberfest commit history',
        '  deploy       Show Git & GitHub Pages deployment commands for @koripiyush5-svg',
        '  shoot        Fire a Spider-Man web burst across the viewport',
        '  contact      Show email & collaboration links',
        '  clear        Clear terminal buffer',
      ],
    };
  }

  if (cmd === 'whoami' || cmd === 'about') {
    return {
      output: [
        `Name        : ${PROFILE_DATA.name}`,
        `Program     : ${PROFILE_DATA.role}`,
        `University  : ${PROFILE_DATA.institution}`,
        `Focus       : AI & Machine Learning · Computer Vision · Open Source Web`,
        `Status      : ${PROFILE_DATA.openSourceStatus}`,
      ],
    };
  }

  if (cmd === 'skills' || cmd === 'domains' || cmd === 'ls skills') {
    return {
      output: [
        'Active Domain Spiders (each carrying its domain emblem on its dorsal carapace):',
        ...DOMAIN_SKILLS.map(
          (s, i) => `  0${i + 1}. [${s.symbolLabel.padEnd(3, ' ')}] ${s.name.padEnd(18, ' ')} — ${s.proficiency}`
        ),
      ],
    };
  }

  if (cmd === 'projects' || cmd === 'ls projects') {
    return {
      output: [
        'Shipped Engineering Projects:',
        ...PROJECTS_DATA.map(
          (p) => `  [${p.index}] ${p.title} (${p.status})\n       Stack: ${p.techStack.join(' · ')}`
        ),
      ],
    };
  }

  if (cmd === 'opensource' || cmd === 'oss') {
    return {
      output: [
        'Open Source Contribution Profile:',
        '  • Hacktoberfest Contributor: Built & deployed a Hostel Management web app with my team.',
        '  • Toolchain Ready: Python, HTML5, CSS3, Git branching, GitHub PR workflows, Linux CLI.',
        '  • Seeking: Good First Issues & collaborative PRs in Python AI/Vision and Web UI repositories.',
      ],
    };
  }

  if (cmd === 'git log' || cmd === 'git status') {
    return {
      output: [
        'commit a8f4e21 (HEAD -> main, origin/main)',
        'Author: Piyush Kori <koripiyush5@gmail.com>',
        '  feat(portfolio): add Spider-Man web-shooting cursor physics & 6 domain symbol spiders',
        '',
        'commit 7c91b04 (tag: hacktoberfest-release)',
        'Author: Piyush Kori & Team <koripiyush5@gmail.com>',
        '  feat(hacktoberfest): build and deploy Hostel Management web application',
        '',
        'commit 3d19e88 (tag: pre-college-v1)',
        'Author: Piyush Kori <koripiyush5@gmail.com>',
        '  feat(vision): implement real-time Python object detection pipeline',
      ],
    };
  }

  if (cmd === 'shoot' || cmd === 'web') {
    return {
      triggerWebShot: true,
      output: ['[WEB-SHOOTER] Fired synthetic crimson silk strand to viewport coordinates!'],
    };
  }

  if (cmd === 'contact') {
    return {
      output: [
        `Email       : ${PROFILE_DATA.email}`,
        `Institution : ${PROFILE_DATA.institution}`,
        `Collaboration: Use the Open Source Collaboration form below or email directly.`,
      ],
    };
  }

  if (cmd === 'deploy' || cmd === 'github deploy' || cmd === 'git push') {
    const bundle = generateGitHubDeployBundle('koripiyush5-svg', 'piyush-kori-portfolio');
    return {
      output: [
        'GitHub & GitHub Pages Deployment Pipeline Ready (.github/workflows/deploy.yml):',
        ...bundle.gitCliCommands.split('\n').map((line) => `  ${line}`),
        `  Live URL -> ${bundle.expectedPagesUrl}`,
      ],
    };
  }

  return {
    isError: true,
    output: [
      `bash: ${trimmed}: command not found`,
      'Try running "help", "whoami", "skills", "projects", "opensource", "git log", or "shoot".',
    ],
  };
}

/**
 * Computes Tailwind CSS transition classes for scroll-triggered fade-in and slide-up section animations.
 */
export function getSectionRevealClasses(isVisible: boolean, delayMs: 0 | 100 | 150 | 200 = 0): string {
  const baseTransition =
    'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100';
  const delayClass =
    delayMs === 100
      ? 'delay-100'
      : delayMs === 150
      ? 'delay-150'
      : delayMs === 200
      ? 'delay-200'
      : '';
  const stateClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-6';

  return [baseTransition, delayClass, stateClasses].filter(Boolean).join(' ');
}

export interface WebSoundProfile {
  mode: WebFluidMode;
  oscType: OscillatorType;
  startOscFreq: number;
  peakOscFreq: number;
  endOscFreq: number;
  startFilterFreq: number;
  endFilterFreq: number;
  filterQ: number;
  durationSec: number;
  peakGain: number;
  noiseGain: number;
}

/**
 * Returns deterministic Web Audio synthesis parameters for the subtle "thwip!"
 * web-shooting sound effect based on the active web fluid cartridge.
 */
export function computeWebSoundProfile(mode: WebFluidMode = 'classic'): WebSoundProfile {
  if (mode === 'impact') {
    return {
      mode,
      oscType: 'sawtooth',
      startOscFreq: 210,
      peakOscFreq: 890,
      endOscFreq: 290,
      startFilterFreq: 650,
      endFilterFreq: 2400,
      filterQ: 3.2,
      durationSec: 0.18,
      peakGain: 0.14,
      noiseGain: 0.16,
    };
  }

  if (mode === 'taser') {
    return {
      mode,
      oscType: 'sine',
      startOscFreq: 480,
      peakOscFreq: 1880,
      endOscFreq: 940,
      startFilterFreq: 1200,
      endFilterFreq: 4200,
      filterQ: 4.5,
      durationSec: 0.16,
      peakGain: 0.13,
      noiseGain: 0.14,
    };
  }

  return {
    mode: 'classic',
    oscType: 'triangle',
    startOscFreq: 340,
    peakOscFreq: 1360,
    endOscFreq: 560,
    startFilterFreq: 900,
    endFilterFreq: 3400,
    filterQ: 2.8,
    durationSec: 0.15,
    peakGain: 0.13,
    noiseGain: 0.15,
  };
}

export interface DomainSpiderCardHoverStyles {
  cardClasses: string;
  spiderWrapperClasses: string;
  stageClasses: string;
  silkGlowOverlayClasses: string;
}

/**
 * Computes Tailwind CSS classes for the domain spider cards so hovering causes
 * the spider to slightly scale up and rotate while illuminating a subtle
 * 'web-silk' glow effect around the card border.
 */
export function getDomainSpiderCardClasses(
  isSelected: boolean,
  cardIndex: number = 0
): DomainSpiderCardHoverStyles {
  const baseCard =
    'group relative overflow-hidden text-left p-6 rounded-2xl transition-all duration-300 ease-out cursor-pointer border flex flex-col justify-between';

  const borderAndGlow = isSelected
    ? 'bg-[var(--theme-surface-elevated)] border-rose-400/90 shadow-[0_0_26px_-4px_var(--theme-border-glow),0_0_10px_rgba(255,255,255,0.14)] hover:border-rose-300 hover:shadow-[0_0_32px_-2px_var(--theme-border-glow),0_0_16px_rgba(255,255,255,0.24)]'
    : 'bg-[var(--theme-surface)] border-zinc-800/90 hover:bg-[var(--theme-surface-elevated)] hover:border-rose-400/80 hover:shadow-[0_0_28px_-4px_var(--theme-border-glow),0_0_14px_rgba(255,255,255,0.18)]';

  const rotationClass =
    cardIndex % 2 === 0 ? 'group-hover:-rotate-6' : 'group-hover:rotate-6';

  const spiderWrapperClasses = `transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 ${rotationClass}`;

  const stageClasses =
    'relative flex items-center justify-center py-4 mb-4 rounded-xl bg-[#07070B] border border-zinc-900 group-hover:border-rose-500/40 group-hover:bg-[#0B0910] transition-colors duration-300 overflow-hidden';

  const silkGlowOverlayClasses =
    'pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300';

  return {
    cardClasses: `${baseCard} ${borderAndGlow}`,
    spiderWrapperClasses,
    stageClasses,
    silkGlowOverlayClasses,
  };
}

export interface GitHubLanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface GitHubRecentEventItem {
  id: string;
  type: string;
  repoName: string;
  createdAt: string;
  summary: string;
}

export interface GitHubActivitySummary {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  publicReposCount: number;
  latestContributionCount: number;
  publicEventsCount: number;
  topLanguage: string;
  languages: GitHubLanguageStat[];
  contributedRepos: string[];
  recentEvents: GitHubRecentEventItem[];
}

const LANGUAGE_COLOR_MAP: Record<string, string> = {
  Python: '#E11D48',
  HTML: '#FB7185',
  CSS: '#F43F5E',
  JavaScript: '#FDA4AF',
  TypeScript: '#FECDD3',
  Shell: '#9F1239',
};

/**
 * Pure aggregation function that computes total public contributions, most frequent
 * language usage percentages, and recent repository activity from GitHub API payloads.
 */
export function aggregateGitHubProfileStats(input: {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  profileUrl?: string | null;
  publicReposCount?: number;
  yearlyContributions?: number;
  languageByteMaps: Record<string, number>[];
  repoPrimaryLanguages?: (string | null | undefined)[];
  events?: {
    id?: string;
    type?: string;
    repo?: { name?: string };
    created_at?: string;
    payload?: { commits?: { message?: string }[]; ref?: string };
  }[];
}): GitHubActivitySummary {
  const mergedBytes: Record<string, number> = {};

  for (const byteMap of input.languageByteMaps) {
    for (const [lang, bytes] of Object.entries(byteMap || {})) {
      if (typeof bytes === 'number' && bytes > 0) {
        mergedBytes[lang] = (mergedBytes[lang] || 0) + bytes;
      }
    }
  }

  // If byte maps are empty, fall back to counting primary repository languages
  if (Object.keys(mergedBytes).length === 0 && input.repoPrimaryLanguages) {
    for (const lang of input.repoPrimaryLanguages) {
      if (lang) {
        mergedBytes[lang] = (mergedBytes[lang] || 0) + 10000;
      }
    }
  }

  const totalBytes = Object.values(mergedBytes).reduce((acc, v) => acc + v, 0);

  const sortedLangs: GitHubLanguageStat[] = Object.entries(mergedBytes)
    .sort((a, b) => b[1] - a[1])
    .map(([language, bytes], idx) => {
      const rawPct = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0;
      const fallbackPalette = ['#E11D48', '#FB7185', '#F43F5E', '#FDA4AF', '#9F1239'];
      return {
        language,
        bytes,
        percentage: Number(rawPct.toFixed(1)),
        color: LANGUAGE_COLOR_MAP[language] || fallbackPalette[idx % fallbackPalette.length],
      };
    });

  const eventsList = Array.isArray(input.events) ? input.events : [];
  const contributedSet = new Set<string>();
  const recentEvents: GitHubRecentEventItem[] = [];

  for (const ev of eventsList) {
    const repoName = ev.repo?.name;
    if (repoName) {
      contributedSet.add(repoName);
    }
    if (recentEvents.length < 4 && repoName) {
      const eventType = ev.type || 'ActivityEvent';
      const summary =
        eventType === 'PushEvent'
          ? `Pushed commits to ${repoName}`
          : eventType === 'PullRequestEvent'
          ? `Opened/updated Pull Request in ${repoName}`
          : eventType === 'MemberEvent'
          ? `Joined collaborative team repository ${repoName}`
          : `${eventType.replace(/Event$/, '')} in ${repoName}`;

      recentEvents.push({
        id: ev.id || `${repoName}-${recentEvents.length}`,
        type: eventType,
        repoName,
        createdAt: ev.created_at || '',
        summary,
      });
    }
  }

  const publicEventsCount = eventsList.length;
  const yearly = typeof input.yearlyContributions === 'number' ? input.yearlyContributions : 0;
  const latestContributionCount = Math.max(yearly, publicEventsCount);

  return {
    username: input.username,
    displayName: input.displayName || input.username,
    avatarUrl: input.avatarUrl || '',
    profileUrl: input.profileUrl || `https://github.com/${input.username}`,
    publicReposCount: input.publicReposCount ?? 0,
    latestContributionCount,
    publicEventsCount,
    topLanguage: sortedLangs[0]?.language || 'Python',
    languages: sortedLangs,
    contributedRepos: Array.from(contributedSet),
    recentEvents,
  };
}

export interface GitHubDeployBundle {
  username: string;
  repoName: string;
  remoteUrl: string;
  expectedPagesUrl: string;
  gitCliCommands: string;
  includedFiles: { path: string; role: string }[];
}

/**
 * Generates customized Git CLI push commands, expected GitHub Pages live URL,
 * and complete file manifest for deploying the portfolio to GitHub.
 */
export function generateGitHubDeployBundle(
  username: string = 'koripiyush5-svg',
  repoName: string = 'piyush-kori-portfolio'
): GitHubDeployBundle {
  const cleanUser = username.trim().replace(/^@/, '') || 'koripiyush5-svg';
  const cleanRepo =
    repoName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/^-+|-+$/g, '') || 'piyush-kori-portfolio';

  const remoteUrl = `https://github.com/${cleanUser}/${cleanRepo}.git`;
  const isUserSite = cleanRepo.toLowerCase() === `${cleanUser.toLowerCase()}.github.io`;
  const expectedPagesUrl = isUserSite
    ? `https://${cleanUser.toLowerCase()}.github.io/`
    : `https://${cleanUser.toLowerCase()}.github.io/${cleanRepo}/`;

  const gitCliCommands = [
    'git init',
    'git add .',
    'git commit -m "feat: deploy Piyush Kori Spider-Verse portfolio with all files"',
    'git branch -M main',
    `git remote add origin ${remoteUrl}`,
    'git push -u origin main',
  ].join('\n');

  const includedFiles: { path: string; role: string }[] = [
    { path: '.github/workflows/deploy.yml', role: 'Automated GitHub Pages CI/CD build & deploy workflow' },
    { path: 'server.ts', role: 'Full-stack Express + Vite server with Gemini /api/chat & /api/deploy-bundle routes' },
    { path: 'public/images/*', role: 'Production Spider-Verse hero & project visual assets' },
    { path: 'src/App.tsx', role: 'Main Spider-Man Classic Red & Venom Symbiote portfolio layout' },
    { path: 'src/components/WebShooterOverlay.tsx', role: 'Cursor web-shooting SVG physics, Venom reticle, 4 corner trails & roaming spiders' },
    { path: 'src/components/DomainSpiderSymbol.tsx', role: '6 articulated SVG spiders carrying Python, HTML, CSS, Git, GitHub & CLI symbols' },
    { path: 'src/components/GitHubActivityWidget.tsx', role: 'Real-time GitHub API contribution & language usage telemetry (@koripiyush5-svg)' },
    { path: 'src/components/PortfolioChatbot.tsx', role: 'Multi-turn Spider-Byte Gemini AI portfolio assistant (3.8 Flash & 3.1 Flash-Lite)' },
    { path: 'src/components/GetInTouchModal.tsx', role: 'Direct email contact form & quick links to LinkedIn and GitHub profiles' },
    { path: 'src/components/GitHubDeployModal.tsx', role: 'Interactive GitHub & GitHub Pages full-repository deployment center' },
    { path: 'src/components/ProjectModal.tsx', role: 'Object Detection Vision Sandbox & Hacktoberfest Hostel App inspector' },
    { path: 'src/components/TerminalSection.tsx', role: 'Interactive piyush@nst-adypu Linux CLI terminal' },
    { path: 'src/components/RevealSection.tsx', role: 'Scroll-triggered fade-in & slide-up section animations' },
    { path: 'src/utils/spiderPhysics.ts', role: 'Pure web geometry, corner trails, theme palettes, CLI & GitHub stats engine' },
    { path: 'src/utils/webSound.ts', role: 'Web Audio API synthesized "thwip!" sound effect engine' },
    { path: 'src/data/portfolioData.ts', role: 'Structured profile, LinkedIn/GitHub links, 6 domain skills & 2 shipped projects' },
    { path: 'package.json & vite.config.ts', role: 'Vite + React 19 + Tailwind CSS v4 build configuration (base: "./")' },
    { path: 'README.md', role: 'Complete repository documentation & GitHub Pages setup guide' },
  ];

  return {
    username: cleanUser,
    repoName: cleanRepo,
    remoteUrl,
    expectedPagesUrl,
    gitCliCommands,
    includedFiles,
  };
}

export type SuitTheme = 'classic-red' | 'venom';

export interface SuitThemeConfig {
  id: SuitTheme;
  label: string;
  shortLabel: string;
  subtitle: string;
  cssVars: Record<string, string>;
}

/**
 * Returns the theme metadata and unique CSS custom property palette for either
 * the 'Classic Red' Spider-Man theme or the 'Venom' black-and-white symbiote theme.
 */
export function getSuitThemeConfig(theme: SuitTheme): SuitThemeConfig {
  if (theme === 'venom') {
    return {
      id: 'venom',
      label: 'Venom Symbiote',
      shortLabel: 'Venom B&W',
      subtitle: 'Monochrome Black & Stark White Symbiote Suit',
      cssVars: {
        '--theme-bg': '#020204',
        '--theme-surface': '#09090D',
        '--theme-surface-elevated': '#121217',
        '--theme-accent': '#F4F4F5',
        '--theme-accent-soft': '#D4D4D8',
        '--theme-accent-muted': '#A1A1AA',
        '--theme-border-glow': 'rgba(244, 244, 245, 0.45)',
        '--theme-button-bg': '#F4F4F5',
        '--theme-button-hover': '#FFFFFF',
        '--theme-button-text': '#050507',
        '--theme-spider-stroke': '#F4F4F5',
        '--theme-spider-joint': '#FFFFFF',
        '--theme-spider-crest-bg': '#18181B',
        '--theme-web-main': '#FFFFFF',
        '--theme-web-ring': '#A1A1AA',
      },
    };
  }

  return {
    id: 'classic-red',
    label: 'Classic Red',
    shortLabel: 'Classic Red',
    subtitle: 'Spider-Man Crimson & Obsidian Suit',
    cssVars: {
      '--theme-bg': '#050507',
      '--theme-surface': '#0B0B10',
      '--theme-surface-elevated': '#121016',
      '--theme-accent': '#E11D48',
      '--theme-accent-soft': '#FB7185',
      '--theme-accent-muted': '#FDA4AF',
      '--theme-border-glow': 'rgba(244, 63, 94, 0.48)',
      '--theme-button-bg': '#E11D48',
      '--theme-button-hover': '#F43F5E',
      '--theme-button-text': '#FFFFFF',
      '--theme-spider-stroke': '#E11D48',
      '--theme-spider-joint': '#FDA4AF',
      '--theme-spider-crest-bg': '#9F1239',
      '--theme-web-main': '#F4F4F5',
      '--theme-web-ring': '#E11D48',
    },
  };
}

export interface WebShooterOverlayStyle {
  suitTheme: SuitTheme;
  isSymbiote: boolean;
  cursorCss: string;
  reticleOuterStroke: string;
  reticleInnerFill: string;
  reticleAccentStroke: string;
  mainStrandStroke: string;
  symbioteCoreStroke: string;
  ringStroke: string;
  nodeFill: string;
  nodeStroke: string;
  glowColor: string;
}

/**
 * Computes the cursor style and web-shooting SVG stroke palette for WebShooterOverlay.
 * Switches from the Classic Red Spider-Man palette to a Black/Silver Symbiote
 * aesthetic when the 'venom' theme is active.
 */
export function getWebShooterOverlayStyle(
  suitTheme: SuitTheme = 'classic-red',
  webMode: WebFluidMode = 'classic'
): WebShooterOverlayStyle {
  if (suitTheme === 'venom') {
    const venomSvg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="rgba(9,9,11,0.78)" stroke="#E4E4E7" stroke-width="1.6"/><path d="M16 2 L18 10 L16 8 L14 10 Z M30 16 L22 18 L24 16 L22 14 Z M16 30 L18 22 L16 24 L14 22 Z M2 16 L10 18 L8 16 L10 14 Z" fill="#A1A1AA" stroke="#09090B" stroke-width="0.8"/><circle cx="16" cy="16" r="3.2" fill="#09090B" stroke="#FFFFFF" stroke-width="1.4"/></svg>`
    );

    const ringColor =
      webMode === 'taser' ? '#CBD5E1' : webMode === 'impact' ? '#F4F4F5' : '#A1A1AA';

    return {
      suitTheme: 'venom',
      isSymbiote: true,
      cursorCss: `url("data:image/svg+xml,${venomSvg}") 16 16, crosshair`,
      reticleOuterStroke: '#E4E4E7',
      reticleInnerFill: '#09090B',
      reticleAccentStroke: '#A1A1AA',
      mainStrandStroke: '#E4E4E7',
      symbioteCoreStroke: '#09090B',
      ringStroke: ringColor,
      nodeFill: '#09090B',
      nodeStroke: '#E4E4E7',
      glowColor: 'rgba(228, 228, 231, 0.55)',
    };
  }

  const classicSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10.5" fill="rgba(225,29,72,0.14)" stroke="#E11D48" stroke-width="1.6"/><line x1="16" y1="3" x2="16" y2="10" stroke="#F4F4F5" stroke-width="1.5"/><line x1="16" y1="22" x2="16" y2="29" stroke="#F4F4F5" stroke-width="1.5"/><line x1="3" y1="16" x2="10" y2="16" stroke="#F4F4F5" stroke-width="1.5"/><line x1="22" y1="16" x2="29" y2="16" stroke="#F4F4F5" stroke-width="1.5"/><circle cx="16" cy="16" r="3" fill="#E11D48" stroke="#FFFFFF" stroke-width="1.2"/></svg>`
  );

  if (webMode === 'impact') {
    return {
      suitTheme: 'classic-red',
      isSymbiote: false,
      cursorCss: `url("data:image/svg+xml,${classicSvg}") 16 16, crosshair`,
      reticleOuterStroke: '#E11D48',
      reticleInnerFill: '#E11D48',
      reticleAccentStroke: '#FDA4AF',
      mainStrandStroke: '#E11D48',
      symbioteCoreStroke: '#881337',
      ringStroke: '#FDA4AF',
      nodeFill: '#E11D48',
      nodeStroke: '#FFFFFF',
      glowColor: 'rgba(225, 29, 72, 0.55)',
    };
  }

  if (webMode === 'taser') {
    return {
      suitTheme: 'classic-red',
      isSymbiote: false,
      cursorCss: `url("data:image/svg+xml,${classicSvg}") 16 16, crosshair`,
      reticleOuterStroke: '#FB7185',
      reticleInnerFill: '#E11D48',
      reticleAccentStroke: '#38BDF8',
      mainStrandStroke: '#FB7185',
      symbioteCoreStroke: '#E11D48',
      ringStroke: '#38BDF8',
      nodeFill: '#E11D48',
      nodeStroke: '#FFFFFF',
      glowColor: 'rgba(56, 189, 248, 0.5)',
    };
  }

  return {
    suitTheme: 'classic-red',
    isSymbiote: false,
    cursorCss: `url("data:image/svg+xml,${classicSvg}") 16 16, crosshair`,
    reticleOuterStroke: '#E11D48',
    reticleInnerFill: '#E11D48',
    reticleAccentStroke: '#F4F4F5',
    mainStrandStroke: '#F4F4F5',
    symbioteCoreStroke: '#E11D48',
    ringStroke: '#E11D48',
    nodeFill: '#E11D48',
    nodeStroke: '#FFFFFF',
    glowColor: 'rgba(225, 29, 72, 0.48)',
  };
}

export type PortfolioChatModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

export interface PortfolioChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export const PIYUSH_CHAT_SYSTEM_INSTRUCTION = `You are Spider-Byte AI, the official interactive portfolio assistant for Piyush Kori.
Your role is to answer questions from recruiters, open-source maintainers, professors, and fellow developers about Piyush Kori accurately, concisely, and enthusiastically.

Key Facts About Piyush Kori:
- Name: Piyush Kori
- Academic Program: First-Year B.Tech in Computer Science & Engineering (AI & ML) student at Newton School of Technology, ADYPU (Pune, India).
- Contact Email: koripiyush5@gmail.com
- GitHub Profile: @koripiyush5-svg (https://github.com/koripiyush5-svg)
- Current Status: Actively seeking Open Source contributions across Python, Computer Vision, HTML5/CSS3 frontend UI, and CLI developer tooling.
- 6 Core Technical Domains Learned (each carried by an articulated spider on its back in this portfolio):
  1. Python [PY]: AI/ML core language, computer vision pipelines, NumPy/OpenCV, object detection scripts.
  2. HTML5 [</>]: Semantic markup, accessible DOM trees, interactive SVG & canvas structure.
  3. CSS3 [{#}]: Responsive layouts, Bento grids, custom animations, Classic Red & Venom Symbiote themes.
  4. Git [GIT]: Distributed version control, feature branching, atomic commits, merge conflict resolution.
  5. GitHub [GH]: Pull Requests, code reviews, issue tracking, Hacktoberfest team collaboration, GitHub Pages CI/CD.
  6. Terminal Commands [$_]: Linux Bash CLI, shell pipelines, grep/file search, process management.
- 2 Shipped Projects:
  1. Pre-College Project — Real-Time Object Detection System: Built in Python using OpenCV/DNN before college. Localizes pedestrians, cyclists, vehicles, and devices in street scenes with real-time bounding boxes, confidence filtering, and Non-Maximum Suppression (NMS).
  2. Hacktoberfest Project — Hostel Management Web Application: Collaborated with his team (repository dhruvkashiv/Team-4pi, deployed live) during Hacktoberfest to build and deploy a full Hostel Management app featuring student room allocation grids, floor occupancy analytics, maintenance request queues, and mess attendance tracking.

Formatting Guidelines:
- Keep answers concise (2 to 4 short sentences or a clean bulleted list).
- Stay grounded in Piyush Kori's real background, skills, and projects.
- If someone asks how to contact or collaborate with Piyush, share his email (koripiyush5@gmail.com), his GitHub (@koripiyush5-svg), or invite them to use the Open Source Collaboration form in Section 04.`;

/**
 * Converts UI chat messages into the multi-turn Content[] format expected by @google/genai ai.chats.create.
 */
export function buildGeminiChatHistory(
  messages: { role: 'user' | 'model'; text: string }[]
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  const valid = messages.filter((m) => m && typeof m.text === 'string' && m.text.trim().length > 0);
  const normalized: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  for (const msg of valid) {
    // Gemini chat history must start with a 'user' turn
    if (normalized.length === 0 && msg.role !== 'user') {
      continue;
    }
    normalized.push({
      role: msg.role,
      parts: [{ text: msg.text.trim() }],
    });
  }

  return normalized;
}

/**
 * Provides an accurate, grounded response about Piyush Kori for common portfolio questions
 * if the backend API is unreachable (e.g., on static GitHub Pages hosting).
 */
export function generatePortfolioKnowledgeReply(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('hostel') || q.includes('hacktoberfest')) {
    return 'During Hacktoberfest, Piyush Kori collaborated with his team (repo `dhruvkashiv/Team-4pi`) to build and deploy a Hostel Management Web Application. He engineered the interactive room allocation grids, maintenance request ticket queues, and mess attendance views while managing Git feature branches and GitHub Pull Requests.';
  }

  if (q.includes('object detection') || q.includes('pre-college') || q.includes('pre college') || q.includes('vision')) {
    return 'Piyush built a Real-Time Object Detection System as his Pre-College milestone project using Python and OpenCV DNN. It processes frames to detect pedestrians, cyclists, vehicles, and devices with confidence thresholding and Non-Maximum Suppression (NMS).';
  }

  if (q.includes('project')) {
    return 'Piyush has built two key projects so far: (1) a Pre-College Real-Time Object Detection System in Python & OpenCV, and (2) a deployed Hostel Management Web Application built with his team during Hacktoberfest.';
  }

  if (q.includes('skill') || q.includes('domain') || q.includes('tech') || q.includes('learn') || q.includes('language')) {
    return 'Piyush is trained across 6 core technical domains: Python (42.7% top GitHub language for AI/ML & Computer Vision), HTML5, CSS3, Git, GitHub Pull Request workflows, and Linux Terminal (Bash CLI) commands.';
  }

  if (q.includes('college') || q.includes('university') || q.includes('education') || q.includes('study') || q.includes('newton')) {
    return 'Piyush Kori is a First-Year B.Tech student in Computer Science & Engineering (AI & ML) at Newton School of Technology, ADYPU in Pune, India.';
  }

  if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('collaborate') || q.includes('open source')) {
    return 'Piyush is actively seeking Open Source contributions in Python/Vision and Web UI! You can reach him directly at koripiyush5@gmail.com, on GitHub at @koripiyush5-svg, or by submitting an invite in Section 04 of this portfolio.';
  }

  return 'I am Spider-Byte AI, Piyush Kori’s portfolio assistant! Piyush is a 1st-year B.Tech CSE (AI & ML) student at Newton School of Technology, ADYPU, skilled in Python, HTML5, CSS3, Git, GitHub, and Linux CLI, with shipped projects in Object Detection and a Hacktoberfest Hostel Management App. Ask me about his skills, projects, or open-source goals!';
}

export interface DirectCommunicationLinks {
  email: string;
  githubUrl: string;
  githubHandle: string;
  linkedinUrl: string;
  linkedinHandle: string;
}

export function getDirectCommunicationLinks(): DirectCommunicationLinks {
  return {
    email: 'koripiyush5@gmail.com',
    githubUrl: 'https://github.com/koripiyush5-svg',
    githubHandle: '@koripiyush5-svg',
    linkedinUrl: 'https://www.linkedin.com/in/piyush-kori',
    linkedinHandle: 'in/piyush-kori',
  };
}

export interface ContactFormInput {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export interface ContactFormValidationResult {
  isValid: boolean;
  error: string | null;
  mailtoHref: string;
  confirmationText: string;
}

export function buildContactFormSubmission(
  input: ContactFormInput,
  recipientEmail: string = 'koripiyush5@gmail.com'
): ContactFormValidationResult {
  const name = input.senderName.trim();
  const email = input.senderEmail.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    return {
      isValid: false,
      error: 'Please fill in your name, email address, subject, and message.',
      mailtoHref: '',
      confirmationText: '',
    };
  }

  if (!email.includes('@') || !email.includes('.')) {
    return {
      isValid: false,
      error: 'Please enter a valid email address so Piyush can reply to you.',
      mailtoHref: '',
      confirmationText: '',
    };
  }

  const formattedSubject = encodeURIComponent(`[Portfolio Contact] ${subject} — from ${name}`);
  const formattedBody = encodeURIComponent(
    `Hi Piyush,\n\n${message}\n\n---\nFrom: ${name}\nReply-To: ${email}\nSent via Piyush Kori Portfolio`
  );

  return {
    isValid: true,
    error: null,
    mailtoHref: `mailto:${recipientEmail}?subject=${formattedSubject}&body=${formattedBody}`,
    confirmationText: `Message prepared for ${recipientEmail} from ${name} (${email}).`,
  };
}
