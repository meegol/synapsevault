import fs from 'fs';
import path from 'path';
import config from '../config.js';

const VAULT_INDEX_FILE = path.join(config.vaultDir, 'vault_index.json');

// In-memory cache for ultra-fast response & serverless safety
let inMemoryDocs = null;

function getInitialSeedData() {
  return [
    {
      id: "doc-seed-transformer",
      title: "Attention Is All You Need — Transformer Architecture Deep Dive",
      type: "pdf",
      sourceUrl: "/uploads/attention-paper.pdf",
      wordCount: 4850,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["#machine-learning", "#transformers", "#deep-learning", "#nlp", "#attention"],
      entities: [
        { name: "Self-Attention Mechanism", type: "Algorithm", description: "Relates different positions of a single sequence to compute a representation", relatedTo: ["Multi-Head Attention", "Scaled Dot-Product"] },
        { name: "Multi-Head Attention", type: "Architecture", description: "Projects queries, keys, and values h times with different learned linear projections", relatedTo: ["Self-Attention Mechanism", "Transformer Model"] },
        { name: "Transformer Model", type: "Framework", description: "Model architecture eschewing recurrence and relying entirely on an attention mechanism", relatedTo: ["Positional Encoding", "Feed-Forward Networks"] },
        { name: "Positional Encoding", type: "Algorithm", description: "Injects information about the relative or absolute position of tokens in the sequence", relatedTo: ["Transformer Model"] },
        { name: "Feed-Forward Networks", type: "Component", description: "Fully connected feed-forward network applied to each position separately and identically", relatedTo: ["Transformer Model"] }
      ],
      wikilinks: ["[[Self-Attention Mechanism]]", "[[Multi-Head Attention]]", "[[Transformer Model]]", "[[Positional Encoding]]"],
      reviewer: {
        title: "Attention Is All You Need — Transformer Architecture Deep Dive",
        executiveSummary: "The Transformer is a neural network architecture that entirely eschews recurrence and convolutions, relying solely on self-attention mechanisms to draw global dependencies between input and output sequences. It achieves state-of-the-art translation quality while allowing significantly more parallelization during training compared to recurrent networks (RNNs/LSTMs).",
        keyTakeaways: [
          "Eliminates sequential computation bottlenecks present in RNNs and LSTMs, enabling massive distributed parallel training.",
          "Introduces Scaled Dot-Product Attention: Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V.",
          "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.",
          "Positional encodings using sinusoidal functions are added to input embeddings to preserve order information.",
          "Residual connections and layer normalization are applied after each sub-layer: LayerNorm(x + Sublayer(x))."
        ],
        comprehensiveSections: [
          {
            sectionTitle: "1. Model Architecture & Encoder-Decoder Stacks",
            detailedNotesMarkdown: "- **Encoder Stack**: Composed of a stack of $N=6$ identical layers. Each layer consists of two sub-layers: a Multi-Head Self-Attention mechanism and a simple position-wise fully connected feed-forward network.\n- **Residual Connections**: Around each of the two sub-layers, a residual connection followed by layer normalization is employed: $\\text{LayerNorm}(x + \\text{Sublayer}(x))$. All sub-layers produce outputs of dimension $d_{\\text{model}} = 512$.\n- **Decoder Stack**: Also composed of $N=6$ identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer which performs multi-head attention over the output of the encoder stack. Self-attention sub-layers in the decoder are masked to prevent positions from attending to subsequent positions.",
            keyTerms: [
              { term: "Auto-regressive Generation", definition: "A process where previously generated tokens are fed back into the model as input for subsequent token prediction." },
              { term: "Layer Normalization", definition: "Normalizes the inputs across the features dimension for each training example independently." }
            ],
            formulasOrRules: [
              { name: "Residual Sublayer Output", formula: "\\text{Output} = \\text{LayerNorm}(x + \\text{Sublayer}(x))", explanation: "Ensures gradient flows smoothly during backpropagation through deep stacks." }
            ]
          },
          {
            sectionTitle: "2. Scaled Dot-Product and Multi-Head Attention",
            detailedNotesMarkdown: "- **Scaled Dot-Product Attention**: The input consists of queries and keys of dimension $d_k$, and values of dimension $d_v$. The dot products of the query with all keys are computed, divided each by $\\sqrt{d_k}$, and passed through a softmax function to obtain weights on the values.\n- **Scaling Factor $\\frac{1}{\\sqrt{d_k}}$**: For large values of $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. The $\\frac{1}{\\sqrt{d_k}}$ scaling factor counteracts this effect.\n- **Multi-Head Structure**: Rather than performing a single attention function with $d_{\\text{model}}$-dimensional queries, keys and values, it is beneficial to linearly project the queries, keys and values $h$ times with different learned linear projections to $d_k, d_k, d_v$ dimensions.",
            keyTerms: [
              { term: "Query, Key, Value (Q, K, V)", definition: "Vectors representing the token seeking context (Query), token providing identifiers (Key), and token payload information (Value)." }
            ],
            formulasOrRules: [
              { name: "Scaled Dot-Product Attention", formula: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V", explanation: "Calculates relevance-weighted sum of values." },
              { name: "Multi-Head Attention", formula: "\\text{MHA}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O", explanation: "Combines $h=8$ parallel attention heads." }
            ]
          },
          {
            sectionTitle: "3. Positional Encoding Strategy",
            detailedNotesMarkdown: "- Since the architecture contains no recurrence and no convolution, to make use of sequence order, positional encodings must be injected into the input embeddings at the bottoms of the encoder and decoder stacks.\n- Sinusoidal functions of different frequencies are used: $PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d_{\\text{model}}})$ and $PE_{(pos, 2i+1)} = \\cos(pos / 10000^{2i/d_{\\text{model}}})$.\n- This allows the model to learn to attend by relative positions easily, since for any fixed offset $k$, $PE_{pos+k}$ can be represented as a linear function of $PE_{pos}$.",
            keyTerms: [
              { term: "Sinusoidal Positional Encoding", definition: "Deterministic wave-based coordinates added directly to token embeddings." }
            ],
            formulasOrRules: [
              { name: "Positional Encoding (Even/Odd)", formula: "PE_{(pos, 2i)} = \\sin(pos/10000^{2i/d}), \\quad PE_{(pos, 2i+1)} = \\cos(pos/10000^{2i/d})", explanation: "Deterministic fixed position vectors." }
            ]
          }
        ],
        glossary: [
          { term: "Self-Attention", definition: "An attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.", category: "Mechanisms" },
          { term: "Cross-Attention", definition: "Attention in the decoder stack that queries representations output by the top of the encoder stack.", category: "Mechanisms" },
          { term: "Softmax Scaling", definition: "Division by sqrt(d_k) to prevent vanishing gradients in high-dimensional vector spaces.", category: "Optimization" }
        ],
        flashcards: [
          { question: "Why do we divide QK^T by sqrt(d_k) in Scaled Dot-Product Attention?", answer: "To counteract vanishing gradients in softmax caused by large dot-product magnitudes in high dimensions.", category: "Attention Mechanics", difficulty: "medium" },
          { question: "What are the three primary components in each Transformer decoder layer?", answer: "1. Masked Multi-Head Self-Attention, 2. Multi-Head Cross-Attention (over encoder outputs), 3. Position-wise Feed-Forward Network.", category: "Architecture", difficulty: "medium" },
          { question: "Why is masking applied to the self-attention in the decoder?", answer: "To prevent positions from attending to future tokens (preserving the auto-regressive property during generation).", category: "Decoder Stack", difficulty: "easy" },
          { question: "How does the Transformer handle token order without recurrence or convolutions?", answer: "By adding sinusoidal Positional Encodings directly to the input token embeddings.", category: "Positional Encoding", difficulty: "easy" }
        ],
        quizQuestions: [
          {
            question: "What is the primary motivation for scaling the dot product by 1 / sqrt(d_k)?",
            options: [
              "To prevent softmax gradients from becoming vanishingly small as vector dimensions increase.",
              "To enforce strict orthogonality between Query and Key matrices.",
              "To compress the number of parameters required in the Feed-Forward sublayer.",
              "To allow non-linear activations without using ReLU or GELU."
            ],
            correctIndex: 0,
            explanation: "As d_k grows large, dot products become very large in magnitude, pushing the softmax function into regions with tiny gradients. Scaling prevents this."
          },
          {
            question: "In the standard Transformer architecture (Vaswani et al.), what is the dimension d_model of each sub-layer output?",
            options: ["256", "512", "768", "1024"],
            correctIndex: 1,
            explanation: "The base Transformer model uses d_model = 512 with 6 encoder layers and 6 decoder layers."
          },
          {
            question: "How does Multi-Head Attention differ from single-head attention?",
            options: [
              "It runs sequentially on different GPU nodes.",
              "It allows the model to jointly attend to information from different representation subspaces at different positions.",
              "It eliminates the need for Value matrices.",
              "It converts the attention mechanism into a convolutional kernel."
            ],
            correctIndex: 1,
            explanation: "Multi-Head Attention linearly projects Q, K, V into h different subspaces, allowing the model to capture multiple diverse relationships simultaneously."
          }
        ]
      }
    },
    {
      id: "doc-seed-linear-algebra",
      title: "3Blue1Brown: Essence of Linear Algebra — Vectors, Spans & Linear Transformations",
      type: "youtube",
      sourceUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
      thumbnailUrl: "https://img.youtube.com/vi/fNk_zzaMoSs/maxresdefault.jpg",
      author: "3Blue1Brown",
      durationFormatted: "09:52",
      wordCount: 1420,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["#math", "#linear-algebra", "#vectors", "#visual-geometry", "#transformations"],
      entities: [
        { name: "Linear Transformation", type: "Theory", description: "A mapping between vector spaces that preserves vector addition and scalar multiplication", relatedTo: ["Basis Vectors", "Matrix Multiplication"] },
        { name: "Basis Vectors", type: "Concept", description: "The coordinate axes i-hat and j-hat that scale to define any vector in space", relatedTo: ["Linear Transformation", "Span"] },
        { name: "Span", type: "Concept", description: "The set of all possible linear combinations that can be reached using a given set of vectors", relatedTo: ["Basis Vectors", "Linear Transformation"] },
        { name: "Matrix Multiplication", type: "Algorithm", description: "Geometric composition of sequential linear transformations", relatedTo: ["Linear Transformation"] }
      ],
      wikilinks: ["[[Linear Transformation]]", "[[Basis Vectors]]", "[[Span]]", "[[Matrix Multiplication]]"],
      chapters: [
        { start: 0, timestamp: "00:00", text: "Introduction to visual geometric linear algebra and coordinate perspectives." },
        { start: 120, timestamp: "02:00", text: "Physics vs Computer Science vs Mathematician perspective on vectors." },
        { start: 310, timestamp: "05:10", text: "Vector addition and scalar multiplication visualized on the 2D coordinate grid." },
        { start: 450, timestamp: "07:30", text: "Basis vectors i-hat and j-hat as fundamental rulers of coordinate systems." }
      ],
      reviewer: {
        title: "3Blue1Brown: Essence of Linear Algebra — Vectors, Spans & Linear Transformations",
        executiveSummary: "Linear algebra is often taught purely algebraically through arithmetic manipulation of grids of numbers. This lecture grounds every algebraic concept in intuitive visual geometry: vectors as arrows with length and direction, matrices as dynamic geometric transformations of space, and matrix multiplication as the sequential composition of transformations.",
        keyTakeaways: [
          "A vector can be understood geometrically as an arrow rooted at the origin with length and direction.",
          "Every vector in 2D space is uniquely described by scaling basis vectors: v = x*i_hat + y*j_hat.",
          "Linear transformations hold two fundamental rules: the origin must remain fixed, and all grid lines must remain straight and parallel.",
          "A 2x2 matrix simply records where the basis vectors i_hat and j_hat land after the transformation."
        ],
        comprehensiveSections: [
          {
            sectionTitle: "1. The Three Perspectives on Vectors",
            detailedNotesMarkdown: "- **Physics View**: Vectors are arrows pointing in space. A vector has length (magnitude) and direction. As long as those two characteristics are the same, you can move it around and it remains identical.\n- **Computer Science View**: Vectors are ordered lists of numbers. For example, a house price model might represent a house as a 4-dimensional vector `[sq_ft, num_bedrooms, zip_code, price]`.\n- **Mathematics View**: Vectors are generalized objects where addition and scalar multiplication are defined and obey vector space axioms.",
            keyTerms: [
              { term: "Magnitude", definition: "The scalar length of a vector in Euclidean space." },
              { term: "Vector Space", definition: "A collection of objects that can be added together and multiplied by scalars." }
            ],
            formulasOrRules: [
              { name: "Vector Addition (Component-wise)", formula: "\\begin{bmatrix} x_1 \\\\ y_1 \\end{bmatrix} + \\begin{bmatrix} x_2 \\\\ y_2 \\end{bmatrix} = \\begin{bmatrix} x_1+x_2 \\\\ y_1+y_2 \\end{bmatrix}", explanation: "Visually corresponds to placing arrows tip-to-tail." }
            ]
          },
          {
            sectionTitle: "2. Basis Vectors and Spanning Space",
            detailedNotesMarkdown: "- In the standard $xy$-coordinate system, $\\hat{i}$ (i-hat) is the unit vector pointing in the positive $x$-direction with coordinates $\\begin{bmatrix}1 \\\\ 0\\end{bmatrix}$, and $\\hat{j}$ (j-hat) is the unit vector pointing in the positive $y$-direction with coordinates $\\begin{bmatrix}0 \\\\ 1\\end{bmatrix}$.\n- The scalar coordinates of a vector are simply the scalar multipliers scaling these basis vectors: $\\vec{v} = 3\\hat{i} + (-2)\\hat{j}$.\n- **Span**: The span of a set of vectors $\\{\\vec{v}_1, \\vec{v}_2\\}$ is the set of all possible linear combinations $a\\vec{v}_1 + b\\vec{v}_2$. If two vectors are not collinear, their span is the entire 2D plane.",
            keyTerms: [
              { term: "Linear Combination", definition: "The sum of a set of vectors, each multiplied by a scalar constant." },
              { term: "Linear Dependence", definition: "When at least one vector in a set can be expressed as a linear combination of the others without expanding the span." }
            ],
            formulasOrRules: [
              { name: "Linear Combination", formula: "\\vec{v} = c_1\\vec{v}_1 + c_2\\vec{v}_2 + ... + c_n\\vec{v}_n", explanation: "Fundamental operation constructing spans." }
            ]
          }
        ],
        glossary: [
          { term: "Basis", definition: "A set of linearly independent vectors that span a given vector space.", category: "Foundations" },
          { term: "Transformation", definition: "A mathematical function that takes an input vector and outputs a new vector.", category: "Geometry" }
        ],
        flashcards: [
          { question: "What are the two geometric constraints that define a 'linear' transformation?", answer: "1. The origin must remain fixed in place, and 2. All grid lines must remain straight and evenly spaced (parallel).", category: "Transformations", difficulty: "easy" },
          { question: "What information do the columns of a 2x2 transformation matrix represent?", answer: "Column 1 represents where basis vector i-hat lands; Column 2 represents where basis vector j-hat lands.", category: "Matrices", difficulty: "medium" },
          { question: "When are two 2D vectors considered linearly dependent?", answer: "When they are collinear (point along the same line), meaning their span is only a 1D line rather than the full 2D plane.", category: "Span & Independence", difficulty: "easy" }
        ],
        quizQuestions: [
          {
            question: "If a 2D matrix transformation moves i-hat to [0, 1] and j-hat to [-1, 0], what geometric transformation does this matrix represent?",
            options: [
              "A 90-degree counter-clockwise rotation.",
              "A 180-degree reflection across the y-axis.",
              "A shear mapping along the x-axis.",
              "A uniform scaling by a factor of 2."
            ],
            correctIndex: 0,
            explanation: "i-hat [1, 0] rotated 90 deg CCW lands at [0, 1], and j-hat [0, 1] rotated 90 deg CCW lands at [-1, 0]."
          },
          {
            question: "What is the visual definition of vector addition in Euclidean space?",
            options: [
              "Placing the tail of the second vector at the tip of the first vector and drawing an arrow from origin to the final tip.",
              "Multiplying their magnitudes and subtracting the angular displacement.",
              "Rotating both vectors until they align with i-hat.",
              "Calculating the cross-product normal to the plane."
            ],
            correctIndex: 0,
            explanation: "Vector addition geometrically corresponds to tip-to-tail placement."
          }
        ]
      }
    }
  ];
}

/**
 * Helper to read JSON vault index
 */
function readVaultIndex() {
  if (inMemoryDocs && inMemoryDocs.length > 0) {
    return inMemoryDocs;
  }

  try {
    if (fs.existsSync(VAULT_INDEX_FILE)) {
      const data = fs.readFileSync(VAULT_INDEX_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (parsed && parsed.length > 0) {
        inMemoryDocs = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read index file, falling back to seed:', err.message);
  }

  const initialSeed = getInitialSeedData();
  inMemoryDocs = initialSeed;
  
  try {
    fs.writeFileSync(VAULT_INDEX_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
    initialSeed.forEach(doc => saveMarkdownFile(doc));
  } catch (e) {
    // Disk write might be read-only on some serverless platforms; in-memory fallback handles it
  }

  return initialSeed;
}

/**
 * Helper to write JSON vault index
 */
function writeVaultIndex(items) {
  inMemoryDocs = items;
  try {
    fs.writeFileSync(VAULT_INDEX_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: Vault index saved to memory cache.');
  }
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
