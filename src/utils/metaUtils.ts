type MetaOptions = {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  language?: string
  robots?: string
  includeAuthor?: boolean
  authorName?: string
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
  ogImage?: string
  twitterCard?: string
  twitterSite?: string
  twitterCreator?: string
}

/**
 * Sanitizes text to prevent malformed HTML in meta outputs
 */
const escapeHtml = (value?: string) => {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Builds SEO, Open Graph, and Twitter meta tags based on user input.
 * Only outputs tags for fields that are present (non-empty).
 */
export function buildMetaTags({
  title,
  description,
  keywords,
  canonical,
  language = "en-US",
  robots,
  includeAuthor,
  authorName,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  twitterCard,
  twitterSite,
  twitterCreator,
}: MetaOptions): string {
  const lines: string[] = []
  lines.push("<!-- === Generated Meta Tags === -->")
  // Only include the lang attribute when a non-empty language is provided.
  if (language && language.trim()) {
    lines.push(`<html lang="${escapeHtml(language.trim())}">`)
  } else {
    lines.push(`<html>`) // no lang attribute
  }
  lines.push("<head>")

  if (title?.trim()) {
    lines.push(`<title>${escapeHtml(title!.trim())}</title>`)
  }

  if (description?.trim()) {
    lines.push(`<meta name="description" content="${escapeHtml(description!.trim())}" />`)
  }

  if (keywords?.trim()) {
    lines.push(`<meta name="keywords" content="${escapeHtml(keywords!.trim())}" />`)
  }

  if (robots?.trim()) {
    lines.push(`<meta name="robots" content="${escapeHtml(robots!.trim())}" />`)
  }

  if (canonical?.trim()) {
    lines.push(`<link rel="canonical" href="${escapeHtml(canonical!.trim())}" />`)
  }

  if (includeAuthor && authorName?.trim()) {
    lines.push(`<meta name="author" content="${escapeHtml(authorName!.trim())}" />`)
  }

  if (ogTitle?.trim() || ogDescription?.trim() || ogUrl?.trim() || ogImage?.trim()) {
    lines.push("")
    lines.push("<!-- Open Graph -->")
    if (ogTitle?.trim()) {
      lines.push(`<meta property="og:title" content="${escapeHtml(ogTitle!.trim())}" />`)
    }
    if (ogDescription?.trim()) {
      lines.push(
        `<meta property="og:description" content="${escapeHtml(ogDescription!.trim())}" />`
      )
    }
    if (ogUrl?.trim()) {
      lines.push(`<meta property="og:url" content="${escapeHtml(ogUrl!.trim())}" />`)
    }
    if (ogImage?.trim()) {
      lines.push(`<meta property="og:image" content="${escapeHtml(ogImage!.trim())}" />`)
    }
  }

  if (twitterCard?.trim() || twitterSite?.trim() || twitterCreator?.trim()) {
    lines.push("")
    lines.push("<!-- Twitter Card -->")
    if (twitterCard?.trim()) {
      lines.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard!.trim())}" />`)
    }
    if (twitterSite?.trim()) {
      lines.push(`<meta name="twitter:site" content="${escapeHtml(twitterSite!.trim())}" />`)
    }
    if (twitterCreator?.trim()) {
      lines.push(`<meta name="twitter:creator" content="${escapeHtml(twitterCreator!.trim())}" />`)
    }
  }

  lines.push("")
  lines.push("</head>")
  lines.push("</html>")
  return lines.join("\n").trim()
}