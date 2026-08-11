import copyIconUrl from "../assets/icons/copy.svg?url"
import downloadIconUrl from "../assets/icons/download.svg?url"
import resetIconUrl from "../assets/icons/reset.svg?url"
import googleIconUrl from "../assets/icons/google.svg?url"
import schemaIconUrl from "../assets/icons/schema-icon.svg?url"
import type { ReactNode } from "react"

type Props = {
  schemaScript: string
  onTest: () => void
  onValidate: () => void
  onCopy: () => void
  onDownload: () => void
  onReset: () => void
  copied: boolean
  downloadMsgVisible: boolean
  resetMsgVisible: boolean
  testMsgVisible: boolean
  validateMsgVisible: boolean
  richResultPreview?: ReactNode
}

export default function SchemaPreview({
  schemaScript,
  onTest,
  onValidate,
  onCopy,
  onDownload,
  onReset,
  copied,
  downloadMsgVisible,
  resetMsgVisible,
  testMsgVisible,
  validateMsgVisible,
  richResultPreview,
}: Props): JSX.Element {
  return (
    <div className="tool-preview">
      {richResultPreview}
      <h3 className="tool-section-title">JSON-LD Preview</h3>

      <div className="toolbar-spacing">
        <div className="toolbar">
          <div className="toolbar-wrap">
            <div className={`tooltip ${testMsgVisible ? "visible msg-fade" : ""}`}>
              {testMsgVisible ? "Copied — open test" : "Test Schema"}
            </div>
            <button onClick={onTest} className="toolbar-btn toolbar-btn--google" title="Test Schema" aria-label="Test Schema">
              <img src={googleIconUrl} alt="test schema" className="toolbar-icon" width={16} height={16} />
            </button>
          </div>

          <div className="toolbar-wrap">
            <div className={`tooltip ${validateMsgVisible ? "visible msg-fade" : ""}`}>
              {validateMsgVisible ? "Copied — open validator" : "Validate"}
            </div>
            <button onClick={onValidate} className="toolbar-btn toolbar-btn--schema" title="Validate Schema" aria-label="Validate Schema">
              <img src={schemaIconUrl} alt="validate schema" className="toolbar-icon" width={16} height={16} />
            </button>
          </div>

          <div className="toolbar-wrap">
            <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
              {copied ? "Copied!" : "Copy"}
            </div>
            <button onClick={onCopy} className="toolbar-btn toolbar-btn--blue">
              <img src={copyIconUrl} alt="copy" className="toolbar-icon" width={16} height={16} />
            </button>
          </div>

          <div className="toolbar-wrap">
            <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
              {downloadMsgVisible ? "Downloaded" : "Download"}
            </div>
            <button onClick={onDownload} className="toolbar-btn toolbar-btn--green">
              <img src={downloadIconUrl} alt="download" className="toolbar-icon" width={16} height={16} />
            </button>
          </div>

          <div className="toolbar-wrap">
            <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
              {resetMsgVisible ? "Reset" : "Reset"}
            </div>
            <button onClick={onReset} className="toolbar-btn toolbar-btn--red">
              <img src={resetIconUrl} alt="reset" className="toolbar-icon" width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      <pre className="tool-code">
        <code>{schemaScript}</code>
      </pre>
    </div>
  )
}
