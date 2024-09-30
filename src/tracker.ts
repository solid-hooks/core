import type { Signal, SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

type TrackerOptions<T extends object, K extends keyof T> = SignalOptions<T[K]> & {
  /**
   * custom setter to set original property to new value, useful for handle readonly properties
   * @param source source data
   * @param newValue new value
   * @returns if return value, it will be used to check equal, if return nothing, it will always to update
   */
  setter?: (source: T, newValue: T[K]) => T[K] | void
}

/**
 * Track plain object property, make it reactive
 * @param data source object
 * @param key object key
 * @param options signal options
 * @example
 * ```ts
 * import { createTracker } from '@solid-hooks/core'
 *
 * const audio = new Audio()
 * const [time, setCurrentTime] = createTracker(audio, 'currentTime')
 * ```
 */
export function createTracker<T extends object, K extends keyof T>(
  data: T,
  key: K,
  options?: TrackerOptions<T, K>,
): Signal<T[K]> {
  const { equals, setter, ...rest } = options || {}
  const [track, trigger] = createSignal(undefined, { ...rest, equals: false })
  const get = (): any => data[key]

  const _equals = typeof equals === 'function'
    ? (result: any) => equals(get(), result)
    : equals === undefined
      ? (result: any) => get() === result
      : () => equals

  const _setter = setter
    ? (newValue: any) => setter(data, newValue)
    : (newValue: any) => data[key] = newValue
  return [
    () => {
      track()
      return get()
    },
    (arg: any) => {
      const newValue = typeof arg === 'function' ? arg(get()) : arg
      if (!_equals(newValue)) {
        _setter(newValue)
        trigger()
      }
      return newValue
    },
  ] as Signal<T[K]>
}

/**
 * @deprecated Use {@link createTracker} instead
 */
export const createReactive = createTracker
