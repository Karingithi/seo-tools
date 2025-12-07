import DatePickerInput from "../components/DatePickerInput"
import { Plus } from "lucide-react"

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
    EVENT_STATUSES,
    ATTENDANCE_MODES,
    timezoneOpen,
    setTimezoneOpen,
    timezoneSearch,
    setTimezoneSearch,
    TIMEZONES,
    getTimezoneOffsetMinutes,
    formatGmtOffset,
    venueCountryOpen,
    setVenueCountryOpen,
    venueCountrySearch,
    setVenueCountrySearch,
    COUNTRY_LIST,
    organizerTypeOpen,
    setOrganizerTypeOpen,
    performerTypeOpen,
    setPerformerTypeOpen,
    PERFORMER_TYPES,
    ticketTypes,
    addTicketType,
    updateTicketType,
    removeTicketType,
    ticketDefaultCurrency,
    setTicketDefaultCurrency,
    ticketDefaultCurrencyOpen,
    setTicketDefaultCurrencyOpen,
    ticketCurrencySearch,
    setTicketCurrencySearch,
    ALL_CURRENCIES,
    ticketAvailabilityOpenIndex,
    setTicketAvailabilityOpenIndex,
    TICKET_AVAILABILITY_OPTIONS,
  } = p

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
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

        <div className="tool-field">
          <label className="tool-label">Event's description</label>
          <textarea
            className="tool-textarea"
            rows={2}
            value={fields.description || ""}
            placeholder="Short event description"
            onChange={(e) => handleChange("description", e.target.value)}
          />
          {renderError("description")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Image</label>
          <input type="text" className="tool-input" value={fields.image || ""} placeholder="https://example.com/image.jpg" onChange={(e) => handleChange("image", e.target.value)} />
          {renderError("image")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">Start date</label>
          <DatePickerInput value={fields.startDate} onChange={(iso: any) => handleChange("startDate", iso)} placeholder="Start date" />
          {renderError("startDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Start time (e.g. 08:00)</label>
          <input type="text" className="tool-input" value={fields.startTime || ""} placeholder="08:00" onChange={(e) => handleChange("startTime", e.target.value)} />
          {renderError("startTime")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="tool-field">
          <label className="tool-label">End date</label>
          <DatePickerInput value={fields.endDate} onChange={(iso: any) => handleChange("endDate", iso)} placeholder="End date" />
          {renderError("endDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">End time (e.g. 17:30)</label>
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
                        placeholder="Search timezone..."
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {TIMEZONES.filter((z: string) => (z || "").toLowerCase().includes((timezoneSearch || "").toLowerCase())).map((z: string) => (
                        <li key={z} className={(fields.timezone || "") === z ? "selected" : ""} onClick={() => { handleChange("timezone", z); setTimezoneOpen(false); setTimezoneSearch("") }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{z}</span>
                            <span className="text-[13px] text-gray-500 ml-2">{formatGmtOffset(getTimezoneOffsetMinutes(z))}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {renderError("timezone")}
            </div>
          </div>
        )}
        {/* Venue fields hidden for pure online events (appear directly under Attendance) */}
        {fields.attendanceMode !== '' && fields.attendanceMode !== 'OnlineEventAttendanceMode' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="tool-field">
                <label className="tool-label">Venue name</label>
                <input
                  type="text"
                  className={`tool-input ${fields.attendanceMode === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={fields.venueName || ""}
                  placeholder="Venue name"
                  onChange={(e) => handleChange("venueName", e.target.value)}
                  disabled={fields.attendanceMode === ''}
                />
                {renderError("venueName")}
              </div>

              <div className="tool-field">
                <label className="tool-label">Street</label>
                <input
                  type="text"
                  className={`tool-input ${fields.attendanceMode === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={fields.venueStreet || ""}
                  placeholder="Street address"
                  onChange={(e) => handleChange("venueStreet", e.target.value)}
                  disabled={fields.attendanceMode === ''}
                />
                {renderError("venueStreet")}
              </div>

              <div className="tool-field">
                <label className="tool-label">City</label>
                <input
                  type="text"
                  className={`tool-input ${fields.attendanceMode === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={fields.venueCity || ""}
                  placeholder="City"
                  onChange={(e) => handleChange("venueCity", e.target.value)}
                  disabled={fields.attendanceMode === ''}
                />
                {renderError("venueCity")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="tool-field">
                <label className="tool-label">State/Province/Region</label>
                <input
                  type="text"
                  className={`tool-input ${fields.attendanceMode === '' || (fields.venueCountry && fields.venueCountry !== 'US') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={fields.venueRegion || ""}
                  placeholder={fields.venueCountry && fields.venueCountry !== 'US' ? 'Select region' : 'State/Province/Region'}
                  onChange={(e) => handleChange("venueRegion", e.target.value)}
                  disabled={fields.attendanceMode === '' || Boolean(fields.venueCountry && fields.venueCountry !== 'US')}
                />
                {renderError("venueRegion")}
              </div>

              <div className="tool-field">
                <label className="tool-label">Postal Code</label>
                <input
                  type="text"
                  className={`tool-input ${fields.attendanceMode === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={fields.venuePostalCode || ""}
                  placeholder="90210"
                  onChange={(e) => handleChange("venuePostalCode", e.target.value)}
                  disabled={fields.attendanceMode === ''}
                />
                {renderError("venuePostalCode")}
              </div>

              <div className="tool-field">
                <label className="tool-label">Country</label>
                <div className={`custom-select-wrapper compact-select relative ${fields.attendanceMode === '' ? 'opacity-50' : ''}`} style={{ width: '100%', minWidth: 140 }}>
                  <button
                    type="button"
                    className="custom-select-trigger tool-select"
                    onClick={() => { if (fields.attendanceMode === '') return; setVenueCountryOpen((o: any) => !o) }}
                    style={{ width: "100%", justifyContent: "space-between" }}
                    aria-expanded={venueCountryOpen}
                    aria-disabled={fields.attendanceMode === ''}
                  >
                    <span className="truncate block">{(fields.venueCountry && (COUNTRY_LIST.find((c: any) => c.code === fields.venueCountry)?.name || fields.venueCountry)) || "Select country"}</span>
                    <span className="text-xs">⏷</span>
                  </button>

                  {venueCountryOpen && (
                    <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                      <div className="p-2">
                        <input
                          type="text"
                          className="tool-input"
                          placeholder="Search country..."
                          value={venueCountrySearch}
                          onChange={(e) => setVenueCountrySearch(e.target.value)}
                        />
                      </div>
                      <ul>
                        {COUNTRY_LIST.filter((c: any) => c.name.toLowerCase().includes((venueCountrySearch || "").toLowerCase())).map((c: any) => (
                          <li key={c.code || c.name} className={(fields.venueCountry || "") === (c.code || "") ? "selected" : ""} onClick={() => { if (fields.attendanceMode === '') return; handleChange("venueCountry", c.code || ""); setVenueCountryOpen(false); setVenueCountrySearch("") }}>
                            {c.name} {c.code ? <span className="text-[13px] text-gray-500">({c.code})</span> : null}
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

        {/* Organizer details for Event */}
        <hr className="my-4" />
        <div>
          <strong className="text-base">Organizer Details</strong>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Organizer @type</label>
            <div className="custom-select-wrapper compact-select relative" style={{ width: "100%" }}>
              <button
                type="button"
                className="custom-select-trigger tool-select"
                onClick={() => setOrganizerTypeOpen((o: any) => !o)}
                style={{ width: "100%", justifyContent: "space-between" }}
                aria-expanded={organizerTypeOpen}
              >
                <span className="truncate block">{(fields.organizerType || "") || "Select type"}</span>
                <span className="text-xs">⏷</span>
              </button>

              {organizerTypeOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                  <ul>
                    <li className={(fields.organizerType || "") === "Organization" ? "selected" : ""} onClick={() => { handleChange("organizerType", "Organization"); setOrganizerTypeOpen(false) }}>Organization</li>
                    <li className={(fields.organizerType || "") === "Person" ? "selected" : ""} onClick={() => { handleChange("organizerType", "Person"); setOrganizerTypeOpen(false) }}>Person</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="tool-field">
            <label className="tool-label">Organizer name</label>
            <input type="text" className="tool-input" value={fields.organizerName || ""} placeholder="Organizer name" onChange={(e) => handleChange("organizerName", e.target.value)} />
            {renderError("organizerName")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Organizer URL</label>
            <input type="text" className="tool-input" value={fields.organizerUrl || ""} placeholder="https://example.com" onChange={(e) => handleChange("organizerUrl", e.target.value)} />
            {renderError("organizerUrl")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Phone</label>
            <input type="text" className="tool-input" value={fields.organizerTelephone || ""} placeholder="+1-555-123-4567" onChange={(e) => handleChange("organizerTelephone", e.target.value)} />
            {renderError("organizerTelephone")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tool-field">
            <label className="tool-label">Email</label>
            <input type="text" className="tool-input" value={fields.organizerEmail || ""} placeholder="name@example.com" onChange={(e) => handleChange("organizerEmail", e.target.value)} />
            {renderError("organizerEmail")}
          </div>

          <div className="tool-field">
            <label className="tool-label">Logo URL</label>
            <input type="text" className="tool-input" value={fields.organizerLogo || ""} placeholder="https://example.com/logo.png" onChange={(e) => handleChange("organizerLogo", e.target.value)} />
            {renderError("organizerLogo")}
          </div>
        </div>

        {/* Performer fields (appear under Attendance) */}
        <hr className="my-4" />
        <div>
          <strong className="text-base">Performer Details</strong>
        </div>
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
                <span className="truncate block">{(PERFORMER_TYPES.find((p: any) => p.value === (fields.performerType || "")) || { label: "Select type" }).label}</span>
                <span className="text-xs">⏷</span>
              </button>

              {performerTypeOpen && (
                <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                  <ul>
                    {PERFORMER_TYPES.map((opt: any) => (
                      <li key={opt.value} className={(fields.performerType || "") === opt.value ? "selected" : ""} onClick={() => { handleChange("performerType", opt.value); setPerformerTypeOpen(false) }}>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="tool-field">
            <label className="tool-label">Performer's name</label>
            <input type="text" className="tool-input" value={fields.performerName || ""} placeholder="Performer's name" onChange={(e) => handleChange("performerName", e.target.value)} />
          </div>
        </div>
      </>

      <div>
        <div className="mb-3">
          <div className="text-sm text-gray-600 mt-2">Add an offer for each ticket type (e.g. "General admission", "VIP Package").</div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-3">
              <button type="button" className="action-btn" onClick={addTicketType}><Plus className="inline w-4 h-4 mr-2" /> Add Ticket Type</button>
            </div>

            <div className="flex items-center justify-end">
              <div className="custom-select-wrapper compact-select event-select-wrapper relative" style={{ minWidth: 160 }}>
                <button
                  type="button"
                  className="custom-select-trigger tool-select"
                  onClick={() => setTicketDefaultCurrencyOpen((o: any) => !o)}
                  style={{ width: "100%", justifyContent: "space-between" }}
                  aria-expanded={ticketDefaultCurrencyOpen}
                >
                  <span className="truncate block">{ticketDefaultCurrency ? `${ticketDefaultCurrency} - ${(ALL_CURRENCIES.find((c: any) => c.code === ticketDefaultCurrency) || { name: "" }).name}` : "Ticket currency"}</span>
                  <span className="text-xs">⏷</span>
                </button>

                {ticketDefaultCurrencyOpen && (
                  <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%", maxHeight: 260, overflow: "auto" }}>
                    <div className="p-2">
                      <input
                        type="text"
                        className="tool-input"
                        placeholder="Search currency..."
                        value={ticketCurrencySearch}
                        onChange={(e) => setTicketCurrencySearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {ALL_CURRENCIES.filter((c: any) => (`${c.code} ${c.name}`).toLowerCase().includes((ticketCurrencySearch || "").toLowerCase())).map((c: any) => (
                        <li key={c.code} className={ticketDefaultCurrency === c.code ? "selected" : ""} onClick={() => { setTicketDefaultCurrency(c.code); setTicketDefaultCurrencyOpen(false); setTicketCurrencySearch("") }}>
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

        <div className="flex flex-col gap-3">
          {ticketTypes.map((t: any, idx: number) => (
            <div key={idx} className="space-y-2 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="tool-field">
                  <label className="tool-label">Name</label>
                  <input type="text" className="tool-input" value={t.name} placeholder="General admission" onChange={(e) => updateTicketType(idx, "name", e.target.value)} />
                </div>

                <div className="tool-field">
                  <label className="tool-label">Price</label>
                  <input type="text" className="tool-input" value={t.price} placeholder="49.99" onChange={(e) => updateTicketType(idx, "price", e.target.value)} />
                </div>

                <div className="tool-field">
                  <label className="tool-label">Available from</label>
                  <DatePickerInput value={t.availableFrom} onChange={(iso: any) => updateTicketType(idx, "availableFrom", iso)} placeholder="yyyy-mm-dd" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="tool-field mt-2">
                  <label className="tool-label">URL</label>
                  <input type="text" className="tool-input" value={t.url} placeholder="https://example.com/ticket" onChange={(e) => updateTicketType(idx, "url", e.target.value)} />
                </div>

                <div className="tool-field mt-2">
                  <label className="tool-label">Availability</label>
                  <div className="custom-select-wrapper article-select-wrapper relative" style={{ width: "100%" }}>
                    <button
                      type="button"
                      className="custom-select-trigger tool-select"
                      onClick={() => setTicketAvailabilityOpenIndex((o: any) => (o === idx ? null : idx))}
                      style={{ width: "100%", justifyContent: "space-between" }}
                      aria-expanded={ticketAvailabilityOpenIndex === idx}
                    >
                      <span className="truncate block">{(TICKET_AVAILABILITY_OPTIONS.find((a: any) => a.value === (t.availability || "")) || { label: "Not specified" }).label}</span>
                      <span className="text-xs">⏷</span>
                    </button>

                    {ticketAvailabilityOpenIndex === idx && (
                      <div className="custom-select-list absolute left-0 mt-1 z-50" style={{ width: "100%" }}>
                        <ul>
                          {TICKET_AVAILABILITY_OPTIONS.map((opt: any) => (
                            <li key={`${idx}-${opt.value}`} className={(t.availability || "") === opt.value ? "selected" : ""} onClick={() => { updateTicketType(idx, "availability", opt.value); setTicketAvailabilityOpenIndex(null) }}>
                              {opt.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="flex justify-end">
                  <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => removeTicketType(idx)} title="Remove">×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
