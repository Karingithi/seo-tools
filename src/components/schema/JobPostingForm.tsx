import { useState } from 'react'
import DatePickerInput from '../DatePickerInput'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import currencyCodes from 'currency-codes'
import type { JobPostingFormProps } from '../../types/jobposting'

countries.registerLocale(enLocale)

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select employment type' },
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'PER_DIEM', label: 'Per diem' },
  { value: 'OTHER', label: 'Other' },
]

const SALARY_UNITS = ['YEAR', 'MONTH', 'WEEK', 'DAY', 'HOUR']

function buildCountryList() {
  const names = countries.getNames('en', { select: 'official' }) || {}
  return Object.entries(names).map(([code, name]) => ({ code, name }))
}

function buildAllCurrencies() {
  return (currencyCodes.codes().map((c: any) => ({ code: c, name: c })) as Array<{ code: string; name: string }> )
}

// Normalize an input URL for immediate client-side feedback.
// Matches builder behaviour: trim and auto-prefix bare 'www.' with https://
const normalizeInputUrl = (v: any) => {
  if (v == null) return ''
  let s = String(v).trim()
  if (!s) return ''
  if (/^www\./i.test(s)) return `https://${s}`
  return s
}

const capitalize = (s: string) => {
  if (!s) return ''
  const str = String(s)
  return str.charAt(0) + str.slice(1).toLowerCase()
}

export default function JobPostingForm(props: JobPostingFormProps): JSX.Element {
  const {
    fields,
    handleChange,
    renderError = () => null,
    StateSelectComp = null,
    COUNTRY_LIST = buildCountryList(),
    STATES_BY_COUNTRY = {},
    jobEmploymentTypeOpen,
    toggleJobEmploymentTypeOpen,
    jobCountryOpen,
    toggleJobCountryOpen,
    jobRegionOpen,
    toggleJobRegionOpen,
    jobSalaryCurrencyOpen,
    toggleJobSalaryCurrencyOpen,
    jobSalaryUnitOpen,
    toggleJobSalaryUnitOpen,
  } = props

  const [countrySearch, setCountrySearch] = useState<string>('')
  const [regionSearch, setRegionSearch] = useState<string>('')
  const [regionCustomVisible, setRegionCustomVisible] = useState<boolean>(false)
  const [salaryCurrencySearch, setSalaryCurrencySearch] = useState<string>('')

  // JobPosting dropdown open states are controlled by parent (SchemaBuilder) via props

  const ALL_CURRENCIES = buildAllCurrencies()

  const getSelectedCountryCode = (countryVal?: string) => {
    if (!countryVal) return undefined
    // If already a 2-letter code (any case), normalize to upper-case
    if (/^[A-Za-z]{2}$/.test(countryVal)) return countryVal.toUpperCase()

    // Try to find in prebuilt country list first (matches code or name)
    const found = COUNTRY_LIST.find((c) => (c.code || '').toLowerCase() === (countryVal || '').toLowerCase() || (c.name || '').toLowerCase() === (countryVal || '').toLowerCase())
    if (found) return found.code

    // Otherwise try the i18n helper as a last resort
    try {
      const code = countries.getAlpha2Code(countryVal, 'en')
      return code || undefined
    } catch {
      return undefined
    }
  }

  const selectedCountryCode = getSelectedCountryCode(fields.country)
  const hasRegions = !!(selectedCountryCode && STATES_BY_COUNTRY && STATES_BY_COUNTRY[selectedCountryCode] && STATES_BY_COUNTRY[selectedCountryCode].length)
  const stateDisabled = selectedCountryCode !== 'US'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Job title</label>
          <input
            type="text"
            className="tool-input"
            value={fields.title || ''}
            placeholder="Job's title"
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {renderError('title')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Job identifier (internal ID)</label>
          <input
            type="text"
            className="tool-input"
            value={fields.identifier || ''}
            placeholder="Job ref / id"
            onChange={(e) => handleChange('identifier', e.target.value)}
          />
          {renderError('identifier')}
        </div>
      </div>
      
        

      <div className="tool-field">
        <label className="tool-label">Job description (HTML allowed)</label>
        <textarea
          className="tool-textarea"
          rows={6}
          value={fields.jobDescription || ''}
          placeholder="Role responsibilities, HTML allowed"
          onChange={(e) => handleChange('jobDescription', e.target.value)}
        />
        <div className="text-sm text-gray-500 mt-1">You can paste HTML here; this will be used as the job description.</div>
        {renderError('jobDescription')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Company name</label>
          <input
            type="text"
            className="tool-input"
            value={fields.hiringOrganization || ''}
            placeholder="Company name"
            onChange={(e) => handleChange('hiringOrganization', e.target.value)}
          />
          {renderError('hiringOrganization')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Company website URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.hiringOrganizationUrl || ''}
            placeholder="https://example.com"
            onChange={(e) => handleChange('hiringOrganizationUrl', normalizeInputUrl(e.target.value))}
          />
          {renderError('hiringOrganizationUrl')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="tool-field">
          <label className="tool-label">Company social profiles (LinkedIn, Facebook, etc.)</label>
          {(() => {
            const raw = fields.hiringOrganizationSameAs
            const list: string[] = Array.isArray(raw)
              ? raw.slice()
              : (typeof raw === 'string' && raw.trim() ? String(raw).split(/\r?\n|,\s*/).map(s => s.trim()).filter(Boolean) : [])

            return (
              <div>
                {list.map((url, idx) => {
                  const val = url || ''
                  const isUrlValid = (() => {
                    try {
                      const u = new URL(String(val))
                      return u.protocol === 'http:' || u.protocol === 'https:'
                    } catch {
                      return false
                    }
                  })()

                  return (
                    <div key={idx} className="mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="tool-input"
                          value={val}
                          placeholder="https://www.linkedin.com/company/example"
                          onChange={(e) => {
                            const next = list.slice()
                            next[idx] = normalizeInputUrl(e.target.value)
                            handleChange('hiringOrganizationSameAs', next)
                          }}
                        />
                        <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => {
                          const next = list.slice().filter((_, i) => i !== idx)
                          handleChange('hiringOrganizationSameAs', next)
                        }} aria-label="Remove profile" title="Remove">×</button>
                      </div>
                      {!val ? (
                        <div className="text-sm text-gray-500 mt-1">Enter a profile URL.</div>
                      ) : isUrlValid ? (
                        <div className="text-sm text-green-600 mt-1">Looks good</div>
                      ) : (
                        <div className="validation-message">Invalid URL format</div>
                      )}
                    </div>
                  )
                })}

                <div className="mt-2">
                  <button type="button" className="action-btn" onClick={() => {
                    const next = list.slice()
                    next.push('')
                    handleChange('hiringOrganizationSameAs', next)
                  }}>Add social profile</button>
                </div>

                <div className="text-sm text-gray-500 mt-1">Add one profile URL per row. These will be mapped to <code>hiringOrganization.sameAs</code>.</div>
                {renderError('hiringOrganizationSameAs')}
              </div>
            )
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Company logo URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.companyLogo || ''}
            placeholder="https://example.com/logo.png"
            onChange={(e) => handleChange('companyLogo', normalizeInputUrl(e.target.value))}
          />
          {renderError('companyLogo')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Industry / sector</label>
          <input
            type="text"
            className="tool-input"
            value={fields.industry || ''}
            placeholder="Industry or sector"
            onChange={(e) => handleChange('industry', e.target.value)}
          />
          {renderError('industry')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Employment type</label>
          <div className="custom-select-wrapper compact-select jobpost-select-wrapper relative" style={{ width: '100%' }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={toggleJobEmploymentTypeOpen}
              style={{ width: '100%', justifyContent: 'space-between' }}
              aria-expanded={jobEmploymentTypeOpen}
            >
              <span className="truncate block">{(EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === (fields.employmentType || '')) || { label: 'Select employment type' }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {jobEmploymentTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                <ul>
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <li key={opt.value} className={(fields.employmentType || '') === opt.value ? 'selected' : ''} onClick={() => { handleChange('employmentType', opt.value); toggleJobEmploymentTypeOpen && toggleJobEmploymentTypeOpen() }}>{opt.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError('employmentType')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Work hours (e.g. 8am-5pm)</label>
          <input
            type="text"
            className="tool-input"
            value={fields.workHours || ''}
            placeholder="e.g. 8am-5pm, shift"
            onChange={(e) => handleChange('workHours', e.target.value)}
          />
          {renderError('workHours')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-4">
        <div className="tool-field">
          <label className="tool-label">Date posted</label>
          <DatePickerInput
            value={fields.datePosted}
            onChange={(iso) => handleChange('datePosted', iso)}
            placeholder="yyyy-mm-dd"
          />
          {renderError('datePosted')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Application deadline</label>
          <DatePickerInput
            value={fields.validThrough}
            onChange={(iso) => handleChange('validThrough', iso)}
            placeholder="yyyy-mm-dd"
          />
          {renderError('validThrough')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Remote job</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={fields.isRemote === 'true'}
              onChange={(e) => handleChange('isRemote', e.target.checked ? 'true' : 'false')}
            />
            <span className="text-sm">Remote job</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Street address (optional)</label>
          <input type="text" className="tool-input" value={fields.street || ''} placeholder="Street address" onChange={(e) => handleChange('street', e.target.value)} />
          {renderError('street')}
        </div>

        <div className="tool-field">
          <label className="tool-label">City</label>
          <input type="text" className="tool-input" value={fields.city || ''} placeholder="City" onChange={(e) => handleChange('city', e.target.value)} />
          {renderError('city')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">State / Province / Region</label>
          {hasRegions && !regionCustomVisible ? (
            <div className={`custom-select-wrapper compact-select region-select-wrapper relative ${stateDisabled ? 'opacity-50 pointer-events-none' : ''}`} style={{ width: '100%' }}>
              <button
                type="button"
                className={`custom-select-trigger tool-select ${stateDisabled ? 'opacity-50' : ''}`}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onClick={() => { if (!stateDisabled) { toggleJobRegionOpen && toggleJobRegionOpen() } }}
                style={{ width: '100%', justifyContent: 'space-between' }}
                aria-expanded={jobRegionOpen}
                disabled={stateDisabled}
              >
                <span className="truncate block">{fields.region || 'Select state / region'}</span>
                <span className="text-xs">⏷</span>
              </button>

              {jobRegionOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%', maxHeight: 260, overflow: 'auto' }}>
                  <div className="p-2">
                    <input type="text" className="tool-input" placeholder="Search region..." value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} />
                  </div>
                  <ul>
                    {(STATES_BY_COUNTRY[selectedCountryCode] || []).filter((s) => s.toLowerCase().includes((regionSearch || '').toLowerCase())).map((s) => (
                      <li key={s} className={(fields.region || '') === s ? 'selected' : ''} onMouseDown={(e) => { e.stopPropagation(); }} onClick={() => { handleChange('region', s); toggleJobRegionOpen && toggleJobRegionOpen() }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (!stateDisabled && StateSelectComp && selectedCountryCode && !regionCustomVisible) ? (
            <StateSelectComp
              className="tool-input"
              country={selectedCountryCode}
              countryCode={selectedCountryCode}
              value={fields.region || ''}
              onChange={(v: any) => {
                const val = typeof v === 'string' ? v : (v && (v.target ? v.target.value : v))
                if (val === '__other__') {
                  setRegionCustomVisible(true)
                  handleChange('region', '')
                } else {
                  handleChange('region', val || '')
                }
              }}
            />
          ) : (
            <input type="text" className={`tool-input ${stateDisabled ? 'opacity-50' : ''}`} value={fields.region || ''} placeholder="State / Region" onChange={(e) => handleChange('region', e.target.value)} disabled={stateDisabled} />
          )}
          {renderError('region')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Postal code</label>
          <input type="text" className="tool-input" value={fields.postalCode || ''} placeholder="Postal code" onChange={(e) => handleChange('postalCode', e.target.value)} />
          {renderError('postalCode')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Country</label>
          <div className="custom-select-wrapper compact-select relative country-select-wrapper" style={{ width: '100%' }}>
            {selectedCountryCode ? (
              <img
                className="flag-preview"
                src={`https://flagcdn.com/24x18/${selectedCountryCode.toLowerCase()}.png`}
                alt={selectedCountryCode}
              />
            ) : null}

            <button
              type="button"
              className="custom-select-trigger tool-select"
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={() => toggleJobCountryOpen && toggleJobCountryOpen()}
              style={{ width: '100%', justifyContent: 'space-between' }}
              aria-expanded={jobCountryOpen}
            >
              <span className="truncate block" style={{ marginLeft: selectedCountryCode ? 30 : undefined }}>
                {(() => {
                  const found = fields.country && COUNTRY_LIST.find((c) => c.code === fields.country)
                  return found ? `${found.name} (${found.code})` : (fields.country || 'Select country')
                })()}
              </span>
              <span className="text-xs">⏷</span>
            </button>

            {jobCountryOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%', maxHeight: 260, overflow: 'auto' }}>
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
                  {COUNTRY_LIST.filter((c) => (
                    (c.name || '').toLowerCase().includes((countrySearch || '').toLowerCase()) ||
                    (c.code || '').toLowerCase().includes((countrySearch || '').toLowerCase())
                  )).map((c) => (
                    <li key={c.code || c.name} className={(fields.country || '') === (c.code || '') ? 'selected' : ''} onMouseDown={(e) => { e.stopPropagation(); }} onClick={() => { handleChange('country', c.code || ''); toggleJobCountryOpen && toggleJobCountryOpen(); setCountrySearch(''); setRegionCustomVisible(false) }}>
                      {c.name || ''} ({c.code || ''})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError('country')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Minimum salary</label>
          <input type="text" className="tool-input" value={fields.minSalary || ''} placeholder="Min salary" onChange={(e) => handleChange('minSalary', e.target.value)} />
          {renderError('minSalary')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Maximum salary</label>
          <input type="text" className="tool-input" value={fields.maxSalary || ''} placeholder="Max salary" onChange={(e) => handleChange('maxSalary', e.target.value)} />
          {renderError('maxSalary')}
        </div>

        <div className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="tool-field">
              <label className="tool-label">Salary currency</label>
              <div className="relative" style={{ width: '100%' }}>
                <button type="button" className="custom-select-trigger tool-select" onClick={toggleJobSalaryCurrencyOpen} style={{ width: '100%', justifyContent: 'space-between' }} aria-expanded={jobSalaryCurrencyOpen}>
                  <span className="truncate block">{(fields.salaryCurrency && fields.salaryCurrency.trim()) ? (fields.salaryCurrency) : 'Select currency'}</span>
                  <span className="text-xs">⏷</span>
                </button>
                {jobSalaryCurrencyOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%', maxHeight: 260, overflow: 'auto' }}>
                    <div className="p-2"><input type="text" className="tool-input" placeholder="Search currency..." value={salaryCurrencySearch} onChange={(e) => setSalaryCurrencySearch(e.target.value)} /></div>
                    <ul>
                      {ALL_CURRENCIES.filter((c) => (c.code || '').toLowerCase().includes((salaryCurrencySearch || '').toLowerCase()) || (c.name || '').toLowerCase().includes((salaryCurrencySearch || '').toLowerCase())).map((c) => (
                        <li key={c.code} className={(fields.salaryCurrency || '') === (c.code || '') ? 'selected' : ''} onClick={() => { handleChange('salaryCurrency', c.code || ''); toggleJobSalaryCurrencyOpen && toggleJobSalaryCurrencyOpen(); setSalaryCurrencySearch('') }}>{c.code}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="tool-field">
              <label className="tool-label">Salary period</label>
              <div className="relative" style={{ width: '100%' }}>
                <button type="button" className="custom-select-trigger tool-select" onClick={toggleJobSalaryUnitOpen} style={{ width: '100%', justifyContent: 'space-between' }} aria-expanded={jobSalaryUnitOpen}>
                  <span className="truncate block">{(fields.salaryUnit && fields.salaryUnit.trim()) ? capitalize(fields.salaryUnit) : 'Select period'}</span>
                  <span className="text-xs">⏷</span>
                </button>
                {jobSalaryUnitOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                    <ul>
                      {SALARY_UNITS.map((u) => (
                        <li key={u} className={(fields.salaryUnit || '') === u ? 'selected' : ''} onClick={() => { handleChange('salaryUnit', u); toggleJobSalaryUnitOpen && toggleJobSalaryUnitOpen() }}>{capitalize(u)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="tool-field">
          <label className="tool-label">Required skills</label>
          <textarea className="tool-textarea" rows={3} value={fields.skills || ''} placeholder="One skill per line or comma-separated" onChange={(e) => handleChange('skills', e.target.value)} />
          {renderError('skills')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Education requirements</label>
          <textarea className="tool-textarea" rows={3} value={fields.educationRequirements || ''} placeholder="e.g. Bachelor's degree in Computer Science" onChange={(e) => handleChange('educationRequirements', e.target.value)} />
          {renderError('educationRequirements')}
        </div>
        
        <div className="tool-field">
          <label className="tool-label">Experience requirements</label>
          <textarea className="tool-textarea" rows={3} value={fields.experienceRequirements || ''} placeholder="e.g. 3-5 years relevant experience" onChange={(e) => handleChange('experienceRequirements', e.target.value)} />
          {renderError('experienceRequirements')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Application URL</label>
          {(() => {
            const val = fields.applicationUrl || ''
            const isUrlValid = (() => {
              if (!val) return false
              try { const u = new URL(String(val)); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
            })()

            return (
              <div>
                <input type="text" className="tool-input" value={val} placeholder="https://example.com/apply" onChange={(e) => handleChange('applicationUrl', normalizeInputUrl(e.target.value))} />
                {!val ? (
                  <div className="text-sm text-gray-500 mt-1">Optional: a link applicants can use to apply.</div>
                ) : isUrlValid ? (
                  <div className="text-sm text-green-600 mt-1">Valid URL</div>
                ) : (
                  <div className="validation-message">Invalid URL format</div>
                )}
                {renderError('applicationUrl')}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}