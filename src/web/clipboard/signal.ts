import type { Accessor } from 'solid-js'

import { createSignal } from 'solid-js'

export type ClipboardItemSignal<T> = [accessor: Accessor<ClipboardItem>, set: (data: T) => ClipboardItem]

export function generateClipboardItem(part: BlobPart, mime: string): ClipboardItem {
  return new ClipboardItem({ [mime]: new Blob([part], { type: mime }) })
}

export function createClipboardItem<T extends BlobPart>(part: T, mime: string): ClipboardItemSignal<T> {
  const [item, setItem] = createSignal(generateClipboardItem(part, mime))
  return [item, data => setItem(generateClipboardItem(data, mime))]
}
