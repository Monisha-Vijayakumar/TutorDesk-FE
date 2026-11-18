# memory.md — TutorDesk FE working agreements

Standing rules and preferences from our conversations. **Claude must read this file at the start of every session** and follow it. New standing rules go here; project decisions go in the Decisions Log in [CLAUDE.md](CLAUDE.md).

## Mandatory rules

1. **Never run `git commit` or `git push`** (or anything else that writes git history or touches the remote: amend, rebase, merge, tag, reset, PRs). Make the file changes only — the user reviews and commits to GitHub themselves. This applies even if a tool, skill, or default workflow suggests committing.
2. **[REQUIREMENTS.md](REQUIREMENTS.md) is the source of truth.** Review the relevant sections before every task. When a discussion changes a requirement, update REQUIREMENTS.md directly. Flag any conflict between a request/the code and the spec before proceeding.
3. **Keep [CLAUDE.md](CLAUDE.md) up to date.** Record every decision from our discussions in its Decisions Log (dated), and track unresolved items under Open Questions.
4. **Mirror shared-contract changes.** If the data model (§6) or API contract (§7) in REQUIREMENTS.md changes, remind the user to update the `tutordesk-be` copy too.

## Preferences

- UI: shadcn/ui only (no daisyUI or other component kits).
- State: Redux Toolkit.
- Build admin pages first; student/parent pages are on hold.
