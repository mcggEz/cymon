import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import { blankInput, cellInput } from '../../../components/ui/formStyles'

const th = 'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const rowLabelCell = 'border border-slate-500 bg-purple-50 px-2 py-1 text-left text-sm text-slate-800'
const inputCell = 'border border-slate-500 p-0 text-center'
const numCell = 'border border-slate-500 bg-purple-50 px-2 py-1 text-center text-xs text-slate-600'

const YNA = ['Yes', 'No', 'N/A']
const YN = ['Yes', 'No']

const CONCEPTUAL = [
  ['States full name, age, and identifies parents when asked.', 'Nasasabi ang buong pangalan, edad, at pangalan ng magulang kapag tinanong.'],
  ['Follows two-step instructions (e.g., "Pick up your bag and sit down") without repeated prompting.', 'Nakakasunod sa dalawang hakbang na utos nang hindi inuulit-ulit.'],
  ['Answers WH-questions (who, what, where, why) appropriately in simple conversations.', 'Nakakasagot nang tama sa sino, ano, saan, bakit sa simpleng usapan.'],
  ['Identifies and names common objects and their use (e.g. spoon is for eating).', 'Nakikilala ang bagay at alam ang gamit nito.'],
  ['Recognizes letters, numbers, colors, or shapes appropriate to age level.', 'Nakikilala ang letra, numero, kulay o hugis ayon sa edad.'],
  ['Can count objects correctly and perform simple math (if age-appropriate).', 'Nakakabilang nang tama at nakasasagot ng simpleng matematika ayon sa edad.'],
  ['Understands time concepts (today, yesterday, tomorrow) and daily schedule.', 'Naiintindihan ang kahapon, ngayon, bukas at iskedyul ng araw.'],
  ['Expresses needs, thoughts, and feelings using understandable words or gestures.', 'Naipapahayag nang malinaw ang pangangailangan o damdamin.'],
  ['Maintains attention on structured task for at least 10-15 minutes (age-appropriate).', 'Nakakapokus sa gawain ng 10-15 minuto ayon sa edad.'],
  ['Demonstrates understanding of cause and effect (e.g., "If I run, I might fall").', 'Naiintindihan ang sanhi at bunga ng kilos.'],
  ['Understands simple problem-solving (e.g., finds alternative if toy is unavailable).', 'Nakakaisip ng alternatibong solusyon sa simpleng problema.'],
  ['Reads simple words or sentences (if school-aged).', 'Nakakabasa ng simpleng salita o pangungusap ayon sa edad.'],
]

const SOCIAL = [
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
]

const PRACTICAL = [
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
]

const GROSS_MOTOR = [
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
]

const FINE_MOTOR = [
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
]

const PERCEPTUAL = ['Hallucination', 'Delusions']

const STIMMING = [
  'Verbal (echolalia, humming)',
  'Auditory (sound sensitivity)',
  'Visual (fixation to objects, constant eye movement)',
  'Proprioceptive (jumping, crashing into objects)',
  'Vestibular (rocking, spinning)',
  'Oral (chewing, biting, sucking)',
  'Tactile (excoriation, skin rubbing, fidgeting)',
]

function CheckCell() {
  return (
    <td className={inputCell}>
      <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" />
    </td>
  )
}

function BehaviorTable({ title, sub, columns, items }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={th} colSpan={2 + columns.length}>
              {title}
              {sub ? <div className="text-[11px] font-semibold italic">{sub}</div> : null}
            </th>
          </tr>
          <tr>
            <th className={`${th} w-10`}>No.</th>
            <th className={th}>Behavior Indicator</th>
            {columns.map((c) => (
              <th key={c} className={`${th} w-14`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(([en, fil], i) => (
            <tr key={en}>
              <td className={numCell}>{i + 1}</td>
              <td className={rowLabelCell}>
                {en}
                {fil ? <span className="block text-xs italic text-slate-500">({fil})</span> : null}
              </td>
              {columns.map((c) => (
                <CheckCell key={c} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RemarksTable({ title, items }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`${th} w-10`}>No.</th>
            <th className={th}>{title}</th>
            <th className={`${th} w-14`}>Yes</th>
            <th className={`${th} w-14`}>No</th>
            <th className={`${th} w-64`}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((label, i) => (
            <tr key={label}>
              <td className={numCell}>{i + 1}</td>
              <td className={rowLabelCell}>{label}</td>
              <CheckCell />
              <CheckCell />
              <td className={inputCell}>
                <input className={cellInput} type="text" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const respondentBox = 'flex items-center gap-1.5 text-sm text-slate-800'

function CaregiverChecklistForm({ onClose, readOnly = false, inline = false }) {
  return (
    <FormShell
      title="Caregiver Behavioral Observation Checklist"
      code="CMPS:SE-FO-03 rev.0 02192026"
      confidential={false}
      onClose={onClose}
      multiPage={true}
      inline={inline}
    >
      <fieldset disabled={readOnly} className="space-y-4">
        <BlankField label="Date" labelClassName="w-32" className="mt-1 max-w-md" />

        <FormHeading>Personal Information of Student</FormHeading>
        <div className="space-y-2">
          <BlankField label="Full Name (LN, FN MI)" labelClassName="w-52" />
          <BlankField label="Birthday" labelClassName="w-52" />
          <BlankField label="Age/Sex" labelClassName="w-52" />
          <BlankField label="Respondent" labelClassName="w-52">
            <div className="flex flex-wrap items-center gap-4">
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Parent
              </label>
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Guardian
              </label>
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Teacher
              </label>
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Others:
              </label>
              <input className={`${blankInput} w-40`} type="text" />
            </div>
          </BlankField>
        </div>

        <FormHeading>Diagnosis</FormHeading>
        <div className="space-y-2">
          <BlankField label="Was the student previously diagnosed/assessed?" labelClassName="w-80">
            <div className="flex items-center gap-6">
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Yes
              </label>
              <label className={respondentBox}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> No
              </label>
            </div>
          </BlankField>
          <BlankField label="Diagnosis" labelClassName="w-52" />
          <BlankField label="Medical History" labelClassName="w-52" />
          <BlankField label="Family History" labelClassName="w-52" />
        </div>

        <FormHeading>Instruction (Panuto)</FormHeading>
        <p className="text-[12.5px] text-slate-800">
          Please answer each statement with YES (OO) if the child is able to do the skill independently or
          age-appropriate.
        </p>
        <p className="text-xs italic text-slate-500">
          (Sagutin ng OO kung nagagawa ng bata ang kasanayan nang naaayon sa kanyang edad at may kaunting
          gabay lamang.)
        </p>

        <BehaviorTable
          title="I. CONCEPTUAL DOMAIN (Konseptwal na Kakayahan)"
          sub="(Communication, Language, Academics)"
          columns={YNA}
          items={CONCEPTUAL}
        />
        <BehaviorTable
          title="II. SOCIAL DOMAIN"
          sub="(Interpersonal Skills, Emotional Regulation, Social Awareness)"
          columns={YNA}
          items={SOCIAL}
        />
      </fieldset>

      <fieldset disabled={readOnly} className="space-y-4">
        <BehaviorTable
          title="III. PRACTICAL DOMAIN"
          sub="(Daily Living Skills, Self-Care, Functional Independence)"
          columns={YNA}
          items={PRACTICAL}
        />
        <BehaviorTable
          title="IV. MOTOR DEVELOPMENT DOMAIN"
          sub="A. GROSS MOTOR SKILLS"
          columns={YN}
          items={GROSS_MOTOR}
        />
        <BehaviorTable
          title="IV. MOTOR DEVELOPMENT DOMAIN"
          sub="B. FINE MOTOR SKILLS"
          columns={YNA}
          items={FINE_MOTOR}
        />

        <RemarksTable title="PERCEPTUAL DISTURBANCES" items={PERCEPTUAL} />
        <RemarksTable title="STIMMING" items={STIMMING} />

        <p className="mt-6 text-[12.5px] italic text-slate-800 leading-snug">
          I understand that the information I provide during this interview is essential to the accuracy of
          my child&apos;s behavioral assessment. I commit to giving complete, and accurate responses to the
          best of my knowledge. I acknowledge that my responses will be considered as part of the evaluation
          process to help ensure that the results reflect my child&apos;s current functioning and needs.
        </p>

        <div className="mt-8 flex flex-col gap-6 text-sm sm:flex-row sm:justify-between sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type Caregiver Name..."
              className="w-full bg-transparent text-sm text-slate-800 border-b border-slate-300 hover:border-slate-400 focus:border-purple-600 focus:outline-none print:border-none"
            />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Signature over Printed Name of Caregiver / Date
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type Evaluator Name..."
              className="w-full bg-transparent text-sm text-slate-800 border-b border-slate-300 hover:border-slate-400 focus:border-purple-600 focus:outline-none print:border-none"
            />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Signature over Printed Name of Evaluator / Date
            </div>
          </div>
        </div>
      </fieldset>
    </FormShell>
  )
}

export default CaregiverChecklistForm
