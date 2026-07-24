import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import { cellInput } from '../../../components/ui/formStyles'

const th =
  'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const rowLabelCell = 'border border-slate-500 bg-purple-50 px-2 py-1 text-left text-sm text-slate-800'
const inputCell = 'border border-slate-500 p-0 text-center'
const tokenCell = 'border border-slate-500 px-2 py-1.5 align-top'

const MATHEMATICS = [
  {
    label: 'COLORS',
    tokens: ['Red', 'Green', 'Pink', 'Purple', 'Brown', 'Yellow', 'Orange', 'Black', 'White', 'Blue'],
  },
  {
    label: 'SHAPES',
    tokens: ['Square', 'Rectangle', 'Heart', 'Oval', 'Triangle', 'Circle', 'Diamond', 'Star'],
  },
  {
    label: 'NUMBERS',
    tokens: [
      '1', '5', '7', '9', '3', '2', '6', '4', '8', '10', '13', '15', '17',
      '12', '19', '14', '11', '18', '16', '22', '24', '29',
    ],
  },
  {
    label: 'VALUE',
    tokens: ['35', '40', '60', '20', '25', '50', '90', '21', '100'],
  },
  {
    label: 'WORD RECOGNITION',
    tokens: [
      'One', 'Seven', 'Four', 'Six', 'Nine', 'Five', 'Two', 'Three', 'Eight', 'Ten',
      'Nineteen', 'Twenty-One', 'Thirty', 'Eleven', 'Thirteen', 'Seventeen', 'Fifty', 'Sixty-Five',
    ],
  },
]

const UPPERCASE = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ')
const LOWERCASE = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ')
const LETTER_SOUNDS =
  'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz'.split(' ')

const LETTER_RECOGNITION = [
  { label: 'UPPERCASE', tokens: UPPERCASE },
  { label: 'lowercase', tokens: LOWERCASE },
  { label: 'Letter Sounds', tokens: LETTER_SOUNDS },
]

const WORD_RECOGNITION = [
  {
    label: 'CVC WORDS',
    tokens: [
      'Cat', 'Bed', 'Wig', 'Fun', 'Did', 'Jam', 'Pet', 'Rim', 'Leg', 'Tap', 'Pin', 'Cut',
      'Hen', 'Van', 'Tip', 'Gum', 'Fin', 'Set', 'Pan', 'Mat', 'Run', 'Him', 'Peg', 'Jam',
    ],
  },
  {
    label: 'ACTION WORDS',
    tokens: [
      'Jump', 'Push', 'Walk', 'Throw', 'Climb', 'Pull', 'Eat', 'Sing', 'Swim', 'Read', 'Write',
      'Laugh', 'Clean', 'Wash', 'Sleep', 'Dance', 'Talk', 'Think', 'Crawl', 'Ride', 'Cry', 'Kick', 'Sit',
    ],
  },
  {
    label: 'DESCRIBING WORDS',
    tokens: [
      'Loud', 'Hard', 'Smooth', 'Dry', 'Hot', 'Small', 'Soft', 'Sharp', 'Wet', 'Quiet', 'Large',
      'Cold', 'Dark', 'Sweet', 'Light', 'Sour', 'Salty', 'Spicy', 'Bitter',
    ],
  },
  {
    label: 'PREPOSITIONS',
    tokens: [
      'In', 'Under', 'At', 'Beside', 'Between', 'Over', 'On', 'Behind', 'As', 'Near', 'Front',
      'Down', 'Up', 'An', 'Above', 'Next', 'Across', 'Off', 'Right', 'Through', 'Among',
    ],
  },
]

function Check({ label }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-800">
      <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" />
      <span>{label}</span>
    </label>
  )
}

function AssessmentTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`${th} w-32`}>Category</th>
            <th className={th}>Items</th>
            <th className={`${th} w-16`}>Score</th>
            <th className={`${th} w-52`}>Verbal Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className={`${rowLabelCell} font-bold uppercase`}>{r.label}</td>
              <td className={tokenCell}>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-slate-800">
                  {r.tokens.map((t, i) => (
                    <span key={`${t}-${i}`}>{t}</span>
                  ))}
                </div>
              </td>
              <td className={inputCell}>
                <input type="number" className={cellInput} />
              </td>
              <td className={inputCell}>
                <input type="text" className={cellInput} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdaptiveFunctioningForm({ onClose, inline = false }) {
  return (
    <FormShell
      title="Child Adaptive Functioning Assessment Tool"
      code="CMPS:SE-FO-05 rev.0 02192026"
      confidential={false}
      onClose={onClose}
      multiPage={true}
      inline={inline}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <BlankField label="Name of Student:" />
          <BlankField label="Age / Gender:" />
          <BlankField label="Name of Guardian:" />
          <BlankField label="Name of Assessor:" />
        </div>

        <FormHeading numeral="">Mathematics</FormHeading>
        <AssessmentTable rows={MATHEMATICS} />

        <FormHeading numeral="">Literacy (Letter Recognition)</FormHeading>
        <AssessmentTable rows={LETTER_RECOGNITION} />
      </div>

      <div className="space-y-4">
        <FormHeading numeral="">Literacy (Word Recognition)</FormHeading>
        <AssessmentTable rows={WORD_RECOGNITION} />

        <FormHeading numeral="">Writing and Name Recognition</FormHeading>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${th} w-1/2`}>Name Recognition</th>
                <th className={`${th} w-1/2`}>Handwriting</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${rowLabelCell} align-top`}>
                  <div className="space-y-2 py-1">
                    {['Name Recognition', 'Write Name', 'Spell Name'].map((item) => (
                      <div key={item} className="flex items-center justify-between gap-4">
                        <span className="text-[12.5px] text-slate-800">{item}</span>
                        <span className="flex shrink-0 gap-4">
                          <Check label="YES" />
                          <Check label="NO" />
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className={`${rowLabelCell} align-top`}>
                  <div className="space-y-3 py-1">
                    <div>
                      <div className="mb-1 text-[12.5px] font-bold text-slate-800">Dominant Hand</div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <Check label="LEFT" />
                        <Check label="RIGHT" />
                        <Check label="BOTH" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-[12.5px] font-bold text-slate-800">Pencil Grip</div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <Check label="FISTED" />
                        <Check label="4-FINGER" />
                        <Check label="STATIC TRIPOD" />
                        <Check label="DYNAMIC TRIPOD" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="mt-8 border-t border-slate-700" />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Assessor&apos;s Signature Over Printed Name
            </div>
          </div>
          <div>
            <div className="mt-8 border-t border-slate-700" />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Date
            </div>
          </div>
        </div>
      </div>
    </FormShell>
  )
}

export default AdaptiveFunctioningForm
