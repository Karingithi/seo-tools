import { Helmet } from "react-helmet-async"

interface ToolSchemaProps {
  name: string
  description: string
  url: string
  category?: string
}

/**
 * Emits SoftwareApplication JSON-LD for a single tool page. Google/rich-result
 * eligibility for "free tool" style pages generally keys off this type rather
 * than generic Organization/WebSite blocks, which belong site-wide, not per page.
 */
export default function ToolSchema({
  name,
  description,
  url,
  category = "SEO Tools",
}: ToolSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "WebApplication",
    applicationSubCategory: category,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "Cralite Digital",
      url: "https://cralite.com",
    },
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
