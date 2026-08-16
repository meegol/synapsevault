import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://miguelcarandangdev_db_user:NF61F1rXk7Z2nRVF@synapsevault.umhvse8.mongodb.net/?appName=SynapseVault';

const doc = {
  id: 'doc-payout-bootcamp-' + Date.now(),
  title: 'Payout Bootcamp: Improving Risk Management & Discipline',
  type: 'pdf',
  sourceUrl: '',
  wordCount: 175,
  rawText: `Payout Bootcamp - Improving Risk Management\nGatieTrades\nPhase 1 - Auto Fail\nPhase 2 - Spiral Detection\nPhase 3 - Skill Improvement`,
  images: [],
  reviewer: {
    title: 'Payout Bootcamp: Improving Risk Management & Discipline',
    executiveSummary: `This study reviewer outlines a comprehensive three-phase operational framework designed to eliminate destructive trading behaviors and maximize capital preservation. Created by **GatieTrades**, the curriculum breaks down risk management into a diagnostic and proactive system:

- **Phase 1: Auto Fail** — Immediate identification of unforced errors, position-sizing breaches, and max drawdown violations that disqualify a trade from execution.
- **Phase 2: Spiral Detection** — Psychological self-monitoring to prevent emotional revenge trading, loss denial, and reckless capital exposure following a drawdown.
- **Phase 3: Skill Improvement** — Dynamic trade management tactics (early derisking, partial profits, and trailing stops) that transform passive stop-loss hits into controlled risk events.`,
    keyTakeaways: [
      'Unforced errors and exceeding daily max loss are non-negotiable "Auto Fails" requiring immediate cessation of trading.',
      'Recognizing emotional drawdown and loss aversion early prevents catastrophic psychological spirals.',
      'Proactive trade management (partialing, early closure, aggressive derisking) protects capital and locks in gains.',
      'Capital preservation must always override the urge to immediately recover losses.'
    ],
    comprehensiveSections: [
      {
        sectionTitle: 'Phase 1: Auto Fail — The Pre-Trade & Execution Guardrails',
        detailedNotesMarkdown: `### Objective
Identify binary, rule-based mistakes that immediately indicate a failure of discipline regardless of whether the trade won or lost.

### Core Audit Questions:
1. **Was the loss obviously avoidable?** — Did the trader enter without confirmation or against the core model?
2. **Was the loss over the max loss per trade?** — Position sizing exceeded predetermined risk thresholds (e.g., >1%).
3. **Was the loss taken while already in daily drawdown?** — Trading into negative momentum instead of walking away.
4. **Was max loss per day violated?** — Cumulative daily loss threshold breached.
5. **Was the loss a full-size loss?** — Complete failure to derisk or scale out.
6. **Was the stop loss widened/increased?** — Fatal habit of giving trades "more room."
7. **Was the loss taken with emotional drawdown?** — Frustration, anxiety, or revenge guiding entry.
8. **Was stop loss placement improper?** — Stop placed illogically rather than at structural invalidation levels.`,
        keyTerms: [
          { term: 'Auto Fail', definition: 'A critical rule violation that marks a trading session as failed, regardless of PnL outcome.' },
          { term: 'Max Loss Per Trade', definition: 'Strict percentage or fixed dollar amount representing maximum allowable risk per execution.' },
          { term: 'Daily Drawdown Limit', definition: 'The hard stopping point for cumulative losses in a 24-hour cycle to prevent account blowouts.' }
        ],
        formulasOrRules: [
          { name: 'Hard Daily Drawdown Rule', formula: 'Daily Cumulative Loss >= Max Allowed Drawdown -> Close Charts', explanation: 'Mandates full trading cessation to protect capital and mental state.' }
        ]
      },
      {
        sectionTitle: 'Phase 2: Spiral Detection — Emotional & Psychological Auditing',
        detailedNotesMarkdown: `### Objective
Catch the emotional and mental state deterioration before it snowballs into severe capital destruction.

### Key Psychological Checkpoints:
- **Warning Sign Recognition**: Did the trader identify internal hesitation or market red flags and ignore them?
- **Decision-Making Distortion**: Did previous negative outcomes compromise objective analysis?
- **Composure & Acceptance**: Did the trader accept the loss as a standard cost of business without emotional reaction?
- **Pressure to Recover**: Was there an urgent mental impulse to "make it back" immediately?
- **Plan Alignment**: Was the loss an expected statistical outcome within the strategy?
- **Capital Preservation Mindset**: Was capital protection the undisputed #1 priority?`,
        keyTerms: [
          { term: 'Spiral Detection', definition: 'The practice of monitoring cognitive bias and emotional turbulence following an adverse outcome.' },
          { term: 'Revenge Trading', definition: 'Impulsive re-entry driven by urgency to recover losses rather than an objective market edge.' },
          { term: 'Composure Baseline', definition: 'The emotional equilibrium required to execute consecutive trades without cognitive interference.' }
        ],
        formulasOrRules: []
      },
      {
        sectionTitle: 'Phase 3: Skill Improvement — Proactive Trade Management',
        detailedNotesMarkdown: `### Objective
Transition from passive "set-and-forget" loss absorption to active, logical risk minimization.

### Active Derisking Strategies:
- **Logical Risk Reduction**: Scaling down position size when market velocity or order flow weakens.
- **Early Discretionary Closure**: Exiting before a full stop-loss hit when the original thesis is invalidated.
- **Partial Profit Taking (Scale-Out)**: Securing 50-70% of position at Key Target 1 to render remaining exposure risk-free.
- **Aggressive Risk Mitigation**: Moving stop-loss to break-even or entry once initial expansion occurs.
- **Trailing Stops into Profit**: Systematically ratcheting stop levels behind structural swing points to protect unrealized gains.`,
        keyTerms: [
          { term: 'Partialing', definition: 'Closing a fraction of an open position at liquidity objectives to bank profits and reduce net risk.' },
          { term: 'Trailing Stop', definition: 'Dynamic stop-loss order placed behind price structure that locks in profits as the market expands.' },
          { term: 'Initial Derisking', definition: 'Reducing position size or moving stop to breakeven at the earliest logical confirmation.' }
        ],
        formulasOrRules: [
          { name: 'Risk-Free Trade Threshold', formula: 'Target 1 Reached -> Take 50% Partials + Move Stop to Entry', explanation: 'Guarantees a profitable or breakeven trade outcome.' }
        ]
      }
    ],
    glossary: [
      { term: 'Capital Preservation', definition: 'The foundational philosophy of prioritizing downside protection over upside speculative gains.', category: 'Risk Management' },
      { term: 'Auto Fail', definition: 'Binary compliance checklist marking avoidable trading errors.', category: 'Discipline' },
      { term: 'Drawdown Control', definition: 'Pre-set protocols limiting cumulative consecutive losses.', category: 'Risk Management' }
    ],
    tags: ['risk-management', 'payout-bootcamp', 'trading-psychology', 'gatetrades', 'discipline'],
    entities: [
      { name: 'Risk Management', type: 'Core System', description: 'Rules governing capital allocation and trade sizing', relatedTo: ['Drawdown Control', 'Capital Preservation'] },
      { name: 'Spiral Detection', type: 'Psychology', description: 'Monitoring emotional state to prevent revenge trading', relatedTo: ['Discipline', 'Composure'] },
      { name: 'Active Derisking', type: 'Execution', description: 'Tactics to reduce trade exposure in real-time', relatedTo: ['Trailing Stops', 'Partialing'] }
    ],
    wikilinks: ['[[Risk Management]]', '[[Capital Preservation]]', '[[Spiral Detection]]', '[[Drawdown Control]]', '[[Active Derisking]]'],
    flashcards: [
      {
        question: 'What are the 3 phases of the Payout Bootcamp Risk Management framework?',
        answer: 'Phase 1: Auto Fail (binary mistake identification), Phase 2: Spiral Detection (psychological audit), Phase 3: Skill Improvement (proactive trade management).',
        category: 'Framework',
        difficulty: 'easy'
      },
      {
        question: 'Why is increasing or widening a stop-loss considered an "Auto Fail"?',
        answer: 'Widening a stop increases risk beyond predetermined parameters and indicates emotional unwillingness to accept being wrong.',
        category: 'Execution Rules',
        difficulty: 'medium'
      },
      {
        question: 'What is the primary objective of "Spiral Detection"?',
        answer: 'To catch emotional distress, revenge impulses, and frustration early before they trigger reckless trade entries and account destruction.',
        category: 'Psychology',
        difficulty: 'medium'
      },
      {
        question: 'Name three practical ways to proactively manage risk during an open trade.',
        answer: '1. Taking partial profits at Target 1, 2. Moving stop to breakeven, 3. Trailing stops behind market structure.',
        category: 'Trade Management',
        difficulty: 'easy'
      }
    ],
    quizQuestions: [
      {
        question: 'Which of the following actions constitutes an "Auto Fail" in Phase 1?',
        options: [
          'Increasing the stop-loss distance after entry',
          'Taking 50% partial profit at Key Level 1',
          'Moving stop-loss to breakeven after expansion',
          'Closing a trade early when momentum dies'
        ],
        correctIndex: 0,
        explanation: 'Widening your stop loss directly violates pre-calculated risk limits and indicates lack of trading discipline.'
      },
      {
        question: 'What should a trader immediately do upon reaching their maximum daily drawdown limit?',
        options: [
          'Stop trading for the day and close the charts immediately',
          'Double position size on the next trade to recover losses',
          'Switch to a faster timeframe to look for quick scalps',
          'Remove stop losses to give trades more room to breathe'
        ],
        correctIndex: 0,
        explanation: 'The daily drawdown limit is a non-negotiable stop line designed to prevent psychological spirals and capital destruction.'
      }
    ]
  },
  tags: ['risk-management', 'payout-bootcamp', 'trading-psychology', 'gatetrades'],
  entities: [
    { name: 'Risk Management', type: 'Core System', description: 'Rules governing capital allocation', relatedTo: ['Drawdown Control'] }
  ],
  wikilinks: ['[[Risk Management]]', '[[Capital Preservation]]', '[[Spiral Detection]]'],
  flashcards: [],
  quizQuestions: [],
  flashcardStats: { totalReviews: 0, mastered: 0 },
  quizStats: { attempts: 0, bestScore: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function insert() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db('synapsevault');
  await db.collection('documents').insertOne(doc);
  console.log('--- DIRECT INGESTION TO MONGODB ATLAS SUCCESSFUL! ---');
  const all = await db.collection('documents').find({}).toArray();
  console.log('Current Documents in MongoDB Atlas:');
  all.forEach((d, idx) => console.log(`${idx + 1}. ${d.title}`));
  await client.close();
}

insert();
