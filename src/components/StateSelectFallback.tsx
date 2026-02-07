import React from "react"
import * as countryRegionData from "country-region-data"
import type { StateProps } from "../types/state"

export default function StateSelectFallback({ className, country, countryCode, value, onChange }: StateProps) {
  const code = countryCode || country
  let regions: string[] = []
  if (code) {
    const raw: any = (countryRegionData as any)
    let dataArr: any[] = []

    if (Array.isArray(raw)) {
      dataArr = raw
    } else if (Array.isArray(raw.default)) {
      dataArr = raw.default
    } else if (raw && typeof raw === 'object') {
      // Try to coerce object shapes into an array of entries
      const vals = raw.default || raw
      if (Array.isArray(vals)) dataArr = vals
      else if (vals && typeof vals === 'object') dataArr = Object.values(vals).filter((v: any) => v && (v.countryShortCode || v.countryName))
    }

    if (dataArr && dataArr.length) {
      const found: any = dataArr.find((c: any) => c && (c.countryShortCode === code || c.countryName === code))
      if (found && Array.isArray(found.regions)) {
        regions = found.regions.map((r: any) => r.name)
      }
    }
  }

  const handle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <select className={className} value={value || ""} onChange={handle}>
      <option value="">Select region</option>
      {regions.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
      <option value="__other__">Other</option>
    </select>
  )
}
