---
title: The chain rule
description: A composite derivative is the product of two rates.
date: 2026-01-19
tags: [derivatives, chain-rule]
---

The [derivative](/calculus/01-the-derivative) is the rate of a single function. Most functions you actually differentiate are built by feeding one function into another. The chain rule multiplies those two rates.

## Statement

> [!theorem] Chain rule
> If $g$ is differentiable at $x$ and $f$ is differentiable at $g(x)$, then
>
> $$(f \circ g)'(x) = f'(g(x))\, g'(x).$$

With $y = f(u)$ and $u = g(x)$, the same statement in Leibniz notation is

$$
\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}.
$$

## Why it is a product

A small step $\Delta x$ changes the inner function by about $g'(x)\,\Delta x$. The outer function then responds to that change in its input. If its input moves by $\Delta u$, the output moves by about $f'(u)\,\Delta u$.

Substitute the first estimate into the second:

$$
\Delta y \approx f'(u) \cdot g'(x)\,\Delta x.
$$

Divide by $\Delta x$ and let the step shrink. Each approximation becomes a derivative, and the product remains.

Near $x$, the graph of $g$ looks like a line of slope $g'(x)$. Near $u = g(x)$, the graph of $f$ looks like a line of slope $f'(u)$. A line fed into a line is still a line, and the slopes of lines multiply.

## A worked example

Differentiate $\sin(x^2)$. The outer function is $\sin u$, with derivative $\cos u$. The inner function is $x^2$, with derivative $2x$.

$$
\begin{aligned}
\frac{d}{dx}\sin(x^2)
  &= \cos(x^2) \cdot 2x \\
  &= 2x\cos(x^2).
\end{aligned}
$$

> [!warning]
> The inside of the cosine stays $x^2$. Differentiating the outer function multiplies by the inner derivative. It does not replace the inner function with that derivative.

## Where a factor gets lost

For $(x^2 + 1)^3$, the outer power contributes a factor of $3(x^2 + 1)^2$, and the inside contributes another factor of $2x$.

$$
\frac{d}{dx}(x^2 + 1)^3 = 6x(x^2 + 1)^2.
$$

Drop the $2x$, and what remains is the derivative with respect to $x^2 + 1$. That is a different question.
