# Table Component

**Difficulty**: `medium`

## Goal

Build a data table component that supports displaying structured data with support for sorting, pagination, and filtering.

## Requirements

### Core Functionality

1.  **Columns**: Accept a configuration array for columns, defining header names, ids, and custom renderers for cell content.
2.  **Pagination**: Display specific number of rows per page. Provide "Next" and "Previous" buttons and display current page info (e.g., "1 / 5").
3.  **Sorting**: Allow clicking on headers to sort the table by that column (Ascending -> Descending -> None). Visual indicators (↑/↓) should show sort direction.
4.  **Filtering**: Provide a search input to filter rows based on content.

### Accessibility (A11y)

1.  Use semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements.
2.  Interactive headers should be keyboard accessible (if implemented as buttons) or natively clickable.
3.  Pagination controls should utilize `button` elements with proper disabled states.

## API Design

The component should accept the following props:

- `columns`: `TTableColumn<T>[]` - Array of column definitions.
  - `id`: `string` - Unique identifier.
  - `name`: `string` - Header display text.
  - `renderer`: `(item: T) => ReactNode` - Function to render cell content.
  - `sort`: `'asc' | 'desc' | 'none'` - Initial/default sort state.
- `datasource`: `TTableDataSource<T>` - Data provider interface.
  - `pageSize`: `number` - Number of items per page.
  - `pages`: `number` - Total number of available pages.
  - `next`: `(page: number, pageSize: number) => Promise<T[]>` - Async function to fetch data for a specific page.
- `search`: `(query: string, data: T[]) => T[]` - (Optional) Custom search filter function.
- `comparator`: `(columnId: keyof T, direction: SortDirection) => (a: T, b: T) => number` - (Optional) Custom sort comparator factory.

## Solution Approach

1.  **State Management**: Use `useState` to manage internal component state for `data` (accumulated rows), `currentPage`, `query` (search text), and active `sort` column/direction.
2.  **Stateless Data Fetching**: Use `useEffect` to trigger initial load and a `next()` callback that explicitly passes the required `page` and `pageSize` arguments to the provided `datasource.next` method.
3.  **Functional Data Pipeline**:
    - Use a single `useMemo` block that pipes the accumulated `data` through an array of reducer functions (`[filterFn, sortFn, sliceFn].reduce(d => next(d))`).
    - Filter data based on `query`.
    - Sort data based on active column sort state.
    - Slice the filtered/sorted data strictly to the boundaries of the `currentPage` and `pageSize`.
4.  **Rendering**: Map over `columns` to render headers and the resultant `slice` to render rows. Ensure the `search` input resets the `currentPage` to `0` when used.
