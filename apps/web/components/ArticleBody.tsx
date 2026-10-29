import React, { type ReactNode } from 'react';

export type MarkdownBlock =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'paragraph' | 'quote' | 'code'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; rows: string[][] };

export function parseArticle(body: string): MarkdownBlock[] {
  const lines = body.replace(/\r/g, '').split('\n');
  const blocks: MarkdownBlock[] = [];
  let headingCount = 0;
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) { blocks.push({ type: 'heading', level: Math.max(2, heading[1].length), text: heading[2], id: 'section-' + (++headingCount) }); i++; continue; }
    if (line.startsWith('```')) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++; blocks.push({ type: 'code', text: code.join('\n') }); continue;
    }
    if (/^(?:[-*]\s+|\d+\.\s+)/.test(line)) {
      const ordered = /^\d+\./.test(line), items: string[] = [];
      while (i < lines.length && /^(?:[-*]\s+|\d+\.\s+)/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^(?:[-*]\s+|\d+\.\s+)/, ''));
      blocks.push({ type: 'list', ordered, items }); continue;
    }
    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|?[\s:|-]+\|?$/)) {
      const row = (text: string) => text.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
      const rows = [row(line)]; i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(row(lines[i++]));
      blocks.push({ type: 'table', rows }); continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(?:#{1,4}\s|```|[-*]\s|\d+\.\s)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    if (!paragraph.length) { i++; continue; }
    const text = paragraph.join(' ');
    blocks.push({ type: text.startsWith('> ') ? 'quote' : 'paragraph', text: text.replace(/^>\s?/, '') });
  }
  return blocks;
}

function safeHref(value: string): string | null {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
  if (/^tel:\+?\d{7,15}$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function inlineMarkdown(text: string): ReactNode[] {
  // Text goes through React; raw HTML and script URLs are never executed.
  const pattern = /(\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      return href ? <a key={index} href={href} rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}>{link[1]}</a> : <span key={index}>{link[1]}</span>;
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export function ArticleBody({ blocks }: { blocks: MarkdownBlock[] }) {
  return <>{blocks.map((block, index) => {
    if (block.type === 'heading') return block.level === 2 ? <h2 id={block.id} key={index}>{inlineMarkdown(block.text)}</h2> : block.level === 3 ? <h3 id={block.id} key={index}>{inlineMarkdown(block.text)}</h3> : <h4 id={block.id} key={index}>{inlineMarkdown(block.text)}</h4>;
    if (block.type === 'list') return block.ordered ? <ol key={index}>{block.items.map((item, n) => <li key={n}>{inlineMarkdown(item)}</li>)}</ol> : <ul key={index}>{block.items.map((item, n) => <li key={n}>{inlineMarkdown(item)}</li>)}</ul>;
    if (block.type === 'table') return <div className="article-table-wrap" key={index}><table><thead><tr>{block.rows[0].map((cell, n) => <th key={n}>{inlineMarkdown(cell)}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row, n) => <tr key={n}>{row.map((cell, c) => <td key={c}>{inlineMarkdown(cell)}</td>)}</tr>)}</tbody></table></div>;
    if (block.type === 'code') return <pre key={index}><code>{block.text}</code></pre>;
    if (block.type === 'quote') return <blockquote key={index}>{inlineMarkdown(block.text)}</blockquote>;
    return <p key={index}>{inlineMarkdown(block.text)}</p>;
  })}</>;
}
