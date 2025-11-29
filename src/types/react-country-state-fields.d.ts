declare module 'react-country-state-fields' {
  import * as React from 'react'

  export interface CountryProps {
    className?: string
    value?: string
    onChange?: (value: string | React.ChangeEvent<any>) => void
    name?: string
    id?: string
    disabled?: boolean
    placeholder?: string
    // allow any additional props since package implementations may vary
    [key: string]: any
  }

  export interface StateProps {
    className?: string
    country?: string // ISO2 code or country name
    countryCode?: string
    value?: string
    onChange?: (value: string | React.ChangeEvent<any>) => void
    name?: string
    id?: string
    disabled?: boolean
    placeholder?: string
    [key: string]: any
  }

  export const Country: React.ComponentType<CountryProps>
  export const State: React.ComponentType<StateProps>

  const _default: { Country: typeof Country; State: typeof State }
  export default _default
}
