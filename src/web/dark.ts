import { createPrefersDark } from '@solid-primitives/media'
import { type MaybeAccessor, access } from '@solid-primitives/utils'
import { type Accessor, type Setter, createEffect, createMemo, createSignal, on, untrack } from 'solid-js'
import { useResourceTag } from './resource-tag'

export {
  makeMediaQueryListener as useMediaQueryListener,
  createMediaQuery as useMediaQuery,
} from '@solid-primitives/media'

type ColorMode = 'auto' | 'light' | 'dark'

export type UseDarkOptions = {
  /**
   * initial color mode
   * @default 'auto'
   */
  initialMode?: ColorMode
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

type UseDarkReturn = [isDark: Accessor<boolean>, mode: Accessor<ColorMode>, setMode: Setter<ColorMode>]

const disableTransitionStyle = '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'

/**
 * auto color mode with attribute toggle
 *
 * disable transition by default
 * @example
 * ```tsx
 * import { useDark } from '@solid-hooks/core/web'
 *
 * export default function TestDark() {
 *   const [isDark, mode, setMode] = useDark()
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
export function useDark(options: UseDarkOptions = {}): UseDarkReturn {
  const {
    onChanged,
    initialMode = 'auto',
    selector = 'html',
    attribute = 'class',
    disableTransition = true,
  } = options

  const preferredDark = createPrefersDark()
  const [mode, setMode] = createSignal<ColorMode>(initialMode)

  const isDark = createMemo(() => {
    switch (mode()) {
      case 'auto':
        return untrack(preferredDark)
      case 'light':
        return false
      case 'dark':
        return true
    }
  })

  createEffect(on(isDark, (value) => {
    const el = document.querySelector(access(selector))
    if (!el) {
      return
    }

    let cleanup = disableTransition
      ? useResourceTag('style', disableTransitionStyle)[1]
      : undefined

    if (attribute === 'class') {
      value ? el.classList.add('dark') : el.classList.remove('dark')
    } else {
      el.setAttribute(attribute, 'dark')
    }
    onChanged?.(value)

    cleanup?.()
  }))

  return [isDark, mode, setMode]
}
