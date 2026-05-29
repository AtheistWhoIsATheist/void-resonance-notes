# Philovoid Memory Plugin

`philovoid-memory` is a repo-local Codex plugin for persistent Philovoid project memory. It replaces the previous app-only "memory dreams" approach with a plugin that agents can use across Codex/ChatGPT sessions.

## What it provides

- A Codex skill (`skills/SKILL.md`) that tells agents when and how to use Philovoid memory.
- A dependency-free memory manager (`scripts/philovoid_memory.py`) for adding, listing, searching, dreaming, and promoting memory.
- A review-first dream workflow: dream outputs are written separately and do not mutate the active store until promotion.
- An example JSON schema in `data/memory.example.json`.

## Quick commands

```bash
# Initialize a private active memory store
python3 plugins/philovoid-memory/scripts/philovoid_memory.py init

# Add durable memory
python3 plugins/philovoid-memory/scripts/philovoid_memory.py add \
  --kind preference \
  --title "Preferred checks" \
  --content "Run focused validation before full builds when dependencies are unavailable." \
  --tags codex,testing

# Recall memory
python3 plugins/philovoid-memory/scripts/philovoid_memory.py search "preferred checks"

# Create a reviewable consolidation output
python3 plugins/philovoid-memory/scripts/philovoid_memory.py dream

# Promote reviewed dream output
python3 plugins/philovoid-memory/scripts/philovoid_memory.py promote .philovoid/dreams/latest.json
```

## Privacy and versioning

The plugin is versioned; active memory is not. Keep `.philovoid/memory.json` and `.philovoid/dreams/*.json` out of commits unless a human explicitly requests a snapshot.
