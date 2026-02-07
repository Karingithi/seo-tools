import DatePickerInput from '../DatePickerInput'
import type { JSX } from 'react'
import type { ArticleFields } from '../../types/article'
import { ARTICLE_TYPE_DESCRIPTIONS } from '../../utils/schema/builders'

export type ArticleFormProps = {
  fields: ArticleFields
  handleChange: (k: string, v: any) => void
  renderError: (k: string) => JSX.Element | null
  articleTypeOpen: boolean
  toggleArticleTypeOpen: () => void
  authorTypeOpen: boolean
  toggleAuthorTypeOpen: () => void
  images: string[]
  addImage: () => void
  removeImage: (idx: number) => void
  handleImageChange: (idx: number, v: string) => void
}

export default function ArticleForm(props: ArticleFormProps) {
  const { fields, handleChange, renderError, articleTypeOpen, toggleArticleTypeOpen, authorTypeOpen, toggleAuthorTypeOpen, images, addImage, removeImage, handleImageChange } = props
  const AUTHOR_TYPE_OPTIONS = [
    { label: 'Person', value: 'Person', desc: 'Individual' },
    { label: 'Organization', value: 'Organization', desc: 'Brand or Company' },
  ]

  return (
    <>
      {/* First row: Article @type + Article URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Article type</label>
          <div className="custom-select-wrapper article-select-wrapper relative" style={{ width: '100%' }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              aria-expanded={articleTypeOpen}
              onClick={toggleArticleTypeOpen}
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span className="truncate block">{fields.articleType ?? 'Article'}</span>
              <span className="text-xs">⏷</span>
            </button>
            {/* Render Article type options here (was previously inline in the page). */}
            {articleTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                <ul>
                  {['Article', 'NewsArticle', 'BlogPosting'].map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        handleChange('articleType', opt)
                        toggleArticleTypeOpen()
                      }}
                      className={fields.articleType === opt ? 'selected' : ''}
                    >
                      <div className="font-semibold text-[15px]">{opt}</div>
                      <div className="text-[13px] text-gray-500">{ARTICLE_TYPE_DESCRIPTIONS[opt] ?? ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">Article URL</label>
          <input type="text" className="tool-input" value={fields.url ?? ''} placeholder="https://example.com/article" onChange={(e) => handleChange('url', e.target.value)} />
          {renderError('url')}
        </div>
      </div>

      {/** @id is auto-generated from the Article URL when missing; UI field removed */}

      {/* Remaining Article fields (headline, description, images, author/publisher, body, dates) */}
      <div className="tool-field">
        <label className="tool-label">Headline</label>
        <input type="text" className="tool-input" value={fields.headline ?? ''} placeholder="Headline" onChange={(e) => handleChange('headline', e.target.value)} />
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm mt-0">{String(fields.headline ?? '').length}/110 characters</div>
        <div className="mt-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="form-checkbox" checked={fields.strictHeadlineLimit === 'true'} onChange={(e) => handleChange('strictHeadlineLimit', e.target.checked ? 'true' : 'false')} />
            <span>Strict 110-character SEO limit</span>
          </label>
        </div>
        {renderError('headline')}
      </div>

      <div className="tool-field">
        <label className="tool-label">Short description</label>
        <textarea className="tool-textarea" value={fields.description ?? ''} placeholder="Short summary" onChange={(e) => handleChange('description', e.target.value)} />
        {renderError('description')}
      </div>

      <div className="tool-field">
        <label className="tool-label">Keywords</label>
        <input type="text" className="tool-input" value={fields.keywords ?? ''} placeholder="keyword1, keyword2, keyword3" onChange={(e) => handleChange('keywords', e.target.value)} />
        <div className="text-sm text-gray-600 mt-1">Useful for topical reinforcement (not ranking manipulation). Separate keywords with commas.</div>
        {renderError('keywords')}
      </div>

      <div className="tool-field">
        <label className="tool-label">Images</label>
        <div className="flex flex-col gap-2">
          {images.map((img, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2">
                <input type="text" className="tool-input flex-1" value={img ?? ''} placeholder="https://example.com/image.jpg" onChange={(e) => handleImageChange(idx, e.target.value)} />
                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeImage(idx)} aria-label="Remove image" title="Remove">×</button>
              </div>
            </div>
          ))}

          <div>
            <button type="button" className="action-btn" onClick={addImage}>Add Image</button>
          </div>
        </div>
        {renderError('images')}
      </div>

      {/* Author row: Author @type + Name + URL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tool-field">
          <label className="tool-label">Author @type</label>
          <div className="custom-select-wrapper" style={{ width: '100%' }}>
            <button type="button" className="custom-select-trigger tool-select" aria-expanded={authorTypeOpen} onClick={toggleAuthorTypeOpen} style={{ width: '100%', justifyContent: 'space-between' }}>
              <span className="truncate block">{fields.authorType ?? 'Person'}</span>
              <span className="text-xs">⏷</span>
            </button>
            {authorTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                <ul>
                  {AUTHOR_TYPE_OPTIONS.map((opt) => (
                    <li key={opt.value} onClick={() => { handleChange('authorType', opt.value); toggleAuthorTypeOpen(); }} className={fields.authorType === opt.value ? 'selected' : ''}>
                      <div className="font-semibold text-[15px]">{opt.label}</div>
                      <div className="text-[13px] text-gray-500">{opt.desc}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">Author Name</label>
          <input type="text" className="tool-input" value={fields.authorName ?? ''} placeholder="e.g. Jane Doe" onChange={(e) => handleChange('authorName', e.target.value)} />
          {renderError('authorName')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Author URL</label>
          <input type="text" className="tool-input" value={fields.authorUrl ?? ''} placeholder="https://example.com/author" onChange={(e) => handleChange('authorUrl', e.target.value)} />
          {renderError('authorUrl')}
        </div>
      </div>

      {/* Publisher row: Publisher Name + Publisher Logo URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Publisher Name</label>
          <input type="text" className="tool-input" value={fields.publisherName ?? ''} placeholder="Publisher or Site Name" onChange={(e) => handleChange('publisherName', e.target.value)} />
          {renderError('publisherName')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Publisher Logo URL</label>
          <input type="text" className="tool-input" value={fields.publisherLogo ?? ''} placeholder="https://example.com/logo.png" onChange={(e) => handleChange('publisherLogo', e.target.value)} />
          {renderError('publisherLogo')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field relative">
          <label className="tool-label">Date Published</label>
          <DatePickerInput value={fields.datePublished ?? undefined} onChange={(iso) => handleChange('datePublished', iso)} placeholder="yyyy-mm-dd" />
          {renderError('datePublished')}
        </div>

        <div className="tool-field relative">
          <label className="tool-label">Date Modified</label>
          <DatePickerInput value={fields.dateModified ?? undefined} onChange={(iso) => handleChange('dateModified', iso)} placeholder="yyyy-mm-dd" />
          {renderError('dateModified')}
        </div>
      </div>

      <div className="tool-field">
        <label className="tool-label">Article body</label>
        <textarea className="tool-textarea" rows={8} value={fields.articleBody ?? ''} placeholder="Full article body" onChange={(e) => handleChange('articleBody', e.target.value)} />
        {renderError('articleBody')}
      </div>
    </>
  )
}
