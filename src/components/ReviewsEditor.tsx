import React from "react"
import DatePickerInput from "../components/DatePickerInput"

type Review = {
  name: string
  body: string
  rating: string
  date: string
  author: string
  publisher: string
}

type Props = {
  reviews: Review[]
  addReview: () => void
  removeReview: (index: number) => void
  handleReviewFieldChange: (index: number, key: keyof Review, value: string) => void
  handleReviewFieldBlur: (index: number, key: keyof Review) => void
  renderError: (key: string) => React.ReactNode
}

export default function ReviewsEditor({ reviews, addReview, removeReview, handleReviewFieldChange, handleReviewFieldBlur, renderError }: Props) {
  return (
    <div className="mt-2">
      <label className="tool-label block mb-2">Reviews</label>
      <div className="flex flex-col gap-2">
        {reviews && reviews.length > 0 ? (
          reviews.map((r, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="tool-field">
                  <label className="tool-label">Review name</label>
                  <input type="text" className="tool-input" value={r.name} placeholder={`Title for review #${idx + 1}`} onChange={(e) => handleReviewFieldChange(idx, 'name', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'name')} />
                  {renderError(`review_${idx}_name`)}
                </div>

                <div className="tool-field">
                  <label className="tool-label">Rating</label>
                  <input type="text" className="tool-input" value={r.rating} placeholder="4.5" onChange={(e) => handleReviewFieldChange(idx, 'rating', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'rating')} />
                  {renderError(`review_${idx}_rating`)}
                </div>

                <div className="tool-field">
                  <label className="tool-label">Date</label>
                  <DatePickerInput value={r.date} onChange={(iso) => handleReviewFieldChange(idx, 'date', iso)} placeholder="yyyy-mm-dd" />
                  {renderError(`review_${idx}_date`)}
                </div>
              </div>

              <div className="tool-field mt-3">
                <label className="tool-label">Review body</label>
                <textarea rows={8} className="tool-input" value={r.body} placeholder="Review text" onChange={(e) => handleReviewFieldChange(idx, 'body', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'body')} />
                {renderError(`review_${idx}_body`)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-3">
                <div className="tool-field">
                  <label className="tool-label">Author</label>
                  <input type="text" className="tool-input" value={r.author} placeholder="Author name" onChange={(e) => handleReviewFieldChange(idx, 'author', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'author')} />
                  {renderError(`review_${idx}_author`)}
                </div>

                <div className="tool-field">
                  <label className="tool-label">Publisher</label>
                  <input type="text" className="tool-input" value={r.publisher} placeholder="Publisher name" onChange={(e) => handleReviewFieldChange(idx, 'publisher', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'publisher')} />
                  {renderError(`review_${idx}_publisher`)}
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeReview(idx)} title="Remove">×</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">No reviews added.</div>
        )}

        <div>
          <button type="button" className="action-btn" onClick={addReview}>Add Review</button>
        </div>
      </div>
    </div>
  )
}
