// src/pages/SchemaBuilder.tsx
import { useState, useMemo, useEffect, type ComponentType } from "react"
import { Plus, Minus } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { } from "react-router-dom"
import DatePickerInput from "../components/DatePickerInput"
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import type { StateProps } from 'react-country-state-fields'
// Prefer `currency-codes` (installed). Avoid importing `currency-list` to prevent module-not-found.
import currencyCodes from "currency-codes"

import Seo from "../components/Seo"

import copyIconUrl from "../assets/icons/copy.svg?url"
import downloadIconUrl from "../assets/icons/download.svg?url"
import resetIconUrl from "../assets/icons/reset.svg?url"
import googleIconUrl from "../assets/icons/google.svg?url"

// toolsData not required directly here; related tools component is used below
import RelatedTools from "../components/RelatedTools"

import { downloadText, copyToClipboard } from "../utils"

export default function SchemaBuilder(): JSX.Element {
  const [type, setType] = useState<string>("Article")
  const [fields, setFields] = useState<Record<string, string>>({ articleType: "Article" })

  const [copied, setCopied] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)
  const [testMsgVisible, setTestMsgVisible] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [articleTypeOpen, setArticleTypeOpen] = useState(false)
  const [authorTypeOpen, setAuthorTypeOpen] = useState(false)
  // Event-related custom select opens
  const [eventStatusOpen, setEventStatusOpen] = useState(false)
  const [attendanceModeOpen, setAttendanceModeOpen] = useState(false)
  const [performerTypeOpen, setPerformerTypeOpen] = useState(false)
  // Ticket availability open index (for per-ticket custom dropdown)
  const [ticketAvailabilityOpenIndex, setTicketAvailabilityOpenIndex] = useState<number | null>(null)
  // Ticket currency open index for per-ticket currency dropdown
  const [ticketCurrencyOpenIndex, setTicketCurrencyOpenIndex] = useState<number | null>(null)
  // HowTo currency dropdown state (searchable list for How-to Estimated cost currency)
  const [howToCurrencyOpen, setHowToCurrencyOpen] = useState<boolean>(false)
  const [howToCurrencySearch, setHowToCurrencySearch] = useState<string>("")
  // Salary currency dropdown state (searchable list for Job Posting salary currency)
  const [salaryCurrencyOpen, setSalaryCurrencyOpen] = useState<boolean>(false)
  const [salaryCurrencySearch, setSalaryCurrencySearch] = useState<string>("")
  // Salary unit dropdown state (Per) for Job Posting
  const [salaryUnitOpen, setSalaryUnitOpen] = useState<boolean>(false)
  // LocalBusiness type dropdown state
  const [localBusinessTypeOpen, setLocalBusinessTypeOpen] = useState<boolean>(false)
  // More specific subtype dropdown state
  const [moreSpecificOpen, setMoreSpecificOpen] = useState<boolean>(false)
  // Country / region custom dropdown state
  const [countryOpen, setCountryOpen] = useState<boolean>(false)
  const [countrySearch, setCountrySearch] = useState<string>("")
  const [regionOpen, setRegionOpen] = useState<boolean>(false)
  const [regionSearch, setRegionSearch] = useState<string>("")
  // Employment type dropdown state for Job Posting
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState<boolean>(false)
  // Organization @type dropdown state
  const [orgTypeOpen, setOrgTypeOpen] = useState<boolean>(false)
  const [orgMoreSpecificOpen, setOrgMoreSpecificOpen] = useState<boolean>(false)
  // Contact type dropdown state (per-contact index)
  const [contactTypeOpenIndex, setContactTypeOpenIndex] = useState<number | null>(null)
  // Area(s) Served country dropdown (per-contact index) and search
  const [areaCountryOpenIndex, setAreaCountryOpenIndex] = useState<number | null>(null)
  const [areaCountrySearch, setAreaCountrySearch] = useState<string>("")
  // Contact Options dropdown (per-contact index)
  const [optionsOpenIndex, setOptionsOpenIndex] = useState<number | null>(null)
  // Memoized country list for Area(s) Served dropdown (English)
  countries.registerLocale(enLocale)
  const countryList = useMemo(() => Object.values(countries.getNames('en', { select: 'official' }) || {}).sort((a, b) => a.localeCompare(b)), [])
  // Ticket currency open index for repeater (- null when closed)
  // Default ticket currency dropdown (searchable)
  const [ticketDefaultCurrencyOpen, setTicketDefaultCurrencyOpen] = useState<boolean>(false)
  const [ticketCurrencySearch, setTicketCurrencySearch] = useState<string>("")

  // Images list for Article schema
  const [images, setImages] = useState<string[]>([""])
  // Thumbnails list for Video schema
  const [videoThumbnails, setVideoThumbnails] = useState<string[]>([""])
  // Breadcrumb items for Breadcrumb schema
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; url: string }>>([
    { name: "", url: "" },
  ])
  // FAQ items for FAQ Page schema
  const [faqItemsState, setFaqItemsState] = useState<Array<{ question: string; answer: string }>>([
    { question: "", answer: "" },
  ])

  // Social profiles repeater for Person schema
  const [socialProfiles, setSocialProfiles] = useState<string[]>([])

  // Opening hours repeater for Local Business
  const [openingHoursState, setOpeningHoursState] = useState<Array<{ days: string; opens: string; closes: string }>>([])

  // Departments repeater for Local Business (sub-units)
  const [departments, setDepartments] = useState<Array<{ localBusinessType: string; moreSpecificType: string; name: string; imageUrl: string; telephone: string; days: string; opens: string; closes: string }>>([])

  // Per-department dropdown open indices for styled selects
  const [deptLocalBusinessOpenIndex, setDeptLocalBusinessOpenIndex] = useState<number | null>(null)
  const [deptMoreSpecificOpenIndex, setDeptMoreSpecificOpenIndex] = useState<number | null>(null)
  // Opening days dropdown open index (per-opening-hour row)
  const [openingDaysOpenIndex, setOpeningDaysOpenIndex] = useState<number | null>(null)
  // Per-department opening days dropdown
  const [deptOpeningDaysOpenIndex, setDeptOpeningDaysOpenIndex] = useState<number | null>(null)

  // Contacts repeater for Organization schema
  const [contacts, setContacts] = useState<Array<{ contactType: string; phone: string; areaServed: string; availableLanguage: string; options: string }>>([])

  // Publish / Modified date pickers (fields.datePublished and fields.dateModified are stored in `fields`)

  // Video duration inputs (minutes & seconds)
  const [videoMinutes, setVideoMinutes] = useState<string>("")
  const [videoSeconds, setVideoSeconds] = useState<string>("")

  // Event specific: ticket types repeater and performer info
  const [ticketTypes, setTicketTypes] = useState<Array<{ name: string; price: string; currency?: string; availableFrom?: string; url?: string; availability?: string }>>([])
  const [ticketDefaultCurrency, setTicketDefaultCurrency] = useState<string>("")

  // How-to (HowTo) repeaters: tools, supplies, and detailed steps
  const [howToTools, setHowToTools] = useState<string[]>([])
  const [howToSupplies, setHowToSupplies] = useState<string[]>([])
  const [howToSteps, setHowToSteps] = useState<Array<{ instruction: string; imageUrl?: string; name?: string; url?: string }>>([
    { instruction: "" },
  ])

  const addTicketType = () =>
    setTicketTypes((prev) => [
      ...prev,
      { name: "", price: "", currency: ticketDefaultCurrency || "", availableFrom: "", url: "", availability: "" },
    ])

  // How-to handlers
  const addHowToTool = () => setHowToTools((prev) => [...prev, ""])
  const updateHowToTool = (index: number, value: string) => setHowToTools((prev) => {
    const next = [...prev]
    next[index] = value
    return next
  })
  const removeHowToTool = (index: number) => setHowToTools((prev) => prev.filter((_, i) => i !== index))

  const addHowToSupply = () => setHowToSupplies((prev) => [...prev, ""])
  const updateHowToSupply = (index: number, value: string) => setHowToSupplies((prev) => {
    const next = [...prev]
    next[index] = value
    return next
  })
  const removeHowToSupply = (index: number) => setHowToSupplies((prev) => prev.filter((_, i) => i !== index))

  const addHowToStep = () => setHowToSteps((prev) => [...prev, { instruction: "" }])
  const updateHowToStep = (index: number, key: keyof (typeof howToSteps)[0], value: string) => setHowToSteps((prev) => {
    const next = [...prev]
    next[index] = { ...next[index], [key]: value }
    return next
  })
  const removeHowToStep = (index: number) => setHowToSteps((prev) => prev.filter((_, i) => i !== index))

  const updateTicketType = (index: number, key: string, value: string) => {
    setTicketTypes((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const removeTicketType = (index: number) => setTicketTypes((prev) => prev.filter((_, i) => i !== index))

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

  // Close any event-related custom selects when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".event-select-wrapper")) {
        setEventStatusOpen(false)
        setAttendanceModeOpen(false)
        setPerformerTypeOpen(false)
        setTicketCurrencyOpenIndex(null)
        setTicketAvailabilityOpenIndex(null)
        setTicketDefaultCurrencyOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close HowTo currency dropdown when clicking outside its wrapper
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".howto-currency-wrapper")) {
        setHowToCurrencyOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".salary-currency-wrapper")) {
        setSalaryCurrencyOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close country dropdown when clicking outside its wrapper
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".country-select-wrapper")) {
        setCountryOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".region-select-wrapper")) {
        setRegionOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close employment type dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".jobpost-select-wrapper")) {
        setEmploymentTypeOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".salary-unit-wrapper")) {
        setSalaryUnitOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".localbusiness-select-wrapper")) {
        setLocalBusinessTypeOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".localbusiness-subtype-wrapper")) {
        setMoreSpecificOpen(false)
      }
      // Organization selects
      if (!(e.target as HTMLElement).closest(".organization-select-wrapper")) {
        setOrgTypeOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".organization-subtype-wrapper")) {
        setOrgMoreSpecificOpen(false)
      }
      if (!(e.target as HTMLElement).closest(".opening-days-wrapper")) {
        setOpeningDaysOpenIndex(null)
      }
      // Close per-department selects when clicking outside their wrappers
      if (!(e.target as HTMLElement).closest(".department-localbusiness-select")) {
        setDeptLocalBusinessOpenIndex(null)
      }
      if (!(e.target as HTMLElement).closest(".department-subtype-select")) {
        setDeptMoreSpecificOpenIndex(null)
      }
      // Close contact type dropdown when clicking outside
      if (!(e.target as HTMLElement).closest(".contact-type-select")) {
        setContactTypeOpenIndex(null)
      }
      // Close area(s) served country dropdown
      if (!(e.target as HTMLElement).closest(".area-country-select")) {
        setAreaCountryOpenIndex(null)
      }
      // Close contact options dropdown
      if (!(e.target as HTMLElement).closest(".contact-options-select")) {
        setOptionsOpenIndex(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // If fields.sameAs is present and socialProfiles state is empty, initialize repeater
  useEffect(() => {
    if (type === "Person" && (!socialProfiles || socialProfiles.length === 0) && fields.sameAs) {
      const arr = fields.sameAs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      if (arr.length) setSocialProfiles(arr)
    }
  }, [type, fields.sameAs])

  // --- Short descriptions under each schema type in the main dropdown ---
  const schemaDescriptions: Record<string, string> = {
    Article: "Blog posts or news content.",
    Breadcrumb: "Website structure: Home → Category → Page.",
    "FAQ Page": "Questions & answers for rich results.",
    "How-to": "Step-by-step instructions for tasks.",
    "Local Business": "Local service, hours, and location.",
    Organization: "Company brand, socials, and contacts.",
    Product: "SKU, price, reviews, and offers.",
    Recipe: "Cooking instructions, ingredients and timings.",
    Video: "Video metadata with thumbnail, embed & file URL.",
    "Website Sitelinks Searchbox": "Enable sitelinks searchbox in Google.",
    Person: "Information about an individual or author profile.",
    "Job Posting": "Job details for open positions.",
    Event: "Events, dates, and locations.",
  }

  // For small text under the builder title
  const schemaExamples: Record<string, string> = {
    Article: "Article, BlogPosting, NewsArticle",
    Breadcrumb: "Help Google understand your page hierarchy",
    "FAQ Page": "Add questions and answers to create a valid FAQ schema",
    "How-to": "Schema Builder for How-To Guides and Step-by-Step Content",
    "Local Business": "LocalBusiness, Store, Restaurant",
    Product: "Generate Structured Data Builder for Product, Offer, and AggregateOffer Types",
    Recipe: "Recipe — ingredients, cookTime, recipeInstructions",
    Video: "VideoObject",
    "Website Sitelinks Searchbox": "WebSite + SearchAction",
    Organization: "Generate Accurate Schema Markup for Organizations, Local Businesses, and Corporations",
    Person: "Generate Structured Data Builder for Person, Author, and Speaker Profiles",
    "Job Posting": "Schema Builder for Job Listings, Hiring Info, and Requirements",
    Event: "Generate Structured Data for Events, Business Events, and Festivals",
  }

  // Helpful links for each schema type: schema.org refs and Google docs links
  const HELP_LINKS: Record<string, { schema: { label: string; url: string }[]; google?: { label: string; url: string }[] }> = {
    Article: {
      schema: [
        { label: "Article", url: "https://schema.org/Article" },
        { label: "BlogPosting", url: "https://schema.org/BlogPosting" },
        { label: "NewsArticle", url: "https://schema.org/NewsArticle" },
      ],
      google: [{ label: "Article", url: "https://developers.google.com/search/docs/appearance/structured-data/article" }],
    },
    Breadcrumb: {
      schema: [{ label: "BreadcrumbList", url: "https://schema.org/BreadcrumbList" }],
      google: [{ label: "Breadcrumb", url: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" }],
    },
    "FAQ Page": {
      schema: [{ label: "FAQPage", url: "https://schema.org/FAQPage" }],
      google: [{ label: "FAQPage", url: "https://developers.google.com/search/docs/appearance/structured-data/faqpage" }],
    },
    "How-to": {
      schema: [{ label: "HowTo", url: "https://schema.org/HowTo" }],
      google: [{ label: "HowTo", url: "https://developers.google.com/search/docs/appearance/structured-data/how-to" }],
    },
    "Local Business": {
      schema: [{ label: "LocalBusiness", url: "https://schema.org/LocalBusiness" }],
      google: [{ label: "Local business", url: "https://developers.google.com/search/docs/appearance/structured-data/local-business" }],
    },
    Organization: {
      schema: [{ label: "Organization", url: "https://schema.org/Organization" }],
      google: [{ label: "Organization", url: "https://developers.google.com/search/docs/appearance/structured-data/organization" }],
    },
    Product: {
      schema: [{ label: "Product", url: "https://schema.org/Product" }],
      google: [{ label: "Product", url: "https://developers.google.com/search/docs/appearance/structured-data/product" }],
    },
    Recipe: {
      schema: [{ label: "Recipe", url: "https://schema.org/Recipe" }],
      google: [{ label: "Recipe", url: "https://developers.google.com/search/docs/appearance/structured-data/recipe" }],
    },
    Video: {
      schema: [{ label: "VideoObject", url: "https://schema.org/VideoObject" }],
      google: [{ label: "Video", url: "https://developers.google.com/search/docs/appearance/structured-data/video" }],
    },
    Person: {
      schema: [{ label: "Person", url: "https://schema.org/Person" }],
      google: [{ label: "Person", url: "https://developers.google.com/search/docs/appearance/structured-data/person" }],
    },
    "Job Posting": {
      schema: [{ label: "JobPosting", url: "https://schema.org/JobPosting" }],
      google: [{ label: "Job Posting", url: "https://developers.google.com/search/docs/appearance/structured-data/job-posting" }],
    },
    Event: {
      schema: [{ label: "Event", url: "https://schema.org/Event" }],
      google: [{ label: "Event", url: "https://developers.google.com/search/docs/appearance/structured-data/event" }],
    },
    "Website Sitelinks Searchbox": {
      schema: [{ label: "WebSite + SearchAction", url: "https://schema.org/WebSite" }],
      google: [{ label: "Sitelinks searchbox", url: "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox" }],
    },
  }

  const renderHelpLinks = (schemaType: string) => {
    const entry = HELP_LINKS[schemaType]
    if (!entry) return null
    return (
      <>
        <hr className="mt-4 mb-0 border-gray-300" />
        <div className="mt-4 text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-2">Schema.org reference:</div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-primary">
                {entry.schema.map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2">Google docs:</div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-primary">
                {entry.google?.map((g) => (
                  <li key={g.url}><a href={g.url} target="_blank" rel="noopener noreferrer">{g.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </>
    )
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
    "FAQ Page": [],
    // FAQ Page handled by dynamic editor (faqItemsState)
    Product: [
      { label: "Product Name", key: "name", placeholder: "Organic Herbal Tea" },
      { label: "SKU", key: "sku", placeholder: "SKU12345" },
      { label: "MPN", key: "mpn", placeholder: "MPN-0001" },
      { label: "GTIN (e.g., GTIN-13)", key: "gtin13", placeholder: "0123456789012" },
      { label: "Brand", key: "brand", placeholder: "Tembeya Wellness" },
      { label: "Category", key: "category", placeholder: "Beverages" },
      { label: "Price", key: "price", placeholder: "25.99" },
      { label: "Currency", key: "currency", placeholder: "USD" },
      { label: "Price Valid Until", key: "priceValidUntil", placeholder: "2026-12-31" },
      { label: "Availability", key: "availability", placeholder: "InStock" },
      { label: "Condition", key: "itemCondition", placeholder: "NewCondition" },
      { label: "URL", key: "url", placeholder: "https://example.com/product" },
      { label: "Image(s)", key: "images", placeholder: "https://example.com/image.jpg, https://example.com/image2.jpg" },
      { label: "Description", key: "description", placeholder: "Natural detox blend" },
      { label: "Rating Value", key: "ratingValue", placeholder: "4.5" },
      { label: "Review Count", key: "reviewCount", placeholder: "12" },
    ],
    "Local Business": [
      { label: "LocalBusiness @type", key: "localBusinessType", placeholder: "LocalBusiness" },
      { label: "More specific @type", key: "moreSpecificType", placeholder: "Select Option" },
      { label: "Name", key: "name", placeholder: "Business Name" },
      { label: "Image URL", key: "imageUrl", placeholder: "https://example.com/photo.jpg" },
      { label: "@id (URL)", key: "@id", placeholder: "https://example.com#id" },
      { label: "URL", key: "url", placeholder: "https://example.com" },
      { label: "Phone", key: "telephone", placeholder: "+1-555-123-4567" },
      { label: "Price range", key: "priceRange", placeholder: "$$" },
      { label: "Street", key: "street", placeholder: "123 Main St" },
      { label: "City", key: "city", placeholder: "Nairobi" },
      { label: "Zip code", key: "postalCode", placeholder: "00100" },
      { label: "Country", key: "country", placeholder: "Country name or code" },
      { label: "State/Province/Region", key: "region", placeholder: "State or region" },
      { label: "Latitude", key: "latitude", placeholder: "e.g. -1.2921" },
      { label: "Longitude", key: "longitude", placeholder: "e.g. 36.8219" },
      { label: "Opening Hours", key: "openingHours", placeholder: "Mo-Fr 09:00-17:00" },
      { label: "Open 24/7", key: "open24_7", placeholder: "false" },
      { label: "Social profiles", key: "sameAs", placeholder: "https://facebook.com/..." },
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
    Recipe: [
      { label: "Recipe Name", key: "name", placeholder: "Chocolate Chip Cookies" },
      { label: "Description", key: "description", placeholder: "Short summary of the recipe" },
      { label: "Ingredients (one per line)", key: "ingredients", placeholder: "2 cups flour\n1 cup sugar" },
      { label: "Prep Time", key: "prepTime", placeholder: "PT15M" },
      { label: "Cook Time", key: "cookTime", placeholder: "PT30M" },
      { label: "Total Time", key: "totalTime", placeholder: "PT45M" },
      { label: "Recipe Yield", key: "recipeYield", placeholder: "4 servings" },
      { label: "Image(s)", key: "images", placeholder: "https://example.com/image.jpg, https://example.com/image2.jpg" },
      { label: "Instructions (one per line)", key: "recipeInstructions", placeholder: "Preheat oven to 180C.\nMix ingredients..." },
    ],
    "How-to": [
      { label: "How-to Title", key: "name", placeholder: "How to prune roses" },
      { label: "Description", key: "description", placeholder: "Short summary" },
      { label: "Tools (comma or newline)", key: "tools", placeholder: "Pruners, Gloves" },
      { label: "Supplies (comma or newline)", key: "supply", placeholder: "Mulch, Soil" },
      { label: "Steps (one per line)", key: "steps", placeholder: "Step 1\nStep 2\nStep 3" },
      { label: "Total Time", key: "totalTime", placeholder: "PT30M" },
    ],
    "Job Posting": [
      { label: "Job title", key: "title", placeholder: "Job's title" },
      { label: "Identifier", key: "identifier", placeholder: "Job ref / id" },
      { label: "Job's description (in HTML)", key: "jobDescription", placeholder: "Role responsibilities, HTML allowed" },
      { label: "Company", key: "hiringOrganization", placeholder: "Company name" },
      { label: "Company URL", key: "hiringOrganizationUrl", placeholder: "https://example.com" },
      { label: "Company logo", key: "companyLogo", placeholder: "https://example.com/logo.png" },
      { label: "Industry", key: "industry", placeholder: "Industry or sector" },
      { label: "Employment type", key: "employmentType", placeholder: "FULL_TIME, PART_TIME, CONTRACT" },
      { label: "Work hours (e.g. 8am-5pm)", key: "workHours", placeholder: "e.g. 8am-5pm, shift" },
      { label: "Date posted", key: "datePosted", placeholder: "yyyy-mm-dd" },
      { label: "Expire date", key: "validThrough", placeholder: "yyyy-mm-dd" },
      { label: "Remote job", key: "isRemote", placeholder: "false" },
      { label: "Country", key: "country", placeholder: "Country name or code" },
      { label: "State/Province/Region", key: "region", placeholder: "State or region" },
      { label: "Street", key: "street", placeholder: "Street address" },
      { label: "City", key: "city", placeholder: "City" },
      { label: "Zip / Postal code", key: "postalCode", placeholder: "Zip code" },
      { label: "Salary (min)", key: "minSalary", placeholder: "Minimum salary" },
      { label: "Max salary", key: "maxSalary", placeholder: "Maximum salary" },
      { label: "Currency", key: "currency", placeholder: "USD" },
      { label: "Per", key: "salaryUnit", placeholder: "YEAR, HOUR, MONTH" },
      { label: "Responsibilities", key: "responsibilities", placeholder: "Key responsibilities (one per line)" },
      { label: "Skills", key: "skills", placeholder: "Required skills (comma or newline)" },
      { label: "Qualifications", key: "qualifications", placeholder: "Qualifications required" },
      { label: "Education requirements", key: "educationRequirements", placeholder: "Education requirements" },
      { label: "Experience requirements", key: "experienceRequirements", placeholder: "Experience requirements" },
    ],
    Organization: [
      { label: "Organization Name", key: "name", placeholder: "Tembeya Wellness Retreats" },
      { label: "URL", key: "url", placeholder: "https://tembeyawellnessretreats.com" },
      { label: "Logo URL", key: "logo", placeholder: "https://example.com/logo.png" },
      { label: "Contact Email", key: "email", placeholder: "info@example.com" },
      { label: "Founder", key: "founder", placeholder: "Founder's name" },
      { label: "Founding date", key: "foundingDate", placeholder: "yyyy-mm-dd" },
      { label: "Street", key: "street", placeholder: "Street address" },
      { label: "City", key: "city", placeholder: "City" },
      { label: "State/Region", key: "region", placeholder: "State or region" },
      { label: "Zip / Postal code", key: "postalCode", placeholder: "Zip code" },
      { label: "Country", key: "country", placeholder: "Country name or code" },
    ],
    "Website Sitelinks Searchbox": [
      { label: "Site Name", key: "name", placeholder: "Example Site" },
      { label: "Site URL", key: "url", placeholder: "https://example.com" },
      {
        label: "Search URL Template",
        key: "urlTemplate",
        placeholder: "https://example.com/search?q={search_term_string}",
      },
      { label: "Description", key: "description", placeholder: "Short description of your site" },
    ],
    Person: [
      { label: "Name", key: "name", placeholder: "e.g. Jane Smith" },
      { label: "URL", key: "url", placeholder: "https://example.com/about/jane-smith" },
      { label: "Picture URL", key: "pictureUrl", placeholder: "https://example.com/images/jane-smith.jpg" },
      { label: "Social profiles", key: "sameAs", placeholder: "https://twitter.com/janesmith, https://linkedin.com/in/janesmith" },
      { label: "Job title", key: "jobTitle", placeholder: "e.g. Senior Marketing Manager, Author, Data Analyst" },
      { label: "Company", key: "worksFor", placeholder: "e.g. Acme Corporation, Self-employed" },
    ],
  }

  // Employment / salary options
  const EMPLOYMENT_TYPES = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACTOR",
    "TEMPORARY",
    "INTERN",
    "VOLUNTEER",
    "PER_DIEM",
  ]

  const EMPLOYMENT_TYPE_OPTIONS = [
    { value: "", label: "Select employment type" },
    { value: "FULL_TIME", label: "Full time" },
    { value: "PART_TIME", label: "Part time" },
    { value: "CONTRACTOR", label: "Contractor" },
    { value: "TEMPORARY", label: "Temporary" },
    { value: "INTERN", label: "Intern" },
    { value: "VOLUNTEER", label: "Volunteer" },
    { value: "PER_DIEM", label: "Per diem" },
    { value: "OTHER", label: "Other" },
  ]

  const SALARY_UNITS = ["YEAR", "MONTH", "WEEK", "DAY", "HOUR"]

  // Days of week for opening hours dropdown
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  // Map full day names (or short codes) to schema.org day codes
  const DAY_CODE_MAP: Record<string, string> = {
    Monday: "Mo",
    Mon: "Mo",
    Tuesday: "Tu",
    Tue: "Tu",
    Wednesday: "We",
    Wed: "We",
    Thursday: "Th",
    Thu: "Th",
    Friday: "Fr",
    Fri: "Fr",
    Saturday: "Sa",
    Sat: "Sa",
    Sunday: "Su",
    Sun: "Su",
  }

  const DAY_ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  const normalizeDaysToCodes = (daysRaw: string) => {
    if (!daysRaw) return []
    return daysRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((d) => DAY_CODE_MAP[d] || d)
      .filter(Boolean)
      .map((d) => (DAY_ORDER.includes(d) ? d : null))
      .filter(Boolean) as string[]
  }

  // Collapse consecutive day codes into ranges (e.g., Mo,Tu,We -> Mo-We)
  const collapseDayRanges = (codes: string[]) => {
    if (!codes || !codes.length) return []
    // Map codes to indices, sort and dedupe
    const idxs = Array.from(new Set(codes.map((c) => DAY_ORDER.indexOf(c)).filter((i) => i >= 0))).sort((a, b) => a - b)
    const ranges: string[] = []
    let start = idxs[0]
    let end = idxs[0]
    for (let i = 1; i < idxs.length; i++) {
      const cur = idxs[i]
      if (cur === end + 1) {
        end = cur
      } else {
        ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
        start = cur
        end = cur
      }
    }
    ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
    return ranges
  }
  // LocalBusiness @type options with descriptions
  const LOCAL_BUSINESS_TYPES: { value: string; desc: string }[] = [
    { value: "LocalBusiness", desc: "A particular physical business or branch of an organization." },
    { value: "AnimalShelter", desc: "Animal shelter." },
    { value: "AutomotiveBusiness", desc: "Car repair, sales, or parts." },
    { value: "ChildCare", desc: "A Childcare center." },
    { value: "Dentist", desc: "A dentist." },
    { value: "DryCleaningOrLaundry", desc: "A dry-cleaning business." },
    { value: "EmergencyService", desc: "Emergency services, such as fire station or ER." },
    { value: "EntertainmentBusiness", desc: "Entertainment provider." },
    { value: "FinancialService", desc: "Financial services business." },
    { value: "FoodEstablishment", desc: "A food-related business." },
    { value: "GovernmentOffice", desc: "A government office." },
    { value: "HealthAndBeautyBusiness", desc: "Health and beauty." },
    { value: "HomeAndConstructionBusiness", desc: "A construction business." },
    { value: "InternetCafe", desc: "An internet cafe." },
    { value: "LegalService", desc: "Legal services such as law firms." },
    { value: "Library", desc: "A library." },
    { value: "LodgingBusiness", desc: "Hotels, motels, or inns." },
    { value: "MedicalBusiness", desc: "Medical or healthcare business." },
    { value: "ProfessionalService", desc: "Provider of professional services." },
    { value: "RealEstateAgent", desc: "Real estate agent or firm." },
    { value: "Store", desc: "Retail store." },
    { value: "SportsActivityLocation", desc: "Sports or recreation facility." },
    { value: "TravelAgency", desc: "A travel agency." },
  ]

  // ---------- Subtype map ----------
  const SUBTYPE_MAP: Record<string, { value: string; desc: string }[]> = {
    FoodEstablishment: [
      { value: "Restaurant", desc: "Standard dining restaurant" },
      { value: "CafeOrCoffeeShop", desc: "Coffee & tea café" },
      { value: "BarOrPub", desc: "Alcohol service on premises" },
      { value: "Bakery", desc: "Bread, cake & pastries" },
      { value: "FastFoodRestaurant", desc: "Quick service" },
      { value: "IceCreamShop", desc: "Ice cream & frozen treats" },
      { value: "Winery", desc: "Wine production or tasting" },
      { value: "Brewery", desc: "Beer production" },
    ],
    HealthAndBeautyBusiness: [
      { value: "DaySpa", desc: "Spa & relaxation treatments" },
      { value: "HairSalon", desc: "Barber and hair styling" },
      { value: "BeautySalon", desc: "Cosmetic & makeup services" },
      { value: "TattooParlor", desc: "Tattoo studio" },
    ],
    LodgingBusiness: [
      { value: "Hotel", desc: "Full-service hotel" },
      { value: "Motel", desc: "Roadside motel" },
      { value: "Resort", desc: "Resort & recreation" },
      { value: "BedAndBreakfast", desc: "Hosted B&B" },
      { value: "VacationRental", desc: "Short-term rental" },
    ],
    Store: [
      { value: "GroceryStore", desc: "Supermarket" },
      { value: "ClothingStore", desc: "Fashion retail" },
      { value: "ElectronicsStore", desc: "Tech & electronics" },
      { value: "FurnitureStore", desc: "Furniture & décor" },
      { value: "PetStore", desc: "Pet supplies" },
      { value: "JewelryStore", desc: "Jewelry & watches" },
    ],
  }

  // Organization types and subtypes (used in Organization form)
  const ORG_TYPES: { value: string; desc: string }[] = [
    { value: "Organization", desc: "A general organization like a business, NGO, or club." },
    { value: "Airline", desc: "Provides passenger flight services." },
    { value: "Consortium", desc: "A membership body of organizations." },
    { value: "Corporation", desc: "A registered business company." },
    { value: "EducationalOrganization", desc: "A school, college, or learning institution." },
    { value: "FundingScheme", desc: "Grant funding program." },
    { value: "GovernmentOrganization", desc: "Public or state-run institution." },
    { value: "LibrarySystem", desc: "Network of cooperating libraries." },
    { value: "MedicalOrganization", desc: "Healthcare provider." },
    { value: "NGO", desc: "Non-profit organization." },
    { value: "NewsMediaOrganization", desc: "Publishes or broadcasts news." },
    { value: "OnlineBusiness", desc: "Internet-based business." },
    { value: "PerformingGroup", desc: "Music, dance, or theater group." },
    { value: "PoliticalParty", desc: "Organized political movement." },
    { value: "Project", desc: "Organized planned initiative." },
    { value: "ResearchOrganization", desc: "Academic or scientific research." },
    { value: "SearchRescueOrganization", desc: "Emergency search & rescue." },
    { value: "SportsOrganization", desc: "Sports organizing body." },
    { value: "WorkersUnion", desc: "Represents employees’ interests." },
  ]

  const ORG_SUBTYPE_MAP: Record<string, { value: string; desc: string }[]> = {
    EducationalOrganization: [
      { value: "CollegeOrUniversity", desc: "Higher education institution." },
      { value: "ElementarySchool", desc: "Primary education." },
      { value: "HighSchool", desc: "Secondary education." },
      { value: "MiddleSchool", desc: "Intermediate level school." },
      { value: "Preschool", desc: "Early childhood education." },
      { value: "School", desc: "General education facility." },
    ],
    MedicalOrganization: [
      { value: "Dentist", desc: "Dental healthcare." },
      { value: "Hospital", desc: "Large healthcare facility." },
      { value: "MedicalClinic", desc: "Outpatient healthcare." },
      { value: "Pharmacy", desc: "Dispenses medicines." },
      { value: "Physician", desc: "Licensed medical doctor." },
      { value: "VeterinaryCare", desc: "Animal healthcare." },
    ],
    PerformingGroup: [
      { value: "DanceGroup", desc: "Dance performers." },
      { value: "MusicGroup", desc: "Musical group." },
      { value: "TheaterGroup", desc: "Stage performers." },
    ],
    SportsOrganization: [
      { value: "SportsClub", desc: "Organized sports club." },
      { value: "SportsTeam", desc: "Team in competitions." },
    ],
  }

  const EVENT_STATUSES = [
    { value: "", label: "None" },
    { value: "EventScheduled", label: "Scheduled" },
    { value: "EventPostponed", label: "Postponed" },
    { value: "EventCancelled", label: "Cancelled" },
    { value: "EventMovedOnline", label: "Moved online" },
  ]

  const ATTENDANCE_MODES = [
    { value: "", label: "None" },
    { value: "OnlineEventAttendanceMode", label: "Online" },
    { value: "OfflineEventAttendanceMode", label: "Offline" },
    { value: "MixedEventAttendanceMode", label: "Mixed" },
  ]

  const PERFORMER_TYPES = [
    { value: "", label: "None" },
    { value: "Person", label: "Person" },
    { value: "PerformingGroup", label: "Performing group" },
    { value: "MusicGroup", label: "Music group" },
    { value: "DanceGroup", label: "Dance group" },
    { value: "TheaterGroup", label: "Theater group" },
    { value: "Organization", label: "Organization" },
  ]

  const TICKET_AVAILABILITY_OPTIONS = [
    { value: "", label: "Not specified" },
    { value: "InStock", label: "In stock" },
    { value: "OutOfStock", label: "Sold out" },
    { value: "PreOrder", label: "Pre-order" },
  ]

  // Common currencies (small static list). Replace or extend if you installed a package.
  const COMMON_CURRENCIES = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "KES", name: "Kenyan Shilling" },
    { code: "UGX", name: "Ugandan Shilling" },
    { code: "TZS", name: "Tanzanian Shilling" },
  ]

  // Build a complete currency list from available packages, preferring `currency-list`, then `currency-codes`, then fallback
  const ALL_CURRENCIES: { code: string; name: string }[] = (() => {
    const safeName = (val: any) => {
      if (val == null) return ""
      if (typeof val === "string") return val
      if (typeof val === "object") return String(val.currency || val.name || val.code || JSON.stringify(val))
      return String(val)
    }

    try {
      // Use currency-codes (codes() returns an array of currency codes)
      if (currencyCodes && typeof currencyCodes.codes === "function") {
        const codes = currencyCodes.codes()
        if (Array.isArray(codes) && codes.length) {
          return codes
            .map((c: any) => {
              const code = typeof c === "string" ? c : (c && c.code) || String(c)
              // Try to get a friendly name via currencyCodes.code(code)
              try {
                const info: any = currencyCodes.code(String(code))
                const name = info && (info.currency || info.code) ? safeName(info.currency || info.code) : String(code)
                return { code: String(code), name }
              } catch {
                return { code: String(code), name: String(code) }
              }
            })
            .filter((c: any) => c && c.code)
            .sort((a: any, b: any) => a.code.localeCompare(b.code))
        }
      }
    } catch (e) {
      // ignore and fall back
    }

    return COMMON_CURRENCIES
  })()

  // Countries list (requires `country-list` package)
  // Countries list using `i18n-iso-countries` (English locale)
  // Build list of { name, code } and prefer storing ISO codes as the field value.
  countries.registerLocale(enLocale)
  const COUNTRY_LIST: { name: string; code?: string }[] = Object.entries(countries.getNames('en', { select: 'official' }) || {})
    .map(([code, name]) => ({ name, code }))
    .filter((c) => c && c.name)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  // Small states/provinces map for common countries (used when `react-country-state-fields` not available)
  const STATES_BY_COUNTRY: Record<string, string[]> = {
    US: [
      'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
    ],
    CA: [
      'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'
    ],
    GB: [
      'England','Scotland','Wales','Northern Ireland'
    ],
    AU: [
      'New South Wales','Queensland','South Australia','Tasmania','Victoria','Western Australia','Australian Capital Territory','Northern Territory'
    ],
    KE: [
      'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret'
    ]
  }

  // Region select helper state: when user chooses 'Other', show a custom input
  const [regionCustomVisible, setRegionCustomVisible] = useState<boolean>(false)

  // Dynamically load optional State component from `react-country-state-fields` if available.
  const [StateSelectComp, setStateSelectComp] = useState<ComponentType<StateProps> | null>(null)

  useEffect(() => {
    let mounted = true
    import("react-country-state-fields")
      .then((mod: any) => {
        if (!mounted) return
        const State = mod.StateSelect || mod.State || mod.default?.State || mod.default || null
        if (State) setStateSelectComp(() => State)
      })
      .catch(() => {
        // ignore if module not present or fails to load; fallbacks will be used
      })
    return () => {
      mounted = false
    }
  }, [])

  // Helper: derive a 2-letter ISO country code from the stored `fields.country` value.
  const getSelectedCountryCode = (countryVal?: string) => {
    if (!countryVal) return undefined
    // If user or selector already provided a 2-letter uppercase code, use it directly
    if (/^[A-Z]{2}$/.test(countryVal)) return countryVal
    // Otherwise try to map a country name to ISO alpha-2 code using i18n-iso-countries
    try {
      const code = countries.getAlpha2Code(countryVal, 'en')
      return code || undefined
    } catch {
      return undefined
    }
  }

  const selectedCountryCode = getSelectedCountryCode(fields.country)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Shared FAQ items for Schema Builder
  const FAQ_ITEMS = [
    {
      q: "What schema type should I choose?",
      a: "Pick the schema type that best matches the page content — e.g. use Article for blog posts, Product for product pages, and FAQPage for Q&A sections.",
    },
    {
      q: "How do I test the generated JSON-LD?",
      a: "Use the Google Rich Results Test or the Schema Markup Validator — there's a Test button in the preview toolbar that copies your JSON-LD and opens Google's tester.",
    },
    {
      q: "Do I need to include every field?",
      a: "No — include the most important, factual fields (title, URL, date, author, price). Optional fields can be omitted, but richer data increases chances for enhanced results.",
    },
    {
      q: "Can I use multiple images?",
      a: "Yes — add multiple image URLs and the builder will include them as an array on the `image` property or a single string when only one is provided.",
    },
  ]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  }

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
      return <div className="validation-message">{msg}</div>
    }
    return <div className="validation-message">{msg}</div>
  }

  const isValidUrl = (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const updateBreadcrumb = (index: number, key: "name" | "url", value: string) => {
    setBreadcrumbs((prev) => {
      const next = prev.slice()
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // validate URL when updating url field
    if (key === "url") {
      const errKey = `breadcrumb_url_${index}`
      setErrors((prev) => {
        const next = { ...prev }
        if (!value || value.trim() === "") {
          // empty -> remove error
          delete next[errKey]
        } else if (!isValidUrl(value.trim())) {
          next[errKey] = "Invalid URL format"
        } else {
          delete next[errKey]
        }
        return next
      })
    }
  }

  const addBreadcrumb = () => setBreadcrumbs((prev) => [...prev, { name: "", url: "" }])

  const removeBreadcrumb = (index: number) =>
    setBreadcrumbs((prev) => prev.filter((_, i) => i !== index))

  const updateFaqItem = (index: number, key: "question" | "answer", value: string) => {
    setFaqItemsState((prev) => {
      const next = prev.slice()
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // validate question/answer presence
    const errKey = `faq_${key}_${index}`
    const trimmed = value ? value.trim() : ""
    setErrors((prev) => {
      const next = { ...prev }
      if (!trimmed) {
        next[errKey] = key === "question" ? "Question cannot be empty" : "Answer cannot be empty"
      } else {
        delete next[errKey]
      }
      return next
    })
  }

  const addFaqItem = () => setFaqItemsState((prev) => [...prev, { question: "", answer: "" }])

  const removeFaqItem = (index: number) => {
    setFaqItemsState((prev) => prev.filter((_, i) => i !== index))
    // clear faq-related errors (re-validation will occur on edits)
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith("faq_question_") || k.startsWith("faq_answer_")) delete next[k]
      })
      return next
    })
  }

  // Social profiles handlers
  const handleSocialChange = (index: number, value: string) => {
    setSocialProfiles((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    // optional: validate social url
    validateField(`sameAs_${index}`, value, fields)
  }

  // When a social profile input is blurred, remove the last empty profile (like images/video thumbs)
  const handleSocialBlur = (index: number) => {
    const val = (socialProfiles && socialProfiles[index]) ? socialProfiles[index].trim() : ""
    // if the blurred field is empty and it's the last item, remove it
    if (!val && socialProfiles && index === socialProfiles.length - 1) {
      removeSocialProfile(index)
      return
    }
    // re-run validation on blur
    validateField(`sameAs_${index}`, val, fields)
  }

  // Opening hours handlers
  const addOpeningHour = () => {
    // Prevent adding opening hours when Open 24/7 is checked
    if ((fields.open24_7 || "") === "true") {
      // set a small validation hint
      setErrors((prev) => ({ ...prev, openingHours: "Cannot add hours while 'Open 24/7' is enabled" }))
      return
    }
    // clear any openingHours error when adding
    setErrors((prev) => {
      const next = { ...prev }
      delete next.openingHours
      return next
    })
    setOpeningHoursState((prev) => [...prev, { days: "", opens: "", closes: "" }])
  }
  const updateOpeningHour = (index: number, key: "days" | "opens" | "closes", value: string) => {
    // Validate time inputs for opens/closes (HH:MM 24-hour)
    const isValidTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test((v || "").trim())

    if (key === "opens" || key === "closes") {
      if (value && value.trim() && !isValidTime(value.trim())) {
        setErrors((prev) => ({ ...prev, [`openingHours_time_${index}_${key}`]: "Time must be in HH:MM (24-hour) format" }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[`openingHours_time_${index}_${key}`]
          return next
        })
      }
    }

    setOpeningHoursState((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }
  const removeOpeningHour = (index: number) => setOpeningHoursState((prev) => prev.filter((_, i) => i !== index))

  // Departments handlers
  const addDepartment = () => setDepartments((prev) => [...prev, { localBusinessType: "LocalBusiness", moreSpecificType: "", name: "", imageUrl: "", telephone: "", days: "", opens: "", closes: "" }])
  const updateDepartment = (index: number, key: string, value: string) => {
    try { console.debug("updateDepartment", { index, key, value }) } catch {}
    setDepartments((prev) => {
      const next = [...prev]
      const item = { ...next[index], [key]: value }

      // When LocalBusiness @type changes, keep moreSpecificType EMPTY unless user explicitly picks one.
      // Only clear invalid values; do NOT auto-select first subtype (so placeholder can show).
      if (key === "localBusinessType") {
        const parent = value || ""
        const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
        if (opts && opts.length) {
          if (!item.moreSpecificType || !opts.some((o) => o.value === item.moreSpecificType)) {
            item.moreSpecificType = "" // allow placeholder "Select Option" to appear
          }
        } else {
          item.moreSpecificType = "" // no subtypes for this parent
        }
      }

      next[index] = item
      return next
    })
  }
  const removeDepartment = (index: number) => setDepartments((prev) => prev.filter((_, i) => i !== index))

  // Contacts handlers (Organization)
  const addContact = () => setContacts((prev) => [...prev, { contactType: "Customer service", phone: "", areaServed: "", availableLanguage: "", options: "" }])
  const updateContact = (index: number, key: string, value: string) => {
    setContacts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }
  const removeContact = (index: number) => setContacts((prev) => prev.filter((_, i) => i !== index))

  const addSocialProfile = () => setSocialProfiles((prev) => [...prev, ""])

  const removeSocialProfile = (index: number) => {
    setSocialProfiles((prev) => prev.filter((_, i) => i !== index))
    // clear related errors
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith("sameAs_") ) delete next[k]
      })
      return next
    })
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

    // Per-video-thumbnail validation (videoThumbs_0, videoThumbs_1, etc.)
    if (/^videoThumbs_\d+$/.test(key)) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    const lk = key.toLowerCase()

    // Special validation for searchbox URL templates: must include the placeholder
    if (key === "urlTemplate") {
      const ok = /^(https?:\/\/)/.test(trimmed) && trimmed.includes("{search_term_string}")
      if (!ok) nextErrors[key] = "URL template must be a valid URL and include {search_term_string}"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Special validation for SeekToAction target templates: must include the placeholder
    if (key === "seekToTarget") {
      const ok = /^(https?:\/\/)/.test(trimmed) && trimmed.includes("{seek_to_second_number}")
      if (!ok) nextErrors[key] = "SeekTo URL must be a valid URL and include {seek_to_second_number}"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Job-related date fields validation
    if (key === "datePosted" || key === "validThrough") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) nextErrors[key] = "Date must be in yyyy-mm-dd format"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Organization founding date
    if (key === "foundingDate") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) nextErrors[key] = "Date must be in yyyy-mm-dd format"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Salary numeric enforcement for min/max salary fields
    if (key === "minSalary" || key === "maxSalary") {
      if (trimmed && isNaN(Number(trimmed))) nextErrors[key] = "Salary must be a number"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // employmentType and salaryUnit should be one of allowed options when present
    if (key === "employmentType") {
      const allowed = EMPLOYMENT_TYPES
      if (trimmed && !allowed.includes(trimmed)) nextErrors[key] = `Employment type must be one of: ${allowed.join(", ")}`
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    if (key === "salaryUnit") {
      const allowed = SALARY_UNITS
      if (trimmed && !allowed.includes(trimmed)) nextErrors[key] = `Per must be one of: ${allowed.join(", ")}`
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    if (
      lk.includes("url") ||
      lk.includes("logo") ||
      lk.includes("image") ||
      // treat repeater keys like sameAs_0, sameAs_1 as URL entries
      key.toLowerCase().startsWith("sameas_")
    ) {
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

  // Validate socialProfiles entries whenever they change
  useEffect(() => {
    socialProfiles.forEach((s, i) => validateField(`sameAs_${i}`, s, fields))
  }, [socialProfiles, fields])

  // Validate videoThumbnails entries whenever they change
  useEffect(() => {
    videoThumbnails.forEach((t, i) => validateField(`videoThumbs_${i}`, t, fields))
  }, [videoThumbnails, fields])

  // Validate department image URLs and opening hours
  useEffect(() => {
    departments.forEach((dept, i) => {
      if (dept.imageUrl) validateField(`dept_imageUrl_${i}`, dept.imageUrl, fields)
      if (dept.opens) {
        if (!/^\d{2}:\d{2}$/.test(dept.opens.trim())) {
          setErrors((prev) => ({ ...prev, [`dept_opens_${i}`]: "Time must be in HH:MM format (e.g. 08:00)" }))
        } else {
          setErrors((prev) => {
            const next = { ...prev }
            delete next[`dept_opens_${i}`]
            return next
          })
        }
      }
      if (dept.closes) {
        if (!/^\d{2}:\d{2}$/.test(dept.closes.trim())) {
          setErrors((prev) => ({ ...prev, [`dept_closes_${i}`]: "Time must be in HH:MM format (e.g. 21:00)" }))
        } else {
          setErrors((prev) => {
            const next = { ...prev }
            delete next[`dept_closes_${i}`]
            return next
          })
        }
      }
    })
  }, [departments, fields])

  // Validate contacts repeater: require phone and basic checks
  useEffect(() => {
    contacts.forEach((c, i) => {
      setErrors((prev) => {
        const next = { ...prev }
        const key = `contact_phone_${i}`
        if (!c.phone || !c.phone.trim()) next[key] = "Phone is required for each contact"
        else delete next[key]
        return next
      })
      // validate areaServed/options formatting could be added later
    })
  }, [contacts])

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

      // If user changes the top-level LocalBusiness @type, mirror localbusiness.js behavior:
      // - if there are subtypes in SUBTYPE_MAP for the selected parent, set `moreSpecificType` to the first available option when the current value isn't valid
      // - otherwise clear `moreSpecificType`
      if (key === "localBusinessType") {
        const parent = val || ""
        const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
        let nextMore = prev.moreSpecificType || ""
        if (opts && opts.length) {
          const ok = nextMore && opts.some((o) => o.value === nextMore)
          if (!ok) nextMore = opts[0].value
        } else {
          nextMore = ""
        }

        const next = { ...prev, [key]: val, moreSpecificType: nextMore }
        validateField(key, val, next)
        validateField("moreSpecificType", nextMore, next)
        return next
      }

      // If user changes the top-level Organization @type, mirror Organization behavior:
      // - if there are subtypes in ORG_SUBTYPE_MAP for the selected parent, set `moreSpecificType` to the first available option when the current value isn't valid
      // - otherwise clear `moreSpecificType`
      if (key === "organizationType") {
        const parent = val || ""
        const opts = parent && ORG_SUBTYPE_MAP[parent] ? ORG_SUBTYPE_MAP[parent] : []
        let nextMore = prev.moreSpecificType || ""
        if (opts && opts.length) {
          const ok = nextMore && opts.some((o) => o.value === nextMore)
          if (!ok) nextMore = opts[0].value
        } else {
          nextMore = ""
        }

        const next = { ...prev, [key]: val, moreSpecificType: nextMore }
        validateField(key, val, next)
        validateField("moreSpecificType", nextMore, next)
        return next
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
      delete base.author // avoid duplicate if set via fields

      return base
    }

    if (type === "Breadcrumb") {
      // prefer explicit breadcrumb state; otherwise fallback to fields.itemList
      const items = breadcrumbs && breadcrumbs.length
        ? breadcrumbs.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: b.name || `Page ${i + 1}`,
            item: b.url || "",
          }))
        : (fields.itemList ? fields.itemList.split("\n").map((line: string, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            name: line.split("|")[0] || `Page ${i + 1}`,
            item: (line.split("|")[1] || "").trim(),
          })) : [])

      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.filter((it: any) => it.item && it.item.length)
      }
    }

    if (type === "FAQ Page") {
      const mainEntity = (faqItemsState || [])
        .map((f) => ({
          "@type": "Question",
          name: (f.question || "").trim(),
          acceptedAnswer: { "@type": "Answer", text: (f.answer || "").trim() },
        }))
        .filter((q) => q.name && q.acceptedAnswer.text)

      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity,
      }
    }

    if (type === "Person") {
      const person: any = { "@context": "https://schema.org", "@type": "Person" }

      if (fields.name && fields.name.trim()) person.name = fields.name.trim()
      if (fields.url && fields.url.trim()) person.url = fields.url.trim()
      // pictureUrl -> image
      if (fields.pictureUrl && fields.pictureUrl.trim()) person.image = fields.pictureUrl.trim()
      // prefer socialProfiles state if present, otherwise fallback to fields.sameAs
      const sa = (socialProfiles && socialProfiles.length)
        ? socialProfiles.map((s) => s.trim()).filter(Boolean)
        : (fields.sameAs && fields.sameAs.trim()
          ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean)
          : [])
      if (sa.length) person.sameAs = sa

      // worksFor -> Organization object
      if (fields.worksFor && fields.worksFor.trim()) {
        person.worksFor = { "@type": "Organization", name: fields.worksFor.trim() }
      }

      // jobTitle kept last in UI, include if present
      if (fields.jobTitle && fields.jobTitle.trim()) person.jobTitle = fields.jobTitle.trim()

      return person
    }

    if (type === "Product") {
      // Offers (required for Product)
      if (fields.price && fields.price.trim()) {
        const offer: any = {
          "@type": "Offer",
          price: fields.price.trim(),
          priceCurrency: fields.currency || "USD",
        }
        if (fields.availability && fields.availability.trim()) {
          const avail = fields.availability.trim()
          offer.availability = avail.startsWith("http") ? avail : `https://schema.org/${avail}`
        }
        if (fields.priceValidUntil && fields.priceValidUntil.trim()) {
          offer.priceValidUntil = fields.priceValidUntil.trim()
        }
        if (fields.url && fields.url.trim()) {
          offer.url = fields.url.trim()
        }
        if (fields.itemCondition && fields.itemCondition.trim()) {
          const cond = fields.itemCondition.trim()
          offer.itemCondition = cond.startsWith("http") ? cond : `https://schema.org/${cond}`
        }
        base.offers = offer
      }

      // AggregateRating (if rating provided)
      if (fields.ratingValue && fields.ratingValue.trim()) {
        const rating: any = {
          "@type": "AggregateRating",
          ratingValue: fields.ratingValue.trim(),
        }
        if (fields.reviewCount && fields.reviewCount.trim()) {
          rating.reviewCount = fields.reviewCount.trim()
        }
        base.aggregateRating = rating
      }

      // Clean up helper keys
      delete base.price
      delete base.currency
      delete base.priceValidUntil
      delete base.availability
      delete base.itemCondition
      delete base.ratingValue
      delete base.reviewCount
    }

    if (type === "Event") {
      // Location (simple place name) if provided
      if (fields.location) {
        base.location = { "@type": "Place", name: fields.location }
      }

      // Combine date + time into an ISO-like datetime when both provided
      const combineDateTime = (date?: string, time?: string) => {
        if (!date) return undefined
        const d = date.trim()
        const t = time && time.trim() ? time.trim() : null
        return t ? `${d}T${t}` : d
      }

      const sdt = combineDateTime(fields.startDate, fields.startTime)
      const edt = combineDateTime(fields.endDate, fields.endTime)
      if (sdt) base.startDate = sdt
      if (edt) base.endDate = edt

      // Performer
      if (fields.performerName && fields.performerName.trim()) {
        base.performer = { "@type": (fields.performerType && fields.performerType.trim()) || "Person", name: fields.performerName.trim() }
      }

      // Event status and attendance mode (ensure full URLs)
      if (fields.eventStatus && fields.eventStatus.trim()) {
        const status = fields.eventStatus.trim()
        base.eventStatus = status.startsWith("http") ? status : `https://schema.org/${status}`
      }
      if (fields.attendanceMode && fields.attendanceMode.trim()) {
        const mode = fields.attendanceMode.trim()
        base.eventAttendanceMode = mode.startsWith("http") ? mode : `https://schema.org/${mode}`
      }

      // Image url
      if (fields.imageUrl && fields.imageUrl.trim()) base.image = fields.imageUrl.trim()

      // Ticket types -> offers
      if (ticketTypes && ticketTypes.length) {
        const offers = ticketTypes
          .map((t) => {
            const has = (t.name || "").trim() || (t.price || "").trim()
            if (!has) return null
            const of: any = { "@type": "Offer" }
            if (t.name && t.name.trim()) of.name = t.name.trim()
            if (t.price && (t.price || "").trim()) of.price = (t.price || "").trim()
            // priceCurrency: per-ticket or fallback to ticketDefaultCurrency
            of.priceCurrency = (t.currency && t.currency.trim()) || (ticketDefaultCurrency && ticketDefaultCurrency.trim()) || undefined
            if (t.url && t.url.trim()) of.url = t.url.trim()
            if (t.availability && t.availability.trim()) {
              const raw = t.availability.trim()
              of.availability = raw.startsWith("http") ? raw : `https://schema.org/${raw}`
            }
            if (t.availableFrom && t.availableFrom.trim()) {
              // use provided date as validFrom; assume yyyy-mm-dd or ISO-like string
              of.validFrom = t.availableFrom.trim()
            }
            return Object.keys(of).length > 1 ? of : null
          })
          .filter(Boolean)
        if (offers.length === 1) base.offers = offers[0]
        else if (offers.length > 1) base.offers = offers
      }

      // Clean up helper fields
      delete base.location // will be replaced by structured location above if needed
      delete base.performerName
      delete base.performerType
      delete base.startTime
      delete base.endTime
      delete base.imageUrl

      return base
    }

    if (type === "Website Sitelinks Searchbox") {
      const site: any = { "@context": "https://schema.org", "@type": "WebSite" }
      if (fields.name && fields.name.trim()) site.name = fields.name.trim()
      if (fields.url && fields.url.trim()) site.url = fields.url.trim()
      if (fields.description && fields.description.trim()) site.description = fields.description.trim()
      if (fields.urlTemplate && fields.urlTemplate.trim()) {
        site.potentialAction = {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: fields.urlTemplate.trim(),
          },
          "query-input": "required name=search_term_string",
        }
      }
      return site
    }

    if (type === "Video") {
      const video: any = { "@context": "https://schema.org", "@type": "VideoObject" }
      if (fields.name && fields.name.trim()) video.name = fields.name.trim()
      if (fields.description && fields.description.trim()) video.description = fields.description.trim()

      // Thumbnails: prefer videoThumbnails state, otherwise fallback to fields.thumbnailUrl
      const thumbs = (videoThumbnails && videoThumbnails.length)
        ? videoThumbnails.map((s) => (s || "").trim()).filter(Boolean)
        : (fields.thumbnailUrl ? fields.thumbnailUrl.split(",").map((s) => s.trim()).filter(Boolean) : [])
      if (thumbs.length === 1) video.thumbnailUrl = thumbs[0]
      else if (thumbs.length > 1) video.thumbnailUrl = thumbs

      if (fields.uploadDate && fields.uploadDate.trim()) video.uploadDate = fields.uploadDate.trim()

      // Duration: prefer explicit duration field, otherwise combine minutes/seconds
      let durationVal = fields.duration && fields.duration.trim() ? fields.duration.trim() : ""
      if (!durationVal) {
        const m = parseInt(videoMinutes || "0", 10) || 0
        const s = parseInt(videoSeconds || "0", 10) || 0
        if (m || s) durationVal = `PT${m}M${s}S`
      }
      if (durationVal) video.duration = durationVal

      if (fields.contentUrl && fields.contentUrl.trim()) video.contentUrl = fields.contentUrl.trim()
      if (fields.embedUrl && fields.embedUrl.trim()) video.embedUrl = fields.embedUrl.trim()

      if (fields.seekToTarget && fields.seekToTarget.trim()) {
        video.potentialAction = {
          "@type": "SeekToAction",
          target: { "@type": "EntryPoint", urlTemplate: fields.seekToTarget.trim() },
          "startOffset-input": "required name=seek_to_second_number",
        }
      }

      // Clean up helper fields
      delete video.thumbnailUrl // handled above
      delete video.duration // handled above
      delete video.seekToTarget

      return video
    }

    if (type === "Recipe") {
      const recipe: any = { "@context": "https://schema.org", "@type": "Recipe" }
      if (fields.name && fields.name.trim()) recipe.name = fields.name.trim()
      if (fields.description && fields.description.trim()) recipe.description = fields.description.trim()

      // Author (recommended by Google)
      if (fields.authorName && fields.authorName.trim()) {
        recipe.author = {
          "@type": fields.authorType || "Person",
          name: fields.authorName.trim(),
        }
        if (fields.authorUrl && fields.authorUrl.trim()) {
          recipe.author.url = fields.authorUrl.trim()
        }
      }

      // Images: reuse images state or fields.images
      if (images && images.length) {
        const imgs = images.map((s) => s.trim()).filter(Boolean)
        if (imgs.length === 1) recipe.image = imgs[0]
        else if (imgs.length > 1) recipe.image = imgs
      } else if (fields.images && fields.images.trim()) {
        const imgs = fields.images.split(",").map((s) => s.trim()).filter(Boolean)
        recipe.image = imgs.length === 1 ? imgs[0] : imgs
      }

      // Ingredients (allow newline or comma-separated)
      if (fields.ingredients && fields.ingredients.trim()) {
        const parts = fields.ingredients.includes("\n")
          ? fields.ingredients.split(/\r?\n/)
          : fields.ingredients.split(",")
        recipe.recipeIngredient = parts.map((p) => p.trim()).filter(Boolean)
      }

      if (fields.prepTime && fields.prepTime.trim()) recipe.prepTime = fields.prepTime.trim()
      if (fields.cookTime && fields.cookTime.trim()) recipe.cookTime = fields.cookTime.trim()
      if (fields.totalTime && fields.totalTime.trim()) recipe.totalTime = fields.totalTime.trim()
      if (fields.recipeYield && fields.recipeYield.trim()) recipe.recipeYield = fields.recipeYield.trim()

      // Instructions: one step per line -> HowToStep array
      if (fields.recipeInstructions && fields.recipeInstructions.trim()) {
        const steps = fields.recipeInstructions.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
        if (steps.length === 1) recipe.recipeInstructions = steps[0]
        else recipe.recipeInstructions = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
      }

      // Clean up helper fields
      delete recipe.images
      delete recipe.ingredients
      delete recipe.authorName
      delete recipe.authorUrl
      delete recipe.authorType

      return recipe
    }

    if (type === "How-to") {
      const howto: any = { "@context": "https://schema.org", "@type": "HowTo" }
      if (fields.name && fields.name.trim()) howto.name = fields.name.trim()
      if (fields.description && fields.description.trim()) howto.description = fields.description.trim()
      if (fields.totalTime && fields.totalTime.trim()) howto.totalTime = fields.totalTime.trim()

      // Tools and supplies (comma or newline separated)
      const parseList = (s?: string) => {
        if (!s) return []
        const arr = s.includes("\n") ? s.split(/\r?\n/) : s.split(",")
        return arr.map((x) => x.trim()).filter(Boolean)
      }

      // Prefer repeater state if available; otherwise fall back to free-text fields
      const tools = howToTools && howToTools.length ? howToTools.map((t) => (t || "").trim()).filter(Boolean) : parseList(fields.tools)
      const supply = howToSupplies && howToSupplies.length ? howToSupplies.map((s) => (s || "").trim()).filter(Boolean) : parseList(fields.supply)
      if (tools.length) howto.tool = tools
      if (supply.length) howto.supply = supply

      // Steps: prefer structured `howToSteps` state
      if (howToSteps && howToSteps.length && howToSteps.some((s) => (s.instruction || "").trim())) {
        const steps = howToSteps
          .map((s) => ({
            "@type": "HowToStep",
            position: 0, // set position later
            text: s.instruction && s.instruction.trim() ? s.instruction.trim() : undefined,
            name: s.name && s.name.trim() ? s.name.trim() : undefined,
            image: s.imageUrl && s.imageUrl.trim() ? s.imageUrl.trim() : undefined,
            url: s.url && s.url.trim() ? s.url.trim() : undefined,
          }))
          .filter((s) => s.text)
        howto.step = steps.map((s, i) => ({ ...s, position: i + 1 }))
      } else if (fields.steps && fields.steps.trim()) {
        const steps = fields.steps.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
        howto.step = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
      }

      // Clean up helper fields
      delete howto.tools
      delete howto.supply
      delete howto.steps

      return howto
    }

    if (type === "Job Posting") {
      const job: any = { "@context": "https://schema.org", "@type": "JobPosting" }
      if (fields.title && fields.title.trim()) job.title = fields.title.trim()
      if (fields.jobDescription && fields.jobDescription.trim()) job.description = fields.jobDescription.trim()
      if (fields.datePosted && fields.datePosted.trim()) job.datePosted = fields.datePosted.trim()
      if (fields.validThrough && fields.validThrough.trim()) job.validThrough = fields.validThrough.trim()
      if (fields.employmentType && fields.employmentType.trim()) job.employmentType = fields.employmentType.trim()
      if (fields.workHours && fields.workHours.trim()) job.workHours = fields.workHours.trim()

      // Hiring organization with optional URL and logo
      if (fields.hiringOrganization && fields.hiringOrganization.trim()) {
        job.hiringOrganization = { "@type": "Organization", name: fields.hiringOrganization.trim() }
        if (fields.hiringOrganizationUrl && fields.hiringOrganizationUrl.trim()) job.hiringOrganization.sameAs = fields.hiringOrganizationUrl.trim()
        if (fields.companyLogo && fields.companyLogo.trim()) job.hiringOrganization.logo = fields.companyLogo.trim()
      }

      // Identifier
      if (fields.identifier && fields.identifier.trim()) job.identifier = { "@type": "PropertyValue", value: fields.identifier.trim() }

      // Location (structured address)
      const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
      if (hasAddress) {
        const addr: any = { "@type": "PostalAddress" }
        if (fields.street && fields.street.trim()) addr.streetAddress = fields.street.trim()
        if (fields.city && fields.city.trim()) addr.addressLocality = fields.city.trim()
        if (fields.region && fields.region.trim()) addr.addressRegion = fields.region.trim()
        if (fields.postalCode && fields.postalCode.trim()) addr.postalCode = fields.postalCode.trim()
        if (fields.country && fields.country.trim()) addr.addressCountry = fields.country.trim()
        job.jobLocation = { "@type": "Place", address: addr }
      }

      // Remote job indicator
      if (fields.isRemote === "true") job.jobLocationType = "TELECOMMUTE"

      // Salary range (min/max) -> MonetaryAmount with QuantitativeValue
      const minRaw = fields.minSalary && fields.minSalary.trim() ? Number(fields.minSalary.trim()) : NaN
      const maxRaw = fields.maxSalary && fields.maxSalary.trim() ? Number(fields.maxSalary.trim()) : NaN
      const currency = (fields.currency && fields.currency.trim()) || "USD"
      const unitText = fields.salaryUnit && fields.salaryUnit.trim() ? fields.salaryUnit.trim() : undefined
      if (Number.isFinite(minRaw) || Number.isFinite(maxRaw)) {
        const value: any = { "@type": "QuantitativeValue" }
        if (Number.isFinite(minRaw)) value.minValue = minRaw
        if (Number.isFinite(maxRaw)) value.maxValue = maxRaw
        if (unitText) value.unitText = unitText
        job.baseSalary = { "@type": "MonetaryAmount", currency, value }
      }

      // Responsibilities, skills, qualifications, education, experience
      if (fields.responsibilities && fields.responsibilities.trim()) job.responsibilities = fields.responsibilities.trim()
      if (fields.skills && fields.skills.trim()) job.skills = fields.skills.split(/\r?\n|,\s*/).map((s) => s.trim()).filter(Boolean)
      if (fields.qualifications && fields.qualifications.trim()) job.qualifications = fields.qualifications.trim()
      if (fields.educationRequirements && fields.educationRequirements.trim()) job.educationRequirements = fields.educationRequirements.trim()
      if (fields.experienceRequirements && fields.experienceRequirements.trim()) job.experienceRequirements = fields.experienceRequirements.trim()

      // Clean up helper fields
      delete job.jobDescription
      delete job.hiringOrganizationUrl
      delete job.companyLogo
      delete job.street
      delete job.city
      delete job.region
      delete job.postalCode
      delete job.country
      delete job.isRemote
      delete job.minSalary
      delete job.maxSalary
      delete job.currency
      delete job.salaryUnit

      return job
    }

    if (type === "Local Business") {
      // Prefer a more specific subtype if provided, otherwise fall back to the parent LocalBusiness type
      const bizType = (fields.moreSpecificType && fields.moreSpecificType.trim()) || (fields.localBusinessType && fields.localBusinessType.trim()) || "LocalBusiness"
      const biz: any = { "@context": "https://schema.org", "@type": bizType }

      if (fields.name && fields.name.trim()) biz.name = fields.name.trim()
      if (fields.url && fields.url.trim()) biz.url = fields.url.trim()
      if (fields.imageUrl && fields.imageUrl.trim()) biz.image = fields.imageUrl.trim()
      if (fields["@id"] && fields["@id"].trim()) biz["@id"] = fields["@id"].trim()
      if (fields.telephone && fields.telephone.trim()) biz.telephone = fields.telephone.trim()
      if (fields.priceRange && fields.priceRange.trim()) biz.priceRange = fields.priceRange.trim()

      // Address -> PostalAddress
      const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
      if (hasAddress) {
        const addr: any = { "@type": "PostalAddress" }
        if (fields.street && fields.street.trim()) addr.streetAddress = fields.street.trim()
        if (fields.city && fields.city.trim()) addr.addressLocality = fields.city.trim()
        if (fields.region && fields.region.trim()) addr.addressRegion = fields.region.trim()
        if (fields.postalCode && fields.postalCode.trim()) addr.postalCode = fields.postalCode.trim()
        if (fields.country && fields.country.trim()) addr.addressCountry = fields.country.trim()
        biz.address = addr
      }

      // Geo -> GeoCoordinates
      if ((fields.latitude && fields.latitude.trim()) || (fields.longitude && fields.longitude.trim())) {
        const lat = parseFloat((fields.latitude || "").trim())
        const lon = parseFloat((fields.longitude || "").trim())
        if (!isNaN(lat) && !isNaN(lon)) {
          biz.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lon }
        }
      }

      // Opening hours: prefer structured repeater state, then 24/7 flag, then free-text.
      // Emit openingHours in schema.org string format (e.g. "Mo-Su 00:00-23:59").
      const formatOpeningHoursStrings = (): string[] => {
        // If 24/7 is set, emit full week 00:00-23:59 as recommended
        if (fields.open24_7 === "true") return ["Mo-Su 00:00-23:59"]

        if (openingHoursState && openingHoursState.length) {
          const out: string[] = []
          openingHoursState.forEach((oh) => {
            const codes = normalizeDaysToCodes(oh.days || "")
            if (!codes.length) return
            const ranges = collapseDayRanges(codes)
            const opens = (oh.opens || "").trim()
            const closes = (oh.closes || "").trim()
            if (opens && closes) {
              const daysPart = ranges.join(",")
              out.push(`${daysPart} ${opens}-${closes}`)
            }
          })
          if (out.length) return out
        }

        if (fields.openingHours && fields.openingHours.trim()) return [fields.openingHours.trim()]
        return []
      }

      const openingHoursStrings = formatOpeningHoursStrings()
      if (openingHoursStrings.length === 1) biz.openingHours = openingHoursStrings[0]
      else if (openingHoursStrings.length > 1) biz.openingHours = openingHoursStrings

      // Also produce `openingHoursSpecification` as an array of OpeningHoursSpecification objects
      // Google prefers an array even when there's only one entry.
      const CODE_TO_DAY: Record<string, string> = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" }

      const buildOpeningHoursSpecs = (): any[] => {
        // 24/7 -> single spec covering all days
        if (fields.open24_7 === "true") {
          return [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
              opens: "00:00",
              closes: "23:59",
            },
          ]
        }

        if (openingHoursState && openingHoursState.length) {
          const specs: any[] = []
          openingHoursState.forEach((oh) => {
            const codes = normalizeDaysToCodes(oh.days || "")
            if (!codes.length) return
            // Expand codes into full weekday names in canonical order
            const daysOrdered = DAY_ORDER.filter((c) => codes.includes(c)).map((c) => CODE_TO_DAY[c])
            const opens = (oh.opens || "").trim()
            const closes = (oh.closes || "").trim()
            if (daysOrdered.length && opens && closes) {
              specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: daysOrdered, opens, closes })
            }
          })
          if (specs.length) return specs
        }

        // If user provided free-text openingHours and we have no structured entries, do not synthesize specs
        return []
      }

      const openingHoursSpecs = buildOpeningHoursSpecs()
      if (openingHoursSpecs.length) biz.openingHoursSpecification = openingHoursSpecs

      // Departments (sub-units) mapping — prefer department moreSpecificType as @type, keep parent as additionalType when helpful
      if (departments && departments.length) {
        const deps = departments.map((d) => {
          const deptType = (d.moreSpecificType && d.moreSpecificType.trim()) || (d.localBusinessType && d.localBusinessType.trim()) || "LocalBusiness"
          const obj: any = { "@type": deptType }
          if (d.name && d.name.trim()) obj.name = d.name.trim()
          if (d.imageUrl && d.imageUrl.trim()) obj.image = d.imageUrl.trim()
          if (d.telephone && d.telephone.trim()) obj.telephone = d.telephone.trim()
          // (no additionalType emitted — avoid redundant hints that search engines typically ignore)
          return obj
        })
        if (deps.length) biz.department = deps
      }

      // Social profiles (sameAs) - prefer repeater state if present
      const sa = (socialProfiles && socialProfiles.length)
        ? socialProfiles.map((s) => s.trim()).filter(Boolean)
        : (fields.sameAs && fields.sameAs.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
      if (sa.length) biz.sameAs = sa

      // Clean up helper fields
      delete biz.imageUrl
      delete biz.street
      delete biz.city
      delete biz.region
      delete biz.postalCode
      delete biz.country
      delete biz.latitude
      delete biz.longitude
      delete biz.open24_7
      delete biz.localBusinessType
      delete biz.moreSpecificType

      return biz
    }

    // Organization: include structured contact points and social profiles
    if (type === "Organization") {
      const org: any = { ...base, "@type": "Organization" }

      // Social profiles (sameAs) - prefer repeater state if present
      const sa = (socialProfiles && socialProfiles.length)
        ? socialProfiles.map((s) => s.trim()).filter(Boolean)
        : (fields.sameAs && fields.sameAs.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
      if (sa.length) org.sameAs = sa

      // Map contacts repeater to ContactPoint objects
      if (contacts && contacts.length) {
        const cps = contacts
          .map((c) => {
            const cp: any = { "@type": "ContactPoint" }
            if (c.contactType && c.contactType.trim()) cp.contactType = c.contactType.trim()
            if (c.phone && c.phone.trim()) cp.telephone = c.phone.trim()
            if (c.areaServed && c.areaServed.trim()) {
              const areas = c.areaServed.includes(",") ? c.areaServed.split(",").map((s) => s.trim()).filter(Boolean) : [c.areaServed.trim()]
              cp.areaServed = areas.length === 1 ? areas[0] : areas
            }
            if (c.availableLanguage && c.availableLanguage.trim()) {
              const langs = c.availableLanguage.includes(",") ? c.availableLanguage.split(",").map((s) => s.trim()).filter(Boolean) : [c.availableLanguage.trim()]
              cp.availableLanguage = langs.length === 1 ? langs[0] : langs
            }
            if (c.options && c.options.trim()) {
              const opts = c.options.includes(",") ? c.options.split(",").map((s) => s.trim()).filter(Boolean) : [c.options.trim()]
              cp.contactOption = opts.length === 1 ? opts[0] : opts
            }
            return Object.keys(cp).length > 1 ? cp : null
          })
          .filter(Boolean)

        if (cps.length) org.contactPoint = cps
      }

      // Logo as ImageObject when provided
      if (fields.logo && fields.logo.trim()) {
        org.logo = { "@type": "ImageObject", url: fields.logo.trim() }
      }

      // Founder and foundingDate (if present)
      if (fields.founder && fields.founder.trim()) {
        org.founder = { "@type": "Person", name: fields.founder.trim() }
      }
      if (fields.foundingDate && fields.foundingDate.trim()) {
        org.foundingDate = fields.foundingDate.trim()
      }

      // Structured postal address when address-related fields provided
      const hasAddr = fields.street || fields.city || fields.region || fields.postalCode || fields.country
      if (hasAddr) {
        const addr: any = { "@type": "PostalAddress" }
        if (fields.street && fields.street.trim()) addr.streetAddress = fields.street.trim()
        if (fields.city && fields.city.trim()) addr.addressLocality = fields.city.trim()
        if (fields.region && fields.region.trim()) addr.addressRegion = fields.region.trim()
        if (fields.postalCode && fields.postalCode.trim()) addr.postalCode = fields.postalCode.trim()
        if (fields.country && fields.country.trim()) addr.addressCountry = fields.country.trim()
        org.address = addr
      }

      return org
    }

    // Other schema types use fields directly
    return base
  }

  const schemaJSON = useMemo(
    () => JSON.stringify(buildSchema(), null, 2),
    [fields, type, images, breadcrumbs, faqItemsState, socialProfiles, videoThumbnails, videoMinutes, videoSeconds, openingHoursState, departments, contacts, ticketTypes]
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

  

  const articleTitle = "Article Schema"

  return (
    <>
      <Seo
        title="Schema Builder"
        description="Generate clean and structured JSON-LD for multiple content types using this builder."
        keywords="schema generator, json-ld generator, seo tools"
        url="https://cralite.com/tools/schema-builder"
      />
      {/* Inject FAQ JSON-LD so the page provides structured FAQ data */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      {/* Rotate only the plus icon when opened */}
      <style>{`details[open] summary .faq-plus { transform: rotate(45deg); }`}</style>
      <section className="section section--neutral">
        <div className="section-inner">
        <section className="tool-section">
          <div className="mb-0">
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
                        {Object.keys(schemaFields).sort((a, b) => a.localeCompare(b)).map((schemaType) => (
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
          </section>
          <section className="tool-section">
        {/* ======= MAIN TOOL GRID ======= */}
        <div className="tool-grid">
          {/* LEFT FORM */}
          <div className="tool-form">
            <div className="tool-header-compact">
              <h2 className="tool-h2">{type === "Article" ? articleTitle : `${type} Schema Builder`}</h2>
              <p className="tool-sub">
                {type === "Article" ? (
                  "Use this builder to create accurate JSON-LD for articles, blog posts, and news content."
                ) : (
                  <>{schemaExamples[type]} for {type}</>
                )}
              </p>
            </div>

            

            {type === "Recipe" && (
              <div className="text-sm text-gray-500 mt-0">
                Times use ISO 8601 durations (e.g. <code>PT15M</code>, <code>PT1H30M</code>).
                Ingredients: one per line or comma-separated. Instructions: one step per line.
              </div>
            )}

            {type === "How-to" && (
              <div className="text-sm text-gray-500 mt-0">
                Steps: one per line. Tools/supplies accept comma-separated or newline lists. Total time: ISO 8601 duration (e.g. <code>PT30M</code>).
              </div>
            )}

            {type === "Job Posting" && (
              <div className="text-sm text-gray-500 mt-0">
                Dates use <code>yyyy-mm-dd</code>. Salary values are numeric; set <code>Per</code> to <code>YEAR</code>, <code>HOUR</code>, etc.
              </div>
            )}

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

              

            ) : type === "Breadcrumb" ? (
              <div>
                
                <div className="space-y-4">
                  {breadcrumbs.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-1">
                        <label className="tool-label">Name</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={b.name}
                          placeholder={`Page #${idx + 1} Name`}
                          onChange={(e) => updateBreadcrumb(idx, "name", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="tool-label">URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="tool-input flex-1"
                            value={b.url}
                            placeholder={`https://example.com/page-${idx + 1}`}
                            onChange={(e) => updateBreadcrumb(idx, "url", e.target.value)}
                          />
                          <button
                            type="button"
                            className="toolbar-btn toolbar-btn--red square-btn"
                            onClick={() => removeBreadcrumb(idx)}
                            aria-label="Remove breadcrumb"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        {!b.url || isValidUrl(b.url) ? null : (
                          <div className="validation-message">Invalid URL format</div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div>
                    <button type="button" className="action-btn" onClick={addBreadcrumb}>
                      Add URL
                    </button>
                  </div>

                  
                </div>
              </div>
            ) : type === "FAQ Page" ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">Add questions and answers to create a valid FAQ schema.</p>
                <div className="space-y-4">
                  {faqItemsState.map((f, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="tool-field">
                        <label className="tool-label">Question</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={f.question}
                          placeholder={`Question ${idx + 1}`}
                          onChange={(e) => updateFaqItem(idx, "question", e.target.value)}
                        />
                        {renderError(`faq_question_${idx}`)}
                      </div>
                      <div className="tool-field">
                        <label className="tool-label">Answer</label>
                        <textarea
                          className="tool-textarea"
                          rows={3}
                          value={f.answer}
                          placeholder={`Answer ${idx + 1}`}
                          onChange={(e) => updateFaqItem(idx, "answer", e.target.value)}
                        />
                        {renderError(`faq_answer_${idx}`)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="toolbar-btn toolbar-btn--red square-btn"
                          onClick={() => removeFaqItem(idx)}
                          aria-label="Remove question"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                      <hr />
                    </div>
                  ))}

                  <div>
                    <button type="button" className="action-btn" onClick={addFaqItem}>
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            ) : type === "Person" ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="tool-field">
                    <label className="tool-label">Name</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={fields.name || ""}
                      placeholder="Full name"
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {renderError("name")}
                  </div>

                  <div className="tool-field">
                    <label className="tool-label">URL</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={fields.url || ""}
                      placeholder="https://example.com"
                      onChange={(e) => handleChange("url", e.target.value)}
                    />
                    {renderError("url")}
                  </div>
                </div>

                    <div className="mt-4">
                      <div className="tool-field">
                        <label className="tool-label">Picture URL</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={fields.pictureUrl || ""}
                          placeholder="https://example.com/photo.jpg"
                          onChange={(e) => handleChange("pictureUrl", e.target.value)}
                        />
                        {renderError("pictureUrl")}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="tool-label block mb-2">Social profiles</label>
                      <div className="flex flex-col gap-2">
                        {socialProfiles && socialProfiles.length > 0 ? (
                          socialProfiles.map((s, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  className="tool-input flex-1"
                                  value={s}
                                  placeholder={`https://social.example/profile-${idx + 1}`}
                                  onChange={(e) => handleSocialChange(idx, e.target.value)}
                                  onBlur={() => handleSocialBlur(idx)}
                                />
                                <button
                                  type="button"
                                  className="toolbar-btn toolbar-btn--red square-btn"
                                  onClick={() => removeSocialProfile(idx)}
                                  aria-label="Remove profile"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                              {renderError(`sameAs_${idx}`)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No social profiles added.</div>
                        )}

                        <div>
                          <button type="button" className="action-btn" onClick={addSocialProfile}>
                            Add Profile
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="tool-field">
                        <label className="tool-label">Company</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={fields.worksFor || ""}
                          placeholder="Company or Organization"
                          onChange={(e) => handleChange("worksFor", e.target.value)}
                        />
                        {renderError("worksFor")}
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">Job title</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={fields.jobTitle || ""}
                          placeholder="Marketing Manager"
                          onChange={(e) => handleChange("jobTitle", e.target.value)}
                        />
                        {renderError("jobTitle")}
                      </div>
                    </div>
              </div>
            ) : (
              // How-to — custom layout (supplies, tools, steps)
              type === "How-to" ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Name</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.name || ""}
                        placeholder="How-to title"
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                      {renderError("name")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Description</label>
                      <textarea
                        className="tool-textarea"
                        rows={2}
                        value={fields.description || ""}
                        placeholder="Short summary"
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                      {renderError("description")}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="tool-field">
                        <label className="tool-label">Total time</label>
                        <input type="text" className="tool-input" value={fields.totalTime || ""} placeholder="PT30M" onChange={(e) => handleChange("totalTime", e.target.value)} />
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">Estimated cost</label>
                        <input type="text" className="tool-input" value={fields.estimatedCost || ""} placeholder="Estimated cost" onChange={(e) => handleChange("estimatedCost", e.target.value)} />
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">Currency</label>
                        <div className="custom-select-wrapper compact-select howto-currency-wrapper relative" style={{ minWidth: 140, marginBottom: 0 }}>
                          <button
                            type="button"
                            className="custom-select-trigger tool-select"
                            onClick={() => setHowToCurrencyOpen((o) => !o)}
                            style={{ width: "100%", justifyContent: "space-between" }}
                            aria-expanded={howToCurrencyOpen}
                          >
                            <span className="truncate block">{(fields.currency && fields.currency.trim()) ? `${fields.currency} - ${(ALL_CURRENCIES.find(c => c.code === fields.currency) || { name: "" }).name}` : "Currency"}</span>
                            <span className="text-xs">⏷</span>
                          </button>

                          {howToCurrencyOpen && (
                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                              <div className="p-2">
                                <input
                                  type="text"
                                  className="tool-input"
                                  placeholder="Search currency..."
                                  value={howToCurrencySearch}
                                  onChange={(e) => setHowToCurrencySearch(e.target.value)}
                                />
                              </div>
                              <ul>
                                {ALL_CURRENCIES.filter((c) => (`${c.code} ${c.name}`).toLowerCase().includes((howToCurrencySearch || "").toLowerCase())).map((c) => (
                                  <li key={c.code} className={(fields.currency || "") === c.code ? "selected" : ""} onClick={() => { handleChange("currency", c.code); setHowToCurrencyOpen(false); setHowToCurrencySearch("") }}>
                                    {c.code} - {c.name}
                                  </li>
                                ))}
                                <li key="none-howto" className={(fields.currency || "") === "" ? "selected" : ""} onClick={() => { handleChange("currency", ""); setHowToCurrencyOpen(false); setHowToCurrencySearch("") }}>
                                  Not specified
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Image URL</label>
                      <input type="text" className="tool-input" value={fields.imageUrl || ""} placeholder="https://example.com/image.jpg" onChange={(e) => handleChange("imageUrl", e.target.value)} />
                      {renderError("imageUrl")}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3">
                      <div className="text-sm text-gray-600">Add supplies and tools used in this HowTo.</div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <div className="md:col-span-1">
                          <button type="button" className="action-btn w-full" onClick={addHowToSupply}><Plus className="inline w-4 h-4 mr-2" /> Add Supply</button>
                        </div>

                        <div className="md:col-span-1">
                          <button type="button" className="action-btn w-full" onClick={addHowToTool}><Plus className="inline w-4 h-4 mr-2" /> Add Tool</button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {howToSupplies.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" className="tool-input flex-1" value={s} placeholder={`Supply #${idx + 1}`} onChange={(e) => updateHowToSupply(idx, e.target.value)} />
                          <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToSupply(idx)} aria-label="Remove supply" title="Remove">×</button>
                        </div>
                      ))}

                      {howToTools.map((t, idx) => (
                        <div key={`tool-${idx}`} className="flex items-center gap-2">
                          <input type="text" className="tool-input flex-1" value={t} placeholder={`Tool #${idx + 1}`} onChange={(e) => updateHowToTool(idx, e.target.value)} />
                          <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToTool(idx)} aria-label="Remove tool" title="Remove">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-3">Steps: add instructions and optional step image, name and URL.</div>
                    <div className="flex flex-col gap-4">
                      {howToSteps.map((step, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="tool-field">
                            <label className="tool-label">Step #{idx + 1}: Instructions</label>
                            <textarea className="tool-textarea" rows={3} value={step.instruction || ""} placeholder={`Step ${idx + 1} instruction`} onChange={(e) => updateHowToStep(idx, "instruction", e.target.value)} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="tool-field">
                              <label className="tool-label">Image URL</label>
                              <input type="text" className="tool-input" value={step.imageUrl || ""} placeholder="https://example.com/step-image.jpg" onChange={(e) => updateHowToStep(idx, "imageUrl", e.target.value)} />
                            </div>

                            <div className="tool-field">
                              <label className="tool-label">Name</label>
                              <input type="text" className="tool-input" value={step.name || ""} placeholder="Optional step title" onChange={(e) => updateHowToStep(idx, "name", e.target.value)} />
                            </div>

                            <div className="tool-field">
                              <label className="tool-label">URL</label>
                              <input type="text" className="tool-input" value={step.url || ""} placeholder="https://example.com/more-info" onChange={(e) => updateHowToStep(idx, "url", e.target.value)} />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToStep(idx)} title="Remove">×</button>
                          </div>
                          <hr />
                        </div>
                      ))}

                      <div>
                        <button type="button" className="action-btn" onClick={addHowToStep}><Plus className="inline w-4 h-4 mr-2" /> Add Step</button>
                      </div>
                    </div>
                  </div>
                </>
              ) :
              // Event — custom layout (fields match attached design)
              type === "Event" ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Name</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.name || ""}
                        placeholder="Event name"
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                      {renderError("name")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Event's description</label>
                      <textarea
                        className="tool-textarea"
                        rows={2}
                        value={fields.description || ""}
                        placeholder="Short event description"
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                      {renderError("description")}
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Image URL</label>
                      <input type="text" className="tool-input" value={fields.imageUrl || ""} placeholder="https://example.com/image.jpg" onChange={(e) => handleChange("imageUrl", e.target.value)} />
                      {renderError("imageUrl")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="tool-field">
                      <label className="tool-label">Start date</label>
                      <DatePickerInput value={fields.startDate} onChange={(iso) => handleChange("startDate", iso)} placeholder="Start date" />
                      {renderError("startDate")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Start time (e.g. 08:00)</label>
                      <input type="text" className="tool-input" value={fields.startTime || ""} placeholder="08:00" onChange={(e) => handleChange("startTime", e.target.value)} />
                      {renderError("startTime")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="tool-field">
                      <label className="tool-label">End date</label>
                      <DatePickerInput value={fields.endDate} onChange={(iso) => handleChange("endDate", iso)} placeholder="End date" />
                      {renderError("endDate")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">End time (e.g. 17:30)</label>
                      <input type="text" className="tool-input" value={fields.endTime || ""} placeholder="17:30" onChange={(e) => handleChange("endTime", e.target.value)} />
                      {renderError("endTime")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Event Status</label>
                      <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setEventStatusOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={eventStatusOpen}
                        >
                          <span className="truncate block">{(EVENT_STATUSES.find(s => s.value === (fields.eventStatus || "")) || { label: "Select status" }).label}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {eventStatusOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              {EVENT_STATUSES.map((s) => (
                                <li key={s.value} className={(fields.eventStatus || "") === s.value ? "selected" : ""} onClick={() => { handleChange("eventStatus", s.value); setEventStatusOpen(false) }}>
                                  {s.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Attendance Mode</label>
                      <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setAttendanceModeOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={attendanceModeOpen}
                        >
                          <span className="truncate block">{(ATTENDANCE_MODES.find(m => m.value === (fields.attendanceMode || "")) || { label: "Select mode" }).label}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {attendanceModeOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              {ATTENDANCE_MODES.map((m) => (
                                <li key={m.value} className={(fields.attendanceMode || "") === m.value ? "selected" : ""} onClick={() => { handleChange("attendanceMode", m.value); setAttendanceModeOpen(false) }}>
                                  {m.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Performer @type</label>
                      <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setPerformerTypeOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={performerTypeOpen}
                        >
                          <span className="truncate block">{(PERFORMER_TYPES.find(p => p.value === (fields.performerType || "")) || { label: "Select type" }).label}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {performerTypeOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              {PERFORMER_TYPES.map((opt) => (
                                <li key={opt.value} className={(fields.performerType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("performerType", opt.value); setPerformerTypeOpen(false) }}>
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Performer's name</label>
                      <input type="text" className="tool-input" value={fields.performerName || ""} placeholder="Performer's name" onChange={(e) => handleChange("performerName", e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3">
                      <div className="text-sm text-gray-600">Add an offer for each ticket type (e.g. "General admission", "VIP Package").</div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <div className="flex items-center gap-3">
                          <button type="button" className="action-btn" onClick={addTicketType}><Plus className="inline w-4 h-4 mr-2" /> Add Ticket Type</button>
                        </div>

                        <div className="flex items-center justify-end">
                          <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ minWidth: 160 }}>
                            <button
                              type="button"
                              className="custom-select-trigger tool-select"
                              onClick={() => setTicketDefaultCurrencyOpen((o) => !o)}
                              style={{ width: "100%", justifyContent: "space-between" }}
                              aria-expanded={ticketDefaultCurrencyOpen}
                            >
                              <span className="truncate block">{ticketDefaultCurrency ? `${ticketDefaultCurrency} - ${(ALL_CURRENCIES.find(c => c.code === ticketDefaultCurrency) || { name: "" }).name}` : "Ticket currency"}</span>
                              <span className="text-xs">⏷</span>
                            </button>

                            {ticketDefaultCurrencyOpen && (
                              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                <div className="p-2">
                                  <input
                                    type="text"
                                    className="tool-input"
                                    placeholder="Search currency..."
                                    value={ticketCurrencySearch}
                                    onChange={(e) => setTicketCurrencySearch(e.target.value)}
                                  />
                                </div>
                                <ul>
                                  {ALL_CURRENCIES.filter((c) => (`${c.code} ${c.name}`).toLowerCase().includes((ticketCurrencySearch || "").toLowerCase())).map((c) => (
                                    <li key={c.code} className={ticketDefaultCurrency === c.code ? "selected" : ""} onClick={() => { setTicketDefaultCurrency(c.code); setTicketDefaultCurrencyOpen(false); setTicketCurrencySearch("") }}>
                                      {c.code} - {c.name}
                                    </li>
                                  ))}
                                  <li key="none" className={ticketDefaultCurrency === "" ? "selected" : ""} onClick={() => { setTicketDefaultCurrency(""); setTicketDefaultCurrencyOpen(false); setTicketCurrencySearch("") }}>
                                    Not specified
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {ticketTypes.map((t, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <div className="tool-field">
                              <label className="tool-label">Name</label>
                              <input type="text" className="tool-input" value={t.name} placeholder="General admission" onChange={(e) => updateTicketType(idx, "name", e.target.value)} />
                            </div>

                            <div className="tool-field">
                              <label className="tool-label">Price</label>
                              <input type="text" className="tool-input" value={t.price} placeholder="49.99" onChange={(e) => updateTicketType(idx, "price", e.target.value)} />
                            </div>

                            <div className="tool-field">
                              <label className="tool-label">Currency</label>
                              <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ minWidth: 140 }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setTicketCurrencyOpenIndex((o) => (o === idx ? null : idx))}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={ticketCurrencyOpenIndex === idx}
                                >
                                  <span className="truncate block">{t.currency ? `${t.currency} - ${(ALL_CURRENCIES.find(c => c.code === t.currency) || { name: "" }).name}` : "Currency"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {ticketCurrencyOpenIndex === idx && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                    <ul>
                                      {ALL_CURRENCIES.map((c) => (
                                        <li key={`${idx}-${c.code}`} className={(t.currency || "") === c.code ? "selected" : ""} onClick={() => { updateTicketType(idx, "currency", c.code); setTicketCurrencyOpenIndex(null) }}>
                                          {c.code} - {c.name}
                                        </li>
                                      ))}
                                      <li key={`none-${idx}`} className={(t.currency || "") === "" ? "selected" : ""} onClick={() => { updateTicketType(idx, "currency", ""); setTicketCurrencyOpenIndex(null) }}>
                                        Not specified
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="tool-field">
                              <label className="tool-label">Available from</label>
                              <DatePickerInput value={t.availableFrom} onChange={(iso) => updateTicketType(idx, "availableFrom", iso)} placeholder="yyyy-mm-dd" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="tool-field mt-2">
                              <label className="tool-label">URL</label>
                              <input type="text" className="tool-input" value={t.url} placeholder="https://example.com/ticket" onChange={(e) => updateTicketType(idx, "url", e.target.value)} />
                            </div>

                            <div className="tool-field mt-2">
                              <label className="tool-label">Availability</label>
                              <div className="custom-select-wrapper article-select-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setTicketAvailabilityOpenIndex((o) => (o === idx ? null : idx))}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={ticketAvailabilityOpenIndex === idx}
                                >
                                  <span className="truncate block">{(TICKET_AVAILABILITY_OPTIONS.find(a => a.value === (t.availability || "")) || { label: "Not specified" }).label}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {ticketAvailabilityOpenIndex === idx && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                                    <ul>
                                      {TICKET_AVAILABILITY_OPTIONS.map((opt) => (
                                        <li key={`${idx}-${opt.value}`} className={(t.availability || "") === opt.value ? "selected" : ""} onClick={() => { updateTicketType(idx, "availability", opt.value); setTicketAvailabilityOpenIndex(null) }}>
                                          {opt.label}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1">
                            <div className="flex justify-end">
                              <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeTicketType(idx)} title="Remove">×</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                    </div>
                  </div>
                </>
              ) :
              // Video — custom layout
              type === "Video" ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Name</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.name || ""}
                        placeholder="Video title"
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                      {renderError("name")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Video's description</label>
                      <textarea
                        className="tool-textarea"
                        rows={2}
                        value={fields.description || ""}
                        placeholder="Short video summary"
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                      {renderError("description")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="tool-field md:col-span-2">
                      <label className="tool-label">Upload date</label>
                      <DatePickerInput
                        value={fields.uploadDate}
                        onChange={(iso) => handleChange("uploadDate", iso)}
                        placeholder="yyyy-mm-dd"
                      />
                      {renderError("uploadDate")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Minutes</label>
                      <input
                        type="number"
                        min={0}
                        className="tool-input"
                        value={videoMinutes}
                        placeholder="0"
                        onChange={(e) => setVideoMinutes(e.target.value)}
                      />
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Seconds</label>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        className="tool-input"
                        value={videoSeconds}
                        placeholder="0"
                        onChange={(e) => setVideoSeconds(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 tool-field">
                    <label className="tool-label">Thumbnail URL #1</label>
                    <div className="flex flex-col gap-2">
                      {videoThumbnails.map((t, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 flex-nowrap">
                            <input
                              type="text"
                              className="tool-input flex-1"
                              value={t}
                              placeholder={`https://example.com/thumb-${idx + 1}.jpg`}
                              onChange={(e) => {
                                setVideoThumbnails((prev) => {
                                  const next = [...prev]
                                  next[idx] = e.target.value
                                  return next
                                })
                                validateField(`videoThumbs_${idx}`, e.target.value, fields)
                              }}
                            />
                            <button
                              type="button"
                              className="toolbar-btn toolbar-btn--red square-btn"
                              onClick={() => {
                                setVideoThumbnails((prev) => prev.filter((_, i) => i !== idx))
                                setErrors((prev) => {
                                  const next = { ...prev }
                                  Object.keys(next).forEach((k) => {
                                    if (k.startsWith("videoThumbs_")) delete next[k]
                                  })
                                  return next
                                })
                              }}
                              aria-label="Remove thumbnail"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                          {renderError(`videoThumbs_${idx}`)}
                        </div>
                      ))}

                      <div>
                        <button type="button" className="action-btn" onClick={() => setVideoThumbnails((prev) => [...prev, ""])}>
                          <Plus className="inline w-4 h-4 mr-2" /> Add Image
                        </button>
                      </div>
                    </div>
                    {renderError("thumbnailUrl")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Content URL</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.contentUrl || ""}
                        placeholder="https://example.com/video.mp4"
                        onChange={(e) => handleChange("contentUrl", e.target.value)}
                      />
                      {renderError("contentUrl")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Embed URL</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.embedUrl || ""}
                        placeholder="https://youtube.com/watch?v=..."
                        onChange={(e) => handleChange("embedUrl", e.target.value)}
                      />
                      {renderError("embedUrl")}
                    </div>
                  </div>

                  <div className="mt-4 tool-field">
                    <label className="tool-label">SeekToAction Target URL</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={fields.seekToTarget || ""}
                      placeholder="https://example.com/watch?v=ID&t={seek_to_second_number}"
                      onChange={(e) => handleChange("seekToTarget", e.target.value)}
                    />
                    <div className="text-sm text-gray-500 mt-1">Use <code>{`{seek_to_second_number}`}</code> placeholder for the seek parameter</div>
                    {renderError("seekToTarget")}
                  </div>
                </>
              ) :
              // Job Posting — custom layout (fields match attached image)
              type === "Job Posting" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Job title</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.title || ""}
                        placeholder="Job's title"
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                      {renderError("title")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Identifier</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.identifier || ""}
                        placeholder="Job ref / id"
                        onChange={(e) => handleChange("identifier", e.target.value)}
                      />
                      {renderError("identifier")}
                    </div>
                  </div>

                  <div className="tool-field mt-4">
                    <label className="tool-label">Job's description (in HTML)</label>
                    <textarea
                      className="tool-textarea"
                      rows={6}
                      value={fields.jobDescription || ""}
                      placeholder="Role responsibilities, HTML allowed"
                      onChange={(e) => handleChange("jobDescription", e.target.value)}
                    />
                    <div className="text-sm text-gray-500 mt-1">You can paste HTML here; this will be used as the job description.</div>
                    {renderError("jobDescription")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Company</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.hiringOrganization || ""}
                        placeholder="Company name"
                        onChange={(e) => handleChange("hiringOrganization", e.target.value)}
                      />
                      {renderError("hiringOrganization")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Company URL</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.hiringOrganizationUrl || ""}
                        placeholder="https://example.com"
                        onChange={(e) => handleChange("hiringOrganizationUrl", e.target.value)}
                      />
                      {renderError("hiringOrganizationUrl")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Company logo</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.companyLogo || ""}
                        placeholder="https://example.com/logo.png"
                        onChange={(e) => handleChange("companyLogo", e.target.value)}
                      />
                      {renderError("companyLogo")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Industry</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.industry || ""}
                        placeholder="Industry or sector"
                        onChange={(e) => handleChange("industry", e.target.value)}
                      />
                      {renderError("industry")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Employment type</label>
                      <div className="custom-select-wrapper compact-select jobpost-select-wrapper relative" style={{ width: "100%" }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setEmploymentTypeOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={employmentTypeOpen}
                        >
                          <span className="truncate block">{(EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === (fields.employmentType || "")) || { label: "Select employment type" }).label}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {employmentTypeOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                                <li key={opt.value} className={(fields.employmentType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("employmentType", opt.value); setEmploymentTypeOpen(false) }}>
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {renderError("employmentType")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Work hours (e.g. 8am-5pm)</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.workHours || ""}
                        placeholder="e.g. 8am-5pm, shift"
                        onChange={(e) => handleChange("workHours", e.target.value)}
                      />
                      {renderError("workHours")}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="tool-field">
                      <label className="tool-label">Date posted</label>
                      <DatePickerInput
                        value={fields.datePosted}
                        onChange={(iso) => handleChange("datePosted", iso)}
                        placeholder="yyyy-mm-dd"
                      />
                      {renderError("datePosted")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Expire date</label>
                      <DatePickerInput
                        value={fields.validThrough}
                        onChange={(iso) => handleChange("validThrough", iso)}
                        placeholder="yyyy-mm-dd"
                      />
                      {renderError("validThrough")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Remote job</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={fields.isRemote === "true"}
                          onChange={(e) => handleChange("isRemote", e.target.checked ? "true" : "false")}
                        />
                        <span className="text-sm">Remote job</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="tool-field">
                      <label className="tool-label">Country</label>
                      <div className="custom-select-wrapper compact-select relative country-select-wrapper" style={{ width: '100%' }}>
                        {selectedCountryCode ? (
                          <img
                            className="flag-preview"
                            src={`https://flagcdn.com/24x18/${selectedCountryCode.toLowerCase()}.png`}
                            alt={selectedCountryCode}
                          />
                        ) : null}

                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setCountryOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={countryOpen}
                        >
                          <span className="truncate block" style={{ marginLeft: selectedCountryCode ? 30 : undefined }}>{(fields.country && COUNTRY_LIST.find(c => c.code === fields.country)?.name) || (fields.country || "Select country")}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {countryOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                            <div className="p-2">
                              <input
                                type="text"
                                className="tool-input"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                              />
                            </div>
                            <ul>
                              {COUNTRY_LIST.filter((c) => c.name.toLowerCase().includes((countrySearch || "").toLowerCase())).map((c) => (
                                <li key={c.code || c.name} className={(fields.country || "") === (c.code || "") ? "selected" : ""} onClick={() => { handleChange("country", c.code || ""); setCountryOpen(false); setCountrySearch(""); setRegionCustomVisible(false) }}>
                                  {c.name}
                                </li>
                              ))}
                              <li key="none-country" className={(fields.country || "") === "" ? "selected" : ""} onClick={() => { handleChange("country", ""); setCountryOpen(false); setCountrySearch(""); setRegionCustomVisible(false) }}>
                                Not specified
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      {renderError("country")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">State/Province/Region</label>
                      {StateSelectComp && selectedCountryCode && !regionCustomVisible ? (
                        <StateSelectComp
                          className="tool-input"
                          country={selectedCountryCode}
                          countryCode={selectedCountryCode}
                          value={fields.region || ""}
                          onChange={(v: any) => {
                            const val = typeof v === "string" ? v : (v && (v.target ? v.target.value : v))
                            if (val === "__other__") {
                              setRegionCustomVisible(true)
                              handleChange("region", "")
                            } else {
                              handleChange("region", val || "")
                            }
                          }}
                        />
                      ) : selectedCountryCode && STATES_BY_COUNTRY[selectedCountryCode] && !regionCustomVisible ? (
                        <div className="custom-select-wrapper compact-select region-select-wrapper relative" style={{ width: '100%' }}>
                          <button
                            type="button"
                            className="custom-select-trigger tool-select"
                            onClick={() => setRegionOpen((o) => !o)}
                            style={{ width: "100%", justifyContent: "space-between" }}
                            aria-expanded={regionOpen}
                          >
                            <span className="truncate block">{fields.region || "Select state / region"}</span>
                            <span className="text-xs">⏷</span>
                          </button>

                          {regionOpen && (
                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                              <div className="p-2">
                                <input
                                  type="text"
                                  className="tool-input"
                                  placeholder="Search region..."
                                  value={regionSearch}
                                  onChange={(e) => setRegionSearch(e.target.value)}
                                />
                              </div>
                              <ul>
                                {STATES_BY_COUNTRY[selectedCountryCode].filter((s) => s.toLowerCase().includes((regionSearch || "").toLowerCase())).map((s) => (
                                  <li key={s} className={(fields.region || "") === s ? "selected" : ""} onClick={() => { handleChange("region", s); setRegionOpen(false); setRegionSearch("") }}>
                                    {s}
                                  </li>
                                ))}
                                <li key="__other__" onClick={() => { setRegionCustomVisible(true); handleChange("region", ""); setRegionOpen(false) }}>
                                  Other...
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : selectedCountryCode && !regionCustomVisible ? (
                        // Country selected but no known states -> show disabled/grayed empty input
                        <input
                          type="text"
                          className="tool-input opacity-50"
                          value={""}
                          placeholder=""
                          disabled
                        />
                      ) : (
                        <input
                          type="text"
                          className="tool-input"
                          value={fields.region || ""}
                          placeholder="State or region"
                          onChange={(e) => handleChange("region", e.target.value)}
                        />
                      )}
                      {renderError("region")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">City</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.city || ""}
                        placeholder="City"
                        onChange={(e) => handleChange("city", e.target.value)}
                      />
                      {renderError("city")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Street</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.street || ""}
                        placeholder="Street address"
                        onChange={(e) => handleChange("street", e.target.value)}
                      />
                      {renderError("street")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Zip / Postal code</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.postalCode || ""}
                        placeholder="Zip code"
                        onChange={(e) => handleChange("postalCode", e.target.value)}
                      />
                      {renderError("postalCode")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Salary (min)</label>
                      <input
                        type="number"
                        className="tool-input"
                        value={fields.minSalary || ""}
                        placeholder="Minimum salary"
                        onChange={(e) => handleChange("minSalary", e.target.value)}
                      />
                      {renderError("minSalary")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Max salary</label>
                      <input
                        type="number"
                        className="tool-input"
                        value={fields.maxSalary || ""}
                        placeholder="Maximum salary"
                        onChange={(e) => handleChange("maxSalary", e.target.value)}
                      />
                      {renderError("maxSalary")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Currency</label>
                      <div className="custom-select-wrapper compact-select salary-currency-wrapper relative" style={{ minWidth: 140 }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setSalaryCurrencyOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={salaryCurrencyOpen}
                        >
                          <span className="truncate block">{(fields.currency && fields.currency.trim()) ? `${fields.currency} - ${(ALL_CURRENCIES.find(c => c.code === fields.currency) || { name: "" }).name}` : "Select currency"}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {salaryCurrencyOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                            <div className="p-2">
                              <input
                                type="text"
                                className="tool-input"
                                placeholder="Search currency..."
                                value={salaryCurrencySearch}
                                onChange={(e) => setSalaryCurrencySearch(e.target.value)}
                              />
                            </div>
                            <ul>
                              {ALL_CURRENCIES.filter((c) => (`${c.code} ${c.name}`).toLowerCase().includes((salaryCurrencySearch || "").toLowerCase())).map((c) => (
                                <li key={c.code} className={(fields.currency || "") === c.code ? "selected" : ""} onClick={() => { handleChange("currency", c.code); setSalaryCurrencyOpen(false); setSalaryCurrencySearch("") }}>
                                  {c.code} - {c.name}
                                </li>
                              ))}
                              <li key="none-salary" className={(fields.currency || "") === "" ? "selected" : ""} onClick={() => { handleChange("currency", ""); setSalaryCurrencyOpen(false); setSalaryCurrencySearch("") }}>
                                Not specified
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      {renderError("currency")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Per</label>
                      <div className="custom-select-wrapper compact-select salary-unit-wrapper relative" style={{ minWidth: 140 }}>
                        <button
                          type="button"
                          className="custom-select-trigger tool-select"
                          onClick={() => setSalaryUnitOpen((o) => !o)}
                          style={{ width: "100%", justifyContent: "space-between" }}
                          aria-expanded={salaryUnitOpen}
                        >
                          <span className="truncate block">{(fields.salaryUnit && fields.salaryUnit.trim()) ? ((fields.salaryUnit || "").toUpperCase()) : "Select period"}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {salaryUnitOpen && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              <li key="HOUR" className={(fields.salaryUnit || "") === "HOUR" ? "selected" : ""} onClick={() => { handleChange("salaryUnit", "HOUR"); setSalaryUnitOpen(false) }}>Hour</li>
                              <li key="WEEK" className={(fields.salaryUnit || "") === "WEEK" ? "selected" : ""} onClick={() => { handleChange("salaryUnit", "WEEK"); setSalaryUnitOpen(false) }}>Week</li>
                              <li key="MONTH" className={(fields.salaryUnit || "") === "MONTH" ? "selected" : ""} onClick={() => { handleChange("salaryUnit", "MONTH"); setSalaryUnitOpen(false) }}>Month</li>
                              <li key="YEAR" className={(fields.salaryUnit || "") === "YEAR" ? "selected" : ""} onClick={() => { handleChange("salaryUnit", "YEAR"); setSalaryUnitOpen(false) }}>Year</li>
                              <li key="none-period" className={(fields.salaryUnit || "") === "" ? "selected" : ""} onClick={() => { handleChange("salaryUnit", ""); setSalaryUnitOpen(false) }}>Not specified</li>
                            </ul>
                          </div>
                        )}
                      </div>
                      {renderError("salaryUnit")}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="tool-field">
                      <label className="tool-label">Responsibilities</label>
                      <textarea
                        className="tool-textarea"
                        rows={3}
                        value={fields.responsibilities || ""}
                        placeholder="Key responsibilities (one per line)"
                        onChange={(e) => handleChange("responsibilities", e.target.value)}
                      />
                      {renderError("responsibilities")}
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Skills</label>
                      <textarea
                        className="tool-textarea"
                        rows={2}
                        value={fields.skills || ""}
                        placeholder="Required skills (comma or newline)"
                        onChange={(e) => handleChange("skills", e.target.value)}
                      />
                      {renderError("skills")}
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Qualifications</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.qualifications || ""}
                        placeholder="Qualifications required"
                        onChange={(e) => handleChange("qualifications", e.target.value)}
                      />
                      {renderError("qualifications")}
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Education requirements</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.educationRequirements || ""}
                        placeholder="Education requirements"
                        onChange={(e) => handleChange("educationRequirements", e.target.value)}
                      />
                      {renderError("educationRequirements")}
                    </div>

                    <div className="tool-field mt-4">
                      <label className="tool-label">Experience requirements</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.experienceRequirements || ""}
                        placeholder="Experience requirements"
                        onChange={(e) => handleChange("experienceRequirements", e.target.value)}
                      />
                      {renderError("experienceRequirements")}
                    </div>
                  </div>
                </>
              ) :
              // Website Sitelinks Searchbox — custom layout
              type === "Website Sitelinks Searchbox" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="tool-field">
                      <label className="tool-label">Site Name</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.name || ""}
                        placeholder="Example Site"
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                      {renderError("name")}
                    </div>

                    <div className="tool-field">
                      <label className="tool-label">Site URL</label>
                      <input
                        type="text"
                        className="tool-input"
                        value={fields.url || ""}
                        placeholder="https://example.com"
                        onChange={(e) => handleChange("url", e.target.value)}
                      />
                      {renderError("url")}
                    </div>
                  </div>

                  <div className="tool-field mt-4">
                    <label className="tool-label">Search URL Template</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={fields.urlTemplate || ""}
                      placeholder="https://example.com/search?q={search_term_string}"
                      onChange={(e) => handleChange("urlTemplate", e.target.value)}
                    />
                    <div className="text-sm text-gray-500 mt-1">Include <code>{`{search_term_string}`}</code> in the template</div>
                    {renderError("urlTemplate")}
                  </div>

                  <div className="tool-field mt-4">
                    <label className="tool-label">Description</label>
                    <textarea
                      className="tool-textarea"
                      rows={4}
                      value={fields.description || ""}
                      placeholder="Short description of your site"
                      onChange={(e) => handleChange("description", e.target.value)}
                    />
                    {renderError("description")}
                  </div>
                </>
              ) : (
                // Non-Article types — simple mapping (Local Business has repeaters)
                type === "Local Business" ? (
                  <>
                    {/* Render remaining flat fields (exclude openingHours/open24_7/sameAs handled above).
                        Group Street + Zip/Postal into a single two-column row. */}
                    {(() => {
                      const flat = schemaFields[type].filter((f) => !["openingHours", "open24_7", "sameAs"].includes(f.key))
                      const elems: JSX.Element[] = []
                      for (let i = 0; i < flat.length; i++) {
                        const field = flat[i]

                        // Group Image URL + @id into one row when adjacent
                        if (field.key === "imageUrl") {
                          const nextField = i + 1 < flat.length ? flat[i + 1] : null
                          if (nextField && nextField.key === "@id") {
                            elems.push(
                              <div key="image-and-id-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Image URL</label>
                                  <input type="text" className="tool-input" value={fields.imageUrl || ""} placeholder="https://example.com/photo.jpg" onChange={(e) => handleChange("imageUrl", e.target.value)} />
                                  {renderError("imageUrl")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">@id (URL)</label>
                                  <input type="text" className="tool-input" value={fields["@id"] || ""} placeholder="https://example.com#id" onChange={(e) => handleChange("@id", e.target.value)} />
                                  {renderError("@id")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // Group URL + Phone + Price range when adjacent (3-column row)
                        if (field.key === "url") {
                          const n1 = i + 1 < flat.length ? flat[i + 1] : null
                          const n2 = i + 2 < flat.length ? flat[i + 2] : null
                          if (n1 && n1.key === "telephone" && n2 && n2.key === "priceRange") {
                            elems.push(
                              <div key="url-phone-price-row" className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">URL</label>
                                  <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
                                  {renderError("url")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Phone</label>
                                  <input type="text" className="tool-input" value={fields.telephone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("telephone", e.target.value)} />
                                  {renderError("telephone")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Price range</label>
                                  <input type="text" className="tool-input" value={fields.priceRange || ""} placeholder="$$" onChange={(e) => handleChange("priceRange", e.target.value)} />
                                  {renderError("priceRange")}
                                </div>
                              </div>
                            )
                            i += 2
                            continue
                          }
                        }

                        // Render LocalBusiness @type and, if adjacent, More specific @type in one responsive row
                        if (field.key === "localBusinessType") {
                          const nextField = flat[i + 1]
                          // If the next field is `moreSpecificType`, render both in one row
                          if (nextField && nextField.key === "moreSpecificType") {
                            const parentValue = fields.localBusinessType || ""
                            const subtypeOpts = parentValue && SUBTYPE_MAP[parentValue] ? SUBTYPE_MAP[parentValue] : []
                            elems.push(
                              <div key="localbusiness-and-specific" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">LocalBusiness @type</label>
                                  <div className="custom-select-wrapper compact-select localbusiness-select-wrapper relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setLocalBusinessTypeOpen((o) => !o)}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={localBusinessTypeOpen}
                                    >
                                      <span className="truncate block">{(fields.localBusinessType && fields.localBusinessType.trim()) ? fields.localBusinessType : "LocalBusiness"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {localBusinessTypeOpen && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                        <ul>
                                          {LOCAL_BUSINESS_TYPES.map((opt) => (
                                            <li key={opt.value} className={(fields.localBusinessType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("localBusinessType", opt.value); setLocalBusinessTypeOpen(false) }}>
                                              <div className="font-semibold text-[15px]">{opt.value}</div>
                                              <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                            </li>
                                          ))}
                                          <li key="none-localbusiness" className={(fields.localBusinessType || "") === "" ? "selected" : ""} onClick={() => { handleChange("localBusinessType", ""); setLocalBusinessTypeOpen(false) }}>
                                            Not specified
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {renderError("localBusinessType")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">More specific @type</label>
                                  {subtypeOpts && subtypeOpts.length > 0 ? (
                                    <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper relative" style={{ width: "100%" }}>
                                      <button
                                        type="button"
                                        className="custom-select-trigger tool-select"
                                        onClick={() => setMoreSpecificOpen((o) => !o)}
                                        style={{ width: "100%", justifyContent: "space-between" }}
                                        aria-expanded={moreSpecificOpen}
                                      >
                                        <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select subtype"}</span>
                                        <span className="text-xs">⏷</span>
                                      </button>

                                      {moreSpecificOpen && (
                                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                          <ul>
                                            {subtypeOpts.map((o) => (
                                              <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setMoreSpecificOpen(false) }}>
                                                <div className="font-semibold text-[15px]">{o.value}</div>
                                                <div className="text-[13px] text-gray-500">{o.desc}</div>
                                              </li>
                                            ))}
                                            <li key="none-subtype" className={(fields.moreSpecificType || "") === "" ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", ""); setMoreSpecificOpen(false) }}>
                                              Not specified
                                            </li>
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <input type="text" className="tool-input opacity-50" disabled value={fields.moreSpecificType || ""} placeholder={nextField.placeholder} onChange={(e) => handleChange("moreSpecificType", e.target.value)} />
                                  )}
                                  {renderError("moreSpecificType")}
                                </div>
                              </div>
                            )
                              // skip the next field as we've rendered it in this combined row
                              i++
                              continue
                            }

                          // No adjacent moreSpecificType — render LocalBusiness alone
                          elems.push(
                            <div key="localBusinessType" className="tool-field">
                              <label className="tool-label">LocalBusiness @type</label>
                              <div className="custom-select-wrapper compact-select localbusiness-select-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setLocalBusinessTypeOpen((o) => !o)}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={localBusinessTypeOpen}
                                >
                                  <span className="truncate block">{(fields.localBusinessType && fields.localBusinessType.trim()) ? fields.localBusinessType : "LocalBusiness"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {localBusinessTypeOpen && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                    <ul>
                                      {LOCAL_BUSINESS_TYPES.map((opt) => (
                                        <li key={opt.value} className={(fields.localBusinessType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("localBusinessType", opt.value); setLocalBusinessTypeOpen(false) }}>
                                          <div className="font-semibold text-[15px]">{opt.value}</div>
                                          <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                        </li>
                                      ))}
                                      <li key="none-localbusiness" className={(fields.localBusinessType || "") === "" ? "selected" : ""} onClick={() => { handleChange("localBusinessType", ""); setLocalBusinessTypeOpen(false) }}>
                                        Not specified
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {renderError("localBusinessType")}
                            </div>
                          )
                          continue
                        }
                        // Country + State/Province/Region should be in one row when adjacent
                        if (field.key === "country") {
                          const next1 = i + 1 < flat.length ? flat[i + 1] : null
                          // If the next field is region, render country + region in a single row
                          if (next1 && next1.key === "region") {
                            const currentCountryCode = getSelectedCountryCode(fields.country)
                            elems.push(
                              <div key="country-region-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Country</label>
                                  <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setCountryOpen((o) => !o)}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={countryOpen}
                                    >
                                      <span className="truncate block">{(fields.country && (COUNTRY_LIST.find(c => c.code === fields.country)?.name || fields.country)) || "Select country"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {countryOpen && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                        <div className="px-3 py-2">
                                          <input type="text" className="tool-input" placeholder="Search country" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                                        </div>
                                        <ul>
                                          {COUNTRY_LIST.filter(c => {
                                            if (!countrySearch) return true
                                            const q = countrySearch.toLowerCase()
                                            return c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q)
                                          }).map((opt) => (
                                            <li key={opt.code} className={(fields.country || "") === (opt.code || opt.name) ? "selected" : ""} onClick={() => { handleChange("country", opt.code || opt.name); setCountryOpen(false); setCountrySearch("") }}>
                                              <div className="font-semibold text-[15px]">{opt.name} {opt.code ? <span className="text-[13px] text-gray-500">({opt.code})</span> : null}</div>
                                            </li>
                                          ))}
                                          <li key="none-country" className={(fields.country || "") === "" ? "selected" : ""} onClick={() => { handleChange("country", ""); setCountryOpen(false); setCountrySearch("") }}>Not specified</li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {renderError("country")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">State/Province/Region</label>
                                  {/* If a known list exists for the selected country, show a select; otherwise fallback to free text */}
                                  {(() => {
                                    const code = currentCountryCode
                                    const localList = code && STATES_BY_COUNTRY[code]
                                    if (localList && localList.length) {
                                      return (
                                        <div className="custom-select-wrapper region-select-wrapper relative" style={{ width: "100%" }}>
                                          <button type="button" className="custom-select-trigger tool-select" onClick={() => setRegionOpen((o) => !o)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={regionOpen}>
                                            <span className="truncate block">{fields.region || "Select region"}</span>
                                            <span className="text-xs">⏷</span>
                                          </button>
                                          {regionOpen && (
                                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                              <div className="px-3 py-2">
                                                <input type="text" className="tool-input" placeholder="Search region" value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} />
                                              </div>
                                              <ul>
                                                {localList.filter(r => !regionSearch || r.toLowerCase().includes(regionSearch.toLowerCase())).map((r) => (
                                                  <li key={r} className={(fields.region || "") === r ? "selected" : ""} onClick={() => { handleChange("region", r); setRegionOpen(false); setRegionSearch("") }}>
                                                    <div className="font-semibold text-[15px]">{r}</div>
                                                  </li>
                                                ))}
                                                <li key="none-region" className={(fields.region || "") === "" ? "selected" : ""} onClick={() => { handleChange("region", ""); setRegionOpen(false); setRegionSearch("") }}>Not specified</li>
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                    // fallback: simple text input
                                    return <input type="text" className="tool-input" value={fields.region || ""} placeholder="State or region" onChange={(e) => handleChange("region", e.target.value)} />
                                  })()}
                                  {renderError("region")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                          // Fallback: country alone as a dropdown
                          elems.push(
                            <div key="country-alone" className="tool-field">
                              <label className="tool-label">Country</label>
                              <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setCountryOpen((o) => !o)}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={countryOpen}
                                >
                                  <span className="truncate block">{(fields.country && (COUNTRY_LIST.find(c => c.code === fields.country)?.name || fields.country)) || "Select country"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {countryOpen && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                    <div className="px-3 py-2">
                                      <input type="text" className="tool-input" placeholder="Search country" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                                    </div>
                                    <ul>
                                      {COUNTRY_LIST.filter(c => {
                                        if (!countrySearch) return true
                                        const q = countrySearch.toLowerCase()
                                        return c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q)
                                      }).map((opt) => (
                                        <li key={opt.code} className={(fields.country || "") === (opt.code || opt.name) ? "selected" : ""} onClick={() => { handleChange("country", opt.code || opt.name); setCountryOpen(false); setCountrySearch("") }}>
                                          <div className="font-semibold text-[15px]">{opt.name} {opt.code ? <span className="text-[13px] text-gray-500">({opt.code})</span> : null}</div>
                                        </li>
                                      ))}
                                      <li key="none-country" className={(fields.country || "") === "" ? "selected" : ""} onClick={() => { handleChange("country", ""); setCountryOpen(false); setCountrySearch("") }}>Not specified</li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {renderError("country")}
                            </div>
                          )
                          continue
                        }

                        // Latitude + Longitude should be in one row when adjacent
                        if (field.key === "latitude") {
                          const n1 = i + 1 < flat.length ? flat[i + 1] : null
                          if (n1 && n1.key === "longitude") {
                            elems.push(
                              <div key="lat-lon-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Latitude</label>
                                  <input type="text" className="tool-input" value={fields.latitude || ""} placeholder={"e.g. -1.2921"} onChange={(e) => handleChange("latitude", e.target.value)} />
                                  {renderError("latitude")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Longitude</label>
                                  <input type="text" className="tool-input" value={fields.longitude || ""} placeholder={"e.g. 36.8219"} onChange={(e) => handleChange("longitude", e.target.value)} />
                                  {renderError("longitude")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // When encountering 'street', render a combined row with city + postalCode (3 columns) if available
                        if (field.key === "street") {
                          const next1 = i + 1 < flat.length ? flat[i + 1] : null
                          const next2 = i + 2 < flat.length ? flat[i + 2] : null
                          // If the next fields are city and postalCode, render three columns
                          if (next1 && next1.key === "city" && next2 && next2.key === "postalCode") {
                            elems.push(
                              <div key="street-city-postal-row" className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Street</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.street || ""}
                                    placeholder="123 Main St"
                                    onChange={(e) => handleChange("street", e.target.value)}
                                  />
                                  {renderError("street")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">City</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.city || ""}
                                    placeholder="City"
                                    onChange={(e) => handleChange("city", e.target.value)}
                                  />
                                  {renderError("city")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Zip code</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.postalCode || ""}
                                    placeholder="Zip code"
                                    onChange={(e) => handleChange("postalCode", e.target.value)}
                                  />
                                  {renderError("postalCode")}
                                </div>
                              </div>
                            )
                            // Skip the next two fields because we've rendered them
                            if (i + 2 < flat.length && flat[i + 1].key === "city" && flat[i + 2].key === "postalCode") i += 2
                            continue
                          }

                          // Fallback: if only postalCode follows, keep previous two-column behaviour
                          if (i + 1 < flat.length && flat[i + 1].key === "postalCode") {
                            elems.push(
                              <div key="street-postal-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Street</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.street || ""}
                                    placeholder="123 Main St"
                                    onChange={(e) => handleChange("street", e.target.value)}
                                  />
                                  {renderError("street")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Zip code</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.postalCode || ""}
                                    placeholder="Zip code"
                                    onChange={(e) => handleChange("postalCode", e.target.value)}
                                  />
                                  {renderError("postalCode")}
                                </div>
                              </div>
                            )
                            if (i + 1 < flat.length && flat[i + 1].key === "postalCode") i++
                            continue
                          }

                          // Otherwise render street only
                          elems.push(
                            <div key="street-alone" className="tool-field">
                              <label className="tool-label">Street</label>
                              <input type="text" className="tool-input" value={fields.street || ""} placeholder="123 Main St" onChange={(e) => handleChange("street", e.target.value)} />
                              {renderError("street")}
                            </div>
                          )
                          continue
                        }

                        // Skip postalCode if it appears before street or duplicated
                        if (field.key === "postalCode") {
                          // If postalCode wasn't handled with street, render it standalone
                          elems.push(
                            <div key={field.key} className="tool-field">
                              <label className="tool-label">{field.label}</label>
                              <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                              {renderError(field.key)}
                            </div>
                          )
                          continue
                        }

                        // More specific @type: show context-aware subtype dropdown when available
                        if (field.key === "moreSpecificType") {
                          const parent = fields.localBusinessType || ""
                          const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
                          if (opts && opts.length > 0) {
                            elems.push(
                              <div key="moreSpecificType" className="tool-field">
                                <label className="tool-label">More specific @type</label>
                                <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper relative" style={{ width: "100%" }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setMoreSpecificOpen((o) => !o)}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={moreSpecificOpen}
                                  >
                                    <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select subtype"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {moreSpecificOpen && (
                                    <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                      <ul>
                                        {opts.map((o) => (
                                          <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setMoreSpecificOpen(false) }}>
                                            <div className="font-semibold text-[15px]">{o.value}</div>
                                            <div className="text-[13px] text-gray-500">{o.desc}</div>
                                          </li>
                                        ))}
                                        <li key="none-subtype" className={(fields.moreSpecificType || "") === "" ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", ""); setMoreSpecificOpen(false) }}>
                                          Not specified
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                {renderError("moreSpecificType")}
                              </div>
                            )
                          } else {
                            // Fallback to plain input when no subtype map exists for the selected parent
                            elems.push(
                              <div key={field.key} className="tool-field">
                                <label className="tool-label">{field.label}</label>
                                <input type="text" className="tool-input opacity-50" disabled value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                                {renderError(field.key)}
                              </div>
                            )
                          }
                          continue
                        }

                        // Default rendering for other fields
                        elems.push(
                          <div key={field.key} className="tool-field">
                            <label className="tool-label">{field.label}</label>
                            <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                            {renderError(field.key)}
                          </div>
                        )
                      }
                      return elems
                    })()}

                    {/* Opening hours repeater */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <button
                            type="button"
                            className={`action-btn ${fields.open24_7 === "true" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={addOpeningHour}
                            disabled={fields.open24_7 === "true"}
                            title={fields.open24_7 === "true" ? "Disable 'Open 24/7' to add specific hours" : "Add Opening Hours"}
                          >
                            <Plus className="inline w-4 h-4 mr-2" /> Add Opening Hours
                          </button>
                          <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <input type="checkbox" checked={fields.open24_7 === "true"} onChange={(e) => handleChange("open24_7", e.target.checked ? "true" : "false")} />
                            <span className="select-none">Open 24/7</span>
                          </label>
                        </div>
                        {renderError("openingHours")}
                      </div>

                      {openingHoursState && openingHoursState.length > 0 ? (
                        openingHoursState.map((oh, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-2 mt-4">
                                  <div className="tool-field md:col-span-5">
                                    <label className="tool-label">Day(s) of the week</label>
                                    <div className="custom-select-wrapper opening-days-wrapper relative" style={{ width: "100%" }}>
                                      <button
                                        type="button"
                                        className="custom-select-trigger tool-select"
                                        onClick={() => setOpeningDaysOpenIndex((o) => (o === idx ? null : idx))}
                                        style={{ width: "100%", justifyContent: "space-between" }}
                                        aria-expanded={openingDaysOpenIndex === idx}
                                      >
                                        <span className="truncate block">{(oh.days && oh.days.trim()) ? (oh.days.split(",").map(s => s.trim()).filter(Boolean).join(", ")) : "Select days"}</span>
                                        <span className="text-xs">⏷</span>
                                      </button>

                                      {openingDaysOpenIndex === idx && (
                                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 220, overflow: "auto" }}>
                                          <ul>
                                            {DAYS_OF_WEEK.map((d) => {
                                              const selected = (oh.days || "").split(",").map(s => s.trim()).filter(Boolean).includes(d)
                                              return (
                                                <li key={d} className={selected ? "selected" : ""} onClick={(e) => {
                                                  e.stopPropagation()
                                                  const cur = (oh.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                                  const next = cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]
                                                  updateOpeningHour(idx, "days", next.join(","))
                                                }}>
                                                  <label className="flex items-center gap-2 py-1 px-2 cursor-pointer">
                                                    <input
                                                      type="checkbox"
                                                      checked={selected}
                                                      onChange={(e) => {
                                                        e.stopPropagation()
                                                        const cur = (oh.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                                        const next = cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]
                                                        updateOpeningHour(idx, "days", next.join(","))
                                                      }}
                                                    />
                                                    <span>{d}</span>
                                                  </label>
                                                </li>
                                              )
                                            })}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    {renderError(`openingHours_time_${idx}_opens`)}
                                    {renderError(`openingHours_time_${idx}_closes`)}
                                  </div>
                            <div className="tool-field md:col-span-3">
                              <label className="tool-label">Opens at (e.g. 08:00)</label>
                              <input type="text" className="tool-input" value={oh.opens} placeholder="08:00" onChange={(e) => updateOpeningHour(idx, "opens", e.target.value)} />
                            </div>
                            <div className="tool-field md:col-span-3">
                              <label className="tool-label">Closes at (e.g. 21:00)</label>
                              <input type="text" className="tool-input" value={oh.closes} placeholder="21:00" onChange={(e) => updateOpeningHour(idx, "closes", e.target.value)} />
                            </div>
                            <div className="flex items-center md:col-span-1 justify-end">
                              <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeOpeningHour(idx)} title="Remove">
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No opening hours added yet.</div>
                      )}
                    </div>

                    {/* Departments repeater */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button type="button" className="action-btn" onClick={addDepartment}><Plus className="inline w-4 h-4 mr-2" /> Add Department</button>
                      </div>

                        {departments && departments.length > 0 ? (
                        departments.map((d, idx) => (
                          <div key={idx} className="mb-6 space-y-4" style={{ position: "relative", zIndex: departments.length - idx }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="tool-field">
                                <label className="tool-label">LocalBusiness @type</label>
                                <div className="custom-select-wrapper compact-select localbusiness-select-wrapper department-localbusiness-select relative" style={{ width: "100%", zIndex: 100 }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setDeptLocalBusinessOpenIndex((o) => (o === idx ? null : idx))}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={deptLocalBusinessOpenIndex === idx}
                                  >
                                    <span className="truncate block">{(d.localBusinessType && d.localBusinessType.trim()) ? d.localBusinessType : "LocalBusiness"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {deptLocalBusinessOpenIndex === idx && (
                                    <div className="custom-select-list absolute left-0 mt-1" style={{ width: "100%", maxHeight: 320, overflow: "auto", zIndex: 120 }}>
                                      <ul>
                                        {LOCAL_BUSINESS_TYPES.map((opt) => (
                                          <li
                                            key={`dept-${idx}-${opt.value}`}
                                            className={(d.localBusinessType || "") === opt.value ? "selected" : ""}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              try { console.debug('Dept select clicked', { idx, value: opt.value }) } catch {}
                                              updateDepartment(idx, "localBusinessType", opt.value)
                                              setDeptLocalBusinessOpenIndex(null)
                                            }}
                                          >
                                            <div className="font-semibold text-[15px]">{opt.value}</div>
                                            <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                          </li>
                                        ))}
                                        <li
                                          key={`dept-${idx}-none`}
                                          className={(d.localBusinessType || "") === "" ? "selected" : ""}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            try { console.debug('Dept select clicked', { idx, value: "" }) } catch {}
                                            updateDepartment(idx, "localBusinessType", "")
                                            setDeptLocalBusinessOpenIndex(null)
                                          }}
                                        >
                                          Not specified
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="tool-field">
                                <label className="tool-label">More specific @type</label>
                                {d.localBusinessType && SUBTYPE_MAP[d.localBusinessType] && SUBTYPE_MAP[d.localBusinessType].length > 0 ? (
                                  <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper department-subtype-select relative" style={{ width: "100%", zIndex: 100 }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setDeptMoreSpecificOpenIndex((o) => (o === idx ? null : idx))}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={deptMoreSpecificOpenIndex === idx}
                                    >
                                      <span className="truncate block">{(d.moreSpecificType && d.moreSpecificType.trim()) ? d.moreSpecificType : "Select Option"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {deptMoreSpecificOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1" style={{ width: "100%", maxHeight: 260, overflow: "auto", zIndex: 9999 }}>
                                        <ul>
                                          {SUBTYPE_MAP[d.localBusinessType].map((o) => (
                                            <li key={`${idx}-${o.value}`} className={(d.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { updateDepartment(idx, "moreSpecificType", o.value); setDeptMoreSpecificOpenIndex(null) }}>
                                              <div className="font-semibold text-[15px]">{o.value}</div>
                                              <div className="text-[13px] text-gray-500">{o.desc}</div>
                                            </li>
                                          ))}
                                          <li key={`${idx}-none-subtype`} className={(d.moreSpecificType || "") === "" ? "selected" : ""} onClick={() => { updateDepartment(idx, "moreSpecificType", ""); setDeptMoreSpecificOpenIndex(null) }}>
                                            Not specified
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <input type="text" className="tool-input opacity-50" disabled value={d.moreSpecificType || ""} placeholder="Select Option" onChange={(e) => updateDepartment(idx, "moreSpecificType", e.target.value)} />
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div className="tool-field">
                                <label className="tool-label">Name</label>
                                <input type="text" className="tool-input" value={d.name} placeholder="Department name" onChange={(e) => updateDepartment(idx, "name", e.target.value)} />
                              </div>

                              <div className="tool-field md:col-span-2">
                                <label className="tool-label">Image URL</label>
                                <input type="text" className="tool-input" value={d.imageUrl} placeholder="https://example.com/dept-photo.jpg" onChange={(e) => updateDepartment(idx, "imageUrl", e.target.value)} />
                                {renderError(`dept_imageUrl_${idx}`)}
                              </div>

                              <div className="tool-field">
                                <label className="tool-label">Phone</label>
                                <input type="text" className="tool-input" value={d.telephone} placeholder="+1-555-123-4567" onChange={(e) => updateDepartment(idx, "telephone", e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                              <div className="tool-field md:col-span-5">
                                <label className="tool-label">Day(s) of the week</label>
                                <div className="custom-select-wrapper opening-days-wrapper relative" style={{ width: "100%" }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setDeptOpeningDaysOpenIndex((o) => (o === idx ? null : idx))}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={deptOpeningDaysOpenIndex === idx}
                                  >
                                    <span className="truncate block">{(d.days && d.days.trim()) ? (d.days.split(",").map(s => s.trim()).filter(Boolean).join(", ")) : "Select days"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {deptOpeningDaysOpenIndex === idx && (
                                    <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 220, overflow: "auto" }}>
                                      <ul>
                                            {DAYS_OF_WEEK.map((day) => {
                                          const selected = (d.days || "").split(",").map(s => s.trim()).filter(Boolean).includes(day)
                                          return (
                                            <li key={day} className={selected ? "selected" : ""} onClick={(e) => {
                                              e.stopPropagation()
                                              const cur = (d.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                              const next = cur.includes(day) ? cur.filter(x => x !== day) : [...cur, day]
                                              updateDepartment(idx, "days", next.join(","))
                                            }}>
                                              <label className="flex items-center gap-2 py-1 px-2 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={selected}
                                                  onChange={(e) => {
                                                    e.stopPropagation()
                                                    const cur = (d.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                                    const next = cur.includes(day) ? cur.filter(x => x !== day) : [...cur, day]
                                                    updateDepartment(idx, "days", next.join(","))
                                                  }}
                                                />
                                                <span>{day}</span>
                                              </label>
                                            </li>
                                          )
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="tool-field md:col-span-3">
                                <label className="tool-label">Opens at (e.g. 08:00)</label>
                                <input type="text" className="tool-input" value={d.opens} placeholder="08:00" onChange={(e) => updateDepartment(idx, "opens", e.target.value)} />
                                {renderError(`dept_opens_${idx}`)}
                              </div>

                              <div className="tool-field md:col-span-3">
                                <label className="tool-label">Closes at (e.g. 21:00)</label>
                                <input type="text" className="tool-input" value={d.closes} placeholder="21:00" onChange={(e) => updateDepartment(idx, "closes", e.target.value)} />
                                {renderError(`dept_closes_${idx}`)}
                              </div>

                              <div className="flex items-center md:col-span-1 justify-end">
                                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeDepartment(idx)} title="Remove">
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No departments added yet.</div>
                      )}
                    </div>

                    {/* Social profiles repeater (reuse existing pattern) */}
                    <div className="mt-0">
                      <label className="tool-label block mb-2">Social profiles</label>
                      <div className="flex flex-col gap-2">
                        {socialProfiles && socialProfiles.length > 0 ? (
                          socialProfiles.map((s, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <input type="text" className="tool-input flex-1" value={s} placeholder={`https://social.example/profile-${idx + 1}`} onChange={(e) => handleSocialChange(idx, e.target.value)} onBlur={() => handleSocialBlur(idx)} />
                                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeSocialProfile(idx)} aria-label="Remove profile" title="Remove">×</button>
                              </div>
                              {renderError(`sameAs_${idx}`)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No social profiles added.</div>
                        )}

                        <div>
                          <button type="button" className="action-btn" onClick={addSocialProfile}>Add Profile</button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : type === "Organization" ? (
                  <>
                    {/* Organization @type + More specific @type selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="tool-field">
                        <label className="tool-label">Organization @type</label>
                        <div className="custom-select-wrapper compact-select organization-select-wrapper relative" style={{ width: "100%" }}>
                          <button
                            type="button"
                            className="custom-select-trigger tool-select"
                            onClick={() => setOrgTypeOpen((o) => !o)}
                            style={{ width: "100%", justifyContent: "space-between" }}
                            aria-expanded={orgTypeOpen}
                          >
                            <span className="truncate block">{(fields.organizationType && fields.organizationType.trim()) ? fields.organizationType : "Organization"}</span>
                            <span className="text-xs">⏷</span>
                          </button>

                          {orgTypeOpen && (
                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                              <ul>
                                {ORG_TYPES.map((opt) => (
                                  <li key={opt.value} className={(fields.organizationType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("organizationType", opt.value); setOrgTypeOpen(false) }}>
                                    <div className="font-semibold text-[15px]">{opt.value}</div>
                                    <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                  </li>
                                ))}
                                {/* no explicit 'Not specified' option — follow reference */}
                              </ul>
                            </div>
                          )}
                        </div>
                        {renderError("organizationType")}
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">More specific @type</label>
                        {(() => {
                          const parent = fields.organizationType || ""
                          const subtypeOpts = parent && ORG_SUBTYPE_MAP[parent] ? ORG_SUBTYPE_MAP[parent] : []
                          if (subtypeOpts && subtypeOpts.length) {
                            return (
                              <div className="custom-select-wrapper compact-select organization-subtype-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setOrgMoreSpecificOpen((o) => !o)}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={orgMoreSpecificOpen}
                                >
                                  <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select subtype"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {orgMoreSpecificOpen && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                    <ul>
                                      {subtypeOpts.map((o) => (
                                        <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setOrgMoreSpecificOpen(false) }}>
                                          <div className="font-semibold text-[15px]">{o.value}</div>
                                          <div className="text-[13px] text-gray-500">{o.desc}</div>
                                        </li>
                                      ))}
                                      {/* no explicit 'Not specified' option for subtype; use placeholder when none applicable */}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )
                          }
                          return <input type="text" className="tool-input opacity-50" disabled value={fields.moreSpecificType || ""} placeholder="No subtypes available" />
                        })()}
                        {renderError("moreSpecificType")}
                      </div>
                    </div>

                    {/* Organization Name + Alternative Name (single row) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="tool-field">
                        <label className="tool-label">Organization Name</label>
                        <input type="text" className="tool-input" value={fields.name || ""} placeholder="Organization name" onChange={(e) => handleChange("name", e.target.value)} />
                        {renderError("name")}
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">Alternative Name</label>
                        <input type="text" className="tool-input" value={fields.alternateName || ""} placeholder="Alternative / short name" onChange={(e) => handleChange("alternateName", e.target.value)} />
                        {renderError("alternateName")}
                      </div>
                    </div>

                    {/* Website URL + Logo URL (single row) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="tool-field">
                        <label className="tool-label">Website URL</label>
                        <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
                        {renderError("url")}
                      </div>

                      <div className="tool-field">
                        <label className="tool-label">Logo URL</label>
                        <input type="text" className="tool-input" value={fields.logo || ""} placeholder="https://example.com/logo.png" onChange={(e) => handleChange("logo", e.target.value)} />
                        {renderError("logo")}
                      </div>
                    </div>

                    {/* Social profiles for Organization */}
                    <div className="mt-0">
                      <label className="tool-label block mb-2">Social profiles</label>
                      <div className="flex flex-col gap-2">
                        {socialProfiles && socialProfiles.length > 0 ? (
                          socialProfiles.map((s, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <input type="text" className="tool-input flex-1" value={s} placeholder={`https://social.example/profile-${idx + 1}`} onChange={(e) => handleSocialChange(idx, e.target.value)} onBlur={() => handleSocialBlur(idx)} />
                                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeSocialProfile(idx)} aria-label="Remove profile" title="Remove">×</button>
                              </div>
                              {renderError(`sameAs_${idx}`)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No social profiles added.</div>
                        )}

                        <div>
                          <button type="button" className="action-btn" onClick={addSocialProfile}>Add Profile</button>
                        </div>
                      </div>
                    </div>

                    {/* Contacts repeater for Organization */}
                    <div className="mt-0">
                      <label className="tool-label block mb-2">Contacts</label>
                      <div className="flex flex-col gap-2">
                        {contacts && contacts.length > 0 ? (
                          contacts.map((c, idx) => (
                            <div key={idx} className="space-y-3 mb-2">
                              {/* Row 1: Type + Phone */}
                              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-start">
                                <div className="tool-field md:col-span-3">
                                  <label className="tool-label">Type</label>
                                  <div className="custom-select-wrapper compact-select contact-type-select relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setContactTypeOpenIndex((o) => (o === idx ? null : idx))}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={contactTypeOpenIndex === idx}
                                    >
                                      <span className="truncate block">{c.contactType || "Select type"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {contactTypeOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                        <ul>
                                          <li className={c.contactType === "Customer service" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Customer service"); setContactTypeOpenIndex(null) }}>Customer service</li>
                                          <li className={c.contactType === "Technical support" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Technical support"); setContactTypeOpenIndex(null) }}>Technical support</li>
                                          <li className={c.contactType === "Billing support" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Billing support"); setContactTypeOpenIndex(null) }}>Billing support</li>
                                          <li className={c.contactType === "Sales" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Sales"); setContactTypeOpenIndex(null) }}>Sales</li>
                                          <li className={c.contactType === "Reservations" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Reservations"); setContactTypeOpenIndex(null) }}>Reservations</li>
                                          <li className={c.contactType === "Emergency" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Emergency"); setContactTypeOpenIndex(null) }}>Emergency</li>
                                          <li className={c.contactType === "Other" ? "selected" : ""} onClick={() => { updateContact(idx, "contactType", "Other"); setContactTypeOpenIndex(null) }}>Other</li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="tool-field md:col-span-3">
                                  <label className="tool-label">Phone Number</label>
                                  <input type="text" className="tool-input" value={c.phone} placeholder="Format +1-401-555-1212" onChange={(e) => updateContact(idx, "phone", e.target.value)} />
                                </div>
                              </div>

                              {/* Row 2: Area(s), Language(s), Options (+ remove) */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="tool-field md:col-span-4">
                                  <label className="tool-label">Area(s) Served</label>
                                  <div className="custom-select-wrapper compact-select area-country-select relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => { setAreaCountryOpenIndex((o) => (o === idx ? null : idx)); setAreaCountrySearch("") }}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={areaCountryOpenIndex === idx}
                                    >
                                      <span className="truncate block">
                                        {c.areaServed && c.areaServed.trim()
                                          ? c.areaServed.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3).join(", ") + (c.areaServed.split(",").filter(Boolean).length > 3 ? "…" : "")
                                          : "Select country(s)"}
                                      </span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {areaCountryOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                        <div className="p-2">
                                          <input type="text" className="tool-input" placeholder="Search countries" value={areaCountrySearch} onChange={(e) => setAreaCountrySearch(e.target.value)} />
                                        </div>
                                        <ul>
                                          {countryList
                                            .filter((name) => name.toLowerCase().includes(areaCountrySearch.trim().toLowerCase()))
                                            .map((name) => {
                                              const selected = (c.areaServed || "").split(",").map((s) => s.trim()).filter(Boolean).includes(name)
                                              return (
                                                <li key={name} className={selected ? "selected" : ""} onClick={() => {
                                                  const prev = (c.areaServed || "").split(",").map((s) => s.trim()).filter(Boolean)
                                                  const nextSel = prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
                                                  updateContact(idx, "areaServed", nextSel.join(", "))
                                                }}>
                                                  {selected ? "✓ " : ""}{name}
                                                </li>
                                              )
                                            })}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="tool-field md:col-span-4">
                                  <label className="tool-label">Language(s)</label>
                                  <input type="text" className="tool-input" value={c.availableLanguage} placeholder="Languages" onChange={(e) => updateContact(idx, "availableLanguage", e.target.value)} />
                                </div>

                                <div className="tool-field md:col-span-3">
                                  <label className="tool-label">Options</label>
                                  <div className="custom-select-wrapper compact-select contact-options-select relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setOptionsOpenIndex((o) => (o === idx ? null : idx))}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={optionsOpenIndex === idx}
                                    >
                                      <span className="truncate block">{c.options && c.options.trim() ? c.options : "Select options"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {optionsOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                                        <ul>
                                          {(["Toll-free", "Hearing impaired"]).map((opt) => {
                                            const selected = (c.options || "").split(",").map((s) => s.trim()).filter(Boolean).includes(opt)
                                            return (
                                              <li key={opt} className={selected ? "selected" : ""} onClick={() => {
                                                const prev = (c.options || "").split(",").map((s) => s.trim()).filter(Boolean)
                                                const nextSel = prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]
                                                updateContact(idx, "options", nextSel.join(", "))
                                              }}>
                                                {selected ? "✓ " : ""}{opt}
                                              </li>
                                            )
                                          })}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center md:col-span-1 justify-end">
                                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeContact(idx)} title="Remove">×</button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No contacts added.</div>
                        )}

                        <div>
                          <button type="button" className="action-btn" onClick={addContact}><Plus className="inline w-4 h-4 mr-2" /> Add Contact</button>
                        </div>
                      </div>
                    </div>

                    {/* Render remaining simple fields for Organization (skip keys rendered above) */}
                    {schemaFields[type]
                      .filter((f) => ![
                        "organizationType",
                        "moreSpecificType",
                        "name",
                        "alternateName",
                        "url",
                        "logo",
                        "email",
                        "founder",
                        "foundingDate",
                        "street",
                        "city",
                        "region",
                        "postalCode",
                        "country",
                      ].includes(f.key))
                      .map((field) => (
                        <div key={field.key} className="tool-field">
                          <label className="tool-label">{field.label}</label>
                          <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                          {renderError(field.key)}
                        </div>
                      ))}
                  </>
                ) : (
                  schemaFields[type].map((field) => (
                    <div key={field.key} className="tool-field">
                      <label className="tool-label">{field.label}</label>
                      <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                      {renderError(field.key)}
                    </div>
                  ))
                )
              )
            )}
            {renderHelpLinks(type)}
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
      </div>
      </section>

      {/* =============================== */}
      {/* HOW TO USE / STEPS SECTION */}
      {/* =============================== */}
      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Schema Builder</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">Select a schema type, fill the relevant fields, then copy or download the JSON-LD. Use the test button to validate with Google's tool.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/pick.svg", import.meta.url).href,
                title: "1. Choose a Schema Type",
                desc: "Select the Schema.org type that best matches your page or content.",
              },
              {
                icon: new URL("../assets/icons/info.svg", import.meta.url).href,
                title: "2. Fill in the Required Fields",
                desc: "Provide the key information relevant to your selected schema type.",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Generate, Copy, and Test",
                desc: "Copy the JSON-LD, run the Rich Results Test, and paste into your site head.",
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
          <h2 className="md:text-4xl mb-5 text-center">Frequently Asked Questions</h2>

          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="border-b border-gray-200 group" open={openFaq === idx}>
              <summary
                className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  setOpenFaq(openFaq === idx ? null : idx)
                }}
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <Minus className="w-6 h-6 text-secondary transition-transform duration-200" />
                ) : (
                  <Plus className="w-6 h-6 text-secondary transition-transform duration-200 faq-plus" />
                )}
              </summary>
              <div className="pb-6 text-lg text-secondary">{item.a}</div>
            </details>
          ))}

          <div className="max-w-5xl mx-auto text-center mt-6">
            <p className="text-lg text-secondary">Still stuck? <a href="https://cralite.com/contact/" className="text-primary font-normal">Contact us</a>.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/schema-builder" />
        </div>
      </section>
    </>
  )
}