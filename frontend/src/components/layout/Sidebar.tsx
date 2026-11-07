import React from 'react';
import {
  Plus,
  MessageSquare,
  Sliders,
  X,
  Bot,
} from 'lucide-react';
import type {
  Personality,
  ExplanationLevel,
  ResponseLength,
  ChatSettings,
} from '../../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  settings: ChatSettings;
  updateSettings: (newSettings: Partial<ChatSettings>) => void;
  activeConversationId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  settings,
  updateSettings,
  activeConversationId,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-gray-50 dark:bg-mello-charcoal-950 border-r border-gray-200 dark:border-mello-charcoal-800 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: New Chat + Close on Mobile */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-200 dark:border-mello-charcoal-800">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-mello-purple-600 hover:bg-mello-purple-500 text-white font-medium text-xs shadow-md shadow-mello-purple-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-mello-charcoal-800 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
            Conversations
          </div>

          <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeConversationId
                ? 'bg-mello-purple-500/10 text-mello-purple-600 dark:text-mello-purple-300 border border-mello-purple-500/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-mello-charcoal-850'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Current Conversation</span>
          </div>
        </div>

        {/* Bottom: Chat Preferences & Agent Status */}
        <div className="p-4 border-t border-gray-200 dark:border-mello-charcoal-800 space-y-3.5 bg-gray-100/50 dark:bg-mello-charcoal-900/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Sliders className="w-3.5 h-3.5 text-mello-purple-500" />
            <span>Response Preferences</span>
          </div>

          {/* Personality Selector */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Personality
            </label>
            <select
              value={settings.personality}
              onChange={(e) => updateSettings({ personality: e.target.value as Personality })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
            >
              <option value="Friendly">Friendly</option>
              <option value="Professional">Professional</option>
              <option value="Academic">Academic</option>
            </select>
          </div>

          {/* Explanation Level */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Explanation Level
            </label>
            <select
              value={settings.explanationLevel}
              onChange={(e) => updateSettings({ explanationLevel: e.target.value as ExplanationLevel })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Response Length */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Response Length
            </label>
            <select
              value={settings.responseLength}
              onChange={(e) => updateSettings({ responseLength: e.target.value as ResponseLength })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          {/* Active Agent indicator */}
          <div className="pt-2 border-t border-gray-200 dark:border-mello-charcoal-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-mello-purple-400" />
              <span>Coordinator</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium">
              Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
