import { parseFrontmatter } from './frontmatter.js';

const modules = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function relative(key) {
  const norm = key.replace(/\\/g, '/');
  const mark = '/content/';
  const index = norm.lastIndexOf(mark);
  if (index === -1) return null;
  return norm.slice(index + mark.length).replace(/\.md$/i, '');
}

function hidden(rel) {
  return rel.split('/').some((part) => part.startsWith('_') && part !== '_index');
}

function folderMeta(folder) {
  if (!folder) return { order: 1000, slug: 'notes', title: 'Notes' };
  const matched = folder.match(/^(\d+)-(.+)$/);
  const raw = matched ? matched[2] : folder;
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    order: matched ? Number(matched[1]) : 500,
    slug,
    title: titleCase(slug),
  };
}

function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function autoDescription(body) {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\}/g, ' ')
    .replace(/\$[^$\n]+\$/g, ' ');
  const line = plain
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('#') && !item.startsWith('>') && !item.startsWith('---'));
  if (!line) return '';
  const clean = line.replace(/[*_`[\]]/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

function asTags(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

const seriesMap = new Map();
const usedPaths = new Set();

function seriesFor(folder) {
  if (!seriesMap.has(folder)) {
    const meta = folderMeta(folder);
    seriesMap.set(folder, {
      ...meta,
      key: folder,
      description: '',
      intro: '',
      posts: [],
    });
  }
  return seriesMap.get(folder);
}

const posts = [];

for (const [key, raw] of Object.entries(modules)) {
  const rel = relative(key);
  if (!rel || hidden(rel)) continue;
  const { data, body } = parseFrontmatter(raw);
  const parts = rel.split('/');
  const isIndex = parts[parts.length - 1] === '_index';
  const folder = parts.slice(0, -1).join('/');
  const series = seriesFor(folder);

  if (isIndex) {
    if (data.title) series.title = String(data.title);
    if (data.description) series.description = String(data.description);
    series.intro = body.trim();
    continue;
  }

  const filename = parts[parts.length - 1];
  const prefix = filename.match(/^(\d+)-/);
  const order = typeof data.order === 'number' ? data.order : prefix ? Number(prefix[1]) : 0;
  const fileSlug = filename.toLowerCase();
  let path = `/${series.slug}/${fileSlug}`;
  if (usedPaths.has(path)) path = `/${series.slug}/${series.order}-${fileSlug}`;
  usedPaths.add(path);

  const post = {
    title: data.title ? String(data.title) : titleCase(filename.replace(/^\d+-/, '')),
    description: data.description ? String(data.description) : autoDescription(body),
    date: data.date ? String(data.date) : '',
    tags: asTags(data.tags),
    draft: data.draft === true,
    order,
    body,
    path,
    seriesKey: folder,
    seriesSlug: series.slug,
    minutes: readingTime(body),
    haystack: '',
  };
  posts.push(post);
  series.posts.push(post);
}

for (const post of posts) {
  const series = seriesMap.get(post.seriesKey);
  post.seriesTitle = series.title;
  post.seriesDescription = series.description;
  post.haystack = [post.title, post.description, series.title, series.description, post.tags.join(' '), post.body]
    .join('\n')
    .toLowerCase();
}

for (const series of seriesMap.values()) {
  series.posts.sort(
    (a, b) => a.order - b.order || a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  );
}

export const seriesList = [...seriesMap.values()].sort(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
);

const byPath = new Map(posts.map((post) => [post.path, post]));

export function catalog() {
  const dev = import.meta.env.DEV;
  return seriesList
    .map((series) => ({
      ...series,
      posts: series.posts.filter((post) => dev || !post.draft),
    }))
    .filter((series) => series.posts.length);
}

export function visiblePosts() {
  return catalog().flatMap((series) => series.posts);
}

export function findPost(path) {
  const post = byPath.get(path);
  if (!post) return null;
  if (post.draft && !import.meta.env.DEV) return null;
  return post;
}

export function neighbors(post) {
  const series = seriesMap.get(post.seriesKey);
  const list = series.posts.filter((item) => import.meta.env.DEV || !item.draft);
  const index = list.findIndex((item) => item.path === post.path);
  return {
    prev: list[index - 1] || null,
    next: list[index + 1] || null,
  };
}

export function allTags() {
  const tags = new Map();
  for (const post of visiblePosts()) {
    for (const tag of post.tags) {
      const key = tag.toLowerCase();
      if (!tags.has(key)) tags.set(key, tag);
    }
  }
  return [...tags.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
