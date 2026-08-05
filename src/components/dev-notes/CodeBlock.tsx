"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ children, language = 'text', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Map common language aliases
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
  };

  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border/50">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Terminal dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {/* Filename or language */}
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            {filename || normalizedLanguage}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'hsl(var(--card))',
          fontSize: '0.875rem',
          lineHeight: 1.6,
        }}
        showLineNumbers={children.split('\n').length > 3}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'hsl(var(--muted-foreground))',
          opacity: 0.5,
        }}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

// Inline code component for single-line code
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-sm">
      {children}
    </code>
  );
}
