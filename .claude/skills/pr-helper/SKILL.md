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

### Step 4 — Review PR

After the PR is created, **ask the user** if they want a code review:
> "Would you like me to review the PR as well?"

Only proceed if the user confirms. Then:

1. Run `git diff origin/<base-branch>...HEAD` to get the full diff
2. Review the changes across these dimensions:
   - **Correctness** — logic errors, edge cases, off-by-one, null/undefined risks
   - **Security** — injection, exposed secrets, insecure defaults, OWASP top 10
   - **Code quality** — duplication, unnecessary complexity, dead code
   - **Consistency** — naming conventions, style, patterns used elsewhere in the codebase
   - **Tests** — missing test coverage for new logic or critical paths
3. Output findings using the Review Output Format below
4. If no issues are found, state that the PR looks good to merge
5. Ask the user: **"Would you like me to post this review as inline comments on GitHub?"**
   - If yes: get the latest commit SHA with `git rev-parse HEAD`, then post inline comments via:
     ```bash
     gh api repos/<owner>/<repo>/pulls/<pr-number>/reviews \
       --method POST \
       --input review.json
     ```
     Where `review.json` contains `commit_id`, `body`, `event: "COMMENT"`, and `comments[]` with `path`, `line`, `side: "RIGHT"`, and `body` for each finding.
   - Note: GitHub does not allow "request changes" on your own PRs — use `"event": "COMMENT"` instead.
   - If no: leave the review as a text response only.

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

## Review Output Format

```md
### PR Review

**[filename:line]** — [problem] — [suggested fix]

**[filename:line]** — [problem] — [suggested fix]

> Overall: [one-line verdict — approve / request changes / needs discussion]
```

- One comment per issue, one line each: location, problem, fix
- Group by severity: Critical > Warning > Suggestion
- Skip nitpicks unless they affect correctness or security

---

## Notes

- `gh` CLI must be installed and authenticated. If not found, warn the user and provide the PR URL for manual creation with the generated message.
- Always confirm branch name with user before creating — never assume.
- If user provides a branch name directly, skip the suggestion step and use theirs.
- Step 4 (Review) always asks first — never run without user confirmation.
