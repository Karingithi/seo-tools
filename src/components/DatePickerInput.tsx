import { useEffect, useRef, useState } from "react"
import { DayPicker, useNavigation } from "react-day-picker"

// Custom caption component for DayPicker: renders month and year using app custom-select markup
function CustomCaption(captionProps: any) {
  const { displayMonth, calendarMonth } = captionProps
  // DayPicker may pass either `displayMonth` (older) or `calendarMonth` (v9 MonthCaption)
  const display = displayMonth || calendarMonth || (captionProps && (captionProps.month || captionProps.date || captionProps.currentMonth))
  // Normalize to a Date instance robustly (handle Date | string | number | object)
  let displayDate: Date
  if (display instanceof Date) displayDate = display
  else if (typeof display === 'string' || typeof display === 'number') displayDate = new Date(display as any)
  else if (calendarMonth instanceof Date) displayDate = calendarMonth
  else displayDate = new Date()
  const { goToMonth } = useNavigation()
  const YEAR_START = 1900
  const YEAR_END = new Date().getFullYear()
  const monthNames = Array.from({ length: 12 }).map((_, i) => new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(2020, i, 1)))

  const [monthOpen, setMonthOpen] = useState(false)
  const captionRef = useRef<HTMLDivElement | null>(null)
  const monthListRef = useRef<HTMLDivElement | null>(null)
  const [monthFocusIdx, setMonthFocusIdx] = useState<number | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!captionRef.current) return
      if ((e.target as Node) && captionRef.current.contains(e.target as Node)) return
      setMonthOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  // year is permanently visible now; no open/close handling required

  useEffect(() => {
    if (monthOpen && monthListRef.current) {
      const sel = monthListRef.current.querySelector('.custom-select-item.selected') as HTMLElement | null
      if (sel) { sel.focus(); const idx = Array.from(monthListRef.current.querySelectorAll('.custom-select-item')).indexOf(sel); setMonthFocusIdx(idx >= 0 ? idx : 0) }
      else { const first = monthListRef.current.querySelector('.custom-select-item') as HTMLElement | null; if (first) { first.focus(); setMonthFocusIdx(0) } }
    } else {
      setMonthFocusIdx(null)
    }
  }, [monthOpen, display])

  const years: number[] = []
  for (let y = YEAR_END; y >= YEAR_START; y--) years.push(y)

  // Year input keyboard handling (ArrowUp/Down to increment/decrement)
  const onYearInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const cur = displayDate.getFullYear()
      const next = e.key === 'ArrowUp' ? Math.min(cur + 1, YEAR_END) : Math.max(cur - 1, YEAR_START)
      goToMonth(new Date(next, displayDate.getMonth(), 1))
    }
  }

  const onMonthKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!monthListRef.current) return
    const items = Array.from(monthListRef.current.querySelectorAll('.custom-select-item')) as HTMLElement[]
    if (!items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (monthFocusIdx === null ? 0 : Math.min(monthFocusIdx + 1, items.length - 1))
      items[next].focus(); setMonthFocusIdx(next)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (monthFocusIdx === null ? 0 : Math.max(monthFocusIdx - 1, 0))
      items[prev].focus(); setMonthFocusIdx(prev)
    } else if (e.key === 'Enter') {
      e.preventDefault(); const sel = items[monthFocusIdx ?? 0]; sel && sel.click()
    } else if (e.key === 'Escape') {
      e.preventDefault(); setMonthOpen(false)
    }
  }

  return (
    <div ref={captionRef} className="rdp-caption custom-caption" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div className="custom-select-wrapper datepicker-month-wrapper relative" style={{ minWidth: 160 }}>
        <button type="button" className="custom-select-trigger tool-select" onClick={(e) => { e.stopPropagation(); setMonthOpen((v) => !v); }} aria-expanded={monthOpen}>
          <div>{monthNames[displayDate.getMonth()]}</div>
          <span className="text-xs">⏷</span>
        </button>
        {monthOpen && (
          <div ref={monthListRef} className="custom-select-list" role="listbox" tabIndex={0} onKeyDown={onMonthKey}>
            {monthNames.map((m, idx) => (
              <div key={m} tabIndex={-1} className={`custom-select-item ${idx === displayDate.getMonth() ? 'selected' : ''}`} onClick={() => { goToMonth(new Date(displayDate.getFullYear(), idx, 1)); setMonthOpen(false) }}>{m}</div>
            ))}
          </div>
        )}
      </div>

      <div className="custom-select-wrapper datepicker-year-wrapper relative" style={{ minWidth: 110 }}>
        <div className="custom-select-trigger tool-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
            className="year-input"
            type="number"
            min={YEAR_START}
            max={YEAR_END}
              value={displayDate.getFullYear()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onYearInputKey}
            onChange={(e) => {
              const v = Number(e.target.value || displayDate.getFullYear())
              if (!isNaN(v)) goToMonth(new Date(Math.min(Math.max(v, YEAR_START), YEAR_END), displayDate.getMonth(), 1))
            }}
            aria-label="Year"
            style={{ width: 72, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 14, fontWeight: 500 }}
          />
        </div>
      </div>
    </div>
  )
}
import "react-day-picker/dist/style.css"
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
  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (!value) return undefined
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
  })
  const idRef = useRef<string>(Math.random().toString(36).slice(2, 9))
  // yearOpen state removed; using built-in caption dropdown

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
          {/* Custom caption to render styled month + year controls using app's custom-select markup */}
          {
            /* Year range */
          }
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            numberOfMonths={1}
            fromYear={1900}
            toYear={new Date().getFullYear()}
            // Use MonthCaption to customize the month caption area
            // @ts-ignore - react-day-picker types are strict about CustomComponents
            components={{ MonthCaption: CustomCaption } as any}
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
