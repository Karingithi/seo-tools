import { useState } from "react"

import DatePickerInput from "../DatePickerInput"

interface OrganizationFormProps {
  fields: Record<string, string>
  handleChange: (key: string, value: string) => void
  renderError: (key: string) => JSX.Element | null
  schemaFields: Record<string, any[]>
  orgTypeOpen: boolean
  setOrgTypeOpen: (open: boolean) => void
  orgMoreSpecificOpen: boolean
  setOrgMoreSpecificOpen: (open: boolean) => void
  ORG_TYPES: Array<{ value: string; desc: string }>
  ORG_SUBTYPE_MAP: Record<string, Array<{ value: string; desc: string }>>
  orgExtras: Array<{ key: string; value: string }>
  setOrgExtras: (extras: ((prev: Array<{ key: string; value: string }>) => Array<{ key: string; value: string }>) | Array<{ key: string; value: string }>) => void
  orgExtraKeyOpenIndex: number | null
  setOrgExtraKeyOpenIndex: (idx: number | null) => void
  ORG_ADDITIONAL_OPTIONS: Array<{ key: string; label: string }>
  socialProfiles: string[]
  handleSocialChange: (idx: number, value: string) => void
  handleSocialBlur: (idx: number) => void
  removeSocialProfile: (idx: number) => void
  addSocialProfile: () => void
  contacts: Array<any>
  addContact: () => void
  removeContact: (idx: number) => void
  updateContact: (idx: number, key: string, value: string) => void
  contactTypeOpenIndex: number | null
  setContactTypeOpenIndex: (idx: number | null) => void
  areaCountryOpenIndex: number | null
  setAreaCountryOpenIndex: (idx: number | null) => void
  areaCountrySearch: string
  setAreaCountrySearch: (search: string) => void
  COUNTRY_LIST: Array<{ code?: string; name: string }>
  languageOpenIndex: number | null
  setLanguageOpenIndex: (idx: number | null) => void
  languageSearch: string
  setLanguageSearch: (search: string) => void
  LANG_LIST: Array<{ code: string; name: string }>
  displayNames?: { of: (code: string) => string | undefined }
  optionsOpenIndex: number | null
  setOptionsOpenIndex: (idx: number | null) => void
  CONTACT_OPTIONS: Array<{ value: string; label: string }>
  openingHoursState: Array<{ days: string; opens: string; closes: string }>
  addOpeningHour: () => void
  updateOpeningHour: (index: number, key: "days" | "opens" | "closes", value: string) => void
  removeOpeningHour: (index: number) => void
}

export default function OrganizationForm(props: OrganizationFormProps): JSX.Element {
  const {
    fields,
    handleChange,
    renderError,
    orgTypeOpen,
    setOrgTypeOpen,
    orgMoreSpecificOpen,
    setOrgMoreSpecificOpen,
    ORG_TYPES,
    ORG_SUBTYPE_MAP,
    orgExtras,
    setOrgExtras,
    orgExtraKeyOpenIndex,
    setOrgExtraKeyOpenIndex,
    ORG_ADDITIONAL_OPTIONS,
    socialProfiles,
    handleSocialChange,
    handleSocialBlur,
    removeSocialProfile,
    addSocialProfile,
    contacts,
    addContact,
    removeContact,
    updateContact,
    contactTypeOpenIndex,
    setContactTypeOpenIndex,
    areaCountryOpenIndex,
    setAreaCountryOpenIndex,
    areaCountrySearch,
    setAreaCountrySearch,
    COUNTRY_LIST,
    languageOpenIndex,
    setLanguageOpenIndex,
    languageSearch,
    setLanguageSearch,
    LANG_LIST,
    displayNames,
    optionsOpenIndex,
    setOptionsOpenIndex,
    CONTACT_OPTIONS,
    openingHoursState,
    addOpeningHour,
    updateOpeningHour,
    removeOpeningHour,
  } = props

  const CONTACT_TYPES = [
    "Customer Service",
    "Technical Support",
    "Billing Support",
    "Bill Payment",
    "Sales",
    "Reservations",
    "Credit Card Support",
    "Emergency",
    "Baggage Tracking",
    "Roadside Assistance",
    "Package Tracking",
  ]

  const selectedType = ((fields.moreSpecificType || fields.organizationType || "").trim()).toLowerCase()
  const isLocalBusinessSelected = selectedType === "localbusiness"
  const [orgCountryOpen, setOrgCountryOpen] = useState<boolean>(false)
  const [orgCountrySearch, setOrgCountrySearch] = useState<string>("")

  return (
    <div className="tool-form">
      <div className="space-y-4">
      {/* 1. Schema Type Selection */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Organization @type</label>
            <div className="custom-select-wrapper compact-select organization-select-wrapper relative" style={{ width: "100%" }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setOrgTypeOpen(!orgTypeOpen)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={orgTypeOpen}
              >
                <span className="truncate block">{(fields.organizationType && fields.organizationType.trim()) ? fields.organizationType : "Organization"}</span>
                <span className="text-xs">&#9662;</span>
              </button>

              {orgTypeOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                  <ul>
                    {ORG_TYPES.map((opt) => (
                      <li key={opt.value} className={(fields.organizationType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("organizationType", opt.value); setOrgTypeOpen(false) }}>
                        <div className="font-semibold text-[15px]">{opt.value}</div>
                        <div className="text-[13px] text-gray-500">{opt.desc}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {renderError("organizationType")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Subtype (@type refinement)</label>
            {(() => {
              const parent = fields.organizationType || ""
              const subtypeOpts = parent && ORG_SUBTYPE_MAP[parent] ? ORG_SUBTYPE_MAP[parent] : []
              if (subtypeOpts && subtypeOpts.length) {
                return (
                  <div className="custom-select-wrapper compact-select organization-subtype-wrapper relative" style={{ width: "100%" }}>
                    <button
                      type="button"
                      className="custom-select-trigger tool-select"
                      onClick={() => setOrgMoreSpecificOpen(!orgMoreSpecificOpen)}
                      style={{ width: "100%", justifyContent: "space-between" }}
                      aria-expanded={orgMoreSpecificOpen}
                    >
                      <span className="truncate block">{(fields.moreSpecificType && fields.moreSpecificType.trim()) ? fields.moreSpecificType : "Select"}</span>
                      <span className="text-xs">&#9662;</span>
                    </button>

                    {orgMoreSpecificOpen && (
                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                        <ul>
                          {subtypeOpts.map((o) => (
                            <li key={o.value} className={(fields.moreSpecificType || "") === o.value ? "selected" : ""} onClick={() => { handleChange("moreSpecificType", o.value); setOrgMoreSpecificOpen(false) }}>
                              <div className="font-semibold text-[15px]">{o.value}</div>
                              <div className="text-[13px] text-gray-500">{o.desc}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }
              return <input type="text" className="tool-input opacity-50" disabled value={fields.moreSpecificType || ""} placeholder="No subtypes available" />
            })()}
            {renderError("moreSpecificType")}
          </div>
        </div>
      </div>

      {/* 2. Core Identity */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Organization Name</label>
            <input type="text" className="tool-input" value={fields.name || ""} placeholder="Organization name" onChange={(e) => handleChange("name", e.target.value)} />
            {renderError("name")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Alternate Name</label>
            <input type="text" className="tool-input" value={fields.alternateName || ""} placeholder="Alternative / short name" onChange={(e) => handleChange("alternateName", e.target.value)} />
            {renderError("alternateName")}
          </div>
        </div>
      </div>

      {/* Additional identifiers */}
      <div>
        <label className="tool-label block mb-2">Additional Info</label>
        <div className="space-y-3">
          {orgExtras.length > 0 ? (
            orgExtras.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="tool-field md:col-span-4" style={{ marginBottom: 0 }}>
                  <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                    <button
                      type="button"
                      className="custom-select-trigger tool-select"
                      onClick={() => setOrgExtraKeyOpenIndex(orgExtraKeyOpenIndex === idx ? null : idx)}
                      style={{ width: "100%", justifyContent: "space-between" }}
                      aria-expanded={orgExtraKeyOpenIndex === idx}
                    >
                      <span className="truncate block">
                        {(() => {
                          const lab = ORG_ADDITIONAL_OPTIONS.find((o) => o.key === item.key)?.label
                          return lab || "Select field"
                        })()}
                      </span>
                      <span className="text-xs">&#9662;</span>
                    </button>
                    {orgExtraKeyOpenIndex === idx && (
                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                        <ul>
                          {ORG_ADDITIONAL_OPTIONS.map((o) => (
                            <li
                              key={o.key}
                              className={item.key === o.key ? "selected" : ""}
                              onClick={() => {
                                setOrgExtras(((prev: any[]) => {
                                  const next = [...prev]
                                  next[idx] = { ...next[idx], key: o.key }
                                  return next
                                }) as any)
                                setOrgExtraKeyOpenIndex(null)
                              }}
                            >
                              {o.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tool-field md:col-span-7" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    className="tool-input"
                    value={item.value || ""}
                    placeholder="Enter value"
                    onChange={(e) =>
                      setOrgExtras(((prev: any[]) => {
                        const next = [...prev]
                        next[idx] = { ...next[idx], value: e.target.value }
                        return next
                      }) as any)
                    }
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-end" style={{ marginBottom: 0 }}>
                  <button
                    type="button"
                    className="toolbar-btn toolbar-btn--red square-btn"
                    style={{ marginTop: 0, marginBottom: "6px", alignSelf: "center" }}
                    onClick={() =>
                      setOrgExtras(((prev: any[]) => prev.filter((_: any, i: number) => i !== idx)) as any)
                    }
                    aria-label="Remove additional info"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No additional info added yet.</div>
          )}
        </div>
        <div className="mt-2">
          <button
            type="button"
            className="action-btn"
            onClick={() =>
              setOrgExtras(((prev: any[]) => [
                ...prev,
                { key: (ORG_ADDITIONAL_OPTIONS[0]?.key || "legalName"), value: "" },
              ]) as any)
            }
          >
            Add
          </button>
        </div>
      </div>

      {/* 3. URLs & Entity ID */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Website URL</label>
            <input type="text" className="tool-input" value={fields.url || ""} placeholder="https://example.com" onChange={(e) => handleChange("url", e.target.value)} />
            {renderError("url")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Logo URL</label>
            <input type="text" className="tool-input" value={fields.logo || ""} placeholder="https://example.com/logo.png" onChange={(e) => handleChange("logo", e.target.value)} />
            {renderError("logo")}
          </div>
        </div>
      </div>

      {/* 4. Branding */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field md:col-span-2">
            <label className="tool-label">Image URL</label>
            <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/brand-image.jpg" onChange={(e) => handleChange("image", e.target.value)} />
            {renderError("image")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field md:col-span-2">
          <label className="tool-label">Description</label>
          <textarea className="tool-textarea" rows={4} value={fields.description || ""} placeholder="Short description of the organization" onChange={(e) => handleChange("description", e.target.value)} />
          {renderError("description")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field md:col-span-2">
          <label className="tool-label block">Social Profiles</label>
          <div className="flex flex-col gap-2">
            {socialProfiles && socialProfiles.length > 0 ? (
              socialProfiles.map((s, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="tool-input flex-1"
                      value={s}
                      placeholder={`https://social.example/profile-${idx + 1}`}
                      onChange={(e) => handleSocialChange(idx, e.target.value)}
                      onBlur={() => handleSocialBlur(idx)}
                    />
                    <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeSocialProfile(idx)} aria-label="Remove profile" title="Remove">&times;</button>
                  </div>
                  {renderError(`sameAs_${idx}`)}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No social/profile URLs added.</div>
            )}

            <div>
              <button type="button" className="action-btn" onClick={addSocialProfile}>Add URL</button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Contact Info */}
      <div>
        <div className="tool-field">
          <label className="tool-label">Email</label>
          <input type="text" className="tool-input" value={fields.email || ""} placeholder="info@example.com" onChange={(e) => handleChange("email", e.target.value)} />
          {renderError("email")}
        </div>
      </div>

      <div>
        <label className="tool-label block">Contact</label>
        <div className="space-y-3">
          {contacts && contacts.length > 0 ? (
            contacts.map((c, idx) => (
              <div key={idx} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="tool-field" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Contact Type</label>
                    <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                      <button
                        type="button"
                        className="custom-select-trigger tool-select"
                        onClick={() => setContactTypeOpenIndex(contactTypeOpenIndex === idx ? null : idx)}
                        style={{ width: "100%", justifyContent: "space-between" }}
                        aria-expanded={contactTypeOpenIndex === idx}
                      >
                        <span className="truncate block">{c.contactType || "Customer Service"}</span>
                        <span className="text-xs">&#9662;</span>
                      </button>
                      {contactTypeOpenIndex === idx && (
                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 280, overflow: "auto" }}>
                          <ul>
                            {CONTACT_TYPES.map((opt) => (
                              <li
                                key={opt}
                                className={(c.contactType || "Customer Service") === opt ? "selected" : ""}
                                onClick={() => { updateContact(idx, "contactType", opt); setContactTypeOpenIndex(null) }}
                              >
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tool-field" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Phone</label>
                    <input type="text" className="tool-input" value={c.phone || ""} placeholder="Format: +1-401-555-1212" onChange={(e) => updateContact(idx, "phone", e.target.value)} />
                    {renderError(`contact_phone_${idx}`)}
                  </div>

                  <div className="tool-field" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Area Served</label>
                    <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                      <button
                        type="button"
                        className="custom-select-trigger tool-select"
                        onClick={() => setAreaCountryOpenIndex(areaCountryOpenIndex === idx ? null : idx)}
                        style={{ width: "100%", justifyContent: "space-between" }}
                        aria-expanded={areaCountryOpenIndex === idx}
                      >
                        <span className="truncate block">
                          {(() => {
                            const selected = (c.areaServed || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                            if (!selected.length) return "Select country(s)"
                            const labels = selected.map((val: string) => COUNTRY_LIST.find((x) => x.code === val)?.name || val)
                            return labels.join(", ")
                          })()}
                        </span>
                        <span className="text-xs">&#9662;</span>
                      </button>

                      {areaCountryOpenIndex === idx && (
                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                          <div className="px-3 py-2">
                            <input
                              type="text"
                              className="tool-input"
                              placeholder="Search country..."
                              value={areaCountrySearch}
                              onChange={(e) => setAreaCountrySearch(e.target.value)}
                            />
                          </div>
                          <ul>
                            <li
                              className={(c.areaServed || "") === "" ? "selected" : ""}
                              onClick={() => { updateContact(idx, "areaServed", ""); setAreaCountryOpenIndex(null); setAreaCountrySearch("") }}
                            >
                              Clear all
                            </li>
                            {COUNTRY_LIST
                              .filter((x) => x.name.toLowerCase().includes((areaCountrySearch || "").toLowerCase()))
                              .map((x) => (
                                <li
                                  key={x.code || x.name}
                                  className={(() => {
                                    const selected = (c.areaServed || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                                    return selected.includes(x.code || x.name) ? "selected" : ""
                                  })()}
                                  onClick={() => {
                                    const selected = (c.areaServed || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                                    const value = x.code || x.name
                                    const next = selected.includes(value)
                                      ? selected.filter((v: string) => v !== value)
                                      : [...selected, value]
                                    updateContact(idx, "areaServed", next.join(","))
                                  }}
                                >
                                  <div className="font-semibold text-[15px]">
                                    {(() => {
                                      const selected = (c.areaServed || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                                      return selected.includes(x.code || x.name) ? "✓ " : ""
                                    })()}
                                    {x.name} {x.code ? <span className="text-[13px] text-gray-500">({x.code})</span> : null}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="tool-field md:col-span-5" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Language(s)</label>
                    <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                      <button
                        type="button"
                        className="custom-select-trigger tool-select"
                        onClick={() => setLanguageOpenIndex(languageOpenIndex === idx ? null : idx)}
                        style={{ width: "100%", justifyContent: "space-between" }}
                        aria-expanded={languageOpenIndex === idx}
                      >
                        <span className="truncate block">
                          {(() => {
                            const selected = (c.availableLanguage || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                            if (!selected.length) return "Select language(s)"
                            const labels = selected.map((code: string) => {
                              const match = LANG_LIST.find((l) => l.code === code)
                              if (match?.name) return match.name
                              const dn = displayNames?.of ? displayNames.of(code) : undefined
                              return dn || code
                            })
                            return labels.join(", ")
                          })()}
                        </span>
                        <span className="text-xs">&#9662;</span>
                      </button>
                      {languageOpenIndex === idx && (
                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                          <div className="px-3 py-2">
                            <input
                              type="text"
                              className="tool-input"
                              placeholder="Search language..."
                              value={languageSearch}
                              onChange={(e) => setLanguageSearch(e.target.value)}
                            />
                          </div>
                          <ul>
                            {LANG_LIST
                              .filter((l) =>
                                l.name.toLowerCase().includes((languageSearch || "").toLowerCase()) ||
                                l.code.toLowerCase().includes((languageSearch || "").toLowerCase())
                              )
                              .map((l) => {
                                const selected = (c.availableLanguage || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                                const isSelected = selected.includes(l.code)
                                return (
                                  <li
                                    key={l.code}
                                    className={isSelected ? "selected" : ""}
                                    onClick={() => {
                                      const next = isSelected ? selected.filter((x: string) => x !== l.code) : [...selected, l.code]
                                      updateContact(idx, "availableLanguage", next.join(","))
                                    }}
                                  >
                                    <label className="flex items-center gap-2 py-1 px-2 cursor-pointer">
                                      {isSelected ? "✓ " : ""}
                                      <span>{l.name} <span className="text-[13px] text-gray-500">({l.code})</span></span>
                                    </label>
                                  </li>
                                )
                              })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tool-field md:col-span-6" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Contact Option</label>
                    <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                      <button
                        type="button"
                        className="custom-select-trigger tool-select"
                        onClick={() => setOptionsOpenIndex(optionsOpenIndex === idx ? null : idx)}
                        style={{ width: "100%", justifyContent: "space-between" }}
                        aria-expanded={optionsOpenIndex === idx}
                      >
                        <span className="truncate block">
                          {CONTACT_OPTIONS.find((opt) => opt.value === (c.options || ""))?.label || "None"}
                        </span>
                        <span className="text-xs">&#9662;</span>
                      </button>
                      {optionsOpenIndex === idx && (
                        <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 280, overflow: "auto" }}>
                          <ul>
                            <li
                              className={(c.options || "") === "" ? "selected" : ""}
                              onClick={() => { updateContact(idx, "options", ""); setOptionsOpenIndex(null) }}
                            >
                              None
                            </li>
                            {CONTACT_OPTIONS.map((opt) => (
                              <li
                                key={opt.value}
                                className={(c.options || "") === opt.value ? "selected" : ""}
                                onClick={() => { updateContact(idx, "options", opt.value); setOptionsOpenIndex(null) }}
                              >
                                {opt.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-end justify-end" style={{ marginBottom: 0 }}>
                    <button type="button" className="toolbar-btn toolbar-btn--red square-btn" style={{ marginBottom: "6px" }} onClick={() => removeContact(idx)} aria-label="Remove contact point" title="Remove">&times;</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No contact points added yet.</div>
          )}

          <div className="text-sm text-gray-500">
            Search engines may prominently display your contact phone number for mobile users.
          </div>

          <div>
            <button type="button" className="action-btn" onClick={addContact}>Add Contact Point</button>
          </div>
        </div>
      </div>

      {/* 6. Business Details */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Founder</label>
            <input type="text" className="tool-input" value={fields.founder || ""} placeholder="Founder's name" onChange={(e) => handleChange("founder", e.target.value)} />
            {renderError("founder")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Founding Date</label>
            <DatePickerInput value={fields.foundingDate || undefined} onChange={(iso) => handleChange("foundingDate", iso || "")} placeholder="yyyy-mm-dd" />
            {renderError("foundingDate")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        </div>
      </div>

      {/* 7. Location */}
      <div>
        <label className="tool-label block mb-2">Organization Address</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field md:col-span-2">
            <label className="tool-label">Street</label>
            <input type="text" className="tool-input" value={fields.street || ""} placeholder="Street address" onChange={(e) => handleChange("street", e.target.value)} />
            {renderError("street")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">City</label>
            <input type="text" className="tool-input" value={fields.city || ""} placeholder="City" onChange={(e) => handleChange("city", e.target.value)} />
            {renderError("city")}
          </div>

          <div className="tool-field">
            <label className="tool-label">State/Region</label>
            <input type="text" className="tool-input" value={fields.region || ""} placeholder="State or region" onChange={(e) => handleChange("region", e.target.value)} />
            {renderError("region")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Postal Code</label>
            <input type="text" className="tool-input" value={fields.postalCode || ""} placeholder="Postal code" onChange={(e) => handleChange("postalCode", e.target.value)} />
            {renderError("postalCode")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Country</label>
            <div className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setOrgCountryOpen((o) => !o)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={orgCountryOpen}
              >
                <span className="truncate block">
                  {(fields.country && (COUNTRY_LIST.find((c) => c.code === fields.country)?.name || fields.country)) || "Select country"}
                </span>
                <span className="text-xs">&#9662;</span>
              </button>

              {orgCountryOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      className="tool-input"
                      placeholder="Search country..."
                      value={orgCountrySearch}
                      onChange={(e) => setOrgCountrySearch(e.target.value)}
                    />
                  </div>
                  <ul>
                    <li
                      className={(fields.country || "") === "" ? "selected" : ""}
                      onClick={() => { handleChange("country", ""); setOrgCountryOpen(false); setOrgCountrySearch("") }}
                    >
                      Clear selection
                    </li>
                    {COUNTRY_LIST
                      .filter((c) => c.name.toLowerCase().includes((orgCountrySearch || "").toLowerCase()))
                      .map((c) => (
                        <li
                          key={c.code || c.name}
                          className={(fields.country || "") === (c.code || "") ? "selected" : ""}
                          onClick={() => { handleChange("country", c.code || c.name); setOrgCountryOpen(false); setOrgCountrySearch("") }}
                        >
                          <div className="font-semibold text-[15px]">
                            {c.name} {c.code ? <span className="text-[13px] text-gray-500">({c.code})</span> : null}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            {renderError("country")}
          </div>
        </div>

      </div>

      <div>
        <label className="tool-label block mb-2">Geo Coordinates</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Latitude (optional)</label>
            <input type="text" className="tool-input" value={fields.latitude || ""} placeholder="e.g. -1.2921" onChange={(e) => handleChange("latitude", e.target.value)} />
            {renderError("latitude")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Longitude (optional)</label>
            <input type="text" className="tool-input" value={fields.longitude || ""} placeholder="e.g. 36.8219" onChange={(e) => handleChange("longitude", e.target.value)} />
            {renderError("longitude")}
          </div>
        </div>
      </div>

      {/* 8. Operational Details (Conditional) */}
      {isLocalBusinessSelected ? (
        <div className="border border-gray-200 rounded p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="tool-field">
              <label className="tool-label">Price Range</label>
              <input type="text" className="tool-input" value={fields.priceRange || ""} placeholder="KES 1,500 - KES 5,000" onChange={(e) => handleChange("priceRange", e.target.value)} />
              {renderError("priceRange")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Area(s) Served</label>
              <input type="text" className="tool-input" value={fields.areaServed || ""} placeholder="Kenya, Nairobi, Mombasa" onChange={(e) => handleChange("areaServed", e.target.value)} />
              {renderError("areaServed")}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={fields.open24_7 === "true"} onChange={(e) => handleChange("open24_7", e.target.checked ? "true" : "false")} />
              <span>Open 24/7</span>
            </label>
            <button
              type="button"
              className={`action-btn ${fields.open24_7 === "true" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={addOpeningHour}
              disabled={fields.open24_7 === "true"}
              title={fields.open24_7 === "true" ? "Disable 'Open 24/7' to add specific hours" : "Add Opening Hours"}
            >
              Add Hours
            </button>
          </div>

          {renderError("openingHours")}

          <div className="space-y-3">
            {openingHoursState && openingHoursState.length > 0 ? (
              openingHoursState.map((oh, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="tool-field md:col-span-5" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Day(s)</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={oh.days || ""}
                      placeholder="Monday,Tuesday,Wednesday"
                      onChange={(e) => updateOpeningHour(idx, "days", e.target.value)}
                    />
                  </div>

                  <div className="tool-field md:col-span-3" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Opens</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={oh.opens || ""}
                      placeholder="08:00"
                      onChange={(e) => updateOpeningHour(idx, "opens", e.target.value)}
                    />
                    {renderError(`openingHours_time_${idx}_opens`)}
                  </div>

                  <div className="tool-field md:col-span-3" style={{ marginBottom: 0 }}>
                    <label className="tool-label">Closes</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={oh.closes || ""}
                      placeholder="18:00"
                      onChange={(e) => updateOpeningHour(idx, "closes", e.target.value)}
                    />
                    {renderError(`openingHours_time_${idx}_closes`)}
                  </div>

                  <div className="flex items-center md:col-span-1 justify-end">
                    <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeOpeningHour(idx)} aria-label="Remove opening hours" title="Remove">&times;</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No opening hours added yet.</div>
            )}
          </div>
        </div>
      ) : null}
      </div>
    </div>
  )
}
