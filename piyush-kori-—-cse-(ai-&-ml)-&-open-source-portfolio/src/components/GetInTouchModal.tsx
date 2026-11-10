import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  GitBranch,
  Briefcase,
} from 'lucide-react';
import {
  getDirectCommunicationLinks,
  buildContactFormSubmission,
} from '../utils/spiderPhysics';
import { DomainSpiderSymbol } from './DomainSpiderSymbol';

interface GetInTouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSubmitted?: (submission: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }) => void;
}

export const GetInTouchModal: React.FC<GetInTouchModalProps> = ({
  isOpen,
  onClose,
  onMessageSubmitted,
}) => {
  const links = getDirectCommunicationLinks();

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('Open Source Collaboration & PRs');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    mailtoHref: string;
    confirmationText: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = buildContactFormSubmission(
      {
        senderName,
        senderEmail,
        subject,
        message,
      },
      links.email
    );

    if (!validation.isValid) {
      setError(validation.error);
      setSubmittedResult(null);
      return;
    }

    setError(null);
    setSubmittedResult({
      mailtoHref: validation.mailtoHref,
      confirmationText: validation.confirmationText,
    });

    if (onMessageSubmitted) {
      onMessageSubmitted({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
    }

    setSenderName('');
    setSenderEmail('');
    setMessage('');
  };

  return (
    <div
      data-testid="get-in-touch-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="get-in-touch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0A0A0F] border border-zinc-800 shadow-[0_0_50px_-10px_rgba(225,29,72,0.4)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#12070B] via-[#0D0D14] to-[#0A0A0F] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-600/15 border border-rose-500/40 flex items-center justify-center shrink-0">
              <DomainSpiderSymbol domainId="github" size={34} />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 block">
                Direct Developer Communication
              </span>
              <h2
                id="get-in-touch-modal-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Get in Touch with Piyush Kori
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-get-in-touch-modal"
            onClick={onClose}
            aria-label="Close Get in Touch modal"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Profile Links: LinkedIn & GitHub */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>QUICK PROFILE LINKS</span>
              <span className="text-rose-400"> Newton School of Technology, ADYPU</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* LinkedIn Quick Link */}
              <a
                href={links.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contact-modal-linkedin-link"
                className="group p-4 rounded-xl bg-[#060609] hover:bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/60 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                      LinkedIn Profile
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 truncate">
                      {links.linkedinHandle}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 shrink-0 transition-colors" />
              </a>

              {/* GitHub Quick Link */}
              <a
                href={links.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contact-modal-github-link"
                className="group p-4 rounded-xl bg-[#060609] hover:bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/60 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                      GitHub Profile
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 truncate">
                      {links.githubHandle}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 shrink-0 transition-colors" />
              </a>
            </div>

            {/* Direct Email Bar with Copy Button */}
            <div className="p-3.5 rounded-xl bg-[#060609] border border-zinc-800/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-zinc-400">Direct Email:</span>
                <a
                  href={`mailto:${links.email}`}
                  className="font-mono text-white hover:text-rose-400 underline underline-offset-4"
                >
                  {links.email}
                </a>
              </div>
              <button
                type="button"
                data-testid="contact-modal-copy-email"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-rose-400" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Email Contact Form */}
          <form
            data-testid="get-in-touch-form"
            onSubmit={handleSubmit}
            className="space-y-4 pt-2 border-t border-zinc-800/80"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Send an Email Message</h3>
              <span className="text-[11px] font-mono text-zinc-400">
                Replies to your inbox
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-modal-name"
                  className="block text-xs font-mono text-zinc-300"
                >
                  Your Name
                </label>
                <input
                  id="contact-modal-name"
                  data-testid="contact-modal-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-modal-email"
                  className="block text-xs font-mono text-zinc-300"
                >
                  Your Email Address
                </label>
                <input
                  id="contact-modal-email"
                  data-testid="contact-modal-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-modal-subject"
                className="block text-xs font-mono text-zinc-300"
              >
                Topic / Subject
              </label>
              <select
                id="contact-modal-subject"
                data-testid="contact-modal-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Open Source Collaboration & PRs">
                  Open Source Collaboration &amp; PRs
                </option>
                <option value="AI/ML & Computer Vision Project">
                  AI/ML &amp; Computer Vision Project
                </option>
                <option value="Hackathon / Team Sprint Invite">
                  Hackathon / Team Sprint Invite
                </option>
                <option value="Internship or General Inquiry">
                  Internship or General Inquiry
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-modal-message"
                className="block text-xs font-mono text-zinc-300"
              >
                Message
              </label>
              <textarea
                id="contact-modal-message"
                data-testid="contact-modal-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message for Piyush Kori..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {error && (
              <div
                data-testid="contact-modal-error"
                className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 px-3.5 py-2.5 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submittedResult && (
              <div
                data-testid="contact-modal-success"
                className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{submittedResult.confirmationText}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-zinc-300">
                    Your message is logged on the portfolio board and ready for direct email dispatch:
                  </span>
                  <a
                    href={submittedResult.mailtoHref}
                    data-testid="contact-modal-mailto-dispatch"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Launch Email Client</span>
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                data-testid="contact-modal-submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-[0_0_20px_-4px_rgba(225,29,72,0.65)] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
