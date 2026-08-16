import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import dotenv from 'dotenv';
dotenv.config();

import { seedVaultDocument, summarizeVaultDocument, listVaultDocuments } from '../services/agentVault.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    console.log(`
===================================================
🧠 SynapseVault Agent CLI Helper
===================================================
Commands:
  node server/scripts/seedVault.js list
  node server/scripts/seedVault.js summarize <docId>
  node server/scripts/seedVault.js seed <jsonFilePath>
    `);
    process.exit(0);
  }

  if (command === 'list') {
    const docs = await listVaultDocuments();
    console.log('--- VAULT DOCUMENTS ---');
    docs.forEach((d, i) => {
      console.log(`${i+1}. [${d.id}] ${d.title} (${d.type}) - ${d.wordCount} words`);
    });
    process.exit(0);
  }

  if (command === 'summarize') {
    const docId = args[1];
    if (!docId) {
      console.error('Error: Please provide a document ID.');
      process.exit(1);
    }
    console.log(`Summarizing document "${docId}" with Gemini...`);
    const doc = await summarizeVaultDocument(docId);
    console.log('Successfully generated AI reviewer for:', doc.title);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Agent CLI Error:', err.message);
  process.exit(1);
});
