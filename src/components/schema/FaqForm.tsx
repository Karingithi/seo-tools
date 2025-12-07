import type { JSX } from 'react'

export type FaqItem = { question: string; answer: string }

export type FaqFormProps = {
  faqItems: FaqItem[]
  updateFaqItem: (index: number, key: 'question' | 'answer', value: string) => void
  addFaqItem: () => void
  removeFaqItem: (index: number) => void
  renderError: (k?: string) => JSX.Element | null
}

export default function FaqForm(props: FaqFormProps) {
  const { faqItems, updateFaqItem, addFaqItem, removeFaqItem, renderError } = props

  return (
    <div>
      <div className="space-y-4">
        {faqItems.map((f, idx) => (
          <div key={idx} className="space-y-2">
            <div className="tool-field">
              <label className="tool-label">Question</label>
              <input
                type="text"
                className="tool-input"
                value={f.question}
                placeholder={`Question ${idx + 1}`}
                onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
              />
              {renderError(`faq_question_${idx}`)}
            </div>

            <div className="tool-field">
              <label className="tool-label">Answer</label>
              <textarea
                className="tool-textarea"
                rows={3}
                value={f.answer}
                placeholder={`Answer ${idx + 1}`}
                onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
              />
              {renderError(`faq_answer_${idx}`)}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="toolbar-btn toolbar-btn--red square-btn"
                onClick={() => removeFaqItem(idx)}
                aria-label="Remove question"
                title="Remove"
              >
                ×
              </button>
            </div>

            <hr />
          </div>
        ))}

        <div>
          <button type="button" className="action-btn" onClick={addFaqItem}>
            Add Question
          </button>
        </div>
      </div>
    </div>
  )
}
