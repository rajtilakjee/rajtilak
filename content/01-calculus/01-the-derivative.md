---
title: The derivative is a limit
description: The slope that remains after the second point slides into the first.
date: 2026-01-12
tags: [limits, derivatives]
---

A derivative is the slope of a curve at a single point. The way to make that precise is to start with two points, where slope is easy, and then let the second point approach the first.

## The slope of a secant

Take a function $f$ and a point $a$ on the $x$-axis. For a step $h$ with $0 < |h|$, the line through $\bigl(a, f(a)\bigr)$ and $\bigl(a+h, f(a+h)\bigr)$ has slope

$$
\frac{f(a+h) - f(a)}{h}.
$$

That quotient is an average rate of change across an interval of width $|h|$.

## The limit

The derivative at $a$ is what happens to the quotient as the interval shrinks:

$$
f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h},
$$

when the limit exists. The two one-sided limits have to agree, and the result has to be a finite number.

> [!definition] Differentiable
> $f$ is differentiable at $a$ when $f'(a)$ exists.

## A computation

> [!example] The square function
> For $f(x) = x^2$,
>
> $$
> \begin{aligned}
> f'(a)
>   &= \lim_{h \to 0} \frac{(a+h)^2 - a^2}{h} \\
>   &= \lim_{h \to 0} \frac{2ah + h^2}{h} \\
>   &= \lim_{h \to 0} (2a + h) \\
>   &= 2a.
> \end{aligned}
> $$

The algebra is the whole argument. Once $h \neq 0$, the factor of $h$ in the denominator cancels, and the limit sets the remaining $h$ to zero.

## Where it fails

> [!warning]
> $f(x) = |x|$ is not differentiable at $0$. From the right the quotient is $1$. From the left it is $-1$. The two sides never meet, so the limit does not exist.

Everywhere else, $|x|$ is as smooth as a straight line. Differentiability is local: it only looks at a neighborhood of one point.

## A numerical check

The centered difference

$$
\frac{f(a+h) - f(a-h)}{2h}
$$

estimates the same slope. For a quadratic it is exact for every $h \neq 0$, because the error depends on a third derivative and $x^2$ has none. At $a = 3$ the value is $2 \cdot 3 = 6$.

```python
def derivative(f, a, h=1e-6):
    return (f(a + h) - f(a - h)) / (2 * h)

print(derivative(lambda x: x * x, 3))
```

The formula and the function call are answering one question: how fast $x^2$ is climbing as it passes through $3$.
