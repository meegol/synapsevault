import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content = '', onWikilinkClick }) {
  if (!content) return null;

  // Transform [[Concept Name]] to clickable markdown links or styled buttons
  const transformedContent = content.replace(/\[\[(.*?)\]\]/g, (match, concept) => {
    return `[**${concept}**](#concept:${encodeURIComponent(concept)})`;
  });

  return (
    <div className="prose-vault text-xs leading-relaxed text-gruvbox-fg space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-gruvbox-fgLight mt-4 mb-2 pb-1 border-b border-gruvbox-bg1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-gruvbox-yellow mt-4 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-gruvbox-aqua mt-3.5 mb-1.5 uppercase tracking-wider" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs font-bold text-gruvbox-orange mt-2.5 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2.5 leading-relaxed text-gruvbox-fg" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gruvbox-fgLight" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gruvbox-yellow" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1.5 text-gruvbox-fg marker:text-gruvbox-yellow" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1.5 text-gruvbox-fg marker:text-gruvbox-aqua font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gruvbox-fg leading-relaxed pl-0.5" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-green font-mono text-[11px] border border-gruvbox-bg2/40" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 my-2 rounded-lg bg-gruvbox-bgHard font-mono text-[11px] text-gruvbox-green border border-gruvbox-bg1 overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="p-2.5 pl-3.5 my-2 border-l-2 border-gruvbox-yellow bg-gruvbox-bg/50 rounded-r text-gruvbox-fgDim italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full text-left text-xs border border-gruvbox-bg1 divide-y divide-gruvbox-bg1" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="p-2 bg-gruvbox-bg1/60 font-bold text-gruvbox-yellow border-b border-gruvbox-bg1" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2 border-b border-gruvbox-bg1/40 text-gruvbox-fg" {...props} />
          ),
          a: ({ node, href, children, ...props }) => {
            if (href && href.startsWith('#concept:')) {
              const conceptName = decodeURIComponent(href.replace('#concept:', ''));
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onWikilinkClick) onWikilinkClick(conceptName);
                  }}
                  className="inline-flex items-center px-1.5 py-0.2 rounded bg-gruvbox-bg1 hover:bg-gruvbox-yellow/20 text-gruvbox-yellow border border-gruvbox-yellow/30 font-medium text-[11px] transition-colors mx-0.5"
                >
                  [[{conceptName}]]
                </button>
              );
            }
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gruvbox-blue hover:underline font-medium inline-flex items-center gap-0.5" 
                {...props}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {transformedContent}
      </ReactMarkdown>
    </div>
  );
}
