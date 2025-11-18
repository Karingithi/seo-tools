import { useEffect, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { CalendarDays } from "lucide-react"

type Props = {
  value?: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
}

export default function DatePickerInput({ value, onChange, placeholder, className }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (!value) return undefined
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
  })
  const idRef = useRef<string>(Math.random().toString(36).slice(2, 9))

  // sync when value prop changes externally
  useEffect(() => {
    if (!value) return setSelected(undefined)
    const d = new Date(value)
    if (!isNaN(d.getTime())) setSelected(d)
  }, [value])

  // Close when another datepicker opens
  useEffect(() => {
    const onOther = (e: Event) => {
      const ev = e as CustomEvent<string>
      if (ev.detail !== idRef.current) setOpen(false)
    }
    window.addEventListener("datepicker-open", onOther as EventListener)
    return () => window.removeEventListener("datepicker-open", onOther as EventListener)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!(e.target as Node) || wrapperRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const handleOpen = () => {
    // announce to others so they close
    window.dispatchEvent(new CustomEvent("datepicker-open", { detail: idRef.current }))
    setOpen((v) => !v)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <input
          type="text"
          readOnly
          onClick={handleOpen}
          value={value || ""}
          placeholder={placeholder}
          className="tool-input cursor-pointer pr-10"
        />
        <button
          type="button"
          aria-label="Toggle date picker"
          onClick={handleOpen}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white p-2 rounded shadow-lg">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (d instanceof Date) {
                setSelected(d)
                const iso = d.toISOString().slice(0, 10)
                onChange(iso)
              } else {
                setSelected(undefined)
                onChange("")
              }
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
