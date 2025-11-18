export const ensureLeadingSlash = (s: string) => (s?.trim().startsWith("/") ? s.trim() : `/${s?.trim()}`)
export const truncate = (s: string, max = 160) => (s.length <= max ? s : `${s.slice(0, max - 1)}…`)
export const uniq = <T>(arr: T[]) => Array.from(new Set(arr))