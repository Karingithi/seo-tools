import { useState, useRef, useEffect } from "react"
import DatePickerInput from "../DatePickerInput"
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

type Props = any

export default function EventForm(props: Props): JSX.Element {
  const p: any = props
  const {
    fields,
    handleChange,
    renderError,
    eventStatusOpen,
    setEventStatusOpen,
    attendanceModeOpen,
    setAttendanceModeOpen,
    performerTypeOpen,
    setPerformerTypeOpen,
    PERFORMER_TYPES,
    EVENT_STATUSES,
    ATTENDANCE_MODES,
    timezoneOpen,
    setTimezoneOpen,
    timezoneSearch,
    setTimezoneSearch,
    TIMEZONES,
    getTimezoneOffsetMinutes,
    formatGmtOffset,
    organizerTypeOpen,
    setOrganizerTypeOpen,
    ORGANIZER_TYPES,
    STATES_BY_COUNTRY,
    // Ticket controls
    ticketTypes,
    addTicketType,
    ticketDefaultCurrency,
    setTicketDefaultCurrency,
    ticketDefaultCurrencyOpen,
    setTicketDefaultCurrencyOpen,
    ticketCurrencySearch,
    setTicketCurrencySearch,
    ALL_CURRENCIES,
    updateTicketType,
    removeTicketType,
    ticketAvailabilityOpenIndex,
    setTicketAvailabilityOpenIndex,
    TICKET_AVAILABILITY_OPTIONS,
  } = p

  const [eventSubtypeOpen, setEventSubtypeOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const countryWrapperRef = useRef<HTMLDivElement | null>(null)
  const [venueRegionOpen, setVenueRegionOpen] = useState(false)
  const [venueRegionSearch, setVenueRegionSearch] = useState("")

  const normalizeUrl = (raw?: string) => {
    const v = (raw || "").trim()
    if (!v) return ""
    try {
      const u = new URL(v)
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
    } catch {
      // try adding https:// as a convenience
      try {
        const u2 = new URL(`https://${v}`)
        if (u2.protocol === 'http:' || u2.protocol === 'https:') return u2.toString()
      } catch {
        return v
      }
    }
    return v
  }

  const handleBlurUrl = (key: string, raw: string) => {
    const norm = normalizeUrl(raw)
    // Only update if normalization changed the value
    if (norm !== (raw || "").trim()) handleChange(key, norm)
  }

  countries.registerLocale(enLocale)
  const COUNTRY_LIST = Object.entries((countries.getNames('en', { select: 'official' }) || {}) as Record<string, string>).map(([code, name]) => ({ code, name }))

  const getSelectedCountryCode = (countryVal?: string) => {
    if (!countryVal) return undefined
    // If already a 2-letter code (any case), normalize to upper-case
    if (/^[A-Za-z]{2}$/.test(countryVal)) return countryVal.toUpperCase()

    // Try to find in prebuilt country list first (matches code or name)
    const found = COUNTRY_LIST.find(c => c.code.toLowerCase() === (countryVal || '').toLowerCase() || c.name.toLowerCase() === (countryVal || '').toLowerCase())
    if (found) return found.code

    // Otherwise try the i18n helper as a last resort
    try {
      const code = countries.getAlpha2Code(countryVal, 'en')
      return code || undefined
    } catch {
      return undefined
    }
  }

  const selectedVenueCountryCode = getSelectedCountryCode(fields.venueCountry)
  const hasVenueRegions = !!(selectedVenueCountryCode && STATES_BY_COUNTRY && STATES_BY_COUNTRY[selectedVenueCountryCode] && STATES_BY_COUNTRY[selectedVenueCountryCode].length)

  const EVENT_SUBTYPES = [
    { value: "", label: "(not specified)" },
    { value: "BusinessEvent", label: "Business Event" },
    { value: "ChildrensEvent", label: "Childrens Event" },
    { value: "ComedyEvent", label: "Comedy Event" },
    { value: "ConferenceEvent", label: "Conference Event" },
    { value: "CourseInstance", label: "Course Instance" },
    { value: "DanceEvent", label: "Dance Event" },
    { value: "DeliveryEvent", label: "Delivery Event" },
    { value: "EducationEvent", label: "Education Event" },
    { value: "EventSeries", label: "Event Series" },
    { value: "ExhibitionEvent", label: "Exhibition Event" },
    { value: "Festival", label: "Festival" },
    { value: "FoodEvent", label: "Food Event" },
    { value: "Hackathon", label: "Hackathon" },
    { value: "LiteraryEvent", label: "Literary Event" },
    { value: "MusicEvent", label: "Music Event" },
    { value: "PerformingArtsEvent", label: "Performing Arts Event" },
    { value: "PublicationEvent", label: "Publication Event" },
    { value: "SaleEvent", label: "Sale Event" },
    { value: "ScreeningEvent", label: "Screening Event" },
    { value: "SocialEvent", label: "Social Event" },
    { value: "SportsEvent", label: "Sports Event" },
    { value: "TheaterEvent", label: "Theater Event" },
    { value: "VisualArtsEvent", label: "Visual Arts Event" },
  ]

  const EVENT_SUBTYPE_DESCRIPTIONS: Record<string, string> = {
    BusinessEvent: "Professional networking and trade gathering",
    ChildrensEvent: "Fun activities for young kids",
    ComedyEvent: "Live performances focused on humor",
    ConferenceEvent: "Experts meet to share insights",
    CourseInstance: "Scheduled class within a course",
    DanceEvent: "Social or performance dance gathering",
    DeliveryEvent: "Goods arrival to the recipient",
    EducationEvent: "Activities focused on learning skills",
    EventSeries: "Recurring related events over time",
    ExhibitionEvent: "Public display of products or art",
    Festival: "Large celebration with diverse activities",
    FoodEvent: "Tasting and exploring different foods",
    Hackathon: "Team coding challenge against time",
    LiteraryEvent: "Events celebrating books and writing",
    MusicEvent: "Live performances featuring music",
    PerformingArtsEvent: "Live creative stage art performances",
    PublicationEvent: "Official release of published work",
    SaleEvent: "Products sold at promotional prices",
    ScreeningEvent: "Showing films before an audience",
    SocialEvent: "People meet and interact socially",
    SportsEvent: "Competitive games or athletic activities",
    TheaterEvent: "Dramatic performances on the stage",
    VisualArtsEvent: "Showcasing art for public viewing",
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!eventSubtypeOpen) return
      const target = e.target as Node | null
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setEventSubtypeOpen(false)
      }
    }

    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [eventSubtypeOpen])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!countryOpen) return
      const target = e.target as Node | null
      if (countryWrapperRef.current && target && !countryWrapperRef.current.contains(target)) {
        setCountryOpen(false)
      }
    }

    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [countryOpen])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">More specific Event @type</label>
            <div ref={wrapperRef} className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={() => setEventSubtypeOpen((o) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
              aria-expanded={eventSubtypeOpen}
            >
              <span className="truncate block">{(EVENT_SUBTYPES.find((s) => s.value === (fields.eventSubtype || "")) || { label: "(not specified)" }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {eventSubtypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {EVENT_SUBTYPES.map((s) => (
                    <li key={s.value} className={(fields.eventSubtype || "") === s.value ? "selected" : ""} onClick={() => { handleChange("eventSubtype", s.value); setEventSubtypeOpen(false) }}>
                      <div className="font-semibold text-[15px]">{s.label}</div>
                      <div className="text-[13px] text-gray-500">{EVENT_SUBTYPE_DESCRIPTIONS[s.value] ?? ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError("eventSubtype")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Name</label>
          <input
            type="text"
            className="tool-input"
            value={fields.name || ""}
            placeholder="Event name"
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {renderError("name")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="tool-field">
          <label className="tool-label">Event's description</label>
          <textarea
            className="tool-textarea"
            rows={4}
            value={fields.description || ""}
            placeholder="Short event description"
            onChange={(e) => handleChange("description", e.target.value)}
          />
          {renderError("description")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Image</label>
          <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/image.jpg, https://example.com/image2.jpg" onChange={(e) => handleChange("image", e.target.value)} onBlur={(e) => handleBlurUrl('image', e.target.value)} />
          {renderError("image")}
          <div className="text-xs text-gray-500 mt-1">Separate multiple image URLs with commas.</div>
        </div>
      </div>

        {/* Event Status + Attendance Mode moved below End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Start Date</label>
          <DatePickerInput value={fields.startDate} onChange={(iso: any) => handleChange("startDate", iso)} placeholder="Start date" />
          {renderError("startDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Start Time (e.g. 08:00)</label>
          <input type="text" className="tool-input" value={fields.startTime || ""} placeholder="08:00" onChange={(e) => handleChange("startTime", e.target.value)} />
          {renderError("startTime")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">End Date</label>
          <DatePickerInput value={fields.endDate} onChange={(iso: any) => handleChange("endDate", iso)} placeholder="End date" />
          {renderError("endDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">End Time (e.g. 17:30)</label>
          <input type="text" className="tool-input" value={fields.endTime || ""} placeholder="17:30" onChange={(e) => handleChange("endTime", e.target.value)} />
          {renderError("endTime")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Event Status</label>
          <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={() => setEventStatusOpen((o: any) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
              aria-expanded={eventStatusOpen}
            >
              <span className="truncate block">{(EVENT_STATUSES.find((s: any) => s.value === (fields.eventStatus || "")) || { label: "Select status" }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {eventStatusOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {EVENT_STATUSES.map((s: any) => (
                    <li key={s.value} className={(fields.eventStatus || "") === s.value ? "selected" : ""} onClick={() => { handleChange("eventStatus", s.value); setEventStatusOpen(false) }}>
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">Attendance Mode</label>
          <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={() => setAttendanceModeOpen((o: any) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
              aria-expanded={attendanceModeOpen}
            >
              <span className="truncate block">{(ATTENDANCE_MODES.find((m: any) => m.value === (fields.attendanceMode || "")) || { label: "Select mode" }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {attendanceModeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {ATTENDANCE_MODES.map((m: any) => (
                    <li key={m.value} className={(fields.attendanceMode || "") === m.value ? "selected" : ""} onClick={() => { handleChange("attendanceMode", m.value); setAttendanceModeOpen(false) }}>
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      
      

      

      <>
        {/* Stream URL + Timezone (show for Online & Mixed, hide for Offline) */}
        {fields.attendanceMode !== '' && fields.attendanceMode !== 'OfflineEventAttendanceMode' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="tool-field">
              <label className="tool-label">Stream URL</label>
              <input type="text" className="tool-input" value={fields.streamUrl || ""} placeholder="https://example.com/stream" onChange={(e) => handleChange("streamUrl", e.target.value)} />
              {renderError("streamUrl")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Timezone</label>
              <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
                <button
                  type="button"
                  className="custom-select-trigger tool-select"
                  onClick={() => setTimezoneOpen((o: any) => !o)}
                  style={{ width: "100%", justifyContent: "space-between" }}
                  aria-expanded={timezoneOpen}
                >
                  <span className="truncate block">{fields.timezone || "Timezone"}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {timezoneOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                    <div className="p-2">
                      <input
                        type="text"
                        className="tool-input"
                        placeholder="Filter timezone..."
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {TIMEZONES.filter((t: any) => t.toLowerCase().includes((timezoneSearch || "").toLowerCase())).map((tz: any) => (
                        <li key={tz} className={(fields.timezone || "") === tz ? "selected" : ""} onClick={() => { handleChange("timezone", tz); setTimezoneOpen(false) }}>{tz} <span className="text-[13px] text-gray-500">{formatGmtOffset(getTimezoneOffsetMinutes(tz))}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>

      

      {fields.attendanceMode !== '' && (
        <>
          {fields.attendanceMode !== 'OnlineEventAttendanceMode' && (
            <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tool-field">
              <label className="tool-label">Venue Name</label>
              <input type="text" className="tool-input" value={fields.venueName || ""} placeholder="Venue name" onChange={(e) => handleChange("venueName", e.target.value)} />
              {renderError("venueName")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Street</label>
              <input type="text" className="tool-input" value={fields.venueStreet || ""} placeholder="Street address" onChange={(e) => handleChange("venueStreet", e.target.value)} />
              {renderError("venueStreet")}
            </div>
            
              <div className="tool-field">
                <label className="tool-label">City</label>
                <input type="text" className="tool-input" value={fields.venueCity || ""} placeholder="City" onChange={(e) => handleChange("venueCity", e.target.value)} />
                {renderError("venueCity")}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tool-field">
              <label className="tool-label">State / Province / Region</label>
              <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
                <button
                  type="button"
                  className={`custom-select-trigger tool-select ${!hasVenueRegions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => hasVenueRegions && setVenueRegionOpen((o) => !o)}
                  style={{ width: "100%", justifyContent: "space-between" }}
                  aria-expanded={venueRegionOpen}
                  disabled={!hasVenueRegions}
                >
                  <span className="truncate block">{selectedVenueCountryCode ? (STATES_BY_COUNTRY[selectedVenueCountryCode] || []).find((s: any) => s === (fields.venueRegion || "")) || 'Select region' : 'Select region'}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {venueRegionOpen && hasVenueRegions && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: 'auto' }}>
                    <div className="p-2">
                      <input type="text" className="tool-input" placeholder="Filter region..." value={venueRegionSearch} onChange={(e) => setVenueRegionSearch(e.target.value)} />
                    </div>
                    <ul>
                      {(STATES_BY_COUNTRY[selectedVenueCountryCode] || []).filter((s: any) => s.toLowerCase().includes((venueRegionSearch || '').toLowerCase())).map((s: any) => (
                        <li key={s} className={(fields.venueRegion || "") === s ? 'selected' : ''} onMouseDown={(e) => { e.stopPropagation(); }} onClick={() => { handleChange('venueRegion', s); setVenueRegionOpen(false); setVenueRegionSearch('') }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {renderError("venueRegion")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Zip code</label>
              <input type="text" className="tool-input" value={fields.venuePostalCode || ""} placeholder="Postal code" onChange={(e) => handleChange("venuePostalCode", e.target.value)} />
              {renderError("venuePostalCode")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Country</label>
              <div ref={countryWrapperRef} className="custom-select-wrapper country-select-wrapper relative" style={{ width: "100%" }}>
                <button type="button" className="custom-select-trigger tool-select" onClick={() => setCountryOpen((o) => !o)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={countryOpen}>
                  <span className="truncate block">{(() => {
                    const sel = COUNTRY_LIST.find((c) => c.code === fields.venueCountry)
                    return sel ? `${sel.name} (${sel.code})` : (fields.venueCountry || 'Select country')
                  })()}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {countryOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: 'auto' }}>
                    <div className="p-2">
                      <input type="text" className="tool-input" placeholder="Filter country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                    </div>
                    <ul>
                      {COUNTRY_LIST.filter(c => {
                        const q = (countrySearch || '').toLowerCase()
                        return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
                      }).map((c) => (
                        <li key={c.code} className={(fields.venueCountry || '') === c.code ? 'selected' : ''} onClick={() => { handleChange('venueCountry', c.code); setCountryOpen(false); setCountrySearch('') }}>
                          <div className="truncate">{c.name} <span className="text-[13px] text-gray-500">({c.code})</span></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {renderError("venueCountry")}
              </div>
              </div>
              </>
            )}

            

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="tool-field">
              <label className="tool-label">Performer @type</label>
              <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
                <button
                  type="button"
                  className="custom-select-trigger tool-select"
                  onClick={() => setPerformerTypeOpen((o: any) => !o)}
                  style={{ width: "100%", justifyContent: "space-between" }}
                  aria-expanded={performerTypeOpen}
                >
                  <span className="truncate block">{(PERFORMER_TYPES.find((s: any) => s.value === (fields.performerType || "")) || { label: "Select type" }).label}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {performerTypeOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                    <ul>
                      {PERFORMER_TYPES.map((s: any) => (
                        <li key={s.value} className={(fields.performerType || "") === s.value ? "selected" : ""} onClick={() => { handleChange("performerType", s.value); setPerformerTypeOpen(false) }}>
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {renderError("performerType")}
            </div>

            <div className="tool-field">
              <label className="tool-label">Performer name</label>
              <input type="text" className="tool-input" value={fields.performerName || ""} placeholder="Performer name" onChange={(e) => handleChange("performerName", e.target.value)} />
              {renderError("performerName")}
            </div>
          </div>
        </>
      )}

      {/* Instruction below all fields */}
      <div className="mt-2">
        <div className="text-sm text-gray-600">Add an offer for each ticket type (e.g. "General admission", "Reserved seating", "VIP Package", etc.).</div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <div>
            <button type="button" className="action-btn w-full" onClick={() => addTicketType?.()}>
              Add Ticket Type
            </button>
          </div>

          <div>
            <label className="tool-label">Currency</label>
            <div className="custom-select-wrapper compact-select howto-currency-wrapper relative" style={{ minWidth: 140, marginBottom: 0 }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setTicketDefaultCurrencyOpen && setTicketDefaultCurrencyOpen((o: any) => !o)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={ticketDefaultCurrencyOpen}
              >
                <span className="truncate block">{(ticketDefaultCurrency && ticketDefaultCurrency.trim()) ? `${ticketDefaultCurrency} - ${(ALL_CURRENCIES?.find((c: any) => c.code === ticketDefaultCurrency) || { name: "" }).name}` : "Currency"}</span>
                <span className="text-xs">⏷</span>
              </button>

              {ticketDefaultCurrencyOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                  <div className="p-2">
                    <input
                      type="text"
                      className="tool-input"
                      placeholder="Search currency..."
                      value={ticketCurrencySearch || ""}
                      onChange={(e) => setTicketCurrencySearch && setTicketCurrencySearch(e.target.value)}
                    />
                  </div>
                  <ul>
                    {(ALL_CURRENCIES || []).filter((c: any) => (`${c.code} ${c.name}`).toLowerCase().includes((ticketCurrencySearch || "").toLowerCase())).map((c: any) => (
                      <li key={c.code} className={(ticketDefaultCurrency || "") === c.code ? "selected" : ""} onClick={() => { setTicketDefaultCurrency && setTicketDefaultCurrency(c.code); setTicketDefaultCurrencyOpen && setTicketDefaultCurrencyOpen(false); setTicketCurrencySearch && setTicketCurrencySearch("") }}>
                        {c.code} - {c.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Ticket types repeater */}
      <div>
        {ticketTypes && ticketTypes.length ? (
          <div className="flex flex-col gap-3">
            {ticketTypes.map((t: any, idx: number) => (
              <div key={`ticket-${idx}`} className="rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="tool-field">
                    <label className="tool-label">Name</label>
                    <input type="text" className="tool-input" value={t.name || ""} placeholder="Ticket name (e.g. General admission)" onChange={(e) => updateTicketType && updateTicketType(idx, "name", e.target.value)} />
                  </div>

                  <div className="tool-field">
                    <label className="tool-label">Price</label>
                    <input type="text" className="tool-input" value={t.price || ""} placeholder="Price" onChange={(e) => updateTicketType && updateTicketType(idx, "price", e.target.value)} />
                  </div>

                  <div className="tool-field">
                    <label className="tool-label">Available from</label>
                    <DatePickerInput value={t.availableFrom} onChange={(iso: any) => updateTicketType && updateTicketType(idx, "availableFrom", iso)} placeholder="Available from" />
                  </div>

                  <div className="tool-field">
                    <label className="tool-label">Available until</label>
                    <DatePickerInput value={t.availableUntil} onChange={(iso: any) => updateTicketType && updateTicketType(idx, "availableUntil", iso)} placeholder="Available until" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mt-3">
                  <div className="tool-field md:col-span-2">
                    <label className="tool-label">URL</label>
                    <input type="text" className="tool-input" value={t.url || ""} placeholder="https://example.com/ticket" onChange={(e) => updateTicketType && updateTicketType(idx, "url", e.target.value)} onBlur={(e) => { const norm = normalizeUrl(e.target.value); if (norm !== (e.target.value || "").trim()) updateTicketType && updateTicketType(idx, "url", norm); }} />
                  </div>

                  <div className="tool-field md:col-span-1">
                    <label className="tool-label">Availability</label>
                    <div className="flex items-center gap-2">
                      <div className="custom-select-wrapper compact-select event-select-wrapper relative flex-1" style={{ flex: '1 1 auto' }}>
                        <button type="button" className="custom-select-trigger tool-select" onClick={() => setTicketAvailabilityOpenIndex && setTicketAvailabilityOpenIndex(idx)} style={{ width: "100%", justifyContent: "space-between" }} aria-expanded={ticketAvailabilityOpenIndex === idx}>
                          <span className="truncate block">{(TICKET_AVAILABILITY_OPTIONS || []).find((a: any) => a.value === (t.availability || ""))?.label || "Availability"}</span>
                          <span className="text-xs">⏷</span>
                        </button>

                        {ticketAvailabilityOpenIndex === idx && (
                          <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                            <ul>
                              {(TICKET_AVAILABILITY_OPTIONS || []).map((a: any) => (
                                <li key={a.value} className={(t.availability || "") === a.value ? "selected" : ""} onClick={() => { updateTicketType && updateTicketType(idx, "availability", a.value); setTicketAvailabilityOpenIndex && setTicketAvailabilityOpenIndex(null) }}>
                                  {a.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeTicketType && removeTicketType(idx)} aria-label="Remove ticket" title="Remove">×</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mt-2">No ticket types added yet.</div>
        )}
      </div>
      
      <div className="mt-2">
        <div className="text-sm font-semibold">Organizer Details</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tool-field">
          <label className="tool-label">Organizer @type</label>
          <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ width: "100%" }}>
            <button
              type="button"
              className="custom-select-trigger tool-select"
              onClick={() => setOrganizerTypeOpen && setOrganizerTypeOpen((o: any) => !o)}
              style={{ width: "100%", justifyContent: "space-between" }}
              aria-expanded={organizerTypeOpen}
            >
              <span className="truncate block">{(ORGANIZER_TYPES?.find((s: any) => s.value === (fields.organizerType || "")) || { label: "Organization" }).label}</span>
              <span className="text-xs">⏷</span>
            </button>

            {organizerTypeOpen && (
              <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                <ul>
                  {(ORGANIZER_TYPES || []).map((s: any) => (
                    <li key={s.value} className={(fields.organizerType || "") === s.value ? "selected" : ""} onClick={() => { handleChange("organizerType", s.value); setOrganizerTypeOpen && setOrganizerTypeOpen(false) }}>
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {renderError("organizerType")}
        </div>

        <div className="tool-field md:col-span-1">
          <label className="tool-label">Organizer name</label>
          <input type="text" className="tool-input" value={fields.organizerName || ""} placeholder="Organizer name" onChange={(e) => handleChange("organizerName", e.target.value)} />
          {renderError("organizerName")}
        </div>

        <div className="tool-field md:col-span-1">
          <label className="tool-label">Organizer URL</label>
          <input type="text" className="tool-input" value={fields.organizerUrl || ""} placeholder="https://example.com/organizer" onChange={(e) => handleChange("organizerUrl", e.target.value)} />
          {renderError("organizerUrl")}
        </div>
      </div>
    </>
  )
}
