import type { Element, ElementContent, Root, RootContent, Text } from "hast"

/**
 * Rebuilds the DOM of the original hand-written site from plain Markdown.
 *
 * Quartz gives us a flat list of blocks (h1, p, ul, table, ...). The original
 * site wrapped those in <section>/<div> structures that its CSS relies on.
 * This module re-creates those wrappers purely from the heading outline, so
 * the Markdown never has to contain anything but standard Markdown.
 *
 * ── Page kinds ───────────────────────────────────────────────────────────
 *
 * "page" (index, about, contact, …)
 *
 *   # Title                ← page title, not displayed
 *   Intro paragraphs…      ← <section id="intro">
 *   ## Section             ← <section class="about_section"><h1>Section</h1>
 *   ### Column             ←   several ### in a section → <div class="columns">
 *
 * "project" (anything in work/, or `type: project`)
 *
 *   # Title                ← <h2> in the left column
 *   Paragraphs…            ← left column
 *   ## Credits             ← bullet list "- **Role:** name" → <div class="credits">
 *   ## Images              ← right column: image, then optional *caption*
 *   ## Anything else       ← left column, rendered as <h3> + content
 */

export type PageKind = "page" | "project"

export function pageKind(slug: string | undefined, type: unknown): PageKind {
  if (type === "project" || slug?.startsWith("work/")) return "project"
  return "page"
}

// ── hast helpers ───────────────────────────────────────────────────────────

const el = (
  tagName: string,
  properties: Element["properties"] = {},
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children })

const text = (value: string): Text => ({ type: "text", value })

const isElement = (n: RootContent | ElementContent, tag?: string): n is Element =>
  n.type === "element" && (tag === undefined || n.tagName === tag)

const isBlank = (n: RootContent | ElementContent): boolean =>
  n.type === "text" && n.value.trim() === ""

const isHeading = (n: RootContent, level: number): n is Element => isElement(n, `h${level}`)

/** Depth-first search for the first element matching `tag`. */
function find(node: Element | Root, tag: string): Element | undefined {
  for (const child of node.children) {
    if (!isElement(child)) continue
    if (child.tagName === tag) return child
    const found = find(child, tag)
    if (found) return found
  }
  return undefined
}

/** Splits blocks at every heading of `level`; blocks before the first heading go in `before`. */
function splitAt(blocks: RootContent[], level: number) {
  const before: RootContent[] = []
  const groups: { heading: Element; body: RootContent[] }[] = []
  for (const block of blocks) {
    if (isHeading(block, level)) groups.push({ heading: block, body: [] })
    else if (groups.length) groups[groups.length - 1].body.push(block)
    else before.push(block)
  }
  return { before, groups }
}

const headingText = (h: Element): string =>
  h.children
    .map((c) => (c.type === "text" ? c.value : isElement(c) ? headingText(c) : ""))
    .join("")
    .trim()

const br = (): Element => el("br")

// ── flow: paragraphs ───────────────────────────────────────────────────────

/**
 * The original site wrote a description as ONE <p> with `<br><br>` between
 * paragraphs, and quotes as <i>…</i>. Reproduce that: consecutive paragraphs
 * are merged, and a blockquote becomes an italic span inside the paragraph
 * it follows. Everything else (lists, tables, images…) passes through.
 */
function flow(blocks: RootContent[], opts: { trailingBreaks?: boolean } = {}): ElementContent[] {
  const out: ElementContent[] = []
  let run: Element | null = null

  const appendTo = (p: Element, children: ElementContent[]) => {
    if (p.children.length) p.children.push(br(), br())
    p.children.push(...children)
  }
  const inline = (p: Element) => p.children.filter((c) => !isBlank(c) || c.type !== "text")

  for (const block of blocks) {
    if (isBlank(block)) continue

    if (isElement(block, "p")) {
      if (!run) {
        run = el("p")
        out.push(run)
      }
      appendTo(run, inline(block))
      continue
    }

    if (isElement(block, "blockquote")) {
      const quote = block as Element
      const paragraphs = quote.children.filter((c): c is Element => isElement(c, "p"))
      const italic = el("i")
      paragraphs.forEach((p, i) => {
        if (i > 0) italic.children.push(br(), br())
        italic.children.push(...inline(p))
      })
      if (!run) {
        run = el("p")
        out.push(run)
      }
      appendTo(run, [italic])
      run = null // the quote closes the paragraph, like the original
      continue
    }

    run = null
    out.push(block as ElementContent)
  }

  if (opts.trailingBreaks) {
    // The original intro ended with <br><br> before whatever came next.
    const last = [...out].reverse().find((n) => isElement(n, "p"))
    if (last && isElement(last)) last.children.push(br(), br())
  }
  return out
}

// ── page kind ──────────────────────────────────────────────────────────────

function buildSectionBody(body: RootContent[]): ElementContent[] {
  const { before, groups } = splitAt(body, 3)
  if (!groups.length) return flow(body)

  const columns = el(
    "div",
    { className: ["columns"] },
    groups.map(({ heading, body }) =>
      el("div", {}, [el("h2", {}, heading.children), ...flow(body)]),
    ),
  )
  return [...flow(before), columns]
}

function buildPage(blocks: RootContent[]): RootContent[] {
  const { before: intro, groups: sections } = splitAt(blocks, 2)
  const out: RootContent[] = []

  if (intro.length) {
    // The original intro ended with <br><br> whenever something followed it
    // (another section, or a list right after the paragraph).
    const firstP = intro.findIndex((b) => isElement(b, "p"))
    const listFollows =
      firstP >= 0 && intro.slice(firstP + 1).some((b) => !isBlank(b) && !isElement(b, "p"))
    out.push(
      el("section", { id: "intro" }, flow(intro, { trailingBreaks: sections.length > 0 || listFollows })),
    )
  }

  for (const { heading, body } of sections) {
    out.push(
      el("section", { className: ["about_section"] }, [
        el("h1", {}, heading.children),
        ...buildSectionBody(body),
      ]),
    )
  }
  return out
}

// ── project kind ───────────────────────────────────────────────────────────

/** `- **Role:** Name` → <ul><li>Role:</li><li>Name</li></ul> (the original credit format). */
function buildCredits(body: RootContent[]): Element {
  const credits = el("div", { className: ["credits"] })
  const list = body.find((b): b is Element => isElement(b, "ul"))
  if (!list) return credits

  for (const item of list.children.filter((c): c is Element => isElement(c, "li"))) {
    const children = item.children.filter((c) => !isBlank(c) || c.type !== "text")
    const first = children[0]
    if (first && isElement(first, "strong")) {
      const value = children.slice(1)
      if (value[0]?.type === "text") value[0] = text(value[0].value.replace(/^\s+/, ""))
      credits.children.push(
        el("ul", {}, [el("li", {}, first.children), el("li", {}, value)]),
      )
    } else {
      credits.children.push(el("ul", {}, [el("li", {}, children)]))
    }
  }
  return credits
}

/** Each image, optionally followed by a paragraph holding only *an emphasis*, becomes a <figure>. */
function buildFigures(body: RootContent[]): Element[] {
  const figures: Element[] = []
  const blocks = body.filter((b) => !isBlank(b))

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (!isElement(block)) continue
    const img = block.tagName === "img" ? block : find(block, "img")
    if (!img) continue

    const figure = el("figure", {}, [img])
    const next = blocks[i + 1]
    if (next && isElement(next, "p")) {
      const content = next.children.filter((c) => !isBlank(c))
      if (content.length === 1 && isElement(content[0], "em") && !find(next, "img")) {
        figure.children.push(el("figcaption", {}, content[0].children))
        i++
      }
    }
    figures.push(figure)
  }
  return figures
}

function buildProject(blocks: RootContent[]): RootContent[] {
  const { before, groups } = splitAt(blocks, 2)
  const description = el("div", { className: ["content", "description"] })

  // The title is the first h1 of the file.
  const titleIndex = before.findIndex((b) => isHeading(b, 1))
  if (titleIndex >= 0) {
    const title = before.splice(titleIndex, 1)[0] as Element
    description.children.push(el("h2", {}, title.children))
  }
  description.children.push(...flow(before))

  let credits: Element | undefined
  let figures: Element[] = []

  for (const { heading, body } of groups) {
    const name = headingText(heading).toLowerCase()
    if (name === "credits") credits = buildCredits(body)
    else if (name === "images") figures = buildFigures(body)
    else description.children.push(el("h3", {}, heading.children), ...flow(body))
  }
  if (credits) description.children.push(credits)

  const container = el("section", { className: ["container"] }, [description])
  if (figures.length) {
    container.children.push(el("div", { className: ["content", "images"] }, figures))
  }
  return [container]
}

// ── links ──────────────────────────────────────────────────────────────────

/** The original gave every content link the `bluelink` class. */
function decorateLinks(node: Element | Root): void {
  for (const child of node.children) {
    if (!isElement(child)) continue
    if (child.tagName === "a") {
      const existing = child.properties.className
      const classes = Array.isArray(existing) ? existing.map(String) : []
      if (!classes.includes("bluelink")) classes.push("bluelink")
      child.properties.className = classes
    }
    decorateLinks(child)
  }
}

// ── entry point ────────────────────────────────────────────────────────────

/** Returns a new root; the input tree is left untouched. */
export function restructure(tree: Root, kind: PageKind): Root {
  const blocks = tree.children.filter((b) => !isBlank(b))

  // The first h1 is the page title; for pages it is not displayed.
  const content = kind === "page" && blocks[0] && isHeading(blocks[0], 1) ? blocks.slice(1) : blocks

  const root: Root = {
    type: "root",
    children: kind === "project" ? buildProject(content) : buildPage(content),
  }
  decorateLinks(root)
  return root
}
