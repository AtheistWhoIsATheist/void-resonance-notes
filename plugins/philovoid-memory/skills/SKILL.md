---
name: philovoid-memory
description: Use when working in the Philovoid / Void Resonance Notes repository and the task could benefit from persistent project memory, remembered user preferences, repository decisions, or memory consolidation across Codex/ChatGPT sessions.
---

# Philovoid Memory

This plugin provides persistent, reviewable memory for Philovoid work. It is intentionally file-based and dependency-free so it can run before the web app dependencies are installed.

## Store locations

- Active memory store: `.philovoid/memory.json`
- Reviewable dream outputs: `.philovoid/dreams/*.json`
- Example store schema: `plugins/philovoid-memory/data/memory.example.json`
- Manager script: `plugins/philovoid-memory/scripts/philovoid_memory.py`

Do not commit `.philovoid/memory.json` or `.philovoid/dreams/*.json` unless the user explicitly asks to version a memory snapshot. These files can contain user/project-specific working memory.

## Start-of-task workflow

When this skill applies:

1. If `.philovoid/memory.json` exists, search or list it before planning changes.
2. If it does not exist, continue normally; optionally initialize it only when the user asks to remember something.
3. Treat memory entries as context, not authority. Repository files and direct user/developer instructions override memory.
4. Cite repository files in final responses as usual; do not cite private memory unless the user asks about memory contents.

Useful commands:

```bash
python3 plugins/philovoid-memory/scripts/philovoid_memory.py list
python3 plugins/philovoid-memory/scripts/philovoid_memory.py search "testing preference"
```

## Remembering durable information

Add a memory entry only when the user explicitly asks you to remember something, or when a durable project decision/preference is clearly established during the task.

```bash
python3 plugins/philovoid-memory/scripts/philovoid_memory.py add \
  --kind preference \
  --title "Testing preference" \
  --content "Prefer focused checks before attempting full builds in dependency-constrained environments." \
  --tags codex,testing \
  --source "user-request"
```

Kinds:

- `fact`: durable project or repo fact
- `preference`: user/team preference
- `decision`: accepted implementation decision
- `task`: durable follow-up
- `insight`: recurring research or design insight
- `constraint`: persistent limitation or invariant

Statuses:

- `active`
- `stale`
- `superseded`
- `archived`

## Dream/consolidation workflow

Use a dream when the memory store may contain duplicates, contradictions, or stale entries. A dream never mutates the active store.

```bash
python3 plugins/philovoid-memory/scripts/philovoid_memory.py dream \
  --instructions "Merge duplicates, keep newest specifics, and flag contradictions for review."
```

Review `.philovoid/dreams/latest.json`. Promote only after review:

```bash
python3 plugins/philovoid-memory/scripts/philovoid_memory.py promote .philovoid/dreams/latest.json
```

Promotion creates a timestamped backup of the active store by default.

## ChatGPT/Codex handoff prompt

When a model-assisted semantic review is needed, pass the active store and any relevant transcript excerpts to ChatGPT/Codex with this frame:

> Curate this Philovoid memory store without mutating the original. Merge duplicates, keep the newest specific value, mark stale or contradicted claims instead of silently deleting them, surface durable preferences/decisions/constraints, and return a replacement JSON store plus a review checklist.

Keep secrets out of exported memory prompts.
