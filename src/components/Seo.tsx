import { Helmet } from "react-helmet-async"

interface SeoProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
}

export default function Seo({
  title,
  description,
  keywords,
  image = "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
  url = "https://cralite.com",
}: SeoProps) {
  const fullTitle = `${title} | Free SEO Tools by Cralite`

  return (
    <Helmet>
      {/* === Basic Meta === */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* === Open Graph === */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />

      {/* === Twitter Card === */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* === Favicon === */}
      <link rel="icon" href="https://cralite.com/favicon.ico" />
    </Helmet>
  )
}
