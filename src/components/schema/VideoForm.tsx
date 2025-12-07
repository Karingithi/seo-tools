import { Plus } from "lucide-react"
import DatePickerInput from "../components/DatePickerInput"
import type { Dispatch, SetStateAction } from 'react'


export type VideoFields = {
  name?: string
  description?: string
  uploadDate?: string
  contentUrl?: string
  embedUrl?: string
  seekToTarget?: string
  thumbnailUrl?: string
  [k: string]: any
}

export type VideoFormProps = {
  fields: Partial<VideoFields>
  handleChange: (key: string, value: any) => void
  renderError: (key: string) => JSX.Element | null
  videoMinutes: string
  setVideoMinutes: Dispatch<SetStateAction<string>>
  videoSeconds: string
  setVideoSeconds: Dispatch<SetStateAction<string>>
  videoThumbnails: string[]
  setVideoThumbnails: Dispatch<SetStateAction<string[]>>
  validateField: (key: string, value: string, allFields: Record<string, string>) => void
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
}

export default function VideoForm(props: VideoFormProps): JSX.Element {
  const p = props
  const { fields, handleChange, renderError, videoMinutes, setVideoMinutes, videoSeconds, setVideoSeconds, videoThumbnails, setVideoThumbnails, validateField, setErrors } = p

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="tool-field">
          <label className="tool-label">Name</label>
          <input type="text" className="tool-input" value={fields.name || ""} placeholder="Video title" onChange={(e) => handleChange("name", e.target.value)} />
          {renderError("name")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Video's description</label>
          <textarea className="tool-textarea" rows={2} value={fields.description || ""} placeholder="Short video summary" onChange={(e) => handleChange("description", e.target.value)} />
          {renderError("description")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="tool-field md:col-span-2">
          <label className="tool-label">Upload date</label>
          <DatePickerInput value={fields.uploadDate} onChange={(iso) => handleChange("uploadDate", iso)} placeholder="yyyy-mm-dd" />
          {renderError("uploadDate")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Minutes</label>
          <input type="number" min={0} className="tool-input" value={videoMinutes} placeholder="0" onChange={(e) => setVideoMinutes(e.target.value)} />
        </div>

        <div className="tool-field">
          <label className="tool-label">Seconds</label>
          <input type="number" min={0} max={59} className="tool-input" value={videoSeconds} placeholder="0" onChange={(e) => setVideoSeconds(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 tool-field">
        <label className="tool-label">Thumbnail URL #1</label>
        <div className="flex flex-col gap-2">
          {videoThumbnails.map((t, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 flex-nowrap">
                <input type="text" className="tool-input flex-1" value={t} placeholder={`https://example.com/thumb-${idx + 1}.jpg`} onChange={(e) => {
                  setVideoThumbnails((prev) => {
                    const next = [...prev]
                    next[idx] = e.target.value
                    return next
                  })
                  validateField(`videoThumbs_${idx}`, e.target.value, fields as Record<string, string>)
                }} />
                <button type="button" className="toolbar-btn toolbar-btn--red square-btn" onClick={() => {
                  setVideoThumbnails((prev) => prev.filter((_, i) => i !== idx))
                  setErrors((prev) => {
                    const next = { ...prev }
                    Object.keys(next).forEach((k) => { if (k.startsWith("videoThumbs_")) delete next[k] })
                    return next
                  })
                }} aria-label="Remove thumbnail" title="Remove">×</button>
              </div>
              {renderError(`videoThumbs_${idx}`)}
            </div>
          ))}

          <div>
            <button type="button" className="action-btn" onClick={() => setVideoThumbnails((prev) => [...prev, ""]) }><Plus className="inline w-4 h-4 mr-2" /> Add Image</button>
          </div>
        </div>
        {renderError("thumbnailUrl")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tool-field">
          <label className="tool-label">Video URL</label>
          <input type="text" className="tool-input" value={fields.contentUrl || ""} placeholder="https://example.com/video.mp4" onChange={(e) => handleChange("contentUrl", e.target.value)} />
          {renderError("contentUrl")}
        </div>

        <div className="tool-field">
          <label className="tool-label">Embed URL</label>
          <input type="text" className="tool-input" value={fields.embedUrl || ""} placeholder="https://youtube.com/watch?v=..." onChange={(e) => handleChange("embedUrl", e.target.value)} />
          {renderError("embedUrl")}
        </div>
      </div>

      <div className="tool-field">
        <label className="tool-label">SeekToAction Target URL</label>
        <input type="text" className="tool-input" value={fields.seekToTarget || ""} placeholder="https://example.com/seek-target" onChange={(e) => handleChange("seekToTarget", e.target.value)} />
        {renderError("seekToTarget")}
      </div>
    </>
  )
}

