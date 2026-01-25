import { useState } from 'react'
import { affectedFrom, topoSort } from './topo'
import css from './topo.module.css'
import styles from '@course/styles'
import cx from '@course/cx'

type Graph = Record<string, string[]>

const EXAMPLES: { name: string; graph: Graph; start: string }[] = [
  { name: 'Linear Chain', graph: { B: ['A'], C: ['B'], D: ['C'] }, start: 'A' },
  { name: 'Diamond', graph: { B: ['A'], C: ['A'], D: ['B', 'C'] }, start: 'A' },
  { name: 'Cycle', graph: { A: ['C'], B: ['A'], C: ['B'] }, start: 'A' },
]

export function TopoExample() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const example = EXAMPLES[selectedIdx]!

  // Build graph helpers
  const deps = new Map<string, Set<string>>()
  const revDeps = new Map<string, Set<string>>()

  for (const [node, dependencies] of Object.entries(example.graph)) {
    deps.set(node, new Set(dependencies))
    for (const dep of dependencies) {
      if (!revDeps.has(dep)) revDeps.set(dep, new Set())
      revDeps.get(dep)!.add(node)
    }
  }

  const getDeps = (id: string) => deps.get(id) ?? new Set()
  const getRevDeps = (id: string) => revDeps.get(id) ?? new Set()

  // Run algorithms
  const affected = affectedFrom(example.start, getRevDeps)
  const { order, cyclic } = topoSort(affected, getDeps, getRevDeps)

  return (
    <div className={cx(css.container, styles.padding24)}>
      <h3>21.2 Topological Sort Demo</h3>

      <div className={styles.marginVer16}>
        <label className={styles.flexRowGap8}>
          Example:
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className={css.select}
          >
            {EXAMPLES.map((ex, i) => (
              <option key={i} value={i}>
                {ex.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={css.grid}>
        <div className={cx(css.card, styles.padding16)}>
          <h4>Graph (dependencies)</h4>
          <pre className={cx(css.pre, css.graphJson)}>{JSON.stringify(example.graph, null, 2)}</pre>
          <p className={css.start}>Start: {example.start}</p>
        </div>

        <div className={cx(css.cardAffected, styles.padding16)}>
          <h4>Affected Nodes</h4>
          <pre className={css.pre}>{[...affected].join(' → ')}</pre>
        </div>

        <div className={cx(cyclic.size > 0 ? css.cardError : css.cardSuccess, styles.padding16)}>
          <h4>Topo Order</h4>
          <pre className={css.pre}>{order.length > 0 ? order.join(' → ') : '(none)'}</pre>
          {cyclic.size > 0 && (
            <div className={cx(css.cycleError, styles.marginVer8)}>
              <strong>Cycles detected:</strong> {[...cyclic].join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
