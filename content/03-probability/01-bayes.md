---
title: Bayes’ rule
description: A 99% accurate test can still leave a positive result at one chance in six.
date: 2026-02-16
tags: [probability, bayes]
---

Bayes’ rule turns a likelihood into a probability for the hypothesis you actually care about. You start with a belief, you see evidence, and the rule says how far the belief moves.

## The formula

Let $A$ be a hypothesis and $B$ the evidence. $P(A)$ is the probability of the hypothesis before the evidence arrives. $P(B\mid A)$ is the probability of that evidence when the hypothesis is true.

\begin{equation}
P(A\mid B) = \frac{P(B\mid A)\,P(A)}{P(B)}.
\end{equation}

The numerator weights the likelihood by the prior. The denominator is the probability of the evidence under every hypothesis still on the table, so the result is a probability and not just a score.

When the only alternatives are $A$ and its complement $A^c$,

$$
P(B) = P(B\mid A)\,P(A) + P(B\mid A^c)\,P(A^c).
$$

## A screening test

Suppose a condition is present in $1\%$ of people, so $P(D) = 0.01$ and $P(D^c) = 0.99$. A test is positive for $99\%$ of people who have the condition, and for $5\%$ of people who do not:

$$
P(+\mid D) = 0.99, \qquad P(+\mid D^c) = 0.05.
$$

The chance of a positive result, from either group, is

$$
\begin{aligned}
P(+)
  &= 0.99 \cdot 0.01 + 0.05 \cdot 0.99 \\
  &= 0.0099 + 0.0495 \\
  &= 0.0594.
\end{aligned}
$$

Bayes’ rule then gives

$$
P(D\mid +) = \frac{0.0099}{0.0594} = \frac{1}{6}.
$$

About one positive result in six comes from a person who has the condition. The test meets the rates above. The prior is what pulls the answer down: five percent of a large healthy group is more people than ninety-nine percent of a small sick group.

> [!note]
> The base rate is doing the work. A rare condition is still uncommon after one positive test, unless the false-positive rate is tiny beside that base rate.

## In a few lines

```python
def bayes(prior, likelihood, false_positive):
    evidence = likelihood * prior + false_positive * (1 - prior)
    return likelihood * prior / evidence

print(bayes(0.01, 0.99, 0.05))
```

The printed float sits within ordinary rounding error of $1/6$. The useful experiment is to change the first argument. A prior of $0.2$, with the same test, is a different belief and a different posterior. The likelihood did not change. The starting point did.
