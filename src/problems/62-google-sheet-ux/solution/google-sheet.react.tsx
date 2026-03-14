import cx from '@course/cx'
import css from './google-sheet.module.css'
import {type CellId, TableEngine} from '../../61-google-sheet-recompute/solution/table-engine'
export const COLS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const

export type TTableColumn = (typeof COLS)[number]

export function fromCellReference(id: CellId): { row: number; col: string } {
  const col = id[0] as string
  const row = Number(id.slice(1))
  return { row, col }
}

export function toCellReference(row: number, col: TTableColumn): CellId {
  return `${col}${row}`
}

const EMPTY = Symbol(' ')
const MAX_ROWS = 500
const TABLE_COLUMNS = [EMPTY, ...COLS]

const engine = new TableEngine()

type TCellProps = {
  column: string | symbol
  row: number
  value: React.ReactNode
}

const resizeClass = {
  columnheader: css['resize-horizontal'],
  rowheader: css['resize-vertical'],
  gridcell: '',
} as const

function Cell({ column, row, value }: TCellProps) {
  const isHeader = column === EMPTY
  const isColHeader = row === 0
  const role = isColHeader ? 'columnheader' : isHeader ? 'rowheader' : 'gridcell'

  const className = cx(css.cell, isColHeader || isHeader ? css.header : '', resizeClass[role])
  return (
    <div
      role={role}
      data-value={value}
      contentEditable={role === 'gridcell'}
      data-column={String(column)}
      data-row={row}
      className={className}
      suppressContentEditableWarning
    >
      {value}
    </div>
  )
}

const HEADER_ROWS = (
  <div role="row" style={{ display: 'contents' }}>
    {TABLE_COLUMNS.map((column) => (
      <Cell
        key={String(column)}
        column={column}
        row={0}
        value={column === EMPTY ? '' : String(column)}
      />
    ))}
  </div>
)

const BODY_ROWS = Array.from({ length: MAX_ROWS }).map((_, idx) => {
  const rowId = idx + 1
  return (
    <div role="row" key={idx} style={{ display: 'contents' }}>
      {TABLE_COLUMNS.map((column) => (
        <Cell
          key={String(column) + idx}
          column={column}
          row={rowId}
          value={column === EMPTY ? rowId : null}
        />
      ))}
    </div>
  )
})

function getCellElement(row: number, column: string) {
  return document.querySelector(`[data-column="${column}"][data-row="${row}"]`)
}

export function GoogleSheet() {
  const updateCellView = (id: CellId) => {
    const { col, row } = fromCellReference(id)
    if (!col || !row) return
    const cell = getCellElement(row, col)
    if (cell) {
      if (document.activeElement === cell) {
        cell.textContent = engine.getRaw(id)
      } else {
        cell.textContent = engine.getValue(id)
      }
    }
  }

  const handleCellFocus: React.FocusEventHandler<HTMLDivElement> = ({ target }) => {
    if (target instanceof HTMLElement) {
      const column = target.dataset.column as TTableColumn
      const row = Number(target.dataset.row)
      const id = toCellReference(row, column)
      if (column && row) {
        target.textContent = engine.getRaw(id)
      }
    }
  }

  const handeCellChange: React.FocusEventHandler<HTMLDivElement> = ({ target }) => {
    if (target instanceof HTMLElement) {
      const column = target.dataset.column as TTableColumn
      const row = Number(target.dataset.row)
      const id = toCellReference(row, column)
      if (column && row) {
        const raw = target.textContent ?? ''
        const { changed } = engine.setRaw(id, raw)

        target.textContent = engine.getValue(id)

        for (const changedId of changed) {
          updateCellView(changedId)
        }
      }
    }
  }

  return (
    <section>
      <div
        className={css.container}
        role="grid"
        aria-label="Spreadsheet"
        onBlurCapture={handeCellChange}
        onFocusCapture={handleCellFocus}
      >
        {HEADER_ROWS}
        {BODY_ROWS}
      </div>
    </section>
  )
}
