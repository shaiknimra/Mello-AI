import React from 'react';
import { Sparkles, Sun, Moon, Menu, User as UserIcon, LogOut } from 'lucide-react';
import type { User } from '../../types/auth';
import type { AgentDefinition } from '../../types/agent';
import { AgentSelector } from '../chat/AgentSelector';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  isBackendHealthy: boolean | null;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  agents: AgentDefinition[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  toggleTheme,
  toggleSidebar,
  isBackendHealthy,
  user,
  onOpenAuth,
  onLogout,
  agents,
  selectedAgentId,
  onSelectAgent,
}) => {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-mello-charcoal-800 bg-white/80 dark:bg-mello-charcoal-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 transition-colors">
      {/* Left: Mobile Menu + Brand + Agent Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 md:hidden transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-mello-purple-600 to-mello-purple-400 flex items-center justify-center text-white shadow-md shadow-mello-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
              Mello <span className="text-mello-purple-500">AI</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline -mt-0.5">
              Think. Ask. Discover.
            </span>
          </div>
        </div>

        {/* Dynamic Agent Selector */}
        <div className="ml-1 sm:ml-4">
          <AgentSelector
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        </div>
      </div>

      {/* Right: Actions, User Status, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Backend health status pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-200 dark:border-mello-charcoal-700 bg-gray-50 dark:bg-mello-charcoal-850 text-gray-600 dark:text-gray-300"
          title={
            isBackendHealthy === true
              ? 'FastAPI Backend Online'
              : isBackendHealthy === false
              ? 'FastAPI Backend Offline'
              : 'Checking Backend...'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy === true
                ? 'bg-emerald-500'
                : isBackendHealthy === false
                ? 'bg-red-500 animate-pulse'
                : 'bg-amber-400 animate-ping'
            }`}
          />
          <span>{isBackendHealthy === true ? 'Online' : 'Offline'}</span>
        </div>

        {/* User profile / Auth Button */}
        {user ? (
          <div className="flex items-center gap-2">
            {/* Daily usage pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-mello-purple-500/10 text-mello-purple-600 dark:text-mello-purple-300 border border-mello-purple-500/20"
              title="Daily remaining messages allowance"
            >
              <span>{user.remaining_messages}/50 left</span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mello-purple-600 hover:bg-mello-purple-500 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>
      </div>
    </header>
  );
};
