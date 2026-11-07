import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MessageBubble } from './components/chat/MessageBubble';
import { ChatInput } from './components/chat/ChatInput';
import { EmptyState } from './components/chat/EmptyState';
import type { ChatMessage, ChatSettings } from './types/chat';
import { sendChatMessage, checkBackendHealth } from './services/api';

export function App() {
  // Theme state: Dark mode is default
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('mello_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark mode
  });

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Backend connection status
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // Conversation state
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

  // Check backend health on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth()
      .then(() => {
        if (isMounted) setIsBackendHealthy(true);
      })
      .catch(() => {
        if (isMounted) setIsBackendHealthy(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleNewChat = () => {
    setConversationId('');
    setMessages([]);
    setInput('');
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
    setStatusText('Understanding your question...');

    try {
      setTimeout(() => {
        setStatusText('Preparing your response...');
      }, 700);

      const response = await sendChatMessage({
        message: trimmed,
        conversation_id: conversationId || undefined,
        agent_id: 'coordinator',
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
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isBackendHealthy={isBackendHealthy}
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
    </div>
  );
}

export default App;
