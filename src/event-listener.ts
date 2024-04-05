import { makeEventListener } from '@solid-primitives/event-listener'

export {
  createEventListener as useEventListener,
  createEventListenerMap as useEventListenerMap,
  preventDefault,
  stopImmediatePropagation,
  stopPropagation,
} from '@solid-primitives/event-listener'

/**
 * listen event on `window`, auto cleanup
 *
 * return cleanup function
 */
export const useWindowListener = makeEventListener.bind(makeEventListener, window)

/**
 * listen event on `document`, auto cleanup
 *
 * return cleanup function
 */
export const useDocumentListener = makeEventListener.bind(makeEventListener, document)
