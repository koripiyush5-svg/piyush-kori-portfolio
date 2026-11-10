import React from 'react';
import { DomainId } from '../data/portfolioData';

interface DomainSpiderSymbolProps {
  domainId: DomainId;
  size?: number;
  isAnimated?: boolean;
  legPhase?: number;
  className?: string;
}

/**
 * Renders an articulated Spider-Man / Venom style arachnid carrying the specific
 * domain symbol (Python, HTML, CSS, Git, GitHub, Terminal) on its dorsal back.
 * Uses CSS variables (--theme-spider-stroke, --theme-spider-joint, --theme-spider-crest-bg)
 * so switching between 'Classic Red' and 'Venom' updates the spider's palette dynamically.
 */
export const DomainSpiderSymbol: React.FC<DomainSpiderSymbolProps> = ({
  domainId,
  size = 112,
  isAnimated = true,
  legPhase = 0,
  className = '',
}) => {
  // Subtle leg articulation offset based on legPhase
  const swingA = isAnimated ? Math.sin(legPhase) * 4 : 0;
  const swingB = isAnimated ? Math.cos(legPhase) * 4 : 0;

  const renderDomainCrestOnBack = () => {
    switch (domainId) {
      case 'python':
        return (
          <g aria-label="Python symbol on spider back">
            {/* Dual intertwined Python serpents on dorsal abdomen */}
            <path
              d="M54 58 C54 52, 66 52, 66 58 L66 64 C66 67, 60 67, 57 67 L53 67 C49 67, 48 70, 48 73 L48 76 C44 76, 43 71, 43 66 C43 60, 47 58, 54 58 Z"
              fill="var(--theme-spider-stroke)"
              stroke="var(--theme-spider-joint)"
              strokeWidth="1.2"
            />
            <path
              d="M66 80 C66 86, 54 86, 54 80 L54 74 C54 71, 60 71, 63 71 L67 71 C71 71, 72 68, 72 65 L72 62 C76 62, 77 67, 77 72 C77 78, 73 80, 66 80 Z"
              fill="#F4F4F5"
              stroke="var(--theme-spider-stroke)"
              strokeWidth="1.2"
            />
            <circle cx="57" cy="56" r="1.4" fill="#09090B" />
            <circle cx="63" cy="82" r="1.4" fill="#09090B" />
          </g>
        );

      case 'html':
        return (
          <g aria-label="HTML5 shield and code brackets on spider back">
            {/* HTML5 Shield Outline */}
            <polygon
              points="48,54 72,54 69,79 60,84 51,79"
              fill="var(--theme-spider-crest-bg)"
              stroke="var(--theme-spider-joint)"
              strokeWidth="1.4"
            />
            {/* < / > symbol inside shield */}
            <path
              d="M55 64 L51 68 L55 72 M65 64 L69 68 L65 72 M62 62 L58 75"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'css':
        return (
          <g aria-label="CSS3 curly braces and style crest on spider back">
            {/* CSS Hexagonal Crest */}
            <polygon
              points="60,52 73,59 70,78 60,84 50,78 47,59"
              fill="var(--theme-spider-crest-bg)"
              stroke="var(--theme-spider-stroke)"
              strokeWidth="1.4"
            />
            {/* { # } symbol */}
            <path
              d="M54 61 C51 61, 51 65, 51 67 C51 68, 49 69, 49 69 C49 69, 51 70, 51 71 C51 73, 51 77, 54 77"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M66 61 C69 61, 69 65, 69 67 C69 68, 71 69, 71 69 C71 69, 69 70, 69 71 C69 73, 69 77, 66 77"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="60" cy="69" r="3" fill="var(--theme-accent-soft)" />
          </g>
        );

      case 'git':
        return (
          <g aria-label="Git branch graph symbol on spider back">
            {/* Git Diamond & Branching Graph */}
            <rect
              x="49"
              y="58"
              width="22"
              height="22"
              rx="3"
              transform="rotate(45 60 69)"
              fill="var(--theme-spider-crest-bg)"
              stroke="var(--theme-spider-joint)"
              strokeWidth="1.3"
            />
            <line x1="56" y1="60" x2="56" y2="77" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M56 65 C61 65, 64 67, 64 72" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="56" cy="61" r="2.4" fill="#FFFFFF" />
            <circle cx="56" cy="76" r="2.4" fill="#FFFFFF" />
            <circle cx="64" cy="72" r="2.4" fill="var(--theme-accent-soft)" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        );

      case 'github':
        return (
          <g aria-label="GitHub Octocat and Pull Request symbol on spider back">
            <circle
              cx="60"
              cy="69"
              r="14"
              fill="var(--theme-spider-crest-bg)"
              stroke="var(--theme-spider-joint)"
              strokeWidth="1.4"
            />
            {/* Stylized Octocat silhouette + PR node */}
            <path
              d="M52 65 L53 59 L57 62 C58.5 61.5, 61.5 61.5, 63 62 L67 59 L68 65 C69.5 67, 69 72, 65 74 C63 75, 62 76, 62 79 L58 79 C58 76, 57 75, 55 74 C51 72, 50.5 67, 52 65 Z"
              fill="#FFFFFF"
            />
            <circle cx="57" cy="68" r="1.3" fill="#09090B" />
            <circle cx="63" cy="68" r="1.3" fill="#09090B" />
          </g>
        );

      case 'terminal':
        return (
          <g aria-label="Terminal prompt symbol on spider back">
            <rect
              x="46"
              y="56"
              width="28"
              height="24"
              rx="4"
              fill="#09090B"
              stroke="var(--theme-spider-joint)"
              strokeWidth="1.6"
            />
            {/* > _ prompt */}
            <path
              d="M51 63 L57 68 L51 73"
              fill="none"
              stroke="var(--theme-spider-stroke)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="60"
              y1="73"
              x2="68"
              y2="73"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`select-none overflow-visible ${className}`}
      role="img"
      aria-label={`Spider carrying ${domainId.toUpperCase()} domain symbol on its back`}
    >
      <defs>
        <radialGradient id={`abdomenGrad-${domainId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="65%" stopColor="#09090B" />
          <stop offset="100%" stopColor="var(--theme-spider-stroke)" stopOpacity="0.65" />
        </radialGradient>
      </defs>

      {/* Vertical Silk Thread anchoring the spider from above */}
      <line
        x1="60"
        y1="0"
        x2="60"
        y2="30"
        stroke="var(--theme-spider-stroke)"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity="0.65"
      />

      {/* 8 Articulated Biomechanical Spider Legs */}
      <g
        stroke="var(--theme-spider-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Left Leg 1 (Front) */}
        <path d={`M51 39 L32 ${24 + swingA} L18 ${12 - swingA}`} />
        {/* Left Leg 2 (Upper Mid) */}
        <path d={`M49 44 L25 ${39 - swingB} L10 ${34 + swingB}`} />
        {/* Left Leg 3 (Lower Mid) */}
        <path d={`M49 50 L24 ${58 + swingA} L9 ${70 - swingA}`} />
        {/* Left Leg 4 (Rear) */}
        <path d={`M51 55 L32 ${78 - swingB} L20 ${102 + swingB}`} />

        {/* Right Leg 1 (Front) */}
        <path d={`M69 39 L88 ${24 - swingA} L102 ${12 + swingA}`} />
        {/* Right Leg 2 (Upper Mid) */}
        <path d={`M71 44 L95 ${39 + swingB} L110 ${34 - swingB}`} />
        {/* Right Leg 3 (Lower Mid) */}
        <path d={`M71 50 L96 ${58 - swingA} L111 ${70 + swingA}`} />
        {/* Right Leg 4 (Rear) */}
        <path d={`M69 55 L88 ${78 + swingB} L100 ${102 - swingB}`} />
      </g>

      {/* Leg Joint Highlights */}
      <g fill="var(--theme-spider-joint)">
        <circle cx="32" cy={24 + swingA} r="2" />
        <circle cx="25" cy={39 - swingB} r="2" />
        <circle cx="24" cy={58 + swingA} r="2" />
        <circle cx="32" cy={78 - swingB} r="2" />
        <circle cx="88" cy={24 - swingA} r="2" />
        <circle cx="95" cy={39 + swingB} r="2" />
        <circle cx="96" cy={58 - swingA} r="2" />
        <circle cx="88" cy={78 + swingB} r="2" />
      </g>

      {/* Pedipalps / Fangs */}
      <path
        d="M55 31 L52 23 M65 31 L68 23"
        stroke="var(--theme-accent-soft)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Cephalothorax (Head & Upper Thorax) */}
      <ellipse
        cx="60"
        cy="39"
        rx="11"
        ry="9"
        fill="#18181B"
        stroke="var(--theme-spider-stroke)"
        strokeWidth="1.8"
      />
      {/* Spider Optic Eyes */}
      <circle cx="56" cy="35" r="1.7" fill="var(--theme-accent-soft)" />
      <circle cx="64" cy="35" r="1.7" fill="var(--theme-accent-soft)" />
      <circle cx="58.5" cy="33.5" r="1.1" fill="#FFFFFF" />
      <circle cx="61.5" cy="33.5" r="1.1" fill="#FFFFFF" />

      {/* Dorsal Abdomen (Back Carapace where the Domain Symbol sits) */}
      <path
        d="M60 47 C76 47, 83 60, 80 76 C77 90, 67 98, 60 100 C53 98, 43 90, 40 76 C37 60, 44 47, 60 47 Z"
        fill={`url(#abdomenGrad-${domainId})`}
        stroke="var(--theme-spider-stroke)"
        strokeWidth="2"
      />

      {/* Dorsal Carapace Circuit Lines */}
      <path
        d="M60 48 L60 54 M43 68 L48 68 M72 68 L77 68 M60 85 L60 96"
        stroke="var(--theme-spider-stroke)"
        strokeWidth="1.4"
        opacity="0.75"
      />

      {/* Authentic Domain Symbol Carried on the Spider's Back */}
      {renderDomainCrestOnBack()}
    </svg>
  );
};
