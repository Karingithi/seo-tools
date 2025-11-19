// src/pages/SchemaBuilder.tsx
import { useState, useMemo, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import DatePickerInput from "../components/DatePickerInput"

import Seo from "../components/Seo"

import copyIconUrl from "../assets/icons/copy.svg?url"
import downloadIconUrl from "../assets/icons/download.svg?url"
import resetIconUrl from "../assets/icons/reset.svg?url"
import googleIconUrl from "../assets/icons/google.svg?url"

import type { Tool } from "../data/toolsData"
import { toolsData } from "../data/toolsData"
import RelatedTools from "../components/RelatedTools"

import { downloadText, copyToClipboard } from "../utils"

export default function SchemaBuilder(): JSX.Element {
  const [type, setType] = useState<string>("Article")
  const [fields, setFields] = useState<Record<string, string>>({ articleType: "Article" })

  const [copied, setCopied] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)
  const [testMsgVisible, setTestMsgVisible] = useState(false)

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [articleTypeOpen, setArticleTypeOpen] = useState(false)
  const [authorTypeOpen, setAuthorTypeOpen] = useState(false)

  // Images list for Article schema
  const [images, setImages] = useState<string[]>([""])

  // Publish / Modified date pickers
  const [published, setPublished] = useState<Date | undefined>(undefined)
  const [modified, setModified] = useState<Date | undefined>(undefined)

  // Keep published state in sync if fields.datePublished changes externally
  useEffect(() => {
    if (fields.datePublished) {
      const d = new Date(fields.datePublished)
      if (!isNaN(d.getTime())) setPublished(d)
    }
  }, [fields.datePublished])

  useEffect(() => {
    if (fields.dateModified) {
      const d = new Date(fields.dateModified)
      if (!isNaN(d.getTime())) setModified(d)
    }
  }, [fields.dateModified])

  // Close schema type dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".custom-select-wrapper")) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close article type dropdown when clicking outside its wrapper
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".article-select-wrapper")) {
        setArticleTypeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close author type dropdown when clicking outside its wrapper
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".author-select-wrapper")) {
        setAuthorTypeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // --- Short descriptions under each schema type in the main dropdown ---
  const schemaDescriptions: Record<string, string> = {
    Article: "Blog posts or news content.",
    Breadcrumb: "Website structure: Home → Category → Page.",
    "FAQ Page": "Questions & answers for rich results.",
    "Local Business": "Local service, hours, and location.",
    Organization: "Company brand, socials, and contacts.",
    Product: "SKU, price, reviews, and offers.",
    Video: "Video metadata with thumbnail, embed & file URL.",
    "Website Sitelinks Searchbox": "Enable sitelinks searchbox in Google.",
    Person: "Information about an individual or author profile.",
    Event: "Events, dates, and locations.",
  }

  // For small text under the builder title
  const schemaExamples: Record<string, string> = {
    Article: "Article, BlogPosting, NewsArticle",
    Breadcrumb: "BreadcrumbList",
    "FAQ Page": "FAQPage",
    "Local Business": "LocalBusiness, Store, Restaurant",
    Product: "Product, Offer, AggregateOffer",
    Video: "VideoObject",
    "Website Sitelinks Searchbox": "WebSite + SearchAction",
    Organization: "Organization, LocalBusiness, Corporation",
    Person: "Person, Author, Speaker",
    Event: "Event, BusinessEvent, Festival",
  }

  // --- Field definitions ---
  const schemaFields: Record<
    string,
    { label: string; key: string; placeholder?: string }[]
  > = {
    Article: [
      { label: "Article @type", key: "articleType", placeholder: "BlogPosting" },
      { label: "Article URL", key: "url", placeholder: "https://example.com/my-article" },
      { label: "Headline", key: "headline", placeholder: "e.g. 10 Proven SEO Tips to Boost Traffic" },
      { label: "Strict 110-character SEO limit", key: "strictHeadlineLimit", placeholder: "false" },
      {
        label: "Description",
        key: "description",
        placeholder: "Short summary — appears in Google search results",
      },
      {
        label: "Image(s)",
        key: "images",
        placeholder: "https://example.com/image.jpg, https://example.com/image2.jpg",
      },
      { label: "Author @type", key: "authorType", placeholder: "Person" },
      { label: "Author Name", key: "authorName", placeholder: "e.g. Jane Doe" },
      { label: "Author URL", key: "authorUrl", placeholder: "https://example.com/author" },
      { label: "Publisher Name", key: "publisherName", placeholder: "Publisher or Site Name" },
      { label: "Publisher Logo URL", key: "publisherLogo", placeholder: "https://example.com/logo.png" },
      { label: "Date Published", key: "datePublished", placeholder: "yyyy-mm-dd" },
      { label: "Date Modified", key: "dateModified", placeholder: "yyyy-mm-dd" },
      {
        label: "Article Body (Optional)",
        key: "articleBody",
        placeholder: "Paste or write the main content here...",
      },
    ],
    Breadcrumb: [
      { label: "Breadcrumb Trail", key: "itemList", placeholder: "Home > Category > Page" },
    ],
    "FAQ Page": [
      { label: "Question 1", key: "question1", placeholder: "What is the return policy?" },
      { label: "Answer 1", key: "answer1", placeholder: "You can return items within 30 days." },
    ],
    Product: [
      { label: "Product Name", key: "name", placeholder: "Organic Herbal Tea" },
      { label: "Brand", key: "brand", placeholder: "Tembeya Wellness" },
      { label: "Price", key: "price", placeholder: "25.99" },
      { label: "Currency", key: "currency", placeholder: "USD" },
      { label: "Description", key: "description", placeholder: "Natural detox blend" },
    ],
    "Local Business": [
      { label: "Business Name", key: "name", placeholder: "Acme Plumbing" },
      { label: "Address", key: "address", placeholder: "123 Main St, Nairobi" },
      { label: "Phone", key: "telephone", placeholder: "+254700000000" },
      { label: "Opening Hours", key: "openingHours", placeholder: "Mo-Fr 09:00-17:00" },
      { label: "URL", key: "url", placeholder: "https://example.com" },
    ],
    Event: [
      { label: "Event Name", key: "name", placeholder: "Wellness Retreat 2025" },
      { label: "Start Date", key: "startDate", placeholder: "2025-06-15" },
      { label: "End Date", key: "endDate", placeholder: "2025-06-20" },
      { label: "Location", key: "location", placeholder: "Nairobi, Kenya" },
      { label: "Description", key: "description", placeholder: "5-day retreat" },
    ],
    Video: [
      { label: "Video Title", key: "name", placeholder: "How to Brew Herbal Tea" },
      { label: "Description", key: "description", placeholder: "Short video summary" },
      { label: "Thumbnail URL", key: "thumbnailUrl", placeholder: "https://example.com/thumb.jpg" },
      { label: "Content URL", key: "contentUrl", placeholder: "https://example.com/video.mp4" },
      { label: "Embed URL", key: "embedUrl", placeholder: "https://youtube.com/watch?v=..." },
      { label: "Upload Date", key: "uploadDate", placeholder: "2025-01-01" },
      { label: "Duration", key: "duration", placeholder: "PT2M30S" },
    ],
    Organization: [
      { label: "Organization Name", key: "name", placeholder: "Tembeya Wellness Retreats" },
      { label: "URL", key: "url", placeholder: "https://tembeyawellnessretreats.com" },
      { label: "Logo URL", key: "logo", placeholder: "https://example.com/logo.png" },
      { label: "Contact Email", key: "email", placeholder: "info@example.com" },
    ],
    "Website Sitelinks Searchbox": [
      { label: "Site Name", key: "name", placeholder: "Example Site" },
      {
        label: "Search URL Template",
        key: "urlTemplate",
        placeholder: "https://example.com/search?q={search_term_string}",
      },
    ],
    Person: [
      { label: "Name", key: "name", placeholder: "John Doe" },
      { label: "Job Title", key: "jobTitle", placeholder: "Wellness Coach" },
      { label: "Website", key: "url", placeholder: "https://example.com" },
    ],
  }

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isUrlKey = (k: string) => {
    if (!k) return false
    const lk = k.toLowerCase()
    return /url/.test(lk) || /logo/.test(lk) || /^images_\d+$/.test(k) || k === "images"
  }

  const renderError = (key?: string) => {
    if (!key) return null
    const msg = errors[key]
    if (!msg) return null
    if (isUrlKey(key)) {
      return (
        <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
          {msg}
        </div>
      )
    }
    return <p className="text-red-600 text-sm mt-1">{msg}</p>
  }

  const isValidUrl = (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const validateField = (key: string, value: string, allFields: Record<string, string>) => {
    const nextErrors = { ...errors }

    const setError = (k: string, msg?: string) => {
      if (msg) nextErrors[k] = msg
      else delete nextErrors[k]
    }

    const trimmed = value ? value.trim() : ""

    if (!trimmed) {
      // Optional fields: remove existing error
      setError(key)
      setErrors(nextErrors)
      return
    }

    // Per-image validation (images_0, images_1, etc.)
    if (/^images_\d+$/.test(key)) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    const lk = key.toLowerCase()

    if (lk.includes("url") || lk.includes("logo")) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    switch (key) {
      case "images": {
        const parts = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        const invalid = parts.find((p) => !isValidUrl(p))
        if (invalid) setError(key, "Invalid URL format")
        else setError(key)
        break
      }

      case "datePublished":
      case "dateModified": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) setError(key, "Date must be in yyyy-mm-dd format")
        else setError(key)
        break
      }

      case "price":
        if (isNaN(Number(trimmed))) setError(key, "Price must be a number")
        else setError(key)
        break

      case "headline": {
        if (allFields.strictHeadlineLimit === "true" && trimmed.length > 110) {
          setError(key, "Headline exceeds 110 characters")
        } else setError(key)
        break
      }

      default:
        setError(key)
    }

    setErrors(nextErrors)
  }

  // Image handlers
  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    validateField(`images_${index}`, value, fields)
  }

  const addImage = () => setImages((prev) => [...prev, ""])

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Generic field handler
  const handleChange = (key: string, value: string) => {
    setFields((prev) => {
      let val = value

      // Enforce strict headline limit while typing if enabled
      if (key === "headline" && prev.strictHeadlineLimit === "true") {
        val = value.slice(0, 110)
      }

      const next = { ...prev, [key]: val }
      validateField(key, val, next)
      return next
    })
  }

  // Build JSON-LD schema
  const buildSchema = () => {
    const base: any = {
      "@context": "https://schema.org",
      "@type": type,
    }

    Object.entries(fields).forEach(([k, v]) => {
      if (v && v.trim()) base[k] = v.trim()
    })

    if (type === "Article") {
      // More specific article subtype (Article, BlogPosting, NewsArticle)
      base["@type"] = (fields.articleType && fields.articleType.trim()) || "Article"

      // Author
      const authorName = (fields.authorName || fields.author || "").trim()
      if (authorName) {
        base.author = {
          "@type": fields.authorType || "Person",
          name: authorName,
        }
        if (fields.authorUrl && fields.authorUrl.trim()) {
          base.author.url = fields.authorUrl.trim()
        }
      }

      // Images (prefer the images[] state)
      if (images && images.length) {
        const imgs = images.map((s) => s.trim()).filter(Boolean)
        if (imgs.length === 1) base.image = imgs[0]
        else if (imgs.length > 1) base.image = imgs
      } else if (fields.images && fields.images.trim()) {
        const imgs = fields.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        base.image = imgs.length === 1 ? imgs[0] : imgs
      }

      // Publisher
      if (
        (fields.publisherName && fields.publisherName.trim()) ||
        (fields.publisherLogo && fields.publisherLogo.trim())
      ) {
        base.publisher = { "@type": "Organization" }
        if (fields.publisherName && fields.publisherName.trim()) {
          base.publisher.name = fields.publisherName.trim()
        }
        if (fields.publisherLogo && fields.publisherLogo.trim()) {
          base.publisher.logo = {
            "@type": "ImageObject",
            url: fields.publisherLogo.trim(),
          }
        }
      }

      if (fields.datePublished && fields.datePublished.trim()) {
        base.datePublished = fields.datePublished.trim()
      }
      if (fields.dateModified && fields.dateModified.trim()) {
        base.dateModified = fields.dateModified.trim()
      }
      if (fields.articleBody && fields.articleBody.trim()) {
        base.articleBody = fields.articleBody.trim()
      }

      // Clean helper keys from final JSON-LD
      delete base.articleType
      delete base.authorName
      delete base.authorUrl
      delete base.authorType
      delete base.images
      delete base.publisherName
      delete base.publisherLogo
      delete base.strictHeadlineLimit
    }

    if (type === "Product" && fields.price) {
      base.offers = {
        "@type": "Offer",
        price: fields.price,
        priceCurrency: fields.currency || "USD",
      }
      delete base.price
      delete base.currency
    }

    if (type === "Event" && fields.location) {
      base.location = {
        "@type": "Place",
        name: fields.location,
      }
    }

    // Other schema types use fields directly
    return base
  }

  const schemaJSON = useMemo(
    () => JSON.stringify(buildSchema(), null, 2),
    [fields, type, images]
  )

  const handleCopy = async () => {
    await copyToClipboard(schemaJSON)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const handleDownload = () => {
    const fileBase = type === "Article" ? fields.articleType || "Article" : type
    const filename = `${fileBase} schema.json`
    downloadText(filename, schemaJSON)
    setDownloadMsgVisible(true)
    setTimeout(() => setDownloadMsgVisible(false), 1400)
  }

  const handleTest = async () => {
    try {
      await copyToClipboard(schemaJSON)
      setTestMsgVisible(true)
      window.open("https://search.google.com/test/rich-results", "_blank", "noopener,noreferrer")
      setTimeout(() => setTestMsgVisible(false), 1400)
    } catch {
      window.open("https://search.google.com/test/rich-results", "_blank", "noopener,noreferrer")
    }
  }

  const handleReset = () => {
    setFields(type === "Article" ? { articleType: "Article" } : {})
    setImages(type === "Article" ? [""] : [])
    setErrors({})
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  const related: Tool[] = toolsData.filter((t) => t.name !== "JSON-LD Schema Generator")
  const navigate = useNavigate()

  return (
    <>
      <Seo
        title={`${type} Schema Builder`}
        description={`Generate clean and structured JSON-LD for ${type}. ${schemaDescriptions[type] ?? ""}`}
        keywords="schema generator, json-ld generator, seo tools"
        url="https://cralite.com/tools/schema-builder"
      />

      <section className="tool-section">
        {/* === Schema Type Header Section (same width as tool grid) === */}
        <div className="mb-5">
          <div className="tool-grid items-center">
            {/* LEFT – Dropdown + title */}
            <div>
              <h3 className="text-[18px] font-semibold mb-2">
                Which Schema.org markup would you like to generate?
              </h3>

              <div className="custom-select-wrapper relative" style={{ width: "100%" }}>
                <button
                  type="button"
                  className="custom-select-trigger tool-select"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((o) => !o)}
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <span className="truncate block">{type}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="custom-select-list absolute left-0 mt-1 z-50"
                    style={{ width: "100%" }}
                  >
                    <ul>
                      {Object.keys(schemaFields).map((schemaType) => (
                        <li
                          key={schemaType}
                          onClick={() => {
                            setType(schemaType)
                            setFields(schemaType === "Article" ? { articleType: "Article" } : {})
                            setImages(schemaType === "Article" ? [""] : [])
                            setDropdownOpen(false)
                            setErrors({})
                          }}
                          className={schemaType === type ? "selected" : ""}
                        >
                          <div className="font-semibold text-[15px]">{schemaType}</div>
                          <div className="text-[13px] text-gray-500">
                            {schemaDescriptions[schemaType] || ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT – Description */}
            <div className="text-base text-gray-600 leading-relaxed">
              Use this Schema.org structured data generator to create JSON-LD markups easily.
              After generating, test your markup using the{" "}
              <a
                href="https://search.google.com/test/rich-results"
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Rich Results Test
              </a>{" "}
              or the{" "}
              <a
                href="https://validator.schema.org/"
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schema Markup Validator
              </a>
              .
            </div>
          </div>
        </div>

        {/* ======= MAIN TOOL GRID ======= */}
        <div className="tool-grid">
          {/* LEFT FORM */}
          <div className="tool-form">
            <h2 className="tool-h2">{type} Schema Builder</h2>
            <p className="text-base text-gray-600 mb-4">
              Google-ready: {schemaExamples[type]} for {type}
            </p>

            {type === "Article" ? (
              <>
                {/* First row: Article @type + Article URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemaFields[type].slice(0, 2).map((field) => (
                    <div key={field.key} className="tool-field">
                      <label className="tool-label">{field.label}</label>
                      {field.key === "articleType" ? (
                        <div
                          className="custom-select-wrapper article-select-wrapper relative"
                          style={{ width: "100%" }}
                        >
                          <button
                            type="button"
                            className="custom-select-trigger tool-select"
                            aria-expanded={articleTypeOpen}
                            onClick={() => setArticleTypeOpen((o) => !o)}
                            style={{ width: "100%", justifyContent: "space-between" }}
                          >
                            <span className="truncate block">
                              {fields.articleType || "Article"}
                            </span>
                            <span className="text-xs">⏷</span>
                          </button>

                          {articleTypeOpen && (
                            <div
                              className="custom-select-list absolute left-0 mt-1 z-50"
                              style={{ width: "100%" }}
                            >
                              <ul>
                                <li
                                  className={
                                    (fields.articleType || "Article") === "Article"
                                      ? "selected"
                                      : ""
                                  }
                                  onClick={() => {
                                    handleChange("articleType", "Article")
                                    setArticleTypeOpen(false)
                                  }}
                                >
                                  <div className="font-semibold text-[15px]">Article</div>
                                  <div className="text-[13px] text-gray-500">
                                    General article
                                  </div>
                                </li>
                                <li
                                  className={
                                    fields.articleType === "NewsArticle" ? "selected" : ""
                                  }
                                  onClick={() => {
                                    handleChange("articleType", "NewsArticle")
                                    setArticleTypeOpen(false)
                                  }}
                                >
                                  <div className="font-semibold text-[15px]">NewsArticle</div>
                                  <div className="text-[13px] text-gray-500">
                                    News reporting
                                  </div>
                                </li>
                                <li
                                  className={
                                    fields.articleType === "BlogPosting" ? "selected" : ""
                                  }
                                  onClick={() => {
                                    handleChange("articleType", "BlogPosting")
                                    setArticleTypeOpen(false)
                                  }}
                                >
                                  <div className="font-semibold text-[15px]">BlogPosting</div>
                                  <div className="text-[13px] text-gray-500">
                                    Blog content
                                  </div>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            className="tool-input"
                            value={fields[field.key] || ""}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                          />
                          {renderError(field.key)}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Remaining Article fields */}
                {schemaFields[type].slice(2).map((field) => {
                  // Skip keys that are specially handled in paired layouts
                  if (
                    field.key === "authorName" ||
                    field.key === "publisherLogo" ||
                    field.key === "dateModified"
                  )
                    return null

                  if (field.key === "headline") {
                    const count = (fields.headline || "").length
                    return (
                      <div key={field.key} className="tool-field">
                        <label className="tool-label">{field.label}</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={fields.headline || ""}
                          placeholder={field.placeholder}
                          onChange={(e) => handleChange("headline", e.target.value)}
                        />
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm mt-0">
                          {count}/110 characters
                        </div>
                        {renderError("headline")}
                      </div>
                    )
                  }

                  if (field.key === "strictHeadlineLimit") {
                    const checked = fields.strictHeadlineLimit === "true"
                    return (
                      <div key={field.key} className="tool-field">
                        <label className="tool-label">{field.label}</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const newVal = e.target.checked ? "true" : "false"
                              if (newVal === "true") {
                                const clipped = (fields.headline || "").slice(0, 110)
                                handleChange("headline", clipped)
                                handleChange("strictHeadlineLimit", newVal)
                                validateField("headline", clipped, {
                                  ...fields,
                                  strictHeadlineLimit: newVal,
                                })
                              } else {
                                handleChange("strictHeadlineLimit", newVal)
                                const headlineVal = fields.headline || ""
                                validateField("headline", headlineVal, {
                                  ...fields,
                                  strictHeadlineLimit: newVal,
                                })
                              }
                            }}
                          />
                          <span className="text-sm">
                            Enable strict 110-character limit
                          </span>
                        </div>
                      </div>
                    )
                  }

                  if (field.key === "description") {
                    return (
                      <div key={field.key} className="tool-field">
                        <label className="tool-label">{field.label}</label>
                        <textarea
                          className="tool-textarea"
                          value={fields[field.key] || ""}
                          placeholder={field.placeholder}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                        {renderError(field.key)}
                      </div>
                    )
                  }

                  if (field.key === "authorType") {
                    return (
                      <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Author Type */}
                        <div className="tool-field">
                          <label className="tool-label">{field.label}</label>
                          <div
                            className="custom-select-wrapper author-select-wrapper relative"
                            style={{ width: "100%" }}
                          >
                            <button
                              type="button"
                              className="custom-select-trigger tool-select"
                              aria-expanded={authorTypeOpen}
                              onClick={() => setAuthorTypeOpen((o) => !o)}
                              style={{ width: "100%", justifyContent: "space-between" }}
                            >
                              <span className="truncate block">
                                {fields.authorType || "Person"}
                              </span>
                              <span className="text-xs">⏷</span>
                            </button>

                            {authorTypeOpen && (
                              <div
                                className="custom-select-list absolute left-0 mt-1 z-50"
                                style={{ width: "100%" }}
                              >
                                <ul>
                                  <li
                                    className={
                                      (fields.authorType || "Person") === "Person"
                                        ? "selected"
                                        : ""
                                    }
                                    onClick={() => {
                                      handleChange("authorType", "Person")
                                      setAuthorTypeOpen(false)
                                    }}
                                  >
                                    <div className="font-semibold text-[15px]">Person</div>
                                    <div className="text-[13px] text-gray-500">
                                      Individual
                                    </div>
                                  </li>
                                  <li
                                    className={
                                      fields.authorType === "Organization"
                                        ? "selected"
                                        : ""
                                    }
                                    onClick={() => {
                                      handleChange("authorType", "Organization")
                                      setAuthorTypeOpen(false)
                                    }}
                                  >
                                    <div className="font-semibold text-[15px]">
                                      Organization
                                    </div>
                                    <div className="text-[13px] text-gray-500">
                                      Brand or company
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                          {renderError(field.key)}
                        </div>

                        {/* Author Name */}
                        <div className="tool-field">
                          <label className="tool-label">Author Name</label>
                          <input
                            type="text"
                            className="tool-input"
                            value={fields.authorName || ""}
                            placeholder="e.g. Jane Doe"
                            onChange={(e) =>
                              handleChange("authorName", e.target.value)
                            }
                          />
                          {renderError("authorName")}
                        </div>
                      </div>
                    )
                  }

                  if (field.key === "publisherName") {
                    return (
                      <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="tool-field">
                          <label className="tool-label">{field.label}</label>
                          <input
                            type="text"
                            className="tool-input"
                            value={fields.publisherName || ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              handleChange("publisherName", e.target.value)
                            }
                          />
                          {renderError("publisherName")}
                        </div>

                        <div className="tool-field">
                          <label className="tool-label">Publisher Logo URL</label>
                          <input
                            type="text"
                            className="tool-input"
                            value={fields.publisherLogo || ""}
                            placeholder="https://example.com/logo.png"
                            onChange={(e) =>
                              handleChange("publisherLogo", e.target.value)
                            }
                          />
                          {renderError("publisherLogo")}
                        </div>
                      </div>
                    )
                  }

                  if (field.key === "datePublished") {
                    return (
                      <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Published */}
                        <div className="tool-field relative">
                          <label className="tool-label">Date Published</label>
                          <DatePickerInput
                            value={fields.datePublished}
                            onChange={(iso) => {
                              if (iso) {
                                const d = new Date(iso)
                                if (!isNaN(d.getTime())) setPublished(d)
                              } else setPublished(undefined)
                              handleChange("datePublished", iso)
                            }}
                            placeholder={field.placeholder}
                          />
                          {renderError("datePublished")}
                        </div>

                        {/* Date Modified */}
                        <div className="tool-field relative">
                          <label className="tool-label">Date Modified</label>
                          <DatePickerInput
                            value={fields.dateModified}
                            onChange={(iso) => {
                              if (iso) {
                                const d = new Date(iso)
                                if (!isNaN(d.getTime())) setModified(d)
                              } else setModified(undefined)
                              handleChange("dateModified", iso)
                            }}
                            placeholder={field.placeholder}
                          />
                          {renderError("dateModified")}
                        </div>
                      </div>
                    )
                  }

                  if (field.key === "articleBody") {
                    return (
                      <div key={field.key} className="tool-field">
                        <label className="tool-label">{field.label}</label>
                        <textarea
                          className="tool-textarea"
                          rows={8}
                          value={fields.articleBody || ""}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            handleChange("articleBody", e.target.value)
                          }
                        />
                        {renderError(field.key)}
                      </div>
                    )
                  }

                  if (field.key === "images") {
                    return (
                      <div key={field.key} className="tool-field">
                        <label className="tool-label">{field.label}</label>
                        <div className="flex flex-col gap-2">
                          {images.map((img, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  className="tool-input flex-1"
                                  value={img}
                                  placeholder={field.placeholder}
                                  onChange={(e) =>
                                    handleImageChange(idx, e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  className="toolbar-btn toolbar-btn--red square-btn"
                                  onClick={() => removeImage(idx)}
                                  aria-label="Remove image"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                              {renderError(`images_${idx}`)}
                            </div>
                          ))}

                          <div>
                            <button
                              type="button"
                              className="action-btn"
                              onClick={addImage}
                            >
                              Add Image
                            </button>
                          </div>

                          {images.length === 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                              You can add multiple image URLs. Each will be
                              added to the JSON-LD <code>image</code> property.
                            </div>
                          )}
                        </div>
                        {renderError(field.key)}
                      </div>
                    )
                  }

                  return (
                    <div key={field.key} className="tool-field">
                      <label className="tool-label">{field.label}</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields[field.key] || ""}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                      />
                      {renderError(field.key)}
                    </div>
                  )
                })}
              </>
            ) : (
              // Non-Article types — simple mapping
              schemaFields[type].map((field) => (
                <div key={field.key} className="tool-field">
                  <label className="tool-label">{field.label}</label>
                  <input
                    type="text"
                    className="tool-input"
                    value={fields[field.key] || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                  {renderError(field.key)}
                </div>
              ))
            )}
          </div>

          {/* RIGHT PREVIEW */}
          <div className="tool-preview">
            <h3 className="tool-section-title">JSON-LD Preview</h3>

            <div className="toolbar-spacing">
              <div className="toolbar">
                {/* Test (Google Rich Results) */}
                <div className="toolbar-wrap">
                  <div className={`tooltip ${testMsgVisible ? "visible msg-fade" : ""}`}>
                    {testMsgVisible ? "Copied — open test" : "Test Schema"}
                  </div>
                  <button
                    onClick={handleTest}
                    className="toolbar-btn toolbar-btn--google"
                    title="Test Schema"
                    aria-label="Test Schema"
                  >
                    <img src={googleIconUrl} alt="test schema" className="toolbar-icon" />
                  </button>
                </div>

                {/* Copy */}
                <div className="toolbar-wrap">
                  <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
                    {copied ? "Copied!" : "Copy"}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="toolbar-btn toolbar-btn--blue"
                  >
                    <img src={copyIconUrl} alt="copy" className="toolbar-icon" />
                  </button>
                </div>

                {/* Download */}
                <div className="toolbar-wrap">
                  <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                    {downloadMsgVisible ? "Downloaded" : "Download"}
                  </div>
                  <button
                    onClick={handleDownload}
                    className="toolbar-btn toolbar-btn--green"
                  >
                    <img src={downloadIconUrl} alt="download" className="toolbar-icon" />
                  </button>
                </div>

                {/* Reset */}
                <div className="toolbar-wrap">
                  <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                    {resetMsgVisible ? "Reset" : "Reset"}
                  </div>
                  <button
                    onClick={handleReset}
                    className="toolbar-btn toolbar-btn--red"
                  >
                    <img src={resetIconUrl} alt="reset" className="toolbar-icon" />
                  </button>
                </div>
              </div>
            </div>

            <pre className="tool-code">
              <code>{schemaJSON}</code>
            </pre>
          </div>
        </div>
      </section>

      <RelatedTools exclude="/schema-builder" />
    </>
  )
}
