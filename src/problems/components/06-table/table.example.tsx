import { useRef, useEffect, useMemo } from 'react'
import { Table, type TTableColumn, type TTableDataSource } from './solution/table.react'
import { Table as VanillaTable, type TTableColumn as TVanillaTableColumn } from './solution/table.vanila'
import { Table as StudentTable } from './table.react'
import { Table as StudentVanillaTable } from './table.vanila'

import { fetchStocks, type Stock } from './solution/api'

const COLUMNS: TTableColumn<Stock>[] = [
  { id: 'symbol', name: 'Symbol', renderer: (s) => s.symbol },
  { id: 'name', name: 'Name', renderer: (s) => s.name },
  { id: 'price', name: 'Price', renderer: (s) => `$${s.price.toFixed(2)}` },
  {
    id: 'change',
    name: 'Change',
    renderer: (s) => (
      <span style={{ color: s.change >= 0 ? 'green' : 'red' }}>
        {s.change > 0 ? '+' : ''}
        {s.change.toFixed(2)}
      </span>
    ),
  },
  {
    id: 'changePercent',
    name: '% Change',
    renderer: (s) => (
      <span style={{ color: s.changePercent >= 0 ? 'green' : 'red' }}>
        {s.changePercent.toFixed(2)}%
      </span>
    ),
  },
  { id: 'volume', name: 'Volume', renderer: (s) => s.volume.toString() },
  { id: 'marketCap', name: 'Market Cap', renderer: (s) => s.marketCap.toString() },
  { id: 'peRatio', name: 'P/E Ratio', renderer: (s) => s.peRatio.toString() },
]

const VANILLA_COLUMNS: TVanillaTableColumn<Stock>[] = [
  { id: 'symbol', name: 'Symbol', renderer: (s) => s.symbol },
  { id: 'name', name: 'Name', renderer: (s) => s.name },
  { id: 'price', name: 'Price', renderer: (s) => `$${s.price.toFixed(2)}` },
  {
    id: 'change',
    name: 'Change',
    renderer: (s) =>
      `<span style="color: ${s.change >= 0 ? 'green' : 'red'}">${s.change > 0 ? '+' : ''}${s.change.toFixed(2)}</span>`,
  },
  {
    id: 'changePercent',
    name: '% Change',
    renderer: (s) =>
      `<span style="color: ${s.changePercent >= 0 ? 'green' : 'red'}">${s.changePercent.toFixed(2)}%</span>`,
  },
  { id: 'volume', name: 'Volume', renderer: (s) => s.volume.toString() },
  { id: 'marketCap', name: 'Market Cap', renderer: (s) => s.marketCap.toString() },
  { id: 'peRatio', name: 'P/E Ratio', renderer: (s) => s.peRatio.toString() },
]

const defaultComparator =
  (columnId: keyof Stock, direction: 'asc' | 'desc') =>
    (a: Stock, b: Stock): number => {
      const modifier = direction === 'asc' ? 1 : -1
      if (typeof a[columnId] === 'string' && typeof b[columnId] === 'string') {
        return a[columnId].localeCompare(b[columnId]) * modifier
      }
      if (typeof a[columnId] === 'number' && typeof b[columnId] === 'number') {
        return (a[columnId] - b[columnId]) * modifier
      }
      return 0
    }

const dataSource: () => TTableDataSource<Stock> = () => {
  const pageSize = 5;
  const pages = Math.ceil(20 / pageSize);

  return {
    pages,
    pageSize,
    next: async (page: number, size: number) => {
      if (page >= pages) return []
      const res = await fetchStocks(page, size)
      return res.data
    }
  }
}

export function TableExample() {
  const datasource = useMemo(() => dataSource(), []);

  return (
    <Table
      columns={COLUMNS}
      datasource={datasource}
      comparator={defaultComparator}
      search={(query, list) => list.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(query.toLowerCase())))}
    />
  )
}

export function TableVanillaExample() {
  const datasource = useMemo(() => dataSource(), []);
  const rootRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<VanillaTable<Stock> | null>(null)

  useEffect(() => {
    if (!rootRef.current) return
    tableRef.current = new VanillaTable({
      root: rootRef.current,
      columns: VANILLA_COLUMNS,
      datasource,
      comparator: defaultComparator,
      search: (query, list) => list.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(query.toLowerCase())))
    })
    tableRef.current.render()
    return () => {
      tableRef.current?.destroy()
      tableRef.current = null
    }
  }, [datasource])

  return <div ref={rootRef}></div>
}

export function TableStudentExample() {
  const datasource = useMemo(() => dataSource(), []);

  return (
    <StudentTable
      columns={COLUMNS}
      datasource={datasource}
      comparator={defaultComparator}
      search={(query: string, list: Stock[]) => list.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(query.toLowerCase())))}
    />
  )
}

export function TableStudentVanillaExample() {
  const datasource = useMemo(() => dataSource(), []);
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return

    // @ts-ignore - Student might not have implemented type yet
    const table = new StudentVanillaTable({
      root: rootRef.current,
      columns: VANILLA_COLUMNS,
      datasource,
      comparator: defaultComparator,
      search: (query: string, list: Stock[]) => list.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(query.toLowerCase())))
    })

    if (table.render) table.render()

    return () => {
      if (table.destroy) table.destroy()
    }
  }, [datasource])

  return <div ref={rootRef}></div>
}
