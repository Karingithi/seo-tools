import { useState } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { toolsData, type Tool } from "../data/toolsData" // 
import ToolTitle from "../components/ToolTitle"
import Seo from "../components/Seo"
import { Helmet } from "react-helmet-async"

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cralite Digital",
  "url": "https://cralite.com",
  "logo": "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
  "sameAs": [
    "https://twitter.com/cralitedigital"
  ]
}

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://cralite.com",
  "name": "Cralite Free Tools",
  "publisher": {
    "@type": "Organization",
    "name": "Cralite Digital"
  }
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter tools dynamically from shared data
  const filtered = toolsData.filter((tool: Tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Seo
        title="Free SEO Tools"
        description="Cralite Free SEO Tools: meta tag, robots, sitemap, hreflang, schema and more. Free, no signup."
        keywords="seo tools, meta tag generator, robots.txt, sitemap checker, hreflang, schema"
        url="https://cralite.com"
        image="https://cralite.com/path/to/preview-image.jpg"
        siteName="Cralite Tools"
      />

      <Helmet>
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteLd)}</script>
      </Helmet>

      <section className="container section flex flex-col lg:flex-row gap-10 px-0 sm:px-0 md:px-0">
        {/* === Search + Tools === */}
        <div className="flex-1">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-[16px] rounded-full bg-white border border-gray-200 search-input"
            />
          </div>

          {/* === Tools Grid === */}
          <div className="tools-grid-cards">
            {filtered.map((tool) => (
              <Link key={tool.name} to={tool.link} className="tool-item shadow-sm">
                <img src={tool.icon} alt={`${tool.name} icon`} className="tool-icon" />
                <div className="ml-3 flex-1">
                  <ToolTitle className="tool-title">{tool.name}</ToolTitle>
                  {tool.description && (
                    <div className="text-base text-gray-700 mt-1 tool-desc">{tool.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* === Banner === */}
        <div className="lg:w-[340px]">
          <div className="sticky top-20">
            <div className="bg-secondary text-white p-6 rounded-2xl shadow-md flex flex-col justify-between h-full border border-[#140a3a]">
            <div>
              <h3 className="text-xl text-primary mb-2 font-semibold">Boost Your Visibility in Search and AI Results Today 🚀</h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Get Expert SEO Services for 10x Traffic Growth.
              </p>
            </div>

            <button className="mt-auto bg-primary text-secondary font-medium px-4 py-2 rounded-full hover:opacity-90 transition">
              Get Started
            </button>
            </div>
          </div>
        </div>
      </section>
      {/* === How To Use Steps === */}
      <section className="section">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8! text-center">How to Use Cralite Free Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-6">
              <div className="flex-none text-[64px] font-extrabold text-primary leading-none">1</div>
              <div>
                <h3 className="text-lg font-semibold mt-1">Choose the free tool</h3>
                <p className="mt-2 text-secondary">Choose the free tool you need to achieve your task or goal</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-none text-[64px] font-extrabold text-primary leading-none">2</div>
              <div>
                <h3 className="text-lg font-semibold mt-1">Enter the required info</h3>
                <p className="mt-2 text-secondary">Enter the required info and run the tool for instant results</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-none text-[64px] font-extrabold text-primary leading-none">3</div>
              <div>
                <h3 className="text-lg font-semibold mt-1">Use the reports</h3>
                <p className="mt-2 text-secondary">Use the reports and insights to scale your business</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
