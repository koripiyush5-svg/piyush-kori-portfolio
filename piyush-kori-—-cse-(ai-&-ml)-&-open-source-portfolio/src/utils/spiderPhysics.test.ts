import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWebShot,
  stepWebShots,
  computeWebGeometry,
  createInitialSpiders,
  stepCrawlingSpider,
  attractNearestSpiderToWeb,
  executeTerminalCommand,
} from './spiderPhysics';

test('createWebShot and computeWebGeometry generate valid radial spiderweb geometry', () => {
  const shot = createWebShot(720, 360, 1440, 900, 'classic', 1000, 0.5);
  assert.equal(shot.targetX, 720);
  assert.equal(shot.targetY, 360);
  assert.equal(shot.spokes, 8);
  assert.ok(shot.opacity === 1);

  // Advance shot so progress reaches 1.0 (full bloom)
  const [bloomed] = stepWebShots([shot], 200);
  assert.ok(bloomed);
  assert.equal(bloomed.progress, 1);

  const geometry = computeWebGeometry(bloomed);
  assert.equal(geometry.mainLine.x2, 720);
  assert.equal(geometry.mainLine.y2, 360);
  assert.equal(geometry.spokeLines.length, 8);
  assert.equal(geometry.ringPolygons.length, 3);
  assert.equal(geometry.ringPolygons[0].length, 8);

  // Verify 4 corner trails connect (720, 360) to (0,0), (1440,0), (1440,900), (0,900)
  assert.equal(geometry.cornerTrails.length, 4);
  assert.deepEqual(
    geometry.cornerTrails.map((t) => ({ x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 })),
    [
      { x1: 720, y1: 360, x2: 0, y2: 0 },
      { x1: 720, y1: 360, x2: 1440, y2: 0 },
      { x1: 720, y1: 360, x2: 1440, y2: 900 },
      { x1: 720, y1: 360, x2: 0, y2: 900 },
    ]
  );
  assert.ok(geometry.cornerTrails.every((t) => t.trailOpacity > 0 && t.trailOpacity <= 1));
});

test('stepWebShots fades and removes expired web shots over time', () => {
  const shot = createWebShot(400, 300, 1440, 900, 'impact', 1000, 0.5);
  const [fullyExtended] = stepWebShots([shot], 180);
  assert.equal(fullyExtended.progress, 1);

  // Step forward in 200ms increments until > 4.6 seconds elapsed
  let active = [fullyExtended];
  for (let i = 0; i < 25; i++) {
    active = stepWebShots(active, 200);
  }
  assert.equal(active.length, 0);
});

test('createInitialSpiders creates 6 domain spiders with authentic domain symbols', () => {
  const spiders = createInitialSpiders(1440, 900);
  assert.equal(spiders.length, 6);
  const domainIds = spiders.map((s) => s.domainId);
  assert.deepEqual(domainIds, ['python', 'html', 'css', 'git', 'github', 'terminal']);

  const stepped = stepCrawlingSpider(spiders[0], 50, 1440, 900, 0.42);
  assert.notEqual(stepped.x, spiders[0].x);
  assert.notEqual(stepped.legPhase, spiders[0].legPhase);
});

test('attractNearestSpiderToWeb directs the closest spider to investigate the shot web', () => {
  const spiders = createInitialSpiders(1440, 900);
  const updated = attractNearestSpiderToWeb(spiders, 120, 200);
  const investigating = updated.filter((s) => s.isInvestigatingWeb);
  assert.equal(investigating.length, 1);
  assert.equal(investigating[0].targetX, 120);
  assert.equal(investigating[0].targetY, 200);
});

test('executeTerminalCommand handles portfolio commands and unknown inputs cleanly', () => {
  const whoami = executeTerminalCommand('whoami');
  assert.ok(whoami.output.some((line) => line.includes('Piyush Kori')));
  assert.ok(whoami.output.some((line) => line.includes('Newton School of Technology, ADYPU')));

  const skills = executeTerminalCommand('skills');
  assert.ok(skills.output.some((line) => line.includes('Python')));
  assert.ok(skills.output.some((line) => line.includes('Terminal Commands')));

  const projects = executeTerminalCommand('projects');
  assert.ok(projects.output.some((line) => line.includes('Hostel Management Web Application')));

  const shoot = executeTerminalCommand('shoot');
  assert.equal(shoot.triggerWebShot, true);

  const unknown = executeTerminalCommand('invalid_cmd_xyz');
  assert.equal(unknown.isError, true);
});

test('getSectionRevealClasses returns proper Tailwind fade-in and slide-up transition classes', async () => {
  const { getSectionRevealClasses } = await import('./spiderPhysics');
  const hiddenClasses = getSectionRevealClasses(false, 100);
  assert.ok(hiddenClasses.includes('opacity-0'));
  assert.ok(hiddenClasses.includes('translate-y-6'));
  assert.ok(hiddenClasses.includes('duration-700'));
  assert.ok(hiddenClasses.includes('delay-100'));

  const visibleClasses = getSectionRevealClasses(true, 0);
  assert.ok(visibleClasses.includes('opacity-100'));
  assert.ok(visibleClasses.includes('translate-y-0'));
  assert.ok(!visibleClasses.includes('opacity-0'));
});

test('computeWebSoundProfile generates subtle acoustic synthesis parameters for each cartridge mode', async () => {
  const { computeWebSoundProfile } = await import('./spiderPhysics');
  const classic = computeWebSoundProfile('classic');
  const impact = computeWebSoundProfile('impact');
  const taser = computeWebSoundProfile('taser');

  assert.equal(classic.mode, 'classic');
  assert.ok(classic.peakOscFreq > classic.startOscFreq);
  assert.ok(classic.peakGain > 0 && classic.peakGain <= 0.2);

  assert.equal(impact.mode, 'impact');
  assert.ok(impact.startOscFreq < classic.startOscFreq);

  assert.equal(taser.mode, 'taser');
  assert.ok(taser.peakOscFreq > classic.peakOscFreq);
});

test('getDomainSpiderCardClasses returns spider scale, rotation, and web-silk border glow classes on hover', async () => {
  const { getDomainSpiderCardClasses } = await import('./spiderPhysics');
  const unselectedEven = getDomainSpiderCardClasses(false, 0);
  const selectedOdd = getDomainSpiderCardClasses(true, 1);

  assert.ok(unselectedEven.cardClasses.includes('group'));
  assert.ok(unselectedEven.cardClasses.includes('hover:border-rose-400/80'));
  assert.ok(unselectedEven.cardClasses.includes('hover:shadow-'));
  assert.ok(unselectedEven.spiderWrapperClasses.includes('group-hover:scale-110'));
  assert.ok(unselectedEven.spiderWrapperClasses.includes('group-hover:-rotate-6'));

  assert.ok(selectedOdd.cardClasses.includes('border-rose-400/90'));
  assert.ok(selectedOdd.spiderWrapperClasses.includes('group-hover:scale-110'));
  assert.ok(selectedOdd.spiderWrapperClasses.includes('group-hover:rotate-6'));
  assert.ok(selectedOdd.silkGlowOverlayClasses.includes('group-hover:opacity-100'));
});

test('aggregateGitHubProfileStats computes contribution count and most frequent language usage', async () => {
  const { aggregateGitHubProfileStats } = await import('./spiderPhysics');
  const stats = aggregateGitHubProfileStats({
    username: 'koripiyush5-svg',
    displayName: 'Piyush Kori',
    publicReposCount: 2,
    yearlyContributions: 7,
    languageByteMaps: [
      { Python: 103383, JavaScript: 56549, HTML: 55450, CSS: 26787 },
    ],
    events: [
      { id: '1', type: 'PushEvent', repo: { name: 'dhruvkashiv/Team-4pi' }, created_at: '2026-10-24T17:44:10Z' },
      { id: '2', type: 'MemberEvent', repo: { name: 'dhruvkashiv/Team-4pi' }, created_at: '2026-10-24T12:14:00Z' },
    ],
  });

  assert.equal(stats.username, 'koripiyush5-svg');
  assert.equal(stats.latestContributionCount, 7);
  assert.equal(stats.topLanguage, 'Python');
  assert.equal(stats.languages.length, 4);
  assert.equal(stats.languages[0].language, 'Python');
  assert.equal(stats.languages[0].percentage, 42.7);
  assert.deepEqual(stats.contributedRepos, ['dhruvkashiv/Team-4pi']);
});

test('generateGitHubDeployBundle builds Git push commands, Pages URL, and complete file manifest', async () => {
  const { generateGitHubDeployBundle, executeTerminalCommand } = await import('./spiderPhysics');
  const bundle = generateGitHubDeployBundle('koripiyush5-svg', 'piyush-kori-portfolio');

  assert.equal(bundle.username, 'koripiyush5-svg');
  assert.equal(bundle.repoName, 'piyush-kori-portfolio');
  assert.equal(bundle.remoteUrl, 'https://github.com/koripiyush5-svg/piyush-kori-portfolio.git');
  assert.equal(bundle.expectedPagesUrl, 'https://koripiyush5-svg.github.io/piyush-kori-portfolio/');
  assert.ok(bundle.gitCliCommands.includes('git push -u origin main'));
  assert.equal(bundle.includedFiles.length, 18);
  assert.ok(bundle.includedFiles.some((f) => f.path === '.github/workflows/deploy.yml'));
  assert.ok(bundle.includedFiles.some((f) => f.path === 'server.ts'));
  assert.ok(bundle.includedFiles.some((f) => f.path === 'src/components/PortfolioChatbot.tsx'));
  assert.ok(bundle.includedFiles.some((f) => f.path === 'src/components/GetInTouchModal.tsx'));

  const deployCmd = executeTerminalCommand('deploy');
  assert.ok(deployCmd.output.some((line) => line.includes('koripiyush5-svg.github.io')));
});

test('getSuitThemeConfig returns distinct CSS variable palettes for classic-red and venom themes', async () => {
  const { getSuitThemeConfig } = await import('./spiderPhysics');
  const classic = getSuitThemeConfig('classic-red');
  const venom = getSuitThemeConfig('venom');

  assert.equal(classic.id, 'classic-red');
  assert.equal(classic.cssVars['--theme-accent'], '#E11D48');
  assert.equal(classic.cssVars['--theme-spider-stroke'], '#E11D48');
  assert.equal(classic.cssVars['--theme-button-text'], '#FFFFFF');

  assert.equal(venom.id, 'venom');
  assert.equal(venom.cssVars['--theme-accent'], '#F4F4F5');
  assert.equal(venom.cssVars['--theme-spider-stroke'], '#F4F4F5');
  assert.equal(venom.cssVars['--theme-button-bg'], '#F4F4F5');
  assert.equal(venom.cssVars['--theme-button-text'], '#050507');
  assert.notEqual(classic.cssVars['--theme-bg'], venom.cssVars['--theme-bg']);
});

test('getWebShooterOverlayStyle switches cursor and web colors from red to black/silver symbiote in venom mode', async () => {
  const { getWebShooterOverlayStyle } = await import('./spiderPhysics');
  const redStyle = getWebShooterOverlayStyle('classic-red', 'classic');
  const venomStyle = getWebShooterOverlayStyle('venom', 'classic');

  assert.equal(redStyle.suitTheme, 'classic-red');
  assert.equal(redStyle.isSymbiote, false);
  assert.equal(redStyle.ringStroke, '#E11D48');
  assert.equal(redStyle.nodeFill, '#E11D48');

  assert.equal(venomStyle.suitTheme, 'venom');
  assert.equal(venomStyle.isSymbiote, true);
  assert.equal(venomStyle.mainStrandStroke, '#E4E4E7');
  assert.equal(venomStyle.symbioteCoreStroke, '#09090B');
  assert.equal(venomStyle.ringStroke, '#A1A1AA');
  assert.equal(venomStyle.nodeFill, '#09090B');
  assert.notEqual(redStyle.cursorCss, venomStyle.cursorCss);
});

test('buildGeminiChatHistory and generatePortfolioKnowledgeReply format multi-turn history and answer portfolio queries', async () => {
  const { buildGeminiChatHistory, generatePortfolioKnowledgeReply } = await import('./spiderPhysics');

  const history = buildGeminiChatHistory([
    { role: 'user', text: 'Who is Piyush Kori?' },
    { role: 'model', text: 'Piyush Kori is a CSE AI & ML student.' },
  ]);

  assert.equal(history.length, 2);
  assert.deepEqual(history[0], { role: 'user', parts: [{ text: 'Who is Piyush Kori?' }] });
  assert.deepEqual(history[1], { role: 'model', parts: [{ text: 'Piyush Kori is a CSE AI & ML student.' }] });

  const projectReply = generatePortfolioKnowledgeReply('What projects has Piyush built?');
  assert.ok(projectReply.includes('Hostel Management Web Application'));
  assert.ok(projectReply.includes('Real-Time Object Detection'));

  const hacktoberfestReply = generatePortfolioKnowledgeReply('Tell me about his Hacktoberfest hostel project');
  assert.ok(hacktoberfestReply.includes('dhruvkashiv/Team-4pi'));

  const contactReply = generatePortfolioKnowledgeReply('How can I contact or email him?');
  assert.ok(contactReply.includes('koripiyush5@gmail.com'));
});

test('getDirectCommunicationLinks and buildContactFormSubmission provide LinkedIn/GitHub quick links and validate contact form', async () => {
  const { getDirectCommunicationLinks, buildContactFormSubmission } = await import('./spiderPhysics');

  const links = getDirectCommunicationLinks();
  assert.equal(links.email, 'koripiyush5@gmail.com');
  assert.equal(links.githubUrl, 'https://github.com/koripiyush5-svg');
  assert.ok(links.linkedinUrl.includes('linkedin.com/in/piyush-kori'));

  const invalid = buildContactFormSubmission({
    senderName: 'Alex',
    senderEmail: 'invalid-email',
    subject: 'Open Source',
    message: 'Let us collaborate!',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.error);

  const valid = buildContactFormSubmission({
    senderName: 'Priya Sharma',
    senderEmail: 'priya@example.com',
    subject: 'Open Source Collaboration & PRs',
    message: 'Would love to collaborate on Python computer vision issues!',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.error, null);
  assert.ok(valid.mailtoHref.startsWith('mailto:koripiyush5@gmail.com?subject='));
  assert.ok(valid.confirmationText.includes('Priya Sharma'));
});
