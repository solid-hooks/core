import type { Accessor, FlowProps, JSXElement } from 'solid-js'

import { isDev } from '@solid-primitives/utils'
import { createComponent, createContext, useContext } from 'solid-js'

export type ContextProvider<T, Props extends Record<string, unknown> = {}> = [
  Provider: (props: FlowProps<Props>) => JSXElement,
  useContext: Accessor<T>,
]

/**
 * Create Provider and useContext,
 * if call useContext outside Provider, throw `Error` when DEV
 *
 * @param setup setup context function
 * @example
 * ```tsx
 * import { createSignal } from 'solid-js'
 * import { createContextProvider } from '@solid-hooks/core'
 *
 * export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
 *   const [count, setCount] = createSignal(param.initial)
 *   const increment = () => setCount(count() + 1)
 *
 *   return { count, increment }
 * })
 *
 * function Child() {
 *   const { count, increment } = useTestContext()
 *   return (
 *     <button onClick={increment}>
 *       {count()}
 *     </button>
 *   )
 * }
 *
 * export function TestContextProvider() {
 *   console.log('call useTestContext() outside provider:', useTestContext())
 *   return (
 *     <TestProvider initial={0}>
 *       <Child />
 *     </TestProvider>
 *   )
 * }
 * ```
 */
export function createContextProvider<T, Props extends Record<string, unknown>>(
  setup: (props: Props) => T,
): ContextProvider<T, Props>
/**
 * Create Provider and useContext with initial value
 *
 * @param setup setup context function
 * @param initialValue fallback value when context is not provided
 * @example
 * ```ts
 * import { createContextProvider } from '@solid-hooks/core'
 *
 * const [DateProvider, useDateContext] = createContextProvider(
 *   (args: { date: string }) => new Date(args.date),
 *   new Date()
 * )
 * ```
 */
export function createContextProvider<T, Props extends Record<string, unknown>>(
  setup: (props: Props) => T,
  initialValue: T,
): ContextProvider<T, Props>
export function createContextProvider<T, Props extends Record<string, unknown>>(
  fn: (props?: Props) => T,
  initialValue?: T,
): ContextProvider<T, Props> {
  const ctx = createContext(initialValue)
  return [
    (props: FlowProps<Props>) => createComponent(ctx.Provider, {
      value: fn(props),
      get children() {
        return props.children
      },
    }),
    isDev
      ? () => {
          const _ctx = useContext(ctx)
          if (_ctx === undefined) {
            console.warn('<Provider /> does not exists in component tree!')
            throw new Error('<Provider /> does not exists in component tree!')
          }
          return _ctx
        }
      : () => useContext(ctx)!,
  ]
}
