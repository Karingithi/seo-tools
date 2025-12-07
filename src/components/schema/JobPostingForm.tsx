import { useState, type ComponentType } from 'react'
import DatePickerInput from '../DatePickerInput'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import currencyCodes from 'currency-codes'
import type { StateProps } from 'react-country-state-fields'

countries.registerLocale(enLocale)

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
  minSalary?: string
  maxSalary?: string
  salaryCurrency?: string
  salaryUnit?: string
  [k: string]: any
}

export type JobPostingFormProps = {
  fields: Partial<JobPostingFields>
  handleChange: (key: string, value: any) => void
  renderError?: (key?: string) => JSX.Element | null
  // Optional helpers if provided by the parent (will fall back to internal handling)
  StateSelectComp?: ComponentType<StateProps> | null
  COUNTRY_LIST?: Array<{ code?: string; name: string }>
  STATES_BY_COUNTRY?: Record<string, string[]>
}

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

export default function JobPostingForm(props: JobPostingFormProps): JSX.Element {
  const {
    fields,
    handleChange,
    renderError = () => null,
    StateSelectComp = null,
    COUNTRY_LIST = buildCountryList(),
    STATES_BY_COUNTRY = {},
  } = props

  const [employmentTypeOpen, setEmploymentTypeOpen] = useState<boolean>(false)
  const [countryOpen, setCountryOpen] = useState<boolean>(false)
  const [countrySearch, setCountrySearch] = useState<string>('')
  const [regionOpen, setRegionOpen] = useState<boolean>(false)
  const [regionSearch, setRegionSearch] = useState<string>('')
  const [regionCustomVisible, setRegionCustomVisible] = useState<boolean>(false)
  const [salaryCurrencyOpen, setSalaryCurrencyOpen] = useState<boolean>(false)
  const [salaryCurrencySearch, setSalaryCurrencySearch] = useState<string>('')
  const [salaryUnitOpen, setSalaryUnitOpen] = useState<boolean>(false)

  const ALL_CURRENCIES = buildAllCurrencies()

  const getSelectedCountryCode = (countryVal?: string) => {
    if (!countryVal) return undefined
    const found = COUNTRY_LIST.find((c) => (c.code || '').toLowerCase() === (countryVal || '').toLowerCase() || c.name.toLowerCase() === (countryVal || '').toLowerCase())
    return found?.code
  }

  const selectedCountryCode = getSelectedCountryCode(fields.country)

  return (
    <div>
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
          <label className="tool-label">Identifier</label>
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
        <label className="tool-label">Job's description (in HTML)</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Company</label>
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
          <label className="tool-label">Company URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.hiringOrganizationUrl || ''}
            placeholder="https://example.com"
            onChange={(e) => handleChange('hiringOrganizationUrl', e.target.value)}
          />
          {renderError('hiringOrganizationUrl')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="tool-field">
          <label className="tool-label">Company logo</label>
          <input
            type="text"
            className="tool-input"
            value={fields.companyLogo || ''}
            placeholder="https://example.com/logo.png"
            onChange={(e) => handleChange('companyLogo', e.target.value)}
          />
          {renderError('companyLogo')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Industry</label>
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
              onClick={() => setEmploymentTypeOpen((o) => !o)}
              style={{ width: '100%', justifyContent: 'space-between' }}
              aria-expanded={employmentTypeOpen}
            >
              <span className="truncate block">{(EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === (fields.employmentType || '')) || { label: 'Select employment type' }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {employmentTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                <ul>
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <li key={opt.value} className={(fields.employmentType || '') === opt.value ? 'selected' : ''} onClick={() => { handleChange('employmentType', opt.value); setEmploymentTypeOpen(false) }}>{opt.label}</li>
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
          <label className="tool-label">Expire date</label>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
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
              onClick={() => setCountryOpen((o) => !o)}
              style={{ width: '100%', justifyContent: 'space-between' }}
              aria-expanded={countryOpen}
            >
              <span className="truncate block" style={{ marginLeft: selectedCountryCode ? 30 : undefined }}>{(fields.country && COUNTRY_LIST.find((c) => c.code === fields.country)?.name) || (fields.country || 'Select country')}</span>
              <span className="text-xs">⏷</span>
            </button>

            {countryOpen && (
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
                  {COUNTRY_LIST.filter((c) => c.name.toLowerCase().includes((countrySearch || '').toLowerCase())).map((c) => (
                    <li key={c.code || c.name} className={(fields.country || '') === (c.code || '') ? 'selected' : ''} onClick={() => { handleChange('country', c.code || ''); setCountryOpen(false); setCountrySearch(''); setRegionCustomVisible(false) }}>
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError('country')}
        </div>

        <div className="tool-field">
          <label className="tool-label">State/Province/Region</label>
          {StateSelectComp && selectedCountryCode && !regionCustomVisible ? (
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
          ) : selectedCountryCode && STATES_BY_COUNTRY[selectedCountryCode] && !regionCustomVisible ? (
            <div className="custom-select-wrapper compact-select region-select-wrapper relative" style={{ width: '100%' }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setRegionOpen((o) => !o)}
                style={{ width: '100%', justifyContent: 'space-between' }}
                aria-expanded={regionOpen}
              >
                <span className="truncate block">{fields.region || 'Select state / region'}</span>
                <span className="text-xs">⏷</span>
              </button>

              {regionOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%', maxHeight: 260, overflow: 'auto' }}>
                  <div className="p-2">
                    <input type="text" className="tool-input" placeholder="Search region..." value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} />
                  </div>
                  <ul>
                    {STATES_BY_COUNTRY[selectedCountryCode].filter((s) => s.toLowerCase().includes((regionSearch || '').toLowerCase())).map((s) => (
                      <li key={s} className={(fields.region || '') === s ? 'selected' : ''} onClick={() => { handleChange('region', s); setRegionOpen(false) }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <input type="text" className="tool-input" value={fields.region || ''} placeholder="State / Region" onChange={(e) => handleChange('region', e.target.value)} />
          )}
          {renderError('region')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Postal code (optional)</label>
          <input type="text" className="tool-input" value={fields.postalCode || ''} placeholder="Postal code" onChange={(e) => handleChange('postalCode', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Min salary</label>
          <input type="text" className="tool-input" value={fields.minSalary || ''} placeholder="Min salary" onChange={(e) => handleChange('minSalary', e.target.value)} />
          {renderError('minSalary')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Max salary</label>
          <input type="text" className="tool-input" value={fields.maxSalary || ''} placeholder="Max salary" onChange={(e) => handleChange('maxSalary', e.target.value)} />
          {renderError('maxSalary')}
        </div>

        <div className="tool-field">
          <label className="tool-label">Currency / Period</label>
          <div className="flex gap-2">
            <div className="relative" style={{ flex: 1 }}>
              <button type="button" className="custom-select-trigger tool-select" onClick={() => setSalaryCurrencyOpen((o) => !o)} style={{ width: '100%', justifyContent: 'space-between' }} aria-expanded={salaryCurrencyOpen}>
                <span className="truncate block">{(fields.salaryCurrency && fields.salaryCurrency.trim()) ? (fields.salaryCurrency) : 'Select currency'}</span>
                <span className="text-xs">⏷</span>
              </button>
              {salaryCurrencyOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%', maxHeight: 260, overflow: 'auto' }}>
                  <div className="p-2"><input type="text" className="tool-input" placeholder="Search currency..." value={salaryCurrencySearch} onChange={(e) => setSalaryCurrencySearch(e.target.value)} /></div>
                  <ul>
                    {ALL_CURRENCIES.filter((c) => (c.code || '').toLowerCase().includes((salaryCurrencySearch || '').toLowerCase()) || (c.name || '').toLowerCase().includes((salaryCurrencySearch || '').toLowerCase())).map((c) => (
                      <li key={c.code} className={(fields.salaryCurrency || '') === (c.code || '') ? 'selected' : ''} onClick={() => { handleChange('salaryCurrency', c.code || ''); setSalaryCurrencyOpen(false); setSalaryCurrencySearch('') }}>{c.code}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative" style={{ width: 120 }}>
              <button type="button" className="custom-select-trigger tool-select" onClick={() => setSalaryUnitOpen((o) => !o)} style={{ width: '100%', justifyContent: 'space-between' }} aria-expanded={salaryUnitOpen}>
                <span className="truncate block">{(fields.salaryUnit && fields.salaryUnit.trim()) ? ((fields.salaryUnit || '').toUpperCase()) : 'Select period'}</span>
                <span className="text-xs">⏷</span>
              </button>
              {salaryUnitOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: '100%' }}>
                  <ul>
                    {SALARY_UNITS.map((u) => (
                      <li key={u} className={(fields.salaryUnit || '') === u ? 'selected' : ''} onClick={() => { handleChange('salaryUnit', u); setSalaryUnitOpen(false) }}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}