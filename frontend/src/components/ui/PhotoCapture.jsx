import { useEffect, useRef, useState } from 'react'

// Photo input that can either open the device webcam and snap a frame, or fall
// back to a file upload. Emits a JPEG/PNG data URL via onChange. Stops the camera
// stream on capture, cancel, and unmount so the webcam light never lingers.
function PhotoCapture({ value, onChange }) {
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
      setError('Camera not available on this device. Use file upload instead.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      setStreaming(true)
    } catch {
      setError('Could not access the camera. Check permissions or use file upload.')
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 240
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
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

  if (streaming) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-purple-200 bg-slate-900 p-3 shadow-sm">
        <div className="relative overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} playsInline muted className="max-h-72 w-full object-cover" />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> Live
          </span>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button type="button" onClick={capture} className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500">
            📸 Capture Photo
          </button>
          <button type="button" onClick={stop} className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-100 text-purple-400 ring-1 ring-purple-200">
        {value ? (
          <img src={value} alt="Patient" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
            <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={start} className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800">
            {value ? '📷 Retake' : '📷 Open Camera'}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
            Upload File
          </button>
          {value ? (
            <button type="button" onClick={() => onChange(null)} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
              Remove
            </button>
          ) : null}
        </div>
        <div className="text-xs text-slate-500">Take a photo with the webcam, or upload one · optional</div>
        {error ? <div className="text-xs text-rose-600">{error}</div> : null}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className="hidden" />
      </div>
    </div>
  )
}

export default PhotoCapture
