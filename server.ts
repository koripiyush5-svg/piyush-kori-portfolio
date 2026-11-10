import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import {
  PIYUSH_CHAT_SYSTEM_INSTRUCTION,
  buildGeminiChatHistory,
  generatePortfolioKnowledgeReply,
  PortfolioChatModel,
} from './src/utils/spiderPhysics.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MODELS: PortfolioChatModel[] = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

const BUNDLE_SOURCE_FILES = [
  '.github/workflows/deploy.yml',
  'README.md',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  '.gitignore',
  'server.ts',
  'src/main.tsx',
  'src/index.css',
  'src/App.tsx',
  'src/data/portfolioData.ts',
  'src/utils/spiderPhysics.ts',
  'src/utils/spiderPhysics.test.ts',
  'src/utils/webSound.ts',
  'src/components/DomainSpiderSymbol.tsx',
  'src/components/WebShooterOverlay.tsx',
  'src/components/GitHubActivityWidget.tsx',
  'src/components/GitHubDeployModal.tsx',
  'src/components/PortfolioChatbot.tsx',
  'src/components/GetInTouchModal.tsx',
  'src/components/ProjectModal.tsx',
  'src/components/TerminalSection.tsx',
  'src/components/RevealSection.tsx',
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  // Complete Project File Bundle Endpoint (Tarball download + JSON source inspector)
  app.get('/api/deploy-bundle', (req, res) => {
    const format = String(req.query.format || 'json');

    if (format === 'tar') {
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="piyush-kori-portfolio-all-files.tar.gz"'
      );

      const tarTargets = [
        '.github',
        'public',
        'src',
        'index.html',
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'server.ts',
        'README.md',
        '.gitignore',
      ].filter((rel) => fs.existsSync(path.join(__dirname, rel)));

      const tarProc = spawn('tar', ['-czf', '-', ...tarTargets], {
        cwd: __dirname,
      });

      tarProc.stdout.pipe(res);
      tarProc.on('error', () => {
        if (!res.headersSent) {
          res.status(500).end('Failed to create archive');
        }
      });
      return;
    }

    const filesPayload = BUNDLE_SOURCE_FILES.map((relPath) => {
      const absPath = path.join(__dirname, relPath);
      if (!fs.existsSync(absPath)) return null;
      const content = fs.readFileSync(absPath, 'utf-8');
      return {
        path: relPath,
        bytes: Buffer.byteLength(content, 'utf-8'),
        content,
      };
    }).filter(Boolean);

    res.json({
      totalFiles: filesPayload.length,
      files: filesPayload,
    });
  });

  // Multi-turn Gemini Chat API Route for Piyush Kori's Portfolio Assistant
  app.post('/api/chat', async (req, res) => {
    const { message, history = [], model = 'gemini-3.8-flash' } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a message to ask about Piyush Kori.' });
      return;
    }

    const selectedModel: PortfolioChatModel = ALLOWED_MODELS.includes(model)
      ? model
      : 'gemini-3.8-flash';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: generatePortfolioKnowledgeReply(message),
        modelUsed: selectedModel,
        source: 'portfolio-knowledge',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const formattedHistory = buildGeminiChatHistory(Array.isArray(history) ? history : []);

      const chat = ai.chats.create({
        model: selectedModel,
        history: formattedHistory,
        config: {
          systemInstruction: PIYUSH_CHAT_SYSTEM_INSTRUCTION,
        },
      });

      const response: GenerateContentResponse = await Promise.race([
        chat.sendMessage({
          message: message.trim(),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 3500)
        ),
      ]);

      const replyText = response.text || generatePortfolioKnowledgeReply(message);

      res.json({
        reply: replyText,
        modelUsed: selectedModel,
        source: 'gemini',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403') || errMsg.includes('API_KEY_INVALID')) {
        res.status(403).json({
          error:
            'Please check your Gemini API key in the Settings > Secrets panel, or use the built-in portfolio answer below.',
          fallbackReply: generatePortfolioKnowledgeReply(message),
        });
        return;
      }

      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        res.status(429).json({
          error:
            'Gemini API rate limit reached. Upgrading to a billing-enabled API key in Settings > Secrets increases quota.',
          fallbackReply: generatePortfolioKnowledgeReply(message),
        });
        return;
      }

      res.json({
        reply: generatePortfolioKnowledgeReply(message),
        modelUsed: selectedModel,
        source: 'portfolio-knowledge',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
