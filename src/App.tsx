import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./layouts/Layout"
import Home from "./pages/Home"
import MetaTagGenerator from "./pages/MetaTagGenerator"
import SchemaBuilder from "./pages/SchemaBuilder"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* === Home Page === */}
        <Route
          path="/"
          element={
            <Layout
              title="Free SEO Tools"
              subtitle="Build, test, and optimize your website with our free SEO utilities — designed to help your pages perform better and rank higher."
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
              title="Meta Tag Generator"
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
              title="Schema Markup Generator"
              subtitle="Generate structured data (JSON-LD) to boost your search visibility and click-through rates."
              showBackLink={true}
            >
              <SchemaBuilder />
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