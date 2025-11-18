export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let t: number | undefined
  const debounced = ((...args: Parameters<T>) => {
    window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), delay)
  }) as T & { cancel: () => void }
  debounced.cancel = () => window.clearTimeout(t)
  return debounced
}