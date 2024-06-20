import { DEV } from 'solid-js'
import { useWindowListener } from '../event-listener'

type OnPasteOptions = {
  /**
   * Callback for {@link usePaste}
   * @param data clipboard data
   * @param mime mimetype
   * @param fileProps file properties if the `data` is a {@link https://developer.mozilla.org/en-US/docs/Web/API/File File}
   */
  onPaste: (
    data: string | Blob | null,
    mime: string,
    fileProps?: Pick<File, 'name' | 'lastModified' | 'webkitRelativePath'>
  ) => void
  /**
   * whether to only use `document.execCommand('paste')` to paste
   * and listen `paste` event on `window`
   */
  legacy?: boolean
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
export function usePaste(options: OnPasteOptions): VoidFunction {
  const { onPaste, legacy } = options
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!document?.queryCommandSupported?.('paste')

  isSupported && legacy && useWindowListener('paste', (e) => {
    const clipboardData = e.clipboardData
    if (!clipboardData) {
      return
    }
    for (const item of clipboardData.items) {
      if (item.type.startsWith('text/')) {
        item.getAsString(data => onPaste(data, item.type))
      } else {
        const file = item.getAsFile()
        onPaste(file, item.type, file || undefined)
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
              onPaste(await item.getType(mime), mime)
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
