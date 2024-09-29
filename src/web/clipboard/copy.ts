import { asArray, type Many } from '@solid-primitives/utils'
import { type Accessor, createSignal, DEV } from 'solid-js'

export type UseCopyOptions = {
  /**
   * duration of copied state
   * @default 1500
   */
  copiedDuration?: number
  /**
   * whether force to use `document.execCommand('copy')` to copy
   */
  legacy?: boolean
}
export type UseCopyReturn = {
  /**
   * signal that indicate the text has been copied
   */
  isCopied: Accessor<boolean>
  /**
   * copy text or {@link https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem ClipboardItem}
   * @param data string or {@link https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem ClipboardItem}
   */
  copy: (data: string | Many<ClipboardItem>) => Promise<void>
}
/**
 * hooks that copy to clipboard
 * @param options copy options
 * @example
 * ```tsx
 * import { useCopy } from '@solid-hooks/web'
 *
 * export default () => {
 *   const { isCopied, copy } = useCopy()
 *   return (
 *     <button onClick={() => copy('hello world')}>copy</button>
 *     <div>is copied: {isCopied() ? 'true' : 'false'}</div>
 *   )
 * }
 * ```
 */

export function useCopy(options: UseCopyOptions = {}): UseCopyReturn {
  const { copiedDuration = 1500, legacy } = options
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!globalThis.document?.queryCommandSupported?.('copy')

  const [isCopied, setCopied] = createSignal(false)
  let timer: ReturnType<typeof setTimeout>

  return {
    isCopied,
    copy: isSupported
      ? async (data: string | Many<ClipboardItem>) => {
        const isString = typeof data === 'string'
        if (legacy) {
          const ta = document.createElement('textarea')
          ta.value = isString ? data : JSON.stringify(data)
          ta.ariaHidden = 'true'
          ta.style.position = 'absolute'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          const result = document.execCommand('copy')
          ta.remove()
          if (!result) {
            throw new Error('"copy" command is unsupported')
          }
        } else {
          if (isString) {
            await clipboard.writeText(data)
          } else {
            await clipboard.write(asArray(data))
          }
        }

        setCopied(true)
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => setCopied(false), copiedDuration)
      }
      : async () => DEV && console.warn('copy into to clipboard is unsupported')
    ,
  }
}
