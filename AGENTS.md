# Agent notes

## Commits

When asked to commit and push, use a [Conventional Commit](https://www.conventionalcommits.org/) subject.

```
<type>: <imperative summary>
```

Types used here: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`.

- One line, imperative, no trailing period. Add a body only when the subject cannot carry the why.
- Stage the requested work, commit, then push the current branch.
- Do not amend, force-push, or change git config unless that was explicitly requested.

```
feat: show one tutorial series at a time
fix: keep display math aligned inside callouts
docs: add README
```
