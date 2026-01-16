"use client";

import { useMemo } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import { MENTION_REGEX } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Component to render content with clickable @mentions within text
function MentionLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/${slug}`}
      className="text-orange-400 hover:text-orange-300 hover:underline transition-colors font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      @{slug}
    </Link>
  );
}

// Process text to handle @mentions - returns array of React elements
function processTextWithMentions(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  // Reset regex lastIndex to ensure fresh matching
  const regex = new RegExp(MENTION_REGEX.source, "g");
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    // Add the mention as a link
    result.push(<MentionLink key={`mention-${match.index}`} slug={match[1]} />);

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

// Custom paragraph component that handles @mentions
function ParagraphWithMentions({ children }: { children?: React.ReactNode }) {
  const processedChildren = useMemo(() => {
    if (!children) return null;

    // Process each child
    const childArray = Array.isArray(children) ? children : [children];
    return childArray.map((child, index) => {
      if (typeof child === "string") {
        const processed = processTextWithMentions(child);
        return processed.length === 1 ? processed[0] : <span key={index}>{processed}</span>;
      }
      return child;
    });
  }, [children]);

  return <p>{processedChildren}</p>;
}

// Custom text component that handles @mentions in any text node
function TextWithMentions({ children }: { children?: React.ReactNode }) {
  if (typeof children !== "string") return <>{children}</>;

  const processed = processTextWithMentions(children);
  return <>{processed}</>;
}

// Custom link component to handle external links
function CustomLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  const isExternal = href?.startsWith("http") || href?.startsWith("//");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-400 hover:text-orange-300 hover:underline transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href || "#"}
      className="text-orange-400 hover:text-orange-300 hover:underline transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-invert prose-zinc max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2 prose-blockquote:my-2 prose-hr:my-4 ${className}`}>
      <Markdown
        components={{
          // Handle paragraphs with mentions
          p: ParagraphWithMentions,
          // Handle links
          a: CustomLink,
          // Handle text in other elements (like list items, headings, etc.)
          li: ({ children }) => <li><TextWithMentions>{children}</TextWithMentions></li>,
          strong: ({ children }) => <strong><TextWithMentions>{children}</TextWithMentions></strong>,
          em: ({ children }) => <em><TextWithMentions>{children}</TextWithMentions></em>,
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-orange-300 text-sm" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} text-sm`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-zinc-900 border border-white/10 rounded-lg p-4 overflow-x-auto">
              {children}
            </pre>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-orange-500/50 pl-4 italic text-zinc-400">
              {children}
            </blockquote>
          ),
          // Style headings
          h1: ({ children }) => <h1 className="text-xl font-bold text-white"><TextWithMentions>{children}</TextWithMentions></h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-white"><TextWithMentions>{children}</TextWithMentions></h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-white"><TextWithMentions>{children}</TextWithMentions></h3>,
          // Style horizontal rules
          hr: () => <hr className="border-white/10" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
