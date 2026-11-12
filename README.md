# Tutorials

A MathJax theme for lessons written as Markdown. Drop a `.md` file in `content` and it becomes a page.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). `npm run build` writes a static site to `dist/`. Drafts stay visible in dev, with a badge, and are omitted from the production build.

## Add a tutorial

Create a series folder, then a lesson file:

```text
content/04-geometry/01-triangles.md
```

The number before the dash sets the order. It is kept in the lesson URL and dropped from the series URL, so that file is served at `/geometry/01-triangles`.

```markdown
---
title: Triangles
description: One sentence for the index.
date: 2026-11-12
tags: [geometry]
draft: true
---

The first paragraph is the opening. Sections start at `##`.

Inline math uses `$a^2 + b^2 = c^2$`. Display math is its own block:

$$
\int_a^b f(x)\, dx.
$$
```

Remove `draft: true` when the lesson should ship. `content/_template.md` is a copy-ready skeleton; files whose names start with `_` are never published.

A series can have a `content/04-geometry/_index.md` with a `title` and `description`. Without it, the folder name is title-cased.

A file placed directly in `content/` is filed under Notes.

Images go in `public/images` and are referenced as `![Alt text](/images/name.png)`.

## Math

MathJax renders TeX. These all work:

- inline: `$f'(x)$` or `\(f'(x)\)`
- display: a `$$` block, or `\[ ... \]`
- numbered equations: a `\begin{equation} ... \end{equation}` block
- aligned lines: `\begin{aligned} ... \end{aligned}` inside `$$`

Underscores inside math are left alone. A dollar sign that is not math is written `\$`. Math inside a code span or a fenced block is not typeset.

## Callouts

```markdown
> [!theorem] Chain rule
> If $g$ is differentiable at $x$, then
>
> $$(f \circ g)'(x) = f'(g(x))\, g'(x).$$
```

The marker is `note`, `theorem`, `definition`, `example`, or `warning`. The words after it are the label. A blank line inside the quote starts a new paragraph.

## Frontmatter

| Field | Role |
| --- | --- |
| `title` | Page heading. Defaults to the file name. |
| `description` | Index blurb and the sentence under the title. |
| `date` | `YYYY-MM-DD`. |
| `order` | Sort key. Defaults to the number in the file name. |
| `tags` | `[limits, derivatives]` or a YAML list. |
| `draft` | `true` hides the lesson from production. |

Search matches the title, description, tags, series, and body. `/` focuses the search box.
