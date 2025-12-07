export type ArticleFields = {
  articleType?: string
  url?: string
  headline?: string
  description?: string
  datePublished?: string
  dateModified?: string
  articleBody?: string
  // images may be kept separately in the parent, but include here for completeness
  images?: string[]
}

export default ArticleFields
