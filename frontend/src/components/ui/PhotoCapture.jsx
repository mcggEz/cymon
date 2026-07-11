import { useEffect, useRef, useState } from 'react'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CAMERA = 'M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'
const UPLOAD = 'M12 16V4M6 10l6-6 6 6M4 20h16'
const TRASH = 'M6 7h12M9 7V5h6v2M8 7l1 12h6l1-12'
const CHECK = 'M5 12l4 4 10-10'
const CLOSE = 'M6 6l12 12M18 6L6 18'

// Photo input that can either open the device webcam and snap a frame, or fall
// back to a file upload. Emits a JPEG/PNG data URL via onChange. `square` crops
// the capture to a centered square (a 2x2 ID photo).
function PhotoCapture({ value, onChange, square = false }) {
  const videoRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStreaming(false)
  }

  useEffect(() => stop, [])

  useEffect(() => {
    if (streaming && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [streaming])

  const start = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not available. Upload instead.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      setStreaming(true)
    } catch {
      setError('Could not access the camera. Check permissions or upload.')
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const vw = video.videoWidth || 320
    const vh = video.videoHeight || 240
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (square) {
      const side = Math.min(vw, vh)
      canvas.width = side
      canvas.height = side
      ctx.drawImage(video, (vw - side) / 2, (vh - side) / 2, side, side, 0, 0, side, side)
    } else {
      canvas.width = vw
      canvas.height = vh
      ctx.drawImage(video, 0, 0, vw, vh)
    }
    onChange(canvas.toDataURL('image/jpeg', 0.9))
    stop()
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  const iconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50'

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-100 text-purple-400 ring-1 ring-purple-200">
          {value ? (
            <img src={value} alt="Patient" className="h-full w-full object-cover" />
          ) : (
            <Icon d={CAMERA} className="h-9 w-9" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={start} aria-label={value ? 'Retake photo' : 'Open camera'} title={value ? 'Retake' : 'Open camera'} className={iconBtn}>
            <Icon d={CAMERA} />
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload photo" title="Upload" className={iconBtn}>
            <Icon d={UPLOAD} />
          </button>
          {value ? (
            <button type="button" onClick={() => onChange(null)} aria-label="Remove photo" title="Remove" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50">
              <Icon d={TRASH} />
            </button>
          ) : null}
        </div>
        {error ? <div className="text-xs text-rose-600">{error}</div> : null}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className="hidden" />
      </div>

      {streaming ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-purple-950/60 p-4" role="dialog" aria-label="Camera">
          <div className="w-full max-w-3xl rounded-2xl border border-purple-200 bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-800">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Live
              </div>
              <button type="button" onClick={stop} aria-label="Close camera" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <Icon d={CLOSE} className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-purple-50 ring-1 ring-purple-100">
              <video ref={videoRef} playsInline muted className="max-h-[70vh] w-full object-contain" />
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" onClick={capture} aria-label="Capture photo" title="Capture" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-700 text-white shadow hover:bg-purple-800">
                <Icon d={CHECK} className="h-6 w-6" />
              </button>
              <button type="button" onClick={stop} aria-label="Cancel" title="Cancel" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50">
                <Icon d={CLOSE} className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default PhotoCapture
