import type { Dispatch, SetStateAction } from 'react'
import { Plus } from "lucide-react"

type HowToStep = { instruction: string; image?: string; name?: string; url?: string }

export type HowToFields = {
  name?: string
  description?: string
  totalTime?: string
  estimatedCost?: string
  currency?: string
  image?: string
  [k: string]: any
}

export type HowToFormProps = {
  fields: Partial<HowToFields>
  handleChange: (key: string, value: any) => void
  renderError: (key: string) => JSX.Element | null
  howToCurrencyOpen: boolean
  setHowToCurrencyOpen: Dispatch<SetStateAction<boolean>>
  howToCurrencySearch: string
  setHowToCurrencySearch: Dispatch<SetStateAction<string>>
  ALL_CURRENCIES: Array<{ code: string; name: string }>
  howToSupplies: string[]
  addHowToSupply: () => void
  addHowToTool: () => void
  howToTools: string[]
  updateHowToSupply: (idx: number, value: string) => void
  removeHowToSupply: (idx: number) => void
  updateHowToTool: (idx: number, value: string) => void
  removeHowToTool: (idx: number) => void
  howToSteps: HowToStep[]
  updateHowToStep: (idx: number, key: keyof HowToStep, value: string) => void
  removeHowToStep: (idx: number) => void
  addHowToStep: () => void
}

export default function HowToForm(props: HowToFormProps): JSX.Element {
  const p = props
  const {
    fields,
    handleChange,
    renderError,
    howToCurrencyOpen,
    setHowToCurrencyOpen,
    howToCurrencySearch,
    setHowToCurrencySearch,
    ALL_CURRENCIES,
    howToSupplies,
    addHowToSupply,
    addHowToTool,
    howToTools,
    updateHowToSupply,
    removeHowToSupply,
    updateHowToTool,
    removeHowToTool,
    howToSteps,
    updateHowToStep,
    removeHowToStep,
    addHowToStep,
  } = p

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="tool-field">
          <label className="tool-label">Name</label>
          <input
            type="text"
            className="tool-input"
            value={fields.name || ""}
            placeholder="How-to title"
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {renderError("name")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Description</label>
          <textarea
            className="tool-textarea"
            rows={2}
            value={fields.description || ""}
            placeholder="Short summary"
          />
          {renderError("description")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="tool-field">
            <label className="tool-label">Total time (minutes)</label>
            <input type="number" min={0} className="tool-input" value={fields.totalTime || ""} placeholder="Minutes (e.g. 40)" onChange={(e) => handleChange("totalTime", String(e.target.value))} />
          </div>

          <div className="tool-field">
            <label className="tool-label">Estimated cost</label>
            <input type="text" className="tool-input" value={fields.estimatedCost || ""} placeholder="Estimated cost" onChange={(e) => handleChange("estimatedCost", e.target.value)} />
          </div>

          <div className="tool-field">
            <label className="tool-label">Currency</label>
            <div className="custom-select-wrapper compact-select howto-currency-wrapper relative" style={{ minWidth: 140, marginBottom: 0 }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setHowToCurrencyOpen((o: any) => !o)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={howToCurrencyOpen}
              >
                <span className="truncate block">{(fields.currency && fields.currency.trim()) ? `${fields.currency} - ${(ALL_CURRENCIES.find((c: any) => c.code === fields.currency) || { name: "" }).name}` : "Currency"}</span>
                <span className="text-xs">⏷</span>
              </button>

              {howToCurrencyOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                  <div className="p-2">
                    <input
                      type="text"
                      className="tool-input"
                      placeholder="Search currency..."
                      value={howToCurrencySearch}
                      onChange={(e) => setHowToCurrencySearch(e.target.value)}
                    />
                  </div>
                  <ul>
                    {ALL_CURRENCIES.filter((c: any) => (`${c.code} ${c.name}`).toLowerCase().includes((howToCurrencySearch || "").toLowerCase())).map((c: any) => (
                      <li key={c.code} className={(fields.currency || "") === c.code ? "selected" : ""} onClick={() => { handleChange("currency", c.code); setHowToCurrencyOpen(false); setHowToCurrencySearch("") }}>
                        {c.code} - {c.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">Image</label>
          <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/image.jpg" onChange={(e) => handleChange("image", e.target.value)} />
          {renderError("image")}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Add supplies and tools used in this HowTo.</div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="md:col-span-1">
              <button type="button" className="action-btn w-full" onClick={addHowToSupply}><Plus className="inline w-4 h-4 mr-2" /> Add Supply</button>
            </div>

            <div className="md:col-span-1">
              <button type="button" className="action-btn w-full" onClick={addHowToTool}><Plus className="inline w-4 h-4 mr-2" /> Add Tool</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">Supplies</div>
            {howToSupplies.length ? (
              howToSupplies.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input type="text" className="tool-input flex-1" value={s} placeholder={`Supply #${idx + 1}`} onChange={(e) => updateHowToSupply(idx, e.target.value)} />
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToSupply(idx)} aria-label="Remove supply" title="Remove">×</button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No supplies added yet.</div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Tools</div>
            {howToTools.length ? (
              howToTools.map((t: any, idx: number) => (
                <div key={`tool-${idx}`} className="flex items-center gap-2 mb-2">
                  <input type="text" className="tool-input flex-1" value={t} placeholder={`Tool #${idx + 1}`} onChange={(e) => updateHowToTool(idx, e.target.value)} />
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToTool(idx)} aria-label="Remove tool" title="Remove">×</button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No tools added yet.</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-3">Steps: add instructions and optional step image, name and URL.</div>
        <div className="flex flex-col gap-4">
          {howToSteps.map((step: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="tool-field">
                <label className="tool-label">Step #{idx + 1}</label>
                <input type="text" className="tool-input" value={step.name || ""} placeholder="Optional step title" onChange={(e) => updateHowToStep(idx, "name", e.target.value)} />
              </div>

              <div className="tool-field">
                <label className="tool-label">Instructions</label>
                <textarea className="tool-textarea" rows={3} value={step.instruction || ""} placeholder={`Step ${idx + 1} instruction`} onChange={(e) => updateHowToStep(idx, "instruction", e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="tool-field">
                  <label className="tool-label">Image</label>
                  <input type="text" className="tool-input" value={step.image || ""} placeholder="https://example.com/step-image.jpg" onChange={(e) => updateHowToStep(idx, "image", e.target.value)} />
                  {renderError(`howto_step_image_${idx}`)}
                </div>

                <div className="tool-field">
                  <label className="tool-label">URL</label>
                  <input type="text" className="tool-input" value={step.url || ""} placeholder="https://example.com/more-info" onChange={(e) => updateHowToStep(idx, "url", e.target.value)} />
                  {renderError(`howto_step_url_${idx}`)}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeHowToStep(idx)} title="Remove">×</button>
              </div>
              <hr />
            </div>
          ))}

          <div>
            <button type="button" className="action-btn" onClick={addHowToStep}><Plus className="inline w-4 h-4 mr-2" /> Add Step</button>
          </div>
        </div>
      </div>
    </>
  )
}
