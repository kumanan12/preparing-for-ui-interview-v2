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

function PortfolioNode({
  id,
  name,
  value,
  children,
  total,
}: TPortfolioNode & { total: number }) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
  return (
    <details className={cx(styles.paddingLeft16, styles.paddingVer8, css.details)} open>
      <summary>
        <div className={cx(styles.flexRowBetween, styles.flexRowGap16)}>
          <strong>{name}</strong>
          <div className={cx(styles.flexRowGap8)}>
            <input data-node-id={id} type="number" defaultValue={value} />
            <output className={cx(css.output)}>{percentage}%</output>
          </div>
        </div>
      </summary>
      {children &&
        children.length > 0 &&
        children.map((ch) => <PortfolioNode total={total} key={ch.id} {...ch} />)}
    </details>
  )
}

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
  return (
    <div className={cx(css.container, styles.maxW600px, styles.padding16)}>
      <PortfolioNode total={data.value} {...data} />
    </div>
  )
}
