// @ts-nocheck
import { Plus } from "lucide-react"

interface LocalBusinessFormProps {
  [key: string]: any
}

export default function LocalBusinessForm(props: LocalBusinessFormProps): JSX.Element {
  const {
    fields,
    handleChange,
    renderError,
    schemaFields,
    type,
    SUBTYPE_MAP,
    LOCAL_BUSINESS_TYPES,
    localBusinessTypeOpen,
    setLocalBusinessTypeOpen,
    moreSpecificOpen,
    setMoreSpecificOpen,
    countryOpen,
    setCountryOpen,
    countrySearch,
    setCountrySearch,
    regionOpen,
    setRegionOpen,
    regionSearch,
    setRegionSearch,
    StateSelectComp,
    getSelectedCountryCode,
    regionCustomVisible,
    setRegionCustomVisible,
    STATES_BY_COUNTRY,
    COUNTRY_LIST,
    openingHoursState,
    addOpeningHour,
    updateOpeningHour,
    removeOpeningHour,
    DAYS_OF_WEEK,
    departments,
    addDepartment,
    updateDepartment,
    removeDepartment,
    deptLocalBusinessOpenIndex,
    setDeptLocalBusinessOpenIndex,
    deptMoreSpecificOpenIndex,
    setDeptMoreSpecificOpenIndex,
    deptCountryOpenIndex,
    setDeptCountryOpenIndex,
    deptCountrySearch,
    setDeptCountrySearch,
    deptRegionOpenIndex,
    setDeptRegionOpenIndex,
    deptRegionSearch,
    setDeptRegionSearch,
    deptRegionCustomVisibleIndex,
    setDeptRegionCustomVisibleIndex,
    deptOpeningDaysOpenIndex,
    setDeptOpeningDaysOpenIndex,
    openingDaysOpenIndex,
    setOpeningDaysOpenIndex,
    socialProfiles,
    handleSocialChange,
    handleSocialBlur,
    removeSocialProfile,
    addSocialProfile,
  } = props

  return (
<>
                    {/* Render remaining flat fields (exclude openingHours/open24_7/sameAs handled above).
                        Group Street + Zip/Postal into a single two-column row. */}
                    {(() => {
                      const flat = schemaFields[type].filter((f) => !["openingHours", "open24_7", "sameAs"].includes(f.key))
                      const elems: JSX.Element[] = []
                      for (let i = 0; i < flat.length; i++) {
                        const field = flat[i]

                        // Group Image + @id into one row when adjacent
                        if (field.key === "image") {
                          const nextField = i + 1 < flat.length ? flat[i + 1] : null
                          const nextNext = i + 2 < flat.length ? flat[i + 2] : null
                          // If the sequence is image -> @id -> url, prefer to group @id + url together;
                          // render the image by itself here and allow the next iteration to group @id+url.
                          if (nextField && nextField.key === "@id" && nextNext && nextNext.key === "url") {
                            elems.push(
                              <div key={`image-alone-${i}`} className="tool-field">
                                <label className="tool-label">Business Image</label>
                                <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/photo.jpg" onChange={(e) => handleChange("image", e.target.value)} />
                                {renderError("image")}
                              </div>
                            )
                            continue
                          }

                          if (nextField && nextField.key === "@id") {
                            elems.push(
                              <div key="image-and-id-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Business Image</label>
                                  <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/photo.jpg" onChange={(e) => handleChange("image", e.target.value)} />
                                  {renderError("image")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">@id (URL) <sup><a className="help-icon" href="https://www.schemaapp.com/schema-markup/what-is-an-id-in-structured-data/" target="_blank" rel="noopener noreferrer" title="Learn more about @id">?</a></sup></label>
                                  <input type="text" className="tool-input" value={fields["@id"] || ""} placeholder="https://example.com#id" onChange={(e) => handleChange("@id", e.target.value)} />
                                  {renderError("@id")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // Group @id + Website URL into one row when adjacent
                        if (field.key === "@id") {
                          const nextField = i + 1 < flat.length ? flat[i + 1] : null
                          if (nextField && nextField.key === "url") {
                            elems.push(
                              <div key="id-url-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">@id (URL) <sup><a className="help-icon" href="https://www.schemaapp.com/schema-markup/what-is-an-id-in-structured-data/" target="_blank" rel="noopener noreferrer" title="Learn more about @id">?</a></sup></label>
                                  <input type="text" className="tool-input" value={fields["@id"] || ""} placeholder="https://example.com#id" onChange={(e) => handleChange("@id", e.target.value)} />
                                  {renderError("@id")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Website URL</label>
                                  <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
                                  {renderError("url")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // Group URL + Phone + Email (or Price range) when adjacent (3-column row)
                        if (field.key === "url") {
                          const n1 = i + 1 < flat.length ? flat[i + 1] : null
                          const n2 = i + 2 < flat.length ? flat[i + 2] : null
                          // Prefer Website + Phone + Email when email is present
                          if (n1 && n1.key === "telephone" && n2 && n2.key === "email") {
                            elems.push(
                              <div key="url-phone-email-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Website URL</label>
                                  <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
                                  {renderError("url")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Phone</label>
                                  <input type="text" className="tool-input" value={fields.telephone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("telephone", e.target.value)} />
                                  {renderError("telephone")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Email</label>
                                  <input type="text" className="tool-input" value={fields.email || ""} placeholder="info@example.com" onChange={(e) => handleChange("email", e.target.value)} />
                                  {renderError("email")}
                                </div>
                              </div>
                            )
                            i += 2
                            continue
                          }

                          // Fallback: the original Website + Phone + PriceRange grouping when no email nearby
                          if (n1 && n1.key === "telephone" && n2 && n2.key === "priceRange") {
                            elems.push(
                              <div key="url-phone-price-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Website URL</label>
                                  <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
                                  {renderError("url")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Phone</label>
                                  <input type="text" className="tool-input" value={fields.telephone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("telephone", e.target.value)} />
                                  {renderError("telephone")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Price Range</label>
                                  <input type="text" className="tool-input" value={fields.priceRange || ""} placeholder="$ - $$$" onChange={(e) => handleChange("priceRange", e.target.value)} />
                                  {renderError("priceRange")}
                                </div>
                              </div>
                            )
                            i += 2
                            continue
                          }
                        }

                        // Group Phone + Email + Price range into one row when adjacent
                        if (field.key === "telephone") {
                          const n1 = i + 1 < flat.length ? flat[i + 1] : null
                          const n2 = i + 2 < flat.length ? flat[i + 2] : null
                          if (n1 && n1.key === "email" && n2 && n2.key === "priceRange") {
                            elems.push(
                              <div key="phone-email-price-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Phone</label>
                                  <input type="text" className="tool-input" value={fields.telephone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("telephone", e.target.value)} />
                                  {renderError("telephone")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Email</label>
                                  <input type="text" className="tool-input" value={fields.email || ""} placeholder="info@example.com" onChange={(e) => handleChange("email", e.target.value)} />
                                  {renderError("email")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Price Range</label>
                                  <input type="text" className="tool-input" value={fields.priceRange || ""} placeholder="$ - $$$" onChange={(e) => handleChange("priceRange", e.target.value)} />
                                  {renderError("priceRange")}
                                </div>
                              </div>
                            )
                            i += 2
                            continue
                          }
                        }

                        // Group Logo + Business Image into one row when adjacent
                        if (field.key === "logo") {
                          const nextField = i + 1 < flat.length ? flat[i + 1] : null
                          if (nextField && nextField.key === "image") {
                            elems.push(
                              <div key="logo-image-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Logo URL</label>
                                  <input type="text" className="tool-input" value={fields.logo || ""} placeholder="https://example.com/logo.png" onChange={(e) => handleChange("logo", e.target.value)} />
                                  {renderError("logo")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Business Image</label>
                                  <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/photo.jpg" onChange={(e) => handleChange("image", e.target.value)} />
                                  {renderError("image")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // Ratings + Reviews heading and two-column row when adjacent
                        if (field.key === "ratingValue") {
                          const nextField = i + 1 < flat.length ? flat[i + 1] : null
                          if (nextField && nextField.key === "reviewCount") {
                            elems.push(
                              <div key="ratings-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Average Rating (1-5)</label>
                                  <input type="text" className="tool-input" value={fields.ratingValue || ""} placeholder="4.5" onChange={(e) => handleChange("ratingValue", e.target.value)} />
                                  {renderError("ratingValue")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Number of Reviews</label>
                                  <input type="text" className="tool-input" value={fields.reviewCount || ""} placeholder="12" onChange={(e) => handleChange("reviewCount", e.target.value)} />
                                  {renderError("reviewCount")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // Render LocalBusiness @type and, if adjacent, More specific @type in one responsive row
                        if (field.key === "localBusinessType") {
                          const nextField = flat[i + 1]
                          // If the next field is `moreSpecificType`, render both in one row
                          if (nextField && nextField.key === "moreSpecificType") {
                            const parentValue = fields.localBusinessType || ""
                            const subtypeOpts = parentValue && SUBTYPE_MAP[parentValue] ? SUBTYPE_MAP[parentValue] : []
                            elems.push(
                              <div key="localbusiness-and-specific" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">LocalBusiness @type</label>
                                  <div className="custom-select-wrapper compact-select localbusiness-select-wrapper relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setLocalBusinessTypeOpen((o) => !o)}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={localBusinessTypeOpen}
                                    >
                                      <span className="truncate block">{(fields.localBusinessType && fields.localBusinessType.trim()) ? fields.localBusinessType : "LocalBusiness"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {localBusinessTypeOpen && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                        <ul>
                                          {LOCAL_BUSINESS_TYPES.map((opt) => (
                                            <li key={opt.value} className={(fields.localBusinessType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("localBusinessType", opt.value); setLocalBusinessTypeOpen(false) }}>
                                              <div className="font-semibold text-[15px]">{opt.value}</div>
                                              <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {renderError("localBusinessType")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">More specific @type</label>
                                  {subtypeOpts && subtypeOpts.length > 0 ? (
                                    <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper relative" style={{ width: "100%" }}>
                                      <button
                                        type="button"
                                        className="custom-select-trigger tool-select"
                                        onClick={() => setMoreSpecificOpen((o) => !o)}
                                        style={{ width: "100%", justifyContent: "space-between" }}
                                        aria-expanded={moreSpecificOpen}
                                      >
                                        <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select"}</span>
                                        <span className="text-xs">⏷</span>
                                      </button>

                                      {moreSpecificOpen && (
                                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                          <ul>
                                            {subtypeOpts.map((o) => (
                                              <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setMoreSpecificOpen(false) }}>
                                                <div className="font-semibold text-[15px]">{o.value}</div>
                                                <div className="text-[13px] text-gray-500">{o.desc}</div>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <input type="text" className="tool-input opacity-50" disabled value={fields.moreSpecificType || ""} placeholder={nextField.placeholder} onChange={(e) => handleChange("moreSpecificType", e.target.value)} />
                                  )}
                                  {renderError("moreSpecificType")}
                                </div>
                              </div>
                            )
                              // skip the next field as we've rendered it in this combined row
                              i++
                              continue
                            }

                          // No adjacent moreSpecificType — render LocalBusiness alone
                          elems.push(
                            <div key="localBusinessType" className="tool-field">
                              <label className="tool-label">LocalBusiness @type</label>
                              <div className="custom-select-wrapper compact-select localbusiness-select-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setLocalBusinessTypeOpen((o) => !o)}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={localBusinessTypeOpen}
                                >
                                  <span className="truncate block">{(fields.localBusinessType && fields.localBusinessType.trim()) ? fields.localBusinessType : "LocalBusiness"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {localBusinessTypeOpen && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                    <ul>
                                      {LOCAL_BUSINESS_TYPES.map((opt) => (
                                        <li key={opt.value} className={(fields.localBusinessType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("localBusinessType", opt.value); setLocalBusinessTypeOpen(false) }}>
                                          <div className="font-semibold text-[15px]">{opt.value}</div>
                                          <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {renderError("localBusinessType")}
                            </div>
                          )
                          continue
                        }
                        // Country + State/Province/Region should be in one row when adjacent
                        if (field.key === "country") {
                          const next1 = i + 1 < flat.length ? flat[i + 1] : null
                          // If the next field is region, render country + region in a single row
                          if (next1 && next1.key === "region") {
                            const currentCountryCode = getSelectedCountryCode(fields.country)
                            elems.push(
                              <div key="country-region-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">State/Province/Region</label>
                                  {/* If a StateSelect comp is available, use it; otherwise fall back to local list or text input */}
                                  {(() => {
                                    const code = currentCountryCode
                                    // 1) If a dynamic StateSelect component is available, use it (provides consistent UI)
                                    if (StateSelectComp && code && !regionCustomVisible) {
                                      const StateComp = StateSelectComp as any
                                      return (
                                        <StateComp
                                          className="tool-input"
                                          country={code}
                                          countryCode={code}
                                          value={fields.region || ""}
                                          onChange={(v: any) => {
                                            const val = typeof v === "string" ? v : (v && (v.target ? v.target.value : v))
                                            if (val === "__other__") {
                                              setRegionCustomVisible(true)
                                              handleChange("region", "")
                                            } else {
                                              handleChange("region", val || "")
                                            }
                                          }}
                                        />
                                      )
                                    }

                                    // 2) Otherwise if we have a local list for the country, render our custom select
                                    const localList = code && STATES_BY_COUNTRY[code]
                                    if (localList && localList.length) {
                                      return (
                                        <div className="custom-select-wrapper region-select-wrapper relative" style={{ width: "100%" }}>
                                          <button type="button" className="custom-select-trigger tool-select" onClick={() => setRegionOpen((o) => !o)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={regionOpen}>
                                            <span className="truncate block">{fields.region || "Select region"}</span>
                                            <span className="text-xs">⏷</span>
                                          </button>
                                          {regionOpen && (
                                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                              <div className="px-3 py-2">
                                                <input type="text" className="tool-input" placeholder="Search region" value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} />
                                              </div>
                                              <ul>
                                                {localList.filter(r => !regionSearch || r.toLowerCase().includes(regionSearch.toLowerCase())).map((r) => (
                                                  <li key={r} className={(fields.region || "") === r ? "selected" : ""} onClick={() => { handleChange("region", r); setRegionOpen(false); setRegionSearch("") }}>
                                                    <div className="font-semibold text-[15px]">{r}</div>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }

                                    // 3) Fallback: simple text input — gray out (disabled) when country is Kenya
                                    if (code === "KE") {
                                      return <input type="text" className="tool-input opacity-50" value={fields.region || ""} placeholder="State or region" disabled />
                                    }
                                    return <input type="text" className="tool-input" value={fields.region || ""} placeholder="State or region" onChange={(e) => handleChange("region", e.target.value)} />
                                  })()}
                                  {renderError("region")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Country</label>
                                  <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setCountryOpen((o) => !o)}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={countryOpen}
                                    >
                                      <span className="truncate block">{(fields.country && (COUNTRY_LIST.find(c => c.code === fields.country)?.name || fields.country)) || "Select country"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {countryOpen && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                        <div className="px-3 py-2">
                                          <input type="text" className="tool-input" placeholder="Search country" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                                        </div>
                                        <ul>
                                          {COUNTRY_LIST.filter(c => {
                                            if (!countrySearch) return true
                                            const q = countrySearch.toLowerCase()
                                            return c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q)
                                          }).map((opt) => (
                                            <li key={opt.code} className={(fields.country || "") === (opt.code || opt.name) ? "selected" : ""} onClick={() => { handleChange("country", opt.code || opt.name); setCountryOpen(false); setCountrySearch("") }}>
                                              <div className="font-semibold text-[15px]">{opt.name} {opt.code ? <span className="text-[13px] text-gray-500">({opt.code})</span> : null}</div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {renderError("country")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                          // Fallback: country alone as a dropdown
                          elems.push(
                            <div key="country-alone" className="tool-field">
                              <label className="tool-label">Country</label>
                              <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                                <button
                                  type="button"
                                  className="custom-select-trigger tool-select"
                                  onClick={() => setCountryOpen((o) => !o)}
                                  style={{ width: "100%", justifyContent: "space-between" }}
                                  aria-expanded={countryOpen}
                                >
                                  <span className="truncate block">{(fields.country && (COUNTRY_LIST.find(c => c.code === fields.country)?.name || fields.country)) || "Select country"}</span>
                                  <span className="text-xs">⏷</span>
                                </button>

                                {countryOpen && (
                                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                    <div className="px-3 py-2">
                                      <input type="text" className="tool-input" placeholder="Search country" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                                    </div>
                                    <ul>
                                      {COUNTRY_LIST.filter(c => {
                                        if (!countrySearch) return true
                                        const q = countrySearch.toLowerCase()
                                        return c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q)
                                      }).map((opt) => (
                                        <li key={opt.code} className={(fields.country || "") === (opt.code || opt.name) ? "selected" : ""} onClick={() => { handleChange("country", opt.code || opt.name); setCountryOpen(false); setCountrySearch("") }}>
                                          <div className="font-semibold text-[15px]">{opt.name} {opt.code ? <span className="text-[13px] text-gray-500">({opt.code})</span> : null}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {renderError("country")}
                            </div>
                          )
                          continue
                        }

                        // Latitude + Longitude should be in one row when adjacent
                        if (field.key === "latitude") {
                          const n1 = i + 1 < flat.length ? flat[i + 1] : null
                          if (n1 && n1.key === "longitude") {
                            // Insert Geographic Information heading above the latitude/longitude row
                                    elems.push(
                              <div key="lat-lon-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Latitude</label>
                                  <input type="text" className="tool-input" value={fields.latitude || ""} placeholder={"e.g. -1.2921"} onChange={(e) => handleChange("latitude", e.target.value)} />
                                  {renderError("latitude")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Longitude</label>
                                  <input type="text" className="tool-input" value={fields.longitude || ""} placeholder={"e.g. 36.8219"} onChange={(e) => handleChange("longitude", e.target.value)} />
                                  {renderError("longitude")}
                                </div>
                              </div>
                            )
                            i++
                            continue
                          }
                        }

                        // When encountering 'street', render a combined row with city + postalCode (3 columns) if available
                        if (field.key === "street") {
                          const next1 = i + 1 < flat.length ? flat[i + 1] : null
                          const next2 = i + 2 < flat.length ? flat[i + 2] : null
                          // If the next fields are city and postalCode, render three columns
                          if (next1 && next1.key === "city" && next2 && next2.key === "postalCode") {
                            // Insert Address Information heading above the street/city/postal row
                            elems.push(
                              <div key="street-city-postal-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Street</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.street || ""}
                                    placeholder="123 Main St"
                                    onChange={(e) => handleChange("street", e.target.value)}
                                  />
                                  {renderError("street")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">City</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.city || ""}
                                    placeholder="City"
                                    onChange={(e) => handleChange("city", e.target.value)}
                                  />
                                  {renderError("city")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Zip code</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.postalCode || ""}
                                    placeholder="Zip code"
                                    onChange={(e) => handleChange("postalCode", e.target.value)}
                                  />
                                  {renderError("postalCode")}
                                </div>
                              </div>
                            )
                            // Skip the next two fields because we've rendered them
                            if (i + 2 < flat.length && flat[i + 1].key === "city" && flat[i + 2].key === "postalCode") i += 2
                            continue
                          }

                          // Fallback: if only postalCode follows, keep previous two-column behaviour
                          if (i + 1 < flat.length && flat[i + 1].key === "postalCode") {
                            elems.push(
                              <div key="street-postal-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="tool-field">
                                  <label className="tool-label">Street</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.street || ""}
                                    placeholder="123 Main St"
                                    onChange={(e) => handleChange("street", e.target.value)}
                                  />
                                  {renderError("street")}
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Zip code</label>
                                  <input
                                    type="text"
                                    className="tool-input"
                                    value={fields.postalCode || ""}
                                    placeholder="Zip code"
                                    onChange={(e) => handleChange("postalCode", e.target.value)}
                                  />
                                  {renderError("postalCode")}
                                </div>
                              </div>
                            )
                            if (i + 1 < flat.length && flat[i + 1].key === "postalCode") i++
                            continue
                          }

                          // Otherwise render street only
                          elems.push(
                            <div key="street-alone" className="tool-field">
                              <label className="tool-label">Street</label>
                              <input type="text" className="tool-input" value={fields.street || ""} placeholder="123 Main St" onChange={(e) => handleChange("street", e.target.value)} />
                              {renderError("street")}
                            </div>
                          )
                          continue
                        }

                        // Skip postalCode if it appears before street or duplicated
                        if (field.key === "postalCode") {
                          // If postalCode wasn't handled with street, render it standalone
                          elems.push(
                            <div key={field.key} className="tool-field">
                              <label className="tool-label">{field.label}</label>
                              <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                              {renderError(field.key)}
                            </div>
                          )
                          continue
                        }

                        // More specific @type: show context-aware subtype dropdown when available
                        if (field.key === "moreSpecificType") {
                          const parent = fields.localBusinessType || ""
                          const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
                          if (opts && opts.length > 0) {
                            elems.push(
                              <div key="moreSpecificType" className="tool-field">
                                <label className="tool-label">More specific @type</label>
                                <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper relative" style={{ width: "100%" }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setMoreSpecificOpen((o) => !o)}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={moreSpecificOpen}
                                  >
                                    <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {moreSpecificOpen && (
                                    <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                      <ul>
                                        {opts.map((o) => (
                                          <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setMoreSpecificOpen(false) }}>
                                            <div className="font-semibold text-[15px]">{o.value}</div>
                                            <div className="text-[13px] text-gray-500">{o.desc}</div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                {renderError("moreSpecificType")}
                              </div>
                            )
                          } else {
                            // Fallback to plain input when no subtype map exists for the selected parent
                            elems.push(
                              <div key={field.key} className="tool-field">
                                <label className="tool-label">{field.label}</label>
                                <input type="text" className="tool-input opacity-50" disabled value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                                {renderError(field.key)}
                              </div>
                            )
                          }
                          continue
                        }

                        // Default rendering for other fields
                        if (field.key === "name") {
                          // Add a separator + section heading above the business name
                          elems.push(
                          )
                        }

                        if (field.key === "description") {
                          elems.push(
                            <div key={field.key} className="tool-field">
                              <label className="tool-label">{field.label}</label>
                              <textarea className="tool-textarea" rows={4} value={fields.description || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                              {renderError(field.key)}
                            </div>
                          )
                        } else {
                          elems.push(
                            <div key={field.key} className="tool-field">
                              <label className="tool-label">{field.label}</label>
                              <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                              {renderError(field.key)}
                            </div>
                          )
                        }
                      }
                      return elems
                    })()}

                    {/* Opening hours repeater */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <button
                            type="button"
                            className={`action-btn ${fields.open24_7 === "true" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={addOpeningHour}
                            disabled={fields.open24_7 === "true"}
                            title={fields.open24_7 === "true" ? "Disable 'Open 24/7' to add specific hours" : "Add Opening Hours"}
                          >
                            <Plus className="inline w-4 h-4 mr-2" /> Add Opening Hours
                          </button>
                          <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <input type="checkbox" checked={fields.open24_7 === "true"} onChange={(e) => handleChange("open24_7", e.target.checked ? "true" : "false")} />
                            <span className="select-none">Open 24/7</span>
                          </label>
                        </div>
                        {renderError("openingHours")}
                      </div>

                      {openingHoursState && openingHoursState.length > 0 ? (
                        openingHoursState.map((oh, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-2 mt-4">
                                  <div className="tool-field md:col-span-5">
                                    <label className="tool-label">Day(s) of the week</label>
                                    <div className="custom-select-wrapper opening-days-wrapper relative" style={{ width: "100%" }}>
                                      <button
                                        type="button"
                                        className="custom-select-trigger tool-select"
                                        onClick={() => setOpeningDaysOpenIndex((o) => (o === idx ? null : idx))}
                                        style={{ width: "100%", justifyContent: "space-between" }}
                                        aria-expanded={openingDaysOpenIndex === idx}
                                      >
                                        <span className="truncate block">{(oh.days && oh.days.trim()) ? (oh.days.split(",").map(s => s.trim()).filter(Boolean).join(", ")) : "Select days"}</span>
                                        <span className="text-xs">⏷</span>
                                      </button>

                                      {openingDaysOpenIndex === idx && (
                                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 220, overflow: "auto" }}>
                                          <ul>
                                            {DAYS_OF_WEEK.map((d) => {
                                              const selected = (oh.days || "").split(",").map(s => s.trim()).filter(Boolean).includes(d)
                                              return (
                                                <li key={d} className={selected ? "selected" : ""} onClick={(e) => {
                                                      e.stopPropagation()
                                                      const cur = (oh.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                                      const next = cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]
                                                      updateOpeningHour(idx, "days", next.join(","))
                                                    }}>
                                                      <label className="flex items-center gap-2 py-1 px-2 cursor-pointer">
                                                        {selected ? "✓ " : ""}
                                                        <span>{d}</span>
                                                      </label>
                                                    </li>
                                              )
                                            })}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    {renderError(`openingHours_time_${idx}_opens`)}
                                    {renderError(`openingHours_time_${idx}_closes`)}
                                  </div>
                            <div className="tool-field md:col-span-3">
                              <label className="tool-label">Opens at (e.g. 08:00)</label>
                              <input type="text" className="tool-input" value={oh.opens} placeholder="08:00" onChange={(e) => updateOpeningHour(idx, "opens", e.target.value)} />
                            </div>
                            <div className="tool-field md:col-span-3">
                              <label className="tool-label">Closes at (e.g. 21:00)</label>
                              <input type="text" className="tool-input" value={oh.closes} placeholder="21:00" onChange={(e) => updateOpeningHour(idx, "closes", e.target.value)} />
                            </div>
                            <div className="flex items-center md:col-span-1 justify-end">
                              <button type="button" className="toolbar-btn toolbar-btn--red square-btn toolbar-btn--mb-sm self-center" onClick={() => removeOpeningHour(idx)} title="Remove">
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No opening hours added yet.</div>
                      )}
                    </div>

                    {/* Departments repeater */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button type="button" className="action-btn" onClick={addDepartment}><Plus className="inline w-4 h-4 mr-2" /> Add Department</button>
                      </div>

                        {departments && departments.length > 0 ? (
                        departments.map((d, idx) => (
                          <div key={idx} className="mb-3 space-y-4" style={{ position: "relative", zIndex: departments.length - idx }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="tool-field">
                                <label className="tool-label">LocalBusiness @type</label>
                                <div className="custom-select-wrapper compact-select localbusiness-select-wrapper department-localbusiness-select relative" style={{ width: "100%", zIndex: 100 }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setDeptLocalBusinessOpenIndex((o) => (o === idx ? null : idx))}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={deptLocalBusinessOpenIndex === idx}
                                  >
                                    <span className="truncate block">{(d.localBusinessType && d.localBusinessType.trim()) ? d.localBusinessType : "LocalBusiness"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {deptLocalBusinessOpenIndex === idx && (
                                    <div className="custom-select-list absolute left-0 mt-1" style={{ width: "100%", maxHeight: 320, overflow: "auto", zIndex: 120 }}>
                                      <ul>
                                        {LOCAL_BUSINESS_TYPES.map((opt) => (
                                          <li
                                            key={`dept-${idx}-${opt.value}`}
                                            className={(d.localBusinessType || "") === opt.value ? "selected" : ""}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              try { console.debug('Dept select clicked', { idx, value: opt.value }) } catch {}
                                              updateDepartment(idx, "localBusinessType", opt.value)
                                              setDeptLocalBusinessOpenIndex(null)
                                            }}
                                          >
                                            <div className="font-semibold text-[15px]">{opt.value}</div>
                                            <div className="text-[13px] text-gray-500">{opt.desc}</div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="tool-field">
                                <label className="tool-label">More specific @type</label>
                                {d.localBusinessType && SUBTYPE_MAP[d.localBusinessType] && SUBTYPE_MAP[d.localBusinessType].length > 0 ? (
                                  <div className="custom-select-wrapper compact-select localbusiness-subtype-wrapper department-subtype-select relative" style={{ width: "100%", zIndex: 100 }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={() => setDeptMoreSpecificOpenIndex((o) => (o === idx ? null : idx))}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={deptMoreSpecificOpenIndex === idx}
                                    >
                                      <span className="truncate block">{(d.moreSpecificType && d.moreSpecificType.trim()) ? d.moreSpecificType : "Select"}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {deptMoreSpecificOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1" style={{ width: "100%", maxHeight: 260, overflow: "auto", zIndex: 9999 }}>
                                        <ul>
                                          {SUBTYPE_MAP[d.localBusinessType].map((o) => (
                                            <li key={`${idx}-${o.value}`} className={(d.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { updateDepartment(idx, "moreSpecificType", o.value); setDeptMoreSpecificOpenIndex(null) }}>
                                              <div className="font-semibold text-[15px]">{o.value}</div>
                                              <div className="text-[13px] text-gray-500">{o.desc}</div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <input type="text" className="tool-input opacity-50" disabled value={d.moreSpecificType || ""} placeholder="Select" onChange={(e) => updateDepartment(idx, "moreSpecificType", e.target.value)} />
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <div className="tool-field">
                                <label className="tool-label">Name</label>
                                <input type="text" className="tool-input" value={d.name} placeholder="Department name" onChange={(e) => updateDepartment(idx, "name", e.target.value)} />
                              </div>

                              <div className="tool-field">
                                <label className="tool-label">Image</label>
                                <input type="text" className="tool-input" value={d.image} placeholder="https://example.com/dept-photo.jpg" onChange={(e) => updateDepartment(idx, "image", e.target.value)} />
                                {renderError(`dept_image_${idx}`)}
                              </div>

                              <div className="tool-field">
                                <label className="tool-label">Phone</label>
                                <input type="text" className="tool-input" value={d.telephone} placeholder="+1-555-123-4567" onChange={(e) => updateDepartment(idx, "telephone", e.target.value)} />
                              </div>
                            </div>

                            <div className="mt-2">
                              <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" className="form-checkbox" checked={d.sameAsMain === "true"} onChange={(e) => updateDepartment(idx, "sameAsMain", e.target.checked ? "true" : "false")} />
                                <span>Same as main address</span>
                              </label>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-2">
                                <div className="tool-field">
                                  <label className="tool-label">Street</label>
                                  <input type="text" className="tool-input" value={d.street || ""} placeholder="123 Main St" onChange={(e) => updateDepartment(idx, "street", e.target.value)} disabled={d.sameAsMain === "true"} />
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">City</label>
                                  <input type="text" className="tool-input" value={d.city || ""} placeholder="Anytown" onChange={(e) => updateDepartment(idx, "city", e.target.value)} disabled={d.sameAsMain === "true"} />
                                </div>

                                <div className="tool-field">
                                  <label className="tool-label">Postal Code</label>
                                  <input type="text" className="tool-input" value={d.postalCode || ""} placeholder="90210" onChange={(e) => updateDepartment(idx, "postalCode", e.target.value)} disabled={d.sameAsMain === "true"} />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-2">
                                <div className="tool-field md:col-span-4">
                                  <label className="tool-label">State/Province/Region</label>
                                  {(() => {
                                    const deptSelectedCountryCode = getSelectedCountryCode(d.country)
                                    const customVisible = deptRegionCustomVisibleIndex === idx
                                    if (StateSelectComp && deptSelectedCountryCode && !customVisible) {
                                      return (
                                        <StateSelectComp
                                          className="tool-input"
                                          country={deptSelectedCountryCode}
                                          countryCode={deptSelectedCountryCode}
                                          value={d.region || ""}
                                          onChange={(v: any) => {
                                            const val = typeof v === "string" ? v : (v && (v.target ? v.target.value : v))
                                            if (val === "__other__") {
                                              setDeptRegionCustomVisibleIndex(idx)
                                              updateDepartment(idx, "region", "")
                                            } else {
                                              updateDepartment(idx, "region", val || "")
                                            }
                                          }}
                                          disabled={d.sameAsMain === "true"}
                                        />
                                      )
                                    }

                                    if (deptSelectedCountryCode && STATES_BY_COUNTRY[deptSelectedCountryCode] && !customVisible) {
                                      return (
                                        <div className="custom-select-wrapper compact-select region-select-wrapper relative" style={{ width: '100%' }}>
                                          <button
                                            type="button"
                                            className="custom-select-trigger tool-select"
                                            onClick={() => setDeptRegionOpenIndex((o) => (o === idx ? null : idx))}
                                            style={{ width: "100%", justifyContent: "space-between" }}
                                            aria-expanded={deptRegionOpenIndex === idx}
                                            disabled={d.sameAsMain === "true"}
                                          >
                                            <span className="truncate block">{d.region || "Select state / region"}</span>
                                            <span className="text-xs">⏷</span>
                                          </button>

                                          {deptRegionOpenIndex === idx && (
                                            <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                                              <div className="p-2">
                                                <input
                                                  type="text"
                                                  className="tool-input"
                                                  placeholder="Search region..."
                                                  value={deptRegionSearch}
                                                  onChange={(e) => setDeptRegionSearch(e.target.value)}
                                                />
                                              </div>
                                              <ul>
                                                {STATES_BY_COUNTRY[deptSelectedCountryCode].filter((s) => s.toLowerCase().includes((deptRegionSearch || "").toLowerCase())).map((s) => (
                                                  <li key={s} className={(d.region || "") === s ? "selected" : ""} onClick={() => { updateDepartment(idx, "region", s); setDeptRegionOpenIndex(null); setDeptRegionSearch("") }}>
                                                    {s}
                                                  </li>
                                                ))}
                                                <li key="__other__" onClick={() => { setDeptRegionCustomVisibleIndex(idx); updateDepartment(idx, "region", ""); setDeptRegionOpenIndex(null) }}>
                                                  Other...
                                                </li>
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }

                                    if (deptSelectedCountryCode && !customVisible) {
                                      // Country selected but no known states -> show disabled input for KE or empty disabled input
                                      return deptSelectedCountryCode === "KE" ? (
                                        <input
                                          type="text"
                                          className="tool-input opacity-50"
                                          value={d.region || ""}
                                          placeholder="State or region"
                                          disabled
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          className="tool-input opacity-50"
                                          value={""}
                                          placeholder=""
                                          disabled
                                        />
                                      )
                                    }

                                    // Fallback: custom free-text input (or when user chose Other)
                                    return (
                                      <input
                                        type="text"
                                        className="tool-input"
                                        value={d.region || ""}
                                        placeholder="State or region"
                                        onChange={(e) => updateDepartment(idx, "region", e.target.value)}
                                        disabled={d.sameAsMain === "true"}
                                      />
                                    )
                                  })()}
                                </div>

                                <div className="tool-field md:col-span-4">
                                  <label className="tool-label">Country</label>
                                  <div className={`custom-select-wrapper country-select-wrapper relative`} style={{ width: '100%' }}>
                                    <button
                                      type="button"
                                      className="custom-select-trigger tool-select"
                                      onClick={(e) => { e.stopPropagation(); setDeptCountryOpenIndex((o) => (o === idx ? null : idx)) }}
                                      style={{ width: "100%", justifyContent: "space-between" }}
                                      aria-expanded={deptCountryOpenIndex === idx}
                                    >
                                      <span className="truncate block">{(d.country && (COUNTRY_LIST.find(c => c.code === d.country)?.name || d.country)) || (d.country || "Select country")}</span>
                                      <span className="text-xs">⏷</span>
                                    </button>

                                    {deptCountryOpenIndex === idx && (
                                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                                        <div className="px-3 py-2">
                                          <input type="text" className="tool-input" placeholder="Search country..." value={deptCountrySearch} onChange={(e) => setDeptCountrySearch(e.target.value)} />
                                        </div>
                                        <ul>
                                          {COUNTRY_LIST.filter((c) => c.name.toLowerCase().includes((deptCountrySearch || "").toLowerCase())).map((c) => (
                                            <li key={c.code || c.name} className={(d.country || "") === (c.code || "") ? "selected" : ""} onClick={() => { updateDepartment(idx, "country", c.code || ""); setDeptCountryOpenIndex(null); setDeptCountrySearch("") }}>
                                              <div className="font-semibold text-[15px]">{c.name} {c.code ? <span className="text-[13px] text-gray-500">({c.code})</span> : null}</div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="tool-field md:col-span-4">
                                  <label className="tool-label">Price Range</label>
                                  <input type="text" className="tool-input" value={d.priceRange || ""} placeholder="$ - $$$" onChange={(e) => updateDepartment(idx, "priceRange", e.target.value)} />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                              <div className="tool-field md:col-span-5">
                                <label className="tool-label">Day(s) of the week</label>
                                <div className="custom-select-wrapper opening-days-wrapper relative" style={{ width: "100%" }}>
                                  <button
                                    type="button"
                                    className="custom-select-trigger tool-select"
                                    onClick={() => setDeptOpeningDaysOpenIndex((o) => (o === idx ? null : idx))}
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                    aria-expanded={deptOpeningDaysOpenIndex === idx}
                                  >
                                    <span className="truncate block">{(d.days && d.days.trim()) ? (d.days.split(",").map(s => s.trim()).filter(Boolean).join(", ")) : "Select days"}</span>
                                    <span className="text-xs">⏷</span>
                                  </button>

                                  {deptOpeningDaysOpenIndex === idx && (
                                    <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 220, overflow: "auto" }}>
                                      <ul>
                                            {DAYS_OF_WEEK.map((day) => {
                                          const selected = (d.days || "").split(",").map(s => s.trim()).filter(Boolean).includes(day)
                                          return (
                                            <li key={day} className={selected ? "selected" : ""} onClick={(e) => {
                                              e.stopPropagation()
                                              const cur = (d.days || "").split(",").map(s => s.trim()).filter(Boolean)
                                              const next = cur.includes(day) ? cur.filter(x => x !== day) : [...cur, day]
                                              updateDepartment(idx, "days", next.join(","))
                                            }}>
                                              <label className="flex items-center gap-2 py-1 px-2 cursor-pointer">
                                                {selected ? "✓ " : ""}
                                                <span>{day}</span>
                                              </label>
                                            </li>
                                          )
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="tool-field md:col-span-3">
                                <label className="tool-label">Opens at (e.g. 08:00)</label>
                                <input type="text" className="tool-input" value={d.opens} placeholder="08:00" onChange={(e) => updateDepartment(idx, "opens", e.target.value)} />
                                {renderError(`dept_opens_${idx}`)}
                              </div>

                              <div className="tool-field md:col-span-3">
                                <label className="tool-label">Closes at (e.g. 21:00)</label>
                                <input type="text" className="tool-input" value={d.closes} placeholder="21:00" onChange={(e) => updateDepartment(idx, "closes", e.target.value)} />
                                {renderError(`dept_closes_${idx}`)}
                              </div>

                              <div className="flex items-center md:col-span-1 justify-end">
                                <button type="button" className="toolbar-btn toolbar-btn--red square-btn toolbar-btn--mb-sm" onClick={() => removeDepartment(idx)} title="Remove">
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No departments added yet.</div>
                      )}
                    </div>

                    {/* Social profiles repeater (reuse existing pattern) */}
                    <div className="mt-0">
                      <label className="tool-label block mb-2">Social profiles</label>
                      <div className="flex flex-col gap-2">
                        {socialProfiles && socialProfiles.length > 0 ? (
                          socialProfiles.map((s, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <input type="text" className="tool-input flex-1" value={s} placeholder={`https://social.example/profile-${idx + 1}`} onChange={(e) => handleSocialChange(idx, e.target.value)} onBlur={() => handleSocialBlur(idx)} />
                                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeSocialProfile(idx)} aria-label="Remove profile" title="Remove">×</button>
                              </div>
                              {renderError(`sameAs_${idx}`)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm mb-1 text-gray-500">No social profiles added.</div>
                        )}

                        <div>
                          <button type="button" className="action-btn" onClick={addSocialProfile}>Add Profile</button>
                        </div>
                      </div>
                    </div>
                  </>
  )
}
