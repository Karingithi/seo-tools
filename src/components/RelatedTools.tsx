import React from "react"
import { Link } from "react-router-dom"
import { toolsData, type Tool } from "../data/toolsData"
import ToolTitle from "./ToolTitle"

type Props = {
  exclude?: string
  limit?: number
  scrollToTop?: boolean
}

export default function RelatedTools({ exclude, limit = 4 }: Props) {
  const related: Tool[] = toolsData.filter((t) => t.link !== exclude).slice(0, limit)
  const scrollToTop = (e: React.MouseEvent) => {
    // allow navigation to proceed, but ensure viewport jumps to top
    try {
      window.scrollTo(0, 0)
    } catch {}
  }

  return (
    <section className="mt-16">
      <h2 className="mb-8!">Related Tools</h2>
      <div className="tools-grid-cards related-tools-grid">
        {related.map((tool) => (
          <Link key={tool.name} to={tool.link} className="tool-item shadow-sm" onClick={scrollToTop}>
            <img src={tool.icon} alt={tool.name} className="tool-icon" />
            <div className="ml-3 flex-1">
              <ToolTitle className="tool-title">{tool.name}</ToolTitle>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}