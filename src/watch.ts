import type { Prettify } from '@subframe7536/type-utils'
import type { Accessor, AccessorArray, EffectOptions, OnOptions } from 'solid-js'

import {

  batch,
  createComputed,
  createEffect,
  createReaction,
  createRenderEffect,
  createSignal,

  onCleanup,

  untrack,
} from 'solid-js'

export interface WatchOptions extends Prettify<
  Omit<BaseWatchOptions, 'effectFn'> & {
    /**
     * {@link OnOptions}
     * @default true
     */
    defer?: boolean
  }
> {}
export type Cleanupable = void | VoidFunction

/**
 * @param value current value
 * @param oldValue previous value
 */
export type WatchOnceCallback<S> = (
  value: S,
  oldValue: S | undefined
) => Cleanupable

/**
 * @param value current value
 * @param oldValue previous value
 * @param callTimes watcher triggered times
 */
export type WatchCallback<S> = (
  value: S,
  oldValue: S | undefined,
  callTimes: number
) => Cleanupable

interface BaseWatchOptions extends OnOptions {
  /**
   * function for filter watcher, like `debounce`, `throttle`, etc.
   * @param fn watcher
   */
  eventFilter?: <Args extends unknown[]>(fn: (...args: Args) => void) => {
    (...args: Args): void
    clear?: VoidFunction
  }
  /**
   * trigger max times
   */
  count?: number
}

interface WatchReturn {
  /**
   * pause watch
   */
  pause: VoidFunction
  /**
   * resume watch
   */
  resume: VoidFunction
  /**
   * watch status
   */
  isWatching: Accessor<boolean>
  /**
   * call times
   */
  callTimes: Accessor<number>
  /**
   * run function without effects
   * @param updater update function
   */
  ignoreUpdate: (updater: VoidFunction) => void
}

function baseWatch<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: BaseWatchOptions = {},
  effectFn: typeof createEffect | typeof createComputed | typeof createRenderEffect,
): WatchReturn {
  const [isWatching, setIsWatching] = createSignal(true)
  const [callTimes, setCallTimes] = createSignal(0)
  const isArray = Array.isArray(deps)
  let oldValue: T
  let { defer = true, eventFilter, count = -1 } = options

  const _fn = (_value: T, _oldValue: T | undefined): Cleanupable => {
    const times = setCallTimes(time => ++time)
    const result = fn(_value, _oldValue, times)
    oldValue = _value
    return result
  }
  const run = eventFilter ? eventFilter(_fn) : _fn
  effectFn(() => {
    const value = isArray ? deps.map(dep => dep()) as T : deps()
    if (defer) {
      defer = false
      return
    }
    if (untrack(() => !isWatching() || (count > -1 && callTimes() >= count))) {
      return
    }
    const cleanup = run(value, oldValue)
    if (cleanup) {
      onCleanup(cleanup)
    }
  })

  return {
    pause: () => setIsWatching(false),
    resume: () => setIsWatching(true),
    isWatching,
    callTimes,
    ignoreUpdate: (updater: VoidFunction) => {
      setIsWatching(false)
      batch(updater)
      setIsWatching(true)
    },
  }
}

/**
 * Filterable and pausable wrapper for {@link createEffect}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 * @example
 * ```ts
 * import { throttle } from '@solid-primitives/scheduled'
 * import { watch } from '@solid-hooks/core'
 *
 * const [count, setCount] = createSignal(0)
 * const { pause, resume, isWatching, callTimes, ignoreUpdate } = watch(
 *   count,
 *   (value, oldValue, callTimes) => {
 *     console.log(value, oldValue, callTimes)
 *     const cleanup = () => { }
 *     return cleanup
 *   },
 *   {
 *     eventFilter: fn => throttle(fn, 100),
 *     count: 5,
 *     defer: false // true by default
 *   }
 * )
 * ```
 */
export function watch<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions = {},
): WatchReturn {
  return baseWatch(deps, fn, options, createEffect)
}

/**
 * Filterable and pausable wrapper for {@link createComputed}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 */
export function watchImmediate<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions = {},
): WatchReturn {
  return baseWatch(deps, fn, options, createComputed)
}

/**
 * Filterable and pausable wrapper for {@link createRenderEffect}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 */
export function watchRendered<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions = {},
): WatchReturn {
  return baseWatch(deps, fn, options, createRenderEffect)
}

/**
 * Wrapper for {@link createReaction}
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchOnceCallback callback function}
 * @param options watch options
 */
export function watchOnce<T>(deps: Accessor<T>, fn: WatchOnceCallback<T>, options?: EffectOptions): void {
  const old = deps()
  return createReaction(() => fn(deps(), old), options)(deps)
}
