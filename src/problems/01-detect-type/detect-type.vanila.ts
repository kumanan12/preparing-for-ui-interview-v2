// bun test src/problems/01-detect-type/test/detect-type.test.ts

export type TType =
  | 'null'
  | 'undefined'
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'bigint'
  | 'object'
  | 'array'
  | 'function'
  | 'date'
  | 'regexp'
  | 'map'
  | 'set'
  | 'weakmap'
  | 'weakset'
  | 'error'
  | 'promise'
  | 'arraybuffer'
  | string

export const detectType = (value: any): TType => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (value instanceof Date) return 'date'
    if (value instanceof Map) return 'map'
    if (value instanceof Set) return 'set'
    if (value instanceof RegExp) return 'regexp'
    if (value instanceof WeakMap) return 'weakmap'
    if (value instanceof WeakSet) return 'weakset'
    if (value instanceof Error) return 'error'
    if (value instanceof Promise) return 'promise'
    if (value instanceof ArrayBuffer) return 'arraybuffer'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'symbol') return 'symbol'
    if (typeof value === 'bigint') return 'bigint'
    if (typeof value === 'function') return 'function'
    if (typeof value === 'object') return 'object'
    return typeof value;
}

// --- Examples ---
// Uncomment to test your implementation:

console.log(detectType(null))        // Expected: "null"
console.log(detectType(undefined))   // Expected: "undefined"
console.log(detectType(42))          // Expected: "number"
console.log(detectType('hello'))     // Expected: "string"
console.log(detectType(true))        // Expected: "boolean"
console.log(detectType([]))          // Expected: "array"
console.log(detectType({}))          // Expected: "object"
console.log(detectType(new Date()))  // Expected: "date"
console.log(detectType(new Map()))   // Expected: "map"
console.log(detectType(new Set()))   // Expected: "set"
console.log(detectType(/regex/))     // Expected: "regexp"
