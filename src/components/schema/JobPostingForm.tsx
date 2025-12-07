import DatePickerInput from "./DatePickerInput"
import type { ComponentType } from 'react'
import type { StateProps } from 'react-country-state-fields'

export type JobPostingFields = {
  title?: string
  identifier?: string
  jobDescription?: string
  hiringOrganization?: string
  hiringOrganizationUrl?: string
  companyLogo?: string
  industry?: string
  employmentType?: string
  workHours?: string
  datePosted?: string
  validThrough?: string
  isRemote?: string
  country?: string
  region?: string
  city?: string
  street?: string
  postalCode?: string
  minSalary?: string
  maxSalary?: string
  currency?: string
  salaryUnit?: string
  responsibilities?: string
  skills?: string
  qualifications?: string
  educationRequirements?: string
  experienceRequirements?: string
  [k: string]: any
}

export type JobPostingFormProps = {
  fields: Partial<JobPostingFields>
  handleChange: (key: string, value: string) => void
  renderError: (key?: string) => JSX.Element | null
  EMPLOYMENT_TYPE_OPTIONS: { value: string; label: string }[]
  employmentTypeOpen: boolean
  setEmploymentTypeOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  timezoneOpen: boolean
  setTimezoneOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  timezoneSearch: string
  setTimezoneSearch: (v: string) => void
  DATE_PICKER?: unknown
  ALL_CURRENCIES: { code: string; name: string }[]
  salaryCurrencyOpen: boolean
  setSalaryCurrencyOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  salaryCurrencySearch: string
  setSalaryCurrencySearch: (v: string) => void
  salaryUnitOpen: boolean
  setSalaryUnitOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  COUNTRY_LIST: { name: string; code?: string }[]
  selectedCountryCode?: string
  StateSelectComp: ComponentType<StateProps> | null
  regionCustomVisible: boolean
  setRegionCustomVisible: (v: boolean) => void
  regionOpen: boolean
  setRegionOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  regionSearch: string
  setRegionSearch: (v: string) => void
}

export default function JobPostingFormClean(props: JobPostingFormProps): JSX.Element {
  const p = props
  const {
    fields,
    handleChange,
    renderError,
    EMPLOYMENT_TYPE_OPTIONS,
    employmentTypeOpen,
    setEmploymentTypeOpen,
    timezoneOpen,
    setTimezoneOpen,
    timezoneSearch,
    setTimezoneSearch,
    ALL_CURRENCIES,
    salaryCurrencyOpen,
    setSalaryCurrencyOpen,
    salaryCurrencySearch,
    setSalaryCurrencySearch,
    salaryUnitOpen,
    setSalaryUnitOpen,
    COUNTRY_LIST,
    selectedCountryCode,
    StateSelectComp,
    regionCustomVisible,
    setRegionCustomVisible,
    regionOpen,
    setRegionOpen,
    regionSearch,
    setRegionSearch,
  } = p

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Job title</label>
          <input type="text" className="tool-input" value={fields.title || ""} placeholder="Job's title" onChange={(e) => handleChange("title", e.target.value)} />
          {renderError("title")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Identifier</label>
          <input type="text" className="tool-input" value={fields.identifier || ""} placeholder="Job ref / id" onChange={(e) => handleChange("identifier", e.target.value)} />
          {renderError("identifier")}
        </div>
      </div>

      <div className="tool-field">
        <label className="tool-label">Job's description (in HTML)</label>
        <textarea className="tool-textarea" rows={6} value={fields.jobDescription || ""} placeholder="Role responsibilities, HTML allowed" onChange={(e) => handleChange("jobDescription", e.target.value)} />
        <div className="text-sm text-gray-500 mt-1">You can paste HTML here; this will be used as the job description.</div>
        {renderError("jobDescription")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Company</label>
          <input type="text" className="tool-input" value={fields.hiringOrganization || ""} placeholder="Company name" onChange={(e) => handleChange("hiringOrganization", e.target.value)} />
          {renderError("hiringOrganization")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Company URL</label>
          <input type="text" className="tool-input" value={fields.hiringOrganizationUrl || ""} placeholder="https://example.com" onChange={(e) => handleChange("hiringOrganizationUrl", e.target.value)} />
          {renderError("hiringOrganizationUrl")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Company logo</label>
          <input type="text" className="tool-input" value={fields.companyLogo || ""} placeholder="https://example.com/logo.png" onChange={(e) => handleChange("companyLogo", e.target.value)} />
          {renderError("companyLogo")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Industry</label>
          <input type="text" className="tool-input" value={fields.industry || ""} placeholder="Industry or sector" onChange={(e) => handleChange("industry", e.target.value)} />
          {renderError("industry")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Employment type</label>
          <div className="custom-select-wrapper compact-select jobpost-select-wrapper relative" style={{ width: "100%" }}>
            <button type="button" className="custom-select-trigger tool-select" onClick={() => setEmploymentTypeOpen((o: any) => !o)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={employmentTypeOpen}>
              <span className="truncate block">{(EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === (fields.employmentType || "")) || { label: "Select employment type" }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {employmentTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <li key={opt.value} className={(fields.employmentType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("employmentType", opt.value); setEmploymentTypeOpen(false) }}>
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError("employmentType")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Work hours (e.g. 8am-5pm)</label>
          <input type="text" className="tool-input" value={fields.workHours || ""} placeholder="e.g. 8am-5pm, shift" onChange={(e) => handleChange("workHours", e.target.value)} />
          {renderError("workHours")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="tool-field">
          <label className="tool-label">Date posted</label>
          <DatePickerInput value={fields.datePosted} onChange={(iso) => handleChange("datePosted", iso)} placeholder="yyyy-mm-dd" />
          {renderError("datePosted")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Expire date</label>
          <DatePickerInput value={fields.validThrough} onChange={(iso) => handleChange("validThrough", iso)} placeholder="yyyy-mm-dd" />
          {renderError("validThrough")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Remote job</label>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={fields.isRemote === "true"} onChange={(e) => handleChange("isRemote", e.target.checked ? "true" : "false")} />
            <span className="text-sm">Remote job</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="tool-field">
          <label className="tool-label">Country</label>
          <div className="custom-select-wrapper compact-select relative country-select-wrapper" style={{ width: '100%' }}>
            {selectedCountryCode ? (
              <img className="flag-preview" src={`https://flagcdn.com/24x18/${selectedCountryCode.toLowerCase()}.png`} alt={selectedCountryCode} />
            ) : null}

            <button type="button" className="custom-select-trigger tool-select" onClick={() => setRegionOpen((o: any) => !o)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={regionOpen}>
              <span className="truncate block" style={{ marginLeft: selectedCountryCode ? 30 : undefined }}>{(fields.country && COUNTRY_LIST.find(c => c.code === fields.country)?.name) || (fields.country || "Select country")}</span>
              <span className="text-xs">⏷</span>
            </button>

            {regionOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                <div className="p-2">
                  <input type="text" className="tool-input" placeholder="Search country..." value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} />
                </div>
                <ul>
                  {COUNTRY_LIST.filter((c) => c.name.toLowerCase().includes((regionSearch || "").toLowerCase())).map((c) => (
                    <li key={c.code || c.name} className={(fields.country || "") === (c.code || "") ? "selected" : ""} onClick={() => { handleChange("country", c.code || ""); setRegionOpen(false); setRegionSearch("") }}>
                      <div className="font-semibold text-[15px]">{c.name}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

I created the clean component file. Next, I'll add an import and replace the inline Job Posting JSX in `SchemaBuilder.tsx` with the new `JobPostingFormClean` component in a single safe patch, then run the build. Do you want me to proceed?