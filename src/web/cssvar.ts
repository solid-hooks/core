import { type MaybeAccessor, access } from '@solid-primitives/utils'
import { createRenderEffect } from 'solid-js'

/**
 * bind css variable to signal
 * @param name css variable name, without `--`
 * @param value value accessor
 * @param ref ref element, default to `document.documentElement`
 * @example
 * ```ts
 * import { useCssVar } from '@solid-hooks/core/web'
 *
 * const [color, setColor] = createSignal('red')
 * useCssVar('bg', color)
 * ```
 */
export function useCssVar(
  name: string,
  value: MaybeAccessor<string | null>,
  ref?: MaybeAccessor<HTMLElement | undefined>,
): void {
  const varName = '--' + name
  createRenderEffect(() => {
    const el = access(ref) ?? document.documentElement
    el.style.setProperty(varName, access(value))
  })
}
