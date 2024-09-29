import { noop } from '@solid-primitives/utils'
import { type Accessor, createSignal } from 'solid-js'
import { useEventListenerStack } from '../event-listener'

export type UseHoverOptions = {
  /**
   * listener options,
   * @default { passive: true }
   */
  modifiers?: AddEventListenerOptions
  /**
   * callback when the ref element is hovered
   */
  onHover?: (isHovered: boolean) => void
}

/**
 * check if element is hovered
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
