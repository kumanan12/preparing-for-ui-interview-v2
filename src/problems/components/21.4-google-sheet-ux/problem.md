# 21.4 Google Sheet - UX

Implement the user interface for a spreadsheet component using React.

## Requirements

1. **Grid Layout**
   - Display column headers (A-Z)
   - Display row numbers (1-500)
   - Editable cells using `contentEditable`

2. **Formula Bar**
   - Shows the raw formula of selected cell
   - Read-only display (editing done in cells)

3. **Cell Interaction**
   - Click to select a cell
   - Focus to edit (shows raw formula)
   - Blur to commit (shows computed value)
   - Updates propagate to dependent cells

4. **Formatting**
   - Bold, Italic, Strikethrough buttons
   - Applied via CSS classes

## Dependencies

- Uses `CellId`, `isCellReference` from `21.1-google-sheet-parser`
- Uses `TableEngine` from `21.3-google-sheet-engine`
