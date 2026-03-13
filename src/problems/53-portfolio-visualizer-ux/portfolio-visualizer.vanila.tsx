import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './portfolio-visualizer.module.css'
import cx from '@course/cx'
import styles from '@course/styles'

export type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

export type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

/**
 * Expected data: same tree structure as React version (see portfolio-visualizer.react.tsx)
 */

export class PortfolioVisualizer extends AbstractComponent<TPortfolioVisualizerProps> {
  constructor(config: TComponentConfig<TPortfolioVisualizerProps>) {
    super(config)
  }

  // Step 1: renderNode(node, total) — returns HTML string:
  //   - Calculate percentage: (node.value / total) * 100, formatted to 2 decimal places
  //   - <details open> with <summary> containing:
  //     - <strong>name</strong>
  //     - <input type="number" data-node-id value>
  //     - <output> showing percentage%
  //   - Recursively render children with same total

  // Step 2: toHTML — render container div with renderNode(data, data.value)

  toHTML() {
    return '<div>TODO: Implement PortfolioVisualizer</div>'
  }
}
