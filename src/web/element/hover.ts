import type { Accessor } from 'solid-js'

import { noop } from '@solid-primitives/utils'
import { createSignal } from 'solid-js'

import { useEventListenerStack } from '../event-listener'

export type UseHoverOptions = {
  /**
   * Listener options,
   * @default { passive: true }
   */
  modifiers?: AddEventListenerOptions
  /**
   * Callback when the ref element is hovered
   */
  onHover?: (isHovered: boolean) => void
}

/**
 * State of whether element is hovered
 * @param ref element
 * @param options listen options
 */
export function useHover(
  ref: Accessor<HTMLElement | undefined>,
  options: UseHoverOptions = {},
): [isHovered: Accessor<boolean>, cleanup: VoidFunction] {
  const { onHover = noop, modifiers } = options
  const [isHovered, setIsHovered] = createSignal(false)
  const [listen, cleanup] = useEventListenerStack(ref, { passive: true, ...modifiers })
  listen('mouseenter', () => onHover(setIsHovered(true)))
  listen('mouseleave', () => onHover(setIsHovered(false)))
  return [isHovered, cleanup]
}
