export type ArticleFields = {
  articleType?: string
  url?: string
  headline?: string
  strictHeadlineLimit?: string
  description?: string
  authorType?: string
  authorName?: string
  authorUrl?: string
  publisherName?: string
  publisherLogo?: string
  datePublished?: string
  dateModified?: string
  articleBody?: string
  // images may be kept separately in the parent, but include here for completeness
  images?: string[]
  '@id'?: string
  keywords?: string
}

export default ArticleFields
