import { type Path, type PathValue, pathGet, pathSet } from 'object-path-access'
import type { Signal, SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'
import type { AnyFunction } from '@subframe7536/type-utils'

/**
 * make plain object props reactive
 * @param data source object
 * @param path object access path, support array access
 * @param options signal options
 * @example
 * ```ts
 * import { createRefSignal } from '@solid-hooks/hooks'
 *
 * const audio = new Audio()
 * const [time, setCurrentTime] = createRefSignal(audio, 'currentTime')
 * ```
 */
export function createRefSignal<T extends object, P extends Path<T>>(
  data: T,
  path: P,
  options: SignalOptions<PathValue<T, P>> = {},
): Signal<PathValue<T, P>> {
  const { equals, ...rest } = options
  const [track, trigger] = createSignal(undefined, { ...rest, equals: false })
  const get = () => pathGet(data, path)

  const _equals = typeof equals === 'function'
    ? (result: any) => equals(get(), result)
    : equals === undefined
      ? (result: any) => get() === result
      : () => equals

  return [
    () => {
      track()
      return get()
    },
    (arg?) => {
      const result = typeof arg === 'function'
        ? (arg as AnyFunction)(get())
        : arg
      if (!_equals(result)) {
        pathSet(data, path, result)
        trigger()
      }
      return result
    },
  ]
}
