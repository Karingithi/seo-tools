import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./layouts/Layout"
import Home from "./pages/Home"
import MetaTagGenerator from "./pages/MetaTagGenerator"
import SchemaBuilder from "./pages/SchemaBuilder"
import KeywordGenerator from "./pages/KeywordGenerator"
import RobotsTxtGenerator from "./pages/RobotsTxtGenerator"
import RobotsTxtValidator from "./pages/RobotsTxtValidator"
import SitemapChecker from "./pages/SitemapChecker"
import HreflangValidator from "./pages/HreflangValidator"
import LlmsTxtGenerator from "./pages/LlmsTxtGenerator"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* === Home Page === */}
        <Route
          path="/"
          element={
            <Layout
              title="Free SEO Tools to Boost Visibility, Rankings, and Business Growth"
              subtitle="Analyze your website, optimize metadata, generate clean schema, validate technical SEO files, find high value keywords, and strengthen your visibility in AI search with our powerful free tools. No sign up required."
              >
              <Home />
            </Layout>
          }
        />

        {/* === Meta Tag Generator === */}
        <Route
          path="/meta-tag-generator"
          element={
            <Layout
              title="Free Meta Tag Generator"
              subtitle="Create optimized meta title, description, and keywords for your pages. View a live Google SERP-style preview and copy clean HTML instantly."
              showBackLink={true}
            >
              <MetaTagGenerator />
            </Layout>
          }
        />

        {/* === Schema Builder === */}
        <Route
          path="/schema-builder"
          element={
            <Layout
              title="Free Schema Markup Generator"
              subtitle="Generate structured data (JSON-LD) to boost your search visibility and click-through rates."
              showBackLink={true}
            >
              <SchemaBuilder />
            </Layout>
          }
        />

        {/* === Keyword Generator === */}
        <Route
          path="/keyword-generator"
          element={
            <Layout title="Free Keyword Generator" subtitle="Generate keyword suggestions and variations." showBackLink={true}>
              <KeywordGenerator />
            </Layout>
          }
        />

        {/* === Robots.txt Generator === */}
        <Route
          path="/robots-txt-generator"
          element={
            <Layout title="Free Robots.txt Generator" subtitle="Create a clean, optimized robots.txt file that guides search engines, improves crawling efficiency, and protects sensitive pages. Simple, fast, and ready to copy." showBackLink={true}>
              <RobotsTxtGenerator />
            </Layout>
          }
        />

        {/* === Robots.txt Validator === */}
        <Route
          path="/robots-txt-validator"
          element={
            <Layout title="Free Robots.txt Validator" subtitle="Scan your robots.txt file, detect errors, and ensure search engines can crawl your site correctly and safely." showBackLink={true}>
              <RobotsTxtValidator />
            </Layout>
          }
        />

        {/* === Sitemap Checker === */}
        <Route
          path="/sitemap-checker"
          element={
            <Layout title="Sitemap Checker" subtitle="Validate and inspect XML sitemaps." showBackLink={true}>
              <SitemapChecker />
            </Layout>
          }
        />

        {/* === Hreflang Validator === */}
        <Route
          path="/hreflang-validator"
          element={
            <Layout title="Hreflang Validator" subtitle="Validate and generate hreflang link tags." showBackLink={true}>
              <HreflangValidator />
            </Layout>
          }
        />

        {/* === LLMs.txt Generator === */}
        <Route
          path="/llms-txt-generator"
          element={
            <Layout
              title="LLMs.txt Generator"
              subtitle="Make your website AI-friendly in seconds. Generate LLM.txt files that help AI models like ChatGPT, Claude, and Perplexity understand and cite your content accurately."
              showBackLink={true}
            >
              <LlmsTxtGenerator />
            </Layout>
          }
        />

        {/* === 404 Fallback === */}
        <Route
          path="*"
          element={
            <Layout
              title="Page Not Found"
              subtitle="Oops! The page you’re looking for doesn’t exist."
            >
              <div className="text-center py-24">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
                <p className="text-gray-500">We couldn’t find that page.</p>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}