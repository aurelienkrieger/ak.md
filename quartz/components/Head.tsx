import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  Head.afterDOMLoaded = "\nfunction textHeading(tag, source) {\n  const heading = document.createElement(tag)\n  heading.textContent = source.textContent?.trim() ?? \"\"\n  return heading\n}\n\nfunction makeAboutSection(heading, nodes) {\n  const section = document.createElement(\"section\")\n  section.className = \"about_section\"\n  section.appendChild(textHeading(\"h1\", heading))\n  for (const node of nodes) section.appendChild(node)\n  return section\n}\n\nfunction prepareIndexPage() {\n  if (document.body.dataset.slug !== \"index\") return\n  const article = document.querySelector(\"article\")\n  if (!article || article.dataset.prepared === \"true\") return\n\n  const nodes = Array.from(article.children)\n  if (nodes[0]?.tagName === \"H1\") nodes.shift()\n\n  const output = document.createDocumentFragment()\n  const intro = document.createElement(\"section\")\n  intro.id = \"intro\"\n\n  while (nodes.length && nodes[0].tagName !== \"H2\") {\n    intro.appendChild(nodes.shift())\n  }\n  output.appendChild(intro)\n\n  while (nodes.length) {\n    const heading = nodes.shift()\n    if (!heading || heading.tagName !== \"H2\") continue\n\n    const sectionNodes = []\n    while (nodes.length && nodes[0].tagName !== \"H2\") {\n      sectionNodes.push(nodes.shift())\n    }\n    output.appendChild(makeAboutSection(heading, sectionNodes))\n  }\n\n  article.replaceChildren(output)\n  article.dataset.prepared = \"true\"\n}\n\nfunction prepareAboutPage() {\n  if (document.body.dataset.slug !== \"about\") return\n  const article = document.querySelector(\"article\")\n  if (!article || article.dataset.prepared === \"true\") return\n\n  const nodes = Array.from(article.children)\n  if (nodes[0]?.tagName === \"H1\") nodes.shift()\n\n  const output = document.createDocumentFragment()\n  const intro = document.createElement(\"section\")\n  intro.id = \"intro\"\n\n  while (nodes.length && nodes[0].tagName !== \"H2\") {\n    intro.appendChild(nodes.shift())\n  }\n  output.appendChild(intro)\n\n  while (nodes.length) {\n    const heading = nodes.shift()\n    if (!heading || heading.tagName !== \"H2\") continue\n\n    const sectionNodes = []\n    while (nodes.length && nodes[0].tagName !== \"H2\") {\n      sectionNodes.push(nodes.shift())\n    }\n\n    const section = makeAboutSection(heading, [])\n    const sectionName = heading.textContent?.trim().toLowerCase() ?? \"\"\n\n    if (sectionName === \"expertise\") {\n      const grid = document.createElement(\"div\")\n      grid.id = \"expertise\"\n      for (let i = 0; i < sectionNodes.length; i++) {\n        const node = sectionNodes[i]\n        if (node.tagName !== \"H3\") continue\n        const item = document.createElement(\"div\")\n        item.appendChild(textHeading(\"h2\", node))\n        const next = sectionNodes[i + 1]\n        if (next && next.tagName === \"P\") {\n          item.appendChild(next)\n          i++\n        }\n        grid.appendChild(item)\n      }\n      section.appendChild(grid)\n    } else if (sectionName.startsWith(\"selected clients\")) {\n      const grid = document.createElement(\"div\")\n      grid.id = \"clients\"\n      for (let i = 0; i < sectionNodes.length; i++) {\n        const node = sectionNodes[i]\n        if (node.tagName !== \"H3\") continue\n        const item = document.createElement(\"div\")\n        item.appendChild(textHeading(\"h2\", node))\n        const next = sectionNodes[i + 1]\n        if (next && next.tagName === \"UL\") {\n          item.appendChild(next)\n          i++\n        }\n        grid.appendChild(item)\n      }\n      section.appendChild(grid)\n    } else {\n      for (const node of sectionNodes) section.appendChild(node)\n    }\n\n    output.appendChild(section)\n  }\n\n  article.replaceChildren(output)\n  article.dataset.prepared = \"true\"\n}\n\nfunction prepareContactPage() {\n  if (document.body.dataset.slug !== \"contact\") return\n  const article = document.querySelector(\"article\")\n  if (!article || article.dataset.prepared === \"true\") return\n\n  const nodes = Array.from(article.children)\n  if (nodes[0]?.tagName === \"H1\") nodes.shift()\n\n  const intro = document.createElement(\"section\")\n  intro.id = \"intro\"\n  for (const node of nodes) intro.appendChild(node)\n\n  article.replaceChildren(intro)\n  article.dataset.prepared = \"true\"\n}\n\nfunction creditGroups(sourceList) {\n  const credits = document.createElement(\"div\")\n  credits.className = \"credits\"\n\n  for (const item of Array.from(sourceList?.children ?? [])) {\n    const group = document.createElement(\"ul\")\n    const label = document.createElement(\"li\")\n    const value = document.createElement(\"li\")\n    const strong = item.querySelector(\"strong\")\n\n    if (strong) {\n      label.textContent = (strong.textContent ?? \"\").replace(/:$/, \"\")\n      const clone = item.cloneNode(true)\n      clone.querySelector(\"strong\")?.remove()\n      while (clone.firstChild) value.appendChild(clone.firstChild)\n    } else {\n      value.innerHTML = item.innerHTML\n    }\n\n    group.append(label, value)\n    credits.appendChild(group)\n  }\n\n  return credits\n}\n\nfunction prepareProjectPage() {\n  if (!document.body.dataset.slug?.startsWith(\"work/\")) return\n  const article = document.querySelector(\"article\")\n  if (!article || article.dataset.prepared === \"true\") return\n\n  const nodes = Array.from(article.children)\n  const creditsIndex = nodes.findIndex(\n    (node) => node.tagName === \"H2\" && node.textContent?.trim().toLowerCase() === \"credits\",\n  )\n  const imagesIndex = nodes.findIndex(\n    (node) => node.tagName === \"H2\" && node.textContent?.trim().toLowerCase() === \"images\",\n  )\n  if (imagesIndex === -1) return\n\n  const container = document.createElement(\"section\")\n  container.className = \"container\"\n\n  const description = document.createElement(\"div\")\n  description.className = \"content description\"\n\n  if (nodes[0]?.tagName === \"H1\") {\n    description.appendChild(textHeading(\"h2\", nodes[0]))\n  }\n\n  const descriptionEnd = creditsIndex >= 0 ? creditsIndex : imagesIndex\n  for (const node of nodes.slice(1, descriptionEnd)) {\n    description.appendChild(node)\n  }\n\n  if (creditsIndex >= 0) {\n    const list = nodes[creditsIndex + 1]\n    if (list?.tagName === \"UL\") description.appendChild(creditGroups(list))\n  }\n\n  const images = document.createElement(\"div\")\n  images.className = \"content images\"\n\n  const imageNodes = nodes.slice(imagesIndex + 1)\n  for (let i = 0; i < imageNodes.length; i++) {\n    const node = imageNodes[i]\n    const img = node.querySelector?.(\"img\")\n    if (!img) continue\n\n    const figure = document.createElement(\"figure\")\n    figure.appendChild(img)\n\n    const next = imageNodes[i + 1]\n    const caption = next?.querySelector?.(\"em\")\n    if (caption) {\n      const figcaption = document.createElement(\"figcaption\")\n      figcaption.textContent = caption.textContent ?? \"\"\n      figure.appendChild(figcaption)\n      i++\n    }\n\n    images.appendChild(figure)\n  }\n\n  container.append(description, images)\n  article.replaceChildren(container)\n  article.dataset.prepared = \"true\"\n}\n\nfunction prepareNavigation() {\n  const toggle = document.querySelector(\".togglenav\")\n  const menu = document.getElementById(\"menu\")\n  if (!toggle || !menu || toggle.dataset.bound === \"true\") return\n\n  const toggleMenu = () => {\n    menu.classList.toggle(\"responsive\")\n  }\n\n  toggle.addEventListener(\"click\", toggleMenu)\n  toggle.addEventListener(\"keydown\", (event) => {\n    if (event.key === \"Enter\" || event.key === \" \") {\n      event.preventDefault()\n      toggleMenu()\n    }\n  })\n  toggle.dataset.bound = \"true\"\n}\n\nfunction preparePortfolioLayout() {\n  prepareNavigation()\n  prepareIndexPage()\n  prepareAboutPage()\n  prepareContactPage()\n  prepareProjectPage()\n}\n\nif (document.readyState === \"loading\") {\n  document.addEventListener(\"DOMContentLoaded\", preparePortfolioLayout)\n} else {\n  preparePortfolioLayout()\n}\ndocument.addEventListener(\"nav\", preparePortfolioLayout)\n"

  return Head
}) satisfies QuartzComponentConstructor
