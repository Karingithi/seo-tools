// Import SVGs as URLs using Vite's ?url
import MetaIconUrl from "../assets/icons/meta-tags-generator.svg?url"
import RobotIconUrl from "../assets/icons/robots-txt.svg?url"
import ValidatorIconUrl from "../assets/icons/robots-txt-tester.svg?url"
import KeywordIconUrl from "../assets/icons/keyword.svg?url"
import SchemaIconUrl from "../assets/icons/schema.svg?url"
import SitemapIconUrl from "../assets/icons/sitemap.svg?url"
import CanonicalIconUrl from "../assets/icons/canonical-tag-generator.svg?url"
import KeywordDensityIconUrl from "../assets/icons/keyword-density-checker.svg?url"
import LlmsTxtIconUrl from "../assets/icons/llms-txt.svg?url"

// Type definition for each tool
export type Tool = {
  name: string
  icon: string   // icon is a URL to the SVG file
  link: string
  description?: string
}

// Export the list of all tools
export const toolsData: Tool[] = [
  {
    name: "Meta Tag Generator",
    icon: MetaIconUrl,
    link: "/meta-tag-generator",
    description: "Create optimized title, description and meta tags with live preview.",
  },
  {
    name: "Robots.txt Generator",
    icon: RobotIconUrl,
    link: "/robots-txt-generator",
    description: "Build a clean robots.txt to control crawler access.",
  },
  {
    name: "Robots.txt Tester and Validator",
    icon: ValidatorIconUrl,
    link: "/robots-txt-validator",
    description: "Validate robots.txt files and detect syntax or access issues.",
  },
  {
    name: "Schema Markup Generator",
    icon: SchemaIconUrl,
    link: "/schema-builder",
    description: "Create JSON-LD structured data (schema) for rich results.",
  },
  {
    name: "Free Keyword Generator",
    icon: KeywordIconUrl,
    link: "/keyword-generator",
    description: "Generate keyword ideas and variations for content planning.",
  },
  {
    name: "XML Sitemap Checker",
    icon: SitemapIconUrl,
    link: "/sitemap-checker",
    description: "Inspect and validate XML sitemaps for indexing health.",
  },
  {
    name: "Canonical Tag Generator",
    icon: CanonicalIconUrl,
    link: "/canonical-tag-generator",
    description: "Generate canonical link tags to define preferred URLs for indexing.",
  },
  {
    name: "Keyword Density Checker",
    icon: KeywordDensityIconUrl,
    link: "/keyword-density-checker",
    description: "Analyze keywords, phrases, and density from your content.",
  },
  {
    name: "LLMs.txt Generator",
    icon: LlmsTxtIconUrl,
    link: "/llms-txt-generator",
    description: "Generate an llms.txt file so AI tools accurately understand your site.",
  },
]
