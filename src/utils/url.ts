export function isValidUrl(value: string): boolean {
  try {
    // Allow http/https only for tools
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}