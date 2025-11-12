// src/data/toolsData.ts

export type Tool = {
  name: string
  icon: string
  link: string
}

export const toolsData: Tool[] = [
  { name: "Meta Tag Generator", icon: "🔖", link: "/meta-tag-generator" },
  { name: "JSON-LD Schema Generator", icon: "🧩", link: "/schema-builder" },
  { name: "Robots.txt Generator", icon: "🤖", link: "/robots-generator" },
  { name: "Sitemap Generator", icon: "🗺️", link: "/sitemap-generator" },
]
