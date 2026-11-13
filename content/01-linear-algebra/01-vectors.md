---
title: Vectors
description: One object, drawn as an arrow or written as a list.
date: 2026-02-02
tags: [vectors, dot-product, geometry]
---

At the heart of Linear Algebra lies the concept of **vectors**. And that is where we will begin our journey.

A vector is traditionally defined as _a quantity that has both magnitude and direction_. This definition works well in physics, where vectors describe things like velocity, force, and displacement.

But here is an interesting question: _How does this concept apply to Machine Learning?_

After all, datasets are made up of numbers and features. They don't inherently have directions like physical quantities do. So, what exactly makes vectors so important in Machine Learning?

This is where our approach will be a little different from that of conventional Linear Algebra tutorials. Rather than starting with abstract mathematical definitions and memorising properties, we will build an intuition for vectors from the ground up, exploring what they represent, how they work, and, most importantly, why they are fundamental to Machine Learning.

Our goal is not simply to learn Linear Algebra as a mathematical subject, but to understand it through the lens of Machine Learning.

## The Motivating Problem: Finding Similarity Between Students

Imagine an online learning platform wants to recommend courses to students based on their learning interests.

The platform tracks how interested each student is in three subjects: Mathematics, Programming, and Physics. Each interest is rated on a scale of 1 to 5.

Consider three students:
- Student A: [5, 4, 1] (loves Mathematics, likes Programming, has little interest in Physics).
- Student B: [4, 5, 2] (likes Mathematics and Programming, has some interest in Physics).
- Student C: [1, 2, 5] (has little interest in Mathematics and Programming, loves Physics).

We can represent each student's interests as a vector in a 3D space, where each dimension represents one subject.

## The problem: The platform wants to determine which student has interests most similar to Student A.

How can we quantify this similarity mathematically?

This is where the dot product comes into play. By calculating the dot product between Student A's vector and the vectors of Students B and C, we can begin exploring how vectors help us measure relationships between data points.

## What is a Dot Product?

The **dot product**, also known as the *scalar product*, is an algebraic operation that takes two vectors of the same dimension and produces a single scalar (a real number).

For two vectors $\mathbf{a}, \mathbf{b} \in \mathbb{R}^n$, their dot product is defined as the sum of the products of their corresponding components.

Mathematically:

$$
\boxed{
\mathbf{a} \cdot \mathbf{b}
=
\sum_{i=1}^{n} a_i b_i
}
$$

Where:

- $\mathbf{a}$ and $\mathbf{b}$ are vectors in an $n$-dimensional real vector space.
- $a_i$ and $b_i$ represent the $i$-th components of the respective vectors.
- $n$ is the number of dimensions.
- The resulting value is a scalar.

### Example

Consider two vectors:

$$
\mathbf{a} =
\begin{bmatrix}
2\\
3\\
4
\end{bmatrix},
\qquad
\mathbf{b} =
\begin{bmatrix}
1\\
5\\
2
\end{bmatrix}
$$

Their dot product is:

$$
\begin{aligned}
\mathbf{a} \cdot \mathbf{b}
&= (2 \times 1) + (3 \times 5) + (4 \times 2)\\
&= 2 + 15 + 8\\
&= 25
\end{aligned}
$$

Notice that the result is a single number, not another vector.

### Geometric Interpretation

The dot product can also be defined in terms of the magnitudes of two vectors and the angle between them:

$$
\mathbf{a} \cdot \mathbf{b}
=
\|\mathbf{a}\| \|\mathbf{b}\| \cos\theta
$$

Where:

- $\|\mathbf{a}\|$ is the magnitude (length) of vector $\mathbf{a}$.
- $\|\mathbf{b}\|$ is the magnitude (length) of vector $\mathbf{b}$.
- $\theta$ is the angle between the two vectors.

This gives us an interesting insight:

- If the angle is less than $90^\circ$, the dot product is positive.
- If the angle is exactly $90^\circ$, the dot product is zero.
- If the angle is greater than $90^\circ$, the dot product is negative.

## Solving the Problem: Measuring Similarity Between Students

Let's calculate the actual angles between the students' interest vectors to understand how similar their learning preferences are.

**Inputs:**

- Student A: $\mathbf{a} = [5, 4, 1]$
- Student B: $\mathbf{b} = [4, 5, 2]$
- Student C: $\mathbf{c} = [1, 2, 5]$

Each component represents a student's interest in Mathematics, Programming, and Physics, respectively.

---

### Case 1: Comparing Students with Similar Interests (A and B)

**Step 1: Calculate the dot product $\mathbf{a} \cdot \mathbf{b}$.**

$$
\begin{aligned}
\mathbf{a} \cdot \mathbf{b}
&= (5 \times 4) + (4 \times 5) + (1 \times 2)\\
&= 20 + 20 + 2\\
&= 42
\end{aligned}
$$

**Step 2: Calculate the magnitudes $\|\mathbf{a}\|$ and $\|\mathbf{b}\|$.**

$$
\begin{aligned}
\|\mathbf{a}\|
&= \sqrt{5^2 + 4^2 + 1^2}\\
&= \sqrt{25 + 16 + 1}\\
&= \sqrt{42}\\
&\approx 6.48
\end{aligned}
$$

$$
\begin{aligned}
\|\mathbf{b}\|
&= \sqrt{4^2 + 5^2 + 2^2}\\
&= \sqrt{16 + 25 + 4}\\
&= \sqrt{45}\\
&\approx 6.71
\end{aligned}
$$

**Step 3: Calculate the angle $\theta$ between the vectors.**

Recall the geometric definition of the dot product:

$$
\mathbf{a} \cdot \mathbf{b}
=
\|\mathbf{a}\|\|\mathbf{b}\|\cos\theta
$$

Rearranging the equation:

$$
\cos\theta =
\frac{\mathbf{a}\cdot\mathbf{b}}
{\|\mathbf{a}\|\|\mathbf{b}\|}
$$

Substituting our values:

$$
\begin{aligned}
\cos\theta
&= \frac{42}{\sqrt{42}\times\sqrt{45}}\\
&\approx 0.9661
\end{aligned}
$$

Taking the inverse cosine:

$$
\begin{aligned}
\theta &= \cos^{-1}(0.9661)\\
&\approx 15.0^\circ
\end{aligned}
$$

**Result:** The angle between Student A's and Student B's interest vectors is approximately **15 degrees**.

This is a relatively small angle, indicating that their learning preferences are quite similar. Both students show strong interests in Mathematics and Programming, with comparatively less interest in Physics.

---

### Case 2: Comparing Students with Different Interests (A and C)

**Step 1: Calculate the dot product $\mathbf{a} \cdot \mathbf{c}$.**

$$
\begin{aligned}
\mathbf{a} \cdot \mathbf{c}
&= (5 \times 1) + (4 \times 2) + (1 \times 5)\\
&= 5 + 8 + 5\\
&= 18
\end{aligned}
$$

**Step 2: Calculate the magnitude $\|\mathbf{c}\|$.**

We already calculated $\|\mathbf{a}\| = \sqrt{42}$.

$$
\begin{aligned}
\|\mathbf{c}\|
&= \sqrt{1^2 + 2^2 + 5^2}\\
&= \sqrt{1 + 4 + 25}\\
&= \sqrt{30}\\
&\approx 5.48
\end{aligned}
$$

**Step 3: Calculate the angle $\theta$ between the vectors.**

Using the same geometric definition:

$$
\cos\theta =
\frac{\mathbf{a}\cdot\mathbf{c}}
{\|\mathbf{a}\|\|\mathbf{c}\|}
$$

Substituting our values:

$$
\begin{aligned}
\cos\theta
&= \frac{18}{\sqrt{42}\times\sqrt{30}}\\
&\approx 0.5071
\end{aligned}
$$

Taking the inverse cosine:

$$
\begin{aligned}
\theta &= \cos^{-1}(0.5071)\\
&\approx 59.5^\circ
\end{aligned}
$$

**Result:** The angle between Student A's and Student C's interest vectors is approximately **59.5 degrees**.

This is a considerably larger angle than the one we obtained when comparing Students A and B. Student C has a strong interest in Physics but relatively little interest in Mathematics and Programming.

---

### What Have We Learned?

Let's put our results side by side:

| Comparison | Dot Product | Angle |
|---|---:|---:|
| Student A and B | 42 | $15.0^\circ$ |
| Student A and C | 18 | $59.5^\circ$ |

The difference in angles gives us a way to quantify how closely two students' interests align.

- A smaller angle indicates that the vectors point in more similar directions.
- A larger angle indicates that the vectors point in less similar directions.
- An angle of $90^\circ$ indicates that the vectors are perpendicular.

This is the fundamental idea behind **Cosine Similarity**.

In Machine Learning, we can use this mathematical concept to compare users, recommend courses, find similar documents, and even compare words based on their numerical representations.

We have just taken our first step towards understanding how Linear Algebra helps machines find relationships in data.

### In Practice: Implementing It with Python

So far, we have calculated the dot products, magnitudes, and angles manually. But in real-world Machine Learning applications, we rarely perform these calculations by hand. Libraries like **NumPy** make the process much simpler.

Let's implement what we have learned using Python.

**Step 1: Define the vectors**

First, we represent the learning interests of our three students as NumPy arrays.

```python
import numpy as np

# Student interests: [Mathematics, Programming, Physics]
a = np.array([5, 4, 1])  # Student A
b = np.array([4, 5, 2])  # Student B
c = np.array([1, 2, 5])  # Student C
```

**Step 2: Calculate the angle between two vectors**

Next, we write a function that calculates the angle between any two vectors using the dot product.

```python
def get_angle_between_vectors(v1, v2):
    dot_product = np.dot(v1, v2)

    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    cos_theta = dot_product / (norm_v1 * norm_v2)

    angle_rad = np.arccos(np.clip(cos_theta, -1.0, 1.0))
    angle_deg = np.degrees(angle_rad)

    return angle_deg
```

Here is what the NumPy functions do:

- `np.dot()` calculates the dot product of two vectors.
- `np.linalg.norm()` calculates the magnitude of a vector.
- `np.arccos()` calculates the inverse cosine, giving us the angle in radians.
- `np.degrees()` converts the angle from radians to degrees.
- `np.clip()` prevents minor floating-point errors from producing invalid inverse cosine inputs.

**Step 3: Compare the students**

Now, let's calculate the angles between Student A and the other two students.

```python
angle_ab = get_angle_between_vectors(a, b)
angle_ac = get_angle_between_vectors(a, c)

print(f"Angle between Student A and B: {angle_ab:.1f} degrees")
print(f"Angle between Student A and C: {angle_ac:.1f} degrees")
```

**Output:**

```text
Angle between Student A and B: 15.0 degrees
Angle between Student A and C: 59.5 degrees
```

### What Does This Tell Us?

Our Python implementation produces the same results as our manual calculations.

Student A and Student B have an angle of approximately $15^\circ$, indicating that their learning interests are closely aligned. Student A and Student C, on the other hand, have an angle of approximately $59.5^\circ$, indicating considerably different interests.

What we have accomplished is quite interesting: **we have converted the problem of comparing students' learning preferences into a mathematical problem of measuring the angle between two vectors.**

This is one of the ways Linear Algebra makes it possible for Machine Learning algorithms to identify relationships and patterns in data.