// src/utils/schema/builders.ts
import { DAY_ORDER } from "./constants"
import { applyProductOffersAndRatings } from "./product"
import type { BuildParams } from "./types"
import { compact, toNumber } from "./utils"

// Exported UI/data constants to be consumed by the SchemaBuilder UI.
export const schemaDescriptions: Record<string, string> = {
  Article: "Blog posts or news content.",
  Breadcrumb: "Website structure: Home → Category → Page.",
  "FAQ Page": "Questions & answers for rich results.",
  "How-to": "Step-by-step instructions for tasks.",
  "Local Business": "Local service, hours, and location.",
  Organization: "Company brand, socials, and contacts.",
  Product: "SKU, price, reviews, and offers.",
  Video: "Video metadata with thumbnail, embed & file URL.",
  "Website Sitelinks Searchbox": "Enable sitelinks searchbox in Google.",
  Person: "Information about an individual or author profile.",
  "Job Posting": "Job details for open positions.",
  Event: "Events, dates, and locations.",
}

export const schemaExamples: Record<string, string> = {
  Article: "Article, BlogPosting, NewsArticle",
  Breadcrumb: "Help Google understand your page hierarchy",
  "FAQ Page": "Add questions and answers to create a valid FAQ schema",
  "How-to": "Schema Builder for How-To Guides and Step-by-Step Content",
  "Local Business": "LocalBusiness, Store, Restaurant",
  Product: "Generate Structured Data Builder for Product, Offer, and AggregateOffer Types",
  Video: "VideoObject",
  "Website Sitelinks Searchbox": "WebSite + SearchAction",
  Organization: "Generate Accurate Schema Markup for Organizations, Local Businesses, and Corporations",
  Person: "Generate Structured Data Builder for Person, Author, and Speaker Profiles",
  "Job Posting": "Schema Builder for Job Listings, Hiring Info, and Requirements",
  Event: "Generate Structured Data for Events, Business Events, and Festivals",
}

export const HELP_LINKS: Record<string, { schema: { label: string; url: string }[]; google?: { label: string; url: string }[] }> = {
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
    schema: [
      { label: "Product", url: "https://schema.org/Product" },
      { label: "Review", url: "https://schema.org/Review" },
    ],
    google: [
      { label: "Product", url: "https://developers.google.com/search/docs/appearance/structured-data/product" },
      { label: "Review snippet", url: "https://developers.google.com/search/docs/appearance/structured-data/review-snippet" },
    ],
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

export const schemaFields: Record<string, { label: string; key: string; placeholder?: string }[]> = {
  Article: [
    { label: "Article @type", key: "articleType", placeholder: "BlogPosting" },
    { label: "Article URL", key: "url", placeholder: "https://example.com/my-article" },
    { label: "Headline", key: "headline", placeholder: "e.g. 10 Proven SEO Tips to Boost Traffic" },
    { label: "Strict 110-character SEO limit", key: "strictHeadlineLimit", placeholder: "false" },
    { label: "Description", key: "description", placeholder: "Short summary — appears in Google search results" },
    { label: "Image(s)", key: "images", placeholder: "https://example.com/image.jpg, https://example.com/image2.jpg" },
    { label: "Author @type", key: "authorType", placeholder: "Person" },
    { label: "Author Name", key: "authorName", placeholder: "e.g. Jane Doe" },
    { label: "Author URL", key: "authorUrl", placeholder: "https://example.com/author" },
    { label: "Publisher Name", key: "publisherName", placeholder: "Publisher or Site Name" },
    { label: "Publisher Logo URL", key: "publisherLogo", placeholder: "https://example.com/logo.png" },
    { label: "Date Published", key: "datePublished", placeholder: "yyyy-mm-dd" },
    { label: "Date Modified", key: "dateModified", placeholder: "yyyy-mm-dd" },
    { label: "Article Body (Optional)", key: "articleBody", placeholder: "Paste or write the main content here..." },
  ],
  Breadcrumb: [
    { label: "Breadcrumb Trail", key: "itemList", placeholder: "Home > Category > Page" },
  ],
  "FAQ Page": [],
  Product: [
    { label: "Product Name", key: "name", placeholder: "e.g. Ergonomic Office Chair" },
    { label: "Image URL", key: "imageUrl", placeholder: "https://example.com/photo.jpg" },
    { label: "SKU", key: "sku", placeholder: "SKU12345" },
    { label: "MPN", key: "mpn", placeholder: "MPN-0001" },
    { label: "GTIN-8", key: "gtin8", placeholder: "01234567" },
    { label: "GTIN-13", key: "gtin13", placeholder: "0123456789012" },
    { label: "GTIN-14", key: "gtin14", placeholder: "01234567890123" },
    { label: "Brand", key: "brand", placeholder: "Tembeya Wellness" },
    { label: "Price", key: "price", placeholder: "25.99" },
    { label: "Low price", key: "lowPrice", placeholder: "19.99" },
    { label: "High price", key: "highPrice", placeholder: "29.99" },
    { label: "Number of offers", key: "offerCount", placeholder: "3" },
    { label: "Currency", key: "currency", placeholder: "USD" },
    { label: "Offer Valid Until", key: "priceValidUntil", placeholder: "2026-12-31" },
    { label: "Availability", key: "availability", placeholder: "InStock" },
    { label: "Item Condition", key: "itemCondition", placeholder: "NewCondition" },
    { label: "URL", key: "url", placeholder: "https://example.com/product" },
    { label: "Description", key: "description", placeholder: "Natural detox blend" },
    { label: "Aggregate Rating Value", key: "ratingValue", placeholder: "4.5" },
    { label: "Number of ratings", key: "ratingCount", placeholder: "12" },
    { label: "Highest rating allowed (bestRating)", key: "bestRating", placeholder: "5" },
    { label: "Lowest rating allowed (worstRating)", key: "worstRating", placeholder: "1" },
    { label: "Review Count", key: "reviewCount", placeholder: "12" },
  ],
  "Local Business": [
    { label: "LocalBusiness @type", key: "localBusinessType", placeholder: "LocalBusiness" },
    { label: "More specific @type", key: "moreSpecificType", placeholder: "Select Option" },
    { label: "Name", key: "name", placeholder: "Business Name" },
    { label: "Business description", key: "description", placeholder: "Short description" },
    { label: "Logo URL", key: "logo", placeholder: "https://example.com/logo.png" },
    { label: "Image URL", key: "imageUrl", placeholder: "https://example.com/photo.jpg" },
    { label: "@id (URL)", key: "@id", placeholder: "https://example.com#id" },
    { label: "URL", key: "url", placeholder: "https://example.com" },
    { label: "Phone", key: "telephone", placeholder: "+1-555-123-4567" },
    { label: "Email", key: "email", placeholder: "info@example.com" },
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
    { label: "Average Rating (1-5)", key: "ratingValue", placeholder: "4.5" },
    { label: "Number of Reviews", key: "reviewCount", placeholder: "12" },
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
  "How-to": [
    { label: "How-to Title", key: "name", placeholder: "How to prune roses" },
    { label: "Description", key: "description", placeholder: "Short summary" },
    { label: "Tools (comma or newline)", key: "tools", placeholder: "Pruners, Gloves" },
    { label: "Supplies (comma or newline)", key: "supply", placeholder: "Mulch, Soil" },
    { label: "Steps (one per line)", key: "steps", placeholder: "Step 1\\nStep 2\\nStep 3" },
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
    { label: "@id (URL)", key: "@id", placeholder: "https://example.com/#organization" },
    { label: "URL", key: "url", placeholder: "https://tembeyawellnessretreats.com" },
    { label: "Logo URL", key: "logo", placeholder: "https://example.com/logo.png" },
    { label: "Contact Email", key: "email", placeholder: "info@example.com" },
    { label: "Legal Name", key: "legalName", placeholder: "Registered legal name" },
    { label: "ISO 6523 Code", key: "iso6523Code", placeholder: "e.g. 0088" },
    { label: "DUNS", key: "duns", placeholder: "D-U-N-S number" },
    { label: "LEI Code", key: "leiCode", placeholder: "Legal Entity Identifier" },
    { label: "NAICS Code", key: "naicsCode", placeholder: "e.g. 541611" },
    { label: "Global Location Number", key: "globalLocationNumber", placeholder: "GLN" },
    { label: "VAT ID", key: "vatId", placeholder: "VAT identification number" },
    { label: "Tax ID", key: "taxId", placeholder: "Company tax identifier" },
    { label: "Number of Employees", key: "numberOfEmployees", placeholder: "e.g. 250" },
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
    { label: "@id (URL)", key: "@id", placeholder: "https://example.com/#website" },
    { label: "Search URL Template", key: "urlTemplate", placeholder: "https://example.com/search?q={search_term_string}" },
    { label: "Description", key: "description", placeholder: "Short description of your site" },
  ],
  Person: [
    { label: "Name", key: "name", placeholder: "e.g. Jane Smith" },
    { label: "URL", key: "url", placeholder: "https://example.com/about/jane-smith" },
    { label: "Picture URL", key: "pictureUrl", placeholder: "https://example.com/images/jane-smith.jpg" },
    { label: "Social profiles", key: "sameAs", placeholder: "https://twitter.com/janesmith, https://linkedin.com/in/janesmith" },
    { label: "Job title", key: "jobTitle", placeholder: "e.g. Senior Marketing Manager, Author, Data Analyst" },
    { label: "Company", key: "worksFor", placeholder: "e.g. Acme Corporation, Self-employed" },
    { label: "Description", key: "description", placeholder: "Short bio or summary" },
    { label: "Date of Birth", key: "birthDate", placeholder: "yyyy-mm-dd" },
    { label: "School/University Name (for alumniOf)", key: "alumniOf", placeholder: "University Name" },
    { label: "Street", key: "street", placeholder: "123 Main St" },
    { label: "City", key: "city", placeholder: "Anytown" },
    { label: "State/Region", key: "region", placeholder: "CA" },
    { label: "Zip / Postal code", key: "postalCode", placeholder: "90210" },
    { label: "Country", key: "country", placeholder: "US" },
    { label: "Knows language(s)", key: "knowsLanguage", placeholder: "English, Spanish" },
    { label: "Occupation name", key: "hasOccupation", placeholder: "Digital Marketing Specialist" },
    { label: "Occupation description", key: "hasOccupationDescription", placeholder: "Brief occupation description" },
  ],
}

export const normalizeDaysToCodes = (daysRaw: string): string[] => {
  if (!daysRaw) return []
  const DAY_CODE_MAP: Record<string, string> = {
    Monday: "Mo", Mon: "Mo",
    Tuesday: "Tu", Tue: "Tu",
    Wednesday: "We", Wed: "We",
    Thursday: "Th", Thu: "Th",
    Friday: "Fr", Fri: "Fr",
    Saturday: "Sa", Sat: "Sa",
    Sunday: "Su", Sun: "Su",
  }
  return daysRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((d) => DAY_CODE_MAP[d] || d)
    .filter(Boolean)
    .map((d) => (DAY_ORDER.includes(d) ? d : null))
    .filter(Boolean) as string[]
}

export const collapseDayRanges = (codes: string[]): string[] => {
  if (!codes || !codes.length) return []
  const idxs = Array.from(new Set(codes.map((c) => DAY_ORDER.indexOf(c)).filter((i) => i >= 0))).sort((a, b) => a - b)
  const ranges: string[] = []
  let start = idxs[0]
  let end = idxs[0]
  for (let i = 1; i < idxs.length; i++) {
    const cur = idxs[i]
    if (cur === end + 1) end = cur
    else {
      ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
      start = cur
      end = cur
    }
  }
  ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
  return ranges
}

export function buildSchemaFromState(p: BuildParams): any {
  const { type, fields } = p
  const base: any = { "@context": "https://schema.org", "@type": type }

  Object.entries(fields).forEach(([k, v]) => {
    if (v && v.trim()) base[k] = v.trim()
  })

  let out: any = null

  if (type === "Article") {
    base["@type"] = (fields.articleType && fields.articleType.trim()) || "Article"
    const authorName = (fields.authorName || fields.author || "").trim()
    if (authorName) {
      base.author = { "@type": fields.authorType || "Person", name: authorName }
      if (fields.authorUrl && fields.authorUrl.trim()) base.author.url = fields.authorUrl.trim()
    }
    if (p.images && p.images.length) {
      const imgs = p.images.map((s) => s.trim()).filter(Boolean)
      if (imgs.length === 1) base.image = imgs[0]
      else if (imgs.length > 1) base.image = imgs
    } else if (fields.images && fields.images.trim()) {
      const imgs = fields.images.split(",").map((s) => s.trim()).filter(Boolean)
      base.image = imgs.length === 1 ? imgs[0] : imgs
    }
    if (fields.publisherName?.trim() || fields.publisherLogo?.trim()) {
      base.publisher = { "@type": "Organization" }
      if (fields.publisherName?.trim()) base.publisher.name = fields.publisherName.trim()
      if (fields.publisherLogo?.trim()) base.publisher.logo = { "@type": "ImageObject", url: fields.publisherLogo.trim() }
    }
    const toIsoDatetime = (d?: string) => {
      if (!d) return undefined
      const t = d.trim()
      // If date-only (yyyy-mm-dd), convert to full datetime at midnight UTC to satisfy validators.
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T00:00:00Z`
      return t
    }

    const dp = toIsoDatetime(fields.datePublished)
    const dm = toIsoDatetime(fields.dateModified)
    if (dp) base.datePublished = dp
    if (dm) base.dateModified = dm
    if (fields.articleBody?.trim()) base.articleBody = fields.articleBody.trim()
    delete base.articleType
    delete base.authorName
    delete base.authorUrl
    delete base.authorType
    delete base.images
    delete base.publisherName
    delete base.publisherLogo
    delete base.strictHeadlineLimit
    // Keep `base.author` — it contains the author object when provided.
    out = base
  }

  if (type === "Breadcrumb") {
    const items = p.breadcrumbs && p.breadcrumbs.length
      ? p.breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name || `Page ${i + 1}`, item: b.url || "" }))
      : (fields.itemList ? fields.itemList.split("\n").map((line: string, i: number) => ({ "@type": "ListItem", position: i + 1, name: line.split("|")[0] || `Page ${i + 1}`, item: (line.split("|")[1] || "").trim() })) : [])
    out = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.filter((it: any) => it.item && it.item.length) }
  }

  if (type === "FAQ Page") {
    const mainEntity = (p.faqItemsState || [])
      .map((f) => ({ "@type": "Question", name: (f.question || "").trim(), acceptedAnswer: { "@type": "Answer", text: (f.answer || "").trim() } }))
      .filter((q) => q.name && q.acceptedAnswer.text)
    out = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity }
  }

  if (type === "Person") {
    const person: any = { "@context": "https://schema.org", "@type": "Person" }
    if (fields.name?.trim()) person.name = fields.name.trim()
    if (fields.url?.trim()) person.url = fields.url.trim()
    if (fields.image?.trim()) person.image = fields.image.trim()
    else if (fields.pictureUrl?.trim()) person.image = fields.pictureUrl.trim()
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) person.sameAs = sa
    if (fields.worksFor?.trim()) {
      const org: any = { "@type": "Organization", name: fields.worksFor.trim() }
      if (fields.worksForUrl?.trim()) org.url = fields.worksForUrl.trim()
      person.worksFor = org
    }
    if (fields.jobTitle?.trim()) person.jobTitle = fields.jobTitle.trim()
    if (fields.description?.trim()) person.description = fields.description.trim()
    if (fields.telephone?.trim()) person.telephone = fields.telephone.trim()
    if (fields.email?.trim()) person.email = fields.email.trim()

    // Address for Person (PostalAddress)
    const personHasAddr = fields.street || fields.city || fields.region || fields.postalCode || fields.country
    if (personHasAddr) {
      const addr: any = { "@type": "PostalAddress" }
      if (fields.street?.trim()) addr.streetAddress = fields.street.trim()
      if (fields.city?.trim()) addr.addressLocality = fields.city.trim()
      if (fields.region?.trim()) addr.addressRegion = fields.region.trim()
      if (fields.postalCode?.trim()) addr.postalCode = fields.postalCode.trim()
      if (fields.country?.trim()) addr.addressCountry = fields.country.trim()
      person.address = addr
    }

    if (fields.alumniOf?.trim()) person.alumniOf = { "@type": "EducationalOrganization", name: fields.alumniOf.trim() }
    
    // Education repeater
    if (p.education && p.education.length > 0) {
      const eduArray = p.education
        .map((edu) => {
          const eduObj: any = { "@type": "EducationalOrganization" }
          if (edu.name?.trim()) eduObj.name = edu.name.trim()
          if (edu.url?.trim()) eduObj.url = edu.url.trim()
          return eduObj
        })
        .filter((edu) => edu.name) // Only include if at least name is present
      if (eduArray.length > 0) {
        person.alumniOf = eduArray.length === 1 ? eduArray[0] : eduArray
      }
    }
    
    if (fields.knowsLanguage?.trim()) {
      const langs = fields.knowsLanguage.split(",").map((s) => s.trim()).filter(Boolean)
      person.knowsLanguage = langs.length === 1 ? langs[0] : langs
    }

    if (fields.hasOccupation?.trim() || fields.hasOccupationDescription?.trim()) {
      const occ: any = { "@type": "Occupation" }
      if (fields.hasOccupation?.trim()) occ.name = fields.hasOccupation.trim()
      if (fields.hasOccupationDescription?.trim()) occ.description = fields.hasOccupationDescription.trim()
      person.hasOccupation = occ
    }
    if (fields.birthDate?.trim()) {
      // Expect yyyy-mm-dd
      person.birthDate = fields.birthDate.trim()
    }
    out = person
  }

  if (type === "Product") {
    applyProductOffersAndRatings(base, fields)
    out = base
  }

  if (type === "Event") {
    // Build location based on attendance mode
    const mode = (fields.attendanceMode || '').trim()
    const hasVenue = (fields.venueName || fields.venueStreet || fields.venueCity || fields.venuePostalCode || fields.venueCountry)
    const hasStreamUrl = (fields.streamUrl || fields.url)
    
    // For online-only events, use VirtualLocation
    if (mode === 'OnlineEventAttendanceMode' || mode === 'https://schema.org/OnlineEventAttendanceMode') {
      if (hasStreamUrl) {
        const virtualUrl = (fields.streamUrl?.trim() || fields.url?.trim())
        if (virtualUrl) {
          base.location = {
            "@type": "VirtualLocation",
            "url": virtualUrl
          }
        }
      }
    }
    // For offline or mixed events with physical venue, use Place with PostalAddress
    else if (hasVenue) {
      const place: any = { "@type": "Place" }
      if (fields.venueName?.trim()) place.name = fields.venueName.trim()
      const hasAddr = (fields.venueStreet || fields.venueCity || fields.venueRegion || fields.venuePostalCode || fields.venueCountry)
      if (hasAddr) {
        const addr: any = { "@type": "PostalAddress" }
        if (fields.venueStreet?.trim()) addr.streetAddress = fields.venueStreet.trim()
        if (fields.venueCity?.trim()) addr.addressLocality = fields.venueCity.trim()
        if (fields.venueRegion?.trim()) addr.addressRegion = fields.venueRegion.trim()
        if (fields.venuePostalCode?.trim()) addr.postalCode = fields.venuePostalCode.trim()
        if (fields.venueCountry?.trim()) addr.addressCountry = fields.venueCountry.trim()
        place.address = addr
      }
      base.location = place
      
      // For mixed events, also add VirtualLocation if stream URL is provided
      if ((mode === 'MixedEventAttendanceMode' || mode === 'https://schema.org/MixedEventAttendanceMode') && hasStreamUrl) {
        const virtualUrl = (fields.streamUrl?.trim() || fields.url?.trim())
        if (virtualUrl) {
          // location can be an array for mixed events [Place, VirtualLocation]
          base.location = [
            place,
            {
              "@type": "VirtualLocation",
              "url": virtualUrl
            }
          ]
        }
      }
    }
    // Fallback for legacy location field
    else if (fields.location) {
      base.location = { "@type": "Place", name: fields.location }
    }

    // Helper: compute timezone offset (+HH:MM or -HH:MM) for given date/time and IANA timezone
    const computeTzOffset = (date?: string, time?: string, tz?: string) => {
      try {
        const d = (date || "").trim()
        if (!d) return 'Z'
        const t = (time && time.trim()) ? time.trim() : '00:00'
        // Build a local Date from the provided date/time (interpreted in the runtime's local zone)
        const local = new Date(`${d}T${t}:00`)
        if (!tz) {
          // use local timezone offset
          const off = -local.getTimezoneOffset()
          const sign = off >= 0 ? '+' : '-'
          const abs = Math.abs(off)
          return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
        }
        const fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        })
        const parts = fmt.formatToParts(local).reduce((acc: any, p: any) => { acc[p.type] = p.value; return acc }, {})
        const yy = Number(parts.year), mm = Number(parts.month) - 1, dd = Number(parts.day), hh = Number(parts.hour), min = Number(parts.minute), ss = Number(parts.second)
        const utcForTz = Date.UTC(yy, mm, dd, hh, min, ss)
        const diffMinutes = Math.round((utcForTz - local.getTime()) / 60000)
        const sign = diffMinutes >= 0 ? '+' : '-'
        const m = Math.abs(diffMinutes)
        return `${sign}${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
      } catch {
        return 'Z'
      }
    }

    const combineDateTime = (date?: string, time?: string) => {
      if (!date) return undefined
      const d = date.trim()
      const t = time?.trim() ? time.trim() : null
      if (!t) return `${d}T00:00:00Z`
      const tz = (fields.timezone || '').trim() || undefined
      const offset = computeTzOffset(d, t, tz)
      return offset === 'Z' ? `${d}T${t}:00Z` : `${d}T${t}:00${offset}`
    }

    const sdt = combineDateTime(fields.startDate, fields.startTime)
    const edt = combineDateTime(fields.endDate, fields.endTime)
    if (sdt) base.startDate = sdt
    if (edt) base.endDate = edt
    if (fields.performerName?.trim()) base.performer = { "@type": (fields.performerType?.trim()) || "Person", name: fields.performerName.trim() }
    if (fields.eventStatus?.trim()) {
      const status = fields.eventStatus.trim()
      base.eventStatus = status.startsWith("http") ? status : `https://schema.org/${status}`
    }
    if (fields.attendanceMode?.trim()) {
      const mode = fields.attendanceMode.trim()
      base.eventAttendanceMode = mode.startsWith("http") ? mode : `https://schema.org/${mode}`
    }
    // Support both 'image' and 'imageUrl' for backwards compatibility
    if (fields.image?.trim()) base.image = fields.image.trim()
    else if (fields.imageUrl?.trim()) base.image = fields.imageUrl.trim()
    
    // url property serves as both event page URL and online attendance link
    // Priority: explicit url field, then streamUrl (for backwards compatibility), then imageUrl as fallback
    if (fields.url?.trim()) {
      base.url = fields.url.trim()
    } else if (fields.streamUrl?.trim()) {
      base.url = fields.streamUrl.trim()
    }
    
    if (p.ticketTypes && p.ticketTypes.length) {
      const offers = p.ticketTypes
        .map((t) => {
          const tt = t as any
          // support both old keys (name, price, currency, availability, url, availableFrom)
          // and the new offer* keys requested by the user
          const rawName = (tt.offerName ?? tt.name ?? "")
          const rawPrice = (tt.offerPrice ?? tt.price ?? "")
          const rawCurrency = (tt.offerPriceCurrency ?? tt.currency ?? p.ticketDefaultCurrency ?? "")
          const rawUrl = (tt.offerUrl ?? tt.url ?? "")
          const rawAvailability = (tt.offerAvailability ?? tt.availability ?? "")
          const rawValidFrom = (tt.offerValidFrom ?? tt.availableFrom ?? "")
          const rawDescription = (tt.offerDescription ?? tt.description ?? "")
          const has = (rawName || "").toString().trim() || (rawPrice || "").toString().trim()
          if (!has) return null
          const of: any = { "@type": "Offer" }
          if ((rawName || "").toString().trim()) of.name = (rawName || "").toString().trim()
          if ((rawDescription || "").toString().trim()) of.description = (rawDescription || "").toString().trim()
          if ((rawPrice || "").toString().trim()) of.price = (rawPrice || "").toString().trim()
          const currencyVal = (rawCurrency || "").toString().trim()
          of.priceCurrency = currencyVal || undefined
          if ((rawUrl || "").toString().trim()) of.url = (rawUrl || "").toString().trim()
          if ((rawAvailability || "").toString().trim()) {
            const raw = (rawAvailability || "").toString().trim()
            of.availability = raw.startsWith("http") ? raw : `https://schema.org/${raw}`
          }
          if ((rawValidFrom || "").toString().trim()) {
            const vf = (rawValidFrom || "").toString().trim()
            // Add timezone offset if validFrom is date-only (yyyy-mm-dd)
            if (/^\d{4}-\d{2}-\d{2}$/.test(vf)) {
              const tz = (fields.timezone || '').trim() || undefined
              const offset = computeTzOffset(vf, '00:00', tz)
              of.validFrom = offset === 'Z' ? `${vf}T00:00:00Z` : `${vf}T00:00:00${offset}`
            } else {
              of.validFrom = vf
            }
          }
          return Object.keys(of).length > 1 ? of : null
        })
        .filter(Boolean) as any[]
      // Always use array format for offers (recommended by Google)
      if (offers.length > 0) base.offers = offers
    }

    // Organizer mapping: support organizerType, organizerName, organizerUrl, organizerTelephone, organizerEmail, organizerLogo
    const hasOrganizer = (fields.organizerName || fields.organizerUrl || fields.organizerTelephone || fields.organizerEmail || fields.organizerLogo)
    if (hasOrganizer) {
      const orgType = (fields.organizerType?.trim()) || "Organization"
      const org: any = { "@type": orgType }
      if (fields.organizerName?.trim()) org.name = fields.organizerName.trim()
      if (fields.organizerUrl?.trim()) org.url = fields.organizerUrl.trim()
      if (fields.organizerTelephone?.trim()) org.telephone = fields.organizerTelephone.trim()
      if (fields.organizerEmail?.trim()) org.email = fields.organizerEmail.trim()
      if (fields.organizerLogo?.trim()) org.logo = fields.organizerLogo.trim()
      base.organizer = org
    }

    // Recurring event schedule mapping -> eventSchedule property (Schedule object)
    // Support either a single schedule via fields.schedule* or multiple via p.schedules array
    const scheduleFromFields = (fields.scheduleRepeatFrequency || fields.scheduleStartDate || fields.scheduleEndDate || fields.scheduleByDay || fields.scheduleStartTime || fields.scheduleEndTime)
    const schedules: any[] = []
    if (scheduleFromFields) {
      const s: any = { "@type": "Schedule" }
      if (fields.scheduleRepeatFrequency?.trim()) s.repeatFrequency = fields.scheduleRepeatFrequency.trim()
      if (fields.scheduleStartDate?.trim()) s.startDate = fields.scheduleStartDate.trim()
      if (fields.scheduleEndDate?.trim()) s.endDate = fields.scheduleEndDate.trim()
      if (fields.scheduleByDay?.trim()) {
        // allow comma-separated days
        s.byDay = fields.scheduleByDay.split(/\s*,\s*/).map((d: string) => d.trim()).filter(Boolean)
      }
      if (fields.scheduleStartTime?.trim()) s.startTime = fields.scheduleStartTime.trim()
      if (fields.scheduleEndTime?.trim()) s.endTime = fields.scheduleEndTime.trim()
      if (Object.keys(s).length > 1) schedules.push(s)
    }
    // Support p.schedules array if provided (each item similar shape to fields)
    if ((p as any).schedules && Array.isArray((p as any).schedules)) {
      ((p as any).schedules as any[]).forEach((ps) => {
        if (!ps) return
        const s: any = { "@type": "Schedule" }
        if (ps.repeatFrequency?.trim()) s.repeatFrequency = ps.repeatFrequency.trim()
        if (ps.startDate?.trim()) s.startDate = ps.startDate.trim()
        if (ps.endDate?.trim()) s.endDate = ps.endDate.trim()
        if (ps.byDay) s.byDay = (ps.byDay || "").toString().split(/\s*,\s*/).map((d: string) => d.trim()).filter(Boolean)
        if (ps.startTime?.trim()) s.startTime = ps.startTime.trim()
        if (ps.endTime?.trim()) s.endTime = ps.endTime.trim()
        if (Object.keys(s).length > 1) schedules.push(s)
      })
    }
    if (schedules.length === 1) base.eventSchedule = schedules[0]
    else if (schedules.length > 1) base.eventSchedule = schedules
    
    // Clean up redundant flat properties - these are now in structured objects
    delete base.performerName
    delete base.performerType
    delete base.startTime
    delete base.endTime
    delete base.imageUrl
    // Remove flat venue properties (now in location.address)
    delete base.venueName
    delete base.venueStreet
    delete base.venueCity
    delete base.venueRegion
    delete base.venuePostalCode
    delete base.venueCountry
    // Remove flat organizer properties (now in organizer object)
    delete base.organizerType
    delete base.organizerName
    delete base.organizerUrl
    delete base.organizerTelephone
    delete base.organizerEmail
    delete base.organizerLogo
    // remove non-schema/raw fields copied earlier
    delete base.attendanceMode
    delete base.timezone
    delete base.streamUrl
    out = base
  }

  if (type === "Website Sitelinks Searchbox") {
    const site: any = { "@context": "https://schema.org", "@type": "WebSite" }
    if (fields.name?.trim()) site.name = fields.name.trim()
    // Prefer an explicit @id if provided; otherwise derive @id from the site URL with a #website fragment
    if (fields["@id"]?.trim()) {
      site["@id"] = fields["@id"].trim()
    }
    if (fields.url?.trim()) {
      const raw = fields.url.trim()
      const url = raw.replace(/\/$/, "") // remove trailing slash for consistent @id
      site.url = raw
      if (!site["@id"]) site["@id"] = `${url}#website`
    }
    if (fields.description?.trim()) site.description = fields.description.trim()
    if (fields.urlTemplate?.trim()) {
      site.potentialAction = { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: fields.urlTemplate.trim() }, "query-input": "required name=search_term_string" }
    }
    out = site
  }

  if (type === "Video") {
    const video: any = { "@context": "https://schema.org", "@type": "VideoObject" }
    if (fields.name?.trim()) video.name = fields.name.trim()
    if (fields.description?.trim()) video.description = fields.description.trim()
    const thumbs = (p.videoThumbnails && p.videoThumbnails.length)
      ? p.videoThumbnails.map((s) => (s || "").trim()).filter(Boolean)
      : (fields.thumbnailUrl ? fields.thumbnailUrl.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (thumbs.length === 1) video.thumbnailUrl = thumbs[0]
    else if (thumbs.length > 1) video.thumbnailUrl = thumbs
    if (fields.uploadDate?.trim()) video.uploadDate = fields.uploadDate.trim()
    let durationVal = fields.duration?.trim() ? fields.duration.trim() : ""
    if (!durationVal) {
      const m = parseInt(p.videoMinutes || "0", 10) || 0
      const s = parseInt(p.videoSeconds || "0", 10) || 0
      if (m || s) durationVal = `PT${m}M${s}S`
    }
    if (durationVal) video.duration = durationVal
    if (fields.contentUrl?.trim()) video.contentUrl = fields.contentUrl.trim()
    if (fields.embedUrl?.trim()) video.embedUrl = fields.embedUrl.trim()
    if (fields.seekToTarget?.trim()) {
      video.potentialAction = { "@type": "SeekToAction", target: { "@type": "EntryPoint", urlTemplate: fields.seekToTarget.trim() }, "startOffset-input": "required name=seek_to_second_number" }
    }
    delete video.thumbnailUrl
    delete video.duration
    delete video.seekToTarget
    out = video
  }

  if (type === "Recipe") {
    const recipe: any = { "@context": "https://schema.org", "@type": "Recipe" }
    if (fields.name?.trim()) recipe.name = fields.name.trim()
    if (fields.description?.trim()) recipe.description = fields.description.trim()
    if (fields.authorName?.trim()) {
      recipe.author = { "@type": fields.authorType || "Person", name: fields.authorName.trim() }
      if (fields.authorUrl?.trim()) recipe.author.url = fields.authorUrl.trim()
    }
    if (p.images && p.images.length) {
      const imgs = p.images.map((s) => s.trim()).filter(Boolean)
      if (imgs.length === 1) recipe.image = imgs[0]
      else if (imgs.length > 1) recipe.image = imgs
    } else if (fields.images?.trim()) {
      const imgs = fields.images.split(",").map((s) => s.trim()).filter(Boolean)
      recipe.image = imgs.length === 1 ? imgs[0] : imgs
    }
    if (fields.ingredients?.trim()) {
      const parts = fields.ingredients.includes("\n") ? fields.ingredients.split(/\r?\n/) : fields.ingredients.split(",")
      recipe.recipeIngredient = parts.map((p) => p.trim()).filter(Boolean)
    }
    if (fields.prepTime?.trim()) recipe.prepTime = fields.prepTime.trim()
    if (fields.cookTime?.trim()) recipe.cookTime = fields.cookTime.trim()
    if (fields.totalTime?.trim()) recipe.totalTime = fields.totalTime.trim()
    if (fields.recipeYield?.trim()) recipe.recipeYield = fields.recipeYield.trim()
    if (fields.recipeInstructions?.trim()) {
      const steps = fields.recipeInstructions.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      if (steps.length === 1) recipe.recipeInstructions = steps[0]
      else recipe.recipeInstructions = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
    }
    delete recipe.images
    delete recipe.ingredients
    delete recipe.authorName
    delete recipe.authorUrl
    delete recipe.authorType
    out = recipe
  }

  if (type === "How-to") {
    const howto: any = { "@context": "https://schema.org", "@type": "HowTo" }
    if (fields.name?.trim()) howto.name = fields.name.trim()
    if (fields.description?.trim()) howto.description = fields.description.trim()
    if (fields.totalTime?.trim()) {
      const raw = fields.totalTime.trim()
      // If user entered plain minutes (e.g. "40"), convert to ISO 8601 duration PT40M
      if (/^\d+$/.test(raw)) howto.totalTime = `PT${raw}M`
      else howto.totalTime = raw
    }
    const parseList = (s?: string) => {
      if (!s) return []
      const arr = s.includes("\n") ? s.split(/\r?\n/) : s.split(",")
      return arr.map((x) => x.trim()).filter(Boolean)
    }
    const toolsOut = (p as any).howToTools as string[] | undefined
    const suppliesOut = (p as any).howToSupplies as string[] | undefined
    const toolsArr = toolsOut && toolsOut.length ? toolsOut.map((x) => x.trim()).filter(Boolean) : parseList(fields.tools)
    const supplyArr = suppliesOut && suppliesOut.length ? suppliesOut.map((x) => x.trim()).filter(Boolean) : parseList(fields.supply)
    if (toolsArr.length) howto.tool = toolsArr.map((n) => ({ "@type": "HowToTool", name: n }))
    if (supplyArr.length) howto.supply = supplyArr.map((n) => ({ "@type": "HowToSupply", name: n }))
    const stepsState = (p as any).howToSteps as Array<{ instruction: string; imageUrl?: string; name?: string; url?: string }>
    if (stepsState && stepsState.length && stepsState.some((s) => (s.instruction || "").trim())) {
      const steps = stepsState
        .map((s) => ({ "@type": "HowToStep", position: 0, text: s.instruction?.trim() || undefined, name: s.name?.trim() || undefined, image: s.imageUrl?.trim() || undefined, url: s.url?.trim() || undefined }))
        .filter((s) => s.text)
      howto.step = steps.map((s, i) => ({ ...s, position: i + 1 }))
    } else if (fields.steps?.trim()) {
      const steps = fields.steps.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      howto.step = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
    }
    // Include main image if provided (support p.images or fields.imageUrl)
    if (p.images && p.images.length) {
      const imgs = p.images.map((s: string) => (s || "").trim()).filter(Boolean)
      if (imgs.length === 1) howto.image = imgs[0]
      else if (imgs.length > 1) howto.image = imgs
    } else if (fields.imageUrl?.trim()) {
      howto.image = fields.imageUrl.trim()
    }

    // Include estimatedCost as MonetaryAmount when currency is provided
    if (fields.estimatedCost?.trim()) {
      const raw = fields.estimatedCost.trim()
      const currencyVal = (fields.currency || "").trim() || undefined
      if (currencyVal) {
        howto.estimatedCost = { "@type": "MonetaryAmount", currency: currencyVal, value: raw }
      } else {
        // fallback to plain text
        howto.estimatedCost = raw
      }
    }

    out = howto
  }

  if (type === "Job Posting") {
    const job: any = { "@context": "https://schema.org", "@type": "JobPosting" }
    if (fields.title?.trim()) job.title = fields.title.trim()
    if (fields.jobDescription?.trim()) job.description = fields.jobDescription.trim()
    if (fields.datePosted?.trim()) job.datePosted = fields.datePosted.trim()
    if (fields.validThrough?.trim()) job.validThrough = fields.validThrough.trim()
    if (fields.employmentType?.trim()) job.employmentType = fields.employmentType.trim()
    if (fields.workHours?.trim()) job.workHours = fields.workHours.trim()
    if (fields.hiringOrganization?.trim()) {
      job.hiringOrganization = { "@type": "Organization", name: fields.hiringOrganization.trim() }
      if (fields.hiringOrganizationUrl?.trim()) job.hiringOrganization.sameAs = fields.hiringOrganizationUrl.trim()
      if (fields.companyLogo?.trim()) job.hiringOrganization.logo = fields.companyLogo.trim()
    }
    if (fields.identifier?.trim()) job.identifier = { "@type": "PropertyValue", value: fields.identifier.trim() }
    const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
    if (hasAddress) {
      const addr: any = { "@type": "PostalAddress" }
      if (fields.street?.trim()) addr.streetAddress = fields.street.trim()
      if (fields.city?.trim()) addr.addressLocality = fields.city.trim()
      if (fields.region?.trim()) addr.addressRegion = fields.region.trim()
      if (fields.postalCode?.trim()) addr.postalCode = fields.postalCode.trim()
      if (fields.country?.trim()) addr.addressCountry = fields.country.trim()
      job.jobLocation = { "@type": "Place", address: addr }
    }
    if (fields.isRemote === "true") job.jobLocationType = "TELECOMMUTE"
    // Resolve conflict: if TELECOMMUTE and a full street address exists, strip detailed address to avoid contradiction
    if (job.jobLocationType === "TELECOMMUTE" && job.jobLocation && job.jobLocation.address) {
      const a = job.jobLocation.address as any
      if (a && a.streetAddress) {
        // Keep only country when remote; remove street/city/postal to avoid conflicting data
        const countryOnly = a.addressCountry ? { "@type": "PostalAddress", addressCountry: a.addressCountry } : null
        job.jobLocation.address = countryOnly || undefined
      }
    }
    const minRaw = fields.minSalary?.trim() ? Number(fields.minSalary.trim()) : NaN
    const maxRaw = fields.maxSalary?.trim() ? Number(fields.maxSalary.trim()) : NaN
    const currency = fields.currency?.trim() || "USD"
    const unitText = fields.salaryUnit?.trim() || undefined
    if (Number.isFinite(minRaw) || Number.isFinite(maxRaw)) {
      const value: any = { "@type": "QuantitativeValue" }
      if (Number.isFinite(minRaw)) value.minValue = minRaw
      if (Number.isFinite(maxRaw)) value.maxValue = maxRaw
      if (unitText) value.unitText = unitText
      job.baseSalary = { "@type": "MonetaryAmount", currency, value }
    }
    // Normalize and sanitize multi-line fields
    const escapeNewlines = (s: string) => String(s).replace(/\r?\n/g, "\\n")

    if (fields.responsibilities?.trim()) {
      let r = fields.responsibilities.trim()
      // Auto-prefix bare www. links with https://
      r = r.replace(/(^|\s)(www\.[^\s]+)/g, (_, pre, url) => `${pre}https://${url}`)
      job.responsibilities = escapeNewlines(r)
    }

    if (fields.skills?.trim()) {
      // Split on newlines or commas, then coalesce small fragments like 'or related field'
      const parts = fields.skills.split(/\r?\n|,\s*/).map((s) => s.trim()).filter(Boolean)
      const merged: string[] = []
      parts.forEach((p) => {
        if (!p) return
        // If this part looks like a continuation (starts with lowercase or 'or ' / 'and '), append to previous
        if (merged.length > 0 && (/^(or |and )/i.test(p) || /^[a-z]/.test(p) || p.length <= 3)) {
          merged[merged.length - 1] = `${merged[merged.length - 1]} ${p}`
        } else {
          merged.push(p)
        }
      })
      job.skills = merged
    }

    if (fields.qualifications?.trim()) job.qualifications = escapeNewlines(fields.qualifications.trim())

    if (fields.educationRequirements?.trim()) {
      const eduRaw = fields.educationRequirements.trim()
      const eduLower = eduRaw.toLowerCase()
      const mapToCredentialCategory = (): string | null => {
        if (/no\s*requirements|none/i.test(eduLower)) return 'no requirements'
        if (/high school/i.test(eduLower)) return 'high school'
        if (/associate/i.test(eduLower)) return 'associate degree'
        if (/bachelor/i.test(eduLower)) return 'bachelor degree'
        if (/(postgraduate|master|m\.?a\b|m\.?s\b|phd|doctor)/i.test(eduLower)) return 'postgraduate degree'
        if (/professional certificate|certificate/i.test(eduLower)) return 'professional certificate'
        return null
      }
      const cred = mapToCredentialCategory()
      if (cred) {
        if (cred === 'no requirements') job.educationRequirements = 'no requirements'
        else job.educationRequirements = { '@type': 'EducationalOccupationalCredential', credentialCategory: cred }
      } else {
        // fallback to freeform text when we can't canonicalize
        job.educationRequirements = eduRaw
      }
    }

    if (fields.experienceRequirements?.trim()) {
      const exRaw = fields.experienceRequirements.trim()
      const parseMonths = (text: string): number | null => {
        // Try to parse ranges first (e.g. "3-5 years"), respecting "or" vs "and"
        const rangeMatch = text.match(/(\d{1,3})\s*(?:-|–|to)\s*(\d{1,3})\s*(years?|yrs?|months?)/i)
        if (rangeMatch) {
          const a = parseInt(rangeMatch[1], 10)
          const b = parseInt(rangeMatch[2], 10)
          const unit = /month/i.test(rangeMatch[3]) ? 'months' : 'years'
          const useMin = /\bor\b/i.test(text)
          const chosen = useMin ? Math.min(a, b) : Math.max(a, b)
          return unit === 'months' ? chosen : chosen * 12
        }
        // Find all occurrences like "3 years" or "36 months"
        const nums = Array.from(text.matchAll(/(\d{1,3})\s*(years?|yrs?|months?)/gi))
        if (nums.length) {
          const vals = nums.map((m) => {
            const n = parseInt(m[1], 10)
            const unit = /month/i.test(m[2]) ? 'months' : 'years'
            return unit === 'months' ? n : n * 12
          })
          if (/\bor\b/i.test(text)) return Math.min(...vals)
          if (/\band\b/i.test(text)) return Math.max(...vals)
          return vals[0]
        }
        // Bare number -> treat as years
        const bare = text.match(/^\s*(\d{1,3})\s*$/)
        if (bare) return parseInt(bare[1], 10) * 12
        return null
      }
      const months = parseMonths(exRaw)
      if (months !== null) job.experienceRequirements = { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: months }
      else job.experienceRequirements = exRaw
    }

    // If UI exposes a boolean indicating experience may be used in place of education,
    // include it and ensure both properties are present per Google's guidance.
    const expInPlace = (fields.experienceInPlaceOfEducation || fields.experienceInPlaceOfEducation === 'true' || '').toString().trim().toLowerCase()
    if (expInPlace === 'true' || expInPlace === '1' || expInPlace === 'yes' || expInPlace === 'on') {
      job.experienceInPlaceOfEducation = true
      if (!job.educationRequirements) job.educationRequirements = 'no requirements'
      if (!job.experienceRequirements) job.experienceRequirements = 'no requirements'
    }

    // Sanitize education/experience strings: remove stray trailing commas and normalize curly quotes
    const normalizeText = (t: string) => String(t).replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/\s*,\s*$/g, '').trim()
    if (job.educationRequirements && typeof job.educationRequirements === 'string') job.educationRequirements = normalizeText(job.educationRequirements)
    if (job.experienceRequirements && typeof job.experienceRequirements === 'string') job.experienceRequirements = normalizeText(job.experienceRequirements)

    // applicantLocationRequirements: prefer explicit country (if provided) to indicate where applicants must be located
    if (fields.country?.trim()) {
      // Use Country object when only a country code or name is provided
      job.applicantLocationRequirements = { "@type": "Country", name: fields.country.trim() }
    }
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
    out = job
  }

  if (type === "Local Business") {
    const bizType = (fields.moreSpecificType?.trim()) || (fields.localBusinessType?.trim()) || "LocalBusiness"
    const biz: any = { "@context": "https://schema.org", "@type": bizType }
    if (fields.name?.trim()) biz.name = fields.name.trim()
    if (fields.url?.trim()) biz.url = fields.url.trim()
    if (fields.logo?.trim()) biz.logo = fields.logo.trim()
    if (fields.imageUrl?.trim()) biz.image = fields.imageUrl.trim()
    if (fields["@id"]?.trim()) biz["@id"] = fields["@id"].trim()
    if (fields.telephone?.trim()) biz.telephone = fields.telephone.trim()
    if (fields.email?.trim()) biz.email = fields.email.trim()
    if (fields.priceRange?.trim()) biz.priceRange = fields.priceRange.trim()
    const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
    if (hasAddress) {
      const addr: any = { "@type": "PostalAddress" }
      if (fields.street?.trim()) addr.streetAddress = fields.street.trim()
      if (fields.city?.trim()) addr.addressLocality = fields.city.trim()
      if (fields.region?.trim()) addr.addressRegion = fields.region.trim()
      if (fields.postalCode?.trim()) addr.postalCode = fields.postalCode.trim()
      if (fields.country?.trim()) addr.addressCountry = fields.country.trim()
      biz.address = addr
    }
    if ((fields.latitude?.trim()) || (fields.longitude?.trim())) {
      const lat = parseFloat((fields.latitude || "").trim())
      const lon = parseFloat((fields.longitude || "").trim())
      if (!isNaN(lat) && !isNaN(lon)) biz.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lon }
    }
    const formatOpeningHoursStrings = (): string[] => {
      if (fields.open24_7 === "true") return ["Mo-Su 00:00-23:59"]
      if (p.openingHoursState && p.openingHoursState.length) {
        const out: string[] = []
        p.openingHoursState.forEach((oh) => {
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
      if (fields.openingHours?.trim()) return [fields.openingHours.trim()]
      return []
    }
    const openingHoursStrings = formatOpeningHoursStrings()
    if (openingHoursStrings.length === 1) biz.openingHours = openingHoursStrings[0]
    else if (openingHoursStrings.length > 1) biz.openingHours = openingHoursStrings
    const CODE_TO_DAY: Record<string, string> = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" }
    const buildOpeningHoursSpecs = (): any[] => {
      if (fields.open24_7 === "true") {
        return [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }]
      }
      if (p.openingHoursState && p.openingHoursState.length) {
        const specs: any[] = []
        p.openingHoursState.forEach((oh) => {
          const codes = normalizeDaysToCodes(oh.days || "")
          if (!codes.length) return
          const daysOrdered = DAY_ORDER.filter((c: string) => codes.includes(c)).map((c: string) => CODE_TO_DAY[c])
          const opens = (oh.opens || "").trim()
          const closes = (oh.closes || "").trim()
          if (daysOrdered.length && opens && closes) specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: daysOrdered, opens, closes })
        })
        if (specs.length) return specs
      }
      return []
    }
    const openingHoursSpecs = buildOpeningHoursSpecs()
    if (openingHoursSpecs.length) biz.openingHoursSpecification = openingHoursSpecs
    // AggregateRating for Local Business (average rating + number of reviews)
    if ((fields.ratingValue || "").trim()) {
      const rating: any = { "@type": "AggregateRating", ratingValue: (fields.ratingValue || "").trim() }
      const rc = toNumber((fields.reviewCount || "").trim())
      if (rc != null) rating.reviewCount = rc
      biz.aggregateRating = rating
    }
    if (p.departments && p.departments.length) {
      const deps = p.departments.map((d) => {
        const deptType = (d.moreSpecificType?.trim()) || (d.localBusinessType?.trim()) || "LocalBusiness"
        const obj: any = { "@type": deptType }
        if (d.name?.trim()) obj.name = d.name.trim()
        if (d.imageUrl?.trim()) obj.image = d.imageUrl.trim()
        if (d.telephone?.trim()) obj.telephone = d.telephone.trim()
        return obj
      })
      if (deps.length) biz.department = deps
    }
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) biz.sameAs = sa
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
    delete biz.ratingValue
    delete biz.reviewCount
    out = biz
  }

  if (type === "Organization") {
    const org: any = { ...base, "@type": "Organization" }
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) org.sameAs = sa
    if (p.contacts && p.contacts.length) {
      const cps = p.contacts
        .map((c) => {
          const cp: any = { "@type": "ContactPoint" }
          if (c.contactType?.trim()) cp.contactType = c.contactType.trim()
          if (c.phone?.trim()) cp.telephone = c.phone.trim()
          if (c.areaServed?.trim()) cp.areaServed = c.areaServed.trim()
          if (c.availableLanguage?.trim()) {
            const langs = c.availableLanguage.includes(",") ? c.availableLanguage.split(",").map((s) => s.trim()).filter(Boolean) : [c.availableLanguage.trim()]
            cp.availableLanguage = langs.length === 1 ? langs[0] : langs
          }
          if (c.options?.trim()) cp.contactOption = c.options.trim()
          return Object.keys(cp).length > 1 ? cp : null
        })
        .filter(Boolean) as any[]
      if (cps.length) org.contactPoint = cps
    }
    // Ensure explicit email field is present on Organization when provided
    if (fields.email?.trim()) org.email = fields.email.trim()
    // Prefer an explicit @id for Organization; otherwise derive from the URL
    if (fields["@id"]?.trim()) {
      org["@id"] = fields["@id"].trim()
    } else if (fields.url?.trim()) {
      const raw = fields.url.trim()
      const url = raw.replace(/\/$/, "")
      org["@id"] = `${url}#organization`
    }
    // Apply Additional Info repeater values if provided
    const extras = (p as any).orgExtras as Array<{ key: string; value: string }> | undefined
    if (extras && Array.isArray(extras)) {
      extras.forEach((e) => {
        const k = (e?.key || "").trim()
        const vRaw = (e?.value || "").trim()
        if (!k || !vRaw) return
        switch (k) {
          case "numberOfEmployees": {
            const n = Number(vRaw)
            org.numberOfEmployees = Number.isFinite(n) ? n : vRaw
            break
          }
          default:
            org[k] = vRaw
        }
      })
    }
    out = org
  }

  return compact(out || base)
}
