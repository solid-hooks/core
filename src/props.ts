import type { MakePropOptional, Prettify, RemoveNeverProps } from '@subframe7536/type-utils'
import type { Accessor } from 'solid-js'

import { createMemo } from 'solid-js'

type WithDefaults<T, P extends keyof T> = Omit<T, P> & {
  [K in P]-?: NonNullable<T[K]>
}

type UsePropsReturn<T extends Record<any, any>, K extends keyof T> = [
  pick: { [Key in K]: Accessor<T[Key]> },
  rest: { [Key in keyof Omit<T, K>]: Accessor<T[Key]> },
]

export function useProps<T extends Record<any, any>, K extends keyof T>(
  props: T,
  keys: K[],
): UsePropsReturn<T, K>
export function useProps<T extends Record<any, any>, K extends keyof T, D extends Partial<T>>(
  props: T,
  keys: K[],
  defaults: D,
): UsePropsReturn<WithDefaults<T, keyof D>, K>
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
export function useProps<T extends Record<any, any>, K extends keyof T>(
  props: T,
  keys: K[],
  defaults?: Partial<T>,
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

type NullableKeys<T> = keyof RemoveNeverProps<{
  [K in keyof T]: null extends T[K] ? true : undefined extends T[K] ? K : never;
}>

type AccessPropsReturn<T extends Record<any, Accessor<any>>> = {
  [K in keyof T]: ReturnType<T[K]>
} extends infer U
  ? Prettify<MakePropOptional<U, NullableKeys<U>>>
  : never

export function accessProps<T extends Record<any, Accessor<any>>>(
  parsedProps: T,
): AccessPropsReturn<T> {
  return Object.fromEntries(Object.entries(parsedProps).map(([k, v]) => [k, v()])) as any
}
