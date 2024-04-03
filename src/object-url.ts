import { tryOnCleanup } from '@solid-primitives/utils'
import type { Accessor, SignalOptions } from 'solid-js'
import { createSignal, untrack } from 'solid-js'

type ObjectTypes = Blob | File | MediaSource | ArrayBuffer | string

export type ObjectURLSignal = [
  get: Accessor<string>,
  set: (data: ObjectTypes) => string,
  cleanup: VoidFunction,
]

/**
 * convert `blob` / `File` / `MediaSource` to signal URL, auto revoke on cleanup
 * @param value initial value
 * @param options signal options
 * @example
 * ```ts
 * import { createObjectURL } from '@solid-hooks/hooks'
 *
 * const [source, setMediaSource, cleanupSource] = createObjectURL(new MediaSource())
 * ```
 */
export function createObjectURL(
  value: Blob | File | MediaSource,
  options?: SignalOptions<string>
): ObjectURLSignal
/**
 * convert `ArrayBuffer` / `ArrayBufferView` / `string` to signal URL, auto revoke on cleanup
 * @param value initial value
 * @param options signal options
 * @example
 * ```ts
 * import { createObjectURL } from '@solid-hooks/hooks'
 *
 * const [url, setURL, cleanupURL] = createObjectURL(new Uint8Array(8), { type: 'image/png' })
 * ```
 */
export function createObjectURL(
  value: ArrayBuffer | ArrayBufferView | string,
  options?: SignalOptions<string> & BlobPropertyBag
): ObjectURLSignal
export function createObjectURL(
  value: any,
  { endings, type, ...rest }: SignalOptions<string> & BlobPropertyBag = {},
): ObjectURLSignal {
  const generate = (data: ObjectTypes) => URL.createObjectURL(
    data instanceof ArrayBuffer || typeof data === 'string'
      ? new Blob([data], { endings, type })
      : data,
  )

  const [url, setURL] = createSignal(generate(value), rest)
  const cleanup = tryOnCleanup(() => URL.revokeObjectURL(untrack(url)))

  return [
    url,
    (data: ObjectTypes) => {
      cleanup()
      return setURL(generate(data))
    },
    cleanup,
  ]
}
