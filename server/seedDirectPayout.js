import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { MongoClient } from 'mongodb';
import axios from 'axios';

const key = 'AIzaSyCiSh1LqwlMHZtpFEknoxUrYwKRmAW-mMY';
const uri = 'mongodb+srv://miguelcarandangdev_db_user:NF61F1rXk7Z2nRVF@synapsevault.umhvse8.mongodb.net/?appName=SynapseVault';

const prompt = `
You are an expert trading coach and risk management educator.
Analyze this trading checklist and produce a comprehensive study reviewer:

Payout Bootcamp - Improving Risk Management
GatieTrades
Phase 1 - Auto Fail
Was the loss obviously avoidable?
Was the loss over my max loss per trade?
Was the loss taken while already being in daily drawdown?
Was the loss violating max loss per day?
Was the loss a full size loss?
Was the loss taken with increased stop loss?
Was the loss taken with emotional drawdown?
Was the loss taken with improper stop loss placement?
Phase 2 - Spiral Detection
Did I recognize warning signs before or during the loss?
Did I allow the loss to affect my decision-making?
Did I fully accept the loss with composure?
Did I feel pressure to recover immediately after the loss?
Did I consider the loss acceptable within my risk plan?
Did I willingly accept taking this same loss again?
Did I prioritize capital preservation above all else?
Did I take the trade with an appropriate amount of risk?
Phase 3 - Skill Improvement
Could I have logically reduced risk?
Could I have logically closed earlier?
Could I have logically partialed a position?
Could I have logically managed risk aggressively?
Could I have logically derisked initially?
Could I have trailed stops into profit?

Return valid JSON adhering to this schema:
{
  "title": "Payout Bootcamp: Enhancing Risk Management Protocols",
  "executiveSummary": "Rich 2-3 paragraph markdown summary with bold key points and clear structural context.",
  "keyTakeaways": [
    "Key takeaway point with full explanatory context"
  ],
  "comprehensiveSections": [
    {
      "sectionTitle": "Phase 1: Auto Fail - Immediate Rule Violations",
      "detailedNotesMarkdown": "Structured markdown notes with ### headings, - **bold points**, and actionable rules.",
      "keyTerms": [
        { "term": "Max Loss Per Trade", "definition": "The non-negotiable dollar or percentage threshold risked on a single trade setup." }
      ],
      "formulasOrRules": [
        { "name": "Daily Drawdown Stop Rule", "formula": "Cumulative Loss >= Daily Limit -> Cease All Trading", "explanation": "Prevents emotional revenge trading and accounts blowouts." }
      ]
    }
  ],
  "glossary": [
    { "term": "Auto Fail", "definition": "An objective checklist of preventable errors that invalidate trade performance.", "category": "Risk Management" }
  ],
  "tags": ["risk-management", "trading-psychology", "payout-bootcamp", "drawdown-control"],
  "entities": [
    { "name": "Risk Management", "type": "Core System", "description": "Capital preservation framework", "relatedTo": ["Drawdown Control", "Position Sizing"] }
  ],
  "wikilinks": ["[[Risk Management]]", "[[Drawdown Control]]", "[[Position Sizing]]", "[[Spiral Detection]]"],
  "flashcards": [
    {
      "question": "What defines an 'Auto Fail' in trading risk management?",
      "answer": "An avoidable loss triggered by rule violations like exceeding max loss per trade, trading in daily drawdown, moving stop losses, or trading while emotionally compromised.",
      "category": "Risk Protocols",
      "difficulty": "easy"
    }
  ],
  "quizQuestions": [
    {
      "question": "Which action is classified as a Phase 1 'Auto Fail' violation?",
      "options": [
        "Increasing your stop loss distance during a trade",
        "Trailing your stop into profit",
        "Closing a position early for risk reduction",
        "Taking a partial profit at key target"
      ],
      "correctIndex": 0,
      "explanation": "Moving or widening a stop loss increases maximum risk and violates fundamental risk rules."
    }
  ]
}
`;

async function main() {
  try {
    console.log('Generating structured AI reviewer with primary key...');
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const reviewer = JSON.parse(res.data.candidates[0].content.parts[0].text);
    console.log('AI Generation success! Title:', reviewer.title);

    const now = new Date().toISOString();
    const doc = {
      id: 'doc-payout-bootcamp-' + Date.now(),
      title: reviewer.title || 'Payout Bootcamp: Enhancing Risk Management Protocols',
      type: 'pdf',
      sourceUrl: '',
      wordCount: 175,
      rawText: prompt,
      images: [],
      reviewer,
      tags: reviewer.tags || [],
      entities: reviewer.entities || [],
      wikilinks: reviewer.wikilinks || [],
      flashcards: reviewer.flashcards || [],
      quizQuestions: reviewer.quizQuestions || [],
      flashcardStats: { totalReviews: 0, mastered: 0 },
      quizStats: { attempts: 0, bestScore: 0 },
      createdAt: now,
      updatedAt: now
    };

    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const db = client.db('synapsevault');
    await db.collection('documents').insertOne(doc);
    console.log('SUCCESSFULLY SAVED TO MONGODB ATLAS!');

    const all = await db.collection('documents').find({}).toArray();
    console.log('ALL ATLAS VAULT DOCUMENTS:');
    all.forEach(d => console.log(' ->', d.title));
    await client.close();
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

main();
