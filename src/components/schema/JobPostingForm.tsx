export type JobPostingFields = { [k: string]: any }

export type JobPostingFormProps = {
  fields: Partial<JobPostingFields>
  handleChange: (key: string, value: string) => void
  renderError?: (key?: string) => JSX.Element | null
}

export default function JobPostingForm(_: JobPostingFormProps): JSX.Element {
  return <div />
}