// The caregiver research/usability survey. Questions live here as data so they
// can be edited in one place — the client form and the admin results view both
// render whatever this exports, and answers are stored JSONB keyed by `key`.
//
// Supported question types: 'scale' (min..max radio), 'multi' (checkbox list),
// 'choice' (single select), 'text' (free response).
const SURVEY = {
  title: 'ClearMind Experience Survey',
  intro:
    "Help us improve ClearMind. Your answers support the clinic's research and take about two minutes. You only need to submit this once.",
  questions: [
    {
      key: 'ease_of_use',
      label: 'Overall, how easy was ClearMind to use?',
      type: 'scale',
      min: 1,
      max: 5,
      minLabel: 'Very hard',
      maxLabel: 'Very easy',
      required: true,
    },
    {
      key: 'helpfulness',
      label: "How helpful was the app for managing your child's care?",
      type: 'scale',
      min: 1,
      max: 5,
      minLabel: 'Not helpful',
      maxLabel: 'Very helpful',
      required: true,
    },
    {
      key: 'features_used',
      label: 'Which features did you use?',
      type: 'multi',
      options: ['Appointments', 'Assessment Services', 'Daily Journal', 'Announcements', 'Consents & Waivers'],
    },
    {
      key: 'recommend',
      label: 'How likely are you to recommend ClearMind to other parents?',
      type: 'scale',
      min: 1,
      max: 5,
      minLabel: 'Not likely',
      maxLabel: 'Very likely',
      required: true,
    },
    { key: 'liked_most', label: 'What did you like most?', type: 'text' },
    { key: 'improvements', label: 'What could be improved?', type: 'text' },
  ],
};

module.exports = { SURVEY };
