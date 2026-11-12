---
title: Vectors
description: One object, drawn as an arrow or written as a list.
date: 2026-02-02
tags: [vectors, dot-product]
---

A vector in $\mathbb{R}^n$ is an ordered list of real numbers. Draw that list as an arrow from the origin and you get a second picture of the same object: how far to travel along each axis. The algebra lives on the list. The geometry lives on the arrow. A good calculation lets you move between them without changing the object.

## Addition and scaling

Addition is componentwise. In the plane,

$$
(a_1, a_2) + (b_1, b_2) = (a_1 + b_1,\ a_2 + b_2).
$$

To add the arrows, place the tail of the second at the head of the first. The sum is the arrow from the start of the first to the end of the second, the diagonal of the parallelogram they span.

Scaling by a real number $c$ multiplies every component. The arrow stretches by $|c|$, and it reverses direction when $c$ is negative.

> [!definition] Linear combination
> A linear combination of $\mathbf{v}$ and $\mathbf{w}$ is any vector $c\mathbf{v} + d\mathbf{w}$ with real coefficients $c$ and $d$.

## The dot product

The dot product sends two lists to a number:

$$
\mathbf{a}\cdot\mathbf{b} = a_1 b_1 + \cdots + a_n b_n.
$$

When both arrows are nonzero it also reads the angle $\theta$ between them,

$$
\mathbf{a}\cdot\mathbf{b} = \|\mathbf{a}\|\,\|\mathbf{b}\|\cos\theta,
$$

where $\|\mathbf{a}\| = \sqrt{\mathbf{a}\cdot\mathbf{a}}$ is the length. The sign of the product tells you whether the angle is acute or obtuse. The product is zero when the arrows are perpendicular.

> [!example] A right angle in the plane
> $(1, 2)\cdot(-2, 1) = -2 + 2 = 0$, so these two arrows meet at a right angle.

## Coordinates are a choice

The list $(1, 2)$ depends on a basis. Rotate the axes and the same arrow gets different components. The length, the angle, and the dot product do not. Any orthonormal basis reports the same dot product, because the dot product is measuring the arrows, not the grid you drew under them.

> [!note]
> If a quantity changes when you rotate the axes, it is tied to the coordinates. A single component will change. A length will not.
