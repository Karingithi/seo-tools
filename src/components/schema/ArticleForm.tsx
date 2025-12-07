import DatePickerInput from '../DatePickerInput'
import type { JSX } from 'react'
import type { ArticleFields } from '../../types/article'

export type ArticleFormProps = {
  fields: ArticleFields
  handleChange: (k: string, v: any) => void
  renderError: (k: string) => JSX.Element | null
  articleTypeOpen: boolean
  toggleArticleTypeOpen: () => void
  images: string[]
  addImage: () => void
  removeImage: (idx: number) => void
  handleImageChange: (idx: number, v: string) => void
}

export default function ArticleForm(props: ArticleFormProps) {
  const { fields, handleChange, renderError, articleTypeOpen, toggleArticleTypeOpen, images, addImage, removeImage, handleImageChange } = props

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
            {/* Options are rendered in parent; keep minimal here to avoid duplication. */}
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">Article URL</label>
          <input type="text" className="tool-input" value={fields.url ?? ''} placeholder="https://example.com/article" onChange={(e) => handleChange('url', e.target.value)} />
          {renderError('url')}
        </div>
      </div>

      {/* Remaining Article fields (headline, description, body, dates, images) */}
      <div className="tool-field">
        <label className="tool-label">Headline</label>
        <input type="text" className="tool-input" value={fields.headline ?? ''} placeholder="Headline" onChange={(e) => handleChange('headline', e.target.value)} />
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm mt-0">{String(fields.headline ?? '').length}/110 characters</div>
        {renderError('headline')}
      </div>

      <div className="tool-field">
        <label className="tool-label">Short description</label>
        <textarea className="tool-textarea" value={fields.description ?? ''} placeholder="Short summary" onChange={(e) => handleChange('description', e.target.value)} />
        {renderError('description')}
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
    </>
  )
}
