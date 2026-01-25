import DatePickerInput from "../DatePickerInput"
import IdentificationInputs from "../IdentificationInputs"

type Props = {
  value?: any
  onChange?: (iso: any) => any
  placeholder?: string
  disabled?: boolean
  fields?: any
  handleChange?: any
  schemaFields?: any
  renderError?: any
  productIdSelected?: any
  setProductIdSelected?: any
  productIdOpen?: any
  setProductIdOpen?: any
  productOfferOpen?: any
  setProductOfferOpen?: any
  offerDisabled?: any
  productCurrencyOpen?: any
  setProductCurrencyOpen?: any
  productCurrencySearch?: any
  setProductCurrencySearch?: any
  ALL_CURRENCIES?: any
  isAggregateOffer?: any
  productAvailabilityOpen?: any
  setProductAvailabilityOpen?: any
  TICKET_AVAILABILITY_OPTIONS?: any
  productItemConditionOpen?: any
  setProductItemConditionOpen?: any
  ITEM_CONDITION_OPTIONS?: any
  handleReviewFieldChange?: any
  handleReviewFieldBlur?: any
  reviews?: any
  addReview?: any
  removeReview?: any
}

export default function ProductForm(props: Props): JSX.Element {
  const p: any = props
  const {
    fields,
    handleChange,
    schemaFields,
    renderError,
    productIdSelected,
    setProductIdSelected,
    productIdOpen,
    setProductIdOpen,
    productOfferOpen,
    setProductOfferOpen,
    offerDisabled,
    productCurrencyOpen,
    setProductCurrencyOpen,
    productCurrencySearch,
    setProductCurrencySearch,
    ALL_CURRENCIES,
    isAggregateOffer,
    productAvailabilityOpen,
    setProductAvailabilityOpen,
    TICKET_AVAILABILITY_OPTIONS,
    productItemConditionOpen,
    setProductItemConditionOpen,
    ITEM_CONDITION_OPTIONS,
    handleReviewFieldChange,
    handleReviewFieldBlur,
    reviews,
    addReview,
    removeReview,
  } = p

  return (
    <>
      <div className="tool-field">
        <label className="tool-label">Product Name</label>
        <input
          type="text"
          className="tool-input"
          value={fields.name || ""}
          placeholder={schemaFields.Product.find((f: any) => f.key === 'name')?.placeholder || ""}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {renderError("name")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Brand</label>
          <input
            type="text"
            className="tool-input"
            value={fields.brand || ""}
            placeholder={schemaFields.Product.find((f: any) => f.key === 'brand')?.placeholder || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
          />
          {renderError("brand")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Image</label>
          <input
            type="text"
            className="tool-input"
            value={fields.image || ""}
            placeholder={schemaFields.Product.find((f: any) => f.key === 'image')?.placeholder || ""}
            onChange={(e) => handleChange("image", e.target.value)}
          />
          {renderError("image")}
        </div>
      </div>

      <div className="tool-field">
        <label className="tool-label">Description</label>
        <textarea
          className="tool-textarea"
          value={fields.description || ""}
          placeholder={schemaFields.Product.find((f: any) => f.key === 'description')?.placeholder || ""}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        {renderError("description")}
      </div>

      <IdentificationInputs
        productIdSelected={productIdSelected}
        setProductIdSelected={setProductIdSelected}
        productIdOpen={productIdOpen}
        setProductIdOpen={setProductIdOpen}
        fields={fields}
        handleChange={handleChange}
        renderError={renderError}
        schemaFields={schemaFields}
        type={'Product'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Offer Type</label>
          <div className="custom-select-wrapper offer-type-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              aria-expanded={productOfferOpen}
              onClick={() => setProductOfferOpen((o: any) => !o)}
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
                  ].map((opt: any) => (
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
            placeholder={schemaFields.Product.find((f: any) => f.key === 'url')?.placeholder || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            disabled={offerDisabled}
            title={offerDisabled ? "Enable by selecting Offer Type" : undefined}
          />
          {renderError("url")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Currency</label>
          <div className={"custom-select-wrapper product-currency-select-wrapper relative" + (offerDisabled ? " opacity-50 pointer-events-none" : "")} style={{ width: "100%" }}>
            <button
              type="button"
              className={"custom-select-trigger tool-select" + (offerDisabled ? " opacity-50 pointer-events-none" : "")}
              aria-expanded={productCurrencyOpen}
              onClick={() => { if (!offerDisabled) setProductCurrencyOpen((o: any) => !o) }}
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
                  {ALL_CURRENCIES.filter((c: any) => (`${c.code} ${c.name}`).toLowerCase().includes((productCurrencySearch || "").toLowerCase())).map((c: any) => (
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
            placeholder={isAggregateOffer ? (schemaFields.Product.find((f: any) => f.key === 'lowPrice')?.placeholder || "0.00") : (schemaFields.Product.find((f: any) => f.key === 'price')?.placeholder || "0.00")}
            onChange={(e) => handleChange(isAggregateOffer ? "lowPrice" : "price", e.target.value)}
            disabled={offerDisabled}
            title={offerDisabled ? "Enable by selecting Offer Type" : undefined}
          />
          {renderError(isAggregateOffer ? "lowPrice" : "price")}
        </div>
      </div>

      {isAggregateOffer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="tool-field">
            <label className="tool-label">High price</label>
            <input
              type="text"
              className="tool-input"
              value={fields.highPrice || ""}
              placeholder={schemaFields.Product.find((f: any) => f.key === 'highPrice')?.placeholder || "0.00"}
              onChange={(e) => handleChange("highPrice", e.target.value)}
            />
            {renderError("highPrice")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Number of offers</label>
            <input type="text" className="tool-input" value={fields.offerCount || ""} placeholder={schemaFields.Product.find((f: any) => f.key === 'offerCount')?.placeholder || "0"} onChange={(e) => handleChange("offerCount", e.target.value)} />
            {renderError("offerCount")}
          </div>
        </div>
      )}

      {!offerDisabled && !isAggregateOffer && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="tool-field">
            <label className="tool-label">Offer Valid Until</label>
            <DatePickerInput
              value={fields.priceValidUntil}
              onChange={(iso: any) => handleChange("priceValidUntil", iso)}
              placeholder={(schemaFields.Product.find((f: any) => f.key === 'priceValidUntil') || { placeholder: 'yyyy-mm-dd' }).placeholder}
              disabled={offerDisabled}
            />
            {renderError("priceValidUntil")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Availability</label>
            <div className={"custom-select-wrapper product-availability-select-wrapper relative" + (offerDisabled ? " opacity-50 pointer-events-none" : "")} style={{ width: "100%" }}>
              <button type="button" className={"custom-select-trigger tool-select" + (offerDisabled ? " opacity-50 pointer-events-none" : "")} onClick={() => { if (!offerDisabled) setProductAvailabilityOpen((o: any) => !o) }} aria-expanded={productAvailabilityOpen} disabled={offerDisabled} aria-disabled={offerDisabled} title={offerDisabled ? "Enable by selecting Offer Type" : undefined} style={{ width: "100%", justifyContent: "space-between" }}>
                <span className="truncate block">{(TICKET_AVAILABILITY_OPTIONS.find((a: any) => a.value === (fields.availability || "")) || { label: "Not specified" }).label}</span>
                <span className="text-xs">⏷</span>
              </button>

              {productAvailabilityOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                  <ul>
                    {TICKET_AVAILABILITY_OPTIONS.map((opt: any) => (
                      <li key={opt.value} className={(fields.availability || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("availability", opt.value); setProductAvailabilityOpen(false) }}>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {renderError('availability')}
          </div>

          <div className="tool-field">
            <label className="tool-label">Item Condition</label>
            <div className={"custom-select-wrapper product-itemcondition-select-wrapper relative" + (offerDisabled ? " opacity-50" : "")} style={{ width: "100%" }}>
              <button type="button" className={"custom-select-trigger tool-select" + (offerDisabled ? " opacity-50" : "")} onClick={() => { if (!offerDisabled) setProductItemConditionOpen((o: any) => !o) }} aria-expanded={productItemConditionOpen} disabled={offerDisabled} aria-disabled={offerDisabled} title={offerDisabled ? "Enable by selecting Offer Type" : undefined} style={{ width: "100%", justifyContent: "space-between" }}>
                <span className="truncate block">{(ITEM_CONDITION_OPTIONS.find((a: any) => a.value === (fields.itemCondition || "")) || { label: "Not specified" }).label}</span>
                <span className="text-xs">⏷</span>
              </button>

              {productItemConditionOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                  <ul>
                    {ITEM_CONDITION_OPTIONS.map((opt: any) => (
                      <li key={opt.value} className={(fields.itemCondition || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("itemCondition", opt.value); setProductItemConditionOpen(false) }}>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {renderError('itemCondition')}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Aggregate Rating Value</label>
          <input type="text" className="tool-input" value={fields.ratingValue || ""} placeholder={schemaFields.Product.find((f: any) => f.key === 'ratingValue')?.placeholder || ""} onChange={(e) => handleChange('ratingValue', e.target.value)} />
          {renderError('ratingValue')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Number of ratings</label>
          <input type="text" className="tool-input" value={fields.ratingCount || ""} placeholder={schemaFields.Product.find((f: any) => f.key === 'ratingCount')?.placeholder || ""} onChange={(e) => handleChange('ratingCount', e.target.value)} />
          {renderError('ratingCount')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Highest rating</label>
          <input type="text" className="tool-input" value={fields.bestRating || ""} placeholder={schemaFields.Product.find((f: any) => f.key === 'bestRating')?.placeholder || ""} onChange={(e) => handleChange('bestRating', e.target.value)} />
          {renderError('bestRating')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Lowest rating</label>
          <input type="text" className="tool-input" value={fields.worstRating || ""} placeholder={schemaFields.Product.find((f: any) => f.key === 'worstRating')?.placeholder || ""} onChange={(e) => handleChange('worstRating', e.target.value)} />
          {renderError('worstRating')}
        </div>
      </div>

      <div className="mt-2">
        <label className="tool-label block mb-2">Reviews</label>
        <div className="flex flex-col gap-2">
          {reviews && reviews.length > 0 ? (
            reviews.map((r: any, idx: number) => (
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
                    <DatePickerInput value={r.date} onChange={(iso: any) => handleReviewFieldChange(idx, 'date', iso)} placeholder="yyyy-mm-dd" />
                    {renderError(`review_${idx}_date`)}
                  </div>
                </div>

                <div className="tool-field mt-3">
                  <label className="tool-label">Review body</label>
                  <textarea rows={1} className="tool-textarea" value={r.body} placeholder="Review text" onChange={(e) => handleReviewFieldChange(idx, 'body', e.target.value)} onBlur={() => handleReviewFieldBlur(idx, 'body')} />
                  {renderError(`review_${idx}_body`)}
                </div>

                <div className="flex items-center justify-end mt-3">
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeReview(idx)} title="Remove">×</button>
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
    </>
  )
}
