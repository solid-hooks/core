import { type Accessor, createSignal } from 'solid-js'
import { useDocumentListener, useEventListenerStack } from './event-listener'

/**
 * check if element is hovered
 * @param ref element
 * @param options listen options
 */
export function useHover(
  ref: Accessor<HTMLElement | undefined>,
  options: AddEventListenerOptions & {
    callback?: (isHovered: boolean) => void
  } = {},
): Accessor<boolean> {
  const { callback = () => { }, ...listenOptions } = options
  const [isHovered, setIsHovered] = createSignal(false)
  const [listen] = useEventListenerStack(ref)
  listen('mouseenter', () => callback(setIsHovered(true)), listenOptions)
  listen('mouseleave', () => callback(setIsHovered(false)), listenOptions)
  return isHovered
}

/**
 * check if element is clicked
 * @param ref element accessor
 * @param options listen options with callback
 */
export function useClickOutside(
  ref: Accessor<HTMLElement | undefined>,
  options: AddEventListenerOptions & {
    callback?: (isClicked: boolean) => void
  } = {},
): Accessor<boolean> {
  const { callback = () => { }, ...listenOptions } = options
  const [isClicked, setIsClicked] = createSignal(false)
  useDocumentListener('click', (event) => {
    const element = ref()
    if (element) {
      callback(setIsClicked(element.contains(event.target as Node)))
    }
  }, listenOptions)
  return isClicked
}
