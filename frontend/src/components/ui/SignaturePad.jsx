import { useEffect, useRef, useState } from 'react'
import Button from './Button'

function DrawCanvas({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.strokeStyle = '#1e1b4b'
  }, [])

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    drawingRef.current = true
    lastRef.current = pos(e)
  }

  const move = (e) => {
    if (!drawingRef.current) return
    const p = pos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastRef.current.x, lastRef.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastRef.current = p
  }

  const end = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    onChange?.(canvasRef.current.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange?.(null)
  }

  return (
    <div>
      <div className="rounded-lg border border-purple-200 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full cursor-crosshair touch-none rounded-lg"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Sign above using your mouse, stylus, or finger.</span>
        <button
          type="button"
          onClick={clear}
          className="font-medium text-purple-700 hover:text-purple-900"
        >
          Clear
        </button>
      </div>
      {value ? <input type="hidden" value={value} readOnly /> : null}
    </div>
  )
}

function UploadSignature({ value, onChange }) {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange?.(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {value ? (
        <div className="rounded-lg border border-purple-200 bg-white p-3">
          <img src={value} alt="Uploaded signature" className="mx-auto max-h-32" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
            <path
              d="M12 16V4M6 10l6-6 6 6M4 20h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Click to upload signature image</span>
          <span className="text-xs text-slate-500">PNG or JPG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange?.(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function SignaturePad({ label = 'E-Signature', value, onChange, className = '' }) {
  const [mode, setMode] = useState('draw')

  const setValue = (next) => onChange?.(next)

  const switchMode = (next) => {
    if (next === mode) return
    setMode(next)
    setValue(null)
  }

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 text-sm font-medium text-purple-900">{label}</div>
      ) : null}
      <div className="inline-flex rounded-lg bg-purple-100 p-1 text-xs font-semibold">
        {[
          { id: 'draw', label: 'Draw' },
          { id: 'upload', label: 'Upload' },
        ].map((t) => {
          const active = mode === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => switchMode(t.id)}
              className={[
                'rounded-md px-4 py-1.5 transition',
                active ? 'bg-purple-700 text-white shadow' : 'text-purple-700 hover:bg-white/50',
              ].join(' ')}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div className="mt-3">
        {mode === 'draw' ? (
          <DrawCanvas value={value} onChange={setValue} />
        ) : (
          <UploadSignature value={value} onChange={setValue} />
        )}
      </div>
    </div>
  )
}

export default SignaturePad
