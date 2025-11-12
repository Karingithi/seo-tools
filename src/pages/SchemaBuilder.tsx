import { useState } from "react"

export default function SchemaBuilder() {
  const [type, setType] = useState("Article")
  const [fields, setFields] = useState<Record<string, string>>({})

  // === Field definitions by schema type ===
  const schemaFields: Record<string, { label: string; key: string; placeholder?: string }[]> = {
    Article: [
      { label: "Headline / Title", key: "headline", placeholder: "Example: 10 Healthy Aging Habits" },
      { label: "Author", key: "author", placeholder: "Your name or brand" },
      { label: "URL", key: "url", placeholder: "https://example.com/article" },
      { label: "Description", key: "description", placeholder: "Short summary of the article" },
    ],
    Product: [
      { label: "Product Name", key: "name", placeholder: "Organic Herbal Tea" },
      { label: "Brand", key: "brand", placeholder: "Tembeya Wellness" },
      { label: "Price", key: "price", placeholder: "25.99" },
      { label: "Currency", key: "currency", placeholder: "USD" },
      { label: "Description", key: "description", placeholder: "Natural detox herbal tea blend" },
    ],
    Event: [
      { label: "Event Name", key: "name", placeholder: "Wellness Retreat 2025" },
      { label: "Start Date", key: "startDate", placeholder: "2025-06-15" },
      { label: "End Date", key: "endDate", placeholder: "2025-06-20" },
      { label: "Location", key: "location", placeholder: "Nairobi, Kenya" },
      { label: "Description", key: "description", placeholder: "5-day rejuvenation retreat" },
    ],
    Organization: [
      { label: "Organization Name", key: "name", placeholder: "Tembeya Wellness Retreats" },
      { label: "URL", key: "url", placeholder: "https://tembeyawellnessretreats.com" },
      { label: "Logo URL", key: "logo", placeholder: "https://example.com/logo.png" },
      { label: "Contact Email", key: "email", placeholder: "info@tembeya.com" },
    ],
    Person: [
      { label: "Name", key: "name", placeholder: "John Doe" },
      { label: "Job Title", key: "jobTitle", placeholder: "Wellness Coach" },
      { label: "Website", key: "url", placeholder: "https://tembeyawellnessretreats.com/about" },
    ],
  }

  // === Handle field updates dynamically ===
  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  // === Build schema object dynamically ===
  const buildSchema = () => {
    const base: any = { "@context": "https://schema.org", "@type": type }
    Object.entries(fields).forEach(([key, value]) => {
      if (value.trim() !== "") base[key] = value
    })

    // Add nested structures for certain types
    if (type === "Article" && fields.author) {
      base.author = { "@type": "Person", name: fields.author }
    }
    if (type === "Product" && fields.price) {
      base.offers = {
        "@type": "Offer",
        price: fields.price,
        priceCurrency: fields.currency || "USD",
      }
      delete base.price
      delete base.currency
    }
    if (type === "Event" && fields.location) {
      base.location = {
        "@type": "Place",
        name: fields.location,
      }
    }

    return base
  }

  const schemaJSON = JSON.stringify(buildSchema(), null, 2)

  return (
    <section className="container section bg-white p-6 rounded-lg shadow-sm mt-10">
      <h2 className="text-2xl font-semibold mb-4">Schema Builder</h2>
      <p className="text-gray-600 mb-6">
        Generate valid <code>JSON-LD</code> schema markup for your page.  
        The fields will update automatically based on your selected schema type.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* === Input Form === */}
        <div>
          <label className="block mb-1 font-medium text-sm">Schema Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setFields({})
            }}
            className="border p-2 rounded w-full mb-4"
          >
            {Object.keys(schemaFields).map((schemaType) => (
              <option key={schemaType}>{schemaType}</option>
            ))}
          </select>

          {schemaFields[type].map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type="text"
                value={fields[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="border p-2 rounded w-full"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        {/* === Output === */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Generated Schema (JSON-LD)</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(schemaJSON)
                alert("✅ Schema copied to clipboard!")
              }}
              className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition"
            >
              Copy Schema
            </button>
          </div>

          <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-auto h-[420px]">
            <code>{schemaJSON}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
