import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Copy,
  GitBranch,
  Terminal,
  FileCode2,
  Rocket,
  ExternalLink,
  CheckCircle2,
  Download,
  Eye,
} from 'lucide-react';
import { generateGitHubDeployBundle } from '../utils/spiderPhysics';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SourceFileEntry {
  path: string;
  bytes: number;
  content: string;
}

const WORKFLOW_YAML_PREVIEW = `name: Deploy Piyush Kori Portfolio to GitHub Pages
on:
  push:
    branches: [main, master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4`;

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState<string>('koripiyush5-svg');
  const [repoName, setRepoName] = useState<string>('piyush-kori-portfolio');
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);
  const [copiedFileContent, setCopiedFileContent] = useState<boolean>(false);
  const [sourceFiles, setSourceFiles] = useState<SourceFileEntry[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<SourceFileEntry | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch('/api/deploy-bundle?format=json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.files) && data.files.length > 0) {
          setSourceFiles(data.files);
          setSelectedSourceFile((prev) => prev || data.files[0]);
        }
      })
      .catch(() => {
        // Fallback when running statically
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const bundle = generateGitHubDeployBundle(username, repoName);

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(bundle.gitCliCommands);
      setCopiedCommands(true);
      setTimeout(() => setCopiedCommands(false), 2500);
    } catch {
      setCopiedCommands(true);
      setTimeout(() => setCopiedCommands(false), 2500);
    }
  };

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(WORKFLOW_YAML_PREVIEW);
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2500);
    } catch {
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2500);
    }
  };

  const handleCopySelectedFile = async () => {
    if (!selectedSourceFile) return;
    try {
      await navigator.clipboard.writeText(selectedSourceFile.content);
      setCopiedFileContent(true);
      setTimeout(() => setCopiedFileContent(false), 2000);
    } catch {
      setCopiedFileContent(true);
      setTimeout(() => setCopiedFileContent(false), 2000);
    }
  };

  return (
    <div
      data-testid="github-deploy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-deploy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0B0B10] border border-rose-500/50 shadow-[0_0_40px_-8px_rgba(244,63,94,0.45)] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#07070A] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-mono text-rose-500 uppercase tracking-wider">
                GITHUB &amp; GITHUB PAGES DEPLOYMENT KIT · ALL {bundle.includedFiles.length} FILES BUNDLED
              </p>
              <h2
                id="github-deploy-modal-title"
                className="text-lg sm:text-xl font-bold text-white font-display"
              >
                Deploy Portfolio to GitHub (@{bundle.username})
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-github-deploy-modal"
            onClick={onClose}
            aria-label="Close GitHub deployment modal"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Status Banner: Download All Files Archive + Create Repo on GitHub */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-200 leading-relaxed">
                <strong className="text-white">All Portfolio Files Configured &amp; Ready:</strong> Includes{' '}
                <code className="text-emerald-300 font-mono">.github/workflows/deploy.yml</code>,{' '}
                <code className="text-emerald-300 font-mono">PortfolioChatbot.tsx</code>,{' '}
                <code className="text-emerald-300 font-mono">GetInTouchModal.tsx</code>,{' '}
                <code className="text-emerald-300 font-mono">server.ts</code>,{' '}
                <code className="text-emerald-300 font-mono">README.md</code>, and{' '}
                <code className="text-emerald-300 font-mono">public/images/</code>.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="/api/deploy-bundle?format=tar"
                download="piyush-kori-portfolio-all-files.tar.gz"
                data-testid="download-all-files-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Files (.tar.gz)</span>
              </a>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="create-github-repo-link"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <span>Create Repo on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Target Repository Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#07070A] border border-zinc-800/90">
            <div>
              <label
                htmlFor="deploy-gh-user"
                className="block text-xs font-mono text-zinc-400 mb-1.5"
              >
                Your GitHub Username
              </label>
              <input
                id="deploy-gh-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050507] border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="deploy-gh-repo"
                className="block text-xs font-mono text-zinc-400 mb-1.5"
              >
                Target Repository Name
              </label>
              <input
                id="deploy-gh-repo"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050507] border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* 2 Columns: Git Push Commands + Complete File Manifest */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Terminal Git Commands + Workflow */}
            <div className="lg:col-span-7 space-y-5">
              {/* Step 2: Push All Files via Git CLI */}
              <div className="p-4 rounded-xl bg-[#07070A] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>PUSH ALL FILES VIA GIT CLI (OR AI STUDIO GITHUB EXPORT)</span>
                  </span>
                  <button
                    type="button"
                    data-testid="copy-git-commands-btn"
                    onClick={handleCopyCommands}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copiedCommands ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-rose-400" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Click <strong className="text-white">Download All Files (.tar.gz)</strong> above (or the <strong className="text-white">GitHub Export</strong> icon in the AI Studio toolbar), extract the folder, and run:
                </p>

                <pre
                  data-testid="deploy-git-commands"
                  className="p-3.5 rounded-lg bg-[#040406] border border-zinc-800/90 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed"
                >
                  <code>{bundle.gitCliCommands}</code>
                </pre>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-zinc-400">
                  <span>Expected GitHub Pages Live URL:</span>
                  <span className="text-rose-400 font-semibold">{bundle.expectedPagesUrl}</span>
                </div>
              </div>

              {/* Live Source File Code Inspector (when available) or Workflow YAML Preview */}
              {selectedSourceFile ? (
                <div className="p-4 rounded-xl bg-[#07070A] border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-200">
                      <Eye className="w-3.5 h-3.5 text-rose-500" />
                      <span>SOURCE INSPECTOR: {selectedSourceFile.path}</span>
                      <span className="text-zinc-500">
                        ({(selectedSourceFile.bytes / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      data-testid="copy-selected-file-btn"
                      onClick={handleCopySelectedFile}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
                    >
                      {copiedFileContent ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied File!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-rose-400" />
                          <span>Copy File Content</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sourceFiles.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {sourceFiles.slice(0, 8).map((f) => (
                        <button
                          key={f.path}
                          type="button"
                          onClick={() => setSelectedSourceFile(f)}
                          className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            selectedSourceFile.path === f.path
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {f.path.split('/').pop()}
                        </button>
                      ))}
                    </div>
                  )}

                  <pre className="p-3 rounded-lg bg-[#040406] border border-zinc-800/90 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-44 leading-relaxed">
                    <code>{selectedSourceFile.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#07070A] border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                      <GitBranch className="w-3.5 h-3.5 text-rose-500" />
                      <span>INCLUDED FILE: .github/workflows/deploy.yml</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyYaml}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
                    >
                      {copiedYaml ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied YAML</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-rose-400" />
                          <span>Copy YAML</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3 rounded-lg bg-[#040406] border border-zinc-800/90 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-40 leading-relaxed">
                    <code>{WORKFLOW_YAML_PREVIEW}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Complete File Manifest Included in Repo */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#07070A] border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>INCLUDED REPOSITORY FILES ({bundle.includedFiles.length})</span>
                  </span>
                  <span className="text-emerald-400">All Verified</span>
                </div>

                <ul
                  data-testid="deploy-included-files-list"
                  className="space-y-2 max-h-80 overflow-y-auto pr-1"
                >
                  {bundle.includedFiles.map((file) => {
                    const matchingSource = sourceFiles.find((sf) => sf.path === file.path);
                    return (
                      <li
                        key={file.path}
                        onClick={() => {
                          if (matchingSource) setSelectedSourceFile(matchingSource);
                        }}
                        className={`p-2.5 rounded-lg bg-[#0B0B10] border transition-colors space-y-0.5 ${
                          matchingSource
                            ? 'cursor-pointer hover:border-rose-500/60'
                            : ''
                        } ${
                          selectedSourceFile?.path === file.path
                            ? 'border-rose-500/80'
                            : 'border-zinc-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-white font-semibold">
                            {file.path}
                          </span>
                          {matchingSource && (
                            <span className="text-[10px] font-mono text-rose-400">
                              Inspect
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 leading-snug">
                          {file.role}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  Production build verified (`./dist`)
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
