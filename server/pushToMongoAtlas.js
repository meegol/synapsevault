import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = 'mongodb+srv://miguelcarandangdev_db_user:NF61F1rXk7Z2nRVF@synapsevault.umhvse8.mongodb.net/?appName=SynapseVault';

const docPath = path.join(__dirname, 'vault', 'doc-ict-2024-mentorship.md');
const rawText = fs.readFileSync(docPath, 'utf8');

const ictDoc = {
  id: 'doc-ict-2024-mentorship-master',
  title: 'ICT 2024 Mentorship Master Notes (Lectures 1-21)',
  type: 'pdf',
  sourceUrl: '',
  thumbnailUrl: null,
  author: 'GatieTrades / @TheInnerCircleTrader',
  wordCount: 1650,
  durationFormatted: null,
  rawText,
  chapters: [],
  images: [],
  reviewer: null,
  tags: [
    'ict',
    'trading',
    'liquidity',
    'ndog',
    'nwog',
    'fvg',
    'orderblock',
    'breaker-block',
    'turtle-soup',
    'market-maker-model',
    'discipline',
    'risk-management'
  ],
  entities: [
    { name: 'Draw on Liquidity', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Fair Value Gap', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'NDOG', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'NWOG', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Orderblock', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Breaker Block', "type": 'Concept', description: 'Wikilink concept in document' },
    { name: 'Displacement', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Inversion Fair Value Gap', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Smart Money Reversal', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Turtle Soup', type: 'Concept', description: 'Wikilink concept in document' },
    { name: 'Rejection Block', type: 'Concept', description: 'Wikilink concept in document' }
  ],
  wikilinks: [
    '[[Draw on Liquidity]]',
    '[[Fair Value Gap]]',
    '[[NDOG]]',
    '[[NWOG]]',
    '[[Orderblock]]',
    '[[Breaker Block]]',
    '[[Displacement]]',
    '[[Inversion Fair Value Gap]]',
    '[[Smart Money Reversal]]',
    '[[Turtle Soup]]',
    '[[Rejection Block]]'
  ],
  flashcards: [],
  quizQuestions: [],
  flashcardStats: { totalReviews: 0, mastered: 0 },
  quizStats: { attempts: 0, bestScore: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function syncToAtlas() {
  console.log('Connecting to MongoDB Atlas Cloud Database...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('synapsevault');
  const collection = db.collection('documents');

  // Upsert the ICT Mentorship Document
  await collection.replaceOne(
    { id: ictDoc.id },
    ictDoc,
    { upsert: true }
  );

  console.log('✅ SEEDED TO MONGODB ATLAS CLOUD SUCCESSFULLY!');
  
  const allDocs = await collection.find({}).toArray();
  console.log(`\nTotal Documents in MongoDB Atlas: ${allDocs.length}`);
  allDocs.forEach((d, i) => {
    console.log(`${i + 1}. [${d.id}] ${d.title}`);
  });

  await client.close();
}

syncToAtlas().catch(err => {
  console.error('MongoDB Sync Failed:', err);
  process.exit(1);
});
