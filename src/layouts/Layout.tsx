import Header from "../components/Header"
import Footer from "../components/Footer"
import Hero from "../components/Hero"
import CursorRing from "../components/CursorRing"
import { ReactNode, useEffect } from "react"
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
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-800">
      <CursorRing />

      {/* HEADER */}
      <Header />

      {/* HERO */}
      <Hero title={title} subtitle={subtitle} showBackLink={showBackLink} />

      {/* MAIN CONTENT — always full width */}
      {children}

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
