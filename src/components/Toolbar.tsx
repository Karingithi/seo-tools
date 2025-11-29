import type { CSSProperties } from "react"
import "../styles/toolbar.css"

type Action = {
  key: string
  iconSrc: string
  label?: string
  onClick: () => void
  disabled?: boolean
  color?: string
  transient?: boolean // if true, show transient message after action
  transientText?: string
}

export default function Toolbar({ actions }: { actions: Action[] }) {
  return (
    <div className="toolbar">
      {actions.map((a) => (
        <div key={a.key} className="toolbar-wrap">
          <div className="tooltip" aria-hidden>{a.label ?? ""}</div>
          <button
            className="toolbar-btn"
            onClick={a.onClick}
            disabled={a.disabled}
            title={a.label}
            style={{ background: a.color } as CSSProperties}
          >
            <img src={a.iconSrc} alt={a.label ?? ""} className="toolbar-icon" />
          </button>
        </div>
      ))}
    </div>
  )
}