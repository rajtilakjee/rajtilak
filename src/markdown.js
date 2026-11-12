import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import latex from 'highlight.js/lib/languages/latex';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';

for (const [name, language] of [
  ['python', python],
  ['javascript', javascript],
  ['typescript', typescript],
  ['bash', bash],
  ['json', json],
  ['latex', latex],
  ['xml', xml],
  ['css', css],
  ['c', c],
  ['cpp', cpp],
  ['rust', rust],
  ['sql', sql],
]) {
  hljs.registerLanguage(name, language);
}

const CALLOUTS = {
  note: 'Note',
  theorem: 'Theorem',
  definition: 'Definition',
  example: 'Example',
  warning: 'Watch out',
};

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

md.core.ruler.before('inline', 'admonitions', applyAdmonitions);

const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || '';
  if (/^https?:\/\//i.test(href)) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('loading', 'lazy');
  if (defaultImage) return defaultImage(tokens, idx, options, env, self);
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.heading_open = (tokens, idx, options, env) => {
  const level = Number(tokens[idx].tag.slice(1));
  const plain = inlinePlain(tokens[idx + 1]);
  const id = uniqueSlug(plain, env);
  env.toc ??= [];
  if (level === 2 || level === 3) env.toc.push({ id, level, text: plain });
  return `<h${level} id="${id}">`;
};

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const info = (token.info || '').trim().split(/\s+/)[0] || '';
  const raw = token.content.replace(/\n$/, '');
  const code = highlight(raw, info);
  const label = info ? `<span class="code-lang">${escapeHtml(info)}</span>` : '';
  return `<div class="codeblock">${label}<pre><code class="hljs${info ? ` language-${escapeHtml(info)}` : ''}">${code}</code></pre></div>\n`;
};

md.renderer.rules.callout_open = (tokens, idx) => {
  const token = tokens[idx];
  const label = escapeHtml(token.meta?.label || 'Note');
  const cls = token.attrGet('class') || 'callout';
  return `<aside class="${cls}">\n<p class="callout-label">${label}</p>\n`;
};

md.renderer.rules.callout_close = () => '</aside>\n';

const cache = new Map();

export function renderMarkdown(source) {
  const key = String(source);
  if (cache.has(key)) return cache.get(key);
  const normalized = key.replace(/\r\n?/g, '\n');
  const { text, blocks, nonce } = shield(normalized);
  const env = { toc: [] };
  let html = md.render(text, env);
  html = restoreHtml(html, blocks, nonce);
  const toc = env.toc.map((item) => ({
    id: item.id,
    level: item.level,
    text: restoreText(item.text, blocks, nonce),
  }));
  const result = { html, toc };
  cache.set(key, result);
  return result;
}

function applyAdmonitions(state) {
  const tokens = state.tokens;
  const ranges = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'blockquote_open') continue;
    let close = i + 1;
    while (close < tokens.length && tokens[close].type !== 'blockquote_close') close += 1;
    if (close < tokens.length) ranges.push([i, close]);
  }

  for (let range = ranges.length - 1; range >= 0; range -= 1) {
    const [open, close] = ranges[range];
    const openToken = tokens[open];
    const closeToken = tokens[close];
    const inlineIndexes = [];
    for (let j = open + 1; j < close; j += 1) {
      if (tokens[j].type === 'inline') inlineIndexes.push(j);
    }
    if (!inlineIndexes.length) continue;

    const first = inlineIndexes[0];
    const matched = tokens[first].content.match(
      /^\[!(note|theorem|definition|example|warning)\]([\s\S]*)$/,
    );
    if (!matched) continue;

    const kind = matched[1];
    const after = matched[2].replace(/^[ \t]*/, '');
    const breakAt = after.indexOf('\n');
    const title = (breakAt === -1 ? after : after.slice(0, breakAt)).trim();
    let rest = breakAt === -1 ? '' : after.slice(breakAt + 1).replace(/^\n+/, '');
    if (!rest.trim()) rest = '';

    const hasMore = inlineIndexes.length > 1;
    const label = title && (rest || hasMore) ? title : CALLOUTS[kind];

    if (rest) {
      tokens[first].content = rest;
    } else if (title && hasMore) {
      const paragraphOpen = first - 1;
      if (
        tokens[paragraphOpen]?.type === 'paragraph_open' &&
        tokens[first + 1]?.type === 'paragraph_close'
      ) {
        tokens.splice(paragraphOpen, 3);
      } else {
        tokens[first].content = '';
      }
    } else {
      tokens[first].content = title;
    }

    openToken.type = 'callout_open';
    openToken.tag = 'aside';
    openToken.attrSet('class', `callout callout-${kind}`);
    openToken.meta = { label };
    closeToken.type = 'callout_close';
    closeToken.tag = 'aside';
  }
}

function shield(src) {
  const blocks = [];
  const nonce = Math.random().toString(36).slice(2, 8);
  const pattern = mathPattern();
  const text = splitCode(src)
    .map((part) => {
      if (part.type === 'code') return part.value;
      return part.value.replace(pattern, (match) => {
        const id = blocks.length;
        blocks.push(cleanQuotedMath(match));
        return `@@MJX${nonce}${id}@@`;
      });
    })
    .join('');
  return { text, blocks, nonce };
}

function splitCode(src) {
  const re = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g;
  const parts = [];
  let last = 0;
  for (const match of src.matchAll(re)) {
    parts.push({ type: 'text', value: src.slice(last, match.index) });
    parts.push({ type: 'code', value: match[0] });
    last = match.index + match[0].length;
  }
  parts.push({ type: 'text', value: src.slice(last) });
  return parts;
}

function mathPattern() {
  return /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\begin\{([a-zA-Z*]+)\}[\s\S]+?\\end\{\1\}|\\\([\s\S]+?\\\)|(?<!\\)\$(?!\$)(?:\\.|[^$\n])+?\$(?!\$)/g;
}

function restoreHtml(html, blocks, nonce) {
  const token = `@@MJX${nonce}(\\d+)@@`;
  const wrapped = new RegExp(`<p>\\s*${token}\\s*</p>`, 'g');
  const any = new RegExp(token, 'g');
  const unwrapped = html.replace(wrapped, (full, n) => {
    const src = blocks[Number(n)];
    const safe = escapeHtml(src);
    if (isDisplay(src)) return `<div class="math-display">${safe}</div>`;
    return `<p>${safe}</p>`;
  });
  return unwrapped.replace(any, (_match, n) => escapeHtml(blocks[Number(n)]));
}

function restoreText(text, blocks, nonce) {
  const any = new RegExp(`@@MJX${nonce}(\\d+)@@`, 'g');
  return escapeHtml(text).replace(any, (_match, n) => escapeHtml(blocks[Number(n)]));
}

function cleanQuotedMath(src) {
  const lines = src.split('\n');
  const content = lines.filter((line) => line.trim());
  const quoted = content.filter((line) => /^\s*>/.test(line));
  if (quoted.length < 2 || quoted.length < content.length * 0.6) return src;
  return lines.map((line) => line.replace(/^\s*> ?/, '')).join('\n');
}

function isDisplay(src) {
  const trimmed = src.trim();
  return trimmed.startsWith('$$') || trimmed.startsWith('\\[') || trimmed.startsWith('\\begin{');
}

function inlinePlain(token) {
  if (!token) return '';
  if (!token.children?.length) return token.content || '';
  let out = '';
  for (const child of token.children) {
    if (child.type === 'text' || child.type === 'code_inline') out += child.content;
    else if (child.type === 'softbreak' || child.type === 'hardbreak') out += ' ';
    else if (child.children) out += inlinePlain(child);
  }
  return out;
}

function uniqueSlug(text, env) {
  const base = slugify(text) || 'section';
  env.slugs ??= Object.create(null);
  const count = (env.slugs[base] || 0) + 1;
  env.slugs[base] = count;
  return count === 1 ? base : `${base}-${count}`;
}

function slugify(text) {
  return text
    .replace(/@@MJX[a-z0-9]+@@/g, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function highlight(code, lang) {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
  }
  return escapeHtml(code);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
