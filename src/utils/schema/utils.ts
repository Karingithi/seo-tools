export const normalizeUrl = (v?: string): string | undefined => {
  if (!v) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  try {
    // if valid absolute URL, return as-is
    new URL(s)
    return s
  } catch {
    // try to prepend https:// and validate
    try {
      const candidate = `https://${s}`
      new URL(candidate)
      return candidate
    } catch {
      return undefined
    }
  }
}

export const toNumber = (v?: string): number | undefined => {
  if (v == null) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

export const normalizeDate = (v?: string): string | undefined => {
  if (!v) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  // basic yyyy-mm-dd validation
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return undefined
}

export const compact = (obj: any): any => {
  if (obj == null) return obj
  if (Array.isArray(obj)) return obj.map(compact).filter((x) => !(x == null || (typeof x === 'string' && x.trim() === '') || (Array.isArray(x) && x.length === 0)))
  if (typeof obj !== 'object') return obj
  const out: any = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v == null) return
    if (typeof v === 'string' && v.trim() === '') return
    if (Array.isArray(v) && v.length === 0) return
    const c = compact(v)
    if (c == null) return
    if (typeof c === 'string' && c.trim() === '') return
    if (Array.isArray(c) && c.length === 0) return
    out[k] = c
  })
  return out
}
