import { DEV, createComponent, createContext, useContext } from 'solid-js'
import type { Accessor, FlowProps, JSXElement } from 'solid-js'

export type ContextProvider<
  T,
  Props extends Record<string, unknown> = {},
> = [
  Provider: (props: FlowProps<Props>) => JSXElement,
  useContext: Accessor<T>,
]

/**
 * create Provider and useContext,
 * if call useContext outside Provider, throw error when DEV
 *
 * @param setup setup context function
 */
export function createContextProvider<T, Props extends Record<string, unknown>>(
  setup: (props?: Props) => T,
): ContextProvider<T, Props>
/**
 * create Provider and useContext with initial value
 *
 * @param setup setup context function
 * @param initialValue fallback value when context is not provided
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
            throw new Error(`Provider is not set in component tree!`)
          }
          return _ctx
        }
      : () => useContext(ctx)!,
  ]
}
