import { DEV } from 'solid-js'
import { useDocumentListener } from '../event-listener'

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
   * check if `data`'s type is string
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
export function usePaste<T extends boolean = false>(options: OnPasteOptions<T>): () => Promise<void> {
  const { onPaste, legacy, isText = mime => mime.startsWith('text/') } = options
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!globalThis.document?.queryCommandSupported?.('paste')

  if (isSupported && legacy) {
    useDocumentListener('paste', (e) => {
      const clipboardData = e.clipboardData
      if (!clipboardData) {
        return
      }
      for (const item of clipboardData.items) {
      // mime type will change after getting, so get it first
        const mime = item.type
        if (isText(mime)) {
          item.getAsString((data) => {
            onPaste(data, mime)
          })
        } else {
          const file = item.getAsFile()
          onPaste(file, mime)
        }
      }
    })
  }
  return isSupported
    ? async () => {
      if (legacy) {
        const result = document.execCommand('paste')
        if (!result) {
          throw new Error('"paste" command is unsupported')
        }
      } else {
        const items = await clipboard.read()
        for (const item of items) {
          for (const mime of item.types) {
            const data = await item.getType(mime)
            onPaste(isText(mime) ? await data.text() : data as any, mime)
          }
        }
      }
    }
    : async () => DEV && console.warn('paste from clipboard is unsupported')
}
