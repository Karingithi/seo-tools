import React from "react"

type Props = {
  productIdSelected: string[]
  setProductIdSelected: (next: string[]) => void
  productIdOpen: boolean
  setProductIdOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  fields: Record<string, string>
  handleChange: (k: string, v: string) => void
  renderError: (k: string) => React.ReactNode
  schemaFields: Record<string, any>
  type: string
}

export default function IdentificationInputs({ productIdSelected, setProductIdSelected, productIdOpen, setProductIdOpen, fields, handleChange, renderError, schemaFields, type }: Props) {
  const firstRow = ["sku", "gtin8", "gtin13"]
  const secondRow = ["gtin14", "mpn"]
  const selectedFirst = firstRow.filter((k) => productIdSelected.includes(k))
  const selectedSecond = secondRow.filter((k) => productIdSelected.includes(k))

  return (
    <>
      <div className="tool-field">
        <label className="tool-label">Identification properties</label>
        <div className="custom-select-wrapper product-id-select-wrapper relative" style={{ width: "100%" }}>
          <button
            type="button"
            className="custom-select-trigger tool-select"
            aria-expanded={productIdOpen}
            onClick={() => setProductIdOpen((o: boolean) => !o)}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <span className="truncate block">
              {productIdSelected && productIdSelected.length ? productIdSelected.join(", ") : "Select identification types"}
            </span>
            <span className="text-xs">⏷</span>
          </button>

          {productIdOpen && (
            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
              <ul>
                { ["sku", "gtin8", "gtin13", "gtin14", "mpn"].map((opt) => {
                  const selected = productIdSelected.includes(opt)
                  return (
                    <li
                      key={opt}
                      className={selected ? "selected" : ""}
                      onClick={() => {
                        const prev = productIdSelected.slice()
                        const isSelected = prev.includes(opt)
                        const nextSel = isSelected ? prev.filter((p) => p !== opt) : [...prev, opt]
                        setProductIdSelected(nextSel)
                        if (isSelected) handleChange(opt, "")
                      }}
                    >
                      {selected ? "✓ " : ""}{opt}
                    </li>
                  )
                }) }
              </ul>
            </div>
          )}
        </div>
        {renderError("identificationProperties")}
      </div>

      {selectedFirst.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {selectedFirst.map((idKey) => {
            const field = schemaFields[type].find((f: any) => f.key === idKey)
            if (!field) return null
            return (
              <div key={field.key} className="tool-field">
                <label className="tool-label">{field.label}</label>
                <input
                  type="text"
                  className="tool-input"
                  value={fields[field.key] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
                {renderError(field.key)}
              </div>
            )
          })}
        </div>
      )}

      {selectedSecond.length > 0 && (
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {selectedSecond.map((idKey) => {
            const field = schemaFields[type].find((f: any) => f.key === idKey)
            if (!field) return null
            return (
              <div key={field.key} className="tool-field">
                <label className="tool-label">{field.label}</label>
                <input
                  type="text"
                  className="tool-input"
                  value={fields[field.key] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
                {renderError(field.key)}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
