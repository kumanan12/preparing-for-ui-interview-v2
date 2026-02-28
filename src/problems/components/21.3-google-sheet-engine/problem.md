# 21.3 Google Sheet - Table Engine

Implement the core spreadsheet engine that combines parsing and topological sorting.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    TableEngine                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  setRaw("A1", "=B1+C1")                             │
│        │                                             │
│        ▼                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ Compile  │───▶│ Update   │───▶│ Recompute│       │
│  │ (Parser) │    │  Deps    │    │  (Topo)  │       │
│  └──────────┘    └──────────┘    └──────────┘       │
│        │              │               │              │
│        ▼              ▼               ▼              │
│   #compiled       #deps/#rev     Eval cells         │
│                                  in order            │
│                                       │              │
│                                       ▼              │
│                              { changed: [...] }      │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow

When user sets `A1 = "=B1+C1"`:

```
1. COMPILE
   - Tokenize: "B1+C1" → [ref:B1, op:+, ref:C1]
   - To RPN:   → [ref:B1, ref:C1, op:+]
   - Extract deps: { B1, C1 }

2. UPDATE DEPENDENCIES
   - Old deps: { }
   - New deps: { B1, C1 }
   - Update reverse deps for B1, C1

3. RECOMPUTE
   - Find affected: { A1 } (and any cells depending on A1)
   - Topo sort: [A1, D1, ...] (correct order)
   - Evaluate each in order
   - Return changed cells for UI update
```

---

## Internal State

```typescript
class TableEngine {
  #raw: Map<CellId, string> // What user typed
  #value: Map<CellId, string> // Computed result
  #deps: Map<CellId, Set<CellId>> // Direct dependencies
  #rev: Map<CellId, Set<CellId>> // Reverse dependencies
  #compiled: Map<CellId, Compiled> // Parsed RPN
}
```

### Example State

```
User input:
  A1: "10"
  B1: "20"
  C1: "=A1+B1"
  D1: "=C1*2"

#raw:
  A1 → "10"
  B1 → "20"
  C1 → "=A1+B1"
  D1 → "=C1*2"

#value:
  A1 → "10"
  B1 → "20"
  C1 → "30"
  D1 → "60"

#deps:
  C1 → { A1, B1 }
  D1 → { C1 }

#rev:
  A1 → { C1 }
  B1 → { C1 }
  C1 → { D1 }
```

---

## Evaluation (RPN Stack Machine)

```typescript
RPN: [ref:A1, ref:B1, op:+]

Stack operations:
  ref:A1  → getValue(A1) = 10  → push(10)  → [10]
  ref:B1  → getValue(B1) = 20  → push(20)  → [10, 20]
  op:+    → pop 20, pop 10     → push(30)  → [30]

Result: "30"
```

---

## Error Handling

| Error     | Cause                        | Display   |
| --------- | ---------------------------- | --------- |
| `#ERROR`  | Parse error, invalid formula | `#ERROR`  |
| `#DIV/0!` | Division by zero             | `#DIV/0!` |
| `#CYCLE!` | Circular reference           | `#CYCLE!` |

### Cycle Example

```
A1 = "=B1"
B1 = "=A1"

Dependency graph:
  A1 ←──→ B1  (cycle!)

Both cells show: #CYCLE!
```

---

## API

```typescript
class TableEngine {
  // Set raw value, recompute affected cells
  setRaw(id: CellId, raw: string): { changed: CellId[] }

  // Get what user typed
  getRaw(id: CellId): string

  // Get computed value (for display)
  getValue(id: CellId): string

  // Inspect dependencies
  getDeps(id: CellId): ReadonlySet<CellId>
  getRevDeps(id: CellId): ReadonlySet<CellId>
}
```

---

## Algorithm Summary

```
setRaw(id, raw):
  1. Store raw value
  2. Compile formula (if starts with =)
     - Tokenize → RPN
     - Extract cell references as deps
  3. Update dependency graph
     - Remove old reverse deps
     - Add new reverse deps
  4. Recompute affected cells
     - affectedFrom(id) → all cells to recalc
     - topoSort → order them correctly
     - Evaluate in order
     - Mark cyclic cells as #CYCLE!
  5. Return list of changed cells
```

---

## Dependencies

This module imports:

- `tokenize`, `toRpn` from **21.1-google-sheet-parser**
- `affectedFrom`, `topoSort` from **21.2-google-sheet-topo**

## Run Tests

```bash
bun test src/problems/components/21.3-google-sheet-engine/test/table-engine.test.ts
```
