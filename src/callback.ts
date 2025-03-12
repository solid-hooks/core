import type { AnyFunction } from '@subframe7536/type-utils'
import type { Owner } from 'solid-js'

import { getOwner, runWithOwner } from 'solid-js'

/**
 * create callback with `runWithOwner`, auto get current owner
 * @param callback callback function
 * @param owner owner that run with
 * @example
 * ```ts
 * import { useCallback } from '@solid-hooks/core'
 *
 * const handleClick = useCallback(() => {
 *   console.log('after 100 ms!')
 * })
 * setTimeOut(handleClick, 100)
 * ```
 */
export function useCallback<T extends AnyFunction>(
  callback: T,
  owner: Owner | null = getOwner(),
): T {
  return owner
    ? ((...args) => runWithOwner(owner, () => callback(...args))) as T
    : callback
}
