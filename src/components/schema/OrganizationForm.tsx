// Note: no external icons needed here

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
  } = props
  

  return (
    <>
      {/* Organization @type + More specific @type selectors */}
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
              <span className="text-xs">⏷</span>
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
          <label className="tool-label">More specific @type</label>
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
                    <span className="text-xs">⏷</span>
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

      {/* Organization Name + Alternative Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Organization Name</label>
          <input type="text" className="tool-input" value={fields.name || ""} placeholder="Organization name" onChange={(e) => handleChange("name", e.target.value)} />
          {renderError("name")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Alternative Name</label>
          <input type="text" className="tool-input" value={fields.alternateName || ""} placeholder="Alternative / short name" onChange={(e) => handleChange("alternateName", e.target.value)} />
          {renderError("alternateName")}
        </div>
      </div>

      {/* Organization Description */}
      <div className="tool-field">
        <label className="tool-label">Description</label>
        <textarea className="tool-textarea" rows={4} value={fields.description || ""} placeholder="Short description of the organization" onChange={(e) => handleChange("description", e.target.value)} />
        {renderError("description")}
      </div>

      {/* Website URL + Logo URL */}
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

      {/* Organization Contact Email + @id */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Contact Email</label>
          <input type="text" className="tool-input" value={fields.email || ""} placeholder="info@example.com" onChange={(e) => handleChange("email", e.target.value)} />
          {renderError("email")}
        </div>

        <div className="tool-field">
          <label className="tool-label">@id (URL) <sup><a className="help-icon" href="https://www.schemaapp.com/schema-markup/what-is-an-id-in-structured-data/" target="_blank" rel="noopener noreferrer" title="Learn more about @id">?</a></sup></label>
          <input type="text" className="tool-input" value={fields["@id"] || ""} placeholder="https://example.com/#organization" onChange={(e) => handleChange("@id", e.target.value)} />
          {renderError("@id")}
        </div>
      </div>

      {/* Legal Name + Founder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Legal Name</label>
          <input type="text" className="tool-input" value={fields.legalName || ""} placeholder="Registered legal name" onChange={(e) => handleChange("legalName", e.target.value)} />
          {renderError("legalName")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Founder</label>
          <input type="text" className="tool-input" value={fields.founder || ""} placeholder="Founder's name" onChange={(e) => handleChange("founder", e.target.value)} />
          {renderError("founder")}
        </div>
      </div>

      {/* Founding Date + Number of Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Founding Date</label>
          <input type="text" className="tool-input" value={fields.foundingDate || ""} placeholder="yyyy-mm-dd" onChange={(e) => handleChange("foundingDate", e.target.value)} />
          {renderError("foundingDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Number of Employees</label>
          <input type="text" className="tool-input" value={fields.numberOfEmployees || ""} placeholder="e.g. 250" onChange={(e) => handleChange("numberOfEmployees", e.target.value)} />
          {renderError("numberOfEmployees")}
        </div>
      </div>

      {/* Business Identifiers Section */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Business Identifiers</h4>
        
        {/* ISO 6523 Code + DUNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="tool-field">
            <label className="tool-label">ISO 6523 Code</label>
            <input type="text" className="tool-input" value={fields.iso6523Code || ""} placeholder="e.g. 0088" onChange={(e) => handleChange("iso6523Code", e.target.value)} />
            {renderError("iso6523Code")}
          </div>

          <div className="tool-field">
            <label className="tool-label">DUNS</label>
            <input type="text" className="tool-input" value={fields.duns || ""} placeholder="D-U-N-S number" onChange={(e) => handleChange("duns", e.target.value)} />
            {renderError("duns")}
          </div>
        </div>

        {/* LEI Code + NAICS Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="tool-field">
            <label className="tool-label">LEI Code</label>
            <input type="text" className="tool-input" value={fields.leiCode || ""} placeholder="Legal Entity Identifier" onChange={(e) => handleChange("leiCode", e.target.value)} />
            {renderError("leiCode")}
          </div>

          <div className="tool-field">
            <label className="tool-label">NAICS Code</label>
            <input type="text" className="tool-input" value={fields.naicsCode || ""} placeholder="e.g. 541611" onChange={(e) => handleChange("naicsCode", e.target.value)} />
            {renderError("naicsCode")}
          </div>
        </div>

        {/* Global Location Number + VAT ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="tool-field">
            <label className="tool-label">Global Location Number</label>
            <input type="text" className="tool-input" value={fields.globalLocationNumber || ""} placeholder="GLN" onChange={(e) => handleChange("globalLocationNumber", e.target.value)} />
            {renderError("globalLocationNumber")}
          </div>

          <div className="tool-field">
            <label className="tool-label">VAT ID</label>
            <input type="text" className="tool-input" value={fields.vatId || ""} placeholder="VAT identification number" onChange={(e) => handleChange("vatId", e.target.value)} />
            {renderError("vatId")}
          </div>
        </div>

        {/* Tax ID */}
        <div className="tool-field">
          <label className="tool-label">Tax ID</label>
          <input type="text" className="tool-input" value={fields.taxId || ""} placeholder="Company tax identifier" onChange={(e) => handleChange("taxId", e.target.value)} />
          {renderError("taxId")}
        </div>
      </div>

      {/* Address Section */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Address</h4>
        
        {/* Street Address */}
        <div className="tool-field mb-4">
          <label className="tool-label">Street</label>
          <input type="text" className="tool-input" value={fields.street || ""} placeholder="Street address" onChange={(e) => handleChange("street", e.target.value)} />
          {renderError("street")}
        </div>

        {/* City + State/Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

        {/* Zip / Postal code + Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Zip / Postal code</label>
            <input type="text" className="tool-input" value={fields.postalCode || ""} placeholder="Zip code" onChange={(e) => handleChange("postalCode", e.target.value)} />
            {renderError("postalCode")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Country</label>
            <input type="text" className="tool-input" value={fields.country || ""} placeholder="Country name or code" onChange={(e) => handleChange("country", e.target.value)} />
            {renderError("country")}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Additional Info</h4>
        <div className="space-y-3">
          {orgExtras.length > 0 ? (
            orgExtras.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="tool-field md:col-span-4">
                  <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                    <button
                      type="button"
                      className="custom-select-trigger tool-select"
                      onClick={() => setOrgExtraKeyOpenIndex(orgExtraKeyOpenIndex === idx ? null : idx)}
                      style={{ width: "100%", justifyContent: "space-between" }}
                      aria-expanded={orgExtraKeyOpenIndex === idx}
                    >
                      <span className="truncate block">{(() => {
                        const lab = ORG_ADDITIONAL_OPTIONS.find((o) => o.key === item.key)?.label
                        return lab || "Select field"
                      })()}</span>
                      <span className="text-xs">⏷</span>
                    </button>
                    {orgExtraKeyOpenIndex === idx && (
                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 320, overflow: "auto" }}>
                        <ul>
                          {ORG_ADDITIONAL_OPTIONS.map((o) => (
                            <li key={o.key} className={item.key === o.key ? "selected" : ""} onClick={() => { setOrgExtras(((prev: any[]) => { const next = [...prev]; next[idx] = { ...next[idx], key: o.key }; return next }) as any); setOrgExtraKeyOpenIndex(null) }}>{o.label}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tool-field md:col-span-7">
                  <input type="text" className="tool-input" value={item.value || ""} placeholder="Enter value" onChange={(e) => setOrgExtras(((prev: any[]) => { const next = [...prev]; next[idx] = { ...next[idx], value: e.target.value }; return next }) as any)} />
                </div>

                <div className="flex items-center md:col-span-1 justify-end">
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn toolbar-btn--mb-sm" onClick={() => setOrgExtras(((prev: any[]) => prev.filter((_: any, i: number) => i !== idx)) as any)} aria-label="Remove" title="Remove">×</button>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </>
  )
}
