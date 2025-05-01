import type { MaybeAccessor } from '@solid-primitives/utils'
import type { Accessor, Setter } from 'solid-js'

import { access, noop } from '@solid-primitives/utils'
import { createMemo, createRenderEffect, createSignal, on } from 'solid-js'

import { useEventListener } from './event-listener'
import { useExternal } from './external'

/**
 * Create media query signal
 * @param query media query string
 * @param listener custom listener
 */
export function useMediaQuery(
  query: string,
  listener: (currentState: boolean, event: MediaQueryListEvent) => void = noop,
): Accessor<boolean> {
  const mql = globalThis.matchMedia(query)
  const [state, setState] = createSignal(mql.matches)
  const handler = (event: MediaQueryListEvent): void => listener(setState(event.matches), event)
  if ('addEventListener' in mql) {
    useEventListener(mql, 'change', handler)
  } else {
    // @ts-expect-error deprecated API
    mql.addListener(handler)
  }
  return state
}

export function usePrefersDark(): Accessor<boolean> {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

type ColorMode = 'auto' | 'light' | 'dark'

export type UseColorModeOptions = {
  /**
   * Initial color mode
   * @default 'auto'
   */
  initialMode?: ColorMode
  /**
   * Auto change color scheme
   */
  colorScheme?: boolean
  /**
   * CSS selector for the target element applying to
   * @default 'html'
   */
  selector?: MaybeAccessor<string>
  /**
   * HTML attribute applying the target element
   * @default 'class'
   */
  attribute?: string
  /**
   * Custom handler for handle the theme change.
   */
  onChanged?: (isDark: boolean) => void
  /**
   * Disable transition on switch
   * @see https://paco.me/writing/disable-theme-transitions
   * @default true
   */
  disableTransition?: boolean
}

type UseColorModeReturn = [
  mode: Accessor<ColorMode>,
  setMode: Setter<ColorMode>,
  isDark: Accessor<boolean>,
]

const disableTransitionStyle = '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'

/**
 * Auto color mode with attribute toggle
 *
 * Disable transition by default
 * @example
 * ```tsx
 * import { useColorMode } from '@solid-hooks/core/web'
 *
 * export default function TestColorMode() {
 *   const [mode, setMode, isDark] = useColorMode()
 *   return (
 *     <>
 *       <div>{isDark() ? 'dark' : 'light'} theme</div>
 *       <div>{mode()}</div>
 *       <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>click</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useColorMode(options: UseColorModeOptions = {}): UseColorModeReturn {
  const {
    onChanged,
    initialMode = 'auto',
    selector = 'html',
    attribute = 'class',
    disableTransition = true,
    colorScheme,
  } = options

  const preferredDark = usePrefersDark()
  const [mode, setMode] = createSignal<ColorMode>(initialMode)

  const isDark = createMemo(() => {
    switch (mode()) {
      case 'auto':
        return preferredDark()
      case 'light':
        return false
      case 'dark':
        return true
    }
  })

  createRenderEffect(on(isDark, (is) => {
    const el = document.querySelector(access(selector)) as HTMLElement
    if (!el) {
      return
    }

    let cleanup = disableTransition
      ? useExternal('style', disableTransitionStyle)[1]
      : undefined

    const _mode = is ? 'dark' : 'light'
    if (attribute === 'class') {
      el.classList.remove('light', 'dark')
      el.classList.add(_mode)
    } else {
      el.setAttribute(attribute, _mode)
    }
    if (colorScheme) {
      el.style.colorScheme = _mode
    }
    onChanged?.(is)

    cleanup?.()
  }))

  return [mode, setMode, isDark]
}
