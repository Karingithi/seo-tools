import Header from "../components/Header"
import Footer from "../components/Footer"
import Hero from "../components/Hero"
import Seo from "../components/Seo"
import { ReactNode, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

interface LayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackLink?: boolean
}

export default function Layout({
  children,
  title = "Free SEO Tools",
  subtitle = "Build, test, and optimize your website with our free SEO utilities — designed to help your pages perform better and rank higher.",
  showBackLink = false,
}: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === "/"

  // If any element with the `edge-to-edge` class exists in the rendered
  // document, skip wrapping children with the central container so pages
  // can opt into full-bleed bands (like the homepage).
  const [domHasEdge, setDomHasEdge] = useState(false)
  useEffect(() => {
    if (isHome) {
      setDomHasEdge(false)
      return
    }
    const found = !!document.querySelector(".edge-to-edge")
    setDomHasEdge(found)
  }, [location.pathname])

  const noContainer = isHome || domHasEdge

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-800">
      <Seo
        title={title}
        description={subtitle}
        keywords="seo tools, free seo tools, meta tag generator, sitemap checker"
      />

      {/* HEADER */}
      <Header />

      {/* HERO */}
      <Hero title={title} subtitle={subtitle} showBackLink={showBackLink} />

      {/* === MAIN CONTENT === */}
      {noContainer ? <>{children}</> : <div className="container py-12">{children}</div>}

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
