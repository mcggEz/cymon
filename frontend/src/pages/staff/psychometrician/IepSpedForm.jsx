import { useState, useEffect, useRef } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import SignatureField from '../../../components/ui/SignatureField'
import Button from '../../../components/ui/Button'
import { blankInput } from '../../../components/ui/formStyles'
import { api } from '../../../lib/api'
import { toast } from 'react-hot-toast'

const DOMAINS = [
  { key: 'practical', name: 'Practical Domain' },
  { key: 'social', name: 'Social Domain' },
  { key: 'conceptual', name: 'Conceptual Domain' },
]

const INITIAL_WEEK_STATE = {
  level: '',
  practical: { activity: '', objectives: '', materials: '', notes: '' },
  social: { activity: '', objectives: '', materials: '', notes: '' },
  conceptual: { activity: '', objectives: '', materials: '', notes: '' },
  kinFine: { activity: '', objectives: '', materials: '', notes: '' },
  kinGross: { activity: '', objectives: '', materials: '', notes: '' },
}

function IepSpedForm({ patient, report, onSaved, onClose, inline = true }) {
  const [f, setF] = useState({
    title: 'Individualized Education Plan',
    learnerName: patient?.name || '',
    learnerDob: patient?.date_of_birth || '',
    planStart: '',
    techName: '',
    diagnosis: '',
    caseRef: '',
    weeks: {
      1: JSON.parse(JSON.stringify(INITIAL_WEEK_STATE)),
      2: JSON.parse(JSON.stringify(INITIAL_WEEK_STATE)),
      3: JSON.parse(JSON.stringify(INITIAL_WEEK_STATE)),
      4: JSON.parse(JSON.stringify(INITIAL_WEEK_STATE)),
    },
    signatures: {
      prepared: '',
      preparedDate: '',
      checked: '',
      checkedDate: '',
      verified: '',
      verifiedDate: '',
      noted: '',
      notedDate: '',
    },
  })

  const [currentWeek, setCurrentWeek] = useState(1)
  const [busy, setBusy] = useState(false)

  // Load existing report content if editing
  useEffect(() => {
    if (report && report.content) {
      try {
        const data = typeof report.content === 'string' ? JSON.parse(report.content) : report.content
        setF((prev) => ({
          ...prev,
          ...data,
          title: report.title || prev.title,
        }))
      } catch (err) {
        console.error('Failed to parse report content:', err)
      }
    }
  }, [report])

  const setVal = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const setWeekField = (domain, field, val) => {
    setF((s) => {
      const nextWeeks = { ...s.weeks }
      nextWeeks[currentWeek] = {
        ...nextWeeks[currentWeek],
        [domain]: {
          ...nextWeeks[currentWeek][domain],
          [field]: val,
        },
      }
      return { ...s, weeks: nextWeeks }
    })
  }

  const setWeekLevel = (val) => {
    setF((s) => {
      const nextWeeks = { ...s.weeks }
      nextWeeks[currentWeek] = {
        ...nextWeeks[currentWeek],
        level: val,
      }
      return { ...s, weeks: nextWeeks }
    })
  }

  const setSig = (role, val) => {
    setF((s) => ({
      ...s,
      signatures: {
        ...s.signatures,
        [role]: val,
      },
    }))
  }

  const handleSave = async (statusValue = 'draft') => {
    setBusy(true)
    try {
      const payload = {
        id: report?.id || undefined,
        patient_id: patient.id,
        title: f.title || 'Individualized Education Plan',
        status: statusValue,
        content: JSON.stringify(f),
      }
      await api.psychometrician.addIepReport(payload)
      toast.success(statusValue === 'ready_for_review' ? 'Report routed to psychologist for review.' : 'IEP saved successfully.')
      onSaved()
    } catch (err) {
      toast.error(err.message || 'Failed to save IEP.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <FormShell
      title="Individualized Education Plan (IEP)"
      subtitle="4-week activity and progress record for Special Education (SPED) program"
      formCode="CMPS:SE-FO-10 rev.0"
      inline={inline}
    >
      <div className="space-y-6">
        {/* Title Input */}
        <div className="border-b border-purple-100 pb-4">
          <label className="block text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2">
            Plan Title / Period
          </label>
          <input
            type="text"
            className="w-full max-w-xl border border-purple-200 rounded-lg p-2.5 text-sm"
            value={f.title}
            onChange={(e) => setVal('title', e.target.value)}
            placeholder="e.g. Individualized Education Plan - July 2026"
          />
        </div>

        {/* Learner info */}
        <div>
          <FormHeading numeral="01">Learner Information</FormHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BlankField label="Learner's Name">
              <input className={blankInput} value={f.learnerName} onChange={(e) => setVal('learnerName', e.target.value)} />
            </BlankField>
            <BlankField label="Date of Birth">
              <input type="date" className={blankInput} value={f.learnerDob} onChange={(e) => setVal('learnerDob', e.target.value)} />
            </BlankField>
            <BlankField label="Plan Start Date">
              <input type="date" className={blankInput} value={f.planStart} onChange={(e) => setVal('planStart', e.target.value)} />
            </BlankField>
            <BlankField label="Behavioral Therapist / Technician">
              <input className={blankInput} value={f.techName} onChange={(e) => setVal('techName', e.target.value)} placeholder="Prepared by" />
            </BlankField>
            <BlankField label="Diagnosis / Profile">
              <input className={blankInput} value={f.diagnosis} onChange={(e) => setVal('diagnosis', e.target.value)} placeholder="e.g. ASD, Level 1" />
            </BlankField>
            <BlankField label="Case Reference No.">
              <input className={blankInput} value={f.caseRef} onChange={(e) => setVal('caseRef', e.target.value)} />
            </BlankField>
          </div>
        </div>

        {/* Week navigator */}
        <div className="mt-8 border-t border-purple-100 pt-6">
          <FormHeading numeral="02">Weekly Activities & Domains</FormHeading>
          <div className="flex gap-2 border-b border-purple-100 pb-3 overflow-x-auto">
            {[1, 2, 3, 4].map((wk) => (
              <button
                key={wk}
                type="button"
                onClick={() => setCurrentWeek(wk)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                  currentWeek === wk
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-white border-purple-100 text-purple-700 hover:bg-purple-50/50'
                }`}
              >
                Week {wk}
              </button>
            ))}
          </div>

          {/* Current Week Panels */}
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-purple-800 uppercase tracking-wider mb-3">
                Week {currentWeek} Support Needs Program Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['LSN', 'MSN', 'HSN'].map((lvl) => {
                  const labelMap = {
                    LSN: 'Low Support Needs Program',
                    MSN: 'Moderate Support Needs Program',
                    HSN: 'High Support Needs Program',
                  }
                  const checked = f.weeks[currentWeek]?.level === lvl
                  return (
                    <label
                      key={lvl}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all hover:bg-purple-50/20 ${
                        checked ? 'border-purple-600 bg-purple-50/40 shadow-sm' : 'border-purple-100 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`support-level-wk-${currentWeek}`}
                        checked={checked}
                        onChange={() => setWeekLevel(lvl)}
                        className="h-4 w-4 text-purple-700 accent-purple-700"
                      />
                      <div>
                        <span className={`inline-block text-xs font-bold font-mono px-2 py-0.5 rounded text-white ${
                          lvl === 'LSN' ? 'bg-emerald-600' : lvl === 'MSN' ? 'bg-amber-600' : 'bg-rose-600'
                        }`}>
                          {lvl}
                        </span>
                        <div className="text-xs font-semibold text-slate-800 mt-1">{labelMap[lvl]}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Domains blocks */}
            {DOMAINS.map((d) => (
              <div key={d.key} className="border border-purple-100 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-purple-50 px-4 py-2.5 font-bold text-sm text-purple-900 border-b border-purple-100">
                  {d.name}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Name of Activity</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.[d.key]?.activity || ''}
                      onChange={(e) => setWeekField(d.key, 'activity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Objectives</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.[d.key]?.objectives || ''}
                      onChange={(e) => setWeekField(d.key, 'objectives', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Instructional Materials Needed</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.[d.key]?.materials || ''}
                      onChange={(e) => setWeekField(d.key, 'materials', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.[d.key]?.notes || ''}
                      onChange={(e) => setWeekField(d.key, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Bodily Kinesthetics */}
            <div className="border border-purple-100 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-purple-50 px-4 py-2.5 font-bold text-sm text-purple-900 border-b border-purple-100">
                Bodily Kinesthetics
              </div>
              <div className="p-4 space-y-4">
                {/* Fine Motor */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-4 border-b border-purple-50 pb-1.5">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Fine Motor Skills</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Name of Activity</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinFine?.activity || ''}
                      onChange={(e) => setWeekField('kinFine', 'activity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Objectives</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinFine?.objectives || ''}
                      onChange={(e) => setWeekField('kinFine', 'objectives', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Instructional Materials Needed</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinFine?.materials || ''}
                      onChange={(e) => setWeekField('kinFine', 'materials', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinFine?.notes || ''}
                      onChange={(e) => setWeekField('kinFine', 'notes', e.target.value)}
                    />
                  </div>
                </div>

                {/* Gross Motor */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed border-purple-100">
                  <div className="md:col-span-4 border-b border-purple-50 pb-1.5">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Gross Motor Skills</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Name of Activity</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinGross?.activity || ''}
                      onChange={(e) => setWeekField('kinGross', 'activity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Objectives</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinGross?.objectives || ''}
                      onChange={(e) => setWeekField('kinGross', 'objectives', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Instructional Materials Needed</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinGross?.materials || ''}
                      onChange={(e) => setWeekField('kinGross', 'materials', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full border border-purple-100 rounded-lg p-2 text-xs"
                      value={f.weeks[currentWeek]?.kinGross?.notes || ''}
                      onChange={(e) => setWeekField('kinGross', 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign-off */}
        <div className="border-t border-purple-100 pt-6">
          <FormHeading numeral="03">Sign-off Signatures</FormHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignatureField
              label="Prepared by (Behavioral Therapist/Technician)"
              value={f.signatures.prepared}
              onChange={(val) => setSig('prepared', val)}
            />
            <div className="flex flex-col justify-end">
              <BlankField label="Date Prepared">
                <input
                  type="date"
                  className={blankInput}
                  value={f.signatures.preparedDate}
                  onChange={(e) => setSig('preparedDate', e.target.value)}
                />
              </BlankField>
            </div>

            <SignatureField
              label="Checked by (Marwin A. Gilbero Jr, RPm, CHRA - SPED Program Coordinator)"
              value={f.signatures.checked}
              onChange={(val) => setSig('checked', val)}
            />
            <div className="flex flex-col justify-end">
              <BlankField label="Date Checked">
                <input
                  type="date"
                  className={blankInput}
                  value={f.signatures.checkedDate}
                  onChange={(e) => setSig('checkedDate', e.target.value)}
                />
              </BlankField>
            </div>

            <SignatureField
              label="Verified by (Leera Mae C. Guevarra, RPm, CHRA - Learning Head)"
              value={f.signatures.verified}
              onChange={(val) => setSig('verified', val)}
            />
            <div className="flex flex-col justify-end">
              <BlankField label="Date Verified">
                <input
                  type="date"
                  className={blankInput}
                  value={f.signatures.verifiedDate}
                  onChange={(e) => setSig('verifiedDate', e.target.value)}
                />
              </BlankField>
            </div>

            <SignatureField
              label="Noted by (Dr. Jinky C. Malabanan, RPm, RPsy, CHRA - Chief Psychologist)"
              value={f.signatures.noted}
              onChange={(val) => setSig('noted', val)}
            />
            <div className="flex flex-col justify-end">
              <BlankField label="Date Noted">
                <input
                  type="date"
                  className={blankInput}
                  value={f.signatures.notedDate}
                  onChange={(e) => setSig('notedDate', e.target.value)}
                />
              </BlankField>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-purple-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => handleSave('draft')} disabled={busy}>
            Save as Draft
          </Button>
          <Button type="button" onClick={() => handleSave('ready_for_review')} disabled={busy}>
            Submit for Review
          </Button>
        </div>
      </div>
    </FormShell>
  )
}

export default IepSpedForm
