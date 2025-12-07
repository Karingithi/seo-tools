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
  minSalary?: string
  maxSalary?: string
  salaryCurrency?: string
  salaryUnit?: string
  hiringOrganizationSameAs?: string | string[]
  [k: string]: any
}

export type JobPostingFormProps = {
  fields: Partial<JobPostingFields>
  handleChange: (key: string, value: any) => void
  renderError?: (key?: string) => JSX.Element | null
  StateSelectComp?: ComponentType<StateProps> | null
  COUNTRY_LIST?: Array<{ code?: string; name: string }>
  STATES_BY_COUNTRY?: Record<string, string[]>
}

export default {} as any
