/**
 * Initial content, carried over verbatim from the Lawson Digital Solutions v2 prototype.
 * Loaded into SQLite on first run; afterwards the database is the source of truth.
 */

export const SEED_SERVICES = [
  { id: 'custom', tag: 'APP', name: 'Custom Software Development',
    short: 'Software built around how your business works, instead of bending your process to fit an off-the-shelf tool.',
    outcome: 'A tool that fits the job, with fewer workarounds',
    purpose: 'Tailored software for processes that generic tools don’t handle well, scoped from your real requirements and built to be maintained.',
    problems: ['Spreadsheets or manual steps holding a process together', 'Off-the-shelf tools that need constant workarounds', 'Internal tools that have outgrown their original design'],
    considerations: ['Requirements discovery comes first, so scope reflects real use', 'Maintainability and future changes considered from the start', 'Phased delivery where it reduces risk'],
    deliverables: ['Internal business tools', 'Customer-facing applications', 'Admin and reporting interfaces'],
    flow: ['Requirements', 'Application', 'Your team'] },
  { id: 'web', tag: 'WEB', name: 'Web Development',
    short: 'Websites and web applications that are clear, responsive, and straightforward to maintain.',
    outcome: 'A site that works on every device and is easier to update',
    purpose: 'Websites and web applications that work well on every screen, with forms and data that connect to the rest of your business.',
    problems: ['A site that is hard to update or maintain', 'A poor experience on phones and tablets', 'Forms and enquiries that go nowhere useful'],
    considerations: ['Responsive interface implementation', 'Form and API integration', 'Usability, accessibility, and performance considered throughout'],
    deliverables: ['Business websites', 'Web applications', 'Form and enquiry workflows'],
    flow: ['Content', 'Interface', 'Visitors'] },
  { id: 'consulting', tag: 'ADV', name: 'IT Consulting',
    short: 'Technical guidance on requirements, architecture, and improvement plans before you commit to a build.',
    outcome: 'Clearer decisions before money is spent',
    purpose: 'Technical guidance before, during, or instead of a build. The scope of each consulting engagement is agreed during an initial discovery conversation.',
    problems: ['Uncertainty about which approach or platform to choose', 'Systems that need improving but lack a clear plan', 'Wanting a second opinion on technical direction'],
    considerations: ['Scope determined during discovery', 'Architecture and implementation guidance', 'Technical evaluation and improvement planning'],
    deliverables: ['Requirements discussions', 'Technical assessments', 'Improvement plans'],
    flow: ['Situation', 'Options', 'Plan'] },
  { id: 'integration', tag: 'API', name: 'Systems Integration',
    short: 'Connecting compatible business systems so information moves reliably between them.',
    outcome: 'Less re-keying and more consistent data',
    purpose: 'Connecting compatible business systems through their APIs, with planned data flows, validation, and error handling.',
    problems: ['Manual copying between applications', 'Data that is inconsistent across tools', 'Processes that break when one system changes'],
    considerations: ['Data-flow and integration planning', 'API-based communication between compatible systems', 'Validation and error handling built in'],
    deliverables: ['System-to-system integrations', 'Data synchronization workflows', 'Integration documentation'],
    flow: ['System A', 'Integration', 'System B'] },
];

const pairs = (rows: string[][], keys: string[]) => rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i]])));

export const SEED_CONTENT: Record<string, object> = {
  hero: [
    { label: 'Software', file: 'custom-app.map', inputs: ['Spreadsheets', 'Manual steps', 'Team requests'], core: 'Custom application', rows: [['workflow', 'define'], ['roles', 'permit'], ['reports', 'summarize']], outputs: ['Internal tool', 'Admin view', 'Exports'], json: 'custom-software', goal: 'replace spreadsheet', stage: 2 },
    { label: 'Web', file: 'website.map', inputs: ['Content', 'Brand', 'Forms'], core: 'Website / web app', rows: [['layout', 'responsive'], ['forms', 'validate'], ['api', 'connect']], outputs: ['Desktop', 'Mobile', 'Enquiries'], json: 'web-development', goal: 'modernize site', stage: 2 },
    { label: 'Consulting', file: 'assessment.map', inputs: ['Current systems', 'Goals', 'Constraints'], core: 'Technical assessment', rows: [['options', 'compare'], ['risks', 'surface'], ['plan', 'recommend']], outputs: ['Recommendation', 'Roadmap', 'Next step'], json: 'it-consulting', goal: 'choose approach', stage: 1 },
    { label: 'Integration', file: 'integration.map', inputs: ['System A', 'System B', 'Files'], core: 'Integration layer', rows: [['map', 'fields'], ['validate', 'data'], ['retry', 'errors']], outputs: ['Synced data', 'Alerts', 'Logs'], json: 'integration', goal: 'connect tools', stage: 3 },
  ],
  stages: ['Discover', 'Define', 'Build', 'Validate', 'Deliver'],
  marquee: ['Custom software', 'Web development', 'IT consulting', 'Systems integration'],
  challenges: [
    { problem: 'Your team re-enters the same information in several places.', approach: 'Automate the repetitive steps and connect the tools involved, so information is entered once.', service: 'integration' },
    { problem: 'Your business systems don’t talk to each other.', approach: 'Plan how data should flow, then connect compatible systems through their APIs with validation and error handling.', service: 'integration' },
    { problem: 'Your website is dated, slow, or hard to update.', approach: 'Rebuild or modernize it with a responsive interface and a structure that is easier to maintain.', service: 'web' },
    { problem: 'Off-the-shelf software doesn’t fit how you work.', approach: 'Define the requirements, then build a focused custom application around them.', service: 'custom' },
    { problem: 'You’re unsure which technology decision is right.', approach: 'Talk through your situation, constraints, and options before committing to a build.', service: 'consulting' },
  ],
  process: pairs(
    [
      ['Discover', 'Understand goals, users, constraints, and requirements.', 'Share your goals, context, and examples of the problem.'],
      ['Define', 'Agree on scope, priorities, and an appropriate technical approach.', 'Review the proposed scope and agree priorities.'],
      ['Build', 'Implement the agreed solution.', 'Give feedback on progress as it takes shape.'],
      ['Validate', 'Test functionality, usability, and expected behavior.', 'Try it with real scenarios and flag anything unexpected.'],
      ['Deliver', 'Release the solution and discuss any agreed follow-up work.', 'Sign off, and decide together on any next steps.'],
    ],
    ['name', 'text', 'you'],
  ),
  principles: pairs(
    [
      ['Clear technical communication', 'Plain-English updates, with decisions and trade-offs explained before they become surprises.'],
      ['Purposeful engineering', 'Each feature should trace back to a real requirement.'],
      ['Practical problem-solving', 'Start with the simplest approach that solves the problem well.'],
      ['Maintainable solutions', 'Readable code and sensible documentation, so systems are easy to live with.'],
      ['Requirements-driven delivery', 'Scope is agreed up front and revisited openly when it needs to change.'],
    ],
    ['name', 'text'],
  ),
  values: pairs(
    [
      ['Clear communication', 'You should always know what is being built, why, and what happens next.'],
      ['Practical problem-solving', 'The goal is a working solution to your problem, not the most complex one.'],
      ['Thoughtful engineering', 'Decisions are made with the long-term health of the system in mind.'],
      ['Maintainable solutions', 'Software your team, or a future developer, can understand and extend.'],
      ['Collaboration around goals', 'Your business goals set the priorities; the technology follows.'],
    ],
    ['name', 'text'],
  ),
  solutions: [
    { name: 'Workflow and process automation', service: 'integration', summary: 'Reducing the manual, repetitive steps that slow a team down.', signs: ['The same data is typed into more than one place', 'A process depends on someone remembering to do it', 'Reports are assembled by hand each week'], approach: 'Map the current process, identify which steps can be automated safely, then connect or extend the tools involved, with checks for when something goes wrong.' },
    { name: 'Custom business applications', service: 'custom', summary: 'Purpose-built software for work that generic tools handle poorly.', signs: ['A spreadsheet has become a critical system', 'Staff rely on workarounds in an off-the-shelf tool', 'You need a tool that matches a specific process'], approach: 'Start with requirements and users, agree a focused first version, then build and validate it before extending.' },
    { name: 'Website modernization', service: 'web', summary: 'Bringing an existing website up to date in structure, usability, and maintainability.', signs: ['Updating content is slow or needs a developer', 'The site works poorly on phones', 'Forms and enquiries are unreliable'], approach: 'Review what the current site needs to do, then rebuild or improve it with a responsive interface and dependable forms.' },
    { name: 'Application and system integration', service: 'integration', summary: 'Getting compatible systems to share information reliably.', signs: ['Customer or order data differs between tools', 'Exports and imports are done manually', 'A change in one system breaks another process'], approach: 'Plan the data flow, confirm what each system’s API supports, and build the integration with validation and error handling.' },
    { name: 'Technical architecture and consulting', service: 'consulting', summary: 'Getting clarity on a technical decision before committing time and budget.', signs: ['Several options and no clear way to compare them', 'An existing system that needs a plan for improvement', 'A project that needs a technical second opinion'], approach: 'Discuss the situation and constraints, evaluate options, and agree a practical recommendation. Scope is set during discovery.' },
  ],
  caseOutline: pairs(
    [
      ['Requirement', 'The original problem and context, as approved by the client.'],
      ['Approach', 'Technical considerations and how the solution was planned.'],
      ['Delivered', 'Scope of work and functionality, with approved screenshots.'],
      ['Results', 'Outcomes only where they were documented and verified.'],
    ],
    ['name', 'text'],
  ),
  scopeExample: {
    goal: 'Replace a manual intake spreadsheet with a simple web tool.',
    users: 'Office staff entering requests; a manager reviewing them weekly.',
    items: [
      { label: 'Request form with validation', phase: 'phase 1', checked: true },
      { label: 'Review queue with status updates', phase: 'phase 1', checked: true },
      { label: 'Email notifications', phase: 'phase 1', checked: false },
      { label: 'CSV export', phase: 'phase 2', checked: false },
    ],
  },
  prompts: pairs(
    [
      ['Goal', 'The goal is '],
      ['Users', 'The people using it are '],
      ['Current setup', 'Today we currently use '],
    ],
    ['label', 'text'],
  ),
};

export const SEED_SETTINGS = {
  businessName: 'Lawson Digital Solutions',
  contactName: 'Rhett Lawson',
  email: 'rhett.lawson@outlook.com',
  phone: '+1 (512) 280-4058',
  street: '600 Congress Ave',
  locality: 'Austin, TX 78701, USA',
  locationLabel: 'Austin, TX',
  timezone: 'America/Chicago',
  budgetRanges: ['Under $10,000', '$10,000–$25,000', '$25,000–$50,000', '$50,000+'],
  timelines: ['As soon as practical', 'Within 1–3 months', 'Within 3–6 months', 'Exploring / planning', 'Other'],
};
