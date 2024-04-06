import type { AnyFunction, RemoveNeverProps, StringKeys } from '@subframe7536/type-utils'
import { type NoInfer, type Signal, type SignalOptions, createSignal } from 'solid-js'

type Non$Keys<Emits extends EmitEvents> = StringKeys<Emits> extends `$${infer EventName}` ? EventName : never

type EmitEvents = Record<`$${string}`, AnyFunction>

type FilterOneParameterEvents<Emits extends EmitEvents> = RemoveNeverProps<{
  [K in StringKeys<Emits>]: Parameters<Extract<Required<Emits>[K], AnyFunction>>['length'] extends 1
    ? Emits[K]
    : never
}>

type EventArgsWithout$<
  Events extends EmitEvents,
  K extends Non$Keys<Events> | Non$Keys<FilterOneParameterEvents<Events>>,
> = Parameters<Extract<Required<Events>[`$${K}`], AnyFunction>>

export type EmitsReturn<Events extends EmitEvents> = {
  /**
   * trigger event
   * @param event trigger event
   * @param ...data event data
   */
  emit: <K extends Non$Keys<Events>>(
    event: K,
    ...data: EventArgsWithout$<Events, K>
  ) => void
  /**
   * create a {@link SignalObject} that trigger event after value is set
   * @param event trigger event (only events with one parameter allowed)
   * @param value initial value
   * @param options emit options
   */
  createEmitSignal: <
    K extends Non$Keys<FilterOneParameterEvents<Events>>,
    V extends EventArgsWithout$<Events, K>[0],
  >(
    event: K,
    value: NoInfer<V>,
    options?: SignalOptions<V>
  ) => Signal<V>
}

/**
 * like `defineEmit` in `Vue`, emit event from child component, auto handle optional prop
 * @param props conponents props
 * @example
 * ```tsx
 * import { createSignal } from 'solid-js'
 * import { useEmits } from '@solid-hooks/core'
 *
 * // must start with `$`
 * type Emits = {
 *   $var: (num: number) => void
 *   $update: (d1: string, d2?: string, d3?: string) => void
 *   $optional?: (data: { test: number }) => void
 * }
 *
 * type BaseProps = { num: number }
 *
 * function Child(props: Emits & BaseProps) {
 *   const { emit, createEmitSignal } = useEmits<Emits>(props)
 *
 *   // auto emit after value changing, like `defineModel` in Vue
 *   const [variable, setVariable] = createEmitSignal('var', 1)
 *   const handleClick = () => {
 *     setVariable(v => v + 1)
 *
 *     // manully emit
 *     emit('update', `emit from child: ${props.num}`, 'second')
 *     emit('optional', { test: 1 })
 *   }
 *   return (
 *     <div>
 *       child: {props.num}
 *       <button onClick={handleClick}>+</button>
 *     </div>
 *   )
 * }
 * function Father() {
 *   const [count] = createSignal('init')
 *   return (
 *     <Child
 *       num={count()}
 *       $update={console.log}
 *       $var={e => console.log('useEmits:', e)}
 *     />
 *   )
 * }
 * ```
 */
export function useEmits<Emits extends EmitEvents>(props: EmitEvents): EmitsReturn<Emits> {
  const emit = (e: string, ...args: any[]) => {
    // @ts-expect-error emit
    // eslint-disable-next-line prefer-template
    props['$' + e]?.(...args)
  }
  return {
    emit,
    createEmitSignal: (e, value, options) => {
      const [val, setVal] = createSignal(value, options)
      return [
        val,
        (args) => {
          const value = setVal(args as any)
          emit(e, value)
          return value
        },
      ] as Signal<any>
    },
  }
}
