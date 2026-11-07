import React from 'react';
import { Sparkles, Shield, Cpu, BookOpen } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto select-none">
      {/* Cute Abstract AI Logo */}
      <div className="relative mb-6 group">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-mello-purple-600 via-mello-purple-500 to-mello-purple-400 p-0.5 shadow-xl shadow-mello-purple-500/20 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full bg-white dark:bg-mello-charcoal-900 rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-mello-purple-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Brand & Tagline */}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
        Mello AI
      </h1>
      <p className="text-base font-medium text-mello-purple-600 dark:text-mello-purple-400 mb-4">
        Think. Ask. Discover.
      </p>

      {/* Introductory description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mb-8">
        Welcome to your multi-agent AI assistant. Ask any question to get clear,
        well-structured answers with code explanations, research, and learning guidance.
      </p>

      {/* Core Capabilities highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-mello-charcoal-800 bg-white dark:bg-mello-charcoal-850/60 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-mello-purple-500 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Multi-Agent</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            Coordinated specialist agents for coding, research, planning, and writing.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-mello-charcoal-800 bg-white dark:bg-mello-charcoal-850/60 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-mello-purple-500 font-semibold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Personalized</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            Tailor explanations from beginner to advanced across 3 persona styles.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-mello-charcoal-800 bg-white dark:bg-mello-charcoal-850/60 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-mello-purple-500 font-semibold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Trust & Truth</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            Transparent responses with zero hallucinated citations and verified actions.
          </p>
        </div>
      </div>
    </div>
  );
};
