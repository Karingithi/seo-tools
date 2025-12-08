import type { ArticleFields } from './article'
import type { JobPostingFields } from './jobposting'
import type { PersonFields } from '../components/schema/PersonForm'
import type { HowToFields } from '../components/schema/HowToForm'
import type { VideoFields } from '../components/schema/VideoForm'

export type SchemaTypeMap = {
  Article: ArticleFields
  Person: PersonFields
  'How-to': HowToFields
  Video: VideoFields
  'Job Posting': JobPostingFields
}

export type FieldsFor<T extends string> = T extends keyof SchemaTypeMap ? SchemaTypeMap[T] : Record<string, string>

// `AnyFields` keeps an index signature so existing code can use dynamic keys
// while also exposing known optional properties for typed schemas.
// Allow field values to be string or string[] for repeater-style fields
export type AnyFields = Record<string, string | string[]> & Partial<SchemaTypeMap[keyof SchemaTypeMap]>

export default AnyFields
