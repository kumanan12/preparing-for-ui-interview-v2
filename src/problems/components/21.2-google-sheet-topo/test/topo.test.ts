import { describe, it, expect } from 'bun:test'
import { affectedFrom, topoSort } from '../topo'

describe('21.2 Google Sheet Topo', () => {
  // Helper to create a simple graph
  const createGraph = (edges: Record<string, string[]>) => {
    const deps = new Map<string, Set<string>>()
    const revDeps = new Map<string, Set<string>>()

    for (const [node, dependencies] of Object.entries(edges)) {
      deps.set(node, new Set(dependencies))
      for (const dep of dependencies) {
        if (!revDeps.has(dep)) revDeps.set(dep, new Set())
        revDeps.get(dep)!.add(node)
      }
    }

    return {
      getDeps: (id: string) => deps.get(id) ?? new Set(),
      getRevDeps: (id: string) => revDeps.get(id) ?? new Set(),
    }
  }

  describe('affectedFrom', () => {
    it('should find all affected nodes in a linear chain', () => {
      // A -> B -> C (A depends on nothing, B depends on A, C depends on B)
      const { getRevDeps } = createGraph({ B: ['A'], C: ['B'] })

      const affected = affectedFrom('A', getRevDeps)
      expect(affected).toEqual(new Set(['A', 'B', 'C']))
    })

    it('should handle diamond dependencies', () => {
      // A -> B, A -> C, B -> D, C -> D
      const { getRevDeps } = createGraph({ B: ['A'], C: ['A'], D: ['B', 'C'] })

      const affected = affectedFrom('A', getRevDeps)
      expect(affected).toEqual(new Set(['A', 'B', 'C', 'D']))
    })

    it('should handle isolated nodes', () => {
      const { getRevDeps } = createGraph({ B: ['A'] })

      const affected = affectedFrom('X', getRevDeps)
      expect(affected).toEqual(new Set(['X']))
    })
  })

  describe('topoSort', () => {
    it('should sort linear chain correctly', () => {
      const { getDeps, getRevDeps } = createGraph({ B: ['A'], C: ['B'] })
      const affected = new Set(['A', 'B', 'C'])

      const { order, cyclic } = topoSort(affected, getDeps, getRevDeps)

      expect(order).toEqual(['A', 'B', 'C'])
      expect(cyclic.size).toBe(0)
    })

    it('should sort diamond correctly', () => {
      const { getDeps, getRevDeps } = createGraph({ B: ['A'], C: ['A'], D: ['B', 'C'] })
      const affected = new Set(['A', 'B', 'C', 'D'])

      const { order, cyclic } = topoSort(affected, getDeps, getRevDeps)

      expect(order[0]).toBe('A')
      expect(order[order.length - 1]).toBe('D')
      expect(cyclic.size).toBe(0)
    })

    it('should detect cycles', () => {
      // A -> B -> C -> A (cycle)
      const { getDeps, getRevDeps } = createGraph({ A: ['C'], B: ['A'], C: ['B'] })
      const affected = new Set(['A', 'B', 'C'])

      const { order, cyclic } = topoSort(affected, getDeps, getRevDeps)

      expect(order.length).toBe(0)
      expect(cyclic).toEqual(new Set(['A', 'B', 'C']))
    })

    it('should handle partial cycles', () => {
      // A -> B -> C -> B (cycle), D depends on A
      const { getDeps, getRevDeps } = createGraph({ B: ['A', 'C'], C: ['B'], D: ['A'] })
      const affected = new Set(['A', 'B', 'C', 'D'])

      const { order, cyclic } = topoSort(affected, getDeps, getRevDeps)

      expect(order).toContain('A')
      expect(order).toContain('D')
      expect(cyclic).toEqual(new Set(['B', 'C']))
    })
  })
})
