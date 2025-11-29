import { Helmet } from "react-helmet-async"

interface SeoProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  siteName?: string
  locale?: string
}

export default function Seo({
  title,
  description,
  keywords,
  image = "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
  url = "https://cralite.com",
  siteName = "Cralite Digital",
  locale = "en_US",
}: SeoProps) {
  const fullTitle = `${title} | Cralite Digital`
  // Build breadcrumb JSON-LD: Home -> (SEO Tools) -> Page
  let breadcrumbJsonLd: Record<string, any> | null = null
  try {
    const u = new URL(url)
    const path = u.pathname || "/"
    const items: Array<{ "@type": string; position: number; name: string; item: string }> = []

    // Home
    items.push({ "@type": "ListItem", position: 1, name: "Home", item: `${u.origin}` })

    // If this is under /tools, add the SEO Tools container as the second item
    if (path.startsWith("/tools") || path.includes("/tools/")) {
      items.push({ "@type": "ListItem", position: 2, name: "SEO Tools", item: `${u.origin}/tools` })

      // Page label — prefer provided title, fallback to last path segment
      const last = title || decodeURIComponent(path.replace(/\/$/, "").split("/").pop() || "")
      items.push({ "@type": "ListItem", position: 3, name: last, item: url })
    } else {
      // Simple 2-part breadcrumb: Home -> Page
      const pageLabel = title || u.pathname.replace(/\//g, " ").trim() || "Page"
      items.push({ "@type": "ListItem", position: 2, name: pageLabel, item: url })
    }

    breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    }
  } catch (e) {
    breadcrumbJsonLd = null
  }

  return (
    <Helmet>
      {/* === Basic Meta === */}
       <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {/* === Open Graph === */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* === Twitter Card === */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@cralitedigital" />

      {/* Canonical link */}
      <link rel="canonical" href={url} />

      {/* === Favicon === */}
    <link rel="icon" type="image/svg+xml" href="https://cralite.com/wp-content/uploads/2023/12/Cralite_Favicon.svg" />
    <link rel="apple-touch-icon" sizes="152x152" href="https://cralite.com/wp-content/uploads/2023/12/Cralite_Favicon.svg" />
    <link rel="apple-touch-icon" sizes="120x120" href="https://cralite.com/wp-content/uploads/2023/12/Cralite_Favicon.svg" />
    <link rel="apple-touch-icon" sizes="76x76" href="https://cralite.com/wp-content/uploads/2023/12/Cralite_Favicon.svg" />
    <link rel="apple-touch-icon" href="https://cralite.com/wp-content/uploads/2023/12/Cralite_Favicon.svg" />
      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
    </Helmet>
  )
}