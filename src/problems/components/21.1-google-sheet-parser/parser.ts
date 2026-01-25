export const ERROR = '#ERROR'
export const CYCLE = '#CYCLE!'
export const DIV0 = '#DIV/0!'

export type CellId = `${string}${number}`

export function isCellReference(id: string): id is CellId {
  return /^[A-Z]\d+$/.test(id)
}

type Op = '+' | '-' | '*' | '/' | 'NEG'

export type Token =
  | { t: 'num'; v: number }
  | { t: 'ref'; id: CellId }
  | { t: 'op'; op: Op }
  | { t: 'lp' }
  | { t: 'rp' }

export type Compiled = null | { error: string } | { rpn: Token[] }

export function tokenize(
  expr: string,
): { ok: true; tokens: Token[] } | { ok: false; error: string } {
  const tokens: Token[] = []
  let i = 0

  type Prev = 'start' | 'value' | 'op' | 'lp' | 'rp'
  let prev: Prev = 'start'

  const isDigit = (c: string) => c >= '0' && c <= '9'

  while (i < expr.length) {
    const ch = expr[i]!

    // whitespace
    if (/\s/.test(ch)) {
      i++
      continue
    }

    // parentheses
    if (ch === '(') {
      tokens.push({ t: 'lp' })
      prev = 'lp'
      i++
      continue
    }
    if (ch === ')') {
      tokens.push({ t: 'rp' })
      prev = 'rp'
      i++
      continue
    }

    // operators
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      if (ch === '-') {
        const isUnary = prev === 'start' || prev === 'op' || prev === 'lp'
        tokens.push({ t: 'op', op: isUnary ? 'NEG' : '-' })
      } else {
        tokens.push({ t: 'op', op: ch })
      }
      prev = 'op'
      i++
      continue
    }

    // numbers
    if (isDigit(ch) || (ch === '.' && i + 1 < expr.length && isDigit(expr[i + 1]!))) {
      const start = i
      let sawDot = ch === '.'
      i++

      while (i < expr.length) {
        const c = expr[i]!
        if (isDigit(c)) {
          i++
          continue
        }
        if (c === '.' && !sawDot) {
          sawDot = true
          i++
          continue
        }
        break
      }

      const raw = expr.slice(start, i)
      const n = Number(raw)
      if (!Number.isFinite(n)) return { ok: false, error: `Invalid number: ${raw}` }

      tokens.push({ t: 'num', v: n })
      prev = 'value'
      continue
    }

    // cell references: A1, B12, etc
    if (ch >= 'A' && ch <= 'Z') {
      const start = i
      i++ // consume letter

      const digitStart = i
      while (i < expr.length && isDigit(expr[i]!)) i++

      if (digitStart === i) {
        return { ok: false, error: `Invalid cell reference near: ${expr.slice(start, start + 3)}` }
      }

      const ref = expr.slice(start, i) as CellId
      tokens.push({ t: 'ref', id: ref })
      prev = 'value'
      continue
    }

    return { ok: false, error: `Unexpected character: "${ch}"` }
  }

  return { ok: true, tokens }
}

export function toRpn(tokens: Token[]): { ok: true; rpn: Token[] } | { ok: false; error: string } {
  const out: Token[] = []
  const ops: Token[] = []

  const precedence: Record<Op, number> = {
    NEG: 3,
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1,
  }

  const isRightAssoc = (op: Op) => op === 'NEG'

  const popWhile = (incoming: Op) => {
    while (ops.length) {
      const top = ops[ops.length - 1]!
      if (top.t !== 'op') break

      const topPrec = precedence[top.op]
      const inPrec = precedence[incoming]

      const shouldPop = topPrec > inPrec || (topPrec === inPrec && !isRightAssoc(incoming))

      if (!shouldPop) break
      out.push(ops.pop()!)
    }
  }

  for (const tok of tokens) {
    if (tok.t === 'num' || tok.t === 'ref') {
      out.push(tok)
      continue
    }

    if (tok.t === 'op') {
      popWhile(tok.op)
      ops.push(tok)
      continue
    }

    if (tok.t === 'lp') {
      ops.push(tok)
      continue
    }

    if (tok.t === 'rp') {
      let found = false
      while (ops.length) {
        const t = ops.pop()!
        if (t.t === 'lp') {
          found = true
          break
        }
        out.push(t)
      }
      if (!found) return { ok: false, error: 'Mismatched parentheses' }
      continue
    }
  }

  while (ops.length) {
    const t = ops.pop()!
    if (t.t === 'lp' || t.t === 'rp') return { ok: false, error: 'Mismatched parentheses' }
    out.push(t)
  }

  return { ok: true, rpn: out }
}
