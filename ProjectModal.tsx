import React, { useEffect, useState } from 'react';
import { X, Terminal, GitPullRequest, Eye, Sliders, CheckCircle2 } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.70);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'person' | 'vehicle' | 'gadget'>('all');
  const [selectedPrIndex, setSelectedPrIndex] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
    setConfidenceThreshold(0.70);
    setSelectedCategory('all');
    setSelectedPrIndex(0);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const filteredDetections = (project.detectionBoxes || []).filter((box) => {
    const passesConfidence = box.confidence >= confidenceThreshold;
    const passesCategory = selectedCategory === 'all' || box.category === selectedCategory;
    return passesConfidence && passesCategory;
  });

  const activePr = project.hacktoberfestPRs?.[selectedPrIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0C0C10] border border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 bg-[#09090D]">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="text-rose-500 font-semibold">PROJECT {project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.timeline}</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-200">{project.status}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details modal"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-rose-500 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Close (ESC)</span>
          </button>
        </div>

        {/* Main Modal Body */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto space-y-8">
          <div>
            <h2
              id="project-modal-title"
              className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            >
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {project.role} <span aria-hidden="true">·</span> {project.teamContext}
            </p>
          </div>

          {/* Interactive Project Sandbox / Media Viewport */}
          {project.id === 'object-detection' ? (
            <div className="space-y-4">
              {/* Interactive Vision Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#121218] border border-zinc-800">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-rose-500 shrink-0" />
                  <label htmlFor="confidence-slider" className="text-xs font-medium text-zinc-300">
                    Confidence Threshold:{' '}
                    <span className="font-mono text-rose-400 font-semibold">
                      {(confidenceThreshold * 100).toFixed(0)}%
                    </span>
                  </label>
                  <input
                    id="confidence-slider"
                    type="range"
                    min="0.55"
                    max="0.95"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold( parseFloat(e.target.value) )}
                    className="w-32 accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Category Filter Buttons */}
                <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                  {(['all', 'person', 'vehicle', 'gadget'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-rose-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Classes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-zinc-300">
                  Active Detections: <span className="text-rose-400 font-semibold">{filteredDetections.length}</span>
                </div>
              </div>

              {/* Interactive Object Detection Frame */}
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video">
                {!imgError ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-rose-950/30 to-zinc-900 p-8 text-center">
                    <p className="text-sm font-mono text-rose-300">{project.title} — Vision Feed</p>
                  </div>
                )}

                {/* Dynamic Bounding Boxes Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredDetections.map((box) => (
                    <div
                      key={box.id}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                      }}
                      className="absolute border-2 border-rose-500 bg-rose-500/10 transition-all duration-150"
                    >
                      <div className="absolute -top-5 left-0 bg-rose-600/95 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-t whitespace-nowrap shadow-sm">
                        {box.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hacktoberfest Spider-Man App Visual + Interactive PR Switcher */}
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video">
                {!imgError ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-rose-950/30 to-zinc-900 p-8 text-center">
                    <p className="text-sm font-mono text-rose-300">{project.title}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-xs font-mono text-zinc-200">
                    LIVE DEPLOYMENT · HACKTOBERFEST TEAM BUILD · HOSTEL MANAGEMENT SYSTEM
                  </div>
                </div>
              </div>

              {project.hacktoberfestPRs && (
                <div className="p-5 rounded-xl bg-[#121218] border border-zinc-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <GitPullRequest className="w-4 h-4 text-rose-500" />
                      <span>Hacktoberfest Pull Request & Deployment Log</span>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                      {project.hacktoberfestPRs.map((pr, idx) => (
                        <button
                          key={pr.prNumber}
                          type="button"
                          onClick={() => setSelectedPrIndex(idx)}
                          className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            selectedPrIndex === idx
                              ? 'bg-rose-600 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {pr.prNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activePr && (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span>Branch: <strong className="text-rose-400">{activePr.branch}</strong></span>
                        <span>Contributor: {activePr.author}</span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-100">{activePr.title}</p>
                      <p className="text-xs text-zinc-400">{activePr.impact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Project Narrative & Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Overview & Engineering Context</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.summary}</p>
              <div className="pt-2">
                <h4 className="text-xs font-mono text-zinc-400 mb-2">Tech Stack Utilized</h4>
                <p className="text-xs text-rose-400 font-mono">
                  {project.techStack.join(' · ')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Key Implementation Highlights</h3>
              <ul className="space-y-2.5">
                {project.architectureDetails.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code / CLI Preview */}
          <div className="rounded-xl bg-[#08080B] border border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
              <Terminal className="w-3.5 h-3.5 text-rose-500" />
              <span>Implementation Snippet</span>
            </div>
            <pre className="text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
              <code>{project.codePreview}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
