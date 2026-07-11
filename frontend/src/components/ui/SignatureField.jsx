import { useEffect, useRef } from 'react'

// A draw-your-signature line for the paper forms: draw with mouse/finger, and
// the ink prints as part of the document. The caption sits below the line.
function SignatureField({ label }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let drawing = false
    let last = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      ctx.scale(ratio, ratio)
      ctx.strokeStyle = '#1e1b4b'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    resize()
    window.addEventListener('resize', resize)

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const src = e.touches ? e.touches[0] : e
      return { x: src.clientX - rect.left, y: src.clientY - rect.top }
    }
    const start = (e) => {
      drawing = true
      last = pos(e)
      e.preventDefault()
    }
    const move = (e) => {
      if (!drawing) return
      const p = pos(e)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      last = p
      e.preventDefault()
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
        <div className="text-[9px] font-bold uppercase tracking-wide text-slate-700">{label}</div>
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
