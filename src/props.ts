import type { Accessor } from 'solid-js'

import { createMemo } from 'solid-js'

export function useProps<T extends object, K extends keyof T>(
  p: T,
  keys: K[],
  defaults?: Partial<Pick<T, K>>,
): [Accessor<Pick<T, K>>, Accessor<Omit<T, K>>] {
  const set = new Set(keys)
  const omittedKeys = Object.keys(p)
    .filter(k => !set.has(k as any)) as Exclude<keyof T, K>[]

  return [
    createMemo(
      () => Object.fromEntries(keys.map(k => [k, p[k] ?? defaults?.[k]])) as Pick<T, K>,
    ),
    createMemo(
      () => Object.fromEntries(omittedKeys.map(k => [k, p[k]])) as Omit<T, K>,
    ),
  ]
}
