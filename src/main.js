import './styles.css';
import { renderMarkdown } from './markdown.js';
import { catalog, findPost, neighbors } from './posts.js';

const SITE = 'Rajtilak Bhattacharjee';

let renderId = 0;
let tocObserver = null;

const app = document.querySelector('#app');

function mount() {
  app.innerHTML = shell();
  applyTheme(document.documentElement.dataset.theme || 'light');
  document.querySelector('.sidebar-nav').innerHTML = sidebarHtml();
  bind();
  render({ nav: false });
  typeset(document.querySelector('.sidebar-nav'));
}

function shell() {
  return `
    <a class="skip" href="#content">Skip to content</a>
    <div class="progress" data-progress></div>
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="/">
          <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect class="mark-tile" width="32" height="32" rx="7"/>
            <path class="mark-line" d="M19.5 6.2c-3.8 1.6-5 3.8-4.8 6.5.3 3.4 2.2 4.9 2 8.1-.2 2.7-1.8 4.2-5.2 5.2" fill="none" stroke-width="1.8" stroke-linecap="round"/>
            <path class="mark-bar" d="M10 13h12" fill="none" stroke="#e39a72" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>
            <strong>Rajtilak Bhattacharjee</strong>
          </span>
        </a>
        <form class="search-form" role="search" data-search-form>
          <label class="sr-only" for="q">Search tutorials</label>
          <input id="q" type="search" name="q" data-search placeholder="Search tutorials" autocomplete="off" enterkeyhint="search" />
        </form>
        <div class="top-actions">
          <button type="button" class="contents-btn" data-menu aria-expanded="false" aria-controls="sidebar">Contents</button>
          <button type="button" class="icon-btn" data-theme-toggle aria-label="Switch to dark theme">
            <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3.5A8 8 0 1 0 20.5 14 6.5 6.5 0 0 1 16 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    </header>
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <nav class="sidebar-nav" aria-label="Tutorials"></nav>
      </aside>
      <main id="content" tabindex="-1" data-outlet></main>
    </div>
  `;
}

function bind() {
  const input = document.querySelector('[data-search]');
  document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
  });
  input.addEventListener('input', () => {
    const filters = currentFilters();
    const onHome = routePath() === '/';
    const params = new URLSearchParams();
    if (onHome && filters.tag) params.set('tag', filters.tag);
    if (onHome && filters.series) params.set('series', filters.series);
    if (input.value) params.set('q', input.value);
    const next = params.toString() ? `/?${params}` : '/';
    if (onHome) history.replaceState({}, '', next);
    else history.pushState({}, '', next);
    render({ nav: !onHome, preserveFocus: true });
  });

  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  document.querySelector('[data-menu]').addEventListener('click', () => {
    const open = document.querySelector('.sidebar').classList.toggle('is-open');
    const menu = document.querySelector('[data-menu]');
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.textContent = open ? 'Close' : 'Contents';
  });

  document.addEventListener('click', onClick);
  window.addEventListener('popstate', () => render({ nav: true }));
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (localStorage.getItem('theme')) return;
    applyTheme(event.matches ? 'dark' : 'light');
  });
}

function onClick(event) {
  const anchor = event.target.closest('a');
  if (!anchor || !anchor.href) return;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return;
  event.preventDefault();
  history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  render({ nav: true });
}

function onKey(event) {
  const typing = event.target.closest('input, textarea, [contenteditable="true"]');
  if (event.key === '/' && !typing) {
    event.preventDefault();
    document.querySelector('[data-search]')?.focus();
  }
  if (event.key === 'Escape') {
    if (document.querySelector('.sidebar')?.classList.contains('is-open')) closeMenu();
    else if (document.activeElement === document.querySelector('[data-search]')) {
      document.activeElement.blur();
    }
  }
}

async function render({ nav = false, preserveFocus = false } = {}) {
  const id = ++renderId;
  const path = routePath();
  const filters = currentFilters();
  syncSearch(filters.q);
  const outlet = document.querySelector('[data-outlet]');
  const page = buildPage(path, filters);
  if (window.MathJax?.typesetClear) {
    try {
      window.MathJax.typesetClear([outlet]);
    } catch {
      /* MathJax is still starting. */
    }
  }
  tocObserver?.disconnect();
  outlet.innerHTML = page.html;
  paintCurrent();
  document.title = page.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
  if (nav) closeMenu();
  if (nav && !location.hash) window.scrollTo(0, 0);
  if (nav && !preserveFocus) document.getElementById('content').focus({ preventScroll: true });
  bindToc();
  onScroll();
  await typeset(outlet, id);
  if (id !== renderId) return;
  if (location.hash) scrollToHash();
}

function buildPage(path, filters) {
  if (path === '/') return buildHome(filters);
  const post = findPost(path);
  if (!post) {
    return {
      html: renderMissing(),
      title: `Not found · ${SITE}`,
      description: 'This page is not in the notes.',
    };
  }
  return {
    html: renderArticle(post),
    title: `${post.title} · ${SITE}`,
    description: post.description || post.title,
  };
}

function activeSeriesSlug(filters) {
  const groups = catalog();
  if (filters.series && groups.some((series) => series.slug === filters.series)) return filters.series;
  return groups[0]?.slug || '';
}

function buildHome(filters) {
  const seriesSlug = activeSeriesSlug(filters);
  const scoped = { ...filters, series: seriesSlug };
  const groups = catalog()
    .map((series) => ({
      ...series,
      posts: series.posts.filter((post) => matches(post, scoped)),
    }))
    .filter((series) => series.slug === seriesSlug && series.posts.length);
  const list = groups.length
    ? groups
        .map(
          (series) => `<section class="series-block">
            <h2 class="sr-only">${esc(series.title)}</h2>
            <ol class="lessons">
              ${series.posts.map((post) => lessonRow(post)).join('')}
            </ol>
          </section>`,
        )
        .join('')
    : emptyHtml(scoped);

  return {
    title: SITE,
    description: 'Mathematics tutorials by Rajtilak Bhattacharjee.',
    html: `<h1 class="sr-only">${esc(SITE)}</h1>
      ${filters.tag ? `<p class="filter-note"><a class="show-all" href="${esc(homeHref({ q: filters.q, series: filters.series }))}">Show all</a></p>` : ''}
      ${list}`,
  };
}

function lessonRow(post) {
  const bits = [];
  if (post.date) bits.push(formatDate(post.date));
  bits.push(`${post.minutes} min read`);
  return `<li>
    <a href="${esc(post.path)}">
      <span class="num">${esc(String(post.order).padStart(2, '0'))}</span>
      <span>
        <span class="lesson-title">${esc(post.title)}${post.draft ? ' <span class="badge">Draft</span>' : ''}</span>
        ${post.description ? `<span class="lesson-dek">${esc(post.description)}</span>` : ''}
        <span class="lesson-meta">${bits.map(esc).join(' · ')}</span>
      </span>
    </a>
  </li>`;
}

function renderArticle(post) {
  const { html, toc } = renderMarkdown(post.body);
  const { prev, next } = neighbors(post);
  const tocBlock = tocNav(toc);
  return `<div class="article-layout">
    <article class="article">
      <header class="article-head">
        <p class="kicker"><a href="${esc(homeHref({ series: post.seriesSlug }))}">${esc(post.seriesTitle)}</a></p>
        <h1>${esc(post.title)}</h1>
        ${post.description ? `<p class="dek">${esc(post.description)}</p>` : ''}
        <p class="byline">${metaLine(post)}</p>
        ${tagList(post.tags)}
      </header>
      ${tocBlock ? `<div class="toc-mobile">${tocBlock}</div>` : ''}
      <div class="prose">${html}</div>
      ${pager(prev, next)}
      <footer class="colophon"><p>Written in Markdown. Mathematics set with MathJax.</p></footer>
    </article>
    ${tocBlock ? `<div class="toc-desktop">${tocBlock}</div>` : ''}
  </div>`;
}

function renderMissing() {
  return `<article class="article">
    <p class="kicker">404</p>
    <h1>This page is not in the notes.</h1>
    <p class="dek">The link may be mistyped, or the tutorial is still a draft.</p>
    <p><a class="text-link" href="/">Back to all tutorials</a></p>
  </article>`;
}

function sidebarHtml() {
  const groups = catalog();
  if (!groups.length) return '<p class="series-dek">No tutorials yet.</p>';
  const blocks = groups
    .map(
      (series) => `<section class="side-series">
        <p class="series-label"><a href="${esc(homeHref({ series: series.slug }))}">${esc(series.title)}</a></p>
        <ul>
          ${series.posts
            .map(
              (post) =>
                `<li><a href="${esc(post.path)}">${esc(post.title)}${post.draft ? ' <span class="badge">Draft</span>' : ''}</a></li>`,
            )
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
  return blocks;
}

function tocNav(toc) {
  if (!toc.length) return '';
  return `<nav class="toc" aria-label="On this page">
    <p class="series-label">On this page</p>
    <ol>
      ${toc
        .map((item) => `<li class="toc-l${item.level}"><a href="#${item.id}">${item.text}</a></li>`)
        .join('')}
    </ol>
  </nav>`;
}

function tagList(tags) {
  if (!tags.length) return '';
  return `<ul class="taglist">${tags
    .map(
      (tag) =>
        `<li><a class="chip" href="${esc(homeHref({ tag }))}">${esc(tag)}</a></li>`,
    )
    .join('')}</ul>`;
}

function pager(prev, next) {
  if (!prev && !next) return '';
  return `<nav class="pager" aria-label="Nearby tutorials">
    ${
      prev
        ? `<a class="prev" href="${esc(prev.path)}"><small>Previous</small><span>${esc(prev.title)}</span></a>`
        : '<span></span>'
    }
    ${
      next
        ? `<a class="next" href="${esc(next.path)}"><small>Next</small><span>${esc(next.title)}</span></a>`
        : '<span></span>'
    }
  </nav>`;
}

function metaLine(post) {
  const bits = [];
  if (post.date) {
    bits.push(`<time datetime="${esc(String(post.date).slice(0, 10))}">${esc(formatDate(post.date))}</time>`);
  }
  bits.push(`${post.minutes} min read`);
  if (post.draft) bits.push('<span class="badge">Draft</span>');
  return bits.join(' <span class="dot" aria-hidden="true">·</span> ');
}

function matches(post, filters) {
  if (filters.tag && !post.tags.some((tag) => tag.toLowerCase() === filters.tag.toLowerCase())) return false;
  if (filters.series && post.seriesSlug !== filters.series) return false;
  const terms = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => post.haystack.includes(term));
}

function emptyHtml(filters) {
  if (filters.q.trim()) return `<p class="empty">No tutorials match “${esc(filters.q.trim())}”.</p>`;
  if (filters.tag || filters.series) return '<p class="empty">Nothing in this filter yet.</p>';
  return '<p class="empty">No tutorials yet. Add a Markdown file under <code>content</code>.</p>';
}

function homeHref(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `/?${query}` : '/';
}

function currentFilters() {
  const url = new URL(location.href);
  return {
    q: url.searchParams.get('q') || '',
    tag: url.searchParams.get('tag') || '',
    series: url.searchParams.get('series') || '',
  };
}

function routePath() {
  let path = location.pathname;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

function syncSearch(query) {
  const input = document.querySelector('[data-search]');
  if (!input || document.activeElement === input) return;
  if (input.value !== query) input.value = query;
}

function paintCurrent() {
  const path = routePath();
  const filters = currentFilters();
  document.querySelectorAll('.sidebar a').forEach((anchor) => {
    const target = new URL(anchor.getAttribute('href'), location.origin);
    const targetPath = target.pathname.length > 1 && target.pathname.endsWith('/')
      ? target.pathname.slice(0, -1)
      : target.pathname;
    let current = false;
    if (target.searchParams.get('series')) {
      current = path === '/' && target.searchParams.get('series') === activeSeriesSlug(filters);
    } else {
      current = targetPath === path;
    }
    if (current) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  });
}

function bindToc() {
  tocObserver?.disconnect();
  const headings = [...document.querySelectorAll('.prose h2[id], .prose h3[id]')];
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (!headings.length || !links.length) return;
  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.id;
      for (const link of links) {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] },
  );
  headings.forEach((heading) => tocObserver.observe(heading));
}

function closeMenu() {
  document.querySelector('.sidebar')?.classList.remove('is-open');
  const menu = document.querySelector('[data-menu]');
  if (!menu) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = 'Contents';
}

function onScroll() {
  const bar = document.querySelector('[data-progress]');
  if (!bar) return;
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  const amount = max > 0 ? root.scrollTop / max : 0;
  bar.style.transform = `scaleX(${amount})`;
}

function scrollToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ block: 'start' });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  document.querySelector('[data-theme-toggle]')?.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#141311' : '#f3efe6');
}

async function typeset(element, id) {
  if (!element) return;
  const ready = await mathjaxReady();
  if (!ready) return;
  if (id != null && id !== renderId) return;
  try {
    window.MathJax.typesetClear?.([element]);
    await window.MathJax.typesetPromise([element]);
  } catch (error) {
    console.error(error);
  }
}

function mathjaxReady() {
  if (window.MathJax?.startup?.promise) return window.MathJax.startup.promise.then(() => true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.MathJax?.startup?.promise) {
        clearInterval(timer);
        window.MathJax.startup.promise.then(() => resolve(true));
      } else if (Date.now() - started > 8000) {
        clearInterval(timer);
        resolve(false);
      }
    }, 40);
  });
}

function formatDate(iso) {
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(iso);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return String(iso);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

mount();
