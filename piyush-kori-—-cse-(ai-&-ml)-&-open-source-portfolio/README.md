# Piyush Kori — Spider-Verse Interactive Portfolio

Interactive developer portfolio for **Piyush Kori** (`@koripiyush5-svg`, `koripiyush5@gmail.com`), First-Year B.Tech in CSE (AI & ML) student at **Newton School of Technology, ADYPU**.

---

## Key Features

- **Classic Red & Venom Symbiote Suit Themes**: Switch dynamically between the **Classic Red** Spider-Man palette and the monochrome **Venom B&W** symbiote palette with a dedicated black-and-silver symbiote cursor reticle and web-shooting visual style.
- **Interactive Web-Shooting Physics & Sound**: Click anywhere on the viewport to fire synthetic webs with radial silk rings, 4 dynamic fading SVG corner trails, and a synthesized Web Audio *"thwip!"* sound effect across 3 cartridge modes (**Classic Silk**, **Crimson Impact**, and **Bio-Electric**).
- **6 Articulated Domain Spiders**: Every technical domain (**Python**, **HTML5**, **CSS3**, **Git**, **GitHub**, and **Terminal Commands**) is represented by a custom SVG spider carrying that domain's authentic symbol on its dorsal carapace, with hover scale/rotation and web-silk border glow.
- **Selected Engineering Projects**:
  1. **Pre-College Project: Real-Time Object Detection System** (Interactive Vision Confidence Sandbox).
  2. **Hacktoberfest Project: Hostel Management Web Application** (Built and deployed with the team during Hacktoberfest at `dhruvkashiv/Team-4pi`, with PR & Deployment Inspector).
- **Spider-Byte Gemini AI Portfolio Assistant**: Multi-turn AI chatbot (`gemini-3.8-flash` & `gemini-3.1-flash-lite`) grounded in Piyush Kori's education, domains, and projects.
- **Interactive Spider-Shell CLI Terminal**: Run `whoami`, `skills`, `projects`, `opensource`, `git log`, `deploy`, or `shoot` directly in the browser.
- **Real-Time GitHub Telemetry & Direct Contact Modal**: Fetches live public contribution counts and byte-level language distribution for `@koripiyush5-svg`, plus a **Get in Touch** modal with an email contact form and quick links to LinkedIn and GitHub.

---

## Complete Project File Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml                  # Automated GitHub Pages CI/CD workflow
├── public/
│   └── images/                         # Production-ready static image assets
├── src/
│   ├── assets/images/                  # Source portfolio illustrations
│   ├── components/
│   /*.tsx
│   │   ├── DomainSpiderSymbol.tsx      # SVG spiders carrying domain symbols on their backs
│   │   ├── GetInTouchModal.tsx         # Direct email contact form & LinkedIn/GitHub quick links
│   │   ├── GitHubActivityWidget.tsx    # Real-time GitHub API contribution & language widget
│   │   ├── GitHubDeployModal.tsx       # Interactive GitHub deployment & file archive center
│   │   ├── PortfolioChatbot.tsx        # Multi-turn Spider-Byte Gemini AI assistant
│   │   ├── ProjectModal.tsx            # Vision Sandbox & Hacktoberfest Hostel App inspector
│   │   ├── RevealSection.tsx           # Scroll-triggered fade-in & slide-up wrapper
│   │   ├── TerminalSection.tsx         # Interactive Linux CLI terminal
│   │   └── WebShooterOverlay.tsx       # Full-viewport SVG web-shooter & roaming spiders
│   ├── data/
│   │   └── portfolioData.ts            # Profile, LinkedIn/GitHub links, 6 domains, 2 projects
│   ├── utils/
│   │   ├── spiderPhysics.ts            # Pure web geometry, corner trails, themes, CLI & GitHub helpers
│   │   ├── spiderPhysics.test.ts       # Node unit test suite (14 tests via node:test)
│   │   └── webSound.ts                 # Web Audio API synthesized "thwip!" sound engine
│   ├── App.tsx                         # Main application layout
│   ├── index.css                       # Tailwind CSS & custom theme variables
│   └── main.tsx                        # React DOM entry point
├── server.ts                           # Express + Vite full-stack server (/api/chat & /api/deploy-bundle)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## How to Deploy to GitHub & GitHub Pages

### Option 1: Download All Files Directly or Use AI Studio GitHub Export
- Click **"Deploy to GitHub (All Files)"** on the portfolio and click **"Download All Files (.tar.gz)"** (or use the **GitHub Export** button in the top bar of Google AI Studio).

### Option 2: Push via Terminal (`git` CLI)
```bash
# 1. Initialize Git and stage all project files
git init
git add .
git commit -m "feat: deploy Piyush Kori Spider-Verse portfolio with all files"

# 2. Link to your GitHub repository (@koripiyush5-svg)
git branch -M main
git remote add origin https://github.com/koripiyush5-svg/piyush-kori-portfolio.git
git push -u origin main
```

### Enable Live GitHub Pages Hosting
1. Open your repository on GitHub (`https://github.com/koripiyush5-svg/piyush-kori-portfolio`).
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build `./dist` and publish your live portfolio at:
   `https://koripiyush5-svg.github.io/piyush-kori-portfolio/`
