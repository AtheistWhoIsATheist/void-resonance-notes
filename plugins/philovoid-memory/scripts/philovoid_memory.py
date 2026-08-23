#!/usr/bin/env python3
"""Repo-local memory manager for the Philovoid Codex plugin.

The script intentionally uses only the Python standard library so Codex can use it
before project dependencies are installed.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import textwrap
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
DEFAULT_STORE = Path(".philovoid/memory.json")
DEFAULT_DREAMS_DIR = Path(".philovoid/dreams")
VALID_KINDS = ("fact", "preference", "decision", "task", "insight", "constraint")
VALID_STATUS = ("active", "stale", "superseded", "archived")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize(value: str) -> str:
    return " ".join(value.lower().strip().split())


def split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def default_store() -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "updatedAt": utc_now(),
        "entries": [],
    }


def load_store(path: Path) -> dict[str, Any]:
    if not path.exists():
        return default_store()
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    data.setdefault("schemaVersion", SCHEMA_VERSION)
    data.setdefault("updatedAt", utc_now())
    data.setdefault("entries", [])
    return data


def save_store(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data["updatedAt"] = utc_now()
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    tmp_path.replace(path)


def entry_signature(entry: dict[str, Any]) -> str:
    return f"{entry.get('kind', '')}::{normalize(entry.get('title', ''))}::{normalize(entry.get('content', ''))}"


def make_entry(args: argparse.Namespace) -> dict[str, Any]:
    now = utc_now()
    return {
        "id": args.id or f"mem_{uuid.uuid4().hex[:12]}",
        "kind": args.kind,
        "title": args.title.strip(),
        "content": args.content.strip(),
        "tags": split_csv(args.tags),
        "source": args.source or "manual",
        "confidence": args.confidence,
        "status": args.status,
        "createdAt": now,
        "updatedAt": now,
        "supersedes": split_csv(args.supersedes),
    }


def print_entries(entries: list[dict[str, Any]], *, as_json: bool = False) -> None:
    if as_json:
        print(json.dumps(entries, indent=2, ensure_ascii=False))
        return
    if not entries:
        print("No memory entries found.")
        return
    for entry in entries:
        tags = ", ".join(entry.get("tags", [])) or "untagged"
        print(f"- {entry['id']} [{entry.get('kind')}:{entry.get('status', 'active')}] {entry.get('title')}")
        print(f"  {entry.get('content')}")
        print(f"  tags={tags} confidence={entry.get('confidence', 'unknown')} updated={entry.get('updatedAt')}")


def cmd_init(args: argparse.Namespace) -> int:
    path = args.store
    if path.exists() and not args.force:
        print(f"Memory store already exists: {path}", file=sys.stderr)
        return 1
    save_store(path, default_store())
    print(f"Initialized Philovoid memory store: {path}")
    return 0


def cmd_add(args: argparse.Namespace) -> int:
    store = load_store(args.store)
    entry = make_entry(args)
    signatures = {entry_signature(existing): existing for existing in store["entries"]}
    signature = entry_signature(entry)
    if signature in signatures and not args.allow_duplicate:
        existing = signatures[signature]
        print(f"Duplicate memory exists: {existing['id']}", file=sys.stderr)
        return 2
    store["entries"].append(entry)
    save_store(args.store, store)
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    store = load_store(args.store)
    entries = store["entries"]
    if args.status:
        entries = [entry for entry in entries if entry.get("status") == args.status]
    if args.kind:
        entries = [entry for entry in entries if entry.get("kind") == args.kind]
    print_entries(entries, as_json=args.json)
    return 0


def cmd_search(args: argparse.Namespace) -> int:
    store = load_store(args.store)
    query = normalize(args.query)
    query_terms = query.split()
    matches: list[dict[str, Any]] = []
    for entry in store["entries"]:
        haystack = normalize(" ".join([
            entry.get("title", ""),
            entry.get("content", ""),
            " ".join(entry.get("tags", [])),
            entry.get("kind", ""),
            entry.get("status", ""),
        ]))
        if all(term in haystack for term in query_terms):
            matches.append(entry)
    print_entries(matches, as_json=args.json)
    return 0


def consolidated_entries(entries: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for entry in entries:
        groups.setdefault(entry_signature(entry), []).append(entry)

    curated: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    for signature, group in groups.items():
        newest = sorted(group, key=lambda item: item.get("updatedAt", ""), reverse=True)[0]
        curated.append(newest)
        if len(group) > 1:
            findings.append({
                "type": "duplicate",
                "message": f"Merged {len(group)} duplicate entries into {newest['id']}",
                "entryIds": [entry["id"] for entry in group],
            })

    active_titles: dict[str, set[str]] = {}
    for entry in curated:
        if entry.get("status") != "active":
            continue
        active_titles.setdefault(normalize(entry.get("title", "")), set()).add(normalize(entry.get("content", "")))
    for title, contents in active_titles.items():
        if title and len(contents) > 1:
            findings.append({
                "type": "possible_contradiction",
                "message": f"Active title cluster has {len(contents)} variants: {title}",
            })

    return sorted(curated, key=lambda item: item.get("updatedAt", ""), reverse=True), findings


def cmd_dream(args: argparse.Namespace) -> int:
    store = load_store(args.store)
    curated, findings = consolidated_entries(store["entries"])
    dream = {
        "schemaVersion": SCHEMA_VERSION,
        "type": "philovoid-memory-dream",
        "createdAt": utc_now(),
        "instructions": args.instructions,
        "inputStore": str(args.store),
        "inputCount": len(store["entries"]),
        "outputCount": len(curated),
        "findings": findings,
        "entries": curated,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(dream, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(f"Created reviewable dream output: {args.output}")
    print(f"input={dream['inputCount']} output={dream['outputCount']} findings={len(findings)}")
    return 0


def cmd_promote(args: argparse.Namespace) -> int:
    with args.dream.open("r", encoding="utf-8") as handle:
        dream = json.load(handle)
    if dream.get("type") != "philovoid-memory-dream":
        print(f"Not a Philovoid memory dream: {args.dream}", file=sys.stderr)
        return 1
    if args.store.exists() and not args.no_backup:
        backup = args.store.with_name(f"{args.store.name}.{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}.bak")
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(args.store, backup)
        print(f"Backed up active memory store: {backup}")
    save_store(args.store, {
        "schemaVersion": SCHEMA_VERSION,
        "updatedAt": utc_now(),
        "entries": dream.get("entries", []),
    })
    print(f"Promoted dream output into active memory store: {args.store}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Manage persistent Philovoid memory for Codex/ChatGPT plugin sessions.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent(
            """
            Examples:
              philovoid_memory.py init
              philovoid_memory.py add --kind preference --title "Testing" --content "Prefer focused checks before full builds." --tags codex,testing
              philovoid_memory.py search testing
              philovoid_memory.py dream --instructions "Merge duplicates; preserve contradictions as findings."
              philovoid_memory.py promote .philovoid/dreams/latest.json
            """
        ),
    )
    parser.add_argument("--store", type=Path, default=DEFAULT_STORE, help="Path to the active memory JSON store.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init = subparsers.add_parser("init", help="Create an empty memory store.")
    init.add_argument("--force", action="store_true", help="Replace an existing store.")
    init.set_defaults(func=cmd_init)

    add = subparsers.add_parser("add", help="Add a memory entry.")
    add.add_argument("--id", help="Optional stable entry id.")
    add.add_argument("--kind", choices=VALID_KINDS, required=True)
    add.add_argument("--title", required=True)
    add.add_argument("--content", required=True)
    add.add_argument("--tags", help="Comma-separated tags.")
    add.add_argument("--source", help="Source session, file, issue, or user request.")
    add.add_argument("--confidence", type=float, default=0.8)
    add.add_argument("--status", choices=VALID_STATUS, default="active")
    add.add_argument("--supersedes", help="Comma-separated memory ids this entry supersedes.")
    add.add_argument("--allow-duplicate", action="store_true")
    add.set_defaults(func=cmd_add)

    list_cmd = subparsers.add_parser("list", help="List memory entries.")
    list_cmd.add_argument("--kind", choices=VALID_KINDS)
    list_cmd.add_argument("--status", choices=VALID_STATUS)
    list_cmd.add_argument("--json", action="store_true")
    list_cmd.set_defaults(func=cmd_list)

    search = subparsers.add_parser("search", help="Search memory entries.")
    search.add_argument("query")
    search.add_argument("--json", action="store_true")
    search.set_defaults(func=cmd_search)

    dream = subparsers.add_parser("dream", help="Write a reviewable consolidated memory output without changing the active store.")
    dream.add_argument("--instructions", default="Merge duplicates, keep newest facts, and flag contradictions for review.")
    dream.add_argument("--output", type=Path, default=DEFAULT_DREAMS_DIR / "latest.json")
    dream.set_defaults(func=cmd_dream)

    promote = subparsers.add_parser("promote", help="Promote a reviewed dream output into the active memory store.")
    promote.add_argument("dream", type=Path)
    promote.add_argument("--no-backup", action="store_true")
    promote.set_defaults(func=cmd_promote)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
