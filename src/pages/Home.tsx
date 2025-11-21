import { useState, useEffect } from "react"
import { Search, Unlock, Zap, User, Cpu, Repeat, ShieldCheck, Plus } from "lucide-react"
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

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the best free SEO tools for beginners?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Beginner-friendly tools include meta tag generators, robots.txt and sitemap validators, and simple keyword suggestion tools — Cralite bundles these with clear interfaces to get you started quickly."
      }
    },
    {
      "@type": "Question",
      "name": "How can I generate meta tags for my website for free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the Meta Tag Generator on Cralite: enter your title, description, and open graph fields, then copy the generated tags directly into your site for free."
      }
    },
    {
      "@type": "Question",
      "name": "What is the most reliable free robots.txt generator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A reliable generator creates a clear, minimal robots.txt and validates directives; Cralite's robots tool focuses on correctness and compatibility with major search engines."
      }
    },
    {
      "@type": "Question",
      "name": "Which free tools can I use to check or validate my XML sitemap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use an XML sitemap checker to validate URLs, formats, and discoverability; Cralite's Sitemap Checker verifies structure and common issues for free."
      }
    },
    {
      "@type": "Question",
      "name": "Are Cralite SEO tools completely free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — Cralite tools are free and require no signup, letting you run checks and generate assets instantly without paywalls."
      }
    },
    {
      "@type": "Question",
      "name": "Do your tools help improve visibility in AI search results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — tools focused on semantic markup, structured data, and complete metadata can improve how AI-driven systems understand and surface your content."
      }
    },
    {
      "@type": "Question",
      "name": "How does Cralite help with semantic coverage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cralite helps you add structured data and comprehensive metadata so AI and search engines better understand the topics and entities on your pages, improving semantic coverage."
      }
    },
    {
      "@type": "Question",
      "name": "Can these tools help with long-tail keyword optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — use the keyword and content tools to discover long-tail phrases and optimize metadata and schema for those queries to capture more specific search intent."
      }
    }
  ]
}
export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter tools dynamically from shared data
  const filtered = toolsData.filter((tool: Tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ensure only one FAQ <details> is open at a time
  useEffect(() => {
    const details = Array.from(document.querySelectorAll('details')) as HTMLDetailsElement[]

    // Initialize aria-expanded on summaries and ensure only one open
    details.forEach((d) => {
      const summary = d.querySelector('summary') as HTMLElement | null
      if (summary) summary.setAttribute('aria-expanded', d.open ? 'true' : 'false')
    })

    const onToggle = (e: Event) => {
      const target = e.target as HTMLDetailsElement
      if (!target.open) {
        const summary = target.querySelector('summary') as HTMLElement | null
        if (summary) summary.setAttribute('aria-expanded', 'false')
        return
      }

      details.forEach(d => {
        if (d !== target) {
          d.open = false
          const s = d.querySelector('summary') as HTMLElement | null
          if (s) s.setAttribute('aria-expanded', 'false')
        } else {
          const s = d.querySelector('summary') as HTMLElement | null
          if (s) s.setAttribute('aria-expanded', 'true')
        }
      })
    }

    details.forEach(d => d.addEventListener('toggle', onToggle))
    return () => details.forEach(d => d.removeEventListener('toggle', onToggle))
  }, [/* run after mount */])

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
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <style>{`
        /* Rotate the plus icon when its details is open */
        details summary svg {
          transition: transform .18s ease;
        }
        details[open] summary svg {
          transform: rotate(45deg);
        }
      `}</style>

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
      </section>

      {/* === How To Use Steps === */}
      <section className="section">
        <div className="container">
          <h2 className="md:text-4xl font-extrabold mb-8! text-center">How to Use Cralite Free Tools</h2>

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
      {/* === Why Use Cralite Free SEO Tools? === */}
      <section className="section">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">Why Use Cralite Free SEO Tools?</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-8">
            Choosing the right SEO tools can be overwhelming. Cralite brings together fast, reliable, and easy-to-use
            solutions built for modern search and AI-driven results. Here is what makes Cralite different:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <Unlock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">100% Free — No Signup</h3>
              <p className="text-sm text-secondary">Use every tool instantly without accounts, limits, or paywalls.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Instant, Accurate Results</h3>
              <p className="text-sm text-secondary">Run checks, generate metadata, and uncover insights in seconds.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">For Beginners & Experts</h3>
              <p className="text-sm text-secondary">Clear interfaces for new users, with pro-level outputs for experts.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Built for AI Search Visibility</h3>
              <p className="text-sm text-secondary">Tools help your site appear more effectively in AI-driven search experiences.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Covers Full SEO Workflow</h3>
              <p className="text-sm text-secondary">Optimize metadata, generate schema, validate files, review sitemaps, and research keywords.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Reliable & Up-to-date</h3>
              <p className="text-sm text-secondary">Continuously updated to match modern search standards and real performance needs.</p>
            </div>
          </div>
        </div>
      </section>
            <section className="section bg-gray-50">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">Frequently Asked Questions</h2>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <details open className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>What are the best free SEO tools for beginners?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Beginner-friendly tools include meta tag generators, robots.txt and sitemap validators, and simple keyword suggestion tools — Cralite bundles these with clear interfaces to get you started quickly.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>How can I generate meta tags for my website for free?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Use the Meta Tag Generator on Cralite: enter your title, description, and open graph fields, then copy the generated tags directly into your site for free.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>What is the most reliable free robots.txt generator?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">A reliable generator creates a clear, minimal robots.txt and validates directives; Cralite's robots tool focuses on correctness and compatibility with major search engines.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>Which free tools can I use to check or validate my XML sitemap?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Use an XML sitemap checker to validate URLs, formats, and discoverability; Cralite's Sitemap Checker verifies structure and common issues for free.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>Are Cralite SEO tools completely free to use?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Yes — Cralite tools are free and require no signup, letting you run checks and generate assets instantly without paywalls.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>Do your tools help improve visibility in AI search results?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Yes — tools focused on semantic markup, structured data, and complete metadata can improve how AI-driven systems understand and surface your content.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>How does Cralite help with semantic coverage?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Cralite helps you add structured data and comprehensive metadata so AI and search engines better understand the topics and entities on your pages, improving semantic coverage.</div>
                    </details>

                    <details className="border-b border-gray-200">
                      <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-2xl md:text-2xl font-semibold text-gray-800">
                        <span>Can these tools help with long-tail keyword optimization?</span>
                        <Plus className="w-6 h-6 text-gray-700" />
                      </summary>
                      <div className="pb-6 text-sm text-secondary">Yes — use the keyword and content tools to discover long-tail phrases and optimize metadata and schema for those queries to capture more specific search intent.</div>
                    </details>
                  </div>

                  <div className="max-w-5xl mx-auto text-center mt-6">
                    <p className="text-sm text-secondary">
                      Have more questions? We'd love to hear from you. <Link to="/contact" className="font-medium text-primary">Contact us</Link>.
                    </p>
                  </div>
            </section>
    </>
  )
}