import { useEffect, useRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [monthOpen, setMonthOpen] = useState(false)
  const [yearOpen, setYearOpen] = useState(false)

  const selectedInit = () => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  const [selected, setSelected] = useState<Date | null>(selectedInit)

  const MONTHS_FULL = [
    "January","February","March","April","May",
    "June","July","August","September","October","November","December"
  ]
  const YEARS = Array.from({ length: 126 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    if (!value) return setSelected(null)
    const d = new Date(value)
    if (!isNaN(d.getTime())) setSelected(d)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (wrapperRef.current.contains(e.target as Node)) return
      setOpen(false)
      setMonthOpen(false)
      setYearOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    setOpen(v => !v)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <style>{`
        .react-datepicker,
        .react-datepicker * {
          font-family: 'DM Sans', ui-sans-serif, system-ui;
        }

        .react-datepicker {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .date-picker-popup {
          border-radius: 8px !important;
          overflow: hidden;
        }

        .react-datepicker__triangle { display: none !important; }

        /* Final header style */
        .react-datepicker__header {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: var(--primary, #ffc50c) !important;
          border-bottom: none !important;
          position: relative !important;
          min-height: 48px !important;
          padding: 0 !important; /* Remove left-right spacing */
          width: 100% !important; /* Aligns with grid */
          margin: 0 auto !important;
        }

        .react-datepicker__header--custom {
          background: var(--primary, #ffc50c) !important;
          box-shadow: none !important;
        }

        .react-datepicker__navigation {
          width: 32px !important;
          height: 32px !important;
          background: transparent !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        .react-datepicker__navigation--previous { left: 0px !important; }
        .react-datepicker__navigation--next { right: 0px !important; }

        /* Custom dropdown styles */
        .dropdown-trigger {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--secondary, #070026);
          justify-content: center;
        }
        .dropdown-trigger span { display: inline-block; line-height: 1; transform: translateY(1px); }
        .dropdown-trigger--month { min-width: 160px; }
        .dropdown-trigger--year { min-width: 96px; margin-right: 12px; padding-right: 6px; }
        .dropdown-menu {
          position: absolute;
          top: 42px;
          z-index: 200;
          background: white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          border-radius: 8px;
          padding: 4px;
          display: flex;
          flex-direction: column;
          max-height: 180px;
          overflow-y: auto;
          min-width: 120px; /* ensure dropdown is wide enough */
          width: max-content;
          /* ensure dropdowns don't sit flush against the popup edges */
          left: 0 !important;
          transform: translateX(8px) !important;
        }

        /* Larger scrollable area specifically for the years dropdown */
        .dropdown-menu--years {
          max-height: 180px !important;
          min-width: 85px !important;
        }
        .dropdown-menu--months {
          min-width: 100px !important;
        }
        .dropdown-item {
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 4px;
        }
        .dropdown-item:hover {
          background: var(--primary, #ffc50c);
        }
        .dropdown-item.selected {
          background: var(--primary, #ffc50c);
          font-weight: 600;
        }
        
        /* Scrollbar styling for dropdown menus */
        .dropdown-menu {
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(15,23,42,0.24) transparent; /* thumb, track */
        }
        .dropdown-menu::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .dropdown-menu::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 8px;
        }
        .dropdown-menu::-webkit-scrollbar-thumb {
          background: rgba(15,23,42,0.16);
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        /* Out-of-month days: make them muted but clickable */
        .react-datepicker__day--outside-month,
        .react-datepicker__day--other-month {
          color: var(--muted-text, #9ca3af) !important;
          opacity: 0.6 !important;
          background: transparent !important;
        }
        
        /* Future dates: make them faint but clickable */
        .react-datepicker__day--disabled {
          color: var(--muted-text, #9ca3af) !important;
          opacity: 0.5 !important;
          background: transparent !important;
          cursor: pointer !important;
          pointer-events: auto !important;
        }
        
        .react-datepicker__day--disabled:hover {
          background: rgba(255, 197, 12, 0.2) !important;
        }
        
        /* Optionally hide them entirely by uncommenting:
        .react-datepicker__day--outside-month,
        .react-datepicker__day--other-month { display: none !important; }
        */
      `}</style>

      <div className="relative">
        <input
          type="text"
          readOnly
          onClick={handleOpen}
          value={value || ""}
          placeholder={placeholder}
          className={`tool-input pr-10 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        />
        <button
          type="button"
          aria-label="Toggle"
          onClick={handleOpen}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white shadow-lg date-picker-popup">
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
            minDate={new Date(1900, 0, 1)}
            maxDate={undefined}
            filterDate={(_date) => {
              // Allow all dates to be selected
              return true
            }}
            renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
              <div className="react-datepicker__header react-datepicker__header--custom">

                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="react-datepicker__navigation react-datepicker__navigation--previous"
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* Month dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="dropdown-trigger dropdown-trigger--month"
                      onClick={() => { setMonthOpen(v => !v); setYearOpen(false); }}
                    >
                      {MONTHS_FULL[date.getMonth()]}
                      <span>▾</span>
                    </button>
                    {monthOpen && (
                      <div className="dropdown-menu dropdown-menu--months">
                        {MONTHS_FULL.map((m, i) => (
                          <div
                            key={m}
                            className={`dropdown-item ${i === date.getMonth() ? "selected" : ""}`}
                            onClick={() => { changeMonth(i); setMonthOpen(false); }}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Year dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="dropdown-trigger dropdown-trigger--year"
                      onClick={() => { setYearOpen(v => !v); setMonthOpen(false); }}
                    >
                      {date.getFullYear()}
                      <span>▾</span>
                    </button>
                    {yearOpen && (
                      <div className="dropdown-menu dropdown-menu--years">
                        {YEARS.map((y) => (
                          <div
                            key={y}
                            className={`dropdown-item ${y === date.getFullYear() ? "selected" : ""}`}
                            onClick={() => { changeYear(y); setYearOpen(false); }}
                          >
                            {y}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="react-datepicker__navigation react-datepicker__navigation--next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
