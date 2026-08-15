---
id: "doc-seed-linear-algebra"
title: "3Blue1Brown: Essence of Linear Algebra — Vectors, Spans & Linear Transformations"
type: "youtube"
sourceUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs"
tags: ["#math", "#linear-algebra", "#vectors", "#visual-geometry", "#transformations"]
created: "2026-08-15T16:35:43.967Z"
updated: "2026-08-15T16:35:43.967Z"
---

# 3Blue1Brown: Essence of Linear Algebra — Vectors, Spans & Linear Transformations

## Executive Summary
Linear algebra is often taught purely algebraically through arithmetic manipulation of grids of numbers. This lecture grounds every algebraic concept in intuitive visual geometry: vectors as arrows with length and direction, matrices as dynamic geometric transformations of space, and matrix multiplication as the sequential composition of transformations.

## Key Takeaways
- A vector can be understood geometrically as an arrow rooted at the origin with length and direction.
- Every vector in 2D space is uniquely described by scaling basis vectors: v = x*i_hat + y*j_hat.
- Linear transformations hold two fundamental rules: the origin must remain fixed, and all grid lines must remain straight and parallel.
- A 2x2 matrix simply records where the basis vectors i_hat and j_hat land after the transformation.

## Comprehensive Study Reviewer

### 1. The Three Perspectives on Vectors
- **Physics View**: Vectors are arrows pointing in space. A vector has length (magnitude) and direction. As long as those two characteristics are the same, you can move it around and it remains identical.
- **Computer Science View**: Vectors are ordered lists of numbers. For example, a house price model might represent a house as a 4-dimensional vector `[sq_ft, num_bedrooms, zip_code, price]`.
- **Mathematics View**: Vectors are generalized objects where addition and scalar multiplication are defined and obey vector space axioms.

**Key Terms:**
- **Magnitude**: The scalar length of a vector in Euclidean space.
- **Vector Space**: A collection of objects that can be added together and multiplied by scalars.
**Formulas/Rules:**
- **Vector Addition (Component-wise)**: `\begin{bmatrix} x_1 \\ y_1 \end{bmatrix} + \begin{bmatrix} x_2 \\ y_2 \end{bmatrix} = \begin{bmatrix} x_1+x_2 \\ y_1+y_2 \end{bmatrix}` — Visually corresponds to placing arrows tip-to-tail.



### 2. Basis Vectors and Spanning Space
- In the standard $xy$-coordinate system, $\hat{i}$ (i-hat) is the unit vector pointing in the positive $x$-direction with coordinates $\begin{bmatrix}1 \\ 0\end{bmatrix}$, and $\hat{j}$ (j-hat) is the unit vector pointing in the positive $y$-direction with coordinates $\begin{bmatrix}0 \\ 1\end{bmatrix}$.
- The scalar coordinates of a vector are simply the scalar multipliers scaling these basis vectors: $\vec{v} = 3\hat{i} + (-2)\hat{j}$.
- **Span**: The span of a set of vectors $\{\vec{v}_1, \vec{v}_2\}$ is the set of all possible linear combinations $a\vec{v}_1 + b\vec{v}_2$. If two vectors are not collinear, their span is the entire 2D plane.

**Key Terms:**
- **Linear Combination**: The sum of a set of vectors, each multiplied by a scalar constant.
- **Linear Dependence**: When at least one vector in a set can be expressed as a linear combination of the others without expanding the span.
**Formulas/Rules:**
- **Linear Combination**: `\vec{v} = c_1\vec{v}_1 + c_2\vec{v}_2 + ... + c_n\vec{v}_n` — Fundamental operation constructing spans.


## Concepts & Wikilinks


## Flashcards
### Q1: What are the two geometric constraints that define a 'linear' transformation?
**A:** 1. The origin must remain fixed in place, and 2. All grid lines must remain straight and evenly spaced (parallel).

### Q2: What information do the columns of a 2x2 transformation matrix represent?
**A:** Column 1 represents where basis vector i-hat lands; Column 2 represents where basis vector j-hat lands.

### Q3: When are two 2D vectors considered linearly dependent?
**A:** When they are collinear (point along the same line), meaning their span is only a 1D line rather than the full 2D plane.

