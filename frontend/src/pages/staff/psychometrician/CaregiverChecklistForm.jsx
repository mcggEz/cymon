import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import { fieldInput } from '../../../components/ui/formStyles'
import SignaturePad from '../../../components/ui/SignaturePad'

const DOMAINS = [
  {
    title: 'I. Conceptual Domain',
    sub: '(Konseptwal na Kakayahan) — Communication, Language, Academics',
    type: 'yna',
    items: [
      ['States full name, age, and identifies parents when asked.', 'Nasasabi ang buong pangalan, edad, at pangalan ng magulang kapag tinanong.'],
      ['Follows two-step instructions (e.g., "Pick up your bag and sit down") without repeated prompting.', 'Nakakasunod sa dalawang hakbang na utos nang hindi inuulit-ulit.'],
      ['Answers WH-questions (who, what, where, why) appropriately in simple conversations.', 'Nakakasagot nang tama sa sino, ano, saan, bakit sa simpleng usapan.'],
      ['Identifies and names common objects and their use (e.g. spoon is for eating).', 'Nakikilala ang bagay at alam ang gamit nito.'],
      ['Recognizes letters, numbers, colors, or shapes appropriate to age level.', 'Nakikilala ang letra, numero, kulay o hugis ayon sa edad.'],
      ['Can count objects correctly and perform simple math (if age-appropriate).', 'Nakakabilang nang tama at nakasasagot ng simpleng matematika ayon sa edad.'],
      ['Understands time concepts (today, yesterday, tomorrow) and daily schedule.', 'Naiintindihan ang kahapon, ngayon, bukas at iskedyul ng araw.'],
      ['Expresses needs, thoughts, and feelings using understandable words or gestures.', 'Naipapahayag nang malinaw ang pangangailangan o damdamin.'],
      ['Maintains attention on structured task for at least 10–15 minutes (age-appropriate).', 'Nakakapokus sa gawain ng 10–15 minuto ayon sa edad.'],
      ['Demonstrates understanding of cause and effect (e.g., "If I run, I might fall").', 'Naiintindihan ang sanhi at bunga ng kilos.'],
      ['Understands simple problem-solving (e.g., finds alternative if toy is unavailable).', 'Nakakaisip ng alternatibong solusyon sa simpleng problema.'],
      ['Reads simple words or sentences (if school-aged).', 'Nakakabasa ng simpleng salita o pangungusap ayon sa edad.'],
    ],
  },
  {
    title: 'II. Social Domain',
    sub: '(Interpersonal Skills, Emotional Regulation, Social Awareness)',
    type: 'yna',
    items: [
      ['Initiates interaction with peers or adults appropriately.', 'Kusang nakikipag-ugnayan sa kapwa bata o nakatatanda.'],
      ['Maintains appropriate eye contact during conversation.', 'Nakikipag-eye contact sa pakikipag-usap.'],
      ['Responds appropriately when name is called.', 'Tumutugon agad kapag tinatawag ang pangalan.'],
      ['Engages in cooperative play (sharing, turn-taking).', 'Nakikipaglaro nang may salitan at pagbabahagi.'],
      ['Understands personal space and boundaries.', 'Naiintindihan ang personal space at limitasyon ng iba.'],
      ['Expresses emotions appropriately without extreme reactions.', 'Naipapahayag ang emosyon nang hindi labis o marahas.'],
      ['Recovers from frustration within reasonable time (without prolonged meltdown).', 'Nakakabawi agad matapos mainis o magalit.'],
      ['Shows empathy (comforts others who are hurt or sad).', 'Nakikiramay kapag may nasasaktan o nalulungkot.'],
      ['Follows group rules in school/home setting.', 'Nakakasunod sa patakaran sa bahay o paaralan.'],
      ['Adjusts behavior according to situation (formal vs play setting).', 'Naaangkop ang kilos sa sitwasyon.'],
      ['Understands simple social cues (e.g., someone is angry or joking).', 'Naiintindihan ang simpleng senyales ng emosyon ng iba.'],
      ['Avoids aggressive behaviors (hitting, biting, throwing objects).', 'Hindi madalas nananakit o naghahagis ng gamit.'],
      ['Can recognize familiar faces such as family members, teacher, or peers.', 'Nakakakilala sa mga pamilyar na mukha tulad ng kapamilya, guro o kaibigan.'],
    ],
  },
  {
    title: 'III. Practical Domain',
    sub: '(Daily Living Skills, Self-Care, Functional Independence)',
    type: 'yna',
    items: [
      ['Eats independently using utensils properly.', 'Nakakakain nang mag-isa gamit ang kutsara/tinidor.'],
      ['Dresses and undresses with minimal help.', 'Nakakapagbihis at hubad na may kaunting tulong lamang.'],
      ['Uses toilet independently and maintains cleanliness.', 'Nakakagamit ng palikuran nang mag-isa at malinis.'],
      ['Brushes teeth and washes hands independently.', 'Marunong magsipilyo at maghugas ng kamay mag-isa.'],
      ['Follows daily routine (wakes up, prepares for school).', 'Nakakasunod sa pang-araw-araw na rutina.'],
      ['Packs and organizes school materials.', 'Nakakaayos at nakakapag-impake ng gamit sa paaralan.'],
      ['Understands basic money value and transactions (age-appropriate).', 'May simpleng kaalaman sa halaga ng pera.'],
      ['Demonstrates awareness of safety (traffic, strangers, sharp objects).', 'May kamalayan sa panganib tulad ng sasakyan o matutulis na bagay.'],
      ['Completes simple household chores when instructed.', 'Nakakagawa ng simpleng gawaing bahay kapag inutusan.'],
      ['Travels short familiar distances with supervision (age-appropriate).', 'Kayang pumunta sa malapit na lugar na may gabay.'],
      ['Manages personal belongings responsibly.', 'Inaalagaan ang sariling gamit.'],
      ['Seeks help appropriately when confused or unsafe.', 'Humihingi ng tulong kapag nalilito o nasa panganib.'],
    ],
  },
  {
    title: 'IV. Motor Development Domain',
    sub: 'A. Gross Motor Skills',
    type: 'yn',
    items: [
      ['Walks, runs, and stops without losing balance.', 'Nakakalakad at nakakatakbo nang hindi nawawalan ng balanse.'],
      ['Jumps forward with both feet together.', 'Nakakatatalon pasulong gamit ang dalawang paa.'],
      ['Climbs stairs alternating feet (age-appropriate).', 'Nakakaakyat ng hagdan nang salitan ang paa.'],
      ['Kicks a ball with coordination and balance.', 'Nakakasipa ng bola nang maayos ang balanse.'],
      ['Throws and catches a medium-sized ball.', 'Nakakahagis at nakakasalo ng bola.'],
      ['Maintains balance while standing on one foot for 5 seconds.', 'Kayang tumayo sa isang paa nang 5 segundo.'],
      ['Participates in playground activities without excessive clumsiness.', 'Nakakalahok sa laro nang hindi madalas nadadapa.'],
      ['Demonstrates body awareness (avoids bumping into objects frequently).', 'May kamalayan sa galaw ng katawan at hindi palaging nababangga.'],
      ['Coordinates both sides of the body (e.g., skipping, hopping).', 'Naiko-coordinate ang galaw ng magkabilang bahagi ng katawan.'],
      ['Shows adequate muscle strength for age (e.g., lifting school bag).', 'May sapat na lakas ayon sa edad.'],
    ],
  },
  {
    title: '',
    sub: 'B. Fine Motor Skills',
    type: 'yna',
    items: [
      ['Holds pencil or crayon with appropriate grip.', 'Hawak ang lapis o krayola nang tama.'],
      ['Copies basic shapes (circle, square, triangle).', 'Nakakagaya ng simpleng hugis.'],
      ['Writes letters or name legibly (age-appropriate).', 'Nakakasulat nang malinaw ayon sa edad.'],
      ['Uses scissors to cut along a line.', 'Nakakagamit ng gunting nang maayos.'],
      ['Buttons/unbuttons clothing independently.', 'Nakakapagbutones at tanggal ng butones mag-isa.'],
      ['Manipulates small objects (beads, coins) without dropping frequently.', 'Nakakahawak ng maliliit na bagay nang hindi madaling nalalaglag.'],
      ['Colors within lines most of the time.', 'Nakakapagkulay sa loob ng linya.'],
      ['Assembles puzzles appropriate for age.', 'Nakakabuo ng puzzle ayon sa edad.'],
      ['Demonstrates hand-eye coordination (e.g., tracing, drawing).', 'May maayos na koordinasyon ng mata at kamay.'],
      ['Shows endurance during writing tasks (does not tire easily).', 'Hindi agad napapagod sa pagsusulat.'],
    ],
  },
  {
    title: 'Perceptual Disturbances',
    sub: '',
    type: 'yn',
    items: [
      ['Hallucination', ''],
      ['Delusions', ''],
    ],
  },
  {
    title: 'Stimming',
    sub: '',
    type: 'yn',
    items: [
      ['Verbal (echolalia, humming)', ''],
      ['Auditory (sound sensitivity)', ''],
      ['Visual (fixation to objects, constant eye movement)', ''],
      ['Proprioceptive (jumping, crashing into objects)', ''],
      ['Vestibular (rocking, spinning)', ''],
      ['Oral (chewing, biting, sucking)', ''],
      ['Tactile (excoriation, skin rubbing, fidgeting)', ''],
    ],
  },
]

let counter = 0
const DOMAINS_NUM = DOMAINS.map((d) => ({
  ...d,
  items: d.items.map(([en, fil]) => ({ n: (counter += 1), en, fil })),
}))
const TOTAL_ITEMS = counter

const ANSWER_STYLES = {
  yes: 'border-emerald-100 bg-emerald-100 text-emerald-700',
  no: 'border-rose-100 bg-rose-100 text-rose-700',
  na: 'border-slate-200 bg-slate-200 text-slate-500',
}

function AnswerGroup({ row, type, value, onChange }) {
  const opts =
    type === 'yn'
      ? [
          ['yes', 'Yes'],
          ['no', 'No'],
        ]
      : [
          ['yes', 'Yes'],
          ['no', 'No'],
          ['na', 'N/A'],
        ]
  return (
    <div className="flex gap-1">
      {opts.map(([v, label]) => {
        const active = value === v
        return (
          <label
            key={v}
            className={`flex-1 cursor-pointer select-none rounded-md border py-1.5 text-center text-[11px] font-bold ${
              active ? ANSWER_STYLES[v] : 'border-purple-200 text-slate-400'
            }`}
          >
            <input
              type="radio"
              name={`row-${row}`}
              value={v}
              checked={active}
              onChange={() => onChange(row, v)}
              className="hidden"
            />
            {label}
          </label>
        )
      })}
    </div>
  )
}

const RESPONDENTS = ['Parent', 'Guardian', 'Teacher', 'Others']

function CaregiverChecklistForm({ onClose }) {
  const [respondent, setRespondent] = useState('')
  const [answers, setAnswers] = useState({})
  const [caregiverSig, setCaregiverSig] = useState(null)
  const [evaluatorSig, setEvaluatorSig] = useState(null)

  const setAnswer = (row, v) => setAnswers((prev) => ({ ...prev, [row]: v }))

  const answered = Object.keys(answers).length
  const pct = TOTAL_ITEMS ? Math.round((answered / TOTAL_ITEMS) * 100) : 0

  return (
    <FormShell
      title="Caregiver Behavioral Observation Checklist"
      code="CMPS:SE-FO-03 rev.0 02192026"
      onClose={onClose}
    >
      <FormSection eyebrow="01" title="Personal Information of Student">
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <FormField label="Date">
            <input className={fieldInput} type="date" />
          </FormField>
          <FormField label="Full Name (LN, FN MI)">
            <input className={fieldInput} type="text" placeholder="e.g. Dela Cruz, Juan M." />
          </FormField>
          <FormField label="Birthday">
            <input className={fieldInput} type="date" />
          </FormField>
          <FormField label="Age / Sex">
            <input className={fieldInput} type="text" placeholder="e.g. 7 / Male" />
          </FormField>
        </div>
        <FormField label="Respondent">
          <div className="flex flex-wrap gap-2">
            {RESPONDENTS.map((r) => {
              const active = respondent === r
              return (
                <label
                  key={r}
                  className={`cursor-pointer select-none rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                    active
                      ? 'border-purple-400 bg-purple-100 text-purple-900'
                      : 'border-purple-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="respondent"
                    value={r}
                    checked={active}
                    onChange={() => setRespondent(r)}
                    className="hidden"
                  />
                  {r}
                </label>
              )
            })}
          </div>
        </FormField>
        {respondent === 'Others' ? (
          <div className="mt-3 max-w-xs">
            <input className={fieldInput} type="text" placeholder="Please specify" />
          </div>
        ) : null}
      </FormSection>

      <FormSection eyebrow="02" title="Diagnosis">
        <FormField label="Was the student previously diagnosed / assessed?" className="mb-4">
          <div className="flex max-w-[260px] gap-2.5">
            {['Yes', 'No'].map((v) => (
              <label
                key={v}
                className="flex-1 cursor-pointer rounded-md border border-purple-200 py-2 text-center text-sm font-semibold text-slate-700 has-[:checked]:border-purple-400 has-[:checked]:bg-purple-100 has-[:checked]:text-purple-900"
              >
                <input type="radio" name="prevDiag" value={v} className="hidden" />
                {v}
              </label>
            ))}
          </div>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Diagnosis">
            <input className={fieldInput} type="text" />
          </FormField>
          <FormField label="Medical History">
            <input className={fieldInput} type="text" />
          </FormField>
          <FormField label="Family History">
            <input className={fieldInput} type="text" />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="03" title="Instruction (Panuto)">
        <div className="rounded-xl bg-purple-50 px-4 py-3.5 text-sm text-purple-900">
          Please answer each statement with YES if the child is able to do the skill independently or
          age-appropriate.
          <div className="mt-1 italic text-purple-500">
            (Sagutin ng OO kung nagagawa ng bata ang kasanayan nang naaayon sa kanyang edad at may
            kaunting gabay lamang.)
          </div>
        </div>
      </FormSection>

      <FormSection eyebrow="Progress" title="Checklist completion">
        <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100">
          <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>
            {answered} of {TOTAL_ITEMS} items answered
          </span>
          <span>{pct}%</span>
        </div>
      </FormSection>

      <FormSection eyebrow="04" title="Behavioral Checklist">
        {DOMAINS_NUM.map((domain, di) => (
          <div key={di}>
            {domain.title ? (
              <div className="mt-6 border-t-2 border-purple-100 pt-3.5 font-serif text-base font-semibold text-purple-900 first:mt-0 first:border-none first:pt-0">
                {domain.title}
              </div>
            ) : null}
            {domain.sub ? (
              <div className="mb-3 text-xs italic text-purple-500">{domain.sub}</div>
            ) : null}
            {domain.items.map((it) => (
              <div key={it.n}>
                <div className="grid grid-cols-[26px_1fr] gap-3 border-b border-dashed border-purple-100 py-2.5 sm:grid-cols-[26px_1fr_170px]">
                  <div className="pt-0.5 font-mono text-[11px] text-purple-300">{it.n}</div>
                  <div className="text-sm text-slate-800">
                    {it.en}
                    {it.fil ? (
                      <span className="mt-0.5 block text-xs italic text-slate-400">({it.fil})</span>
                    ) : null}
                  </div>
                  <div className="col-span-2 mt-2 max-w-[260px] sm:col-span-1 sm:mt-0 sm:max-w-none">
                    <AnswerGroup row={it.n} type={domain.type} value={answers[it.n]} onChange={setAnswer} />
                  </div>
                </div>
                <div className="-mt-1 pb-2 pl-9 pr-1">
                  <input className={fieldInput} type="text" placeholder="Remarks (optional)" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </FormSection>

      <FormSection eyebrow="Sign-off" title="Acknowledgment and Signatures">
        <div className="rounded-xl bg-purple-50 px-4 py-4">
          <p className="text-sm italic text-purple-900">
            I understand that the information I provide during this interview is essential to the
            accuracy of my child&apos;s behavioral assessment. I commit to giving complete, and
            accurate responses to the best of my knowledge. I acknowledge that my responses will be
            considered as part of the evaluation process to help ensure that the results reflect my
            child&apos;s current functioning and needs.
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg bg-white px-3 py-2.5">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-purple-700" />
            <span className="text-xs font-semibold text-purple-900">
              I have read, understood, and agree to the statement above.
            </span>
          </label>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <SignaturePad
              label="Signature over Printed Name of Caregiver"
              value={caregiverSig}
              onChange={setCaregiverSig}
            />
            <FormField label="Date" className="mt-3">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>
          <div>
            <SignaturePad
              label="Signature over Printed Name of Evaluator"
              value={evaluatorSig}
              onChange={setEvaluatorSig}
            />
            <FormField label="Date" className="mt-3">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>
        </div>
      </FormSection>
    </FormShell>
  )
}

export default CaregiverChecklistForm
