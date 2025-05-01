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
): [picked: Accessor<Pick<T, K>>, rest: Accessor<Omit<T, K>>] {
  const set = new Set(keys)
  const omittedKeys = Object.keys(props)
    .filter(k => !set.has(k as any)) as Exclude<keyof T, K>[]

  return [
    createMemo(
      () => Object.fromEntries(keys.map(k => [k, (k in props ? props : defaults)[k]])) as Pick<T, K>,
    ),
    createMemo(
      () => Object.fromEntries(omittedKeys.map(k => [k, props[k]])) as Omit<T, K>,
    ),
  ]
}
