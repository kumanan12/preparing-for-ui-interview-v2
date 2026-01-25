import { describe, it, expect } from 'bun:test'
import { tokenize, toRpn, isCellReference, type Token } from '../parser'

describe('21.1 Google Sheet Parser', () => {
  describe('isCellReference', () => {
    it('should return true for valid cell references', () => {
      expect(isCellReference('A1')).toBe(true)
      expect(isCellReference('Z99')).toBe(true)
      expect(isCellReference('B10')).toBe(true)
    })

    it('should return false for invalid cell references', () => {
      expect(isCellReference('1A')).toBe(false)
      expect(isCellReference('A')).toBe(false)
      expect(isCellReference('1')).toBe(false)
      expect(isCellReference('small')).toBe(false)
      expect(isCellReference('AA1')).toBe(false)
    })
  })

  describe('tokenize', () => {
    it('should tokenize simple numbers', () => {
      expect(tokenize('123')).toEqual({ ok: true, tokens: [{ t: 'num', v: 123 }] })
      expect(tokenize('12.34')).toEqual({ ok: true, tokens: [{ t: 'num', v: 12.34 }] })
    })

    it('should tokenize binary operators', () => {
      expect(tokenize('1 + 2 - 3 * 4 / 5')).toEqual({
        ok: true,
        tokens: [
          { t: 'num', v: 1 },
          { t: 'op', op: '+' },
          { t: 'num', v: 2 },
          { t: 'op', op: '-' },
          { t: 'num', v: 3 },
          { t: 'op', op: '*' },
          { t: 'num', v: 4 },
          { t: 'op', op: '/' },
          { t: 'num', v: 5 },
        ],
      })
    })

    it('should tokenize parentheses', () => {
      expect(tokenize('( )')).toEqual({
        ok: true,
        tokens: [{ t: 'lp' }, { t: 'rp' }],
      })
    })

    it('should tokenize cell references', () => {
      expect(tokenize('A1 B2')).toEqual({
        ok: true,
        tokens: [
          { t: 'ref', id: 'A1' },
          { t: 'ref', id: 'B2' },
        ],
      })
    })

    it('should handle unary minus', () => {
      expect(tokenize('-1')).toEqual({
        ok: true,
        tokens: [
          { t: 'op', op: 'NEG' },
          { t: 'num', v: 1 },
        ],
      })
      expect(tokenize('1+-1')).toEqual({
        ok: true,
        tokens: [
          { t: 'num', v: 1 },
          { t: 'op', op: '+' },
          { t: 'op', op: 'NEG' },
          { t: 'num', v: 1 },
        ],
      })
      expect(tokenize('(-1)')).toEqual({
        ok: true,
        tokens: [{ t: 'lp' }, { t: 'op', op: 'NEG' }, { t: 'num', v: 1 }, { t: 'rp' }],
      })
    })

    it('should return error for invalid characters', () => {
      const result = tokenize('1 @ 2')
      expect(result.ok).toBe(false)
    })
  })

  describe('toRpn', () => {
    it('should convert infix to RPN correctly', () => {
      const t = tokenize('1 + 2') as { ok: true; tokens: Token[] }
      const r = toRpn(t.tokens)
      expect((r as { ok: true; rpn: Token[] }).rpn).toEqual([
        { t: 'num', v: 1 },
        { t: 'num', v: 2 },
        { t: 'op', op: '+' },
      ])
    })

    it('should respect operator precedence', () => {
      const t = tokenize('1 + 2 * 3') as { ok: true; tokens: Token[] }
      const r = toRpn(t.tokens)
      const ops = (r as { ok: true; rpn: Token[] }).rpn.map((x) =>
        'v' in x ? x.v : 'op' in x ? x.op : '?',
      )
      expect(ops).toEqual([1, 2, 3, '*', '+'])
    })

    it('should handle parentheses', () => {
      const t = tokenize('(1 + 2) * 3') as { ok: true; tokens: Token[] }
      const r = toRpn(t.tokens)
      const ops = (r as { ok: true; rpn: Token[] }).rpn.map((x) =>
        'v' in x ? x.v : 'op' in x ? x.op : '?',
      )
      expect(ops).toEqual([1, 2, '+', 3, '*'])
    })

    it('should detect mismatched parentheses', () => {
      const t = tokenize('(1 + 2') as { ok: true; tokens: Token[] }
      const r = toRpn(t.tokens)
      expect(r.ok).toBe(false)
    })
  })
})
