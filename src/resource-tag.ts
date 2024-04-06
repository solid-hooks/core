import { type MaybeAccessor, access, tryOnCleanup } from '@solid-primitives/utils'
import type { ComponentProps } from 'solid-js'
import { createRenderEffect } from 'solid-js'
import { spread } from 'solid-js/web'

export type ScriptOptions = Pick<
  ComponentProps<'script'>,
  | 'defer'
  | 'crossOrigin'
  | 'noModule'
  | 'referrerPolicy'
  | 'type'
  | 'async'
  | 'onLoad'
>

export type StyleOption = Pick<
  ComponentProps<'style'>,
  | 'media'
  | 'onLoad'
>

/**
 * load js
 * @param type script tag
 * @param content js content
 * @param options other options
 * @example
 * ```ts
 * import { useResourceTag } from '@solid-hooks/core'
 *
 * const script = 'console.log(`test load script`)'
 * const [scriptElement, cleanupScript] = useResourceTag('script', script, { options })
 * ```
 */
export function useResourceTag(
  type: 'script',
  content: MaybeAccessor<string>,
  options?: ScriptOptions,
): [element: HTMLScriptElement, cleanup: VoidFunction]
/**
 * load css
 * @param type style tag
 * @param content css content
 * @param options other options
 * @example
 * ```ts
 * import { useResourceTag } from '@solid-hooks/core'
 *
 * const style = 'div { color: red }'
 * const [styleElement, cleanupStyle] = useResourceTag('style', style, { options })
 * ```
 */
export function useResourceTag(
  type: 'style',
  content: MaybeAccessor<string>,
  options?: StyleOption,
): [element: HTMLStyleElement, cleanup: VoidFunction]
export function useResourceTag(
  type: 'script' | 'style',
  content: MaybeAccessor<string>,
  options?: ScriptOptions | StyleOption,
) {
  const element = document.createElement(type)
  spread(element, options, false, true)
  createRenderEffect(() => {
    const code = access(content)

    const codePropName = type === 'script' && /^(https?:|\w[\.\w-_%]+|)\//.test(code) ? 'src' : 'textContent'

    if ((element as any)[codePropName] !== code) {
      (element as any)[codePropName] = code
      document.head.appendChild(element)
    }
  })
  const cleanup = tryOnCleanup(() => {
    document.head.contains(element) && document.head.removeChild(element)
  })

  return [element, cleanup]
}
