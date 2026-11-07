import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MessageBubble } from './components/chat/MessageBubble';
import { ChatInput } from './components/chat/ChatInput';
import { EmptyState } from './components/chat/EmptyState';
import { AuthModal } from './components/auth/AuthModal';
import type { ChatMessage, ChatSettings } from './types/chat';
import type { User, ConversationSummary } from './types/auth';
import type { AgentDefinition } from './types/agent';
import {
  sendChatMessage,
  checkBackendHealth,
  getCurrentUser,
  listConversations,
  getConversation,
  deleteConversation,
  updateConversation,
  fetchAgents,
  removeStoredToken,
} from './services/api';

const AGENT_STATUS_MAP: Record<string, { start: string; mid: string }> = {
  coordinator: { start: 'Understanding your question...', mid: 'Preparing your response...' },
  coding: { start: 'Working with Coding Agent...', mid: 'Verifying code & complexity...' },
  research: { start: 'Searching & synthesizing information...', mid: 'Comparing reliable claims...' },
  learning: { start: 'Preparing conceptual explanation...', mid: 'Scaffolding steps & analogies...' },
  planning: { start: 'Structuring plan & milestones...', mid: 'Checking dependencies & risks...' },
  writing: { start: 'Refining prose & style...', mid: 'Polishing draft...' },
};

export function App() {
  // Theme state: Dark mode is default
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('mello_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark mode
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // User state
  const [user, setUser] = useState<User | null>(null);

  // Multi-Agent State
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('coordinator');

  // Conversations state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Preparing your response...');

  // User preferences
  const [settings, setSettings] = useState<ChatSettings>({
    personality: 'Friendly',
    explanationLevel: 'intermediate',
    responseLength: 'medium',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mello_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mello_theme', 'light');
    }
  }, [isDark]);

  // Check backend health, agents catalog, and authenticate on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth()
      .then(() => {
        if (isMounted) setIsBackendHealthy(true);
      })
      .catch(() => {
        if (isMounted) setIsBackendHealthy(false);
      });

    getCurrentUser().then((currentUser) => {
      if (isMounted && currentUser) {
        setUser(currentUser);
      }
    });

    fetchAgents().then((fetchedAgents) => {
      if (isMounted && fetchedAgents.length > 0) {
        setAgents(fetchedAgents);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch conversations whenever user logs in or out
  useEffect(() => {
    let ignore = false;
    if (user) {
      listConversations()
        .then((data) => {
          if (!ignore) setConversations(data);
        })
        .catch((err) => console.error('Failed to list conversations:', err));
    }
    return () => {
      ignore = true;
    };
  }, [user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setConversations([]);
    handleNewChat();
  };

  const handleNewChat = () => {
    setConversationId('');
    setMessages([]);
    setInput('');
  };

  const handleSelectConversation = async (id: string) => {
    if (id === conversationId) return;
    try {
      setIsLoading(true);
      const convDetail = await getConversation(id);
      setConversationId(convDetail.id);
      setMessages(
        convDetail.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agentId: m.agent_id,
          agentName: m.agent_name,
          timestamp: m.created_at,
          status: m.status || 'completed',
        }))
      );
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await updateConversation(id, { is_pinned: !currentPin });
      const updated = await listConversations();
      setConversations(updated);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = crypto.randomUUID();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    const statusConfig = AGENT_STATUS_MAP[selectedAgentId] || AGENT_STATUS_MAP['coordinator'];
    setStatusText(statusConfig.start);

    try {
      setTimeout(() => {
        setStatusText(statusConfig.mid);
      }, 700);

      const response = await sendChatMessage({
        message: trimmed,
        conversation_id: conversationId || undefined,
        agent_id: selectedAgentId,
        response_length: settings.responseLength,
        explanation_level: settings.explanationLevel,
        personality: settings.personality,
      });

      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: ChatMessage = {
        id: response.message_id || crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        agentId: response.agent_id,
        agentName: response.agent_name,
        timestamp: response.created_at || new Date().toISOString(),
        status: response.status === 'completed' ? 'completed' : 'error',
        error: response.error,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsBackendHealthy(true);

      // Refresh conversations list & user usage counts
      if (user) {
        listConversations().then(setConversations).catch(console.error);
        getCurrentUser().then(setUser).catch(console.error);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsBackendHealthy(false);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: err.message || 'Mello AI is temporarily unavailable.',
        agentName: 'Coordinator Agent',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: err.message || 'Cannot reach Mello AI backend.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-mello-charcoal-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        settings={settings}
        updateSettings={updateSettings}
        activeConversationId={conversationId}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isBackendHealthy={isBackendHealthy}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
        />

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 flex flex-col justify-start">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
          activeStatusText={statusText}
        />
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
        }}
      />
    </div>
  );
}

export default App;
