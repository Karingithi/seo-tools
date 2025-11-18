export const buildRobotsTxt = (directives: { 
  userAgent?: string
  allow?: string
  disallow?: string
  sitemap?: string
}): string => {
  const lines = [`User-agent: ${directives.userAgent || "*"}`]

  if (directives.disallow) {
    lines.push(`Disallow: ${directives.disallow}`)
  }

  if (directives.allow) {
    lines.push(`Allow: ${directives.allow}`)
  }

  if (directives.sitemap) {
    lines.push(`Sitemap: ${directives.sitemap}`)
  }

  return lines.join("\n")
}

export const validateDirective = (value: string): boolean => {
  const regex = /^(User-agent:|Allow:|Disallow:)\s.*/i
  return regex.test(value)
}
