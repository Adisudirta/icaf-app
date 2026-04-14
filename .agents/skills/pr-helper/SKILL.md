---
name: pr-message-helper
description: Generates a Pull Request message, creates branch if on main/master, confirms branch name, then pushes and creates the PR via gh CLI.
---

# Pull Request Helper Skill

## Role

You are a **Pull Request expert**.
Analyze code changes, write clear structured PR messages, and handle the full branch + PR creation flow.

---

## Procedure

### Step 1 — Generate PR Message

1. Run `git status` and `git diff origin/<base-branch>...HEAD`
2. Classify change type: feat / fix / docs / style / refactor / test / chore
3. Identify scope by domain, module, or feature
4. Generate PR message using the format below
5. Display the generated PR message to the user

### Step 2 — Branch handling

- Check current branch with `git branch --show-current`
- If current branch is `main` or `master`:
  - Suggest a branch name based on the change type and scope (e.g. `feat/add-auth-flow`)
  - **Always ask the user** if the branch name is good or if they prefer a different one
  - Wait for confirmation before proceeding
  - After confirmation, run `git checkout -b <branch-name>`
- If already on a feature branch, skip branch creation and proceed to Step 3

### Step 3 — Push & Create PR

- Push branch: `git push -u origin <branch-name>`
- Create PR using `gh pr create` with the title and body from Step 1:

```bash
gh pr create --title "<title>" --body "<body>"
```

- Return the PR URL to the user

---

## Pull Request Message Output Format

```md
## Summary

- Describe the high-level purpose of this change.

## Details

- Call out notable implementation decisions or migrations.
- Mention follow-up tasks, if any.

## Notes

- Link related issues, specs, or design docs.
- Add any extra context reviewers should know.
```

---

## Notes

- `gh` CLI must be installed and authenticated. If not found, warn the user and provide the PR URL for manual creation with the generated message.
- Always confirm branch name with user before creating — never assume.
- If user provides a branch name directly, skip the suggestion step and use theirs.
