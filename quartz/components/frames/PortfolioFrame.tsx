import { PageFrame, PageFrameProps } from "./types"
import { QuartzComponent, QuartzComponentProps } from "../types"
import { pageKind, restructure } from "../../util/portfolio"
import { Root } from "hast"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * Frame for the portfolio: header + content, nothing else (no sidebars,
 * footer rule or backlinks). The page body is rebuilt from the Markdown
 * outline by `util/portfolio.ts` so the DOM matches the original site.
 */
export const PortfolioFrame: PageFrame = {
  name: "portfolio",
  render({ componentData, pageBody: Content }: PageFrameProps) {
    const Body: QuartzComponent = (props: QuartzComponentProps) => {
      const { slug, frontmatter } = props.fileData
      const tree = restructure(props.tree as Root, pageKind(slug, frontmatter?.type))
      return <Content {...props} tree={tree} />
    }

    // Quartz's base stylesheet lays #quartz-body out as a 3-column grid
    // (sidebar | content | sidebar) on screens wider than 800px. This frame has
    // no sidebars, so it spans every column itself instead of relying on CSS
    // overrides elsewhere to switch the grid off.
    return (
      <div
        class="center portfolio-root"
        style={{ gridColumn: "1 / -1", minWidth: 0, maxWidth: "none", margin: 0 }}
      >
        <Header {...componentData} />
        <Body {...componentData} />
      </div>
    )
  },
}
