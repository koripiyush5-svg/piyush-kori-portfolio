export type DomainId = 'python' | 'html' | 'css' | 'git' | 'github' | 'terminal';

export interface DomainSkill {
  id: DomainId;
  name: string;
  symbolLabel: string;
  category: string;
  spiderClass: string;
  proficiency: string;
  summary: string;
  spiderBackDescription: string;
  codeSnippet: string;
  keyTopics: string[];
  openSourceUse: string;
}

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  category: 'person' | 'vehicle' | 'gadget';
}

export interface ProjectItem {
  id: 'object-detection' | 'hacktoberfest-hostel';
  index: string;
  title: string;
  subtitle: string;
  timeline: string;
  role: string;
  teamContext: string;
  status: string;
  image: string;
  summary: string;
  architectureDetails: string[];
  techStack: string[];
  highlights: string[];
  codePreview: string;
  detectionBoxes?: DetectionBox[];
  hacktoberfestPRs?: {
    prNumber: string;
    title: string;
    author: string;
    branch: string;
    impact: string;
  }[];
}

export const PROFILE_DATA = {
  name: 'Piyush Kori',
  email: 'koripiyush5@gmail.com',
  githubHandle: '@koripiyush5-svg',
  githubUrl: 'https://github.com/koripiyush5-svg',
  linkedinHandle: 'in/piyush-kori',
  linkedinUrl: 'https://www.linkedin.com/in/piyush-kori',
  role: 'First-Year B.Tech in CSE (AI & ML) Student',
  institution: 'Newton School of Technology, ADYPU',
  location: 'Pune, India',
  openSourceStatus: 'Actively Seeking Open Source Contributions',
  heroHeadline: 'Building AI vision systems & interactive web experiences across the open-source web.',
  heroLead:
    'I am Piyush Kori, a first-year B.Tech Computer Science & Engineering (AI & ML) student at Newton School of Technology, ADYPU. Trained in Python, HTML, CSS, Git, GitHub, and Linux Terminal workflows—with hands-on experience building an Object Detection system and shipping a deployed Hostel Management web application with my team during Hacktoberfest.',
  heroImage: 'images/hero_spider_coder_1794150251005.jpg',
  metrics: [
    {
      value: '1st Year',
      unit: 'B.Tech CSE (AI & ML)',
      context: 'Newton School of Technology · ADYPU',
    },
    {
      value: '06',
      unit: 'Core Tech Domains',
      context: 'Python · HTML · CSS · Git · GitHub · CLI',
    },
    {
      value: '02',
      unit: 'Shipped Projects',
      context: 'Vision Object Detection & Hostel App',
    },
    {
      value: '100%',
      unit: 'Open Source Ready',
      context: 'Git PR Workflows · Team Deployment',
    },
  ],
};

export const DOMAIN_SKILLS: DomainSkill[] = [
  {
    id: 'python',
    name: 'Python',
    symbolLabel: 'PY',
    category: 'AI & Machine Learning Core',
    spiderClass: 'Arachne-Py Vision Unit',
    proficiency: 'Core Language · AI/ML & Computer Vision',
    summary:
      'Primary programming language for algorithmic problem-solving, computer vision pipelines, real-time object detection scripts, and data preprocessing.',
    spiderBackDescription: 'Carries the intertwined Python dual-serpent emblem etched in crimson & silver on its dorsal carapace.',
    codeSnippet: `import cv2\n\n# Pre-College Object Detection Pipeline\nnet = cv2.dnn.readNet("yolov4-tiny.weights", "yolov4-tiny.cfg")\nblob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True)\nnet.setInput(blob)\ndetections = net.forward()`,
    keyTopics: ['Object Detection Logic', 'NumPy & Matrix Ops', 'Modular Scripting', 'Data Structures'],
    openSourceUse: 'Writing clean Python automation scripts, ML inference helpers, and bug fixes for open-source AI repos.',
  },
  {
    id: 'html',
    name: 'HTML5',
    symbolLabel: '</>',
    category: 'Web Structure & Semantics',
    spiderClass: 'Weaver-DOM Structural Unit',
    proficiency: 'Semantic Markup · Accessible DOM',
    summary:
      'Crafting structured, accessible document trees, interactive canvas overlays, and clean semantic layouts for modern web applications.',
    spiderBackDescription: 'Carries the angular HTML5 shield and `< />` bracket crest illuminated across its dorsal abdomen.',
    codeSnippet: `<main aria-label="Spider-Verse Portfolio">\n  <canvas id="web-shooter-layer" data-interactive="true"></canvas>\n  <section id="domains" aria-labelledby="domain-heading">\n    <h2 id="domain-heading">01. Domain Arsenal</h2>\n  </section>\n</main>`,
    keyTopics: ['Semantic HTML5 Elements', 'Canvas & SVG Embedding', 'ARIA Accessibility', 'SEO Meta Structure'],
    openSourceUse: 'Improving semantic accessibility, fixing DOM structure issues, and building documentation pages.',
  },
  {
    id: 'css',
    name: 'CSS3',
    symbolLabel: '{#}',
    category: 'Visual Styling & Motion',
    spiderClass: 'Chroma-Silk Styling Unit',
    proficiency: 'Responsive Layouts · Custom Animations',
    summary:
      'Designing high-contrast dark interfaces, responsive Bento grids, smooth compositor animations, and custom Spider-Man red-and-black visual themes.',
    spiderBackDescription: 'Carries the CSS3 cascading `{ # }` stylesheet emblem glowing on its armored back.',
    codeSnippet: `.spider-card {\n  background: #0d0d12;\n  border: 1px solid rgba(225, 29, 72, 0.28);\n  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);\n}\n.spider-card:hover {\n  transform: translateY(-4px);\n}`,
    keyTopics: ['Flexbox & CSS Grid', 'Keyframe Micro-Interactions', 'Responsive Breakpoints', 'Custom Properties'],
    openSourceUse: 'Fixing responsive layout bugs, refining dark-mode contrast, and polishing UI components in community projects.',
  },
  {
    id: 'git',
    name: 'Git',
    symbolLabel: 'GIT',
    category: 'Distributed Version Control',
    spiderClass: 'Branch-Walker VCS Unit',
    proficiency: 'Branching · Merging · Commit Hygiene',
    summary:
      'Managing source code history with atomic commits, clean feature branches, interactive staging, and conflict resolution during team sprints.',
    spiderBackDescription: 'Carries the Git branching node-graph symbol directly on its back, connecting commit nodes like silk threads.',
    codeSnippet: `$ git checkout -b feat/spider-web-shooter\n$ git add src/utils/spiderPhysics.ts\n$ git commit -m "feat: add radial web-shooting click physics"\n$ git pull --rebase origin main`,
    keyTopics: ['Feature Branch Workflow', 'Merge Conflict Resolution', 'Atomic Commit History', 'Rebase & Stash'],
    openSourceUse: 'Maintaining clean commit histories and syncing forks effortlessly when contributing to upstream repositories.',
  },
  {
    id: 'github',
    name: 'GitHub',
    symbolLabel: 'GH',
    category: 'Collaborative Open Source',
    spiderClass: 'Octo-Weaver Collab Unit',
    proficiency: 'Pull Requests · Hacktoberfest · CI Deploy',
    summary:
      'Collaborating with developer teams through Pull Requests, code reviews, issue tracking, and shipping production web deployments during Hacktoberfest.',
    spiderBackDescription: 'Carries the GitHub Octocat & Pull-Request merge crest sculpted onto its crimson-trimmed back.',
    codeSnippet: `$ gh repo fork upstream/open-source-project --clone\n$ gh pr create --title "fix: optimize object detection frame loop" \\\n  --body "Resolves #42 with deterministic bounding box filtering"`,
    keyTopics: ['Pull Request Workflows', 'Hacktoberfest Collaboration', 'Issue Triage & Docs', 'Live Web Deployment'],
    openSourceUse: 'Submitting well-documented Pull Requests, collaborating on Hacktoberfest issues, and reviewing team code.',
  },
  {
    id: 'terminal',
    name: 'Terminal Commands',
    symbolLabel: '$_',
    category: 'Linux & Shell CLI',
    spiderClass: 'Shell-Crawler Kernel Unit',
    proficiency: 'Bash CLI · File System · Process Control',
    summary:
      'Navigating Linux environments rapidly from the command line, chaining shell pipelines, managing permissions, and running build and test suites.',
    spiderBackDescription: 'Carries the `$_` terminal prompt emblem illuminated in high-contrast crimson on its dorsal shell.',
    codeSnippet: `piyush@nst-adypu:~/projects$ ls -la && grep -rn "detect_objects" src/\npiyush@nst-adypu:~/projects$ chmod +x deploy_spider_app.sh\npiyush@nst-adypu:~/projects$ ./deploy_spider_app.sh --env=production`,
    keyTopics: ['Bash Navigation & Pipes', 'Grep & File Search', 'Process & Env Management', 'Shell Automation'],
    openSourceUse: 'Setting up developer environments quickly, debugging build scripts, and running automated test suites via CLI.',
  },
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'object-detection',
    index: '01',
    title: 'Pre-College Project: Real-Time Object Detection System',
    subtitle: 'Computer Vision · Python Pipeline · Bounding-Box Classification',
    timeline: 'Pre-College Milestone · 2025–2026',
    role: 'Solo AI/ML Developer',
    teamContext: 'Foundational Pre-College Computer Vision Project',
    status: 'Completed & Verified',
    image: 'images/project_object_detection_1794150253036.jpg',
    summary:
      'Built before entering college to explore how machines perceive the physical world. This Python-driven object detection pipeline processes video frames and images to localize multiple object classes with real-time bounding boxes, confidence scores, and non-maximum suppression.',
    architectureDetails: [
      'Frame Preprocessing: Resizes and normalizes raw RGB frames into tensor blobs ready for neural network forward passes.',
      'Bounding-Box Localization: Computes (x, y, width, height) coordinates and filters overlapping boxes using Non-Maximum Suppression (NMS).',
      'Confidence Filtering: Dynamically thresholds detections to eliminate false positives across varying lighting conditions.',
    ],
    techStack: ['Python', 'Computer Vision', 'OpenCV / DNN', 'Bounding-Box NMS', 'Terminal CLI'],
    highlights: [
      'Detects multiple concurrent classes (pedestrians, vehicles, transit bikes, and handheld devices) in complex street scenes.',
      'Includes an interactive threshold controller to inspect how confidence filtering sharpens precision.',
      'Sparked my pursuit of B.Tech in CSE (AI & ML) at Newton School of Technology, ADYPU.',
    ],
    codePreview: `def filter_detections(boxes, confidences, threshold=0.65):\n    """Filter object detection bounding boxes by confidence threshold."""\n    valid = []\n    for box, score in zip(boxes, confidences):\n        if score >= threshold:\n            valid.append({"box": box, "confidence": round(score, 2)})\n    return valid`,
    detectionBoxes: [
      { id: 'det-1', label: 'CYCLIST · 0.94', confidence: 0.94, x: 30, y: 43, w: 16, h: 43, category: 'person' },
      { id: 'det-2', label: 'SEDAN VEHICLE · 0.98', confidence: 0.98, x: 55, y: 52, w: 21, h: 22, category: 'vehicle' },
      { id: 'det-3', label: 'PEDESTRIAN · 0.92', confidence: 0.92, x: 80, y: 48, w: 8, h: 24, category: 'person' },
      { id: 'det-4', label: 'MOTORBIKE · 0.89', confidence: 0.89, x: 46, y: 51, w: 6, h: 14, category: 'vehicle' },
      { id: 'det-5', label: 'COMMUTER · 0.78', confidence: 0.78, x: 22, y: 48, w: 7, h: 21, category: 'person' },
      { id: 'det-6', label: 'OPTIC SENSOR · 0.64', confidence: 0.64, x: 75, y: 49, w: 4, h: 15, category: 'gadget' },
    ],
  },
  {
    id: 'hacktoberfest-hostel',
    index: '02',
    title: 'Hacktoberfest Project: Hostel Management Web Application',
    subtitle: 'Open Source Team Sprint · Room Allocation & Operations · Live Production Deployment',
    timeline: 'Hacktoberfest Sprint · Team Collaboration',
    role: 'Frontend & Git/GitHub Workflow Developer',
    teamContext: 'Built & Deployed with Team during Hacktoberfest',
    status: 'Deployed in Production',
    image: 'images/project_hostel_management_1794151862230.jpg',
    summary:
      'Collaborated with my team during Hacktoberfest to design, build, and successfully deploy a comprehensive Hostel Management Web Application. Engineered student room allocation grids, hostel occupancy analytics, maintenance ticket tracking, and mess attendance views while coordinating multi-contributor Git branches and GitHub Pull Requests.',
    architectureDetails: [
      'Student Room Allocation & Occupancy Dashboard: Built interactive floor-by-floor room status grids and block capacity indicators.',
      'Maintenance Ticket & Mess Attendance Workflows: Structured clean HTML5/CSS3 modules for student issue reporting, priority queues, and daily check-ins.',
      'Collaborative Git/GitHub & Live Deployment: Managed feature branches, resolved merge conflicts, and shipped the production web build with the team.',
    ],
    techStack: ['HTML5', 'CSS3', 'Python', 'Git', 'GitHub PRs', 'Terminal CLI', 'Web Deployment'],
    highlights: [
      'Successfully built and deployed our Hostel Management app live with my team during Hacktoberfest.',
      'Streamlined student room allocation, maintenance requests, and hostel occupancy tracking in one unified interface.',
      'Practiced real-world Git branching, merge conflict resolution, and collaborative GitHub Pull Request reviews.',
    ],
    codePreview: `# Hacktoberfest Hostel Management App — Team Git Workflow\n$ git checkout -b feat/hostel-room-allocation-grid\n$ git commit -m "feat(hostel): add floor occupancy dashboard and maintenance ticket queue"\n$ git push origin feat/hostel-room-allocation-grid\n# Merged via GitHub Pull Request & Deployed to Production`,
    hacktoberfestPRs: [
      {
        prNumber: 'PR #14',
        title: 'feat(rooms): implement interactive hostel floor & room allocation grid',
        author: 'Piyush Kori',
        branch: 'feat/hostel-room-allocation-grid',
        impact: 'Created the visual room occupancy matrix and student bed assignment cards.',
      },
      {
        prNumber: 'PR #21',
        title: 'feat(tickets): add hostel maintenance request queue and mess attendance tracker',
        author: 'Piyush Kori & Team',
        branch: 'feat/maintenance-mess-modules',
        impact: 'Enabled students and wardens to track repair priorities and daily mess check-ins.',
      },
      {
        prNumber: 'PR #29',
        title: 'chore(deploy): configure production bundle and verify live Hostel App deployment',
        author: 'Team Release',
        branch: 'release/hostel-app-v1',
        impact: 'Shipped the complete Hacktoberfest Hostel Management web application live.',
      },
    ],
  },
];

export const OPEN_SOURCE_GOALS = [
  {
    id: 'os-1',
    title: 'Python & Computer Vision Repositories',
    focus: 'Object Detection · Image Processing · ML Utilities',
    description:
      'Looking to contribute to beginner-to-intermediate Python and Computer Vision libraries—writing unit tests, improving detection scripts, and building clear example notebooks.',
  },
  {
    id: 'os-2',
    title: 'Frontend UI & Interactive Web Tools',
    focus: 'HTML5 · CSS3 · Responsive Layouts · Accessibility',
    description:
      'Eager to resolve UI bugs, enhance keyboard and screen-reader accessibility, and craft high-contrast dark mode themes for developer tools and community web apps.',
  },
  {
    id: 'os-3',
    title: 'Developer Documentation & CLI Scripts',
    focus: 'Git · GitHub Workflows · Linux Terminal Commands',
    description:
      'Helping open-source maintainers streamline onboarding guides, CLI setup scripts, and issue templates so first-time contributors can get started faster.',
  },
];
