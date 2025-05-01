import type { Accessor } from 'solid-js'

import { createSignal } from 'solid-js'

export type ArraySignal<T extends Array<unknown>> = [
  accessor: Accessor<T>,
  setter: {
    (patcher: (data: T) => void): T
    (patcher: T): T
  },
]

/**
 * Create array signal
 * @param initialValue initial value
 * @example
 *  ```ts
 * import { createArray } from '@solid-hooks/core'
 *
 * const [array, setArray] = createArray(['a', 'b', 'c'])
 *
 * const push = setArray(l => l.push('d'))
 * const pop = setArray(l => l.pop())
 * const reset = setArray(['a', 'b', 'c'])
 * ```
 */
export function createArray<T extends Array<unknown>>(initialValue?: T): ArraySignal<T> {
  const [value, setValue] = createSignal(initialValue ?? [] as unknown as T)

  return [
    value,
    patcher => setValue((data) => {
      if (Array.isArray(patcher)) {
        return patcher
      }
      let _data = [...data] as T
      patcher(_data)
      return _data
    }),
  ]
}
