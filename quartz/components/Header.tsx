import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const active = slug === "index" ? "index" : slug === "about" ? "about" : slug === "contact" ? "contact" : ""

  return (
    <header class="site-header">
      <a class="site-logo" href="/" aria-label="Aurélien Krieger — home">
        <img src="/assets/logo/logo-ak.svg" width="121" height="92" alt="" />
      </a>

      <nav class="site-nav site-nav-desktop" aria-label="Primary navigation">
        <a class={active === "index" ? "active" : ""} href="/">index</a>
        <a class={active === "about" ? "active" : ""} href="/about">about</a>
        <a class={active === "contact" ? "active" : ""} href="/contact">contact</a>
      </nav>

      <details class="site-nav-mobile">
        <summary aria-label="Open navigation">
          <span></span>
          <span></span>
          <span></span>
        </summary>
        <nav aria-label="Mobile navigation">
          <a class={active === "index" ? "active" : ""} href="/">index</a>
          <a class={active === "about" ? "active" : ""} href="/about">about</a>
          <a class={active === "contact" ? "active" : ""} href="/contact">contact</a>
        </nav>
      </details>

      {children.length > 0 && <div class="site-header-extras">{children}</div>}
    </header>
  )
}

Header.afterDOMLoaded = `
function prepareProjectPage() {
  if (!document.body.dataset.slug?.startsWith("work/")) return
  const article = document.querySelector("article")
  if (!article || article.querySelector(".project-layout")) return

  const marker = Array.from(article.children).find((el) => el.id === "images")
  if (!marker) return

  const description = document.createElement("div")
  description.className = "project-description"
  const images = document.createElement("div")
  images.className = "project-images"

  let imageSection = false
  const imageNodes = []

  for (const node of Array.from(article.children)) {
    if (node === marker) {
      imageSection = true
      continue
    }
    if (imageSection) imageNodes.push(node)
    else description.appendChild(node)
  }

  for (let i = 0; i < imageNodes.length; i++) {
    const node = imageNodes[i]
    const img = node.querySelector?.("img")
    if (!img) continue

    const figure = document.createElement("figure")
    figure.appendChild(img)

    const next = imageNodes[i + 1]
    const caption = next?.querySelector?.("em")
    if (caption) {
      const figcaption = document.createElement("figcaption")
      figcaption.textContent = caption.textContent ?? ""
      figure.appendChild(figcaption)
      i++
    }
    images.appendChild(figure)
  }

  const layout = document.createElement("div")
  layout.className = "project-layout"
  layout.append(description, images)
  article.appendChild(layout)
}

function prepareAboutPage() {
  if (document.body.dataset.slug !== "about") return
  const article = document.querySelector("article")
  if (!article || article.dataset.prepared === "true") return

  const expertise = article.querySelector(":scope > #expertise")
  const clients = article.querySelector(":scope > #selected-clients--partners")
  const academic = article.querySelector(":scope > #academic-background")

  function makeGrid(start, end, gridClass, itemClass) {
    if (!start) return
    const grid = document.createElement("div")
    grid.className = gridClass

    let node = start.nextElementSibling
    while (node && node !== end) {
      const current = node
      node = node.nextElementSibling
      if (current.tagName === "H3") {
        const item = document.createElement("div")
        item.className = itemClass
        item.appendChild(current)
        if (node && node !== end) {
          const companion = node
          node = node.nextElementSibling
          item.appendChild(companion)
        }
        grid.appendChild(item)
      }
    }
    start.insertAdjacentElement("afterend", grid)
  }

  makeGrid(expertise, clients, "expertise-grid", "expertise-item")
  makeGrid(clients, academic, "clients-grid", "clients-item")
  article.dataset.prepared = "true"
}

function preparePortfolioLayout() {
  prepareProjectPage()
  prepareAboutPage()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", preparePortfolioLayout)
} else {
  preparePortfolioLayout()
}
document.addEventListener("nav", preparePortfolioLayout)
`

export default (() => Header) satisfies QuartzComponentConstructor
