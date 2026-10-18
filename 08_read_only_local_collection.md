# 08 — Read-Only Local Source Collection

Run these commands from the intended local project directory. They inspect metadata and tracked paths; they do not edit source, commit, or push.

## PowerShell (Windows)
```powershell
# 1. Confirm current directory
Get-Location

# 2. Show branch and working-tree status
git status --short --branch

# 3. Show configured remotes
git remote -v

# 4. List tracked files
git ls-files

# 5. Show current revision
git rev-parse HEAD

# 6. List top-level files, including hidden entries where possible
Get-ChildItem -Force
```

## Interpretation
- If `git status` or `git rev-parse` says this is not a Git repository, confirm that the shell is in the actual project root.
- If `git remote -v` points to an empty or incorrect repository, do not push or change the remote during the audit. Report the mismatch first.
- If `git ls-files` returns no source paths, inspect whether the source is untracked or the wrong directory is open. Do not add or stage files as part of this audit.
- Preserve local changes; do not reset, clean, checkout, stash, or overwrite anything.

## Share safely
Preferred: provide the correct existing repository URL if it already contains the source.

Alternative: create a ZIP of the project source while excluding:
- `.git/`
- build output (`build/`, `dist/`, `out/`, generated caches)
- dependency caches
- `.env*`, signing keys, certificates, tokens, credentials
- production databases, user exports, private logs, and personal data

Inspect the ZIP file list before sharing. Keep a copy of your original project unchanged.
