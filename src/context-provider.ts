import { DEV, createComponent, createContext, useContext } from 'solid-js'
import type { Accessor, FlowProps, JSXElement } from 'solid-js'

export type ContextProvider<T, Props extends Record<string, unknown> = {}> = [
  Provider: (props: FlowProps<Props>) => JSXElement,
  useContext: Accessor<T>,
]

/**
 * create Provider and useContext,
 * if call useContext outside Provider, return `undefined` when DEV
 *
 * @param setup setup context function
 * ```ts
 * import { createContextProvider } from '@solid-hooks/core'
 *
 * const [DateProvider, useDateContext] = createContextProvider(() => new Date())
 * ```
 */
export function createContextProvider<T, Props extends Record<string, unknown>>(
  setup: (props: Props) => T,
): ContextProvider<T, Props>
/**
 * create Provider and useContext with initial value
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
    DEV
      ? () => {
          const _ctx = useContext(ctx)
          if (_ctx === undefined) {
            console.error(`Provider is not set in component tree!`)
            return undefined as any
          }
          return _ctx
        }
      : () => useContext(ctx)!,
  ]
}
