import { type Accessor, DEV, createSignal } from 'solid-js'
import { type Many, asArray } from '@solid-primitives/utils'
import { useWindowListener } from './event-listener'

export type UseCopyOptions = {
  /**
   * duration of copied state
   * @default 1500
   */
  copiedDuration?: number
  /**
   * whether to only use legacy `document.execCommand('copy')` to copy
   */
  legacy?: boolean
}
export type UseCopyReturn = {
  /**
   * signal that indicate the text has been copied
   */
  copied: Accessor<boolean>
  /**
   * copy text or {@link https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem ClipboardItem}
   * @param data string or {@link https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem ClipboardItem}
   */
  copy: (data: string | Many<ClipboardItem>) => Promise<void>
}

export type ClipboardItemSignal<T> = [accessor: Accessor<ClipboardItem>, set: (data: Many<T>) => ClipboardItem]

function generate(part: Many<any>, mime: string): ClipboardItem {
  return new ClipboardItem({ [mime]: new Blob(asArray(part), { type: mime }) })
}

export function createClipboardItemSignal<T extends BlobPart>(part: Many<T>, mime: string): ClipboardItemSignal<T> {
  const [item, setItem] = createSignal(generate(part, mime))
  return [item, data => setItem(generate(data, mime))]
}

/**
 * hooks that copy to clipboard
 * @param options clipboard options
 * @example
 * ```tsx
 * import { useCopy } from '@solid-hooks/web'
 *
 * export default () => {
 *   const { copied, copy } = useCopy()
 *   return (
 *     <button onClick={() => copy('hello world')}>copy</button>
 *     <div>is copied: {copied() ? 'true' : 'false'}</div>
 *   )
 * }
 * ```
 */
export function useCopy(options: UseCopyOptions = {}): UseCopyReturn {
  const { copiedDuration = 1500, legacy } = options
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!document?.queryCommandSupported?.('copy')

  const [copied, setCopied] = createSignal(false)
  let timer: ReturnType<typeof setTimeout>

  return {
    copied,
    copy: isSupported
      ? async (data: string | Many<ClipboardItem>) => {
        const isString = typeof data === 'string'
        try {
          if (clipboard && !legacy) {
            isString
              ? await clipboard.writeText(data)
              : await clipboard.write(asArray(data))
          } else {
            const ta = document.createElement('textarea')
            ta.value = isString ? data : JSON.stringify(data)
            ta.ariaHidden = 'true'
            ta.style.position = 'absolute'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            ta.remove()
          }

          setCopied(true)
          timer && clearTimeout(timer)
          timer = setTimeout(() => setCopied(false), copiedDuration)
        } catch {
          DEV && console.error('fail to copy' + JSON.stringify(data) + ' to clipboard')
        }
      }
      : async (data) => {
        DEV && console.warn('copy' + JSON.stringify(data) + ' to clipboard is not supported')
      },
  }
}

/**
 * Callback for {@link usePaste}
 * @param data clipboard data
 * @param mime mimetype
 * @param fileProps file properties if the `data` is a {@link https://developer.mozilla.org/en-US/docs/Web/API/File File}
 */
type OnPasteCallback = (
  data: string | Blob | null,
  mime: string,
  fileProps?: Pick<File, 'name' | 'lastModified' | 'webkitRelativePath'>
) => void

/**
 * hooks that paste from clipboard
 * @param onPaste callback
 * @example
 * ```tsx
 * import { usePaste } from '@solid-hooks/web'
 *
 * export default () => {
 *   const paste = usePaste((data, mime) => {
 *     console.log(data, mime)
 *   })
 *   return <button onClick={paste}>paste</button>
 * }
 * ```
 */
export function usePaste(onPaste: OnPasteCallback): VoidFunction {
  const clipboard = globalThis.navigator?.clipboard
  const isSupported = !!clipboard || !!document?.queryCommandSupported?.('paste')
  useWindowListener('paste', (e) => {
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
        if (isSupported) {
          const items = await clipboard.read()
          for (const item of items) {
            for (const mime of item.types) {
              onPaste(await item.getType(mime), mime)
            }
          }
        } else {
          document.execCommand('paste')
        }
      } catch {
        DEV && console.error('fail to paste from clipboard')
      }
    }
    : async () => {
      DEV && console.warn('paste from clipboard is not supported')
    }
}
