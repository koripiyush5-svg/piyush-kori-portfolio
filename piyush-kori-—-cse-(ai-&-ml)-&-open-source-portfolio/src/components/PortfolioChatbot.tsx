import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import {
  PortfolioChatMessage,
  PortfolioChatModel,
  generatePortfolioKnowledgeReply,
} from '../utils/spiderPhysics';
import { DomainSpiderSymbol } from './DomainSpiderSymbol';

const INITIAL_MESSAGES: PortfolioChatMessage[] = [
  {
    id: 'welcome-msg',
    role: 'model',
    text: "Hi! I'm Spider-Byte AI, Piyush Kori's portfolio assistant. Ask me anything about Piyush's B.Tech CSE (AI & ML) studies at Newton School of Technology (ADYPU), his 6 technical domains, his Pre-College Object Detection project, or his Hacktoberfest Hostel Management app!",
    timestamp: 'Online',
    modelUsed: 'gemini-3.8-flash',
  },
];

const SUGGESTED_PROMPTS = [
  'What projects has Piyush built?',
  'Tell me about the Hacktoberfest Hostel App',
  'What are his 6 technical domains?',
  'How can we collaborate on Open Source?',
];

export const PortfolioChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<PortfolioChatModel>('gemini-3.8-flash');
  const [messages, setMessages] = useState<PortfolioChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: PortfolioChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyForApi = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setNotice('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error) {
          setNotice(data.error);
        }
        const replyText = data?.fallbackReply || generatePortfolioKnowledgeReply(trimmed);
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: selectedModel,
          },
        ]);
        return;
      }

      const replyText = data?.reply || generatePortfolioKnowledgeReply(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data?.modelUsed || selectedModel,
        },
      ]);
    } catch {
      const fallback = generatePortfolioKnowledgeReply(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setNotice('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Multi-turn Chat Window */}
      {isOpen && (
        <div
          data-testid="portfolio-chatbot-panel"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[410px] rounded-2xl bg-[var(--theme-surface)] border border-rose-500/50 shadow-[0_0_36px_-6px_var(--theme-border-glow)] overflow-hidden flex flex-col"
          role="dialog"
          aria-label="Ask Spider-Byte AI about Piyush Kori"
        >
          {/* Chat Header */}
          <div className="px-4 py-3.5 bg-[#07070A] border-b border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-rose-500/40 flex items-center justify-center shrink-0">
                <DomainSpiderSymbol domainId="python" size={28} isAnimated={false} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white font-display">
                    Ask About Piyush Kori
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-mono text-rose-400">
                  Spider-Byte Gemini AI Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-testid="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat assistant"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Speed Selector Bar */}
          <div className="px-4 py-2 bg-[#09090E] border-b border-zinc-800/80 flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-zinc-400">Gemini Model:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                data-testid="chatbot-model-general"
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>General (3.8 Flash)</span>
              </button>
              <button
                type="button"
                data-testid="chatbot-model-fast"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Fast (3.1 Lite)</span>
              </button>
            </div>
          </div>

          {/* Scrollable Conversation Thread */}
          <div
            data-testid="chatbot-messages-thread"
            className="p-4 space-y-3.5 max-h-80 overflow-y-auto bg-[#060609]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                data-testid={`chat-message-${msg.role}`}
                className={`flex items-start gap-2.5 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    msg.role === 'user'
                      ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                      : 'bg-zinc-900 border-zinc-700 text-rose-400'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                <div
                  className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'bg-[#0E0E14] text-zinc-200 border border-zinc-800/90'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-[10px] font-mono ${
                      msg.role === 'user' ? 'opacity-80 justify-end' : 'text-zinc-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && msg.role === 'model' && (
                      <span>· {msg.modelUsed}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 pl-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Spider-Byte AI is thinking...</span>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {notice && (
            <div className="px-4 py-2 bg-rose-950/40 border-t border-rose-500/30 text-[11px] font-mono text-rose-300">
              {notice}
            </div>
          )}

          {/* Quick Starter Prompts */}
          <div className="px-3.5 py-2 bg-[#08080C] border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-[#0A0A0F] border-t border-zinc-800 flex items-center gap-2"
          >
            <label htmlFor="portfolio-chatbot-input" className="sr-only">
              Ask anything about Piyush Kori
            </label>
            <input
              id="portfolio-chatbot-input"
              data-testid="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Piyush Kori..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#050507] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              data-testid="chatbot-send-btn"
              disabled={isLoading || !input.trim()}
              aria-label="Send question"
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        data-testid="chatbot-launcher-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-[0_0_24px_-2px_var(--theme-border-glow)] border border-white/20 transition-all cursor-pointer whitespace-nowrap"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{isOpen ? 'Close Spider-Byte AI' : 'Ask AI About Piyush'}</span>
      </button>
    </div>
  );
};
