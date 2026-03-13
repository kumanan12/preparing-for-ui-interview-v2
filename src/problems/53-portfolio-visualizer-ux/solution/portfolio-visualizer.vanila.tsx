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

export class PortfolioVisualizer extends AbstractComponent<TPortfolioVisualizerProps> {
  constructor(config: TComponentConfig<TPortfolioVisualizerProps>) {
    super(config)
  }

  private renderNode(node: TPortfolioNode, total: number): string {
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

  toHTML(): string {
    const { data } = this.config
    return `
      <div class="${cx(css.container, styles.padding16)}">
        ${this.renderNode(data, data.value)}
      </div>
    `
  }
}
