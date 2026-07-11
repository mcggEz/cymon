import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import { fieldInput } from '../../../components/ui/formStyles'

const DOMAINS = [
  {
    key: 'conceptual',
    roman: 'I',
    title: 'Conceptual Domain',
    sub: 'Communication, language, academics',
    items: [
      ['States full name, age, and identifies parents when asked.', 'Nasasabi ang buong pangalan, edad, at pangalan ng magulang kapag tinanong.'],
      ['Follows 2-step instructions (e.g., "Pick up your bag and sit down") without repeated prompting.', 'Nakakasunod sa 2 hakbang na utos nang hindi inuulit-ulit.'],
      ['Answers WH-questions (who, what, where, why) appropriately in simple conversations.', 'Nakakasagot nang tama sa sino, ano, saan, bakit sa simpleng usapan.'],
      ['Identifies and names common objects and their use (e.g., spoon is for eating).', 'Nakikilala ang bagay at alam ang gamit nito.'],
      ['Recognizes letters, numbers, colors, or shapes appropriate to age level.', 'Nakikilala ang letra, numero, kulay o hugis ayon sa edad.'],
      ['Can count objects correctly and perform simple math (if age-appropriate).', 'Nakakabilang ng tama at nakakagawa ng simpleng matematika ayon sa edad.'],
      ['Understands time concepts (today, yesterday, tomorrow) and daily schedule.', 'Naiintindihan ang kahapon, ngayon, bukas at iskedyul ng araw.'],
      ['Expresses needs, thoughts, and feelings using understandable words or gestures.', 'Naipapahayag nang malinaw ang pangangailangan o damdamin.'],
      ['Maintains attention on structured task for at least 10–15 minutes (age-appropriate).', 'Nakakapokus sa gawain ng 10–15 minuto ayon sa edad.'],
      ['Demonstrates understanding of cause and effect (e.g., "If I run, I might fall").', 'Naiintindihan ang sanhi at bunga ng kilos.'],
      ['Understands simple problem-solving (e.g., finds alternative if toy is unavailable).', 'Nakakaisip ng alternatibong solusyon sa simpleng problema.'],
      ['Reads simple words or sentences (if school-aged).', 'Nakakabasa ng simpleng salita o pangungusap ayon sa edad.'],
    ],
  },
  {
    key: 'social',
    roman: 'II',
    title: 'Social Domain',
    sub: 'Interpersonal skills, emotional regulation, social awareness',
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
    key: 'practical',
    roman: 'III',
    title: 'Practical Domain',
    sub: 'Daily living skills, self-care, functional independence',
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
    key: 'gross',
    roman: 'IV-A',
    title: 'Gross Motor Skills',
    sub: 'Malalaking galaw ng katawan',
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
    key: 'fine',
    roman: 'IV-B',
    title: 'Fine Motor Skills',
    sub: 'Maliliit na galaw ng kamay at daliri',
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
]

const TOTAL_ITEMS = DOMAINS.reduce((s, d) => s + d.items.length, 0)
const RESPONDENTS = ['Parent (Magulang)', 'Teacher (Guro)', 'Caregiver (Tagapag-alaga)', 'Others (Iba pa)']

const OPTION_STYLES = {
  YES: 'bg-emerald-600 text-white border-emerald-600',
  NO: 'bg-rose-600 text-white border-rose-600',
  NA: 'bg-slate-500 text-white border-slate-500',
}

function Segment({ id, value, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-purple-200">
      {['YES', 'NO', 'NA'].map((v) => {
        const active = value === v
        return (
          <label
            key={v}
            className={`cursor-pointer border-r border-purple-200 px-3 py-2 text-[12px] font-bold last:border-r-0 ${
              active ? OPTION_STYLES[v] : 'bg-purple-50/60 text-slate-500 hover:bg-purple-100'
            }`}
          >
            <input
              type="radio"
              name={id}
              className="sr-only"
              checked={active}
              onChange={() => onChange(id, v)}
            />
            {v === 'NA' ? 'N/A' : v}
          </label>
        )
      })}
    </div>
  )
}

function Questionnaire({ answers, setAnswer }) {
  return (
    <>
      {DOMAINS.map((d) => (
        <FormSection key={d.key} eyebrow={d.roman} title={`${d.title} — ${d.sub}`}>
          {d.items.map((it, i) => {
            const id = `${d.key}-${i}`
            return (
              <div
                key={id}
                className="grid grid-cols-1 items-center gap-3 border-b border-purple-100 py-3 last:border-b-0 sm:grid-cols-[28px_1fr_auto]"
              >
                <div className="font-mono text-[12px] text-purple-300">{i + 1}</div>
                <div>
                  <div className="text-sm text-slate-700">{it[0]}</div>
                  <div className="mt-0.5 text-[12px] italic text-slate-400">{it[1]}</div>
                </div>
                <Segment id={id} value={answers[id]} onChange={setAnswer} />
              </div>
            )
          })}
        </FormSection>
      ))}
    </>
  )
}

function ScoringSummary() {
  return (
    <FormSection title="Scoring & Results — Global Numerical Method">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                Domain
              </th>
              <th className="w-40 border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                Raw Score (YES count)
              </th>
              <th className="border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                Verbal Interpretation
              </th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.key}>
                <td className="whitespace-nowrap border border-purple-100 bg-purple-50/40 px-3 py-2 text-sm font-semibold text-slate-700">
                  {d.roman}. {d.title}
                </td>
                <td className="border border-purple-100 p-1">
                  <input type="number" className={fieldInput} placeholder={`0 / ${d.items.length}`} />
                </td>
                <td className="border border-purple-100 p-1">
                  <input type="text" className={fieldInput} placeholder="e.g. Within Age Expectation" />
                </td>
              </tr>
            ))}
            <tr>
              <td className="whitespace-nowrap border border-purple-100 bg-purple-100/60 px-3 py-2 text-sm font-bold text-purple-900">
                Maximum Total
              </td>
              <td className="border border-purple-100 p-1">
                <input type="number" className={fieldInput} placeholder={`0 / ${TOTAL_ITEMS}`} />
              </td>
              <td className="border border-purple-100 p-1">
                <input type="text" className={fieldInput} placeholder="Overall severity / interpretation" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-[13px] font-bold text-purple-900">Scoring reference</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-purple-100">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="border-b border-purple-100 px-3 py-2 text-left font-semibold uppercase tracking-wide text-purple-500">
                  Per-domain YES score
                </th>
                <th className="border-b border-purple-100 px-3 py-2 text-left font-semibold uppercase tracking-wide text-purple-500">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr><td className="border-b border-purple-50 px-3 py-1.5">0 – 2</td><td className="border-b border-purple-50 px-3 py-1.5">Severe (Impairment / Motor Delay)</td></tr>
              <tr><td className="border-b border-purple-50 px-3 py-1.5">3 – 4</td><td className="border-b border-purple-50 px-3 py-1.5">Moderate (Impairment / Motor Delay)</td></tr>
              <tr><td className="border-b border-purple-50 px-3 py-1.5">5 – 7</td><td className="border-b border-purple-50 px-3 py-1.5">Mild (Impairment / Motor Delay)</td></tr>
              <tr><td className="px-3 py-1.5">8+</td><td className="px-3 py-1.5">Within Age Expectation / No Significant Delay</td></tr>
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto rounded-lg border border-purple-100">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="border-b border-purple-100 px-3 py-2 text-left font-semibold uppercase tracking-wide text-purple-500">
                  Global total (max {TOTAL_ITEMS})
                </th>
                <th className="border-b border-purple-100 px-3 py-2 text-left font-semibold uppercase tracking-wide text-purple-500">
                  Overall severity
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr><td className="border-b border-purple-50 px-3 py-1.5">0 – 19</td><td className="border-b border-purple-50 px-3 py-1.5">Severe Impairment</td></tr>
              <tr><td className="border-b border-purple-50 px-3 py-1.5">20 – 33</td><td className="border-b border-purple-50 px-3 py-1.5">Moderate Impairment</td></tr>
              <tr><td className="border-b border-purple-50 px-3 py-1.5">34 – 44</td><td className="border-b border-purple-50 px-3 py-1.5">Mild Impairment</td></tr>
              <tr><td className="px-3 py-1.5">45 – {TOTAL_ITEMS}</td><td className="px-3 py-1.5">Within Age Expectation</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField label="Checked and Approved by">
          <input className={fieldInput} defaultValue="Cristine Lae C. Erasga" />
          <p className="mt-1 text-[11px] text-slate-400">Clinic Psychologist / Supervisor</p>
        </FormField>
        <FormField label="License Number">
          <input className={fieldInput} defaultValue="0001942" />
        </FormField>
      </div>
    </FormSection>
  )
}

function FormBody() {
  const [answers, setAnswers] = useState({})
  const [respondent, setRespondent] = useState('')
  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }))

  return (
    <div>
      <FormSection title="Child Information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Child's Name / Pangalan">
            <input className={fieldInput} placeholder="Full name" />
          </FormField>
          <FormField label="Date / Petsa">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField label="Age / Edad">
            <input className={fieldInput} placeholder="e.g. 6 years old" />
          </FormField>
          <FormField label="Gender / Kasarian">
            <select className={fieldInput} defaultValue="">
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </FormField>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Respondent / Sumagot">
            <div className="flex flex-wrap gap-2">
              {RESPONDENTS.map((r) => {
                const active = respondent === r
                return (
                  <label
                    key={r}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] ${
                      active
                        ? 'border-purple-400 bg-purple-100 font-semibold text-purple-900'
                        : 'border-purple-200 bg-purple-50/60 text-slate-600 hover:bg-purple-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="respondent"
                      className="sr-only"
                      checked={active}
                      onChange={() => setRespondent(r)}
                    />
                    {r}
                  </label>
                )
              })}
            </div>
          </FormField>
          <FormField label="If Others, please specify">
            <input className={fieldInput} placeholder="Specify relationship / role" />
          </FormField>
        </div>
      </FormSection>

      <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50/60 p-4 text-[13px] text-purple-900">
        <b className="font-semibold">Instruction:</b> Please answer each statement with <b className="font-semibold">YES</b> if
        the child is able to do the skill independently or age-appropriately. Mark <b className="font-semibold">N/A</b> only
        if the item is not yet age-appropriate for the child.
        <span className="mt-1 block italic text-purple-500">
          (Panuto: Sagutin ng OO kung nagagawa ng bata ang kasanayan nang naaayon sa kanyang edad at may kaunting gabay
          lamang. Markahan ng N/A kung hindi pa akma sa edad ng bata ang tanong.)
        </span>
      </div>

      <Questionnaire answers={answers} setAnswer={setAnswer} />
      <ScoringSummary />
    </div>
  )
}

function AdaptiveFunctioningForm({ onClose }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <FormShell
      title="Child Adaptive Functioning Checklist"
      subtitle="Konseptwal, Sosyal, Praktikal, at Motor na Kakayahan ng Bata"
      code="CMPS-2026-02-18-Rev.1"
      onReset={() => setResetKey((k) => k + 1)}
      onClose={onClose}
    >
      <FormBody key={resetKey} />
    </FormShell>
  )
}

export default AdaptiveFunctioningForm
