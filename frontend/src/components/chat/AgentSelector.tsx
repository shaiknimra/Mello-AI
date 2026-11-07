import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Cpu,
  Search,
  GraduationCap,
  Code,
  CheckSquare,
  PenTool,
  Check,
} from 'lucide-react';
import type { AgentDefinition } from '../../types/agent';

interface AgentSelectorProps {
  agents: AgentDefinition[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-3.5 h-3.5" />,
  Search: <Search className="w-3.5 h-3.5" />,
  GraduationCap: <GraduationCap className="w-3.5 h-3.5" />,
  Code: <Code className="w-3.5 h-3.5" />,
  CheckSquare: <CheckSquare className="w-3.5 h-3.5" />,
  PenTool: <PenTool className="w-3.5 h-3.5" />,
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || {
    id: 'coordinator',
    name: 'Coordinator Agent',
    title: 'Chief Orchestrator',
    icon: 'Cpu',
    description: 'Direct answers & multi-agent routing.',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-mello-charcoal-700 bg-gray-50/80 dark:bg-mello-charcoal-850 hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 text-gray-800 dark:text-gray-200 text-xs font-medium transition-colors shadow-xs"
        title="Switch active specialist agent"
      >
        <span className="text-mello-purple-500">
          {ICON_MAP[activeAgent.icon] || <Cpu className="w-3.5 h-3.5" />}
        </span>
        <span className="font-semibold">{activeAgent.name}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-mello-charcoal-900 border border-gray-200 dark:border-mello-charcoal-700 shadow-2xl p-2 z-50 text-left">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-mello-charcoal-800 mb-1">
            Specialist Agents
          </div>

          <div className="space-y-1">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-mello-purple-500/15 text-mello-purple-600 dark:text-mello-purple-300 border border-mello-purple-500/25'
                      : 'hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-mello-charcoal-800 text-mello-purple-500">
                    {ICON_MAP[agent.icon] || <Cpu className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{agent.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-mello-purple-500" />}
                    </div>
                    <p className="text-[10px] text-mello-purple-600 dark:text-mello-purple-400 font-medium -mt-0.5">
                      {agent.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
