import { useState } from "react"

type HeadingNode = {
  id?: string
  text: string
  level: number
  children: HeadingNode[]
}

const buildHeadingTree = (headings: { level: number; text: string; id?: string }[]): HeadingNode[] => {
  const root: HeadingNode[] = []
  const stack: HeadingNode[] = []

  headings.forEach((h) => {
    const node: HeadingNode = { text: h.text || "", level: h.level, id: h.id, children: [] }
    while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop()
    if (!stack.length) {
      root.push(node)
      stack.push(node)
    } else {
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    }
  })

  return root
}

const renderTree = (nodes: HeadingNode[]) => {
  return (
    <ul className="list-disc ml-6">
      {nodes.map((n, idx) => (
        <li key={idx} className="mb-1">
          <div className="flex items-center gap-3">
            <div className="font-medium">{n.text || "(no text)"}</div>
            <div className="text-xs text-gray-500">h{n.level}{n.id ? ` • id=${n.id}` : ""}</div>
          </div>
          {n.children && n.children.length ? renderTree(n.children) : null}
        </li>
      ))}
    </ul>
  )
}

export default function HeaderTagViewer(): JSX.Element {
  const [html, setHtml] = useState("")
  const [url, setUrl] = useState("")
  const [tree, setTree] = useState<HeadingNode[] | null>(null)
  const [lastRaw, setLastRaw] = useState("")

  const parseHtml = (raw: string) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(raw, "text/html")
      const nodes = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"))
      const headings = nodes.map((n) => ({ level: Number(n.tagName.replace("H", "")), text: (n.textContent || "").trim(), id: (n as HTMLElement).id || undefined }))
      const t = buildHeadingTree(headings)
      setTree(t)
      setLastRaw(raw)
    } catch (e) {
      setTree(null)
    }
  }

  const fetchAndParse = async () => {
    if (!url) return
    try {
      const resp = await fetch(url)
      const text = await resp.text()
      setHtml(text)
      parseHtml(text)
    } catch (e) {
      setTree(null)
      console.error(e)
    }
  }

  const onParseClick = () => parseHtml(html)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="tool-field">
          <label className="tool-label">Page URL (optional)</label>
          <div className="flex gap-2">
            <input type="text" className="tool-input flex-1" placeholder="https://example.com/page" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="action-btn" type="button" onClick={fetchAndParse}>Fetch</button>
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">HTML Input</label>
          <textarea className="tool-textarea" rows={6} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste HTML source here (or fetch from URL)" />
          <div className="mt-2">
            <button className="action-btn" onClick={onParseClick}>Parse headings</button>
            <button className="action-btn ml-2" onClick={() => { navigator.clipboard.writeText(lastRaw || html) }}>Copy raw</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Results</h3>
        {tree ? renderTree(tree) : <div className="text-sm text-gray-500">No headings parsed yet.</div>}
      </div>
    </div>
  )
}
