import { tryOnCleanup } from '@solid-primitives/utils'
import { type Accessor, createSignal } from 'solid-js'

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
  fn: IdleRequestCallback,
  options?: IdleRequestOptions,
): { running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction } {
  const [running, setRunning] = createSignal(false)
  let requestID: number

  const loop: IdleRequestCallback = (deadline) => {
    requestID = runIdleWithFallback(loop)
    fn(deadline)
  }

  const start = (): void => {
    if (running()) {
      return
    }
    setRunning(true)
    requestID = runIdleWithFallback(loop, options)
  }

  const stop = tryOnCleanup(() => {
    setRunning(false)
    cancelIdleWithFallback(requestID)
  })

  return { running, start, stop }
}
