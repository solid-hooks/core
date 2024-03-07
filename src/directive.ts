type DirectiveFunction<Args extends unknown[] = []> = (ref: globalThis.Element, ...args: Args) => void

/**
 * manually create directive
 */
export function createDirective<Args extends unknown[] = []>(fn: DirectiveFunction<Args>) {
  return (...args: Args) => (el: globalThis.Element) => fn(el, ...args)
}
