import fs from 'fs';
import path from 'path';
import config from '../config.js';
import * as dbService from './dbService.js';

const VAULT_INDEX_FILE = path.join(config.vaultDir, 'vault_index.json');

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory cache starting completely empty
let inMemoryDocs = [];

/**
 * Async save to Vercel KV or MongoDB Atlas if attached
 */
export async function saveToCloudStorage(docs) {
  if (dbService.isMongoConfigured()) {
    dbService.syncMongoVault(docs).catch(e => console.warn('Mongo sync notice:', e.message));
  }
  if (!kvUrl || !kvToken) return;
  try {
    await fetch(`${kvUrl}/set/synapse_vault_docs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(docs)
    });
  } catch (err) {
    console.warn('Cloud KV write notice:', err.message);
  }
}

/**
 * Async load from Vercel KV / Upstash Redis if attached
 */
export async function loadFromCloudKV() {
  if (!kvUrl || !kvToken) return null;
  try {
    const res = await fetch(`${kvUrl}/get/synapse_vault_docs`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const data = await res.json();
    if (data && data.result) {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      if (Array.isArray(parsed)) {
        inMemoryDocs = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Cloud KV read notice:', err.message);
  }
  return null;
}

/**
 * Read JSON vault index
 */
function readVaultIndex() {
  if (Array.isArray(inMemoryDocs) && inMemoryDocs.length > 0) {
    return inMemoryDocs;
  }

  try {
    if (fs.existsSync(VAULT_INDEX_FILE)) {
      const data = fs.readFileSync(VAULT_INDEX_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed)) {
        inMemoryDocs = parsed;
        return inMemoryDocs;
      }
    }
  } catch (err) {
    console.warn('Could not read vault index file:', err.message);
  }

  inMemoryDocs = [];
  return [];
}

/**
 * Write JSON vault index
 */
function writeVaultIndex(items) {
  inMemoryDocs = items || [];
  try {
    fs.writeFileSync(VAULT_INDEX_FILE, JSON.stringify(inMemoryDocs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: Vault index saved to memory cache.');
  }
  saveToCloudStorage(inMemoryDocs);
}

/**
 * Save Markdown file for Obsidian compatibility
 */
function saveMarkdownFile(doc) {
  try {
    const safeTitle = (doc.title || 'Untitled').replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdPath = path.join(config.vaultDir, `${doc.id}_${safeTitle}.md`);

    const frontmatter = `---
id: "${doc.id}"
title: "${doc.title}"
type: "${doc.type}"
sourceUrl: "${doc.sourceUrl || ''}"
tags: [${(doc.tags || []).map(t => `"#${t.replace(/^#/, '')}"`).join(', ')}]
created: "${doc.createdAt}"
updated: "${doc.updatedAt || doc.createdAt}"
---

# ${doc.title}

## Executive Summary
${doc.reviewer?.executiveSummary || doc.summary || 'No summary available.'}

## Key Takeaways
${(doc.reviewer?.keyTakeaways || []).map(t => `- ${t}`).join('\n')}

## Comprehensive Study Reviewer
${(doc.reviewer?.comprehensiveSections || []).map(s => `
### ${s.sectionTitle}
${s.detailedNotesMarkdown || ''}

${s.keyTerms && s.keyTerms.length > 0 ? `**Key Terms:**\n` + s.keyTerms.map(k => `- **${k.term}**: ${k.definition}`).join('\n') : ''}
${s.formulasOrRules && s.formulasOrRules.length > 0 ? `**Formulas/Rules:**\n` + s.formulasOrRules.map(f => `- **${f.name}**: \`${f.formula || ''}\` — ${f.explanation || ''}`).join('\n') : ''}
`).join('\n\n')}

## Concepts & Wikilinks
${(doc.reviewer?.entities || []).map(e => `- [[${e.name}]]: ${e.description || ''}`).join('\n')}

## Flashcards
${(doc.reviewer?.flashcards || []).map((f, i) => `### Q${i+1}: ${f.question}\n**A:** ${f.answer}\n`).join('\n')}
`;

    fs.writeFileSync(mdPath, frontmatter, 'utf-8');
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Save new or updated document to vault
 */
export function saveDocument(doc) {
  const docs = readVaultIndex();
  const now = new Date().toISOString();

  const completeDoc = {
    id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: doc.title || 'Untitled Document',
    type: doc.type || 'note',
    sourceUrl: doc.sourceUrl || '',
    thumbnailUrl: doc.thumbnailUrl || null,
    author: doc.author || null,
    wordCount: doc.wordCount || 0,
    durationFormatted: doc.durationFormatted || null,
    rawText: doc.rawText || '',
    chapters: doc.chapters || [],
    images: doc.images || [],
    reviewer: doc.reviewer || null,
    tags: doc.tags || doc.reviewer?.tags || [],
    entities: doc.entities || doc.reviewer?.entities || [],
    wikilinks: doc.wikilinks || doc.reviewer?.wikilinks || [],
    flashcards: doc.flashcards || doc.reviewer?.flashcards || [],
    quizQuestions: doc.quizQuestions || doc.reviewer?.quizQuestions || [],
    flashcardStats: doc.flashcardStats || { totalReviews: 0, mastered: 0 },
    quizStats: doc.quizStats || { attempts: 0, bestScore: 0 },
    createdAt: doc.createdAt || now,
    updatedAt: now
  };

  const existingIdx = docs.findIndex(d => d.id === completeDoc.id);
  if (existingIdx >= 0) {
    docs[existingIdx] = completeDoc;
  } else {
    docs.unshift(completeDoc);
  }

  writeVaultIndex(docs);
  saveMarkdownFile(completeDoc);

  return completeDoc;
}

export function getAllDocuments() {
  return readVaultIndex();
}

export function syncVault(incomingDocs) {
  if (!Array.isArray(incomingDocs)) return readVaultIndex();
  writeVaultIndex(incomingDocs);
  incomingDocs.forEach(d => saveMarkdownFile(d));
  return incomingDocs;
}

export function getDocumentById(id) {
  const docs = readVaultIndex();
  return docs.find(d => d.id === id) || null;
}

export function updateDocument(id, updates) {
  const docs = readVaultIndex();
  const idx = docs.findIndex(d => d.id === id);
  if (idx === -1) return null;

  docs[idx] = {
    ...docs[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeVaultIndex(docs);
  saveMarkdownFile(docs[idx]);
  return docs[idx];
}

export function deleteDocument(id) {
  const docs = readVaultIndex();
  const filtered = docs.filter(d => d.id !== id);
  writeVaultIndex(filtered);

  try {
    const files = fs.readdirSync(config.vaultDir);
    for (const file of files) {
      if (file.startsWith(id)) {
        fs.unlinkSync(path.join(config.vaultDir, file));
      }
    }
  } catch (err) {
    // Ignore
  }

  return true;
}

export function getKnowledgeGraphData() {
  const docs = readVaultIndex();
  const nodesMap = new Map();
  const links = [];
  const linkKeySet = new Set();

  function addLink(source, target, type = 'related', weight = 1) {
    if (source === target) return;
    const linkKey = [source, target].sort().join(':::');
    if (!linkKeySet.has(linkKey)) {
      linkKeySet.add(linkKey);
      links.push({ source, target, type, weight });
    }
  }

  docs.forEach(doc => {
    const docNodeId = `doc:${doc.id}`;
    nodesMap.set(docNodeId, {
      id: docNodeId,
      docId: doc.id,
      label: doc.title,
      type: doc.type,
      category: 'document',
      tags: doc.tags || [],
      sourceUrl: doc.sourceUrl,
      thumbnailUrl: doc.thumbnailUrl,
      val: 20 + Math.min(30, (doc.tags?.length || 0) * 4),
      color: doc.type === 'pdf' ? '#fb4934' : doc.type === 'youtube' ? '#fe8019' : '#83a598'
    });

    (doc.tags || []).forEach(tag => {
      const cleanTag = tag.replace(/^#/, '').trim();
      if (!cleanTag) return;
      const tagNodeId = `tag:${cleanTag.toLowerCase()}`;

      if (!nodesMap.has(tagNodeId)) {
        nodesMap.set(tagNodeId, {
          id: tagNodeId,
          label: `#${cleanTag}`,
          type: 'tag',
          category: 'tag',
          val: 12,
          color: '#8ec07c'
        });
      } else {
        const existing = nodesMap.get(tagNodeId);
        existing.val += 3;
      }

      addLink(docNodeId, tagNodeId, 'has_tag', 1);
    });

    const entities = doc.entities || doc.reviewer?.entities || [];
    entities.forEach(ent => {
      const entName = typeof ent === 'string' ? ent : ent.name;
      if (!entName) return;
      const entNodeId = `concept:${entName.toLowerCase()}`;

      if (!nodesMap.has(entNodeId)) {
        nodesMap.set(entNodeId, {
          id: entNodeId,
          label: entName,
          type: 'concept',
          category: 'concept',
          description: ent.description || '',
          val: 14,
          color: '#fabd2f'
        });
      } else {
        const existing = nodesMap.get(entNodeId);
        existing.val += 4;
      }

      addLink(docNodeId, entNodeId, 'discusses', 2);

      if (ent.relatedTo && Array.isArray(ent.relatedTo)) {
        ent.relatedTo.forEach(relName => {
          const relNodeId = `concept:${relName.toLowerCase()}`;
          if (!nodesMap.has(relNodeId)) {
            nodesMap.set(relNodeId, {
              id: relNodeId,
              label: relName,
              type: 'concept',
              category: 'concept',
              val: 10,
              color: '#fabd2f'
            });
          }
          addLink(entNodeId, relNodeId, 'concept_relation', 1.5);
        });
      }
    });

    const wikilinks = doc.wikilinks || doc.reviewer?.wikilinks || [];
    wikilinks.forEach(wl => {
      const cleanWl = wl.replace(/[\[\]]/g, '').trim();
      if (!cleanWl) return;
      const wlNodeId = `concept:${cleanWl.toLowerCase()}`;
      if (!nodesMap.has(wlNodeId)) {
        nodesMap.set(wlNodeId, {
          id: wlNodeId,
          label: cleanWl,
          type: 'concept',
          category: 'concept',
          val: 10,
          color: '#fabd2f'
        });
      }
      addLink(docNodeId, wlNodeId, 'wikilink', 1.5);
    });
  });

  const nodes = Array.from(nodesMap.values());

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      documentsCount: docs.length,
      conceptsCount: nodes.filter(n => n.category === 'concept').length,
      tagsCount: nodes.filter(n => n.category === 'tag').length
    }
  };
}
