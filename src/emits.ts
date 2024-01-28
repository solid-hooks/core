import type { ParseFunction, ParseParameters, StringKeys } from '@subframe7536/type-utils'
import { type Signal, type SignalOptions, createEffect, createSignal, on } from 'solid-js'

type FilterKeys<T> = keyof T extends `$${infer EventName}` ? EventName : never
type ParseKey<T extends Record<string, any>> = {
  [K in keyof T as `$${K & string}`]: T[K]
}
type FilterOneParameterEvents<
  Events extends Record<string, any>,
  EventKeys extends string = StringKeys<Events>,
> = {
  [K in EventKeys]: ParseParameters<Required<Events>[K]>['length'] extends 1 ? K : never
}[EventKeys]
/**
 * utility type for function emitting
 */
export type EmitProps<
  Events extends Record<string, any>,
  Props extends Record<string, any> = {},
> = Props & ParseKey<{
  [K in keyof Events]: ParseFunction<Events[K]>
}>

export type EmitsReturn<PropsWithEmits, Emits extends Record<string, any>> = {
  /**
   * trigger event
   * @param event trigger event
   * @param ...data event data
   */
  emit: <K extends FilterKeys<PropsWithEmits>>(
    event: K,
    ...data: ParseParameters<Required<Emits>[K]>
  ) => void
  /**
   * create a {@link SignalObject} that trigger event after value is set
   * @param event trigger event (only events with one parameter allowed)
   * @param value initial value
   * @param options emit options
   */
  createEmitSignal: <
    K extends FilterOneParameterEvents<Emits, FilterKeys<PropsWithEmits>>,
    V = ParseParameters<Required<Emits>[K]>[0],
  >(
    event: K,
    value: V,
    options?: SignalOptions<V>
  ) => Signal<V>
}

/**
 * like `defineEmit` in `Vue`, emit event from child component, auto handle optional prop
 * @param props conponents props
 */
export function useEmits<
  Emits extends Record<string, any>,
  PropsWithEmits = EmitProps<Emits>,
>(props: PropsWithEmits): EmitsReturn<PropsWithEmits, Emits> {
  const emit = (e: string, ...args: any[]) => {
    // @ts-expect-error emit
    props[`$${e}`]?.(...args)
  }
  return {
    emit,
    createEmitSignal: (e, value, options) => {
      const [val, setVal] = createSignal(value, options)
      createEffect(on(val, value => emit(e, value), { defer: true }))
      return [val, setVal]
    },
  }
}
