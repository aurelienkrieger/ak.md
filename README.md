# aurelienkrieger.com

Personal portfolio built from Markdown with Quartz 5. Edit the Markdown in Obsidian, never the code.

```bash
npm install
npx quartz build --serve
```

## Writing content

Everything lives in `content/`. The page layout is rebuilt from the **heading outline**
(`quartz/util/portfolio.ts`), so you only write standard Markdown.

### Pages (index, about, contact)

```markdown
---
type: page
title: "About"
nav: 2                  # shows up in the menu, ordered by this number
---
# About                 ← page title (not displayed)

Intro paragraphs.       ← the intro block

## a section            ← section with a dashed title (displayed exactly as written)

### Column A            ← one or more "###" in a section → columns
Text or a list.
```

- Menu label = file name (`about`). Override with `nav_label: "…"`.
- A Markdown table is the "year | text" list. Keep the header row (it is hidden); leave the
  year cell empty to continue the previous year. Use a single `<br>` for a line break in a cell.
- Site-wide metadata lives in the frontmatter of `content/index.md`: `description`, `image`
  (+ `image_width` / `image_height`), `author`, `keywords` and `url` (used for `og:url`).
  A page can override `description`, `image`, `author` and `keywords` in its own frontmatter.
  Image dimensions default to the "-1024x683" suffix of the image file name.

### Projects (`content/work/*.md`)

```markdown
---
type: project
title: "ORS"
---
# O.R.S. (Orbital River Station)   ← title of the left column

Paragraphs…
> Quotes are rendered in italics.

## Credits
- **Artists** [HeHe](http://hehe.org/)       ← the label is shown as written ("Artists" or "Artists:")
- **Produced by:** Bipolar

## Images
![[assets/images/ORS/photo.jpg]]

*Photo credit: …*                  ← optional caption (a paragraph that is only italic)
```

Any other `##` section in a project is shown in the left column under an `<h3>`.
To list a project on the home page, add a link in `content/index.md`: `[[work/ors|ORS]]`.

## Code map

| File | Role |
| --- | --- |
| `quartz/util/portfolio.ts` | Markdown outline → original DOM (sections, columns, credits, figures) |
| `quartz/components/frames/PortfolioFrame.tsx` | Page frame: header + restructured body |
| `quartz/components/Header.tsx` | Logo, menu built from `nav:` frontmatter, mobile burger |
| `quartz/components/pages/404.tsx` | 404 page |
| `quartz/components/Head.tsx` | Title (`Aurélien Krieger - Page`), description, keywords, author, canonical, social image |
| `quartz/styles/custom.scss` | Transcription of the original CSS |
