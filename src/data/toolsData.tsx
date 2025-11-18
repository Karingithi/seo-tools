// src/data/toolsData.tsx
import React from "react"

// Import SVGs as URLs using Vite's ?url
import MetaIconUrl from "../assets/icons/meta-tags-generator.svg?url"
import RobotIconUrl from "../assets/icons/robots-txt.svg?url"
import ValidatorIconUrl from "../assets/icons/robots-txt-tester.svg?url"
import KeywordIconUrl from "../assets/icons/keyword.svg?url"
import SchemaIconUrl from "../assets/icons/schema.svg?url"
import SitemapIconUrl from "../assets/icons/sitemap.svg?url"
import HreflangIconUrl from "../assets/icons/hreflang-checker.svg?url"

// Type definition for each tool
export type Tool = {
  name: string
  icon: string   // icon is a URL to the SVG file
  link: string
}

// Export the list of all tools
export const toolsData: Tool[] = [
  {
    name: "Meta Tag Generator",
    icon: MetaIconUrl,
    link: "/meta-tag-generator",
  },
  {
    name: "Robots.txt Generator",
    icon: RobotIconUrl,
    link: "/robots-txt-generator",
  },
  {
    name: "Robots.txt Tester and Validator",
    icon: ValidatorIconUrl,
    link: "/robots-txt-validator",
  },
  {
    name: "Keyword Generator",
    icon: KeywordIconUrl,
    link: "/keyword-generator",
  },
  {
    name: "JSON-LD Schema Generator",
    icon: SchemaIconUrl,
    link: "/schema-builder",
  },
  {
    name: "XML Sitemap Checker",
    icon: SitemapIconUrl,
    link: "/sitemap-checker",
  },
  {
    name: "Hreflang Tag Validator",
    icon: HreflangIconUrl,
    link: "/hreflang-validator",
  },
]