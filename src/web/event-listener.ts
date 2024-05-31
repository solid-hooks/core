import {
  type EventListenerOptions,
  type EventMapOf,
  type TargetWithEventMap,
  makeEventListener,
} from '@solid-primitives/event-listener'
import { type Many, type MaybeAccessor, access, asArray, createCallbackStack } from '@solid-primitives/utils'
import { createEffect, createRenderEffect, on, onCleanup } from 'solid-js'

export {
  preventDefault,
  stopImmediatePropagation,
  stopPropagation,
} from '@solid-primitives/event-listener'

/**
 * listen event on `window`, auto cleanup
 *
 * return cleanup function
 */
export function useWindowListener<
  EventMap extends WindowEventMap,
  EventType extends keyof EventMap,
>(
  type: EventType,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): VoidFunction {
  return makeEventListener(globalThis.window, type, handler, options)
}

/**
 * listen event on `document`, auto cleanup
 *
 * return cleanup function
 */
export function useDocumentListener<
  EventMap extends DocumentEventMap,
  EventType extends keyof EventMap,
>(
  type: EventType,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): VoidFunction {
  return makeEventListener(globalThis.document, type, handler, options)
}

/**
 * Creates an event listener, that will be automatically disposed on cleanup.
 * @param target ref to HTMLElement, EventTarget
 * @param types names of the handled event
 * @param handler event handler
 * @param options addEventListener options
 * @example
 * const clear = useEventListener(element, 'click', e => { ... }, { passive: true })
 * // remove listener (will also happen on cleanup)
 * clear()
 */
export function useEventListener<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  EventType extends keyof EventMap,
>(
  target: MaybeAccessor<Target | undefined | null>,
  types: Many<EventType>,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions
): VoidFunction
export function useEventListener<
  EventMap extends Record<string, Event>,
  EventType extends keyof EventMap,
>(
  target: MaybeAccessor<EventTarget | undefined | null>,
  types: Many<EventType>,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions
): VoidFunction
export function useEventListener(
  target: MaybeAccessor<EventTarget | undefined | null>,
  types: Many<string>,
  handler: (event: Event) => void,
  options?: EventListenerOptions,
): VoidFunction {
  const { execute, push } = createCallbackStack()
  ; (typeof target === 'function' ? createEffect : createRenderEffect)(
    () => {
      const el = access(target)
      if (el) {
        for (const t of asArray(types)) {
          push(makeEventListener(el, t, handler, options))
        }
      }
    },
  )

  return execute
}

type ListenEvent<EventMap extends Record<string, any>> = {
  <T extends keyof EventMap>(
    types: Many<T>,
    handler: (event: EventMap[T]) => void,
    options?: EventListenerOptions,
  ): VoidFunction
}

/**
 * Creates a stack of event listeners, that will be automatically disposed on cleanup.
 * @param target ref to HTMLElement or EventTarget
 * @param options addEventListener options
 * @example
 * const [listen, clear] = useEventListenerStack(target, { passive: true });
 * listen("mousemove", handleMouse);
 * listen("dragover", handleMouse);
 * // remove listener (will also happen on cleanup)
 * clear()
 */

// DOM Events
export function useEventListenerStack<Target extends TargetWithEventMap, EventMap extends EventMapOf<Target>>(
  target: MaybeAccessor<Target | undefined | null>,
  options?: EventListenerOptions,
): [listen: ListenEvent<EventMap>, clear: VoidFunction]

// Custom Events
export function useEventListenerStack<EventMap extends Record<string, Event>>(
  target: MaybeAccessor<EventTarget | undefined | null>,
  options?: EventListenerOptions,
): [listen: ListenEvent<EventMap>, clear: VoidFunction]

export function useEventListenerStack(
  target: any,
  options?: EventListenerOptions,
): [listen: ListenEvent<Record<string, any>>, clear: VoidFunction] {
  const { push, execute } = createCallbackStack()
  return [
    (type, handler, overwriteOptions) => {
      const clear = useEventListener(target, type, handler, overwriteOptions ?? options)
      push(clear)
      return clear
    },
    onCleanup(execute),
  ]
}
