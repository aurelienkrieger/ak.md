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

export default (() => Header) satisfies QuartzComponentConstructor
