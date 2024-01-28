const _promise = Promise.resolve()
/**
 * Vue-like next tick
 */
export function useTick<T = void>(this: T, fn?: (this: T) => void): Promise<void> {
  return _promise.then(this ? fn?.bind(this) : fn)
}
