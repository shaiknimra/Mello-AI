import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sliders,
  X,
  Bot,
  Trash2,
  Pin,
  Search,
} from 'lucide-react';
import type {
  Personality,
  ExplanationLevel,
  ResponseLength,
  ChatSettings,
} from '../../types/chat';
import type { ConversationSummary } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  settings: ChatSettings;
  updateSettings: (newSettings: Partial<ChatSettings>) => void;
  activeConversationId: string;
  conversations: ConversationSummary[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  settings,
  updateSettings,
  activeConversationId,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.is_pinned);
  const unpinned = filtered.filter((c) => !c.is_pinned);

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
        <div className="p-3.5 flex items-center gap-2 border-b border-gray-200 dark:border-mello-charcoal-800">
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

        {/* Search Conversations */}
        <div className="px-3 pt-3">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full text-[11px] pl-8 pr-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-mello-charcoal-800 bg-white dark:bg-mello-charcoal-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-mello-purple-500"
            />
          </div>
        </div>

        {/* Middle: Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Pinned section */}
          {pinned.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-mello-purple-500 uppercase flex items-center gap-1">
                <Pin className="w-3 h-3 rotate-45" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinned.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-mello-purple-500/15 text-mello-purple-600 dark:text-mello-purple-300 border border-mello-purple-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-mello-charcoal-850'
                    }`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-mello-purple-400" />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conv.id, true);
                        }}
                        className="p-1 rounded hover:text-amber-500"
                        title="Unpin chat"
                      >
                        <Pin className="w-3 h-3 fill-current rotate-45" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="p-1 rounded hover:text-red-500"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              Recent Chats
            </div>
            <div className="space-y-0.5">
              {unpinned.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? 'bg-mello-purple-500/15 text-mello-purple-600 dark:text-mello-purple-300 border border-mello-purple-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-mello-charcoal-850'
                  }`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(conv.id, false);
                      }}
                      className="p-1 rounded hover:text-mello-purple-400"
                      title="Pin chat"
                    >
                      <Pin className="w-3 h-3 rotate-45" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded hover:text-red-500"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                  No conversations yet. Start a new chat!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Chat Preferences & Agent Status */}
        <div className="p-3.5 border-t border-gray-200 dark:border-mello-charcoal-800 space-y-3 bg-gray-100/50 dark:bg-mello-charcoal-900/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Sliders className="w-3.5 h-3.5 text-mello-purple-500" />
            <span>Response Preferences</span>
          </div>

          {/* Personality Selector */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Personality
            </label>
            <select
              value={settings.personality}
              onChange={(e) => updateSettings({ personality: e.target.value as Personality })}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
            >
              <option value="Friendly">Friendly</option>
              <option value="Professional">Professional</option>
              <option value="Academic">Academic</option>
            </select>
          </div>

          {/* Explanation Level */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Explanation Level
            </label>
            <select
              value={settings.explanationLevel}
              onChange={(e) => updateSettings({ explanationLevel: e.target.value as ExplanationLevel })}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Response Length */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Response Length
            </label>
            <select
              value={settings.responseLength}
              onChange={(e) => updateSettings({ responseLength: e.target.value as ResponseLength })}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-mello-charcoal-700 bg-white dark:bg-mello-charcoal-850 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mello-purple-500"
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
