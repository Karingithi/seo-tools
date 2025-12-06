// Import SVGs as URLs using Vite's ?url
import MetaIconUrl from "../assets/icons/meta-tags-generator.svg?url"
import RobotIconUrl from "../assets/icons/robots-txt.svg?url"
import ValidatorIconUrl from "../assets/icons/robots-txt-tester.svg?url"
import KeywordIconUrl from "../assets/icons/keyword.svg?url"
import SchemaIconUrl from "../assets/icons/schema.svg?url"
import SitemapIconUrl from "../assets/icons/sitemap.svg?url"
import HreflangIconUrl from "../assets/icons/hreflang-checker.svg?url"
import LlmIconUrl from "../assets/icons/llms-txt.svg?url"

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
    name: "Free Keyword Generator",
    icon: KeywordIconUrl,
    link: "/keyword-generator",
    description: "Generate keyword ideas and variations for content planning.",
  },
  {
    name: "JSON-LD Schema Generator",
    icon: SchemaIconUrl,
    link: "/schema-builder",
    description: "Create JSON-LD structured data (schema) for rich results.",
  },
  {
    name: "XML Sitemap Checker",
    icon: SitemapIconUrl,
    link: "/sitemap-checker",
    description: "Inspect and validate XML sitemaps for indexing health.",
  },
  {
    name: "Hreflang Tag Validator",
    icon: HreflangIconUrl,
    link: "/hreflang-validator",
    description: "Validate hreflang tags to ensure correct language/country targeting.",
  },
  {
    name: "LLMs.txt Generator",
    icon: LlmIconUrl,
    link: "/llms-txt-generator",
    description: "Generate an llms.txt to control how LLM crawlers access your site.",
  },
  {
    name: "Header Tag Structure Viewer",
    icon: SchemaIconUrl,
    link: "/header-tag-structure-viewer",
    description: "Inspect page heading tag hierarchy (H1–H6) from HTML or a URL.",
  },
]