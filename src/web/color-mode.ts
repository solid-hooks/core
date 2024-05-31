import { createPrefersDark } from '@solid-primitives/media'
import { type MaybeAccessor, access } from '@solid-primitives/utils'
import { type Accessor, type Setter, createMemo, createRenderEffect, createSignal, on } from 'solid-js'
import { useResourceTag } from './resource-tag'

export {
  makeMediaQueryListener as useMediaQueryListener,
  createMediaQuery as useMediaQuery,
} from '@solid-primitives/media'

type ColorMode = 'auto' | 'light' | 'dark'

export type UseColorModeOptions = {
  /**
   * initial color mode
   * @default 'auto'
   */
  initialMode?: ColorMode
  /**
   * auto change color scheme
   */
  colorScheme?: boolean
  /**
   * css selector for the target element applying to
   * @default 'html'
   */
  selector?: MaybeAccessor<string>
  /**
   * HTML attribute applying the target element
   * @default 'class'
   */
  attribute?: string
  /**
   * custom handler for handle the theme change.
   */
  onChanged?: (isDark: boolean) => void
  /**
   * disable transition on switch
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
 * auto color mode with attribute toggle
 *
 * disable transition by default
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

  const preferredDark = createPrefersDark()
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
      ? useResourceTag('style', disableTransitionStyle)[1]
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
