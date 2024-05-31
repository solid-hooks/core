import { type Accessor, createSignal } from 'solid-js'
import { isClient, noop } from '@solid-primitives/utils'
import { useWindowListener } from '../event-listener'

export const isIOS = isClient && ((/iP(?:ad|hone|od)/.test(globalThis.navigator.userAgent))
  // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
  // https://github.com/vueuse/vueuse/issues/3577
  || (globalThis.navigator.maxTouchPoints > 2 && /iPad|Macintosh/.test(globalThis.navigator.userAgent)))

export type UseClickOutsideOptions = {
  /**
   * listener options
   * @default { passive: true }
   */
  modifiers?: AddEventListenerOptions
  /**
   * callback when the ref element is clicked outside
   */
  onClickOutside?: (ev: PointerEvent) => void
}

let _iOSWorkaround = false

/**
 * check if element is clicked outside
 * @param ref element accessor
 * @param options listen options with callback
 */
export function useClickOutside(
  ref: Accessor<HTMLElement | undefined>,
  options: UseClickOutsideOptions = {},
): [isClicked: Accessor<boolean>, cleanup: VoidFunction] {
  const { onClickOutside = noop, modifiers } = options
  const [isClicked, setIsClicked] = createSignal(true)

  // Fixes: https://github.com/vueuse/vueuse/issues/1520
  // How it works: https://stackoverflow.com/a/39712411
  if (isIOS && !_iOSWorkaround) {
    _iOSWorkaround = true
    Array.from(window.document.body.children)
      .forEach(el => el.addEventListener('click', noop))
    window.document.documentElement.addEventListener('click', noop)
  }

  const cleanup = useWindowListener('pointerdown', (event) => {
    const el = ref()
    if (el) {
      const isOutside = el !== event.target && !event.composedPath().includes(el)
      if (setIsClicked(isOutside)) {
        onClickOutside(event)
      }
    }
  }, { passive: true, ...modifiers })
  return [isClicked, cleanup]
}
