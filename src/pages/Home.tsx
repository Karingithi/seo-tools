import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Search, Plus, Minus } from "lucide-react"
import Seo from "../components/Seo"
import ToolTitle from "../components/ToolTitle"
import { toolsData, type Tool } from "../data/toolsData"

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
    mainEntity: [
      {
        "@type": "Question",
        name: "What are the best free SEO tools for beginners?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Beginner-friendly tools include meta tag generators, robots.txt and sitemap validators, and simple keyword suggestion tools — Cralite bundles these with clear interfaces to get you started quickly.",
        },
      },
      {
        "@type": "Question",
        name: "How can I generate meta tags for my website for free?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Use the Meta Tag Generator on Cralite: enter your title, description, and open graph fields, then copy the generated tags directly into your site for free.",
        },
      },
      {
        "@type": "Question",
        name: "What is the most reliable free robots.txt generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "A reliable generator creates a clear, minimal robots.txt and validates directives; Cralite's robots tool focuses on correctness and compatibility with major search engines.",
        },
      },
      {
        "@type": "Question",
        name: "Which free tools can I use to check or validate my XML sitemap?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Use an XML sitemap checker to validate URLs, formats, and discoverability; Cralite's Sitemap Checker verifies structure and common issues for free.",
        },
      },
      {
        "@type": "Question",
        name: "Are Cralite SEO tools completely free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes — Cralite tools are free and require no signup, letting you run checks and generate assets instantly without paywalls.",
        },
      },
      {
        "@type": "Question",
        name: "Do your tools help improve visibility in AI search results?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes — tools focused on semantic markup, structured data, and complete metadata can improve how AI-driven systems understand and surface your content.",
        },
      },
      {
        "@type": "Question",
        name: "How does Cralite help with semantic coverage?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Cralite helps you add structured data and comprehensive metadata so AI and search engines better understand the topics and entities on your pages, improving semantic coverage.",
        },
      },
      {
        "@type": "Question",
        name: "Can these tools help with long-tail keyword optimization?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes — use the keyword and content tools to discover long-tail phrases and optimize metadata and schema for those queries to capture more specific search intent.",
        },
      },
    ],
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
        title="Free SEO Tools"
        description="Cralite Free SEO Tools: meta tag, robots, sitemap, hreflang, schema and more. Free, no signup."
        keywords="seo tools, meta tag generator, robots.txt, sitemap checker, hreflang, schema"
        url="https://cralite.com"
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
                icon: new URL("../assets/icons/enter.svg", import.meta.url).href,
                title: "1. Pick Your Tool",
                desc: "Choose the free tool you need to achieve your task or goal",
              },
              {
                icon: new URL("../assets/icons/validate.svg", import.meta.url).href,
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
                <p className="text-lg text-secondary max-w-xs mx-auto">{desc}</p>
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
            {structuredData[2]?.mainEntity?.map((faq, idx) => (
              <details
                key={idx}
                className="border-b border-gray-200 group"
                open={openFaq === idx}
              >
                <summary
                  className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl font-semibold text-secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenFaq(openFaq === idx ? null : idx)
                  }}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.name}</span>
                  {openFaq === idx ? (
                    <Minus className="w-6 h-6 text-secondary transition-transform duration-200" />
                  ) : (
                    <Plus className="w-6 h-6 text-secondary transition-transform duration-200 faq-plus" />
                  )}
                </summary>
                <div className="pb-6 text-lg text-secondary">{faq.acceptedAnswer.text}</div>
              </details>
            ))}
          </div>

          <div className="max-w-5xl mx-auto text-center mt-6">
            <p className="text-lg text-secondary">
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
