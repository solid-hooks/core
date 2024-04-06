import type { Accessor, Setter } from 'solid-js'

/**
 * add setter callback
 * @param signal signal
 * @param fn effect function
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
