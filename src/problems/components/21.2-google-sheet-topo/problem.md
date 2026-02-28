# 21.2 Google Sheet - Topological Sorting

Implement topological sorting for managing spreadsheet cell dependencies.

## The Problem

In a spreadsheet, cells can reference other cells:

```
A1 = 10
B1 = 20
C1 = A1 + B1    (depends on A1, B1)
D1 = C1 * 2     (depends on C1)
```

When A1 changes, we need to recalculate C1 _before_ D1.

### Dependency Graph

```
    A1 ───┐
          ├──→ C1 ───→ D1
    B1 ───┘
```

**Topological order**: A1, B1, C1, D1 (or B1, A1, C1, D1)

---

## Algorithm: Kahn's Algorithm

**Kahn's algorithm** finds topological order using in-degrees:

```
1. Calculate in-degree for each node
   (in-degree = number of dependencies)

2. Start with nodes that have in-degree = 0

3. Process each node:
   - Add to result
   - Decrease in-degree of dependents
   - If dependent's in-degree becomes 0, add to queue

4. If not all nodes processed → cycle detected!
```

### Example

```
Graph: B depends on A, C depends on B, D depends on B

    A ──→ B ──→ C
          │
          └──→ D

Step 1: Calculate in-degrees
        A: 0, B: 1, C: 1, D: 1

Step 2: Queue = [A] (in-degree 0)

Step 3: Process A
        Result: [A]
        B's in-degree: 1 → 0, add to queue
        Queue = [B]

Step 4: Process B
        Result: [A, B]
        C's in-degree: 1 → 0, add to queue
        D's in-degree: 1 → 0, add to queue
        Queue = [C, D]

Step 5: Process C, D
        Result: [A, B, C, D]

Done! Order: A → B → C → D
```

---

## Cycle Detection

Cycles make topological sort impossible:

```
A ──→ B ──→ C
^           │
└───────────┘

A depends on C, C depends on B, B depends on A
= Cycle! No valid order exists.
```

Kahn's algorithm detects cycles when not all nodes are processed:

```
In-degrees: A: 1, B: 1, C: 1
Queue starts empty → 0 nodes processed
All 3 nodes are cyclic!
```

---

## Part 1: Find Affected Nodes

When a cell changes, find all cells that need recalculation:

```typescript
affectedFrom('A1', getRevDeps)

// If A1 → B1 → C1 (B1 depends on A1, C1 depends on B1)
// Returns: Set { 'A1', 'B1', 'C1' }
```

### Algorithm

```
1. Start with changed cell
2. BFS/DFS through reverse dependencies
3. Collect all visited nodes
```

---

## Part 2: Topological Sort

Order affected cells so dependencies come first:

```typescript
topoSort(affected, getDeps, getRevDeps)

// Returns:
// {
//   order: ['A1', 'B1', 'C1'],  // Valid order
//   cyclic: Set {}              // Empty if no cycles
// }
```

---

## Data Structures

Two maps track dependencies:

```
deps:    cell → Set of cells it depends on
revDeps: cell → Set of cells that depend on it

Example: C1 = A1 + B1

deps.get('C1')    → Set { 'A1', 'B1' }
revDeps.get('A1') → Set { 'C1' }
revDeps.get('B1') → Set { 'C1' }
```

---

## API

```typescript
function affectedFrom<T>(start: T, getRevDeps: (id: T) => Iterable<T>): Set<T>

function topoSort<T>(
  affected: Set<T>,
  getDeps: (id: T) => Iterable<T>,
  getRevDeps: (id: T) => Iterable<T>,
): { order: T[]; cyclic: Set<T> }
```

---

## Complexity

| Operation    | Time     | Space |
| ------------ | -------- | ----- |
| affectedFrom | O(V + E) | O(V)  |
| topoSort     | O(V + E) | O(V)  |

Where V = nodes, E = edges in the dependency graph.

## Run Tests

```bash
bun test src/problems/components/21.2-google-sheet-topo/test/topo.test.ts
```
