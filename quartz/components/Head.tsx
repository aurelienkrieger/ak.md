import { i18n } from "../i18n"
import { getFileExtension, joinSegments } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"

/** "photo.jpg" → "jpeg", "photo.png" → "png" (getFileExtension returns the leading dot). */
const imageMime = (path: string): string => {
  const ext = (getFileExtension(path) ?? ".png").replace(/^\./, "").toLowerCase()
  return ext === "jpg" ? "jpeg" : ext
}

/** "[[assets/images/a.jpg]]" (Obsidian link) or "assets/images/a.jpg" → "assets/images/a.jpg" */
const imagePath = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .replace(/^!?\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]
    .replace(/^\/+/, "")

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
    allFiles,
  }: QuartzComponentProps) => {
    // Site-wide defaults live in the frontmatter of content/index.md
    // (`description`, `image`); any page can override them in its own frontmatter.
    const home = allFiles.find((f) => f.slug === "index")?.frontmatter

    const pageName = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const title =
      (fileData.slug === "index" ? cfg.pageTitle : `${cfg.pageTitle} - ${pageName}`) +
      (cfg.pageTitleSuffix ?? "")
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      home?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const slug = fileData.slug ?? ""

    // og:url / twitter:url: the site's address on every page, as in the original site.
    const socialUrl = String(home?.url ?? url.toString().replace(/\/$/, ""))
    // Canonical: the page's own address (the home page for index and 404).
    const canonicalUrl =
      slug === "index" || slug === "404"
        ? url.toString().replace(/\/$/, "")
        : joinSegments(url.toString(), slug)

    const author = fileData.frontmatter?.author ?? home?.author
    const keywords = fileData.frontmatter?.keywords ?? home?.keywords

    // Social image: the page's `image`, else the site's. Dimensions come from
    // `image_width` / `image_height`, else from a "-1024x683" suffix in the file name.
    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const imageSource = fileData.frontmatter?.image ? fileData.frontmatter : home
    const ogImage = imagePath(imageSource?.image)
    const ogImageDefaultPath = ogImage ? `https://${cfg.baseUrl}/${ogImage}` : undefined
    const fromName = ogImage.match(/(\d+)[x×](\d+)/)
    const imageWidth = imageSource?.image_width ?? fromName?.[1]
    const imageHeight = imageSource?.image_height ?? fromName?.[2]

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        {/* og:title / twitter:title are the site name on every page, as in the original site. */}
        <meta property="og:title" content={cfg.pageTitle} />
        <meta property="og:type" content="website" />
        <meta property="twitter:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={cfg.pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && ogImageDefaultPath && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            {imageWidth && imageHeight && (
              <>
                <meta property="og:image:width" content={String(imageWidth)} />
                <meta property="og:image:height" content={String(imageHeight)} />
                <meta property="twitter:image:width" content={String(imageWidth)} />
                <meta property="twitter:image:height" content={String(imageHeight)} />
              </>
            )}
            <meta
              property="og:image:type"
              content={`image/${imageMime(ogImageDefaultPath)}`}
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

        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={String(keywords)} />}
        {author && <meta name="author" content={String(author)} />}
        <link rel="canonical" href={canonicalUrl} />
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


  return Head
}) satisfies QuartzComponentConstructor
