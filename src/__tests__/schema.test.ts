import { describe, it, expect } from 'vitest'
import { buildSchemaFromState } from '../utils/schema/builders'

describe('Article schema builder', () => {
  it('includes author and normalizes datePublished/dateModified to full ISO datetimes', () => {
    const params = {
      type: 'Article',
      fields: {
        articleType: 'BlogPosting',
        authorName: 'Jane Doe',
        authorUrl: 'https://example.com/author/jane-doe',
        authorType: 'Person',
        datePublished: '2025-11-25',
        dateModified: '2025-11-29',
      },
      images: [],
      breadcrumbs: [],
      faqItemsState: [],
      socialProfiles: [],
      videoThumbnails: [],
      videoMinutes: '',
      videoSeconds: '',
      openingHoursState: [],
      departments: [],
      contacts: [],
      ticketTypes: [],
      ticketDefaultCurrency: '',
    }

    const schema = buildSchemaFromState(params as any)

    // Author object must be present
    expect(schema.author).toBeDefined()
    expect(schema.author.name).toBe('Jane Doe')

    // Date fields should be full ISO datetimes ending with Z
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    expect(typeof schema.datePublished).toBe('string')
    expect(isoRegex.test(schema.datePublished)).toBe(true)
    expect(typeof schema.dateModified).toBe('string')
    expect(isoRegex.test(schema.dateModified)).toBe(true)
  })
})
