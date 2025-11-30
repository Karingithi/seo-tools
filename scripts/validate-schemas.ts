#!/usr/bin/env node
import { buildSchemaFromState, schemaFields } from "../src/utils/schema/builders"

type CheckResult = { ok: boolean; msgs: string[] }

const isValidUrl = (v?: string) => {
  if (!v) return false
  try { new URL(v); return true } catch { return false }
}

const isoDatetime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/

const sampleFromPlaceholders = (type: string) => {
  const defs = schemaFields[type] || []
  const out: Record<string, string> = {}
  defs.forEach((d) => {
    const p = d.placeholder || "sample"
    // prefer non-generic placeholders
    out[d.key] = p
  })
  // Add some sensible defaults for common fields
  if (type === "Article") {
    out.articleType = out.articleType || "BlogPosting"
    out.authorName = out.authorName || "Jane Doe"
    out.authorUrl = out.authorUrl || "https://example.com/author/jane-doe"
    out.url = out.url || "https://example.com/article"
    out.datePublished = out.datePublished || "2025-11-25"
    out.dateModified = out.dateModified || "2025-11-29"
    out.images = out.images || "https://example.com/image.jpg"
  }
  if (type === "Product") {
    out.name = out.name || "Sample Product"
    out.price = out.price || "9.99"
    out.currency = out.currency || "USD"
    out.url = out.url || "https://example.com/product"
  }
  if (type === "Local Business") {
    out.name = out.name || "Local Shop"
    out.street = out.street || "123 Main St"
    out.city = out.city || "Nairobi"
    out.postalCode = out.postalCode || "00100"
    out.country = out.country || "KE"
  }
  if (type === "Event") {
    out.name = out.name || "Sample Event"
    out.startDate = out.startDate || "2025-12-01"
  }
  if (type === "Video") {
    out.name = out.name || "Sample Video"
    out.thumbnailUrl = out.thumbnailUrl || "https://example.com/thumb.jpg"
    out.contentUrl = out.contentUrl || "https://example.com/video.mp4"
  }
  if (type === "FAQ Page") {
    // handled via faqItemsState, but ensure fields minimal
  }
  if (type === "Job Posting") {
    out.title = out.title || "Sample Job"
    out.hiringOrganization = out.hiringOrganization || "Example Co"
  }
  if (type === "Recipe") {
    out.name = out.name || "Sample Recipe"
    out.ingredients = out.ingredients || "1 cup sugar\n2 eggs"
  }
  return out
}

const checkSchema = (type: string, schema: any): CheckResult => {
  const msgs: string[] = []
  if (!schema) {
    msgs.push("No schema generated")
    return { ok: false, msgs }
  }
  if (schema['@context'] !== 'https://schema.org') msgs.push("@context is not https://schema.org")
  if (!schema['@type']) msgs.push("@type missing")

  // Type-specific heuristics (not exhaustive).
  switch (type) {
    case 'Article': {
      if (!schema.author || !schema.author.name) msgs.push('Article missing author.name')
      if (!schema.datePublished) msgs.push('Article missing datePublished')
      else if (!isoDatetime.test(schema.datePublished)) msgs.push('datePublished not full ISO datetime (YYYY-MM-DDThh:mm:ssZ)')
      break
    }
    case 'Product': {
      if (!schema.name) msgs.push('Product missing name')
      // offers can be object or array
      const hasOffer = schema.offers || schema.lowPrice || schema.price
      if (!hasOffer) msgs.push('Product missing offers/price')
      break
    }
    case 'Local Business': {
      if (!schema.name) msgs.push('Local Business missing name')
      if (!schema.address && !(schema.geo || schema.telephone)) msgs.push('Local Business missing address or geo/telephone')
      break
    }
    case 'Event': {
      if (!schema.startDate) msgs.push('Event missing startDate')
      break
    }
    case 'Video': {
      if (!schema.name) msgs.push('Video missing name')
      if (!schema.thumbnailUrl && !schema.thumbnailUrl?.length) msgs.push('Video missing thumbnailUrl')
      break
    }
    case 'FAQ Page': {
      if (!schema.mainEntity || !schema.mainEntity.length) msgs.push('FAQ Page mainEntity missing or empty')
      break
    }
    case 'How-to': {
      if (!schema.name) msgs.push('How-to missing name')
      if (!schema.step || !schema.step.length) msgs.push('How-to missing steps')
      break
    }
    case 'Job Posting': {
      if (!schema.title) msgs.push('JobPosting missing title')
      if (!schema.hiringOrganization) msgs.push('JobPosting missing hiringOrganization')
      break
    }
    case 'Recipe': {
      if (!schema.name) msgs.push('Recipe missing name')
      if (!schema.recipeIngredient || !schema.recipeIngredient.length) msgs.push('Recipe missing recipeIngredient')
      break
    }
    case 'Website Sitelinks Searchbox': {
      if (!schema.url) msgs.push('Website missing url')
      if (!schema.potentialAction) msgs.push('Website missing potentialAction (SearchAction)')
      break
    }
    // Add other types if needed
    default:
      break
  }

  return { ok: msgs.length === 0, msgs }
}

async function main() {
  const types = Object.keys(schemaFields)
  const results: Record<string, CheckResult> = {}

  for (const t of types) {
    const fields = sampleFromPlaceholders(t)
    // Provide auxiliary arrays/states for builders
    const params = {
      type: t,
      fields,
      images: fields.images ? fields.images.split(/,\s*/) : [],
      breadcrumbs: [],
      faqItemsState: [{ question: 'Q1', answer: 'A1' }],
      socialProfiles: [],
      videoThumbnails: fields.thumbnailUrl ? [fields.thumbnailUrl] : [],
      videoMinutes: '',
      videoSeconds: '',
      openingHoursState: [],
      departments: [],
      contacts: [],
      ticketTypes: [],
      ticketDefaultCurrency: '',
    }

    const schema = buildSchemaFromState(params as any)
    const res = checkSchema(t, schema)
    results[t] = res
  }

  // Print report
  let failed = 0
  console.log('\nSchema Validation Report (heuristic checks):\n')
  for (const [k, v] of Object.entries(results)) {
    if (v.ok) console.log(`✔ ${k}`)
    else {
      failed++
      console.log(`✖ ${k}`)
      v.msgs.forEach((m) => console.log(`   - ${m}`))
    }
  }

  console.log(`\nSummary: ${Object.keys(results).length - failed} passed, ${failed} failed.`)
  process.exit(failed === 0 ? 0 : 2)
}

main().catch((e) => { console.error(e); process.exit(3) })
