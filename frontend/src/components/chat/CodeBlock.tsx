import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  language?: string;
  value: string;
}

/** Map common aliases → highlight.js registered language names */
const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  cs: 'csharp',
  'c++': 'cpp',
};

function resolveLanguage(lang?: string): string | null {
  if (!lang) return null;
  const lower = lang.toLowerCase();
  const resolved = LANG_ALIASES[lower] || lower;
  try {
    hljs.getLanguage(resolved);
    return resolved;
  } catch {
    return null;
  }
}

/** Friendly display label */
function displayLabel(lang?: string): string {
  if (!lang) return 'Code';
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const resolvedLang = resolveLanguage(language);

  // Run highlight.js once the component mounts / value changes
  useEffect(() => {
    if (codeRef.current) {
      // Reset to plain text first so hljs doesn't double-highlight
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.textContent = value;

      if (resolvedLang) {
        try {
          const result = hljs.highlight(value, { language: resolvedLang, ignoreIllegals: true });
          codeRef.current.innerHTML = result.value;
        } catch {
          // Fall back to auto-detect
          hljs.highlightElement(codeRef.current);
        }
      } else {
        // Let hljs auto-detect
        hljs.highlightElement(codeRef.current);
      }
    }
  }, [value, resolvedLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden shadow-lg" style={{ background: '#1e1e1e' }}>
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: '#2d2d2d', borderColor: '#3e3e3e' }}
      >
        {/* Language label with icon */}
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" style={{ color: '#858585' }} />
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: '#cccccc' }}
          >
            {displayLabel(language)}
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
          style={{
            color: copied ? '#4ade80' : '#ababab',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!copied) (e.currentTarget as HTMLButtonElement).style.background = '#3a3a3a';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* ── Code area ── */}
      <div
        className="overflow-x-auto"
        style={{ padding: '20px 24px' }}
      >
        <pre style={{ margin: 0, padding: 0, background: 'transparent' }}>
          <code
            ref={codeRef}
            className={resolvedLang ? `language-${resolvedLang}` : ''}
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: '13px',
              lineHeight: '1.75',
              color: '#d4d4d4',
              background: 'transparent',
              tabSize: 2,
              whiteSpace: 'pre',
              display: 'block',
            }}
          />
        </pre>
      </div>
    </div>
  );
};

