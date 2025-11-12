import Header from "../components/Header"
import Footer from "../components/Footer"
import Hero from "../components/Hero"
import { ReactNode } from "react"
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-800">
      {/* === HEADER === */}
      <Header />

      {/* === HERO === */}
      <Hero title={title} subtitle={subtitle} showBackLink={showBackLink} />

      {/* === MAIN CONTENT === */}
      <main className="flex-grow bg-[#f8fafc] text-gray-800">
        <div className={`container ${isHome ? "" : "py-12"}`}>{children}</div>
      </main>

      {/* === FOOTER === */}
      <Footer />
    </div>
  )
}
