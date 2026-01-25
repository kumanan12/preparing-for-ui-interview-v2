import { useState, useMemo } from 'react'
import { TableEngine } from './table-engine'
import css from './table-engine.module.css'
import styles from '@course/styles'
import cx from '@course/cx'

type CellData = { id: string; raw: string }

const INITIAL_CELLS: CellData[] = [
  { id: 'A1', raw: '10' },
  { id: 'B1', raw: '20' },
  { id: 'C1', raw: '=A1+B1' },
  { id: 'A2', raw: '=A1*2' },
  { id: 'B2', raw: '=B1/2' },
  { id: 'C2', raw: '=C1+A2+B2' },
]

export function TableEngineExample() {
  const [cells, setCells] = useState(INITIAL_CELLS)
  const [lastChanged, setLastChanged] = useState<string[]>([])

  const engine = useMemo(() => {
    const e = new TableEngine()
    for (const c of cells) {
      e.setRaw(c.id as `${string}${number}`, c.raw)
    }
    return e
  }, [cells])

  const handleChange = (id: string, raw: string) => {
    const result = engine.setRaw(id as `${string}${number}`, raw)
    setLastChanged(result.changed)
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, raw } : c)))
  }

  return (
    <div className={cx(css.container, styles.padding24)}>
      <h3>21.3 Table Engine Demo</h3>

      <div className={css.grid}>
        <div>
          <h4>Cells (edit raw values)</h4>
          <table className={css.table}>
            <thead>
              <tr>
                <th className={cx(css.th, styles.padding8)}>Cell</th>
                <th className={cx(css.th, styles.padding8)}>Raw</th>
                <th className={cx(css.th, styles.padding8)}>Value</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((c) => {
                const value = engine.getValue(c.id as `${string}${number}`)
                const isError = value.startsWith('#')
                return (
                  <tr key={c.id} className={cx(lastChanged.includes(c.id) ? css.rowChanged : '')}>
                    <td className={cx(css.tdId, styles.padding8)}>{c.id}</td>
                    <td className={cx(css.td, styles.padding8)}>
                      <input
                        type="text"
                        value={c.raw}
                        onChange={(e) => handleChange(c.id, e.target.value)}
                        className={css.input}
                      />
                    </td>
                    <td className={cx(isError ? css.tdError : css.td, styles.padding8)}>{value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.flexColumnGap16}>
          <div className={cx(css.changedCard, styles.padding16)}>
            <h4>Last Changed</h4>
            {lastChanged.length > 0 ? (
              <pre>{lastChanged.join(' → ')}</pre>
            ) : (
              <p className={css.muted}>Edit a cell to see propagation</p>
            )}
          </div>

          <div>
            <h4>Try</h4>
            <ul className={cx(css.tips, styles.flexColumnGap4)}>
              <li>Change A1 → see A2, C1, C2 update</li>
              <li>
                Set A1 to <code>=C2</code> → creates cycle → #CYCLE!
              </li>
              <li>
                Set B1 to <code>=1/0</code> → #DIV/0!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
