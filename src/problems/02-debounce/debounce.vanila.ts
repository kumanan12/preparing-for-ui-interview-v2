// bun test src/problems/02-debounce/test/debounce.test.ts

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}


// --- Examples ---
// Uncomment to test your implementation:

const log = debounce((msg: string) => console.log(msg), 300)
log('a')  // cancelled by next call
log('b')  // cancelled by next call
log('c')  // only this one fires after 300ms → "c"
