import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  activeStatusText?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  activeStatusText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to text height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* High-level status indicator (if active) */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-2 px-2 text-xs text-mello-purple-600 dark:text-mello-purple-400 animate-pulse font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{activeStatusText || 'Preparing your response...'}</span>
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-white dark:bg-mello-charcoal-850 border border-gray-200 dark:border-mello-charcoal-700 shadow-lg focus-within:border-mello-purple-500 dark:focus-within:border-mello-purple-500 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mello anything... (Shift + Enter for new line)"
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-[200px] py-2 px-3 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none font-chat leading-relaxed"
        />

        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-mello-purple-600 hover:bg-mello-purple-500 disabled:opacity-40 disabled:hover:bg-mello-purple-600 text-white shadow-md shadow-mello-purple-600/30 transition-all duration-150"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500 select-none">
        Mello can make mistakes. Consider verifying important facts. &nbsp;·&nbsp; <span className="text-mello-purple-500 dark:text-mello-purple-400 font-medium">by NIRA</span>
      </p>
    </div>
  );
};
