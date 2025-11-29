import React from "react"

type Currency = { code: string; name: string }

type Props = {
  fields: Record<string, string>
  handleChange: (k: string, v: string) => void
  renderError: (k: string) => React.ReactNode
  offerDisabled: boolean
  isAggregateOffer: boolean
  productOfferOpen: boolean
  setProductOfferOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  productCurrencyOpen: boolean
  setProductCurrencyOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  productCurrencySearch: string
  setProductCurrencySearch: (s: string) => void
  ALL_CURRENCIES: Currency[]
}

export default function OfferControls({ fields, handleChange, renderError, offerDisabled, isAggregateOffer, productOfferOpen, setProductOfferOpen, productCurrencyOpen, setProductCurrencyOpen, productCurrencySearch, setProductCurrencySearch, ALL_CURRENCIES }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Offer Type</label>
          <div className="custom-select-wrapper offer-type-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              aria-expanded={productOfferOpen}
              onClick={() => setProductOfferOpen((o: boolean) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <span className="truncate block">{(fields.offerType && fields.offerType.trim()) || "None"}</span>
              <span className="text-xs">⏷</span>
            </button>

            {productOfferOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {[
                    { value: "Offer", label: "Offer" },
                    { value: "AggregateOffer", label: "Aggregate Offer" },
                    { value: "", label: "None" },
                  ].map((opt) => (
                    <li
                      key={opt.label}
                      className={(fields.offerType || "") === (opt.value || "") ? "selected" : ""}
                      onClick={() => {
                        handleChange("offerType", opt.value)
                        setProductOfferOpen(false)
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError("offerType")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Offer URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.url || ""}
            placeholder="https://example.com/product"
            onChange={(e) => handleChange("url", e.target.value)}
            disabled={offerDisabled}
            title={offerDisabled ? "Enable by selecting Offer Type" : undefined}
          />
          {renderError("url")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Currency</label>
          <div className={"custom-select-wrapper product-currency-select-wrapper relative" + (offerDisabled ? " opacity-50 pointer-events-none" : "")} style={{ width: "100%" }}>
            <button
              type="button"
              className={"custom-select-trigger tool-select" + (offerDisabled ? " opacity-50 pointer-events-none" : "")}
              aria-expanded={productCurrencyOpen}
              onClick={() => { if (!offerDisabled) setProductCurrencyOpen((o: boolean) => !o) }}
              disabled={offerDisabled}
              aria-disabled={offerDisabled}
              title={offerDisabled ? "Enable by selecting Offer Type" : undefined}
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <span className="truncate block">{(fields.currency && fields.currency.trim()) || "Select currency"}</span>
              <span className="text-xs">⏷</span>
            </button>

            {productCurrencyOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: 'auto' }}>
                <div className="p-2">
                  <input
                    type="text"
                    className="tool-input"
                    placeholder="Search currency..."
                    value={productCurrencySearch}
                    onChange={(e) => setProductCurrencySearch(e.target.value)}
                  />
                </div>
                <ul>
                  {ALL_CURRENCIES.filter((c) => (`${c.code} ${c.name}`).toLowerCase().includes((productCurrencySearch || "").toLowerCase())).map((c) => (
                    <li
                      key={c.code}
                      className={(fields.currency || "") === c.code ? "selected" : ""}
                      onClick={() => {
                        handleChange("currency", c.code)
                        setProductCurrencyOpen(false)
                        setProductCurrencySearch("")
                      }}
                    >
                      {c.code} — {c.name}
                    </li>
                  ))}
                  <li key="none-product-currency" className={(fields.currency || "") === "" ? "selected" : ""} onClick={() => { handleChange("currency", ""); setProductCurrencyOpen(false); setProductCurrencySearch("") }}>
                    Not specified
                  </li>
                </ul>
              </div>
            )}
          </div>
          {renderError("currency")}
        </div>

        <div className="tool-field">
          <label className="tool-label">{isAggregateOffer ? "Low price" : "Price"}</label>
          <input
            type="text"
            className="tool-input"
            value={isAggregateOffer ? (fields.lowPrice || "") : (fields.price || "")}
            placeholder={isAggregateOffer ? "0.00" : "0.00"}
            onChange={(e) => handleChange(isAggregateOffer ? "lowPrice" : "price", e.target.value)}
            disabled={offerDisabled}
            title={offerDisabled ? "Enable by selecting Offer Type" : undefined}
          />
          {renderError(isAggregateOffer ? "lowPrice" : "price")}
        </div>
      </div>

      {isAggregateOffer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-end">
          <div className="tool-field">
            <label className="tool-label">High price</label>
            <input
              type="text"
              className="tool-input"
              value={fields.highPrice || ""}
              placeholder="0.00"
              onChange={(e) => handleChange("highPrice", e.target.value)}
            />
            {renderError("highPrice")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Number of offers</label>
            <input
              type="text"
              className="tool-input"
              value={fields.offerCount || ""}
              placeholder="0"
              onChange={(e) => handleChange("offerCount", e.target.value)}
            />
            {renderError("offerCount")}
          </div>
        </div>
      )}
    </>
  )
}
