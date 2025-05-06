import type { Accessor } from 'solid-js'

import { createMemo } from 'solid-js'

type DefaultValues<T> = {
  [K in keyof T as (null extends T[K] ? K : never) | (undefined extends T[K] ? K : never)]-?: Exclude<T[K], null | undefined>;
}

type ParseProps<T> = {
  [Key in keyof T]-?: Exclude<T[Key], null | undefined>
}

type UsePropsReturn<T extends Record<string, unknown>, K extends keyof T> = [
  pick: { [Key in K]: Accessor<T[Key]> },
  rest: { [Key in keyof Omit<T, K>]: Accessor<T[Key]> },
]

export function useProps<T extends Record<string, unknown>, K extends keyof T>(
  props: T,
  keys: K[],
): UsePropsReturn<T, K>
export function useProps<T extends Record<string, unknown>, K extends keyof T, D extends DefaultValues<T>>(
  props: T,
  keys: K[],
  defaults: D,
): UsePropsReturn<ParseProps<T>, K>
/**
 * Splits props object into two parts based on given keys.
 * @param props - The original props object to split
 * @param keys - Array of keys to pick from props
 * @param defaults - Optional default values for picked props
 *
 * @example
 * ```ts
 * import { accessProps, useProps } from '@solid-hooks/core'
 *
 * function TestComponent(props: { name: string, age: number, role?: 'admin' | 'user' }) {
 *   const [picked, rest] = useProps(props, ['name', 'age'], { role: 'user' })
 *   picked.name() // 'John'
 *   rest.role() // 'user'
 *   accessProps(picked) // { name: 'John', age: 18 }
 * }
 * ```
 */
export function useProps<T extends Record<string, unknown>, K extends keyof T>(
  props: T,
  keys: K[],
  defaults?: DefaultValues<T>,
): any {
  const pick = {}
  const rest = {}
  const set = new Set(keys)
  for (const key of new Set(Object.keys({ ...props, ...defaults }))) {
    // @ts-expect-error fxxk
    (set.has(key) ? pick : rest)[key] = createMemo(() => props[key] ?? defaults[key])
  }
  return [pick, rest]
}

export function accessProps<T extends Record<string, Accessor<unknown>>>(
  parsedProps: T,
): { [K in keyof T]: ReturnType<T[K]> } {
  return Object.fromEntries(Object.entries(parsedProps).map(([k, v]) => [k, v()])) as any
}
