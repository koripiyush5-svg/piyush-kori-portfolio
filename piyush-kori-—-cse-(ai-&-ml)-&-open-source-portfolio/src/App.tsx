import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Code2,
  GitBranch,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import {
  PROFILE_DATA,
  DOMAIN_SKILLS,
  PROJECTS_DATA,
  OPEN_SOURCE_GOALS,
  DomainSkill,
  ProjectItem,
} from './data/portfolioData';
import {
  WebFluidMode,
  SuitTheme,
  getSuitThemeConfig,
  getDomainSpiderCardClasses,
} from './utils/spiderPhysics';
import { DomainSpiderSymbol } from './components/DomainSpiderSymbol';
import { WebShooterOverlay } from './components/WebShooterOverlay';
import { ProjectModal } from './components/ProjectModal';
import { TerminalSection } from './components/TerminalSection';
import { RevealSection } from './components/RevealSection';
import { GitHubActivityWidget } from './components/GitHubActivityWidget';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { PortfolioChatbot } from './components/PortfolioChatbot';
import { GetInTouchModal } from './components/GetInTouchModal';

interface CollaborationSubmission {
  id: string;
  senderName: string;
  repoOrOrg: string;
  domainFocus: string;
  message: string;
  timestamp: string;
}

const INITIAL_SUBMISSIONS: CollaborationSubmission[] = [
  {
    id: 'sub-initial-1',
    senderName: 'Hacktoberfest Team Lead',
    repoOrOrg: 'github.com/hacktoberfest-team/hostel-management-app',
    domainFocus: 'Git · GitHub · HTML & CSS Deployment',
    message:
      'Collaborated with Piyush Kori during Hacktoberfest to build and deploy our Hostel Management web application cleanly across feature branches.',
    timestamp: 'Verified Team Milestone',
  },
];

export default function App() {
  const [suitTheme, setSuitTheme] = useState<SuitTheme>('classic-red');
  const [webMode, setWebMode] = useState<WebFluidMode>('classic');
  const [spidersEnabled, setSpidersEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [externalShotTrigger, setExternalShotTrigger] = useState<number>(0);
  const [webShotsCount, setWebShotsCount] = useState<number>(0);
  const [lastShotCoord, setLastShotCoord] = useState<{ x: number; y: number }>({ x: 720, y: 360 });

  const activeThemeConfig = getSuitThemeConfig(suitTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', suitTheme);
    for (const [prop, val] of Object.entries(activeThemeConfig.cssVars)) {
      root.style.setProperty(prop, val);
    }
  }, [suitTheme, activeThemeConfig]);

  const toggleSuitTheme = () => {
    setSuitTheme((prev) => (prev === 'classic-red' ? 'venom' : 'classic-red'));
  };

  const [selectedDomain, setSelectedDomain] = useState<DomainSkill>(DOMAIN_SKILLS[0]);
  const [hoveredDomainId, setHoveredDomainId] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<'all' | 'code' | 'vcs'>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<ProjectItem | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState<boolean>(false);
  const [inlineDetectionOverlay, setInlineDetectionOverlay] = useState<boolean>(true);

  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [projectImgErrors, setProjectImgErrors] = useState<Record<string, boolean>>({});

  // Collaboration Form State
  const [senderName, setSenderName] = useState<string>('');
  const [repoOrOrg, setRepoOrOrg] = useState<string>('');
  const [domainFocus, setDomainFocus] = useState<string>('Python & Computer Vision');
  const [message, setMessage] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [submissions, setSubmissions] = useState<CollaborationSubmission[]>(INITIAL_SUBMISSIONS);

  const handleWebShotFired = (total: number, coord: { x: number; y: number }) => {
    setWebShotsCount(total);
    setLastShotCoord(coord);
  };

  const triggerManualWebShot = () => {
    setExternalShotTrigger((prev) => prev + 1);
  };

  const filteredDomains = DOMAIN_SKILLS.filter((skill) => {
    if (domainFilter === 'all') return true;
    if (domainFilter === 'code') return ['python', 'html', 'css'].includes(skill.id);
    return ['git', 'github', 'terminal'].includes(skill.id);
  });

  const handleCollaborationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!senderName.trim() || !repoOrOrg.trim() || !message.trim()) {
      setFormError('Please fill in your name, repository or organization, and collaboration details.');
      return;
    }

    const newEntry: CollaborationSubmission = {
      id: `sub-${Date.now()}`,
      senderName: senderName.trim(),
      repoOrOrg: repoOrOrg.trim(),
      domainFocus,
      message: message.trim(),
      timestamp: 'Just now',
    };

    setSubmissions((prev) => [newEntry, ...prev]);
    setSenderName('');
    setRepoOrOrg('');
    setMessage('');
    setFormSuccess('Your open-source collaboration note has been pinned to the board!');
    triggerManualWebShot();
  };

  return (
    <div
      data-testid="portfolio-root"
      data-theme={suitTheme}
      style={activeThemeConfig.cssVars as React.CSSProperties}
      className="min-h-screen bg-[var(--theme-bg)] text-zinc-100 relative selection:bg-rose-600 selection:text-white transition-colors duration-300"
    >
      {/* Subtle Background Spider-Web SVG Geometry */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="crimsonGlow" cx="85%" cy="15%" r="55%">
              <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--theme-bg)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#crimsonGlow)" />
          {/* Top-Right Architectural Web Motif */}
          <g stroke="var(--theme-accent)" strokeWidth="0.8" fill="none" transform="translate(1280, 80)">
            <line x1="0" y1="0" x2="-600" y2="120" />
            <line x1="0" y1="0" x2="-520" y2="320" />
            <line x1="0" y1="0" x2="-360" y2="480" />
            <line x1="0" y1="0" x2="-140" y2="560" />
            <circle cx="0" cy="0" r="90" />
            <circle cx="0" cy="0" r="190" />
            <circle cx="0" cy="0" r="310" />
            <circle cx="0" cy="0" r="450" />
          </g>
        </svg>
      </div>

      {/* Full-Viewport Cursor Web-Shooting & Crawling Spiders Layer */}
      <WebShooterOverlay
        suitTheme={suitTheme}
        webMode={webMode}
        spidersEnabled={spidersEnabled}
        soundEnabled={soundEnabled}
        externalShotTrigger={externalShotTrigger}
        onWebShotFired={handleWebShotFired}
      />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 md:px-12 py-4 bg-[var(--theme-bg)]/90 backdrop-blur-md border-b border-zinc-900 transition-colors duration-300">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-white hover:text-rose-500 transition-colors whitespace-nowrap shrink-0 font-display"
        >
          Piyush Kori
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a
            href="#domains"
            className="hover:text-white hover:underline underline-offset-4 decoration-rose-500 transition-colors whitespace-nowrap shrink-0"
          >
            Domains
          </a>
          <a
            href="#projects"
            className="hover:text-white hover:underline underline-offset-4 decoration-rose-500 transition-colors whitespace-nowrap shrink-0"
          >
            Projects
          </a>
          <a
            href="#terminal"
            className="hover:text-white hover:underline underline-offset-4 decoration-rose-500 transition-colors whitespace-nowrap shrink-0"
          >
            Terminal
          </a>
          <a
            href="#opensource"
            className="hover:text-white hover:underline underline-offset-4 decoration-rose-500 transition-colors whitespace-nowrap shrink-0"
          >
            Open Source
          </a>
        </nav>

        {/* Zone 3: Theme Toggle + Primary Action (Max 2 controls, gap-3) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            data-testid="theme-toggle-btn"
            onClick={toggleSuitTheme}
            aria-label={`Switch suit theme (current: ${activeThemeConfig.label})`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 hover:border-rose-400/70 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
              style={{ backgroundColor: activeThemeConfig.cssVars['--theme-accent'] }}
            />
            <span>
              {suitTheme === 'classic-red' ? 'Theme: Classic Red' : 'Theme: Venom B&W'}
            </span>
          </button>

          <a
            href="#contact"
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Collaborate
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* Split-Screen Hero Section */}
        <RevealSection id="hero" initiallyVisible={true} className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Typographic Hierarchy & Interactive Web-Shooter Controls */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <p className="text-xs font-mono text-rose-500 tracking-wider">
                  FIRST-YEAR B.TECH CSE (AI &amp; ML) · NEWTON SCHOOL OF TECHNOLOGY, ADYPU
                </p>

                <h1
                  className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold text-white tracking-tight leading-[1.08] font-display"
                  style={{ textWrap: 'balance' }}
                >
                  {PROFILE_DATA.heroHeadline}
                </h1>

                <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                  {PROFILE_DATA.heroLead}
                </p>

                {/* Unboxed Metadata Line */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono pt-1">
                  <span className="text-rose-400 font-semibold">{PROFILE_DATA.openSourceStatus}</span>
                  <span aria-hidden="true">·</span>
                  <span>Click anywhere to shoot webs</span>
                  <span aria-hidden="true">·</span>
                  <span>6 Domain Spiders patrolling</span>
                </div>
              </div>

              {/* Interactive Web-Shooter & Navigation Controls */}
              <div className="space-y-5 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#domains"
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    Inspect Domain Spiders
                  </a>
                  <a
                    href="#projects"
                    className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    View 2 Shipped Projects
                  </a>
                  <button
                    type="button"
                    onClick={triggerManualWebShot}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900/90 hover:bg-rose-950/60 text-rose-300 border border-rose-500/40 text-sm font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Crosshair className="w-4 h-4 text-rose-500" />
                    <span>Shoot Web Burst</span>
                  </button>
                  <button
                    type="button"
                    data-testid="hero-deploy-github-btn"
                    onClick={() => setIsDeployModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-rose-500/60 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <GitBranch className="w-4 h-4 text-rose-500" />
                    <span>Deploy to GitHub (All Files)</span>
                  </button>
                </div>

                {/* Web-Shooter Cartridge Mode Selector & Crawling Spider Toggle */}
                <div className="p-4 rounded-xl bg-[#0D0D12] border border-zinc-800/90 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 mr-1">Web Cartridge:</span>
                    <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                      {(
                        [
                          { id: 'classic', label: 'Classic Silk' },
                          { id: 'impact', label: 'Crimson Impact' },
                          { id: 'taser', label: 'Bio-Electric' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWebMode(m.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            webMode === m.id
                              ? 'bg-rose-600 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      data-testid="hero-theme-toggle-btn"
                      onClick={toggleSuitTheme}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Suit: {suitTheme === 'classic-red' ? 'Classic Red' : 'Venom Symbiote'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled((prev) => !prev)}
                      aria-pressed={soundEnabled}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Web SFX: On</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Web SFX: Muted</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpidersEnabled((prev) => !prev)}
                      aria-pressed={spidersEnabled}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {spidersEnabled ? 'Pause Crawling Spiders' : 'Resume Crawling Spiders'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Container at Matching Height */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-zinc-800 bg-[var(--theme-surface)] group">
                {!heroImgError ? (
                  <img
                    src={PROFILE_DATA.heroImage}
                    alt="Piyush Kori Spider-Verse AI and Computer Science Workspace"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className={`w-full h-full object-cover object-center transition-all duration-500 ${
                      suitTheme === 'venom' ? 'grayscale contrast-125 brightness-95' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-rose-950/40 to-black p-8">
                    <DomainSpiderSymbol domainId="python" size={140} />
                  </div>
                )}

                {/* Measured Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-300 bg-black/65 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-zinc-800">
                    <span>WEB-SHOOTER TELEMETRY</span>
                    <span className="text-rose-400 font-semibold" data-testid="web-shots-counter">
                      Shots Fired: {webShotsCount}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-mono text-rose-400">
                      LAST WEB TARGET: ({lastShotCoord.x}px, {lastShotCoord.y}px)
                    </p>
                    <p className="text-lg font-bold text-white font-display">
                      {PROFILE_DATA.name} · CSE (AI &amp; ML)
                    </p>
                    <p className="text-xs text-zinc-300">
                      {PROFILE_DATA.institution} · Click anywhere on screen to fire silk webs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Metric Row Below the Hero Split */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-zinc-900">
            {PROFILE_DATA.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#0B0B10] border border-zinc-800/80 space-y-1"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-white font-display tabular-nums">
                    {metric.value}
                  </span>
                  <span className="text-xs font-mono text-rose-500 font-semibold">
                    {metric.unit}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{metric.context}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Editorial Marquee Section Divider */}
        <div className="py-3.5 bg-[#09090E] border-y border-zinc-900 overflow-hidden text-xs font-mono text-zinc-400">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            <span>PIYUSH KORI · B.TECH CSE (AI &amp; ML) AT NEWTON SCHOOL OF TECHNOLOGY, ADYPU</span>
            <span className="text-rose-500">·</span>
            <span>PYTHON · HTML5 · CSS3 · GIT · GITHUB · TERMINAL COMMANDS</span>
            <span className="text-rose-500">·</span>
            <span>PRE-COLLEGE OBJECT DETECTION SYSTEM</span>
            <span className="text-rose-500">·</span>
            <span>HACKTOBERFEST HOSTEL MANAGEMENT APP DEPLOYED</span>
            <span className="text-rose-500">·</span>
            <span>SEEKING OPEN SOURCE CONTRIBUTIONS</span>
            <span className="text-rose-500">·</span>
            <span>PIYUSH KORI · B.TECH CSE (AI &amp; ML) AT NEWTON SCHOOL OF TECHNOLOGY, ADYPU</span>
            <span className="text-rose-500">·</span>
            <span>PYTHON · HTML5 · CSS3 · GIT · GITHUB · TERMINAL COMMANDS</span>
          </div>
        </div>

        {/* Section 01: Domain Arsenal — Spiders Carrying Domain Symbols on Their Backs */}
        <RevealSection id="domains" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-mono text-rose-500 tracking-wider mb-2">
                DORSAL CARAPACE EMBLEMS · 6 TECHNICAL DOMAINS
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight font-display">
                01. Domain Arsenal — Spiders Carrying Symbols
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Every technical domain I have learned is represented by an articulated spider carrying that domain&apos;s authentic symbol on its back. Click any spider unit to inspect how I apply it in AI/ML and Open Source projects.
              </p>
            </div>

            {/* Interactive Filter Controls */}
            <div className="flex items-center gap-1 p-1 bg-[#0E0E14] rounded-lg border border-zinc-800 self-start">
              {(
                [
                  { id: 'all', label: 'All 6 Domains' },
                  { id: 'code', label: 'Languages & Web' },
                  { id: 'vcs', label: 'Git, GitHub & CLI' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDomainFilter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    domainFilter === tab.id
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3-in-a-Row Domain Spider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((skill, idx) => {
              const isSelected = selectedDomain.id === skill.id;
              const isHovered = hoveredDomainId === skill.id;
              const hoverStyles = getDomainSpiderCardClasses(isSelected, idx);
              return (
                <button
                  key={skill.id}
                  type="button"
                  data-testid={`domain-spider-card-${skill.id}`}
                  onClick={() => setSelectedDomain(skill)}
                  onMouseEnter={() => setHoveredDomainId(skill.id)}
                  onMouseLeave={() => setHoveredDomainId((prev) => (prev === skill.id ? null : prev))}
                  onFocus={() => setHoveredDomainId(skill.id)}
                  onBlur={() => setHoveredDomainId((prev) => (prev === skill.id ? null : prev))}
                  aria-label={`Inspect ${skill.name} spider carrying ${skill.symbolLabel} symbol`}
                  className={hoverStyles.cardClasses}
                >
                  {/* Subtle Web-Silk Border Shimmer & Corner Lattice Glow on Hover */}
                  <div className={hoverStyles.silkGlowOverlayClasses} aria-hidden="true">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`silkBorderGrad-${skill.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.42" />
                          <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0.38" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="15"
                        fill="none"
                        stroke={`url(#silkBorderGrad-${skill.id})`}
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      {/* Top-right & bottom-left delicate corner silk filaments */}
                      <path
                        d="M 0 28 Q 14 14 28 0 M 0 16 Q 8 8 16 0"
                        stroke="#FDA4AF"
                        strokeWidth="0.9"
                        fill="none"
                        opacity="0.55"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    {/* Top Metadata Line (No Pills) */}
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-4">
                      <span>0{idx + 1} · {skill.category}</span>
                      <span className="text-rose-400 group-hover:text-rose-300 font-semibold transition-colors">
                        [{skill.symbolLabel}]
                      </span>
                    </div>

                    {/* Articulated Spider Carrying the Domain Symbol on its Back */}
                    <div className={hoverStyles.stageClasses}>
                      {/* Subtle radial web-silk halo behind the spider on hover */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18)_0%,rgba(255,255,255,0.06)_38%,transparent_72%)]"
                      />
                      <div
                        data-testid={`domain-spider-figure-${skill.id}`}
                        className={hoverStyles.spiderWrapperClasses}
                      >
                        <DomainSpiderSymbol
                          domainId={skill.id}
                          size={116}
                          legPhase={idx * 0.9 + (isHovered ? 1.35 : 0)}
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-rose-50 transition-colors font-display">
                      {skill.name}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-rose-400">
                      {skill.proficiency}
                    </p>
                    <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                      {skill.summary}
                    </p>
                  </div>

                  <div className="relative z-10 mt-5 pt-4 border-t border-zinc-800/80 group-hover:border-rose-500/30 transition-colors">
                    <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      {skill.keyTopics.join(' · ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Domain Spider Deep-Dive Inspector */}
          <div
            data-testid="selected-domain-inspector"
            className="mt-10 p-6 md:p-8 rounded-2xl bg-[#0D0D14] border border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-xl bg-[#08080C] border border-zinc-800/80">
              <DomainSpiderSymbol domainId={selectedDomain.id} size={140} />
              <p className="mt-3 text-sm font-bold text-white font-display">
                {selectedDomain.spiderClass}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {selectedDomain.spiderBackDescription}
              </p>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-rose-500">
                    SELECTED DOMAIN SPIDER INSPECTOR
                  </p>
                  <h3 className="text-2xl font-bold text-white font-display">
                    {selectedDomain.name} — {selectedDomain.proficiency}
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Symbol on Spider Back: <strong className="text-white">{selectedDomain.symbolLabel}</strong>
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong className="text-white">Open Source Application:</strong> {selectedDomain.openSourceUse}
              </p>

              <div className="rounded-xl bg-[#07070A] border border-zinc-800 p-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span>{selectedDomain.name} Workflow Snippet</span>
                  <span className="text-rose-400">Verified Skill</span>
                </div>
                <pre className="text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                  <code>{selectedDomain.codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* Section 02: Selected Works — 2 Projects (Pre-College Object Detection & Hacktoberfest App) */}
        <RevealSection id="projects" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-mono text-rose-500 tracking-wider mb-2">
                COMPUTER VISION AI &amp; HACKTOBERFEST TEAM DEPLOYMENT
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight font-display">
                02. Selected Engineering Projects
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Two milestone projects built on my journey so far: my Pre-College Real-Time Object Detection pipeline and our team&apos;s deployed Hostel Management web application for Hacktoberfest.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInlineDetectionOverlay((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {inlineDetectionOverlay ? 'Hide Live Vision Boxes' : 'Show Live Vision Boxes'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {PROJECTS_DATA.map((project) => {
              const hasImgError = projectImgErrors[project.id];
              return (
                <article
                  key={project.id}
                  className="rounded-2xl bg-[#0B0B10] border border-zinc-800/90 hover:border-rose-500/60 transition-colors overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Project Visual Container */}
                    <div className="relative aspect-video bg-zinc-950 overflow-hidden border-b border-zinc-800">
                      {!hasImgError ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setProjectImgErrors((prev) => ({ ...prev, [project.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-rose-950/30 to-black p-6">
                          <span className="text-xs font-mono text-rose-300">{project.title}</span>
                        </div>
                      )}

                      {/* Live Bounding Box Preview on Project 01 */}
                      {project.id === 'object-detection' &&
                        inlineDetectionOverlay &&
                        project.detectionBoxes?.slice(0, 4).map((box) => (
                          <div
                            key={box.id}
                            style={{
                              left: `${box.x}%`,
                              top: `${box.y}%`,
                              width: `${box.w}%`,
                              height: `${box.h}%`,
                            }}
                            className="absolute border border-rose-500 bg-rose-500/15 pointer-events-none"
                          >
                            <span className="bg-rose-600 text-white text-[9px] font-mono px-1 py-0.5 block truncate">
                              {box.label}
                            </span>
                          </div>
                        ))}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-5 pointer-events-none">
                        <span className="text-xs font-mono text-rose-400 font-semibold">
                          {project.index}. {project.timeline}
                        </span>
                        <span className="text-xs font-mono text-zinc-200">{project.status}</span>
                      </div>
                    </div>

                    {/* Project Copy */}
                    <div className="p-6 md:p-7 space-y-4">
                      <div className="text-xs font-mono text-zinc-400">
                        <span>{project.role}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{project.teamContext}</span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-white font-display">
                        {project.title}
                      </h3>

                      <p className="text-sm text-zinc-300 leading-relaxed">{project.summary}</p>

                      <ul className="space-y-2 pt-1">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-rose-500 font-mono">·</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer: Unboxed Stack + Modal Action */}
                  <div className="px-6 md:px-7 py-4 bg-[#08080C] border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs font-mono text-zinc-400">
                      {project.techStack.join(' · ')}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveProjectModal(project)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>
                        {project.id === 'object-detection'
                          ? 'Open Vision Sandbox'
                          : 'Inspect Team Deployment'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </RevealSection>

        {/* Section 03: Interactive Linux CLI Terminal */}
        <TerminalSection onTriggerWebShot={triggerManualWebShot} />

        {/* Section 04: Open Source Contribution Goals & Collaboration Form */}
        <RevealSection id="opensource" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-mono text-rose-500 tracking-wider mb-2">
                HACKTOBERFEST ALUM · GIT &amp; GITHUB READY
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight font-display">
                04. Seeking Open Source Contributions
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                After shipping our team&apos;s Hostel Management web application during Hacktoberfest, I am actively looking to contribute to open-source repositories across Python, Computer Vision, HTML/CSS frontend interfaces, and developer tooling.
              </p>
            </div>

            <button
              type="button"
              data-testid="open-github-deploy-modal-btn"
              onClick={() => setIsDeployModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <GitBranch className="w-4 h-4" />
              <span>Deploy Portfolio to GitHub (All Files)</span>
            </button>
          </div>

          {/* Real-Time GitHub Activity & Language Telemetry Widget */}
          <GitHubActivityWidget />

          {/* 3 Open Source Focus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {OPEN_SOURCE_GOALS.map((goal, idx) => (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-[#0B0B10] border border-zinc-800/90 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                  <span>0{idx + 1}. TARGET TRACK</span>
                  <GitBranch className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">{goal.title}</h3>
                <p className="text-xs font-mono text-zinc-400">{goal.focus}</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{goal.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Collaboration & Contact Section */}
          <div
            id="contact"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 md:p-10 rounded-2xl bg-[#0B0B10] border border-zinc-800"
          >
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white font-display">
                  Invite Piyush to Collaborate on an Issue or Project
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Have an open-source repository, Hacktoberfest team, or AI/ML project at Newton School of Technology, ADYPU? Drop a collaboration note below or reach out at{' '}
                  <a
                    href={`mailto:${PROFILE_DATA.email}`}
                    className="text-rose-400 hover:underline font-mono"
                  >
                    {PROFILE_DATA.email}
                  </a>
                  .
                </p>
              </div>

              <form onSubmit={handleCollaborationSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="collab-name"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      Your Name / Maintainer Handle
                    </label>
                    <input
                      id="collab-name"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Alex Rivera (@alexdev)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#07070A] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="collab-repo"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      GitHub Repository or Organization
                    </label>
                    <input
                      id="collab-repo"
                      type="text"
                      value={repoOrOrg}
                      onChange={(e) => setRepoOrOrg(e.target.value)}
                      placeholder="e.g. github.com/org/vision-toolkit"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#07070A] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="collab-domain"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Primary Domain Symbol Needed
                  </label>
                  <select
                    id="collab-domain"
                    value={domainFocus}
                    onChange={(e) => setDomainFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#07070A] border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Python & Computer Vision">Python &amp; Computer Vision</option>
                    <option value="HTML5 & CSS3 Frontend UI">HTML5 &amp; CSS3 Frontend UI</option>
                    <option value="Git & GitHub Open Source PRs">Git &amp; GitHub Open Source PRs</option>
                    <option value="Linux Terminal & Automation">Linux Terminal &amp; Automation</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="collab-message"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Issue Link or Collaboration Details
                  </label>
                  <textarea
                    id="collab-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share the issue number, feature idea, or hackathon details..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#07070A] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 px-3.5 py-2.5 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div
                    role="status"
                    className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 px-3.5 py-2.5 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Open Source Invite</span>
                </button>
              </form>
            </div>

            {/* Live Collaboration Board Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">
                    Pinned Open Source Activity &amp; Invites ({submissions.length})
                  </h4>
                  <span className="text-xs font-mono text-rose-400">Live Board</span>
                </div>

                <div
                  data-testid="collaboration-submissions-list"
                  className="space-y-3 max-h-80 overflow-y-auto pr-1"
                >
                  {submissions.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#07070A] border border-zinc-800/90 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span className="text-white font-semibold">{item.senderName}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="text-xs font-mono text-rose-400 truncate">
                        {item.repoOrOrg} · {item.domainFocus}
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#07070A] border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                <div className="text-zinc-200 font-semibold">
                  Academic &amp; Developer Credentials
                </div>
                <div>Student: Piyush Kori · First-Year B.Tech in CSE (AI &amp; ML)</div>
                <div>Campus: Newton School of Technology, ADYPU</div>
                <div>Direct Email: {PROFILE_DATA.email}</div>
              </div>
            </div>
          </div>
        </RevealSection>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-8 px-6 md:px-12 bg-[#040406]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span>Piyush Kori</span>
            <span aria-hidden="true"> · </span>
            <span>First-Year B.Tech CSE (AI &amp; ML)</span>
            <span aria-hidden="true"> · </span>
            <span>Newton School of Technology, ADYPU</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#domains" className="hover:text-white transition-colors">
              Domains
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              Projects
            </a>
            <a href="#terminal" className="hover:text-white transition-colors">
              Terminal
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Collaborate
            </a>
            <button
              type="button"
              data-testid="footer-get-in-touch-btn"
              onClick={() => setIsGetInTouchOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-[0_0_20px_-4px_rgba(225,29,72,0.6)] cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Get in Touch</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Fullscreen Project Detail & Sandbox Modal */}
      <ProjectModal
        project={activeProjectModal}
        onClose={() => setActiveProjectModal(null)}
      />

      {/* GitHub & GitHub Pages Deployment Kit Modal */}
      <GitHubDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Direct Communication & Email Contact Modal */}
      <GetInTouchModal
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
        onMessageSubmitted={(item) =>
          setSubmissions((prev) => [
            {
              id: `sub-${Date.now()}`,
              senderName: item.senderName,
              repoOrOrg: item.senderEmail,
              domainFocus: item.subject,
              message: item.message,
              timestamp: 'Direct Email Inquiry',
            },
            ...prev,
          ])
        }
      />

      {/* Multi-Turn Spider-Byte Gemini AI Portfolio Assistant */}
      <PortfolioChatbot />
    </div>
  );
}
