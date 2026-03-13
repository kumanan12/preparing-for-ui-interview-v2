import css from './portfolio-visualizer.module.css'
import cx from '@course/cx'
import styles from '@course/styles'

export type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

/**
 * Expected data:
 * {
 *   id: 'root', name: 'Portfolio', value: 1000,
 *   children: [
 *     { id: 'stocks', name: 'Stocks', value: 600, children: [
 *       { id: 'aapl', name: 'AAPL', value: 300 },
 *       { id: 'goog', name: 'GOOG', value: 300 },
 *     ]},
 *     { id: 'bonds', name: 'Bonds', value: 400 },
 *   ]
 * }
 */

// Step 1: PortfolioNode component — receives TPortfolioNode props + total (root value)
//   - Calculate percentage: (value / total) * 100, formatted to 2 decimal places
//   - Render <details open> with:
//     - <summary> containing a row with <strong>name</strong> and a group of:
//       - <input type="number" data-node-id={id} defaultValue={value}>
//       - <output> showing percentage%
//   - Recursively render children, passing the same total to each child

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
  // Step 2: Render — container div, render root PortfolioNode with total={data.value}
  return <div>TODO: Implement</div>
}
