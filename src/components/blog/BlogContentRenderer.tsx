import { useState, useMemo, type ReactNode } from "react";
import { CheckCircle2, Copy, Check, Quote as QuoteIcon } from "lucide-react";
import {
  parseMarkdownToBlocks,
  type ContentBlock,
  type HeadingBlock,
  type ParagraphBlock,
  type ListBlock,
  type CodeBlock,
  type QuoteBlock,
  type RawBlock,
} from "@/lib/blogContent.parser";
import styles from "./BlogContentRenderer.module.css";

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Safely renders inline markdown tokens: **bold**, *italic*, `code`, and [link](url).
 */
function renderInlineMarkdown(text: string): ReactNode {
  if (!text) return null;

  // Split by inline code, links, bold, italic
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold (**text**)
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // Italic (*text*)
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    // Inline code (`code`)
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={index} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }

    // Links ([text](url))
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const rawHref = linkMatch[2].trim();
      const isSafe = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(rawHref);
      const href = isSafe ? rawHref : "#";
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      return (
        <a
          key={index}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={styles.inlineLink}
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

function CodeBlockRenderer({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!block.code) return;
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.codeCard}>
      <div className={styles.codeHeader}>
        <div className={styles.codeControls}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
          <span className={styles.codeLang}>{block.language || "code"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={[styles.copyCodeBtn, copied ? styles.copyCodeBtnSuccess : ""].join(" ")}
          title="Copy code to clipboard"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className={styles.codePre}>
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

export function BlogContentRenderer({ content, className = "" }: BlogContentRendererProps) {
  const blocks = useMemo(() => parseMarkdownToBlocks(content), [content]);

  return (
    <div className={[styles.contentRenderer, className].join(" ")}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading": {
            const h = block as HeadingBlock;
            if (h.level === 4) {
              return (
                <h4 key={h.id} className={styles.h4}>
                  {renderInlineMarkdown(h.text)}
                </h4>
              );
            }
            if (h.level === 3) {
              return (
                <h3 key={h.id} className={styles.h3}>
                  {renderInlineMarkdown(h.text)}
                </h3>
              );
            }
            return (
              <h2 key={h.id} className={styles.h2}>
                {renderInlineMarkdown(h.text)}
              </h2>
            );
          }

          case "paragraph": {
            const p = block as ParagraphBlock;
            return (
              <p key={p.id} className={styles.paragraph}>
                {renderInlineMarkdown(p.text)}
              </p>
            );
          }

          case "list": {
            const l = block as ListBlock;
            if (l.style === "numbered") {
              return (
                <ol key={l.id} className={styles.numberedList}>
                  {l.items.map((item, idx) => (
                    <li key={idx} className={styles.numberedItem}>
                      <span className={styles.numberBadge}>{String(idx + 1).padStart(2, "0")}</span>
                      <span>{renderInlineMarkdown(item)}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={l.id} className={styles.bulletList}>
                {l.items.map((item, idx) => (
                  <li key={idx} className={styles.bulletItem}>
                    <span className={styles.bulletIcon}>
                      <CheckCircle2 size={15} />
                    </span>
                    <span>{renderInlineMarkdown(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case "code": {
            return <CodeBlockRenderer key={block.id} block={block as CodeBlock} />;
          }

          case "quote": {
            const q = block as QuoteBlock;
            return (
              <blockquote key={q.id} className={styles.blockquote}>
                <div className={styles.quoteIconBox}>
                  <QuoteIcon size={20} />
                </div>
                <div className={styles.quoteBody}>
                  <p className={styles.quoteText}>{renderInlineMarkdown(q.text)}</p>
                  {q.cite && <cite className={styles.quoteCite}>— {q.cite}</cite>}
                </div>
              </blockquote>
            );
          }

          case "raw": {
            const r = block as RawBlock;
            return (
              <div key={r.id} className={styles.rawContainer}>
                <p className={styles.paragraph}>{r.markdown}</p>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
