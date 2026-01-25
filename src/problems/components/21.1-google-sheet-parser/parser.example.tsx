import { useState } from 'react'
import { tokenize, toRpn, type Token } from './parser'
import css from './parser.module.css'
import styles from '@course/styles'
import cx from '@course/cx'

export function ParserExample() {
  const [input, setInput] = useState('1 + 2 * 3')

  const tokenResult = tokenize(input)
  const rpnResult = tokenResult.ok ? toRpn(tokenResult.tokens) : null

  const formatTokens = (tokens: Token[]) =>
    tokens
      .map((t) => {
        if (t.t === 'num') return String(t.v)
        if (t.t === 'ref') return t.id
        if (t.t === 'op') return t.op
        if (t.t === 'lp') return '('
        if (t.t === 'rp') return ')'
        return '?'
      })
      .join(' ')

  return (
    <div className={cx(css.container, styles.padding24)}>
      <h3>21.1 Parser Demo</h3>
      <div className={styles.marginVer16}>
        <label className={styles.flexRowGap8}>
          Expression:
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={css.input}
          />
        </label>
      </div>

      <div className={css.grid}>
        <div className={cx(css.card, styles.padding16)}>
          <h4>Tokens</h4>
          {tokenResult.ok ? (
            <pre className={css.pre}>{formatTokens(tokenResult.tokens)}</pre>
          ) : (
            <pre className={cx(css.pre, css.error)}>{tokenResult.error}</pre>
          )}
        </div>

        <div className={cx(css.card, styles.padding16)}>
          <h4>RPN (Reverse Polish)</h4>
          {rpnResult?.ok ? (
            <pre className={css.pre}>{formatTokens(rpnResult.rpn)}</pre>
          ) : rpnResult ? (
            <pre className={cx(css.pre, css.error)}>{rpnResult.error}</pre>
          ) : (
            <pre className={cx(css.pre, css.muted)}>-</pre>
          )}
        </div>
      </div>

      <div className={cx(css.examples, styles.marginVer24)}>
        <p>Try these examples:</p>
        <ul className={styles.flexColumnGap4}>
          <li>
            <code>1 + 2 * 3</code> → Tokens: 1 + 2 * 3 → RPN: 1 2 3 * +
          </li>
          <li>
            <code>(1 + 2) * 3</code> → Parentheses change order
          </li>
          <li>
            <code>A1 + B2</code> → Cell references
          </li>
          <li>
            <code>-5 + 3</code> → Unary minus (NEG)
          </li>
        </ul>
      </div>
    </div>
  )
}
