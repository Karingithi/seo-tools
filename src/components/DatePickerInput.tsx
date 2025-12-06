import { useEffect, useRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CalendarDays } from "lucide-react"

type Props = {
  value?: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function DatePickerInput({ value, onChange, placeholder, className, disabled }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | null>(() => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  })
  const idRef = useRef<string>(Math.random().toString(36).slice(2, 9))
  // yearOpen state removed; using built-in caption dropdown

  // sync when value prop changes externally
  useEffect(() => {
    if (!value) return setSelected(null)
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
    if (disabled) return
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
          className={`tool-input ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} pr-10`}
        />
        <button
          type="button"
          aria-label="Toggle date picker"
          onClick={handleOpen}
          disabled={disabled}
          aria-disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white p-2 shadow-lg date-picker-popup">
          <ReactDatePicker
            selected={selected}
            onChange={(d: Date | null) => {
              setSelected(d)
              if (d instanceof Date && !isNaN(d.getTime())) {
                onChange(d.toISOString().slice(0, 10))
              } else {
                onChange("")
              }
              setOpen(false)
            }}
            inline
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            minDate={new Date(1900, 0, 1)}
            maxDate={new Date()}
          />
        </div>
      )}
    </div>
  )
}
