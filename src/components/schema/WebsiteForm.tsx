interface WebsiteFormProps {
  fields: Record<string, string>
  handleChange: (key: string, value: string) => void
  renderError: (key: string) => JSX.Element | null
}

export default function WebsiteForm(
  props: WebsiteFormProps
): JSX.Element {
  const { fields, handleChange, renderError } = props

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Site Name</label>
          <input
            type="text"
            className="tool-input"
            value={fields.name || ""}
            placeholder="Example Site"
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {renderError("name")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Site URL</label>
          <input
            type="text"
            className="tool-input"
            value={fields.url || ""}
            placeholder="https://example.com"
            onChange={(e) => handleChange("url", e.target.value)}
          />
          {renderError("url")}
        </div>
      </div>

      <div className="tool-field">
        <label className="tool-label">Search URL Template</label>
        <input
          type="text"
          className="tool-input"
          value={fields.urlTemplate || ""}
          placeholder="https://example.com/search?q={search_term_string}"
          onChange={(e) => handleChange("urlTemplate", e.target.value)}
        />
        <div className="text-sm text-gray-500 mt-1">
          Include <code>{`{search_term_string}`}</code> in the template
        </div>
        {renderError("urlTemplate")}
      </div>

      <div className="tool-field">
        <label className="tool-label">Description</label>
        <textarea
          className="tool-textarea"
          rows={4}
          value={fields.description || ""}
          placeholder="Short description of your site"
          onChange={(e) => handleChange("description", e.target.value)}
        />
        {renderError("description")}
      </div>
    </>
  )
}
