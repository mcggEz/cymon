import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

// A gentle nudge on the Home page inviting the caregiver to take the research
// survey. Hides itself once they've submitted or dismissed it for the session.
function SurveyPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let on = true
    const dismissed = sessionStorage.getItem('cymon.surveyPromptDismissed') === '1'
    if (dismissed) return
    api.client
      .survey()
      .then((d) => on && setShow(!d.submitted))
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  if (!show) return null

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-700">
          <span className="font-semibold text-purple-800">How are we doing?</span> Take a 2-minute survey to help
          ClearMind improve.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem('cymon.surveyPromptDismissed', '1')
            setShow(false)
          }}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Later
        </button>
        <Link
          to="/client/survey"
          className="rounded-md bg-purple-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800"
        >
          Take survey
        </Link>
      </div>
    </div>
  )
}

export default SurveyPrompt
