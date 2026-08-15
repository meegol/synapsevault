---
id: "doc-seed-transformer"
title: "Attention Is All You Need — Transformer Architecture Deep Dive"
type: "pdf"
sourceUrl: "/uploads/attention-paper.pdf"
tags: ["#machine-learning", "#transformers", "#deep-learning", "#nlp", "#attention"]
created: "2026-08-15T16:35:43.967Z"
updated: "2026-08-15T16:35:43.967Z"
---

# Attention Is All You Need — Transformer Architecture Deep Dive

## Executive Summary
The Transformer is a neural network architecture that entirely eschews recurrence and convolutions, relying solely on self-attention mechanisms to draw global dependencies between input and output sequences. It achieves state-of-the-art translation quality while allowing significantly more parallelization during training compared to recurrent networks (RNNs/LSTMs).

## Key Takeaways
- Eliminates sequential computation bottlenecks present in RNNs and LSTMs, enabling massive distributed parallel training.
- Introduces Scaled Dot-Product Attention: Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V.
- Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.
- Positional encodings using sinusoidal functions are added to input embeddings to preserve order information.
- Residual connections and layer normalization are applied after each sub-layer: LayerNorm(x + Sublayer(x)).

## Comprehensive Study Reviewer

### 1. Model Architecture & Encoder-Decoder Stacks
- **Encoder Stack**: Composed of a stack of $N=6$ identical layers. Each layer consists of two sub-layers: a Multi-Head Self-Attention mechanism and a simple position-wise fully connected feed-forward network.
- **Residual Connections**: Around each of the two sub-layers, a residual connection followed by layer normalization is employed: $\text{LayerNorm}(x + \text{Sublayer}(x))$. All sub-layers produce outputs of dimension $d_{\text{model}} = 512$.
- **Decoder Stack**: Also composed of $N=6$ identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer which performs multi-head attention over the output of the encoder stack. Self-attention sub-layers in the decoder are masked to prevent positions from attending to subsequent positions.

**Key Terms:**
- **Auto-regressive Generation**: A process where previously generated tokens are fed back into the model as input for subsequent token prediction.
- **Layer Normalization**: Normalizes the inputs across the features dimension for each training example independently.
**Formulas/Rules:**
- **Residual Sublayer Output**: `\text{Output} = \text{LayerNorm}(x + \text{Sublayer}(x))` — Ensures gradient flows smoothly during backpropagation through deep stacks.



### 2. Scaled Dot-Product and Multi-Head Attention
- **Scaled Dot-Product Attention**: The input consists of queries and keys of dimension $d_k$, and values of dimension $d_v$. The dot products of the query with all keys are computed, divided each by $\sqrt{d_k}$, and passed through a softmax function to obtain weights on the values.
- **Scaling Factor $\frac{1}{\sqrt{d_k}}$**: For large values of $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. The $\frac{1}{\sqrt{d_k}}$ scaling factor counteracts this effect.
- **Multi-Head Structure**: Rather than performing a single attention function with $d_{\text{model}}$-dimensional queries, keys and values, it is beneficial to linearly project the queries, keys and values $h$ times with different learned linear projections to $d_k, d_k, d_v$ dimensions.

**Key Terms:**
- **Query, Key, Value (Q, K, V)**: Vectors representing the token seeking context (Query), token providing identifiers (Key), and token payload information (Value).
**Formulas/Rules:**
- **Scaled Dot-Product Attention**: `\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V` — Calculates relevance-weighted sum of values.
- **Multi-Head Attention**: `\text{MHA}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O` — Combines $h=8$ parallel attention heads.



### 3. Positional Encoding Strategy
- Since the architecture contains no recurrence and no convolution, to make use of sequence order, positional encodings must be injected into the input embeddings at the bottoms of the encoder and decoder stacks.
- Sinusoidal functions of different frequencies are used: $PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{\text{model}}})$ and $PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{\text{model}}})$.
- This allows the model to learn to attend by relative positions easily, since for any fixed offset $k$, $PE_{pos+k}$ can be represented as a linear function of $PE_{pos}$.

**Key Terms:**
- **Sinusoidal Positional Encoding**: Deterministic wave-based coordinates added directly to token embeddings.
**Formulas/Rules:**
- **Positional Encoding (Even/Odd)**: `PE_{(pos, 2i)} = \sin(pos/10000^{2i/d}), \quad PE_{(pos, 2i+1)} = \cos(pos/10000^{2i/d})` — Deterministic fixed position vectors.


## Concepts & Wikilinks


## Flashcards
### Q1: Why do we divide QK^T by sqrt(d_k) in Scaled Dot-Product Attention?
**A:** To counteract vanishing gradients in softmax caused by large dot-product magnitudes in high dimensions.

### Q2: What are the three primary components in each Transformer decoder layer?
**A:** 1. Masked Multi-Head Self-Attention, 2. Multi-Head Cross-Attention (over encoder outputs), 3. Position-wise Feed-Forward Network.

### Q3: Why is masking applied to the self-attention in the decoder?
**A:** To prevent positions from attending to future tokens (preserving the auto-regressive property during generation).

### Q4: How does the Transformer handle token order without recurrence or convolutions?
**A:** By adding sinusoidal Positional Encodings directly to the input token embeddings.

