import { useEffect, useRef, useState } from 'react'

// A draw-your-signature line for the paper forms: draw with mouse/finger, and
// the ink prints as part of the document. The caption sits below the line.
function SignatureField({ label }) {
  const [name, setName] = useState(label)
  const [prevLabel, setPrevLabel] = useState(label)

  if (label !== prevLabel) {
    setPrevLabel(label)
    setName(label)
  }
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let drawing = false
    let last = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (canvas.width === w && canvas.height === h) return

      canvas.width = w
      canvas.height = h
      ctx.strokeStyle = '#1e1b4b'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    resize()
    window.addEventListener('resize', resize)

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const src = e.touches && e.touches.length > 0 ? e.touches[0] : e
      return { x: src.clientX - rect.left, y: src.clientY - rect.top }
    }
    const start = (e) => {
      drawing = true
      last = pos(e)
      if (e.touches) {
        e.preventDefault()
      }
    }
    const move = (e) => {
      if (!drawing) return
      const p = pos(e)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      last = p
      if (e.touches) {
        e.preventDefault()
      }
    }
    const end = () => {
      drawing = false
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', move)
    window.addEventListener('mouseup', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', end)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mouseup', end)
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
  }, [])

  const clear = () => {
    const canvas = ref.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div>
      <canvas
        ref={ref}
        className="h-20 w-full cursor-crosshair touch-none rounded-md border border-dashed border-slate-400 bg-white"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex-1 print:hidden">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-700 focus:bg-purple-50 focus:border-purple-600 focus:outline-none"
            placeholder="Type Name..."
          />
        </div>
        <div className="hidden print:block text-[9px] font-bold uppercase tracking-wide text-slate-700">
          {name}
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-[10px] font-medium text-purple-600 hover:text-purple-800 print:hidden"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default SignatureField
