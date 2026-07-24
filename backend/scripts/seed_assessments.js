// Seeds the assessment engine + reports + interventions + roster classification
// so the client assessment pages and the psychometrician/psychologist portals
// render real data. Idempotent: clears and re-creates the demo rows.
//
// Usage: node scripts/seed_assessments.js   (run after seed_demo.js)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = (process.env.SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const MMSE_STRUCTURE = [
  {
    key: 'practical',
    title: 'I. Practical Domain',
    items: [
      { key: 'practical_a1', label: 'Appearance - Dresses appropriately for the occasion' },
      { key: 'practical_b1', label: 'Activities of Daily Living - Opens a simple container or zipper' },
      { key: 'practical_b2', label: 'Activities of Daily Living - Can demonstrate handwashing when asked' },
      { key: 'practical_b3', label: 'Activities of Daily Living - Removes or puts on a cloth/item (shoe, earring)' },
      { key: 'practical_b4', label: 'Activities of Daily Living - Can independently drink from a cup or bottle' }
    ]
  },
  {
    key: 'conceptual',
    title: 'II. Conceptual Domain',
    items: [
      { key: 'conceptual_a1', label: 'Object Recognition - Names at least two (2) familiar objects (pen, bottle)' },
      { key: 'conceptual_a2', label: 'Object Recognition - Can identify familiar faces (mother, father)' },
      { key: 'conceptual_b1', label: 'Identifying Details - Can state his/her own name' },
      { key: 'conceptual_b2', label: 'Identifying Details - Can tell his/her birthday and/or age' },
      { key: 'conceptual_c1', label: 'Place Recognition - Can identify the current location' },
      { key: 'conceptual_c2', label: 'Place Recognition - Can tell his/her home address (landmark)' },
      { key: 'conceptual_d1', label: 'Time Perception - Can identify current time (approximate acceptable)' },
      { key: 'conceptual_d2', label: 'Time Perception - Can identify the current year' },
      { key: 'conceptual_e1', label: 'Memory - Can recall simple past details (food eaten yesterday)' },
      { key: 'conceptual_e2', label: 'Memory - Can repeat two named objects' }
    ]
  },
  {
    key: 'social',
    title: 'III. Social Domain',
    items: [
      { key: 'social_a1', label: 'Affect & Interaction - Makes eye contact when name is called' },
      { key: 'social_a2', label: 'Affect & Interaction - Responds to greetings (verbal or gesture)' },
      { key: 'social_a3', label: 'Affect & Interaction - Can show emotions (happy, sad)' },
      { key: 'social_a4', label: 'Affect & Interaction - Does not show aggressive behaviors' },
      { key: 'social_a5', label: 'Affect & Interaction - Can identify basic emotions' }
    ]
  },
  {
    key: 'bodily',
    title: 'IV. Bodily Kinesthetics Domain',
    items: [
      { key: 'bodily_a1', label: 'Fine Motor Skills - Can hold objects appropriately (pencil)' },
      { key: 'bodily_a2', label: 'Fine Motor Skills - Writes letters or name legibly' },
      { key: 'bodily_a3', label: 'Fine Motor Skills - Can color within the lines' },
      { key: 'bodily_a4', label: 'Fine Motor Skills - Can demonstrate hand-eye coordination (tracing)' },
      { key: 'bodily_a5', label: 'Fine Motor Skills - Can copy basic shapes (circle, triangle, square)' },
      { key: 'bodily_b1', label: 'Gross Motor Skills - Can stand on one foot briefly' },
      { key: 'bodily_b2', label: 'Gross Motor Skills - Walks steadily across the room' },
      { key: 'bodily_b3', label: 'Gross Motor Skills - Can jump forward with both feet together' },
      { key: 'bodily_b4', label: 'Gross Motor Skills - Climb stairs using alternating feet' }
    ]
  },
  {
    key: 'perceptual',
    title: 'Perceptual Disturbances',
    items: [
      { key: 'perceptual_1', label: 'Hallucination' },
      { key: 'perceptual_2', label: 'Delusions' }
    ]
  },
  {
    key: 'stimming',
    title: 'Stimming',
    items: [
      { key: 'stimming_1', label: 'Verbal (echolalia, humming)' },
      { key: 'stimming_2', label: 'Auditory (sound sensitivity)' },
      { key: 'stimming_3', label: 'Visual (fixation to objects, constant eye movement)' },
      { key: 'stimming_4', label: 'Proprioceptive (jumping, crashing into objects)' },
      { key: 'stimming_5', label: 'Vestibular (rocking, spinning)' },
      { key: 'stimming_6', label: 'Oral (chewing, biting, sucking)' },
      { key: 'stimming_7', label: 'Tactile (excoriation, skin rubbing, fidgeting)' }
    ]
  }
];

const BEHAV_STRUCTURE = [
  {
    key: 'conceptual',
    title: 'I. Conceptual Domain',
    items: [
      { key: 'conceptual_1', label: 'States full name, age, and identifies parents when asked.' },
      { key: 'conceptual_2', label: 'Follows two-step instructions (e.g., "Pick up your bag and sit down") without repeated prompting.' },
      { key: 'conceptual_3', label: 'Answers WH-questions (who, what, where, why) appropriately in simple conversations.' },
      { key: 'conceptual_4', label: 'Identifies and names common objects and their use (e.g. spoon is for eating).' },
      { key: 'conceptual_5', label: 'Recognizes letters, numbers, colors, or shapes appropriate to age level.' },
      { key: 'conceptual_6', label: 'Can count objects correctly and perform simple math (if age-appropriate).' },
      { key: 'conceptual_7', label: 'Understands time concepts (today, yesterday, tomorrow) and daily schedule.' },
      { key: 'conceptual_8', label: 'Expresses needs, thoughts, and feelings using understandable words or gestures.' },
      { key: 'conceptual_9', label: 'Maintains attention on structured task for at least 10–15 minutes (age-appropriate).' },
      { key: 'conceptual_10', label: 'Demonstrates understanding of cause and effect (e.g., "If I run, I might fall").' },
      { key: 'conceptual_11', label: 'Understands simple problem-solving (e.g., finds alternative if toy is unavailable).' },
      { key: 'conceptual_12', label: 'Reads simple words or sentences (if school-aged).' }
    ]
  },
  {
    key: 'social',
    title: 'II. Social Domain',
    items: [
      { key: 'social_1', label: 'Initiates interaction with peers or adults appropriately.' },
      { key: 'social_2', label: 'Maintains appropriate eye contact during conversation.' },
      { key: 'social_3', label: 'Responds appropriately when name is called.' },
      { key: 'social_4', label: 'Engages in cooperative play (sharing, turn-taking).' },
      { key: 'social_5', label: 'Understands personal space and boundaries.' },
      { key: 'social_6', label: 'Expresses emotions appropriately without extreme reactions.' },
      { key: 'social_7', label: 'Recovers from frustration within reasonable time (without prolonged meltdown).' },
      { key: 'social_8', label: 'Shows empathy (comforts others who are hurt or sad).' },
      { key: 'social_9', label: 'Follows group rules in school/home setting.' },
      { key: 'social_10', label: 'Adjusts behavior according to situation (formal vs play setting).' },
      { key: 'social_11', label: 'Understands simple social cues (e.g., someone is angry or joking).' },
      { key: 'social_12', label: 'Avoids aggressive behaviors (hitting, biting, throwing objects).' },
      { key: 'social_13', label: 'Can recognize familiar faces such as family members, teacher, or peers.' }
    ]
  },
  {
    key: 'practical',
    title: 'III. Practical Domain',
    items: [
      { key: 'practical_1', label: 'Eats independently using utensils properly.' },
      { key: 'practical_2', label: 'Dresses and undresses with minimal help.' },
      { key: 'practical_3', label: 'Uses toilet independently and maintains cleanliness.' },
      { key: 'practical_4', label: 'Brushes teeth and washes hands independently.' },
      { key: 'practical_5', label: 'Follows daily routine (wakes up, prepares for school).' },
      { key: 'practical_6', label: 'Packs and organizes school materials.' },
      { key: 'practical_7', label: 'Understands basic money value and transactions (age-appropriate).' },
      { key: 'practical_8', label: 'Demonstrates awareness of safety (traffic, strangers, sharp objects).' },
      { key: 'practical_9', label: 'Completes simple household chores when instructed.' },
      { key: 'practical_10', label: 'Travels short familiar distances with supervision (age-appropriate).' },
      { key: 'practical_11', label: 'Manages personal belongings responsibly.' },
      { key: 'practical_12', label: 'Seeks help appropriately when confused or unsafe.' }
    ]
  },
  {
    key: 'gross_motor',
    title: 'IV. Motor Development Domain - A. Gross Motor Skills',
    items: [
      { key: 'gross_1', label: 'Walks, runs, and stops without losing balance.' },
      { key: 'gross_2', label: 'Jumps forward with both feet together.' },
      { key: 'gross_3', label: 'Climbs stairs alternating feet (age-appropriate).' },
      { key: 'gross_4', label: 'Kicks a ball with coordination and balance.' },
      { key: 'gross_5', label: 'Throws and catches a medium-sized ball.' },
      { key: 'gross_6', label: 'Maintains balance while standing on one foot for 5 seconds.' },
      { key: 'gross_7', label: 'Participates in playground activities without excessive clumsiness.' },
      { key: 'gross_8', label: 'Demonstrates body awareness (avoids bumping into objects frequently).' },
      { key: 'gross_9', label: 'Coordinates both sides of the body (e.g., skipping, hopping).' },
      { key: 'gross_10', label: 'Shows adequate muscle strength for age (e.g., lifting school bag).' }
    ]
  },
  {
    key: 'fine_motor',
    title: 'B. Fine Motor Skills',
    items: [
      { key: 'fine_1', label: 'Holds pencil or crayon with appropriate grip.' },
      { key: 'fine_2', label: 'Copies basic shapes (circle, square, triangle).' },
      { key: 'fine_3', label: 'Writes letters or name legibly (age-appropriate).' },
      { key: 'fine_4', label: 'Uses scissors to cut along a line.' },
      { key: 'fine_5', label: 'Buttons/unbuttons clothing independently.' },
      { key: 'fine_6', label: 'Manipulates small objects (beads, coins) without dropping frequently.' },
      { key: 'fine_7', label: 'Colors within lines most of the time.' },
      { key: 'fine_8', label: 'Assembles puzzles appropriate for age.' },
      { key: 'fine_9', label: 'Demonstrates hand-eye coordination (e.g., tracing, drawing).' },
      { key: 'fine_10', label: 'Shows endurance during writing tasks (does not tire easily).' }
    ]
  },
  {
    key: 'perceptual',
    title: 'Perceptual Disturbances',
    items: [
      { key: 'perceptual_1', label: 'Hallucination' },
      { key: 'perceptual_2', label: 'Delusions' }
    ]
  },
  {
    key: 'stimming',
    title: 'Stimming',
    items: [
      { key: 'stimming_1', label: 'Verbal (echolalia, humming)' },
      { key: 'stimming_2', label: 'Auditory (sound sensitivity)' },
      { key: 'stimming_3', label: 'Visual (fixation to objects, constant eye movement)' },
      { key: 'stimming_4', label: 'Proprioceptive (jumping, crashing into objects)' },
      { key: 'stimming_5', label: 'Vestibular (rocking, spinning)' },
      { key: 'stimming_6', label: 'Oral (chewing, biting, sucking)' },
      { key: 'stimming_7', label: 'Tactile (excoriation, skin rubbing, fidgeting)' }
    ]
  }
];

const CAFT_STRUCTURE = [
  {
    key: 'conceptual',
    title: 'I. Conceptual Domain',
    items: [
      { key: 'conceptual_1', label: 'States full name, age, and identifies parents when asked.' },
      { key: 'conceptual_2', label: 'Follows 2-step instructions (e.g., "Pick up your bag and sit down") without repeated prompting.' },
      { key: 'conceptual_3', label: 'Answers WH-questions (who, what, where, why) appropriately in simple conversations.' },
      { key: 'conceptual_4', label: 'Identifies and names common objects and their use (e.g., spoon is for eating).' },
      { key: 'conceptual_5', label: 'Recognizes letters, numbers, colors, or shapes appropriate to age level.' },
      { key: 'conceptual_6', label: 'Can count objects correctly and perform simple math (if age-appropriate).' },
      { key: 'conceptual_7', label: 'Understands time concepts (today, yesterday, tomorrow) and daily schedule.' },
      { key: 'conceptual_8', label: 'Expresses needs, thoughts, and feelings using understandable words or gestures.' },
      { key: 'conceptual_9', label: 'Maintains attention on structured task for at least 10–15 minutes (age-appropriate).' },
      { key: 'conceptual_10', label: 'Demonstrates understanding of cause and effect (e.g., "If I run, I might fall").' },
      { key: 'conceptual_11', label: 'Understands simple problem-solving (e.g., finds alternative if toy is unavailable).' },
      { key: 'conceptual_12', label: 'Reads simple words or sentences (if school-aged).' }
    ]
  },
  {
    key: 'social',
    title: 'II. Social Domain',
    items: [
      { key: 'social_1', label: 'Initiates interaction with peers or adults appropriately.' },
      { key: 'social_2', label: 'Maintains appropriate eye contact during conversation.' },
      { key: 'social_3', label: 'Responds appropriately when name is called.' },
      { key: 'social_4', label: 'Engages in cooperative play (sharing, turn-taking).' },
      { key: 'social_5', label: 'Understands personal space and boundaries.' },
      { key: 'social_6', label: 'Expresses emotions appropriately without extreme reactions.' },
      { key: 'social_7', label: 'Recovers from frustration within reasonable time (without prolonged meltdown).' },
      { key: 'social_8', label: 'Shows empathy (comforts others who are hurt or sad).' },
      { key: 'social_9', label: 'Follows group rules in school/home setting.' },
      { key: 'social_10', label: 'Adjusts behavior according to situation (formal vs play setting).' },
      { key: 'social_11', label: 'Understands simple social cues (e.g., someone is angry or joking).' },
      { key: 'social_12', label: 'Avoids aggressive behaviors (hitting, biting, throwing objects).' },
      { key: 'social_13', label: 'Can recognize familiar faces such as family members, teacher, or peers.' }
    ]
  },
  {
    key: 'practical',
    title: 'III. Practical Domain',
    items: [
      { key: 'practical_1', label: 'Eats independently using utensils properly.' },
      { key: 'practical_2', label: 'Dresses and undresses with minimal help.' },
      { key: 'practical_3', label: 'Uses toilet independently and maintains cleanliness.' },
      { key: 'practical_4', label: 'Brushes teeth and washes hands independently.' },
      { key: 'practical_5', label: 'Follows daily routine (wakes up, prepares for school).' },
      { key: 'practical_6', label: 'Packs and organizes school materials.' },
      { key: 'practical_7', label: 'Understands basic money value and transactions (age-appropriate).' },
      { key: 'practical_8', label: 'Demonstrates awareness of safety (traffic, strangers, sharp objects).' },
      { key: 'practical_9', label: 'Completes simple household chores when instructed.' },
      { key: 'practical_10', label: 'Travels short familiar distances with supervision (age-appropriate).' },
      { key: 'practical_11', label: 'Manages personal belongings responsibly.' },
      { key: 'practical_12', label: 'Seeks help appropriately when confused or unsafe.' }
    ]
  },
  {
    key: 'gross_motor',
    title: 'IV-A. Gross Motor Skills',
    items: [
      { key: 'gross_1', label: 'Walks, runs, and stops without losing balance.' },
      { key: 'gross_2', label: 'Jumps forward with both feet together.' },
      { key: 'gross_3', label: 'Climbs stairs alternating feet (age-appropriate).' },
      { key: 'gross_4', label: 'Kicks a ball with coordination and balance.' },
      { key: 'gross_5', label: 'Throws and catches a medium-sized ball.' },
      { key: 'gross_6', label: 'Maintains balance while standing on one foot for 5 seconds.' },
      { key: 'gross_7', label: 'Participates in playground activities without excessive clumsiness.' },
      { key: 'gross_8', label: 'Demonstrates body awareness (avoids bumping into objects frequently).' },
      { key: 'gross_9', label: 'Coordinates both sides of the body (e.g., skipping, hopping).' },
      { key: 'gross_10', label: 'Shows adequate muscle strength for age (e.g., lifting school bag).' }
    ]
  },
  {
    key: 'fine_motor',
    title: 'IV-B. Fine Motor Skills',
    items: [
      { key: 'fine_1', label: 'Holds pencil or crayon with appropriate grip.' },
      { key: 'fine_2', label: 'Copies basic shapes (circle, square, triangle).' },
      { key: 'fine_3', label: 'Writes letters or name legibly (age-appropriate).' },
      { key: 'fine_4', label: 'Uses scissors to cut along a line.' },
      { key: 'fine_5', label: 'Buttons/unbuttons clothing independently.' },
      { key: 'fine_6', label: 'Manipulates small objects (beads, coins) without dropping frequently.' },
      { key: 'fine_7', label: 'Colors within lines most of the time.' },
      { key: 'fine_8', label: 'Assembles puzzles appropriate for age.' },
      { key: 'fine_9', label: 'Demonstrates hand-eye coordination (e.g., tracing, drawing).' },
      { key: 'fine_10', label: 'Shows endurance during writing tasks (does not tire easily).' }
    ]
  }
];

const count = (s) => s.reduce((n, d) => n + d.items.length, 0);

async function findProfile(email) {
  const { data } = await sb.from('profiles').select('id').eq('email', email).single();
  return data.id;
}

async function patientsByName() {
  const { data } = await sb.from('patients').select('id, first_name, last_name');
  return Object.fromEntries((data || []).map((p) => [`${p.first_name} ${p.last_name}`, p.id]));
}

function generateMockAnswers(structure) {
  const ans = {};
  structure.forEach(dom => {
    dom.items.forEach(it => {
      ans[it.key] = {
        response: Math.random() > 0.15 ? 'yes' : 'no',
        remarks: Math.random() > 0.85 ? 'Demonstrates partial skill' : ''
      };
    });
  });
  return ans;
}

const PROFILE = {
  'Leo Cruz': { beh: 35, caft: 78, level: 'MSN', progress: 66, ms: { score: 74, status: 'approaching' } },
  'Alex Johnson': { beh: 30, caft: 70, level: 'HSN', progress: 85, ms: { score: 72, status: 'approaching' } },
  'Jordan Smith': { beh: 22, caft: 60, level: 'MSN', progress: 58, ms: { score: 49, status: 'not_ready' } },
  'Casey Williams': { beh: 18, caft: 52, level: 'HSN', progress: 40, ms: { score: 38, status: 'not_ready' } },
  'Mia Santos': { beh: 28, caft: 66, level: 'MSN', progress: 62, ms: { score: 61, status: 'approaching' } },
  'Zara Mendoza': { beh: 33, caft: 80, level: 'LSN', progress: 90, ms: { score: 85, status: 'ready' } },
};

async function main() {
  const psych = await findProfile('psych@clearmind.ph');
  const rpm = await findProfile('rpm@clearmind.ph');
  const byName = await patientsByName();

  // ---------- cleanup in FK-dependency order ----------
  const ALL = '00000000-0000-0000-0000-000000000000';
  try { await sb.from('session_logs').delete().neq('id', ALL); } catch { /* 0012 not applied */ }
  await sb.from('assessment_reports').delete().neq('id', ALL);
  await sb.from('assessment_submissions').delete().neq('id', ALL);
  await sb.from('assessment_assignments').delete().neq('id', ALL);
  await sb.from('assessment_templates').delete().neq('id', ALL);

  // ---------- templates ----------
  const tplDefs = [
    ['CMPS:SE-FO-03', 'Caregiver Observation Checklist', '☺', BEHAV_STRUCTURE, 15],
    ['CMPS:SE-FO-04', 'Mini-Mental Status Examination', '🧠', MMSE_STRUCTURE, 20],
    ['CMPS:SE-FO-05', 'Child Adaptive Functioning Tool', '✕', CAFT_STRUCTURE, 15],
  ];
  const tpl = {};
  for (const [code, title, icon, structure, mins] of tplDefs) {
    const { data, error } = await sb
      .from('assessment_templates')
      .insert({ document_type_code: code, title, icon, structure, respondent: 'caregiver', est_minutes: mins, max_score: count(structure) })
      .select('id, title')
      .single();
    if (error) throw new Error(`template ${title}: ${error.message}`);
    tpl[code] = data.id;
  }

  // ---------- assignments (Leo's "new assessments") ----------
  await sb.from('assessment_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (byName['Leo Cruz']) {
    for (const code of ['CMPS:SE-FO-03', 'CMPS:SE-FO-04', 'CMPS:SE-FO-05']) {
      await sb.from('assessment_assignments').insert({
        patient_id: byName['Leo Cruz'], template_id: tpl[code], assigned_by_id: psych, status: 'assigned', due_date: '2026-03-15',
      });
    }
  }

  // ---------- submissions ----------
  await sb.from('assessment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  for (const [name, pid] of Object.entries(byName)) {
    const prof = PROFILE[name];
    if (!prof) continue;

    // Caregiver Observation Checklist (CMPS:SE-FO-03)
    await sb.from('assessment_submissions').insert({
      patient_id: pid, template_id: tpl['CMPS:SE-FO-03'], respondent_profile_id: psych,
      respondent_name: 'Caregiver', total_score: prof.beh, max_score: count(BEHAV_STRUCTURE), status: 'submitted', submitted_at: '2026-03-27T00:00:00Z',
      answers: generateMockAnswers(BEHAV_STRUCTURE)
    });

    // Child Adaptive Functioning Tool (CMPS:SE-FO-05)
    await sb.from('assessment_submissions').insert({
      patient_id: pid, template_id: tpl['CMPS:SE-FO-05'], respondent_profile_id: rpm,
      respondent_name: 'RPm', total_score: prof.caft, max_score: count(CAFT_STRUCTURE), status: 'scored', submitted_at: '2026-03-28T00:00:00Z',
      answers: generateMockAnswers(CAFT_STRUCTURE)
    });

    // Mini-Mental Status Examination (CMPS:SE-FO-04)
    await sb.from('assessment_submissions').insert({
      patient_id: pid, template_id: tpl['CMPS:SE-FO-04'], respondent_profile_id: rpm,
      respondent_name: 'RPm', total_score: 24, max_score: count(MMSE_STRUCTURE), status: 'submitted', submitted_at: '2026-03-29T00:00:00Z',
      answers: generateMockAnswers(MMSE_STRUCTURE)
    });

    // roster classification
    await sb.from('clinical_profiles').update({ support_level: prof.level, milestone_progress: prof.progress }).eq('patient_id', pid);
    // mainstreaming
    await sb.from('mainstreaming_assessments').delete().eq('patient_id', pid);
    await sb.from('mainstreaming_assessments').insert({
      patient_id: pid, evaluated_by_id: psych, readiness_score: prof.ms.score, status: prof.ms.status, evaluated_on: '2026-03-25',
    });
  }

  // ---------- interventions ----------
  await sb.from('interventions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const interv = [
    ['Alex Johnson', 'Behavioral Intervention Plan', 5, 'completed', '2026-03-28'],
    ['Jordan Smith', 'Attention & Focus Plan', 3, 'in_progress', '2026-03-26'],
    ['Mia Santos', 'Speech Support Plan', 4, 'completed', '2026-03-24'],
    ['Casey Williams', 'Sensory Integration Plan', 2, 'planned', '2026-03-29'],
    ['Leo Cruz', 'Social Communication Plan', 6, 'in_progress', '2026-03-22'],
  ];
  for (const [name, title, n, status, date] of interv) {
    if (!byName[name]) continue;
    await sb.from('interventions').insert({ patient_id: byName[name], author_id: psych, title, procedure_count: n, status, plan_date: date });
  }

  // ---------- reports (DraftingReports / Approvals / Progress) ----------
  await sb.from('assessment_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const reports = [
    ['Alex Johnson', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'ready_for_review', 100, 'high', null, null],
    ['Leo Cruz', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'in_progress', 65, 'normal', null, null],
    ['Jordan Smith', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'draft', 30, 'normal', null, null],
    ['Mia Santos', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'approved', 100, 'normal', 'March 2026', '↑ Improving'],
    ['Zara Mendoza', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'ready_for_review', 100, 'normal', 'March 2026', '↑ Improving'],
    ['Casey Williams', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'draft', 45, 'normal', 'March 2026', '→ Stable'],
  ];
  for (const [name, type, code, title, status, completeness, priority, period, trend] of reports) {
    if (!byName[name]) continue;
    await sb.from('assessment_reports').insert({
      patient_id: byName[name], report_type: type, document_type_code: code, title, status, completeness, priority, period, trend,
      prepared_by_id: rpm, noted_by_id: status === 'approved' ? psych : null,
      content: `${title} for ${name}. Auto-generated demo content summarizing progress and recommendations.`,
      finalized_at: status === 'approved' ? '2026-03-28T00:00:00Z' : null,
    });
  }

  // ---------- session logs (FO-07) — requires migration 0012 ----------
  try {
    await sb.from('session_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const logs = [
      ['Jordan Smith', 2, '2026-03-29', 'Sensory Integration Play', 'draft'],
      ['Alex Johnson', 4, '2026-03-28', 'Pegboard Sorting & Colors', 'pending'],
      ['Casey Williams', 3, '2026-03-26', 'Picture Exchange Communication', 'approved'],
      ['Leo Cruz', 5, '2026-03-24', 'Routine-Based Prompting', 'approved'],
    ];
    let seeded = 0;
    for (const [name, n, date, title, status] of logs) {
      if (!byName[name]) continue;
      const { error } = await sb.from('session_logs').insert({
        patient_id: byName[name], author_id: rpm, session_number: n, session_date: date, activity_title: title, status,
      });
      if (!error) seeded += 1;
    }
    console.log('session_logs seeded:', seeded);
  } catch {
    console.log('session_logs skipped (run migration 0012 first)');
  }

  console.log('seed_assessments complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
