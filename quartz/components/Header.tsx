import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * Site header: logo + navigation.
 *
 * The menu is built from the content itself. Any page with `nav: <number>` in
 * its frontmatter appears in the menu, ordered by that number. The label is the
 * file name (index, about, contact) unless `nav_label` is set.
 */
const navLabel = (slug: string, frontmatter?: Record<string, unknown>): string =>
  String(frontmatter?.nav_label ?? slug.split("/").pop() ?? slug)

// Opens/closes the mobile menu (the burger is hidden above 600px by CSS).
const toggleScript = `
(function () {
  function toggle() {
    var menu = document.getElementById("menu");
    if (menu) menu.classList.toggle("responsive");
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".togglenav")) toggle();
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest(".togglenav")) {
      e.preventDefault();
      toggle();
    }
  });
})();
`

const Header: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const current = fileData.slug ?? ""

  const items = allFiles
    .filter((f) => f.slug && f.frontmatter?.nav !== undefined)
    .sort((a, b) => Number(a.frontmatter!.nav) - Number(b.frontmatter!.nav))
    .map((f) => {
      const slug = f.slug as string
      const label = navLabel(slug, f.frontmatter as Record<string, unknown>)
      return { label, id: `link_${label}`, href: slug === "index" ? "/" : `/${slug}`, active: slug === current }
    })

  return (
    <header>
      <div id="logo">
        <a href="/">
          <img src="/assets/logo/logo-ak.svg" width="121" height="92" alt="" />
        </a>
      </div>

      <div class="topnav" id="menu">
        {items.map((item) => (
          <a id={item.id} class={item.active ? "active" : undefined} href={item.href}>
            {item.label}
          </a>
        ))}
      </div>

      <div class="togglenav" role="button" tabIndex={0} aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: toggleScript }} />
    </header>
  )
}

export default (() => Header) satisfies QuartzComponentConstructor
