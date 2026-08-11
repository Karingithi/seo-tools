import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Layout from "./layouts/Layout"
import Home from "./pages/Home"
import MetaTagGenerator from "./pages/MetaTagGenerator"
import KeywordGenerator from "./pages/KeywordGenerator"
import RobotsTxtGenerator from "./pages/RobotsTxtGenerator"
import RobotsTxtValidator from "./pages/RobotsTxtValidator"
import SitemapChecker from "./pages/SitemapChecker"
import CanonicalTagGenerator from "./pages/CanonicalTagGenerator"
import KeywordDensityChecker from "./pages/KeywordDensityChecker"
import LlmsTxtGenerator from "./pages/LlmsTxtGenerator"
import SchemaBuilder from "./pages/SchemaBuilder"
import HreflangGenerator from "./pages/HreflangGenerator"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Router basename="/tools">
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
            <Layout
              title="Free Keyword Generator"
              subtitle="Generate keyword suggestions and variations."
              showBackLink={true}
            >
              <KeywordGenerator />
            </Layout>
          }
        />

        {/* === Robots.txt Generator === */}
        <Route
          path="/robots-txt-generator"
          element={
            <Layout
              title="Free Robots.txt Generator"
              subtitle="Create a clean, optimized robots.txt file that guides search engines, improves crawling efficiency, and protects sensitive pages. Simple, fast, and ready to copy."
              showBackLink={true}
            >
              <RobotsTxtGenerator />
            </Layout>
          }
        />

        {/* === Robots.txt Validator === */}
        <Route
          path="/robots-txt-validator"
          element={
            <Layout
              title="Free robots.txt Validator and Testing Tool"
              subtitle="Scan your robots.txt file, detect errors, and ensure search engines can crawl your site correctly and safely."
              showBackLink={true}
            >
              <RobotsTxtValidator />
            </Layout>
          }
        />

        {/* === Sitemap Checker === */}
        <Route
          path="/sitemap-checker"
          element={
            <Layout
              title="Free XML Sitemap Checker"
              subtitle="Instantly validate and analyze your XML sitemaps for SEO performance"
              showBackLink={true}
            >
              <SitemapChecker />
            </Layout>
          }
        />

        {/* === Canonical Tag Generator === */}
        <Route
          path="/canonical-tag-generator"
          element={
            <Layout
              title="Free Canonical Tag Generator"
              subtitle="Generate clean canonical tags to signal the preferred URL version for indexing."
              showBackLink={true}
            >
              <CanonicalTagGenerator />
            </Layout>
          }
        />

        {/* === Keyword Density Checker === */}
        <Route
          path="/keyword-density-checker"
          element={
            <Layout
              title="Free Keyword Density Checker"
              subtitle="Analyze keyword frequency, phrase usage, and density distribution for better on-page SEO."
              showBackLink={true}
            >
              <KeywordDensityChecker />
            </Layout>
          }
        />

        {/* === llms.txt Generator === */}
        <Route
          path="/llms-txt-generator"
          element={
            <Layout
              title="Free llms.txt Generator"
              subtitle="Generate a clean llms.txt file to help AI tools understand your site's structure, brand, and key resources."
              showBackLink={true}
            >
              <LlmsTxtGenerator />
            </Layout>
          }
        />

        {/* === Hreflang Tag Generator === */}
        <Route
          path="/hreflang-generator"
          element={
            <Layout
              title="Free Hreflang Tag Generator"
              subtitle="Build valid, reciprocal hreflang tags for multilingual and multi-region sites. Export as HTML link tags or sitemap XML."
              showBackLink={true}
            >
              <HreflangGenerator />
            </Layout>
          }
        />

        {/* === 404 Fallback === */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Router>
  )
}
