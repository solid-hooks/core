import type { AnyFunction, ParseFunction, ParseParameters, StringKeys } from '@subframe7536/type-utils'

type Add$Keys<T extends Record<string, any>> = {
  [K in keyof T as `$${K & string}`]: T[K]
}

type Non$Keys<Emits extends EmitEvents> = StringKeys<Emits> extends `$${infer EventName}` ? EventName : never

type EmitEvents = Record<`$${string}`, AnyFunction>

type FilterEmitEvents<T extends Record<string, any>> = {
  [K in Extract<keyof T, `$${string}`>]: T[K]
}

/**
 * trigger event
 * @param event trigger event
 * @param ...data event data
 */
type EmitTrigger<Events extends Record<string, any>> = FilterEmitEvents<Events> extends infer E
  ? E extends EmitEvents
    ? <K extends Non$Keys<E>>(event: K, ...data: Parameters<Extract<Required<E>[`$${K}`], AnyFunction>>) => void
    : never
  : never

export type defineEmits<T extends Record<string, any>> = Add$Keys<{
  [K in StringKeys<T>]: T[K] extends infer E
    ? E extends AnyFunction
      ? E
      : ParseFunction<ParseParameters<E>>
    : never
}>

/**
 * like `defineEmits` in `Vue`, emit event from child component
 * @param props conponents props
 * @example
 * ```tsx
 * import { type defineEmits, useEmits } from '@solid-hooks/core'
 *
 * type Emits = defineEmits<{
 *   // sync
 *   var: number
 *   update: [d1: string, d2?: string, d3?: string]
 *   // sync or async
 *   fn: (test: string) => Promise<void>
 * }>
 * function Child(prop: Emits & { num: number }) {
 *   const emit = useEmits(prop)
 *   const handleClick = () => {
 *     emit('var', { id: 1 })
 *     emit('update', `emit from child: ${prop.num}`, 'second param')
 *     emit('fn', ['a', 'b'])
 *   }
 *   return (
 *     <div>
 *       <div>
 *         child prop: {prop.num}
 *       </div>
 *       <button onClick={handleClick}>click and see console</button>
 *     </div>
 *   )
 * }
 *
 * export default function Father() {
 *   return (
 *     <Child
 *       num={1}
 *       $var={e => console.log('[emit] $var:', e)}
 *       $update={(d, d1) => console.log(`[emit] $update:`, d, d1)}
 *       $fn={test => console.log('[emit] $fn:', test)}
 *     />
 *   )
 * }
 * ```
 */
export function useEmits<Props extends Record<string, any>>(props: Props): EmitTrigger<Props> {
  // @ts-expect-error ignore it
  return (e: string, ...args: any[]) => props[`$${e}`](...args)
}
