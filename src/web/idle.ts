import { tryOnCleanup } from '@solid-primitives/utils'

const runIdleWithFallback = window.requestIdleCallback || ((handler) => {
  let startTime = Date.now()

  return setTimeout(() => handler({
    didTimeout: false,
    timeRemaining() {
      return Math.max(0, 50.0 - (Date.now() - startTime))
    },
  }), 1)
})

const cancelIdleWithFallback = window.cancelIdleCallback || (id => clearTimeout(id))

/**
 * executes a callback using the {@link requestIdleCallback} API, fallback to {@link setTimeout}.
 *
 * auto cleanup, return cleanup function
 * @param fn callback function.
 * @param options original IdleRequestOptions.
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Background_Tasks_API
 */
export function useIdleCallback(
  fn: () => void,
  options?: IdleRequestOptions,
): VoidFunction {
  const id = runIdleWithFallback(fn, options)
  return tryOnCleanup(() => cancelIdleWithFallback(id))
}
