#!/usr/bin/env node
import { buildSchemaFromState } from "../src/utils/schema/builders.ts"

async function main() {
  const params = {
    type: "Article",
    fields: {
      articleType: "BlogPosting",
      url: "https://example.com/my-article",
      headline: "10 Proven SEO Tips to Boost Traffic",
      description: "Short summary — appears in Google search results",
      images: "https://example.com/image.jpg, https://example.com/image2.jpg",
      authorType: "Person",
      authorName: "Jane Doe",
      authorUrl: "https://example.com/author/jane-doe",
      publisherName: "Example Publisher",
      publisherLogo: "https://example.com/logo.png",
      datePublished: "2025-11-25",
      dateModified: "2025-11-29",
      articleBody: "This is the article body used for testing the schema builder output.",
    },
    images: [],
    breadcrumbs: [],
    faqItemsState: [],
    socialProfiles: [],
    videoThumbnails: [],
    videoMinutes: "",
    videoSeconds: "",
    openingHoursState: [],
    departments: [],
    contacts: [],
    ticketTypes: [],
    ticketDefaultCurrency: "",
  }

  try {
    const schema = buildSchemaFromState(params as any)
    console.log(JSON.stringify(schema, null, 2))
  } catch (err) {
    console.error("Error building schema:", err)
    process.exit(2)
  }
}

main()
