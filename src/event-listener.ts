import { type EventMapOf, makeEventListener } from '@solid-primitives/event-listener'

export {
  makeEventListener as useEventListener,
  makeEventListenerStack as useEventListenerStack,
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
  return makeEventListener(window, type, handler, options)
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
  return makeEventListener(document, type, handler, options)
}
