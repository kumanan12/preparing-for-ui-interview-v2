import {type CellId, TableEngine} from "../61-google-sheet-recompute/solution/table-engine.ts";
import css from "./solution/google-sheet.module.css";
import cx from "@course/cx";

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
    return {row, col}
}

export function toCellReference(row: number, col: TTableColumn): CellId {
    return `${col}${row}`
}

function getCellElement(row: number, column: string) {
    return document.querySelector(`[data-column="${column}"][data-row="${row}"]`)
}

const EMPTY = Symbol(' ')
const MAX_ROWS = 50
const TABLE_COLUMNS = [EMPTY, ...COLS]

const engine = new TableEngine()

type TCellProps = {
    column: string | symbol
    row: number
    value: string | number
}

const resizeClass = {
    columnheader: css['resize-horizontal'],
    rowheader: css['resize-vertical'],
    gridcell: '',
} as const

/* Step 1: Cell component
   - Determine the cell's role: 'columnheader' (row === 0), 'rowheader' (column === EMPTY), or 'gridcell'
   - Build className using cx(): css.cell + css.header (if header) + resizeClass[role]
   - Render a <div> with:
     role, data-value={value}, data-column={String(column)}, data-row={row}, className
     contentEditable={role === 'gridcell'}, suppressContentEditableWarning
   - Children: {value}
*/
function Cell({column, row, value}: TCellProps) {
}

/* Step 2: HEADER_ROWS — map TABLE_COLUMNS to <Cell> with row=0
   - For EMPTY column: value is '' (empty string)
   - For letter columns: value is the column letter
*/
const HEADER_ROWS = (
    <div role="row" style={{display: 'contents'}}>
        {TABLE_COLUMNS}
    </div>
)

/* Step 3: BODY_ROWS — for each row (1..MAX_ROWS), map TABLE_COLUMNS to <Cell>
   - For EMPTY column: value is the row number (rowId)
   - For letter columns: value is null (empty editable cell)
*/
const BODY_ROWS = Array.from({length: MAX_ROWS}).map((_, idx) => {
    const rowId = idx + 1
    return (
        <div role="row" key={idx} style={{display: 'contents'}}>
            {TABLE_COLUMNS}
        </div>
    )
})

export function GoogleSheet() {

    /* Step 4: updateCellView(id) — refresh a cell's displayed text
       - Use fromCellReference(id) to get row/col, then getCellElement to find the DOM node
       - If the cell is currently focused (document.activeElement === cell): show raw formula via engine.getRaw(id)
       - Otherwise: show computed value via engine.getValue(id)
    */
    const updateCellView = (id: CellId) => {
    }
    /* Step 5: handleCellFocus — when a cell gains focus, show its raw formula
       - Read column and row from target.dataset
       - Build the CellId with toCellReference
       - Set target.textContent = engine.getRaw(id)
    */
    const handleCellFocus: React.FocusEventHandler<HTMLDivElement> = ({target}) => {
    }
    /* Step 6: handeCellChange — when a cell loses focus (blur), commit the edit
       - Read column and row from target.dataset, build CellId
       - Get the raw text from target.textContent
       - Call engine.setRaw(id, raw) — returns { changed: Set<CellId> }
       - Set target.textContent = engine.getValue(id) to show computed value
       - Loop through changed set and call updateCellView for each affected cell
    */
    const handeCellChange: React.FocusEventHandler<HTMLDivElement> = ({target}) => {
    }

    return (
        <section>
            <div
                className={css.grid}
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