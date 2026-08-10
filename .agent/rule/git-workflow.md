# Nexhire Git Workflow Rules

These rules are mandatory for every Git-related action in the Nexhire frontend project.

inclusion: always

---

## 1. Protected Branches

- Never work directly on `main`.
- Never commit directly to `main`.
- Never push directly to `main`.
- Treat `main` as the protected production branch.
- The primary working branch is `develop`.
- Feature, fix, and refactor branches must start from `develop` unless the user explicitly says otherwise.

Required check before editing code:

```bash
git branch --show-current
git status --short
```

If the current branch is `main`, stop and switch to `develop` before editing.

---

## 2. Branch Strategy

Default branch usage:

```text
main      protected production branch
develop   primary integration and daily working branch
feature/* feature branches from develop
fix/*     bug fix branches from develop
chore/*   maintenance branches from develop
docs/*    documentation-only branches from develop
```

Allowed examples:

```text
develop
feature/login-page
feature/i18n-setup
fix/auth-refresh-token
chore/update-rules
docs/project-structure
```

Avoid:

```text
main
master
random-test
new-branch
```

---

## 3. Before Starting Work

Before any code change:

- Check the current branch.
- Check the working tree.
- If on `main`, switch to `develop`.
- If `develop` does not exist and the user has approved using it, create it.
- Do not overwrite or revert user changes.
- If unrelated changes already exist, leave them alone.

Recommended commands:

```bash
git branch --show-current
git status --short
git switch develop
```

If a task needs isolation:

```bash
git switch develop
git switch -c feature/<task-name>
```

---

## 4. Commit Rules

- Commit when the user asks to commit, clearly asks to save changes in Git, or when an approved large feature has been completed and verified.
- For approved large features, create the commit automatically after required checks pass unless the user explicitly says not to commit.
- Stage only files related to the task.
- Do not stage `node_modules`, `dist`, local logs, local env files, or unrelated changes.
- Do not include generated build output unless the user explicitly asks for it.
- Run checks before committing code changes:

```bash
npm run build
npm run lint
```

If checks fail:

- Do not commit without telling the user.
- Explain the failure.
- Fix the issue if it is within the task scope.

---

## 5. Commit Message Format

Use concise Conventional Commit style:

```text
type(scope): summary
```

Allowed types:

```text
feat
fix
chore
docs
refactor
style
test
build
ci
perf
```

Examples:

```text
feat(auth): add login page
feat(i18n): add locale structure
fix(api): handle refresh token retry
docs(rules): add git workflow rules
chore(theme): add initial brand tokens
```

Rules:

- Use lowercase type and scope.
- Keep summary short and imperative.
- Do not end the summary with a period.
- Mention important test results in the final response after committing.

---

## 6. Push Rules

- Push only when the user asks to push.
- Never push directly to `main`.
- Prefer pushing `develop` or a feature branch.
- Before pushing, check the branch and status.

Required checks:

```bash
git branch --show-current
git status --short
```

Allowed:

```bash
git push origin develop
git push origin feature/login-page
```

Forbidden:

```bash
git push origin main
git push --force origin main
```

Force push is forbidden unless the user explicitly requests it and the branch is not `main`.

---

## 7. Pull Request Rules

- Pull requests should target `develop` by default.
- Pull requests into `main` require explicit user instruction.
- PR title should follow the same style as commit messages.
- PR description should mention:
  - What changed.
  - Why it changed.
  - Build/lint/test results.
  - Any risks or follow-up work.

---

## 8. Safety Rules

- Never run destructive Git commands unless the user explicitly asks.
- Do not use `git reset --hard`.
- Do not use `git checkout -- <file>` to discard user changes unless the user explicitly asks.
- Do not delete branches unless the user explicitly asks.
- Do not rewrite history on shared branches.
- Keep user work intact.
