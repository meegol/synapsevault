const STORAGE_KEY = 'synapse_vault_documents_v1';

/**
 * Load documents from browser persistent storage
 * @returns {Array<Object>}
 */
export function loadVaultFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read local vault storage:', err);
    return [];
  }
}

/**
 * Save documents to browser persistent storage
 * @param {Array<Object>} docs 
 */
export function saveVaultToLocal(docs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs || []));
  } catch (err) {
    console.warn('Failed to save to local vault storage:', err);
  }
}

/**
 * Build graph data directly from documents in browser
 * @param {Array<Object>} docs 
 * @returns {Object}
 */
export function buildClientKnowledgeGraph(docs = []) {
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
