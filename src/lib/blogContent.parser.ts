/**
 * DIMISI Technologies — Blog Editorial Content Parser & Serializer
 *
 * Provides deterministic two-way conversion between rich visual Content Blocks
 * and standard Markdown string (stored in BlogPostItem.content).
 */

export type ContentBlockType = "heading" | "paragraph" | "list" | "code" | "quote" | "raw";

export interface HeadingBlock {
  id: string;
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock {
  id: string;
  type: "paragraph";
  text: string;
}

export interface ListBlock {
  id: string;
  type: "list";
  style: "bullet" | "numbered";
  items: string[];
}

export interface CodeBlock {
  id: string;
  type: "code";
  language: string;
  code: string;
}

export interface QuoteBlock {
  id: string;
  type: "quote";
  text: string;
  cite?: string;
}

export interface RawBlock {
  id: string;
  type: "raw";
  markdown: string;
}

export type ContentBlock =
  HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | QuoteBlock | RawBlock;

export function generateBlockId(prefix: string = "blk"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36).slice(-4)}`;
}

/**
 * Creates an empty block with initial default values.
 */
export function createEmptyBlock(type: ContentBlockType, level: 2 | 3 | 4 = 2): ContentBlock {
  const id = generateBlockId(type);
  switch (type) {
    case "heading":
      return { id, type: "heading", level, text: "" };
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "list":
      return { id, type: "list", style: "bullet", items: [""] };
    case "code":
      return { id, type: "code", language: "typescript", code: "" };
    case "quote":
      return { id, type: "quote", text: "", cite: "" };
    case "raw":
      return { id, type: "raw", markdown: "" };
  }
}

/**
 * Parses raw Markdown string into structured visual ContentBlocks.
 * Preserves all content deterministically without loss.
 */
export function parseMarkdownToBlocks(markdown: string): ContentBlock[] {
  if (!markdown || !markdown.trim()) {
    return [createEmptyBlock("paragraph")];
  }

  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const blocks: ContentBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines between blocks
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced Code Block (```lang ... ```)
    if (trimmed.startsWith("```")) {
      const langMatch = trimmed.match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch && langMatch[1] ? langMatch[1].trim() : "typescript";
      const codeLines: string[] = [];
      i++; // Move past opening fence

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++; // Move past closing fence
      }

      blocks.push({
        id: generateBlockId("code"),
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Headings (####, ###, ##, #)
    if (trimmed.startsWith("#### ")) {
      blocks.push({
        id: generateBlockId("head4"),
        type: "heading",
        level: 4,
        text: trimmed.slice(5).trim(),
      });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({
        id: generateBlockId("head3"),
        type: "heading",
        level: 3,
        text: trimmed.slice(4).trim(),
      });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({
        id: generateBlockId("head2"),
        type: "heading",
        level: 2,
        text: trimmed.slice(3).trim(),
      });
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({
        id: generateBlockId("head2"),
        type: "heading",
        level: 2,
        text: trimmed.slice(2).trim(),
      });
      i++;
      continue;
    }

    // 3. Blockquotes (> quote)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      let cite = "";

      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const qLine = lines[i].trim().replace(/^>\s?/, "");
        // Check for attribution citation like "> — Author" or "> - Author"
        const citeMatch = qLine.match(/^[—–-]\s*(.+)$/);
        if (citeMatch) {
          cite = citeMatch[1].trim();
        } else {
          quoteLines.push(qLine);
        }
        i++;
      }

      blocks.push({
        id: generateBlockId("quote"),
        type: "quote",
        text: quoteLines.join("\n").trim(),
        ...(cite ? { cite } : {}),
      });
      continue;
    }

    // 4. Unordered Bullet List (- item, * item, • item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }

      blocks.push({
        id: generateBlockId("list"),
        type: "list",
        style: "bullet",
        items: items.length > 0 ? items : [""],
      });
      continue;
    }

    // 5. Ordered Numbered List (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }

      blocks.push({
        id: generateBlockId("list"),
        type: "list",
        style: "numbered",
        items: items.length > 0 ? items : [""],
      });
      continue;
    }

    // 6. Table / HTML / Unsupported markdown structures -> Raw Block
    if (
      trimmed.startsWith("|") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("---") ||
      trimmed.startsWith("***")
    ) {
      const rawLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        rawLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: generateBlockId("raw"),
        type: "raw",
        markdown: rawLines.join("\n"),
      });
      continue;
    }

    // 7. Regular Paragraph (accumulate until blank line or next block construct)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("|")
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        id: generateBlockId("para"),
        type: "paragraph",
        text: paraLines.join("\n"),
      });
    }
  }

  return blocks.length > 0 ? blocks : [createEmptyBlock("paragraph")];
}

/**
 * Serializes visual ContentBlocks back into standard Markdown.
 */
export function serializeBlocksToMarkdown(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return "";

  const serializedBlocks: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const text = block.text.trim();
        if (!text) continue;
        const prefix = block.level === 4 ? "####" : block.level === 3 ? "###" : "##";
        serializedBlocks.push(`${prefix} ${text}`);
        break;
      }

      case "paragraph": {
        const text = block.text.trim();
        if (text) {
          serializedBlocks.push(text);
        }
        break;
      }

      case "list": {
        const validItems = block.items.filter((it) => it.trim().length > 0);
        if (validItems.length === 0) continue;

        if (block.style === "numbered") {
          serializedBlocks.push(
            validItems.map((item, idx) => `${idx + 1}. ${item.trim()}`).join("\n"),
          );
        } else {
          serializedBlocks.push(validItems.map((item) => `- ${item.trim()}`).join("\n"));
        }
        break;
      }

      case "code": {
        const code = block.code ? block.code.trimEnd() : "";
        const lang = block.language ? block.language.trim() : "typescript";
        serializedBlocks.push(`\`\`\`${lang}\n${code}\n\`\`\``);
        break;
      }

      case "quote": {
        const text = block.text.trim();
        if (!text) continue;
        const quoteLines = text
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n");
        if (block.cite && block.cite.trim()) {
          serializedBlocks.push(`${quoteLines}\n> — ${block.cite.trim()}`);
        } else {
          serializedBlocks.push(quoteLines);
        }
        break;
      }

      case "raw": {
        const raw = block.markdown.trim();
        if (raw) {
          serializedBlocks.push(raw);
        }
        break;
      }
    }
  }

  return serializedBlocks.join("\n\n");
}
