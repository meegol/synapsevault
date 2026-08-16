import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config();

import { seedVaultDocument, listVaultDocuments } from './services/agentVault.js';

async function test() {
  console.log('Testing clean Obsidian document ingestion...');
  const doc = await seedVaultDocument({
    title: 'ICT Institutional Trading Principles',
    type: 'note',
    rawText: `# ICT Institutional Trading Principles

Market structure relies on [[IPDA Architecture]] and [[Liquidity Delivery]].

## Key Concepts
- **[[Fair Value Gap]]**: A 3-candle imbalance in price delivery.
- **[[Orderblock]]**: The last up-close candle before a down move, or last down-close candle before an up move.
- **[[Liquidity Void]]**: Rapid price movement leaving un-balanced liquidity.

#trading #ict #market-structure #risk-management
`
  });

  console.log('--- NOTE CREATION SUCCESS! ---');
  console.log('Title:', doc.title);
  console.log('Tags:', doc.tags);
  console.log('Wikilinks:', doc.wikilinks);
  console.log('Entities:', doc.entities.map(e => e.name));
  console.log('Reviewer is Null (Clean Raw Vault):', doc.reviewer === null);
}

test().catch(console.error);
