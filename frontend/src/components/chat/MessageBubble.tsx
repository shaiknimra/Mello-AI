import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Check, AlertCircle } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  return (
    <div
      className={`w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-white/60 dark:bg-mello-charcoal-850/50 border-y border-gray-100 dark:border-mello-charcoal-800/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-mello-charcoal-700 flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-mello-purple-600 to-mello-purple-400 flex items-center justify-center text-white shadow-md shadow-mello-purple-500/20">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {isUser ? 'You' : 'Mello'}
              </span>
              {!isUser && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-mello-purple-500/10 text-mello-purple-600 dark:text-mello-purple-400 border border-mello-purple-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {message.agentName || 'Coordinator Agent'}
                </span>
              )}
            </div>

            <span className="text-gray-400 dark:text-gray-500 text-[11px]">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Error notice if failed */}
          {message.status === 'error' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to complete response</p>
                <p className="mt-0.5 text-red-600 dark:text-red-300">{message.error || message.content}</p>
              </div>
            </div>
          )}

          {/* Message Text / Markdown */}
          {message.status !== 'error' && (
            <div className="prose prose-sm dark:prose-invert max-w-none font-chat leading-relaxed text-gray-800 dark:text-gray-200 break-words">
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-mello-charcoal-700 text-mello-purple-600 dark:text-mello-purple-300 font-mono text-[12.5px]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : undefined}
                          value={codeString}
                        />
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-mello-charcoal-700">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-mello-charcoal-700 text-xs">
                            {children}
                          </table>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Action Footer for Assistant Messages */}
          {!isUser && message.status === 'completed' && (
            <div className="flex items-center gap-2 pt-2 text-gray-400 dark:text-gray-500">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Thumbs Up Feedback */}
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 transition-colors ${
                  feedback === 'up'
                    ? 'text-mello-purple-500 dark:text-mello-purple-400'
                    : 'hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                title="Helpful response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down Feedback */}
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-mello-charcoal-800 transition-colors ${
                  feedback === 'down'
                    ? 'text-red-500 dark:text-red-400'
                    : 'hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                title="Unhelpful response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
