import { type Path, type PathValue, pathGet, pathSet } from 'object-path-access'
import type { Signal, SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

type ReactiveOptions<T extends object, P extends Path<T>> = SignalOptions<PathValue<T, P>> & {
  /**
   * custom setter to set original property to new value, useful for handle readonly properties
   * @param source source data
   * @param newValue new value
   * @returns if return value, it will be used to check equal, if return nothing, it will always to update
   */
  setter?: (
    source: T,
    newValue: PathValue<T, P>,
  ) => PathValue<T, P> | void
}

/**
 * make plain object props reactive
 * @param data source object
 * @param path object access path, support array access
 * @param options signal options
 * @example
 * ```ts
 * import { createReactive } from '@solid-hooks/core'
 *
 * const audio = new Audio()
 * const [time, setCurrentTime] = createReactive(audio, 'currentTime')
 * ```
 */
export function createReactive<
  T extends object,
  P extends Path<T>,
>(
  data: T,
  path: P,
  options?: ReactiveOptions<T, P>,
): Signal<PathValue<T, P>> {
  const { equals, setter, ...rest } = options || {}
  const [track, trigger] = createSignal(undefined, { ...rest, equals: false })
  const get = () => pathGet(data, path)

  const _equals = typeof equals === 'function'
    ? (result: any) => equals(get(), result)
    : equals === undefined
      ? (result: any) => get() === result
      : () => equals

  const _setter = setter
    ? (newValue: any) => setter(data, newValue)
    : (newValue: any) => pathSet(data, path, newValue)
  return [
    () => {
      track()
      return get()
    },
    (arg) => {
      const newValue = typeof arg === 'function' ? arg(get()) : arg
      if (!_equals(newValue)) {
        _setter(newValue)
        trigger()
      }
      return newValue
    },
  ] as Signal<PathValue<T, P>>
}
