'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2 text-foreground" {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className="text-xl font-bold mt-3 mb-2 text-foreground" {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className="text-lg font-bold mt-2 mb-1 text-foreground" {...props} />
          ),
          p: ({ className, ...props }) => (
            <p className="mb-2 leading-relaxed text-muted-foreground" {...props} />
          ),
          ul: ({ className, ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-muted-foreground" {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-muted-foreground" {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          strong: ({ className, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ className, ...props }) => (
            <em className="italic" {...props} />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground" {...props} />
          ),
          code: ({ className, children, ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
