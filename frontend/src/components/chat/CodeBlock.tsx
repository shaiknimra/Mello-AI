import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard', err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-mello-charcoal-700 bg-gray-900 text-gray-100 font-mono text-sm shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 dark:bg-mello-charcoal-850 border-b border-gray-700/60 text-xs text-gray-400">
        <span className="font-semibold uppercase tracking-wider text-mello-purple-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-gray-300 hover:text-white hover:bg-gray-700/60 dark:hover:bg-mello-charcoal-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code>{value}</code>
      </div>
    </div>
  );
};
