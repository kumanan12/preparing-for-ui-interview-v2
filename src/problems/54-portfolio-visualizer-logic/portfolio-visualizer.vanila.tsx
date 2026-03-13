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

type TPortfolioStateNode = Omit<TPortfolioNode, 'children'> & {
  parentID: string | null
  children?: TPortfolioStateNode[]
}

export type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

/**
 * Expected data: same tree structure as React version (see portfolio-visualizer.react.tsx)
 */

export class PortfolioVisualizer extends AbstractComponent<TPortfolioVisualizerProps> {
  private store: Map<string, TPortfolioStateNode> = new Map()
  private root: TPortfolioStateNode | null = null

  // Step 1: Constructor — super with listeners: ['input'], call prepareData()

  // Step 2: prepareData + prepare(data, parentID) — recursive function:
  //   - Builds flat Map<id, TPortfolioStateNode> with parentID references
  //   - Sets this.root and this.store

  // Provided: renderNode from Problem 53 (renders the UI)
  private renderNode(node: TPortfolioStateNode, total: number): string {
    const percentage = total > 0 ? ((node.value / total) * 100).toFixed(2) : '0.00'
    const childrenHTML =
      node.children && node.children.length > 0
        ? node.children.map((ch) => this.renderNode(ch, total)).join('')
        : ''

    return `
      <details class="${cx(styles.paddingLeft16, styles.paddingVer8, css.details)}" open>
        <summary>
          <div class="${cx(styles.flexRowBetween, styles.flexRowGap16)}">
            <strong>${node.name}</strong>
            <div class="${cx(styles.flexRowGap8)}">
              <input data-node-id="${node.id}" type="number" value="${node.value}" />
              <output class="${cx(css.output)}">${percentage}%</output>
            </div>
          </div>
        </summary>
        ${childrenHTML}
      </details>
    `
  }

  // Step 3: toHTML — render container with renderNode(root, root.value)

  // Step 4: onInput(event) — event delegation on input changes:
  //   - Read data-node-id from target, parse new value
  //   - Validation: if node has children, reject if newValue < sum of children values
  //   - Update node value, bubble up parent chain recalculating sums
  //   - Call updateDisplayedValues()

  // Step 5: updateDisplayedValues — iterate store, update each input value and output percentage in DOM

  constructor(config: TComponentConfig<TPortfolioVisualizerProps>) {
    super(config)
  }
  toHTML() {
    return '<div>TODO: Implement PortfolioVisualizer</div>'
  }
}
