import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""

  return (
    <header>
      <div id="logo">
        <a href="/">
          <img src="/assets/logo/logo-ak.svg" width="121" height="92" alt="" />
        </a>
      </div>

      <div class="topnav" id="menu">
        <a id="link_index" class={slug === "index" ? "active" : ""} href="/">index</a>
        <a id="link_about" class={slug === "about" ? "active" : ""} href="/about">about</a>
        <a id="link_contact" class={slug === "contact" ? "active" : ""} href="/contact">contact</a>
      </div>

      <div class="togglenav" role="button" tabindex={0} aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>
  )
}

export default (() => Header) satisfies QuartzComponentConstructor
