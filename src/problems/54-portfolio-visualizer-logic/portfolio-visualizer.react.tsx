import cx from '@course/cx'
import styles from '@course/styles'
import {useState} from 'react'

export type TPortfolioNode = {
    id: string
    name: string
    value: number
    children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
    data: TPortfolioNode
}

type TPortfolioStateNode = Omit<TPortfolioNode, 'children'> & {
    parentID: string | null
    children?: TPortfolioStateNode[]
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

// PortfolioNode — receives nodeId, store (Map), and total (root value for percentage)
function PortfolioNode({
                           id,
                           name,
                           value,
                           children,
                           total,
                       }: TPortfolioNode & { total: number }) {
    // Step A: Look up node from store by ID — O(1)

    // Step B: Compute percentage as (value / total) * 100, formatted to 2 decimal places
    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'

    // Step C: useRef<HTMLInputElement> + useEffect to sync uncontrolled input
    //   - When state value changes (e.g. after rejection revert), update input.value via ref

    // Step D: Compute unallocated cash = value - sum of children values
    //   - Render "Unallocated cash: {amount}" when childrenIDs.length > 0 && unallocated > 0

    return (
        <details open={true}>
            <summary className={styles.flexRowBetween}>
                <label htmlFor={id}><strong>{name}</strong></label>
                <div className={cx(styles.flexRowGap8, styles.flexRowCenter)}>
                    <input data-node-id={id} id={id} type="text" defaultValue={value}/>
                    <output className={styles.w100px}>{percentage}%</output>
                </div>
            </summary>
            {children && children.length > 0 ? (
                <ul className={cx(styles.flexColumnGap12, styles.paddingLeft16, styles.paddingVer8)}>
                    {children.map((ch) => (
                        <li key={ch.id}><PortfolioNode total={total} {...ch} /></li>
                    ))}
                </ul>
            ) : null}
        </details>
    )
}

export function PortfolioVisualizer({data}: TPortfolioVisualizerProps) {
    // Step 1: prepare(data) — recursive function that builds a flat Map<id, TPortfolioStateNode>
    //   - Each node gets a parentID reference and childrenIDs array
    //   - Returns a Map<string, TPortfolioStateNode>

    // Step 2: State — useState<Map> initialized lazily from prepare: useState(() => prepare(data))
    //   - Get root node from store by data.id

    // Step 3: onNodeUpdate — onKeyDown handler (event delegation on container):
    //   - Only handle Enter key on HTMLInputElement
    //   - Read data-node-id from target.dataset, parse new value
    //   - Reject NaN values
    //   - Budget constraint (parent floor):
    //          - if node has children, reject if newValue < sum of children values
    //          - if node has parent, reject if newValue > parent.value - siblingsSum
    //   - On rejection, revert input: target.value = `${node.value}`
    //   - On success: create new Map(store), set updated node, setStore

    // Step 4: Render — container div with onKeyDown={onNodeUpdate}, render root PortfolioNode
    return <div className={cx(styles.w600px, styles.b4, styles.bgBlack1, styles.padding16)}>
        <PortfolioNode {...data} total={data.value}/>
    </div>
}
