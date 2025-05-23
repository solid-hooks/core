import type { MaybeAccessor } from '@solid-primitives/utils'
import type { ComponentProps } from 'solid-js'

import { access, tryOnCleanup } from '@solid-primitives/utils'
import { createRenderEffect } from 'solid-js'
import { spread } from 'solid-js/web'

export type ScriptOptions = ComponentProps<'script'>

export type StyleOptions = ComponentProps<'style'>

/**
 * Load js
 * @param type script tag
 * @param content js content
 * @param options other options
 * @example
 * ```ts
 * import { useExternal } from '@solid-hooks/core/web'
 *
 * const script = 'console.log(`test load script`)'
 * const [scriptElement, cleanupScript] = useExternal('script', script, { options })
 * ```
 */
export function useExternal(
  type: 'script',
  content: MaybeAccessor<string>,
  options?: ScriptOptions,
): [element: HTMLScriptElement, cleanup: VoidFunction]
/**
 * Load css
 * @param type style tag
 * @param content css content
 * @param options other options
 * @example
 * ```ts
 * import { useExternal } from '@solid-hooks/core/web'
 *
 * const style = 'div { color: red }'
 * const [styleElement, cleanupStyle] = useExternal('style', style, { options })
 * ```
 */
export function useExternal(
  type: 'style',
  content: MaybeAccessor<string>,
  options?: StyleOptions,
): [element: HTMLStyleElement, cleanup: VoidFunction]
export function useExternal(
  type: 'script' | 'style',
  content: MaybeAccessor<string>,
  options?: ScriptOptions | StyleOptions,
): any {
  const element = document.createElement(type)
  spread(element, options, false, true)
  createRenderEffect(() => {
    const code = access(content)

    const codePropName = type === 'script' && code.startsWith('http') ? 'src' : 'textContent'

    if ((element as any)[codePropName] !== code) {
      (element as any)[codePropName] = code
      document.head.appendChild(element)
    }
  })
  const cleanup = tryOnCleanup(() => {
    if (document.head.contains(element)) {
      document.head.removeChild(element)
    }
  })

  return [element, cleanup]
}
