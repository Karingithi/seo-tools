import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Search, Plus, Minus } from "lucide-react"
import Seo from "../components/Seo"
import ToolTitle from "../components/ToolTitle"
import { toolsData, type Tool } from "../data/toolsData"

const FAQ_ITEMS = [
  {
    q: "What are the best free SEO tools for beginners?",
    a:
      "Beginner-friendly SEO tools include meta tag generators, robots.txt and sitemap validators, and simple keyword suggestion tools. Cralite bundles these tools with clean interfaces to help you get started quickly.",
    node: (
      <>
        Beginner-friendly SEO tools include <Link to="/meta-tag-generator" className="text-primary font-normal">meta tag generators</Link>,
        {" "}
        <Link to="/robots-txt-validator" className="text-primary font-normal">robots.txt validators</Link>,
        {" "}and <Link to="/sitemap-checker" className="text-primary font-normal">sitemap validators</Link>,
        {" "}plus simple keyword suggestion tools. Cralite bundles these tools with clean interfaces to help you get started quickly.
      </>
    ),
  },
  {
    q: "How can I generate meta tags for my website for free?",
    a:
      "You can use Cralite’s free Meta Tag Generator to create optimized title tags and meta descriptions with live previews, helping improve click-through rates from search results.",
    node: (
      <>
        You can use Cralite’s free <Link to="/meta-tag-generator" className="text-primary font-normal">Meta Tag Generator</Link> to
        {" "}create optimized title tags and meta descriptions with live previews, helping improve click-through rates from search results.
      </>
    ),
  },
  {
    q: "Which free tools can I use to check or validate my XML sitemap?",
    a:
      "Cralite’s XML Sitemap Checker allows you to inspect sitemap structure, detect errors, and confirm indexing readiness for search engines.",
    node: (
      <>
        Cralite’s <Link to="/sitemap-checker" className="text-primary font-normal">XML Sitemap Checker</Link> allows you to
        {" "}inspect sitemap structure, detect errors, and confirm indexing readiness for search engines.
      </>
    ),
  },
  {
    q: "Are Cralite SEO tools completely free to use?",
    a:
      "Yes. Cralite offers free SEO tools with no sign-up required, making it easy to analyze, optimize, and validate key SEO elements instantly.",
    node: (
      <>
        Yes. Cralite offers free SEO tools with no sign-up required, making it easy to analyze, optimize, and validate key SEO elements instantly.
      </>
    ),
  },
  {
    q: "How do Cralite SEO tools support visibility in AI-powered search results?",
    a:
      "Cralite’s tools help you create clean metadata, structured data, and crawl-friendly configurations that AI-powered search engines rely on to understand and surface content accurately.",
    node: (
      <>
        Cralite’s tools help you create clean metadata, structured data, and crawl-friendly configurations that AI-powered search engines rely on to understand and surface content accurately.
        {" "}Try the <Link to="/schema-builder" className="text-primary font-normal">Schema Builder</Link> for structured data.
      </>
    ),
  },
]

// Structured data
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cralite Digital",
    url: "https://cralite.com",
    logo: "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
    sameAs: ["https://twitter.com/cralitedigital"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://cralite.com",
    name: "Cralite Free Tools",
    publisher: { "@type": "Organization", name: "Cralite Digital" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  },
]

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const filteredTools = useMemo(
    () =>
      toolsData.filter((tool: Tool) =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
        [searchTerm]
      )

  return (
    <>
      {/* SEO */}
      <Seo
        title="Free SEO Tools | No Sign Up Required | Cralite Digital"
        description="Generate meta tags, schema markup, sitemaps, and more. Free SEO tools to help your site rank, including an llms.txt generator for AI visibility."
        keywords="seo tools, meta tag generator, robots.txt, sitemap checker, hreflang, schema"
        url="https://cralite.com/"
        image="https://cralite.com/path/to/preview-image.jpg"
        siteName="Cralite Tools"
      />

      {/* Structured Data */}
      <Helmet>
        {structuredData.map((obj, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(obj)}
          </script>
        ))}
      </Helmet>

      {/* FAQ Icon Rotation (only rotate the plus icon into an X) */}
      <style>{`
        /* rotate only the plus icon when its FAQ is open */
        details[open] summary .faq-plus {
          transform: rotate(45deg);
        }
      `}</style>

      {/* =============================== */}
      {/* SEARCH + TOOLS GRID SECTION */}
      {/* =============================== */}
      <section className="section section--neutral">
        <div className="section-inner flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-gray-200 text-[16px]"
              />
            </div>

            {/* Tools Grid */}
            <div className="tools-grid-cards">
              {filteredTools.map((tool) => (
                <Link key={tool.name} to={tool.link} className="tool-item shadow-sm">
                  <img src={tool.icon} alt={`${tool.name} icon`} className="tool-icon" />
                  <div className="ml-3 flex-1">
                    <ToolTitle>{tool.name}</ToolTitle>
                    {tool.description && (
                      <div className="text-base text-secondary mt-1">
                        {tool.description}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* STEPS SECTION */}
      {/* =============================== */}
      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">
            How to Use Cralite Free Tools
          </h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-8">
            Follow these simple steps to pick a tool, run it with your data, and apply the results to improve your site's SEO.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/pick.svg", import.meta.url).href,
                title: "1. Pick Your Tool",
                desc: "Choose the free tool you need to achieve your task or goal",
              },
              {
                icon: new URL("../assets/icons/info.svg", import.meta.url).href,
                title: "2. Enter Your Info",
                desc: "Enter the required info and run the tool for instant results",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Apply the Insights",
                desc: "Use the reports and insights to scale your business",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="step-icon-outer">
                  <div className="step-icon-circle">
                    <img src={icon} alt={title} className="step-icon-img" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-[17px] text-secondary max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* FAQ SECTION */}
      {/* =============================== */}
      <section className="section section--neutral">
        <div className="section-inner">
          <h2 className="md:text-4xl font-extrabold mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 gap-y-6">
            {FAQ_ITEMS.map((faq, idx) => (
              <details
                key={idx}
                className="border-b border-gray-200 group"
                open={openFaq === idx}
              >
                <summary
                  className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenFaq(openFaq === idx ? null : idx)
                  }}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <Minus className="w-6 h-6 text-secondary transition-transform duration-200" />
                  ) : (
                    <Plus className="w-6 h-6 text-secondary transition-transform duration-200 faq-plus" />
                  )}
                </summary>
                <div className="pb-6 text-[17px] text-secondary">{faq.node}</div>
              </details>
            ))}
          </div>

          <div className="max-w-5xl mx-auto text-center mt-6">
            <p className="text-[17px] text-secondary">
              Have more questions?{" "}
              <Link to="https://cralite.com/contact/" className="text-primary font-normal">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
