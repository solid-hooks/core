import type { AnyFunction } from '@solid-primitives/utils'
import type { Accessor, Setter, Signal, SignalOptions } from 'solid-js'

import { createSignal } from 'solid-js'

export type RefSignal<T, Set = Setter<T>> = Accessor<T> & Set

/**
 * read / write signal in one function
 * @example
 * ```tsx
 * import { onMounted } from 'solid-js'
 * import { createRef } from '@solid-hooks/core'
 *
 * function Test() {
 *   const divRef = createRef<HTMLDivElement>()
 *   return <div ref={divRef} />
 * }
 * ```
 */
export function createRef<T>(): RefSignal<T | undefined>
/**
 * read / write signal in one function with existing signal
 * @param existSignal existing signal
 * @example
 * ```tsx
 * import { createRef } from '@solid-hooks/core'
 *
 * function useSomethingRef() {
 *   return createRef(useSomething())
 * }
 * ```
 */
export function createRef<T, Set extends AnyFunction = Setter<T>>(existSignal: [Accessor<T>, Set]): RefSignal<T, Set>
/**
 * read / write signal in one function with initial value
 * @param initialValue initial value
 * @param options signal options
 * ```tsx
 * import { onMounted } from 'solid-js'
 * import { createRef } from '@solid-hooks/core'
 *
 * function Counter() {
 *   const counter = createRef(0)
 *   return <button onClick={() => counter(c => c + 1)}>{counter()}</button>
 * }
 * ```
 */
export function createRef<T>(initialValue: T, options?: SignalOptions<T>): RefSignal<T>
export function createRef<T>(initialValue?: any, options?: SignalOptions<T | undefined>): RefSignal<T> {
  const [value, setValue] = Array.isArray(initialValue) && typeof initialValue[0] === 'function'
    ? initialValue as Signal<T>
    : createSignal(initialValue, options)
  // @ts-expect-error setup
  return (...args) => args.length > 0 ? setValue(...args) : value()
}
