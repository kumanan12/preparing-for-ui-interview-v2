# Portfolio Visualizer

**Difficulty**: `hard`

## Goal

Implement an interactive Portfolio Visualizer component that displays investment allocations as a hierarchical tree structure. Users can edit values at any node level, with changes propagating upward to update all parent totals.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Portfolio                                          $300,000    │
│  ├── Stocks                            $100,000 (33.3%)         │
│  │   ├── AAPL                          [$30,000] (10.0%)        │
│  │   ├── GOOGL                         [$25,000] (8.3%)         │
│  │   ├── MSFT                          [$20,000] (6.7%)         │
│  │   └── AMZN                          [$25,000] (8.3%)         │
│  │                                                              │
│  ├── Commodities                       $100,000 (33.3%)         │
│  │   ├── Metals                        $50,000 (16.7%)          │
│  │   │   ├── Gold                      [$30,000] (10.0%)        │
│  │   │   └── Silver                    [$20,000] (6.7%)         │
│  │   ├── Oil                           [$25,000] (8.3%)         │
│  │   └── Gas                           [$25,000] (8.3%)         │
│  │                                                              │
│  └── Treasuries                        $100,000 (33.3%)         │
│      ├── USA                           $60,000 (20.0%)          │
│      │   ├── 20 Year Bonds             [$35,000] (11.7%)        │
│      │   └── 10 Year Bonds             [$25,000] (8.3%)         │
│      └── UK                            $40,000 (13.3%)          │
│          ├── 20 Year Gilts             [$25,000] (8.3%)         │
│          └── 10 Year Gilts             [$15,000] (5.0%)         │
└─────────────────────────────────────────────────────────────────┘

Legend: [$value] = editable input field, (%) = percentage of total portfolio
```

## Requirements

### Core Functionality

1. **Tree Visualization**: Display portfolio as a collapsible tree with indentation.
2. **Value Display**: Show allocation amount and percentage of root for each node.
3. **Editable Leaf Nodes**: Allow inline editing of leaf node values via input fields.
4. **Bottom-Up Propagation**: When a child value changes, all parent nodes automatically recalculate their totals.

### Update Behavior

When any value is updated, all ancestor totals are recalculated by summing their children:

```
User Action: Edit "Gold" from $30,000 → $50,000

Before:
  Portfolio: $300,000
  └── Commodities: $100,000
      └── Metals: $50,000
          ├── Gold: $30,000
          └── Silver: $20,000

After:
  Portfolio: $320,000  ← Updated (+$20,000)
  └── Commodities: $120,000  ← Updated (+$20,000)
      └── Metals: $70,000  ← Updated (+$20,000)
          ├── Gold: $50,000  ← Changed
          └── Silver: $20,000
```

### Display Rules

1. **Percentages**: Each node shows its value as a percentage of the root total.
2. **Parent Values**: Parent node values are computed (sum of children), not directly editable.
3. **Leaf Values**: Only leaf nodes have editable input fields.

## API Design

### Data Structure

```typescript
type TPortfolioNode = {
  id: string
  name: string
  value: number // For leaf: user-entered, for parent: computed sum
  children?: TPortfolioNode[]
}

type TPortfolioProps = {
  data: TPortfolioNode
  onChange: (updatedData: TPortfolioNode) => void
}
```

### Helper Functions

```typescript
// Recursively recalculate parent values from children
function recalculateTotals(node: TPortfolioNode): TPortfolioNode

// Update a specific node by id and propagate changes
function updateNodeValue(root: TPortfolioNode, nodeId: string, newValue: number): TPortfolioNode
```

## Solution Approach

1. **Recursive Rendering**: Build tree component that recursively renders children with proper indentation.
2. **Bottom-Up Recalculation**: After any leaf edit, traverse tree and recalculate all parent sums.
3. **Immutable Updates**: Use immutable update pattern to trigger React re-renders.
4. **Percentage Calculation**: Compute percentages relative to root total on each render.

## Test Cases

### 1. Initial Render

```
Given:
  Portfolio ($300K)
  ├── Stocks ($100K)
  │   ├── AAPL ($50K)
  │   └── GOOGL ($50K)
  └── Bonds ($200K)

Verify:
  - Tree renders with correct hierarchy and indentation
  - Stocks shows "33.3%" (100K/300K)
  - Bonds shows "66.7%" (200K/300K)
  - Leaf nodes (AAPL, GOOGL) have editable inputs
  - Parent nodes (Stocks, Bonds, Portfolio) are read-only
```

### 2. Edit Leaf - Increase Value

```
Action: Change AAPL from $50K → $80K

Before:                        After:
Portfolio: $300K       →       Portfolio: $330K  ✓
├── Stocks: $100K      →       ├── Stocks: $130K  ✓
│   ├── AAPL: $50K     →       │   ├── AAPL: $80K  ✓
│   └── GOOGL: $50K    →       │   └── GOOGL: $50K
└── Bonds: $200K       →       └── Bonds: $200K

Verify: All percentages recalculated relative to new $330K total
```

### 3. Edit Leaf - Decrease Value

```
Action: Change AAPL from $50K → $20K

Before:                        After:
Portfolio: $300K       →       Portfolio: $270K  ✓
├── Stocks: $100K      →       ├── Stocks: $70K  ✓
│   ├── AAPL: $50K     →       │   ├── AAPL: $20K  ✓
│   └── GOOGL: $50K    →       │   └── GOOGL: $50K
└── Bonds: $200K       →       └── Bonds: $200K
```

### 4. Edit Leaf - Set to Zero

```
Action: Change AAPL from $50K → $0

Before:                        After:
Portfolio: $300K       →       Portfolio: $250K  ✓
├── Stocks: $100K      →       ├── Stocks: $50K  ✓
│   ├── AAPL: $50K     →       │   ├── AAPL: $0  ✓
│   └── GOOGL: $50K    →       │   └── GOOGL: $50K
└── Bonds: $200K       →       └── Bonds: $200K
```

### 5. Edit Multiple Leaves

```
Action 1: Change AAPL from $50K → $100K
Action 2: Change GOOGL from $50K → $100K

Final State:
Portfolio: $400K  (was $300K)
├── Stocks: $200K  (was $100K)
│   ├── AAPL: $100K
│   └── GOOGL: $100K
└── Bonds: $200K

Verify: Stocks = 50%, Bonds = 50%
```

### 6. Deep Nesting Propagation

```
Initial:
Portfolio ($100K)
└── Treasuries ($100K)
    └── USA ($100K)
        └── 20Y Bonds ($100K)

Action: Change "20Y Bonds" from $100K → $150K

Verify: ALL ancestors update to $150K
```
