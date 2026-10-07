import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

/**
 * 404 page, same markup as the original site's 404.html.
 * The script redirects wrongly-cased URLs (/About → /about) when the page exists.
 */
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
      <script
        dangerouslySetInnerHTML={{
          __html: `
          if (typeof fetchData !== "undefined") {
            fetchData.then(function(index) {
              var pathname = window.location.pathname.replace(/^\\/+|\\/+$/g, "").replace(/\\.html$/, "").replace(/\\/index$/, "");
              var lowered = pathname.toLowerCase();
              if (lowered !== pathname && index[lowered] != null) {
                window.location.replace("/" + lowered);
              }
            });
          }
          `,
        }}
      />
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
