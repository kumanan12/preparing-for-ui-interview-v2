# Portfolio Visualizer — Logic

**Difficulty**: 🚀 Extreme · **Time**: 45–60 min

## What You'll Learn

- Tree data normalization (nested → flat Map with parent references)
- Bidirectional value propagation (child updates bubble to parents)
- Validation constraints on tree nodes
- Event delegation with `onChange` on a container
- Immutable state updates with Map

## Goal

Add the **logic layer** to the Portfolio Visualizer from Problem 53. The UI (PortfolioNode component) is already provided. You need to implement: tree normalization, state management, input validation, and parent value bubbling.

```
User edits AAPL: $3,000 → $4,000

  Before:                          After:
  Portfolio: $10,000 (100%)        Portfolio: $11,000 (100%)
    Stocks:   $6,000 (60%)          Stocks:   $7,000 (63.64%)
      AAPL:   $3,000 (30%)            AAPL:   $4,000 (36.36%)  ← edited
      GOOGL:  $2,000 (20%)            GOOGL:  $2,000 (18.18%)
      MSFT:   $1,000 (10%)            MSFT:   $1,000  (9.09%)
    Bonds:    $4,000 (40%)          Bonds:    $4,000 (36.36%)
```

## Requirements

### Core Functionality

1. **Normalize** the nested tree into a flat `Map<id, node>` with `parentID` references for O(1) lookups.
2. **State**: `useState<Map>` initialized from the normalized data.
3. **onChange handler** (event delegation on container):
   - Read `data-node-id` from the input target
   - **Validate**: if node has children, reject if new value < sum of children values
   - Update node value in a new Map
   - **Bubble up**: walk the parentID chain, recalculating each parent as sum of its children
4. Percentages update automatically since PortfolioNode reads from the store.

### Normalization

Convert the nested tree into a flat `Map<id, node>` with `parentID` references:

```ts
type TPortfolioStateNode = {
  id: string
  name: string
  value: number
  parentID: string | null
  children?: TPortfolioStateNode[]
}

// Map: "aapl" → { id: "aapl", value: 3000, parentID: "stocks", ... }
```

## API Design

```ts
type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
  data: TPortfolioNode // root node
}
```

## Walkthrough

### Step 1 — Normalize with `prepare()`

Recursively walk the tree, creating a flat `Map<id, node>` and setting `parentID` on each node. Memoize with `useMemo` on `[data]`. Returns `[rootNode, store Map]`.

### Step 2 — State

`useState<Map>` initialized from the prepare result. Get the root node from the store by its id.

### Step 3 — Handle value changes

Attach a single `onChange` handler on the container div (event delegation). On change:

1. Read `target.dataset.nodeId` and parse the new value
2. **Validate**: if node has children, ensure new value ≥ sum of children (reject otherwise)
3. Create a new Map, update the node's value
4. **Bubble up**: walk the parent chain, recalculating each parent as sum of its children

```ts
let current = node
while (current.parentID) {
  const parent = newStore.get(current.parentID)
  const childSum = parent.children.reduce((sum, ch) => sum + newStore.get(ch.id).value, 0)
  newStore.set(current.parentID, { ...parent, value: childSum })
  current = parent
}
```

### Step 4 — Render

Container div with `onChange={onNodeUpdate}`, render the root PortfolioNode (provided from Problem 53).

<details>
<summary>💡 Hint — Why a flat Map instead of nested state?</summary>

With nested state, updating a deeply nested node requires cloning every ancestor. A flat Map gives O(1) access to any node by ID, and the parent chain walk is simple with `parentID` references.

</details>

## Edge Cases

| Scenario                           | Expected                                     |
| ---------------------------------- | -------------------------------------------- |
| Edit leaf → parents update         | Sum bubbles up to root                       |
| Edit parent to less than child sum | Rejected (value reverts)                     |
| Root has no children               | Just a single editable node                  |
| All values = 0                     | Percentages show 0.00% (no division by zero) |
| Deeply nested tree                 | All levels render and update correctly       |

## Verification

1. Edit a leaf value → parent totals and all percentages update.
2. Try to set parent below child sum → value rejected.
3. Percentages always sum to ~100% at each level.
4. Multiple rapid edits work correctly.
