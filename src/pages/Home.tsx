import { useState } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { toolsData, type Tool } from "../data/toolsData" // ✅ Import shared tools

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter tools dynamically from shared data
  const filtered = toolsData.filter((tool: Tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="container section flex flex-col lg:flex-row gap-10 px-0 sm:px-0 md:px-0">
      {/* === Search + Tools === */}
      <div className="flex-1">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-[16px] rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* === Tools Grid === */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsData.map((tool) => (
            <Link
              key={tool.name}
              to={tool.link}
              className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm transition-all duration-150 ease-[cubic-bezier(0.68,0.01,0.58,0.75)] will-change-transform hover:-translate-y-[5px] hover:shadow-lg"
            >
              <img
                src={tool.icon}
                alt={`${tool.name} icon`}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="ml-3">
                <h3 className="text-[18px] font-medium text-gray-800">
                {tool.name}
              </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* === Banner === */}
      <div className="lg:w-[340px]">
        <div className="bg-secondary text-white p-6 rounded-2xl shadow-md flex flex-col justify-between h-full border border-[#140a3a]">
          <div>
            <div className="text-sm text-gray-400 mb-2 font-semibold">
              Cralite Tools Banner
            </div>
            <h3 className="text-lg font-bold mb-3">Discover More Tools</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Stay ahead in SEO, schema, and digital marketing.
              <br />New tools are coming soon.
            </p>
          </div>

          <button className="mt-auto bg-primary text-secondary font-medium px-4 py-2 rounded-full hover:opacity-90 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
