import React, { useState } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw } from 'lucide-react';
import { executeTerminalCommand, TerminalEntry } from '../utils/spiderPhysics';
import { RevealSection } from './RevealSection';

interface TerminalSectionProps {
  onTriggerWebShot: () => void;
}

const INITIAL_HISTORY: TerminalEntry[] = [
  {
    id: 'init-1',
    command: 'whoami',
    output: [
      'Name        : Piyush Kori',
      'Program     : First-Year B.Tech in CSE (AI & ML) Student',
      'University  : Newton School of Technology, ADYPU',
      'Focus       : AI & Machine Learning · Computer Vision · Open Source Web',
      'Status      : Actively Seeking Open Source Contributions',
    ],
  },
];

const QUICK_COMMANDS = ['skills', 'projects', 'opensource', 'git log', 'deploy', 'shoot', 'help', 'clear'];

export const TerminalSection: React.FC<TerminalSectionProps> = ({ onTriggerWebShot }) => {
  const [history, setHistory] = useState<TerminalEntry[]>(INITIAL_HISTORY);
  const [input, setInput] = useState<string>('');

  const runCommand = (rawCmd: string) => {
    const result = executeTerminalCommand(rawCmd);

    if (result.clear) {
      setHistory([]);
      return;
    }

    if (result.triggerWebShot) {
      onTriggerWebShot();
    }

    const newEntry: TerminalEntry = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command: rawCmd,
      output: result.output,
      isError: result.isError,
    };

    setHistory((prev) => [...prev, newEntry]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runCommand(input);
    setInput('');
  };

  return (
    <RevealSection id="terminal" className="py-20 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono text-rose-500 tracking-wide mb-2">
              LINUX CLI & GIT WORKFLOW ENVIRONMENT
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              03. Interactive Spider-Shell Terminal
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            Test my command-line proficiency directly in the browser. Click any quick command below or type{' '}
            <code className="text-rose-400 font-mono">skills</code>,{' '}
            <code className="text-rose-400 font-mono">projects</code>,{' '}
            <code className="text-rose-400 font-mono">git log</code>, or{' '}
            <code className="text-rose-400 font-mono">shoot</code>.
          </p>
        </div>

        {/* Terminal Window Container */}
        <div className="rounded-2xl bg-[#09090D] border border-zinc-800 overflow-hidden shadow-2xl">
          {/* Terminal Top Bar + Quick Command Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-[#111117] border-b border-zinc-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
              <TerminalIcon className="w-4 h-4 text-rose-500" />
              <span>piyush@nst-adypu:~/spider-portfolio</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => runCommand(cmd)}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-rose-600/20 text-zinc-300 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {cmd === 'clear' ? (
                    <span className="inline-flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      clear
                    </span>
                  ) : (
                    `$ ${cmd}`
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Output History */}
          <div
            data-testid="terminal-output"
            className="p-6 font-mono text-xs md:text-sm space-y-5 max-h-96 overflow-y-auto bg-[#07070A]"
          >
            {history.length === 0 ? (
              <p className="text-zinc-500">
                Terminal cleared. Type &quot;help&quot; or click a command button above to inspect Piyush Kori&apos;s portfolio.
              </p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-rose-500 font-semibold">piyush@nst-adypu:~$</span>
                    <span className="text-white font-semibold">{entry.command}</span>
                  </div>
                  <div
                    className={`pl-4 space-y-1 leading-relaxed ${
                      entry.isError ? 'text-rose-400' : 'text-zinc-300'
                    }`}
                  >
                    {entry.output.map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Terminal Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-6 py-3.5 bg-[#0C0C12] border-t border-zinc-800"
          >
            <label htmlFor="terminal-command-input" className="text-xs md:text-sm font-mono text-rose-500 font-semibold shrink-0">
              piyush@nst-adypu:~$
            </label>
            <input
              id="terminal-command-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command (help, skills, projects, opensource, git log, shoot)..."
              className="flex-1 bg-transparent text-xs md:text-sm font-mono text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Command</span>
            </button>
          </form>
        </div>
      </div>
    </RevealSection>
  );
};
