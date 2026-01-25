/**
 * Collects all nodes transitively affected by a change starting from `start`.
 * Uses reverse dependencies to find dependent nodes.
 */
export function affectedFrom<T>(start: T, getRevDeps: (id: T) => Iterable<T>): Set<T> {
  const affected = new Set<T>()
  const queue: T[] = [start]

  for (let i = 0; i < queue.length; i++) {
    const id = queue[i]!
    if (affected.has(id)) continue
    affected.add(id)
    for (const dep of getRevDeps(id)) queue.push(dep)
  }

  return affected
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns ordered nodes and any cyclic nodes that couldn't be ordered.
 */
export function topoSort<T>(
  affected: Set<T>,
  getDeps: (id: T) => Iterable<T>,
  getRevDeps: (id: T) => Iterable<T>,
): { order: T[]; cyclic: Set<T> } {
  const inDegree = new Map<T, number>()

  // Calculate in-degrees within the affected set
  for (const id of affected) {
    let deg = 0
    for (const dep of getDeps(id)) {
      if (affected.has(dep)) deg++
    }
    inDegree.set(id, deg)
  }

  // Start with nodes that have no dependencies
  const queue: T[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const order: T[] = []
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i]!
    order.push(id)

    // Decrease in-degree for dependents
    for (const dependent of getRevDeps(id)) {
      if (!affected.has(dependent)) continue
      const next = (inDegree.get(dependent) ?? 0) - 1
      inDegree.set(dependent, next)
      if (next === 0) queue.push(dependent)
    }
  }

  // Any remaining nodes are cyclic
  const cyclic = new Set<T>()
  if (order.length !== affected.size) {
    const inOrder = new Set(order)
    for (const id of affected) {
      if (!inOrder.has(id)) cyclic.add(id)
    }
  }

  return { order, cyclic }
}
