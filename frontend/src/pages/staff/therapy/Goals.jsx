import { useOutletContext } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

// Mockup data — therapy goals tracked per child for this discipline.
const DATA = {
  Speech: [
    {
      child: 'Leo Cruz',
      goals: [
        { label: 'Produce /s/ in initial position, 80% accuracy', progress: 70 },
        { label: 'Use 3-word phrases spontaneously', progress: 55 },
      ],
    },
    {
      child: 'Mia Santos',
      goals: [
        { label: 'Reduce dysfluencies to < 5%', progress: 85 },
        { label: 'Apply easy-onset technique in conversation', progress: 60 },
      ],
    },
  ],
  Occupational: [
    {
      child: 'Alex Johnson',
      goals: [
        { label: 'Tripod pencil grasp, 4/5 trials', progress: 75 },
        { label: 'Copy simple shapes independently', progress: 50 },
      ],
    },
    {
      child: 'Leo Cruz',
      goals: [
        { label: 'Tolerate textured materials for 5 min', progress: 65 },
        { label: 'Complete 10-piece pegboard unassisted', progress: 40 },
      ],
    },
  ],
}

function Goals() {
  const { discipline } = useOutletContext()
  const rows = DATA[discipline] || []

  return (
    <>
      <StaffHeader title={`${discipline} Therapy — Goals & Progress`} subtitle="Track measurable therapy goals" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-100 px-4 py-3 text-sm text-purple-900">
          <div className="font-semibold">🎯 Goal Tracker</div>
          <div className="text-xs text-purple-700">
            Measurable {discipline.toLowerCase()} therapy goals and progress toward each target.
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {rows.map((r) => (
            <article key={r.child} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-purple-800">{r.child}</div>
                <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                  + Add Goal
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {r.goals.map((g) => (
                  <div key={g.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{g.label}</span>
                      <span className="font-semibold text-slate-800">{g.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-purple-100">
                      <div
                        className={`h-full rounded-full ${g.progress >= 80 ? 'bg-emerald-500' : 'bg-purple-700'}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Goals
