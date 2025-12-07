import DatePickerInput from "../components/DatePickerInput"
import { Plus } from "lucide-react"

type Props = {
  [k: string]: any
}

export default function PersonForm(props: Props): JSX.Element {
  const p: any = props
  const {
    fields,
    handleChange,
    renderError,
    knowsLangOpen,
    setKnowsLangOpen,
    knowsLangSelected,
    setKnowsLangSelected,
    knowsLangSearch,
    setKnowsLangSearch,
    LANG_LIST,
    socialProfiles,
    handleSocialChange,
    handleSocialBlur,
    addSocialProfile,
    removeSocialProfile,
    education,
    handleEducationFieldChange,
    removeEducation,
    addEducation,
    selectedCountryCode,
    StateSelectComp,
    regionCustomVisible,
    setRegionCustomVisible,
    regionOpen,
    setRegionOpen,
    regionSearch,
    setRegionSearch,
    countryOpen,
    setCountryOpen,
    countrySearch,
    setCountrySearch,
    COUNTRY_LIST,
  } = p

  return (
    <div>
      <div className="tool-field">
        <label className="tool-label">Name</label>
        <input
          type="text"
          className="tool-input"
          value={fields.name || ""}
          placeholder="Full name"
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {renderError("name")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Website URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.url || ""}
            placeholder="https://example.com"
            onChange={(e) => handleChange("url", e.target.value)}
          />
          {renderError("url")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Picture URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.pictureUrl || ""}
            placeholder="https://example.com/photo.jpg"
            onChange={(e) => handleChange("pictureUrl", e.target.value)}
          />
          {renderError("pictureUrl")}
        </div>
      </div>

      <div className="mt-4">
        <div className="tool-field">
          <label className="tool-label">Short Biography / Description</label>
          <textarea className="tool-textarea" rows={3} value={fields.description || ""} placeholder="Short bio or summary" onChange={(e) => handleChange("description", e.target.value)} />
          {renderError("description")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Public Email</label>
          <input type="text" className="tool-input" value={fields.publicEmail || ""} placeholder="public@example.com" onChange={(e) => handleChange("publicEmail", e.target.value)} />
          {renderError("publicEmail")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Public Phone</label>
          <input type="text" className="tool-input" value={fields.publicPhone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("publicPhone", e.target.value)} />
          {renderError("publicPhone")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Date of Birth</label>
          <DatePickerInput
            value={fields.birthDate}
            onChange={(iso: any) => handleChange("birthDate", iso)}
            placeholder="yyyy-mm-dd"
          />
          {renderError("birthDate")}
        </div>

        <div className="tool-field relative">
          <label className="tool-label">Knows language(s)</label>
          <div className="multi-select-input custom-select-wrapper" style={{ position: 'relative' }}>
            <button type="button" className="custom-select-trigger" onClick={() => setKnowsLangOpen((o: any) => !o)} aria-expanded={knowsLangOpen}>
              <div>
                {knowsLangSelected.length === 0 ? (
                  <span className="text-gray-500">Select languages...</span>
                ) : (
                  knowsLangSelected.map((l: any) => (
                    <span key={l} className="px-2 py-1 bg-gray-100 rounded text-sm whitespace-nowrap">
                      {l}
                    </span>
                  ))
                )}
              </div>
              <span style={{ fontSize: 12, flexShrink: 0, marginLeft: '0.5rem' }}>⏷</span>
            </button>

            <div className={`custom-select-list absolute left-0 mt-1 z-50 bg-white border rounded ${knowsLangOpen ? 'open' : ''}`} style={{ width: '100%', maxHeight: 260, overflow: 'auto', display: knowsLangOpen ? 'block' : 'none' }}>
              <div className="p-2">
                <input type="text" className="tool-input" placeholder="Filter languages..." value={knowsLangSearch} onChange={(e) => setKnowsLangSearch(e.target.value)} />
              </div>
              <ul>
                {LANG_LIST.filter((it: any) => (`${it.name} ${it.code}`).toLowerCase().includes((knowsLangSearch || '').toLowerCase())).map((l: any) => (
                  <li key={l.code} className={knowsLangSelected.includes(l.name) ? 'selected' : ''} onClick={() => {
                    const sel = knowsLangSelected.includes(l.name) ? knowsLangSelected.filter((s: any) => s !== l.name) : [...knowsLangSelected, l.name]
                    setKnowsLangSelected(sel)
                    handleChange('knowsLanguage', sel.join(', '))
                  }}>
                    {knowsLangSelected.includes(l.name) ? "✓ " : ""}{l.name} <span className="text-[13px] text-gray-500">{l.code}</span>
                  </li>
                ))}
              </ul>
              <div className="p-2 border-t flex justify-between">
                <button type="button" className="action-btn clear-btn--red" onClick={() => { setKnowsLangSelected([]); handleChange('knowsLanguage', '') }}>Clear</button>
                <button type="button" className="action-btn" onClick={() => setKnowsLangOpen(false)}>Done</button>
              </div>
            </div>
          </div>
          {renderError('knowsLanguage')}
        </div>
      </div>

      <div className="mt-4">
        <label className="tool-label block mb-2">Social profiles</label>
            <div className="flex flex-col gap-2">
              {socialProfiles && socialProfiles.length > 0 ? (
                socialProfiles.map((s: any, idx: number) => (
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
                      <button
                        type="button"
                        className="toolbar-btn toolbar-btn--red square-btn"
                        onClick={() => removeSocialProfile(idx)}
                        aria-label="Remove profile"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                    {renderError(`sameAs_${idx}`)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No social profiles added.</div>
              )}

              <div>
                <button type="button" className="action-btn" onClick={addSocialProfile}>
                  Add Profile
                </button>
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Job title</label>
          <input
            type="text"
            className="tool-input"
            value={fields.jobTitle || ""}
            placeholder="Marketing Manager"
            onChange={(e) => handleChange("jobTitle", e.target.value)}
          />
          {renderError("jobTitle")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Organization Name</label>
          <input
            type="text"
            className="tool-input"
            value={fields.worksFor || ""}
            placeholder="Company or Organization"
            onChange={(e) => handleChange("worksFor", e.target.value)}
          />
          {renderError("worksFor")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Organization URL</label>
          <input type="text" className="tool-input" value={fields.worksForUrl || ""} placeholder="https://example.com" onChange={(e) => handleChange("worksForUrl", e.target.value)} />
          {renderError("worksForUrl")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Department</label>
          <input type="text" className="tool-input" value={fields.department || ""} placeholder="Department name" onChange={(e) => handleChange("department", e.target.value)} />
          {renderError("department")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Street</label>
          <input type="text" className="tool-input" value={fields.street || ""} placeholder="123 Main St" onChange={(e) => handleChange("street", e.target.value)} />
          {renderError("street")}
        </div>

        <div className="tool-field">
          <label className="tool-label">City</label>
          <input type="text" className="tool-input" value={fields.city || ""} placeholder="Anytown" onChange={(e) => handleChange("city", e.target.value)} />
          {renderError("city")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Postal Code</label>
          <input type="text" className="tool-input" value={fields.postalCode || ""} placeholder="90210" onChange={(e) => handleChange("postalCode", e.target.value)} />
          {renderError("postalCode")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">State/Province/Region</label>
          {StateSelectComp && selectedCountryCode && !regionCustomVisible ? (
            <StateSelectComp
              className="tool-input"
              country={selectedCountryCode}
              countryCode={selectedCountryCode}
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
          ) : selectedCountryCode && STATES_BY_COUNTRY[selectedCountryCode] && !regionCustomVisible ? (
            <div className="custom-select-wrapper compact-select region-select-wrapper relative" style={{ width: '100%' }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setRegionOpen((o: any) => !o)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={regionOpen}
              >
                <span className="truncate block">{fields.region || "Select state / region"}</span>
                <span className="text-xs">⏷</span>
              </button>

              {regionOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                  <div className="p-2">
                    <input
                      type="text"
                      className="tool-input"
                      placeholder="Search region..."
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                    />
                  </div>
                  <ul>
                    {STATES_BY_COUNTRY[selectedCountryCode].filter((s: any) => s.toLowerCase().includes((regionSearch || "").toLowerCase())).map((s: any) => (
                      <li key={s} className={(fields.region || "") === s ? "selected" : ""} onClick={() => { handleChange("region", s); setRegionOpen(false); setRegionSearch("") }}>
                        {s}
                      </li>
                    ))}
                    <li key="__other__" onClick={() => { setRegionCustomVisible(true); handleChange("region", ""); setRegionOpen(false) }}>
                      Other...
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : selectedCountryCode && !regionCustomVisible ? (
            selectedCountryCode === "KE" ? (
              <input
                type="text"
                className="tool-input opacity-50"
                value={fields.region || ""}
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
          ) : (
            <input
              type="text"
              className="tool-input"
              value={fields.region || ""}
              placeholder="State or region"
              onChange={(e) => handleChange("region", e.target.value)}
            />
          )}
          {renderError("region")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Country</label>
          <div className={`custom-select-wrapper compact-select relative`} style={{ width: '100%' }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={() => setCountryOpen((o: any) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
              aria-expanded={countryOpen}
            >
              <span className="truncate block">{(fields.country && (COUNTRY_LIST.find((c: any) => c.code === fields.country)?.name || fields.country)) || (fields.country || "Select country")}</span>
              <span className="text-xs">⏷</span>
            </button>

            {countryOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                <div className="p-2">
                  <input
                    type="text"
                    className="tool-input"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                  />
                </div>
                <ul>
                  {COUNTRY_LIST.filter((c: any) => c.name.toLowerCase().includes((countrySearch || "").toLowerCase())).map((c: any) => (
                    <li key={c.code || c.name} className={(fields.country || "") === (c.code || "") ? "selected" : ""} onClick={() => { handleChange("country", c.code || ""); setCountryOpen(false); setCountrySearch(""); setRegionCustomVisible(false) }}>
                      {c.name} {c.code ? <span className="text-[13px] text-gray-500">({c.code})</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError("country")}
        </div>
      </div>

      <div className="mt-4">
        <label className="tool-label block mb-2">Education Background</label>
        <div className="flex flex-col gap-2">
          {education && education.length > 0 ? (
            education.map((edu: any, idx: number) => (
              <div key={idx}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                  <div className="tool-field">
                    <label className="tool-label">School / University Name</label>
                    <input
                      type="text"
                      className="tool-input"
                      value={edu.name}
                      placeholder="School / University Name"
                      onChange={(e) => handleEducationFieldChange(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="tool-field">
                    <label className="tool-label">School / University URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="tool-input flex-1"
                        value={edu.url}
                        placeholder="https://example.edu"
                        onChange={(e) => handleEducationFieldChange(idx, "url", e.target.value)}
                      />
                      <button
                        type="button"
                        className="toolbar-btn toolbar-btn--red square-btn"
                        onClick={() => removeEducation(idx)}
                        aria-label="Remove education"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No institution added.</div>
          )}

          <div>
            <button type="button" className="action-btn" onClick={addEducation}>
              <Plus className="inline w-4 h-4 mr-2" /> Add Education
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
