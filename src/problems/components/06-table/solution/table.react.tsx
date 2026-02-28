import React, { useCallback, useDeferredValue, useEffect, useMemo, useState, type ChangeEventHandler } from 'react'
import styles from './table.module.css'
import flex from '@course/styles'
import cx from '@course/cx'


export interface TTableDataSource<T> {
  pageSize: number,
  pages: number,
  next: (page: number, pageSize: number) => Promise<T[]>
}
export type TTableColumn<T> = {
  id: string
  name: string
  renderer: (item: T) => React.ReactNode
  sort?: 'asc' | 'desc' | 'none'
}

type TTableProps<T extends { id: string }> = {
  columns: TTableColumn<T>[]
  datasource: TTableDataSource<T>
  search?: (query: string, data: T[]) => T[],
  comparator?: (columnId: keyof T, direction: 'asc' | 'desc') => (a: T, b: T) => number
}

export function Table<T extends { id: string }>({
  search,
  columns,
  datasource,
  comparator
}: TTableProps<T>) {

  const [_query, setQuery] = useState('')
  const query = useDeferredValue(_query);
  const [data, setData] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(0);
  const [sort, setSort] = useState<{ columnId: keyof T, direction: 'asc' | 'desc' | 'none' } | null>(null)

  useEffect(() => {
    if (data.length === 0) {
      datasource.next(0, datasource.pageSize).then(d => setData(d));
    }
  }, [datasource]);

  const next = useCallback(() => {
    if (currentPage >= datasource.pages - 1) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    if (data.length <= nextPage * datasource.pageSize && data.length < datasource.pages * datasource.pageSize) {
      datasource.next(nextPage, datasource.pageSize).then(d => setData(prev => [...prev, ...d]))
    }
  }, [datasource, currentPage, data.length])

  const prev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0))
  }, []);


  const onSearch: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setQuery(target.value);
    setCurrentPage(0);
  };

  const onSort: React.MouseEventHandler<HTMLTableSectionElement> = ({ target }) => {
    if (!(target instanceof HTMLElement) || !target.dataset.columnId) return
    const columnId = target.dataset.columnId as keyof T
    const column = columns.find((c) => c.id === columnId)
    if (!column) return
    setSort(prevSort => {
      const currentDirection = prevSort?.columnId === columnId ? prevSort.direction : (column.sort ?? 'none');
      const newDirection = currentDirection === 'desc' ? 'none' : currentDirection === 'asc' ? 'desc' : 'asc';
      return { columnId, direction: newDirection };
    });
  }

  const slice = useMemo(() => {
    const filterFn = (d: T[]) => {
      if (!query) return d
      return search ? search(query, d) : d.filter((item) => item.id.includes(query))
    }

    const sortFn = (d: T[]) => {
      const sortedColumn = columns.find((c) => c.id === sort?.columnId)
      if (!sortedColumn || !sort || !comparator || sort.direction === 'none') return d
      return [...d].sort(comparator(sortedColumn.id as keyof T, sort.direction))
    }

    const sliceFn = (d: T[]) => {
      const start = currentPage * datasource.pageSize;
      const end = (currentPage + 1) * datasource.pageSize;
      return d.slice(start, end)
    }

    return [filterFn, sortFn, sliceFn].reduce((acc, fn) => fn(acc), data)
  }, [data, query, search, columns, sort, comparator, currentPage, datasource])

  return (
    <div className={cx(flex.w100, flex.flexColumnStart)}>
      <table>
        <thead onClickCapture={onSort}>
          <tr>
            {columns.map((c) => {
              const currentSort = sort?.columnId === c.id ? sort.direction : c.sort;
              return (
                <th data-column-id={c.id} className={cx(flex.padding8)} key={c.id}>
                  {c.name}
                  {currentSort === 'asc' ? ' ↑' : currentSort === 'desc' ? ' ↓' : ''}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {slice.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.id} className={cx(flex.padding8)}>
                  {col.renderer(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={cx(flex.flexRowCenter, flex.flexGap8, styles.controls)}>
        <button disabled={currentPage === 0} className={cx(flex.paddingHor8)} onClick={prev}>
          Prev
        </button>
        <span>
          {currentPage + 1} / {datasource.pages}
        </span>
        <button
          disabled={currentPage === datasource.pages - 1}
          className={cx(flex.paddingHor8)}
          onClick={next}
        >
          Next
        </button>
        <input type="search" placeholder="Filter" onChange={onSearch} />
      </div>
    </div>
  )
}
