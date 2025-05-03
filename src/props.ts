import type { Accessor } from 'solid-js'

import { createMemo } from 'solid-js'

/**
 * Splits props object into two parts based on given keys.
 * @param props - The original props object to split
 * @param keys - Array of keys to pick from props
 * @param defaults - Optional default values for picked props
 *
 * @example
 * ```ts
 * function TestComponent(props: { name: string, age: number, role?: 'admin' | 'user' }) {
 *   const [picked, rest] = useProps(props, ['name', 'age'], { role: 'user' });
 *   // picked() -> { name: 'John', age: 30 }
 *   // rest() -> { role: 'user' }
 * }
 * ```
 */
export function useProps<T extends object, K extends keyof T>(
  props: T,
  keys: K[],
  defaults: Partial<Pick<T, K>> = {},
): [pick: Accessor<Pick<T, K>>, rest: Accessor<Omit<T, K>>] {
  const pick: Pick<T, K> = {} as Pick<T, K>
  const rest: Omit<T, K> = {} as Omit<T, K>
  const set = new Set(keys)
  for (const key of keys) {
    const memo = createMemo(() => (/* console.log(key), */ props[key] ?? defaults[key]))
    Object.defineProperty(
      set.has(key) ? pick : rest,
      key,
      { get: memo, enumerable: true },
    )
  }
  return [() => pick, () => rest]
}
