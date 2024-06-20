import { DEV } from 'solid-js'
import { useWindowListener } from '../event-listener'

type OnPasteOptions<T extends boolean> = {
  /**
   * Callback for {@link usePaste}
   * @param data clipboard data
   * @param mime mimetype
   * @param fileProps file properties if the `data` is a {@link https://developer.mozilla.org/en-US/docs/Web/API/File File}
   */
  onPaste: (
    data: string | (T extends true ? File : Blob) | null,
    mime: string,
  ) => void
  /**
   * whether force to use `document.execCommand('paste')` to paste
   * and listen `paste` event on `window`
   */
  legacy?: T
  /**
   * check if `data` is text
   * @param mime data's mimetype
   * @default mime => mime.startsWith('text/')
   */
  isText?: (mime: string) => boolean
}

/**
 * hooks that paste from clipboard
 * @param options paste options
 * @example
 * ```tsx
 * import { usePaste } from '@solid-hooks/web'
 *
 * export default () => {
 *   const paste = usePaste({
 *     onPaste: (data, mime) => console.log(data, mime)
 *   })
 *   return <button onClick={paste}>paste</button>
 * }
 * ```
 */
export function usePaste<T extends boolean = false>(options: OnPasteOptions<T>): VoidFunction {
  const { onPaste, legacy, isText = mime => mime.startsWith('text/') } = options
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!document?.queryCommandSupported?.('paste')

  isSupported && legacy && useWindowListener('paste', (e) => {
    const clipboardData = e.clipboardData
    if (!clipboardData) {
      return
    }
    for (const item of clipboardData.items) {
      if (isText(item.type)) {
        item.getAsString(data => onPaste(data, item.type))
      } else {
        const file = item.getAsFile()
        onPaste(file, item.type)
      }
    }
  })
  return isSupported
    ? async () => {
      try {
        if (legacy) {
          document.execCommand('paste')
        } else {
          const items = await clipboard.read()
          for (const item of items) {
            for (const mime of item.types) {
              const data = await item.getType(mime)
              onPaste(isText(mime) ? await data.text() : data as any, mime)
            }
          }
        }
      } catch (e) {
        DEV && console.error('fail to paste from clipboard', e)
      }
    }
    : async () => {
      DEV && console.warn('paste from clipboard is not supported')
    }
}
