import type { Accessor, Setter } from 'solid-js'

/**
 * add callback for setter
 * @param signal signal
 * @param fn effect function
 * @example
 * ```tsx
 * import { createSignal } from 'solid-js'
 * import { withEffect } from '@solid-hooks/core'
 *
 * export function TestWithEffect() {
 *   // eslint-disable-next-line solid/reactivity
 *   const [count, setCount] = withEffect(createSignal(1), value => console.log('[withEffect] value:', value))
 *   return (
 *     <>
 *       <h1>Test <code>withEffect</code> :</h1>
 *       <button onClick={() => setCount(c => c + 1)}>click and see console</button>
 *       <div>count: {count()}</div>
 *     </>
 *   )
 * }
 * ```
 */
export function withEffect<T>(
  signal: [Accessor<T>, Setter<T>],
  fn: (newValue: T) => void,
): [Accessor<T>, Setter<T>] {
  const [val, setVal] = signal
  return [
    val,
    (args: any) => {
      const newValue = setVal(args)
      fn(newValue)
      return newValue
    },
  ] as [Accessor<T>, Setter<T>]
}
