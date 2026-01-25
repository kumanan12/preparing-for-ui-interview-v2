import { describe, it, expect } from 'bun:test'
import { TableEngine } from '../table-engine'

describe('21.3 Google Sheet Engine', () => {
  describe('basic operations', () => {
    it('should set and get raw values', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', 'hello')

      expect(engine.getRaw('A1')).toBe('hello')
      expect(engine.getValue('A1')).toBe('hello')
    })

    it('should return empty string for unset cells', () => {
      const engine = new TableEngine()

      expect(engine.getRaw('A1')).toBe('')
      expect(engine.getValue('A1')).toBe('')
    })
  })

  describe('formula evaluation', () => {
    it('should evaluate simple formulas', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=1+2')

      expect(engine.getValue('A1')).toBe('3')
    })

    it('should evaluate formulas with cell references', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '10')
      engine.setRaw('B1', '=A1+5')

      expect(engine.getValue('B1')).toBe('15')
    })

    it('should handle complex formulas', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=2*3+4')

      expect(engine.getValue('A1')).toBe('10')
    })

    it('should handle parentheses', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=2*(3+4)')

      expect(engine.getValue('A1')).toBe('14')
    })

    it('should handle unary minus', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=-5')

      expect(engine.getValue('A1')).toBe('-5')
    })
  })

  describe('dependencies', () => {
    it('should update dependents when source changes', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '10')
      engine.setRaw('B1', '=A1*2')

      expect(engine.getValue('B1')).toBe('20')

      engine.setRaw('A1', '20')
      expect(engine.getValue('B1')).toBe('40')
    })

    it('should handle chain dependencies', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '5')
      engine.setRaw('B1', '=A1+1')
      engine.setRaw('C1', '=B1+1')

      expect(engine.getValue('C1')).toBe('7')

      engine.setRaw('A1', '10')
      expect(engine.getValue('B1')).toBe('11')
      expect(engine.getValue('C1')).toBe('12')
    })

    it('should return changed cells', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '10')
      engine.setRaw('B1', '=A1')

      const { changed } = engine.setRaw('A1', '20')
      expect(changed).toContain('A1')
      expect(changed).toContain('B1')
    })
  })

  describe('error handling', () => {
    it('should handle division by zero', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=1/0')

      expect(engine.getValue('A1')).toBe('#DIV/0!')
    })

    it('should detect cycles', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=B1')
      engine.setRaw('B1', '=A1')

      expect(engine.getValue('A1')).toBe('#CYCLE!')
      expect(engine.getValue('B1')).toBe('#CYCLE!')
    })

    it('should recover from cycles', () => {
      const engine = new TableEngine()
      engine.setRaw('A1', '=B1')
      engine.setRaw('B1', '=A1')

      expect(engine.getValue('A1')).toBe('#CYCLE!')

      engine.setRaw('B1', '10')
      expect(engine.getValue('A1')).toBe('10')
      expect(engine.getValue('B1')).toBe('10')
    })
  })
})
