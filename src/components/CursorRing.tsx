import { useEffect, useRef } from "react"

export default function CursorRing() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const target = useRef({ x: 0, y: 0, visible: false })
  const current = useRef({ x: 0, y: 0 })
  const targetScale = useRef(1)
  const currentScale = useRef(1)

  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      ring.style.display = "none"
      return
    }

    const ease = 0.18
    const scaleEase = 0.2

    const update = () => {
      const { x, y, visible } = target.current
      current.current.x += (x - current.current.x) * ease
      current.current.y += (y - current.current.y) * ease
      currentScale.current += (targetScale.current - currentScale.current) * scaleEase
      if (visible) {
        ring.style.opacity = "1"
        ring.style.setProperty("--cursor-x", `${current.current.x}px`)
        ring.style.setProperty("--cursor-y", `${current.current.y}px`)
        ring.style.setProperty("--cursor-scale", `${currentScale.current}`)
      } else {
        ring.style.opacity = "0"
      }
      rafRef.current = requestAnimationFrame(update)
    }

    const handleMove = (event: PointerEvent) => {
      target.current.x = event.clientX
      target.current.y = event.clientY
      target.current.visible = true
    }

    const handleLeave = () => {
      target.current.visible = false
    }

    const isInteractive = (el: HTMLElement | null) =>
      Boolean(el?.closest("a, button, [role='button'], [data-cursor='link']"))

    const handleOver = (event: PointerEvent) => {
      const el = event.target as HTMLElement | null
      if (isInteractive(el)) {
        targetScale.current = 1.5
      }
    }

    const handleOut = (event: PointerEvent) => {
      const el = event.target as HTMLElement | null
      if (isInteractive(el)) {
        targetScale.current = 1
      }
    }

    window.addEventListener("pointermove", handleMove, { passive: true })
    window.addEventListener("pointerdown", handleMove, { passive: true })
    window.addEventListener("pointerleave", handleLeave)
    window.addEventListener("blur", handleLeave)
    document.addEventListener("pointerover", handleOver, { passive: true })
    document.addEventListener("pointerout", handleOut, { passive: true })

    rafRef.current = requestAnimationFrame(update)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerdown", handleMove)
      window.removeEventListener("pointerleave", handleLeave)
      window.removeEventListener("blur", handleLeave)
      document.removeEventListener("pointerover", handleOver)
      document.removeEventListener("pointerout", handleOut)
    }
  }, [])

  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
}
