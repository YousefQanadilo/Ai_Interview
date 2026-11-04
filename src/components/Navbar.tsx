import React from 'react';
import { Brain, History, Sparkles, RefreshCw, Radio, Bot, MessageSquare } from 'lucide-react';
import { TargetRole } from '../types/interview';

interface NavbarProps {
  onNewSession: () => void;
  onOpenHistory: () => void;
  onOpenLiveVoice: () => void;
  onOpenChatbot: () => void;
  activeRole?: TargetRole;
  isSessionActive: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewSession,
  onOpenHistory,
  onOpenLiveVoice,
  onOpenChatbot,
  activeRole,
  isSessionActive,
  historyCount,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-3 sm:px-6 select-none shrink-0 z-40">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onNewSession}
          className="flex items-center space-x-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white flex items-center space-x-1.5">
              <span>MockInterview</span>
              <span className="text-cyan-400 font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 font-bold">
                ITSC 3155
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Oral Technical Screening Agent</div>
          </div>
        </button>

        {activeRole && isSessionActive && (
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target: {activeRole}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Live Voice API Button */}
        <button
          type="button"
          onClick={onOpenLiveVoice}
          className="px-2.5 sm:px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 hover:text-indigo-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          title="Open real-time voice conversation powered by gemini-3.8-live"
        >
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">Live Voice</span>
          <span className="text-[10px] bg-indigo-900/60 px-1 py-0.2 rounded text-indigo-300 font-mono">3.8 Live</span>
        </button>

        {/* Gemini Chatbot Button */}
        <button
          type="button"
          onClick={onOpenChatbot}
          className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          title="Open multi-turn Gemini chatbot with custom roles and model selection"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">AI Chatbot</span>
        </button>

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">History</span>
          {historyCount > 0 && (
            <span className="bg-slate-950 text-cyan-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {historyCount}
            </span>
          )}
        </button>

        {/* New Session Button */}
        <button
          type="button"
          onClick={onNewSession}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
        </button>
      </div>
    </header>
  );
};
