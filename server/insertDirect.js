import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { MongoClient } from 'mongodb';
import { generateDeepReviewerWithGemini } from './services/geminiService.js';

const text = `
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
`;

async function main() {
  try {
    console.log('Generating deep reviewer with Gemini...');
    const reviewer = await generateDeepReviewerWithGemini({
      title: 'Payout Bootcamp: Improving Risk Management',
      sourceType: 'pdf',
      content: text
    });

    const now = new Date().toISOString();
    const doc = {
      id: 'doc-payout-bootcamp-' + Date.now(),
      title: reviewer.title || 'Payout Bootcamp: Improving Risk Management',
      type: 'pdf',
      sourceUrl: '',
      wordCount: 175,
      rawText: text,
      images: [],
      reviewer,
      tags: reviewer.tags,
      entities: reviewer.entities,
      wikilinks: reviewer.wikilinks,
      flashcards: reviewer.flashcards,
      quizQuestions: reviewer.quizQuestions,
      flashcardStats: { totalReviews: 0, mastered: 0 },
      quizStats: { attempts: 0, bestScore: 0 },
      createdAt: now,
      updatedAt: now
    };

    const uri = 'mongodb+srv://miguelcarandangdev_db_user:NF61F1rXk7Z2nRVF@synapsevault.umhvse8.mongodb.net/?appName=SynapseVault';
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const db = client.db('synapsevault');
    await db.collection('documents').insertOne(doc);
    console.log('--- INSERTION COMPLETE! ---');
    const all = await db.collection('documents').find({}).toArray();
    console.log('Current Documents in MongoDB Atlas:');
    all.forEach(d => console.log(' *', d.title));
    await client.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
