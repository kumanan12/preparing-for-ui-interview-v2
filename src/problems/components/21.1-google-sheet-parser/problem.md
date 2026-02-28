# 21.1 Google Sheet - Parser & Tokenizer

Implement a tokenizer and RPN converter for spreadsheet formulas.

## What is RPN?

**RPN (Reverse Polish Notation)** is a way to write expressions where operators come _after_ their operands, eliminating the need for parentheses.

```
Infix:    1 + 2 * 3      →  RPN: 1 2 3 * +
Infix:    (1 + 2) * 3    →  RPN: 1 2 + 3 *
```

### Why RPN?

RPN is easy to evaluate with a stack:

```
RPN: 1 2 3 * +

Stack operations:
  push 1        → [1]
  push 2        → [1, 2]
  push 3        → [1, 2, 3]
  pop 2, pop 3  → multiply → push 6  → [1, 6]
  pop 1, pop 6  → add      → push 7  → [7]

Result: 7
```

---

## Algorithm: Shunting-Yard

The **Shunting-Yard algorithm** (Dijkstra) converts infix to RPN:

```
Input:  1 + 2 * 3
Output: []
Ops:    []

Step 1: Token = 1 (number)
        → push to output
        Output: [1], Ops: []

Step 2: Token = + (operator)
        → push to ops stack
        Output: [1], Ops: [+]

Step 3: Token = 2 (number)
        → push to output
        Output: [1, 2], Ops: [+]

Step 4: Token = * (operator, higher precedence than +)
        → push to ops stack
        Output: [1, 2], Ops: [+, *]

Step 5: Token = 3 (number)
        → push to output
        Output: [1, 2, 3], Ops: [+, *]

Step 6: End of input
        → pop all ops to output
        Output: [1, 2, 3, *, +]
```

### Precedence Rules

| Operator      | Precedence | Associativity |
| ------------- | ---------- | ------------- |
| NEG (unary -) | 3          | Right         |
| \* /          | 2          | Left          |
| + -           | 1          | Left          |

### Handling Parentheses

```
Input: (1 + 2) * 3

When you see '(':  push to ops stack
When you see ')':  pop ops to output until '(' found
```

---

## Part 1: Tokenizer

Convert a string into tokens:

```typescript
tokenize('1 + A1 * 2')
// → [
//     { t: 'num', v: 1 },
//     { t: 'op', op: '+' },
//     { t: 'ref', id: 'A1' },
//     { t: 'op', op: '*' },
//     { t: 'num', v: 2 }
//   ]
```

### Token Types

| Type  | Example                  | Description       |
| ----- | ------------------------ | ----------------- |
| `num` | `{ t: 'num', v: 42 }`    | Number literal    |
| `ref` | `{ t: 'ref', id: 'A1' }` | Cell reference    |
| `op`  | `{ t: 'op', op: '+' }`   | Operator          |
| `lp`  | `{ t: 'lp' }`            | Left parenthesis  |
| `rp`  | `{ t: 'rp' }`            | Right parenthesis |

### Edge Cases

- **Unary minus**: `-5` or `1 + -2` should produce `NEG` token
- **Decimals**: `3.14`, `.5`
- **Cell references**: `A1`, `Z99` (single letter + digits)

---

## Part 2: RPN Converter

Convert tokens to RPN using shunting-yard:

```typescript
toRpn(tokens)
// Input:  [1, +, 2, *, 3]
// Output: [1, 2, 3, *, +]
```

---

## API

```typescript
type Token =
  | { t: 'num'; v: number }
  | { t: 'ref'; id: CellId }
  | { t: 'op'; op: '+' | '-' | '*' | '/' | 'NEG' }
  | { t: 'lp' }
  | { t: 'rp' }

function tokenize(expr: string): { ok: true; tokens: Token[] } | { ok: false; error: string }

function toRpn(tokens: Token[]): { ok: true; rpn: Token[] } | { ok: false; error: string }
```

## Run Tests

```bash
bun test src/problems/components/21.1-google-sheet-parser/test/parser.test.ts
```
