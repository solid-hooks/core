import type { Accessor, Setter, Signal } from 'solid-js'

import { createRenderEffect, createSignal, onCleanup } from 'solid-js'

/**
 * Signal that indicate document's title
 */
export function useTitle(): Signal<string>
/**
 * Reactive document title with external signal
 * @param title external signal
 */
export function useTitle(title: Accessor<string>): void
export function useTitle(title?: Accessor<string>): Signal<string> | void {
  const originalTitle = document.title
  let acc, set
  if (title) {
    acc = title
  } else {
    [acc, set] = createSignal(originalTitle)
  }
  createRenderEffect(() => {
    document.title = acc()
    onCleanup(() => {
      document.title = originalTitle
    })
  })
  return title ? void 0 : [acc, set as Setter<string>]
}
