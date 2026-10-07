import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

/** 404 page, same markup as the original site's 404.html. */
const NotFound: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <article class="popover-hint">
      <div class="markdown-preview-view markdown-rendered">
        <section id="intro">
          <h3>404 - Page not found</h3>
          <p>
            Return to{" "}
            <a class="bluelink" href="/">
              index
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
